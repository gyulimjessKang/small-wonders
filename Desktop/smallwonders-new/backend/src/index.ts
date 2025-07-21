import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import wondersRouter from './routes/wonders';
import statsRouter from './routes/stats';
import settingsRouter from './routes/settings';
import { authMiddleware } from './middleware/auth';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/wonders', authMiddleware, wondersRouter);
app.use('/api/stats', authMiddleware, statsRouter);
app.use('/api/settings', authMiddleware, settingsRouter);

// ---------------- Serve React frontend ----------------
// Resolve the absolute path to the compiled frontend assets. In the Docker image
// we place them at /app/frontend/dist (two levels up from this file).
const frontendDir = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDir));

// SPA fallback – let React Router handle the rest
app.get('*', (_, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API server listening on port ${PORT}`);
}); 