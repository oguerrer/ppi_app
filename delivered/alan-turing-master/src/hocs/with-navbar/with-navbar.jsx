import React from 'react';

import { Navbar } from './navbar';

const withNavbar = (Component) => (
  (props) => (
    <>
      <Navbar />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...props} />
    </>
  )
);

export { withNavbar };
