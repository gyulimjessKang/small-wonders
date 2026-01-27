import { Router } from 'express';
import { db } from '../firebase';

const router = Router();

router.get('/', async (req, res) => {
  const uid = (req as any).uid;
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('wonders')
    .orderBy('createdAt', 'asc')
    .get();
  const wonders = snapshot.docs.map((d) => d.data() as { category: string; createdAt: string });

  const total = wonders.length;

  const categoryCount: Record<string, number> = {};
  wonders.forEach((w) => {
    categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // compute highest streak (consecutive days)
  const dates = Array.from(
    new Set(
      wonders.map((w) => w.createdAt.slice(0, 10)) // YYYY-MM-DD
    )
  ).sort();

  const MS_PER_DAY = 24 * 60 * 60 * 1000

  const to_dst = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, m - 1, d, 12, 0, 0, 0).getTime()
  }

  let maxStreak = 0;
  let current = 0;
  let prevDate: string | null = null;

  for (const d of dates) {
    if (!prevDate) {
      current = 1;
    }
    else {
      const isNextDay = to_dst(d) - to_dst(prevDate) === MS_PER_DAY
      current = isNextDay ? current + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, current);
    prevDate = d;
  }

  res.json({ total, streak: maxStreak, topCategory });
});

export default router; 