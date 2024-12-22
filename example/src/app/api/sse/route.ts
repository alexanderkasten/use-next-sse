import { createSSEHandler } from 'use-next-sse';

// Opt out of caching for all data requests in the route segment
export const dynamic = 'force-dynamic'


// export const GET = createSSEHandler(async (sse) => {
//   let count = 0;
//   const maxCount = 10;
//   const interval = setInterval(() => {
//     if (count > maxCount) {
//       clearInterval(interval);
//       sse.close();
//       return;
//     }

//     try {
//       sse.send({ count: count++ }, 'counter');
//     } catch (error) {
//       console.error('Error sending SSE message:', error);
//       clearInterval(interval);
//       sse.close();
//     }
//   }, 1000);

//   // We can't return a cleanup function here, so we need to handle cleanup differently
//   // One approach is to use a timeout to eventually close the connection
//   setTimeout(() => {
//     clearInterval(interval);
//     sse.close();
//   }, (maxCount + 1) * 1000); // Give it slightly more time than the max count

//   // Keep the connection open
//   await new Promise(() => {});
// });


// export const GET = createSSEHandler(async (sse) => {
//   let count = 0;
//   const maxCount = 10;

//   while (count <= maxCount) {
//     sse.send({ count }, 'counter');
//     count++;
//     await new Promise(resolve => setTimeout(resolve, 1000));
//   }

//   // sse.close();
// });

export const GET = createSSEHandler(async (sse, lastEventId) => {
  let count = lastEventId || 0;
  const maxCount = 10; // Increased for demonstration

  while (count <= maxCount) {
    await new Promise(resolve => setTimeout(resolve, 100));
    sse.send({ count }, 'counter');
    count++;
  }

  if (count > maxCount) {
    setTimeout(() => {
      sse.send({ count: 10 }, 'counter');
    }, 2000)
  }

  // sse.close();
});
