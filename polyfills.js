import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';

// FormData
polyfillGlobal('FormData', () => {
  const fd = require('react-native/Libraries/Network/FormData');
  return fd.default || fd;
});

// AbortSignal & AbortController
class AbortSignal {
  constructor() {
    this.aborted = false;
    this.reason = undefined;
    this._listeners = [];
  }
  addEventListener(type, listener) {
    if (type === 'abort') this._listeners.push(listener);
  }
  removeEventListener(type, listener) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }
  dispatchEvent(event) {
    if (event.type === 'abort') this._listeners.forEach(l => l(event));
  }
  static timeout(ms) {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(new Error('TimeoutError')), ms);
    return ctrl.signal;
  }
  static abort(reason) {
    const ctrl = new AbortController();
    ctrl.abort(reason);
    return ctrl.signal;
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }
  abort(reason) {
    if (!this.signal.aborted) {
      this.signal.aborted = true;
      this.signal.reason = reason ?? new Error('AbortError');
      this.signal.dispatchEvent({ type: 'abort' });
    }
  }
}

polyfillGlobal('AbortSignal', () => AbortSignal);
polyfillGlobal('AbortController', () => AbortController);

// Headers
class Headers {
  constructor(init) {
    this._h = {};
    if (init instanceof Headers) {
      init.forEach((v, k) => this.set(k, v));
    } else if (init && typeof init === 'object') {
      Object.entries(init).forEach(([k, v]) => this.set(k, v));
    }
  }
  append(name, value) {
    const k = name.toLowerCase();
    this._h[k] = this._h[k] ? this._h[k] + ', ' + value : String(value);
  }
  delete(name) { delete this._h[name.toLowerCase()]; }
  get(name) { return this._h[name.toLowerCase()] ?? null; }
  has(name) { return name.toLowerCase() in this._h; }
  set(name, value) { this._h[name.toLowerCase()] = String(value); }
  forEach(cb, thisArg) {
    Object.entries(this._h).forEach(([k, v]) => cb.call(thisArg, v, k, this));
  }
  keys() { return Object.keys(this._h)[Symbol.iterator](); }
  values() { return Object.values(this._h)[Symbol.iterator](); }
  entries() { return Object.entries(this._h)[Symbol.iterator](); }
  [Symbol.iterator]() { return this.entries(); }
}

polyfillGlobal('Headers', () => Headers);

// window — some packages use it to detect browser environment
polyfillGlobal('window', () => global);

// performance
polyfillGlobal('performance', () =>
  global.performance || { now: () => global.Date.now(), timeOrigin: global.Date.now() }
);

// setImmediate / clearImmediate
polyfillGlobal('setImmediate', () =>
  global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args))
);
polyfillGlobal('clearImmediate', () =>
  global.clearImmediate || global.clearTimeout
);

// WebSocket — available natively in RN
polyfillGlobal('WebSocket', () => {
  const ws = require('react-native/Libraries/WebSocket/WebSocket');
  return ws.default || ws;
});

// URL & URLSearchParams
polyfillGlobal('URL', () => {
  try {
    const { URL } = require('react-native/Libraries/Blob/URL');
    return URL;
  } catch {
    return global.URL;
  }
});

polyfillGlobal('URLSearchParams', () => {
  try {
    const { URLSearchParams } = require('react-native/Libraries/Blob/URL');
    return URLSearchParams;
  } catch {
    return global.URLSearchParams;
  }
});
