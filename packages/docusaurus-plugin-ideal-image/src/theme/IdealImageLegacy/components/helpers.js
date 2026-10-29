export const ssr =
  typeof window === 'undefined' || window.navigator.userAgent === 'ReactSnap';

export const nativeConnection = !ssr && !!window.navigator.connection;

export const guessMaxImageWidth = (dimensions, w) => {
  if (ssr) return 0;

  // Default to window object but don't use window as a default
  // parameter so that this can be used on the server as well
  if (!w) {
    w = window;
  }

  const imgWidth = dimensions.width;

  const {screen} = w;
  const sWidth = screen.width;
  const sHeight = screen.height;

  const {documentElement} = document;
  const windowWidth = w.innerWidth || documentElement.clientWidth;
  const windowHeight = w.innerHeight || documentElement.clientHeight;
  const devicePixelRatio = w.devicePixelRatio || 1;

  const windowResized = sWidth > windowWidth;

  let result;
  if (windowResized) {
    const body = document.getElementsByTagName('body')[0];
    const scrollWidth = windowWidth - imgWidth;
    const isScroll =
      body.clientHeight > windowHeight || body.clientHeight > sHeight;
    if (isScroll && scrollWidth <= 15) {
      result = sWidth - scrollWidth;
    } else {
      result = (imgWidth / windowWidth) * sWidth;
    }
  } else {
    result = imgWidth;
  }

  return result * devicePixelRatio;
};

export const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

const detectWebpSupport = () => {
  if (ssr) return false;
  const elem = document.createElement('canvas');
  if (elem.getContext?.('2d')) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } else {
    // very old browser like IE 8, canvas not supported
    return false;
  }
};

export const supportsWebp = detectWebpSupport();

const isWebp = (x) => x.format === 'webp' || x.src?.match(/\.webp($|\?.*)/i);

// eslint-disable-next-line no-shadow
export const selectSrc = ({srcSet, maxImageWidth, supportsWebp}) => {
  if (srcSet.length === 0) throw new Error('Need at least one item in srcSet');
  let supportedFormat, width;
  if (supportsWebp) {
    supportedFormat = srcSet.filter(isWebp);
    if (supportedFormat.length === 0) supportedFormat = srcSet;
  } else {
    supportedFormat = srcSet.filter((x) => !isWebp(x));
    if (supportedFormat.length === 0)
      throw new Error('Need at least one supported format item in srcSet');
  }
  let widths = supportedFormat.filter((x) => x.width >= maxImageWidth);
  if (widths.length === 0) {
    widths = supportedFormat;
    width = Math.max.apply(
      null,
      widths.map((x) => x.width),
    );
  } else {
    width = Math.min.apply(
      null,
      widths.map((x) => x.width),
    );
  }
  return supportedFormat.filter((x) => x.width === width)[0];
};

export const fallbackParams = ({srcSet, getUrl}) => {
  if (!ssr) return {};
  const notWebp = srcSet.filter((x) => !isWebp(x));
  const first = notWebp[0];
  return {
    nsSrcSet: notWebp
      .map((x) => `${getUrl ? getUrl(x) : x.src} ${x.width}w`)
      .join(','),
    nsSrc: getUrl ? getUrl(first) : first.src,
    ssr,
  };
};
