import { createSSEHandler } from '@/src/sse-server';

export const GET = createSSEHandler(async (sse) => {
  let count = 0;
  const interval = setInterval(() => {
    if (count % 2 === 0) {
      sse.send({ count: count }, 'even');
    } else {
      sse.send({ count: count }, 'odd');
    }
    count++;
    if (count > 10) {
      clearInterval(interval);
      sse.close();
    }
  }, 1000);
});

