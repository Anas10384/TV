const express = require('express');
const { spawn } = require('child_process');
const app = express();

// Use port provided by Render, fallback to 3000 locally
const port = process.env.PORT || 3000;

// ID to M3U8 channel mapping
const channels = {
  '1': 'http://exm3u.extraott.com:80/live/2249871453/1991220000/400159598.m3u8',
  '2': 'http://exm3u.extraott.com:80/live/2249871453/1991220000/401627870.m3u8',
  '3': 'http://exm3u.extraott.com:80/live/2249871453/1991220000/187263.m3u8',
  '4': 'http://ptu.ridsys.in/riptv/live/stream20/index.m3u8',
  '5': 'http://exm3u.extraott.com:80/live/2249871453/1991220000/400157873.m3u8'
  '6': 'http://exm3u.extraott.com:80/live/2249871453/1991220000/400157873.m3u8'
};

app.get('/box.ts', (req, res) => {
  const id = req.query.id;

  if (!channels[id]) {
    return res.status(404).send('Channel not found.');
  }

  const m3u8Url = channels[id];

  res.setHeader('Content-Type', 'video/MP2T');

  const ffmpeg = spawn('ffmpeg', [
    '-i', m3u8Url,
    '-c', 'copy',
    '-f', 'mpegts',
    'pipe:1'
  ]);

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg error: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
    res.end();
  });

  req.on('close', () => {
    ffmpeg.kill('SIGKILL');
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h2>This is</h2>
    <p>Usage: <code>made by anas</code></p>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
