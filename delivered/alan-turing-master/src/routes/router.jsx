import React from 'react';
import { Route, Router as VendorRouter, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createTheme, StyledEngineProvider } from '@mui/material';

import { history, routes } from './routes';
import { ScrollToTop } from './scroll-to-top';
import { ThemeProvider } from '@mui/private-theming';

const routeConfigTemplate = {
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
};

const IPropTypes = {
  routeConfig: PropTypes.arrayOf(PropTypes.shape(routeConfigTemplate)).isRequired,
};

const zipRouteData = (routeData) => (
  routeData.map((data) => {
    const route = routes.find((r) => r.name === data.name);
    return {
      ...data,
      ...route,
    };
  })
);

const renderRoutes = (routeData) => (
  zipRouteData(routeData).map((data) => (
    <Route
      key={data.path}
      exact
      path={data.path}
      component={data.component}
    />
  ))
);

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway',
  },
});


const Router = (props) => {
  const { routeConfig } = props;
  return (
    <VendorRouter history={history}>
      <ScrollToTop>
        <StyledEngineProvider injectFirst>
          <Switch>
            <ThemeProvider theme={theme}>
              {renderRoutes(routeConfig)}
            </ThemeProvider>
          </Switch>
        </StyledEngineProvider>
      </ScrollToTop>
    </VendorRouter>
  );
};

Router.propTypes = IPropTypes;

export { Router };
