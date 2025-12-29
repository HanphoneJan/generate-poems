import { config } from 'dotenv';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// 加载环境变量
config();

// 从环境变量读取端口，默认 3000
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
})
  .listen(port, () => {
    console.log(`> Ready on http://localhost:${port} [${dev ? 'dev' : 'production'}]`);
  })
  .on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
