// import PropTypes from 'prop-types'

const Icon = ({size = 24, fill = '#000', className, path}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path fill={fill} d={path} />
  </svg>
);

/*
Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
  className: PropTypes.string,
  path: PropTypes.string.isRequired,
}
 */

export default Icon;
