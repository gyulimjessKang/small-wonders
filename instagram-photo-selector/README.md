# IG Post Curator

A tiny, dependency-free static web app: drop in a pool of photos and it suggests
how many to post as an Instagram carousel and in what order, then lets you
fine-tune the result and export it as a numbered ZIP.

Everything runs client-side in the browser (canvas + File API). No photo is
ever uploaded anywhere — there is no backend.

## Run it

No build step needed. Either:

- Open `index.html` directly in a browser, or
- Serve the folder with any static server, e.g. `npx serve instagram-photo-selector`

## How the suggestion works

For every photo the app computes, from a downscaled analysis canvas:

- **Sharpness** — variance of the Laplacian, a standard focus/blur proxy.
- **Exposure & contrast** — mean and standard deviation of luminance, penalizing
  clipped-black/clipped-white shots.
- **A 64-bit average hash (aHash)** — a perceptual fingerprint used to group
  near-duplicate/burst shots together (Hamming distance ≤ 10 bits ⇒ same group).
- **Average color** — used to chain the final order for a smooth visual flow.

The pool is then clustered into visually distinct groups. The best-quality
photo from each group becomes a candidate, which gives a natural "suggested
count" (capped at Instagram's 10-photo carousel limit) — no point posting three
near-identical shots when one clearly represents that moment best.

Ordering starts from the single highest-quality photo (used as the lead image,
since that's what shows in the feed/grid preview) and then greedily chains the
rest by color similarity so consecutive photos flow well while swiping. An
alternate "order you added them in" mode is available if you'd rather control
order yourself (e.g. you already sorted the files chronologically).

You can always override the count with the slider, manually add/remove any
photo by clicking it, and drag the selected thumbnails to reorder by hand.

## Export

"Download selection as ZIP" packages the *original, unmodified* image files
(not the downscaled analysis copies) into a ZIP, prefixed `01_`, `02_`, ... so
that extracting and sorting by name reproduces your chosen order for upload.
