import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// https://developer.mozilla.org/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const encoder = new TextEncoder();

async function* makeIterator() {
  yield encoder.encode('<p>One</p>');
  await sleep(2000);
  yield encoder.encode('<p>Two</p>');
  await sleep(2000);
  yield encoder.encode('<p>Three</p>');
}

export async function GET() {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new NextResponse(stream);
}
