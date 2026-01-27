import { Router } from 'express';
import { db } from '../firebase';

export interface UserSettings {
  theme?: 'light' | 'dark';
  preferredName?: string;
}

const router = Router();

router.get('/', async (req, res) => {
  const uid = (req as any).uid;
  const docRef = db.collection('users').doc(uid).collection('meta').doc('settings');
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    const defaults: UserSettings = { theme: 'light', preferredName: ''};
    return res.json(defaults);
  }
  res.json(snapshot.data());
});

router.put('/', async (req, res) => {
  const uid = (req as any).uid;
  const { theme, preferredName } = req.body as UserSettings;

  if (theme && !['light', 'dark'].includes(theme)) {
    return res.status(400).json({ error: 'theme must be light or dark' });
  }

  const docRef = db.collection('users').doc(uid).collection('meta').doc('settings');
  await docRef.set({ theme, preferredName }, { merge: true });
  const updated = await docRef.get();
  res.json(updated.data());
});

export default router; 