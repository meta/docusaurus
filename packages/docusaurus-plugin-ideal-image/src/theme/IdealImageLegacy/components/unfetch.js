export class UnfetchAbortController {
  constructor() {
    this.signal = {onabort: () => {}};
    this.abort = () => this.signal.onabort();
  }
}

// modified version of https://github.com/developit/unfetch
// - ponyfill instead of polyfill
// - add support for AbortController
export const unfetch = (url, options) => {
  options = options || {};
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(options.method || 'get', url, true);

    // eslint-disable-next-line guard-for-in
    for (const i in options.headers) {
      request.setRequestHeader(i, options.headers[i]);
    }

    request.withCredentials = options.credentials === 'include';

    request.onload = () => {
      resolve(response());
    };

    request.onerror = reject;

    if (options.signal)
      options.signal.onabort = () => {
        // eslint-disable-next-line no-multi-assign
        request.onerror = request.onload = undefined;
        request.abort();
      };

    request.send(options.body);

    function response() {
      const keys = [];
      const all = [];
      const headers = {};
      let header;

      request
        .getAllResponseHeaders()
        .replace(/^(.*?):\s*?([\s\S]*?)$/gm, (m, key, value) => {
          keys.push((key = key.toLowerCase()));
          all.push([key, value]);
          header = headers[key];
          headers[key] = header ? `${header},${value}` : value;
        });

      return {
        // eslint-disable-next-line no-bitwise
        ok: ((request.status / 100) | 0) === 2, // 200-299
        status: request.status,
        statusText: request.statusText,
        url: request.responseURL,
        clone: response,
        text: () => Promise.resolve(request.responseText),
        json: () => Promise.resolve(request.responseText).then(JSON.parse),
        blob: () => Promise.resolve(new Blob([request.response])),
        headers: {
          keys: () => keys,
          entries: () => all,
          get: (n) => headers[n.toLowerCase()],
          has: (n) => n.toLowerCase() in headers,
        },
      };
    }
  });
};
