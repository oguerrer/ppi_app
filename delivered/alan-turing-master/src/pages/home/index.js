import { withNavbar } from '../../hocs/with-navbar';
import { Home } from './home';

const WrappedHome = withNavbar(Home);

export { WrappedHome as Home};
