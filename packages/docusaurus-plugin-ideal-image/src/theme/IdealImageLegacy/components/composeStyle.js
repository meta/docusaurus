/**
 * Composes styles and/or classes
 *
 * For classes it will concat them in in one string
 * and return as `className` property.
 * Alternative is https://github.com/JedWatson/classnames
 *
 * For objects it will merge them in one object
 * and return as `style` property.
 *
 * Usage:
 * Assume you have `theme` object, which can be css-module
 * or object or other css-in-js compatible with css-module
 *
 * <a {...compose(theme.link, theme.active, {color: "#000"})}>link</a>
 *
 * @returns {{className: string, style: object}} - params for React component
 */
export default (...stylesOrClasses) => {
  const classes = [];
  let style;
  for (const obj of stylesOrClasses) {
    if (obj instanceof Object) {
      Object.assign(style || (style = {}), obj);
    } else if (obj === undefined || obj === false) {
      // ignore
    } else if (typeof obj === 'string') {
      classes.push(obj);
    } else {
      throw new Error(`Unexpected value ${obj}`);
    }
  }
  return {
    className: classes.length > 1 ? classes.join(' ') : classes[0],
    style,
  };
};
