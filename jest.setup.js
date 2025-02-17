import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';
require('dotenv').config({ path: '.env.local' });


if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Use node-fetch v2 (which is CommonJS) for polyfilling Request/Response
import fetch from 'node-fetch';

if (typeof global.Request === 'undefined') {
  global.Request = fetch.Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = fetch.Response;
}
