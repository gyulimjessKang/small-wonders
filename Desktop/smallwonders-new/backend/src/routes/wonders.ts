import { Router } from 'express';
import { db } from '../firebase';

const router = Router();

router.post('/', async (req, res) => {
  const uid = (req as any).uid;
  const { text, category = 'Other' } = req.body;
  if (!text || text.length > 500) {
    return res.status(400).json({ error: 'Text is required (<=500 chars)' });
  }
  const wonder = { text, category, createdAt: new Date().toISOString() };
  const doc = await db.collection('users').doc(uid).collection('wonders').add(wonder);
  res.status(201).json({ id: doc.id, ...wonder });
});

router.get('/', async (req, res) => {
  const uid = (req as any).uid;
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('wonders')
    .orderBy('createdAt', 'desc')
    .get();
  const wonders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(wonders);
});

export default router; 