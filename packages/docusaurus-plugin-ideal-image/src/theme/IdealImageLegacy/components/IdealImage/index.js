import {Component} from 'react';
import {Waypoint} from './waypoint';
import Media from '../Media';
import {icons, loadStates} from '../constants';
import {xhrLoader, imageLoader, timeout, combineCancel} from '../loaders';
import {
  guessMaxImageWidth,
  bytesToSize,
  supportsWebp,
  ssr,
  nativeConnection,
  selectSrc,
  fallbackParams,
} from '../helpers';

const {initial, loading, loaded, error} = loadStates;

const defaultShouldAutoDownload = ({
  connection,
  size,
  threshold,
  possiblySlowNetwork,
}) => {
  if (possiblySlowNetwork) return false;
  if (!connection) return true;
  const {downlink, rtt, effectiveType} = connection;
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return false;
    case '3g':
      if (downlink && size && threshold) {
        return (size * 8) / (downlink * 1000) + rtt < threshold;
      }
      return false;
    case '4g':
    default:
      return true;
  }
};

const defaultGetMessage = (icon, state) => {
  switch (icon) {
    case icons.noicon:
    case icons.loaded:
      return null;
    case icons.loading:
      return 'Loading...';
    case icons.load:
      // we can show `alt` here
      const {pickedSrc} = state;
      const {size} = pickedSrc;
      if (size) {
        return [
          'Click to load (',
          <nobr key="nb">{bytesToSize(size)}</nobr>,
          ')',
        ];
      } else {
        return 'Click to load';
      }
    case icons.offline:
      return 'Your browser is offline. Image not loaded';
    case icons.error:
      const {loadInfo} = state;
      if (loadInfo === 404) {
        return '404. Image not found';
      } else {
        return 'Error. Click to reload';
      }
    default:
      throw new Error(`Wrong icon: ${icon}`);
  }
};

const defaultGetIcon = (state) => {
  const {loadState, onLine, overThreshold, userTriggered} = state;
  if (ssr) return icons.noicon;
  switch (loadState) {
    case loaded:
      return icons.loaded;
    case loading:
      return overThreshold ? icons.loading : icons.noicon;
    case initial:
      if (onLine) {
        const {shouldAutoDownload} = state;
        if (shouldAutoDownload === undefined) return icons.noicon;
        return userTriggered || !shouldAutoDownload ? icons.load : icons.noicon;
      } else {
        return icons.offline;
      }
    case error:
      return onLine ? icons.error : icons.offline;
    default:
      throw new Error(`Wrong state: ${loadState}`);
  }
};

export default class IdealImage extends Component {
  constructor(props) {
    super(props);
    // TODO: validate props.srcSet
    this.state = {
      loadState: initial,
      connection: nativeConnection
        ? {
            downlink: navigator.connection.downlink, // megabits per second
            rtt: navigator.connection.rtt, // ms
            effectiveType: navigator.connection.effectiveType, // 'slow-2g', '2g', '3g', or '4g'
          }
        : null,
      onLine: true,
      overThreshold: false,
      inViewport: false,
      userTriggered: false,
      possiblySlowNetwork: false,
    };
  }

  /*
  static propTypes = {
    /!** how much to wait in ms until consider download to slow *!/
    threshold: PropTypes.number,
    /!** function to generate src based on width and format *!/
    getUrl: PropTypes.func,
    /!** array of sources *!/
    srcSet: PropTypes.arrayOf(
      PropTypes.shape({
        width: PropTypes.number.isRequired,
        src: PropTypes.string,
        size: PropTypes.number,
        format: PropTypes.oneOf(['jpeg', 'jpg', 'webp', 'png', 'gif']),
      }),
    ).isRequired,
    /!** function which decides if image should be downloaded *!/
    shouldAutoDownload: PropTypes.func,
    /!** function which decides what message to show *!/
    getMessage: PropTypes.func,
    /!** function which decides what icon to show *!/
    getIcon: PropTypes.func,
    /!** type of loader *!/
    loader: PropTypes.oneOf(['image', 'xhr']),
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
    /!** Map of icons *!/
    icons: PropTypes.object.isRequired,
    /!** theme object - CSS Modules or React styles *!/
    theme: PropTypes.object.isRequired,
  }*/

  static defaultProps = {
    shouldAutoDownload: defaultShouldAutoDownload,
    getMessage: defaultGetMessage,
    getIcon: defaultGetIcon,
    loader: 'xhr',
  };

  componentDidMount() {
    if (nativeConnection) {
      this.updateConnection = () => {
        if (!navigator.onLine) return;
        if (this.state.loadState === initial) {
          this.setState({
            connection: {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt,
            },
          });
        }
      };
      navigator.connection.addEventListener('onchange', this.updateConnection);
    } else if (this.props.threshold) {
      this.possiblySlowNetworkListener = (e) => {
        if (this.state.loadState !== initial) return;
        const {possiblySlowNetwork} = e.detail;
        if (!this.state.possiblySlowNetwork && possiblySlowNetwork) {
          this.setState({possiblySlowNetwork});
        }
      };
      window.document.addEventListener(
        'possiblySlowNetwork',
        this.possiblySlowNetworkListener,
      );
    }
    this.updateOnlineStatus = () => this.setState({onLine: navigator.onLine});
    this.updateOnlineStatus();
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  componentWillUnmount() {
    this.clear();
    if (nativeConnection) {
      navigator.connection.removeEventListener(
        'onchange',
        this.updateConnection,
      );
    } else if (this.props.threshold) {
      window.document.removeEventListener(
        'possiblySlowNetwork',
        this.possiblySlowNetworkListener,
      );
    }
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  }

  onClick = () => {
    const {loadState, onLine, overThreshold} = this.state;
    if (!onLine) return;
    switch (loadState) {
      case loading:
        if (overThreshold) this.cancel(true);
        return;
      case loaded:
        // nothing
        return;
      case initial:
      case error:
        this.load(true);
        return;
      default:
        throw new Error(`Wrong state: ${loadState}`);
    }
  };

  clear() {
    if (this.loader) {
      this.loader.cancel();
      this.loader = undefined;
    }
  }

  cancel(userTriggered) {
    if (loading !== this.state.loadState) return;
    this.clear();
    this.loadStateChange(initial, userTriggered);
  }

  loadStateChange(loadState, userTriggered, loadInfo = null) {
    this.setState({
      loadState,
      overThreshold: false,
      userTriggered: !!userTriggered,
      loadInfo,
    });
  }

  load = (userTriggered) => {
    const {loadState, url} = this.state;
    if (ssr || loaded === loadState || loading === loadState) return;
    this.loadStateChange(loading, userTriggered);

    const {threshold} = this.props;
    const loader =
      this.props.loader === 'xhr' ? xhrLoader(url) : imageLoader(url);
    loader
      .then(() => {
        this.clear();
        this.loadStateChange(loaded, false);
      })
      .catch((e) => {
        this.clear();
        if (e.status === 404) {
          this.loadStateChange(error, false, 404);
        } else {
          this.loadStateChange(error, false);
        }
      });

    if (threshold) {
      const timeoutLoader = timeout(threshold);
      timeoutLoader.then(() => {
        if (!this.loader) return;
        window.document.dispatchEvent(
          new CustomEvent('possiblySlowNetwork', {
            detail: {possiblySlowNetwork: true},
          }),
        );
        this.setState({overThreshold: true});
        if (!this.state.userTriggered) this.cancel(true);
      });
      this.loader = combineCancel(loader, timeoutLoader);
    } else {
      this.loader = loader;
    }
  };

  onEnter = () => {
    if (this.state.inViewport) return;
    this.setState({inViewport: true});
    const pickedSrc = selectSrc({
      srcSet: this.props.srcSet,
      maxImageWidth:
        this.props.srcSet.length > 1
          ? guessMaxImageWidth(this.state.dimensions) // eslint-disable-line react/no-access-state-in-setstate
          : 0,
      supportsWebp,
    });
    const {getUrl} = this.props;
    const url = getUrl ? getUrl(pickedSrc) : pickedSrc.src;
    const shouldAutoDownload = this.props.shouldAutoDownload({
      ...this.state, // eslint-disable-line react/no-access-state-in-setstate
      size: pickedSrc.size,
    });
    this.setState({pickedSrc, shouldAutoDownload, url}, () => {
      if (shouldAutoDownload) this.load(false);
    });
  };

  onLeave = () => {
    if (this.state.loadState === loading && !this.state.userTriggered) {
      this.setState({inViewport: false});
      this.cancel(false);
    }
  };

  render() {
    const icon = this.props.getIcon(this.state);
    const message = this.props.getMessage(icon, this.state);
    return (
      <Waypoint onEnter={this.onEnter} onLeave={this.onLeave}>
        <Media
          {...this.props}
          {...fallbackParams(this.props)}
          onClick={this.onClick}
          icon={icon}
          src={this.state.url || ''}
          onDimensions={(dimensions) => this.setState({dimensions})}
          message={message}
        />
      </Waypoint>
    );
  }
}
