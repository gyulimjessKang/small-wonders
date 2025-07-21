import { Router } from 'express';
import { db } from '../firebase';

export interface UserSettings {
  theme?: 'light' | 'dark';
  preferredName?: string;
  reminderTime?: string; // HH:MM 24-hour or empty
}

const router = Router();

router.get('/', async (req, res) => {
  const uid = (req as any).uid;
  const docRef = db.collection('users').doc(uid).collection('meta').doc('settings');
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    const defaults: UserSettings = { theme: 'light', preferredName: '', reminderTime: '' };
    return res.json(defaults);
  }
  res.json(snapshot.data());
});

router.put('/', async (req, res) => {
  const uid = (req as any).uid;
  const { theme, preferredName, reminderTime } = req.body as UserSettings;

  if (theme && !['light', 'dark'].includes(theme)) {
    return res.status(400).json({ error: 'theme must be light or dark' });
  }
  if (reminderTime && !/^([0-1]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
    return res.status(400).json({ error: 'reminderTime must be HH:MM 24-hour' });
  }

  const docRef = db.collection('users').doc(uid).collection('meta').doc('settings');
  await docRef.set({ theme, preferredName, reminderTime }, { merge: true });
  const updated = await docRef.get();
  res.json(updated.data());
});

export default router; 