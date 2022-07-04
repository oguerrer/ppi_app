import * as React from 'react';
import {
  AppBar, Box, Toolbar,
  Container, Button,
} from '@mui/material';
import logo from '../../assets/images/logo.png';

import textStyles from '../../assets/stylesheets/text-styles.module.scss';
import styles from './navbar.module.scss';
import { goToPage } from '../../routes/route-helpers';
import { routeNaming } from '../../routes/routes';

const pages = [
  { name: 'About PPI', route: routeNaming.HOME },
  { name: 'Contact info', route: routeNaming.CONTACT_INFO},
];

const Navbar = () => {
  return (
    <AppBar position="static" className={styles.header}>
      <Container maxWidth="xl" className={styles.container}>
        <Toolbar disableGutters className={styles.navbar}>
          <img src={logo} alt='' onClick={() => goToPage(routeNaming.HOME)} className={styles.logo} />
          <Box className={styles.linksBox}>
            {pages.map((page) => (
              <Button
                key={page.route}
                className={[textStyles.link, styles.navbarLink, styles.noPrint].join(' ')}
                onClick={() => goToPage(page.route)}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export { Navbar };
