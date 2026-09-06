"use strict";

/* ---------- tunables ---------- */
const MAX_CAROUSEL = 10;
const DUPLICATE_HASH_THRESHOLD = 10; // out of 64 bits; lower = stricter "same shot" grouping
const ANALYSIS_MAX_DIM = 160; // px, downscale target for scoring (speed, not display)

/* ---------- tiny disjoint-set for clustering near-duplicates ---------- */
class DisjointSet {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
}

/* ---------- image loading & pixel analysis ---------- */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawScaled(img, maxDim) {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas;
}

function toGrayscale(imageData) {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return { gray, width, height };
}

// variance of the Laplacian response: a standard, cheap focus/blur proxy.
function laplacianVariance(gray, width, height) {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap = gray[idx - 1] + gray[idx + 1] + gray[idx - width] + gray[idx + width] - 4 * gray[idx];
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

function luminanceStats(gray) {
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const mean = sum / gray.length;
  let sqSum = 0;
  for (let i = 0; i < gray.length; i++) sqSum += (gray[i] - mean) * (gray[i] - mean);
  return { mean, std: Math.sqrt(sqSum / gray.length) };
}

function averageColor(imageData) {
  const { data } = imageData;
  let r = 0, g = 0, b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return { r: r / n, g: g / n, b: b / n };
}

// 64-bit average hash: cheap perceptual fingerprint used to group near-duplicate shots.
function averageHash(img) {
  const size = 8;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  const mean = gray.reduce((a, b) => a + b, 0) / gray.length;
  return gray.map((v) => (v > mean ? 1 : 0)).join("");
}

function hammingDistance(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

// perceptually-weighted RGB distance ("redmean"), used to chain photos into a smooth-flowing order.
function colorDistance(c1, c2) {
  const rmean = (c1.r + c2.r) / 2;
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt((2 + rmean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmean) / 256) * db * db);
}

function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

async function analyzePhoto(file, index) {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  const canvas = drawScaled(img, ANALYSIS_MAX_DIM);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { gray, width, height } = toGrayscale(imageData);
  const sharpness = laplacianVariance(gray, width, height);
  const { mean, std } = luminanceStats(gray);
  return {
    index,
    file,
    url,
    sharpness,
    mean,
    std,
    avgColor: averageColor(imageData),
    ahash: averageHash(img),
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  };
}

function scorePhotos(photos) {
  const sharpNorm = normalize(photos.map((p) => p.sharpness));
  const contrastNorm = normalize(photos.map((p) => p.std));
  photos.forEach((p, i) => {
    const exposurePenalty = Math.abs(p.mean - 128) / 128; // 0 = ideal mid exposure, 1 = clipped black/white
    p.qualityRaw = 0.5 * sharpNorm[i] + 0.3 * contrastNorm[i] + 0.2 * (1 - exposurePenalty);
    p.isBlurry = sharpNorm[i] < 0.15;
    p.isDark = p.mean < 40;
    p.isBright = p.mean > 215;
  });
  const qNorm = normalize(photos.map((p) => p.qualityRaw));
  photos.forEach((p, i) => {
    p.quality = qNorm[i];
    p.qualityDisplay = Math.round(qNorm[i] * 100);
  });
  return photos;
}

/* ---------- clustering near-duplicates ---------- */
function clusterPhotos(photos, threshold = DUPLICATE_HASH_THRESHOLD) {
  const dsu = new DisjointSet(photos.length);
  for (let i = 0; i < photos.length; i++) {
    for (let j = i + 1; j < photos.length; j++) {
      if (hammingDistance(photos[i].ahash, photos[j].ahash) <= threshold) dsu.union(i, j);
    }
  }
  const groups = new Map();
  for (let i = 0; i < photos.length; i++) {
    const root = dsu.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(i);
  }
  return [...groups.values()].map((members) => {
    const repIdx = members.reduce((best, i) => (photos[i].quality > photos[best].quality ? i : best), members[0]);
    return { members, repIdx };
  });
}

/* ---------- selection & ordering ---------- */
function suggestCount(clusterCount, poolSize) {
  return Math.max(1, Math.min(MAX_CAROUSEL, clusterCount, poolSize));
}

function buildSelection(photos, clusters, desiredCount) {
  const repsSorted = [...clusters].sort((a, b) => photos[b.repIdx].quality - photos[a.repIdx].quality);
  const selected = repsSorted.slice(0, desiredCount).map((c) => c.repIdx);
  if (selected.length < desiredCount) {
    const selectedSet = new Set(selected);
    const remaining = photos
      .map((_, i) => i)
      .filter((i) => !selectedSet.has(i))
      .sort((a, b) => photos[b].quality - photos[a].quality);
    for (const idx of remaining) {
      if (selected.length >= desiredCount) break;
      selected.push(idx);
    }
  }
  return selected;
}

function orderByFlow(photos, selectedIdx) {
  if (selectedIdx.length === 0) return [];
  const remaining = new Set(selectedIdx);
  const hero = [...remaining].sort((a, b) => photos[b].quality - photos[a].quality)[0];
  const order = [hero];
  remaining.delete(hero);
  let current = hero;
  while (remaining.size) {
    let best = null;
    let bestDist = Infinity;
    for (const idx of remaining) {
      const d = colorDistance(photos[current].avgColor, photos[idx].avgColor);
      if (d < bestDist) {
        bestDist = d;
        best = idx;
      }
    }
    order.push(best);
    remaining.delete(best);
    current = best;
  }
  return order;
}

function orderByUpload(selectedIdx) {
  return [...selectedIdx].sort((a, b) => a - b);
}

/* ---------- zero-dependency ZIP writer (store method) ---------- */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n) {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
}
function u32(n) {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
}

function dosDateTime(date) {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const dosDate = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f);
  return { time, dosDate };
}

function createZip(files) {
  const encoder = new TextEncoder();
  const now = new Date();
  const { time, dosDate } = dosDateTime(now);
  const parts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = new Uint8Array(file.data);
    const crc = crc32(data);
    const localHeader = new Uint8Array(30);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // method: store
    lv.setUint16(10, time, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length

    parts.push(localHeader, nameBytes, data);
    const localOffset = offset;
    offset += localHeader.length + nameBytes.length + data.length;

    const centralHeader = new Uint8Array(46);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, 0, true); // method
    cv.setUint16(12, time, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra length
    cv.setUint16(32, 0, true); // comment length
    cv.setUint16(34, 0, true); // disk number start
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, localOffset, true);

    centralParts.push(centralHeader, nameBytes);
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const p of centralParts) centralSize += p.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralStart, true);
  ev.setUint16(20, 0, true);

  return new Blob([...parts, ...centralParts, eocd], { type: "application/zip" });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

/* ---------- app state & UI wiring ---------- */
const state = {
  photos: [],
  clusters: [],
  order: [],
  mode: "flow",
};

const el = {
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("file-input"),
  browseBtn: document.getElementById("browse-btn"),
  progress: document.getElementById("progress"),
  progressFill: document.getElementById("progress-fill"),
  progressLabel: document.getElementById("progress-label"),
  controls: document.getElementById("controls"),
  countSlider: document.getElementById("count-slider"),
  countValue: document.getElementById("count-value"),
  suggestionNote: document.getElementById("suggestion-note"),
  modeSelect: document.getElementById("mode-select"),
  resetBtn: document.getElementById("reset-btn"),
  clearBtn: document.getElementById("clear-btn"),
  selectionSection: document.getElementById("selection-section"),
  selectionCount: document.getElementById("selection-count"),
  selectionStrip: document.getElementById("selection-strip"),
  downloadBtn: document.getElementById("download-btn"),
  poolSection: document.getElementById("pool-section"),
  poolGrid: document.getElementById("pool-grid"),
};

let suggestedCount = 1;

function clusterIndexByPhoto(photoIdx) {
  return state.clusters.findIndex((c) => c.members.includes(photoIdx));
}

function regenerate() {
  const desired = parseInt(el.countSlider.value, 10);
  const selectedIdx = buildSelection(state.photos, state.clusters, desired);
  state.order = state.mode === "flow" ? orderByFlow(state.photos, selectedIdx) : orderByUpload(selectedIdx);
  render();
}

function togglePhoto(idx) {
  const pos = state.order.indexOf(idx);
  if (pos >= 0) state.order.splice(pos, 1);
  else state.order.push(idx);
  render();
}

function render() {
  renderSelection();
  renderPool();
}

function renderSelection() {
  el.selectionCount.textContent = `${state.order.length} photo${state.order.length === 1 ? "" : "s"}`;
  el.selectionStrip.innerHTML = "";
  state.order.forEach((idx, pos) => {
    const photo = state.photos[idx];
    const card = document.createElement("div");
    card.className = "selection-card";
    card.draggable = true;
    card.dataset.pos = pos;
    card.innerHTML = `
      <span class="badge">${pos + 1}</span>
      <button class="remove-btn" title="Remove" type="button">&times;</button>
      <img src="${photo.url}" alt="Selected photo ${pos + 1}" />
    `;
    card.querySelector(".remove-btn").addEventListener("click", () => togglePhoto(idx));
    card.addEventListener("dragstart", () => card.classList.add("dragging"));
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragging = el.selectionStrip.querySelector(".dragging");
      if (!dragging || dragging === card) return;
      const fromPos = parseInt(dragging.dataset.pos, 10);
      const toPos = parseInt(card.dataset.pos, 10);
      if (Number.isNaN(fromPos) || Number.isNaN(toPos)) return;
      const [moved] = state.order.splice(fromPos, 1);
      state.order.splice(toPos, 0, moved);
      render();
    });
    el.selectionStrip.appendChild(card);
  });
}

function renderPool() {
  el.poolGrid.innerHTML = "";
  const selectedSet = new Set(state.order);
  state.photos.forEach((photo, idx) => {
    const clusterIdx = clusterIndexByPhoto(idx);
    const card = document.createElement("div");
    card.className = "pool-card" + (selectedSet.has(idx) ? " selected" : "");

    const tags = [];
    if (photo.isBlurry) tags.push('<span class="warn">soft focus</span>');
    if (photo.isDark) tags.push('<span class="warn">dark</span>');
    if (photo.isBright) tags.push('<span class="warn">overexposed</span>');
    const cluster = state.clusters[clusterIdx];
    if (cluster && cluster.members.length > 1) tags.push(`<span class="cluster">1 of ${cluster.members.length} similar</span>`);

    const orderPos = state.order.indexOf(idx);
    card.innerHTML = `
      ${orderPos >= 0 ? `<span class="order-badge">${orderPos + 1}</span>` : ""}
      <img src="${photo.url}" alt="Pool photo ${idx + 1}" />
      <div class="tag">${tags.join("")}</div>
    `;
    card.querySelector("img").addEventListener("click", () => togglePhoto(idx));
    el.poolGrid.appendChild(card);
  });
}

function setProgress(done, total) {
  el.progress.hidden = false;
  const pct = total ? Math.round((done / total) * 100) : 0;
  el.progressFill.style.width = `${pct}%`;
  el.progressLabel.textContent = `Analyzing photo ${done} of ${total}...`;
}

async function handleFiles(fileList) {
  const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
  if (files.length === 0) return;

  el.dropzone.hidden = true;
  setProgress(0, files.length);

  const photos = [];
  for (let i = 0; i < files.length; i++) {
    try {
      photos.push(await analyzePhoto(files[i], photos.length));
    } catch (err) {
      console.warn("Skipped unreadable file", files[i].name, err);
    }
    setProgress(i + 1, files.length);
  }

  state.photos = scorePhotos(photos);
  state.clusters = clusterPhotos(state.photos);
  suggestedCount = suggestCount(state.clusters.length, state.photos.length);

  el.countSlider.max = Math.min(MAX_CAROUSEL, state.photos.length);
  el.countSlider.value = suggestedCount;
  el.countValue.textContent = suggestedCount;
  el.suggestionNote.textContent = `Suggested from ${state.clusters.length} visually distinct group${state.clusters.length === 1 ? "" : "s"} found in ${state.photos.length} photo${state.photos.length === 1 ? "" : "s"}.`;

  el.progress.hidden = true;
  el.controls.hidden = false;
  el.selectionSection.hidden = false;
  el.poolSection.hidden = false;

  regenerate();
}

async function downloadZip() {
  if (state.order.length === 0) return;
  const usedNames = new Set();
  const files = [];
  for (let pos = 0; pos < state.order.length; pos++) {
    const photo = state.photos[state.order[pos]];
    const buffer = await photo.file.arrayBuffer();
    let base = sanitizeFilename(photo.file.name || `photo_${pos + 1}.jpg`);
    let name = `${String(pos + 1).padStart(2, "0")}_${base}`;
    while (usedNames.has(name)) name = `_${name}`;
    usedNames.add(name);
    files.push({ name, data: buffer });
  }
  const blob = createZip(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ig-post-selection.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function resetAll() {
  state.photos.forEach((p) => URL.revokeObjectURL(p.url));
  state.photos = [];
  state.clusters = [];
  state.order = [];
  el.dropzone.hidden = false;
  el.controls.hidden = true;
  el.selectionSection.hidden = true;
  el.poolSection.hidden = true;
  el.fileInput.value = "";
}

el.browseBtn.addEventListener("click", () => el.fileInput.click());
el.fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

["dragenter", "dragover"].forEach((evt) =>
  el.dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    el.dropzone.classList.add("drag-over");
  })
);
["dragleave", "drop"].forEach((evt) =>
  el.dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    el.dropzone.classList.remove("drag-over");
  })
);
el.dropzone.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));

el.countSlider.addEventListener("input", () => {
  el.countValue.textContent = el.countSlider.value;
});
el.countSlider.addEventListener("change", regenerate);
el.modeSelect.addEventListener("change", () => {
  state.mode = el.modeSelect.value;
  regenerate();
});
el.resetBtn.addEventListener("click", () => {
  el.countSlider.value = suggestedCount;
  el.countValue.textContent = suggestedCount;
  el.modeSelect.value = "flow";
  state.mode = "flow";
  regenerate();
});
el.clearBtn.addEventListener("click", resetAll);
el.downloadBtn.addEventListener("click", downloadZip);
