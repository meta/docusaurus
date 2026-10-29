import React, {PureComponent} from 'react';
// import PropTypes from 'prop-types'
import compose from '../composeStyle';
import {icons as defaultIcons} from '../constants';

const {load, loading, loaded, error, noicon, offline} = defaultIcons;

export default class Media extends PureComponent {
  /*static propTypes = {
    /!** URL of the image *!/
    src: PropTypes.string.isRequired,
    /!** Width of the image in px *!/
    width: PropTypes.number.isRequired,
    /!** Height of the image in px *!/
    height: PropTypes.number.isRequired,
    placeholder: PropTypes.oneOfType([
      PropTypes.shape({
        /!** Solid color placeholder *!/
        color: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        /!**
         * [Low Quality Image Placeholder](https://github.com/zouhir/lqip)
         * [SVG-Based Image Placeholder](https://github.com/technopagan/sqip)
         * base64 encoded image of low quality
         *!/
        lqip: PropTypes.string.isRequired,
      }),
    ]).isRequired,
    /!** display icon *!/
    icon: PropTypes.oneOf([load, loading, loaded, error, noicon, offline])
      .isRequired,
    /!** Map of icons *!/
    icons: PropTypes.object.isRequired,
    /!** theme object - CSS Modules or React styles *!/
    theme: PropTypes.object.isRequired,
    /!** Alternative text *!/
    alt: PropTypes.string,
    /!** Color of the icon *!/
    iconColor: PropTypes.string,
    /!** Size of the icon in px *!/
    iconSize: PropTypes.number,
    /!** React's style attribute for root element of the component *!/
    style: PropTypes.object,
    /!** React's className attribute for root element of the component *!/
    className: PropTypes.string,
    /!** On click handler *!/
    onClick: PropTypes.func,
    /!** callback to get dimensions of the placeholder *!/
    onDimensions: PropTypes.func,
    /!** message to show below the icon *!/
    message: PropTypes.node,
    /!** reference for Waypoint *!/
    innerRef: PropTypes.func,
    /!** noscript image src *!/
    nsSrc: PropTypes.string,
    /!** noscript image srcSet *!/
    nsSrcSet: PropTypes.string,
  }*/

  static defaultProps = {
    iconColor: '#fff',
    iconSize: 64,
  };

  constructor(props) {
    super(props);
    this.state = {isMounted: false};
  }

  componentDidMount() {
    this.setState({isMounted: true});

    if (this.props.onDimensions && this.dimensionElement)
      /* Firefox returns 0 for both clientWidth and clientHeight.
      To fix this we can check the parentNode's clientWidth and clientHeight as a fallback. */
      this.props.onDimensions({
        width:
          this.dimensionElement.clientWidth ||
          this.dimensionElement.parentNode.clientWidth,
        height:
          this.dimensionElement.clientHeight ||
          this.dimensionElement.parentNode.clientHeight,
      });
  }

  renderIcon(props) {
    const {icon, icons, iconColor: fill, iconSize: size, theme} = props;
    const iconToRender = icons[icon];
    if (!iconToRender) return null;
    const styleOrClass = compose(
      {width: size + 100, height: size, color: fill},
      theme.icon,
    );
    return React.createElement('div', styleOrClass, [
      React.createElement(iconToRender, {fill, size, key: 'icon'}),
      React.createElement('br', {key: 'br'}),
      this.props.message,
    ]);
  }

  renderImage(props) {
    return props.icon === loaded ? (
      <img
        {...compose(props.theme.img)}
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
      />
    ) : (
      <svg
        {...compose(props.theme.img)}
        width={props.width}
        height={props.height}
        ref={(ref) => (this.dimensionElement = ref)}
      />
    );
  }

  renderNoscript(props) {
    // render noscript in ssr + hydration to avoid hydration mismatch error
    return this.state.isMounted ? null : (
      <noscript>
        <img
          {...compose(props.theme.img, props.theme.noscript)}
          src={props.nsSrc}
          srcSet={props.nsSrcSet}
          alt={props.alt}
          width={props.width}
          height={props.height}
        />
      </noscript>
    );
  }

  render() {
    const props = this.props;
    const {placeholder, theme} = props;
    let background;
    if (props.icon === loaded) {
      background = {};
    } else if (placeholder.lqip) {
      background = {
        backgroundImage: `url("${placeholder.lqip}")`,
      };
    } else {
      background = {
        backgroundColor: placeholder.color,
      };
    }
    return (
      <div
        {...compose(
          theme.placeholder,
          background,
          props.style,
          props.className,
        )}
        onClick={this.props.onClick}
        onKeyPress={this.props.onClick}
        ref={this.props.innerRef}>
        {this.renderImage(props)}
        {this.renderNoscript(props)}
        {this.renderIcon(props)}
      </div>
    );
  }
}
