import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler(async (send, close) => {
  let count = 0;
  const interval = setInterval(() => {
    if (count % 2 === 0) {
      send({ count: count }, 'even');
    } else {
      send({ count: count }, 'odd');
    }
    count++;
    if (count > 100) {
      clearInterval(interval);
      close();
    }
  }, 1000);
});
