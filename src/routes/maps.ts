import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const MapsRouter = Router();
MapsRouter.get('/:name', async (req, res) => {
  if (!/^Map[0-9a-zA-Z]+\.json$/.test(req.params.name)) return res.status(400).json({ error: 'Bad Request' });
  try {
    const file = path.join(__dirname, '..', '..', process.env.GAME_PATH, 'data', req.params.name);
    const data = await fs.readFile(file, 'utf-8');
    res.send(data);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

export default MapsRouter;
