import IdealImage from '../IdealImage';
import icons from '../icons';
import theme from '../theme';

const IdealImageWithDefaults = ({
  icons: iconsProp = icons,
  theme: themeProp = theme,
  ...props
}) => <IdealImage {...props} icons={iconsProp} theme={themeProp} />;

export default IdealImageWithDefaults;
