// There is an issue with cancelable interface
// It is not obvious that
// `image(src)` has `cancel` function
// but `image(src).then()` doesn't

import {unfetch, UnfetchAbortController} from './unfetch';

/**
 * returns new "promise" with cancel function combined
 *
 * @param {Promise} p1 - first "promise" with cancel
 * @param {Promise} p2 - second "promise" with cancel
 * @returns {Promise} - new "promise" with cancel
 */
export const combineCancel = (p1, p2) => {
  if (!p2) return p1;
  const result = p1.then(
    (x) => x,
    (x) => x,
  );
  result.cancel = () => {
    p1.cancel();
    p2.cancel();
  };
  return result;
};

export const timeout = (threshold) => {
  let timerId;
  const result = new Promise((resolve) => {
    timerId = setTimeout(resolve, threshold);
  });
  result.cancel = () => {
    // there is a bug with cancel somewhere in the code
    // if (!timerId) throw new Error('Already canceled')
    clearTimeout(timerId);
    timerId = undefined;
  };
  return result;
};

// Caveat: image loader can not cancel download in some browsers
export const imageLoader = (src) => {
  let img = new Image();
  const result = new Promise((resolve, reject) => {
    img.onload = resolve;
    // eslint-disable-next-line no-multi-assign
    img.onabort = img.onerror = () => reject({});
    img.src = src;
  });
  result.cancel = () => {
    if (!img) throw new Error('Already canceled');
    // eslint-disable-next-line no-multi-assign
    img.onload = img.onabort = img.onerror = undefined;
    img.src = '';
    img = undefined;
  };
  return result;
};

// Caveat: XHR loader can cause errors because of 'Access-Control-Allow-Origin'
// Caveat: we still need imageLoader to do actual decoding,
// but if images are uncachable this will lead to two requests
export const xhrLoader = (url, options) => {
  let controller = new UnfetchAbortController();
  const signal = controller.signal;
  const result = new Promise((resolve, reject) =>
    unfetch(url, {...options, signal}).then((response) => {
      if (response.ok) {
        response
          .blob()
          .then(() => imageLoader(url))
          .then(resolve);
      } else {
        reject({status: response.status});
      }
    }, reject),
  );
  result.cancel = () => {
    if (!controller) throw new Error('Already canceled');
    controller.abort();
    controller = undefined;
  };
  return result;
};
