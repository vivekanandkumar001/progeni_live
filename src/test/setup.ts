import '@testing-library/jest-dom/vitest';
import { transferableAbortController } from 'node:util';

/**
 * jsdom brings its own `AbortController` / `AbortSignal`, but the `Request`
 * implementation in the test environment (Node's undici) only accepts its
 * own. React Router's data router builds a `Request` with an `AbortSignal` on
 * every navigation, so the two classes collide and every navigation throws
 * "Expected signal to be an instance of AbortSignal".
 *
 * Point the globals back at Node's pair. An existing Node controller is the
 * only reliable way to reach the classes, since jsdom has already replaced
 * the globals by the time setup files run.
 */
const nodeController = transferableAbortController();
globalThis.AbortController = nodeController.constructor as typeof AbortController;
globalThis.AbortSignal = nodeController.signal.constructor as typeof AbortSignal;
