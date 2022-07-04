import { withNavbar } from '../../hocs/with-navbar';
import { Simulation } from './simulation';

const WrappedSimulation = withNavbar(Simulation);

export { WrappedSimulation as Simulation};
