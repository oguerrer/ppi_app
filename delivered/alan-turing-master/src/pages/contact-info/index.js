import { withNavbar } from '../../hocs/with-navbar';
import { ContactInfo } from './contact-info';

const WrappedContactInfo = withNavbar(ContactInfo);

export { WrappedContactInfo as ContactInfo};
