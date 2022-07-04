import { routeNaming } from './routes/routes';
import { Home } from './pages/home';
import { Simulation } from './pages/simulation';
import { ContactInfo } from './pages/contact-info';
import { NotFound } from './pages/not-found';
const routeConfig = [
  {
    name: routeNaming.HOME,
    component: Home,
  },
  {
    name: routeNaming.SIMULATION,
    component: Simulation,
  },
  {
    name: routeNaming.CONTACT_INFO,
    component: ContactInfo,
  },
  {
    name: routeNaming.NOT_FOUND,
    component: NotFound,
  },
];

export { routeConfig };
