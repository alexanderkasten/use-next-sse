import '@testing-library/jest-dom';
// import 'isomorphic-fetch';
// import React from 'react';

// global.React = React; // this also works for other globally available libraries
// (global as any).useState = React.useState;

import { TextEncoder, TextDecoder } from 'node:util';
const { ReadableStream, TransformStream } = require('node:stream/web');

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream }
})


const { Blob, File } = require('node:buffer')
const { fetch, Headers, FormData, Request, Response } = require('undici')
Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Blob: { value: Blob },
  File: { value: File },
  Headers: { value: Headers },
  FormData: { value: FormData },
  Request: { value: Request },
  Response: { value: Response }
})
// @ts-ignore
// import {Readable} from 'readable-stream';

// Object.assign(global, { TextDecoder, TextEncoder });

// Object.assign(global, { ReadableStream, TransformStream });
