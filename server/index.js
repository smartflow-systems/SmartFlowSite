import { createApp } from './app.js';

const app = createApp();
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`/gh-sync on ${PORT}`);
});
