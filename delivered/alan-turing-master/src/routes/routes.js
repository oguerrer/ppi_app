import { createBrowserHistory } from 'history';
import { URL_PREFIX } from '../global/constants';

const history = createBrowserHistory();

const routeNaming = {
  HOME: 'home',
  ABOUT_PPI: 'aboutPPI',
  CONTACT_INFO: 'contactInfo',
  SIMULATION: 'simulation',
  NOT_FOUND: 'notFound',
};

const PATH_PARAM_REGEX = /:[^/]+/gi;
/**
  Analyzes the path defined for `route` and
  returns a copy of the route with a new attribute
  `pathParams` which is a list of strings that correspond to the path params.

  @param {object} route - Object that represents a route.

  @return {object} updated route with the new attribute.

  @example

    determineRouteParams({ name: 'product', path: '/product/:id', component: ProductPage })
*/
const determineRouteParams = (route) => {
  const newRoute = { ...route };
  const { path } = newRoute;
  // Extract the names of the parameters
  const pathMatch = path.match(PATH_PARAM_REGEX) || [];
  const pathParams = pathMatch.map((param) => param.slice(1));
  newRoute.pathParams = pathParams || [];
  return newRoute;
};

const routes = [
  {
    name: routeNaming.HOME,
    path: '/',
  },
  {
    name: routeNaming.CONTACT_INFO,
    path: '/contact-info',
  },
  {
    name: routeNaming.SIMULATION,
    path: '/simulation',
  },
  {
    name: routeNaming.NOT_FOUND,
    path: '/not-found',
  },
].map(determineRouteParams).map((route) => {
  const prefixedRoute = route;
  prefixedRoute.path = `${URL_PREFIX}${route.path}`;
  return prefixedRoute;
});
export {
  determineRouteParams,
  history,
  routeNaming,
  routes,
};
