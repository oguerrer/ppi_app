import React from 'react';
import { Breadcrumbs, Typography, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import styles from './breadcrumbs.module.scss';
import textStyles from '../../assets/stylesheets/text-styles.module.scss';

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

const CustomBreadcrumbs = (props) => {
  const { selected } = props;
  const breadcrumbs = [
    <div key="0">
      <Link
        className={
          selected === 0
            ? [textStyles.breadcrumbs, styles.selected].join(' ')
            : [textStyles.breadcrumbs, styles.notSelected].join(' ')
        }
        onClick={handleClick}
      >
        Indicators
        
      </Link>
      <div className={selected === 0 ? styles.borderBottom : styles.noBorderBottom} />
    </div>,
    <div key="1">
      <Link
        className={
          selected === 1
            ? [textStyles.breadcrumbs, styles.selected].join(' ')
            : [textStyles.breadcrumbs, styles.notSelected].join(' ')
        }
        
        onClick={handleClick}
      >
        Budget
      </Link>
      <div className={selected === 1 ? styles.borderBottom : styles.noBorderBottom} />
    </div>,
    <div key="2">
      <Link
        className={
          selected === 2
            ? [textStyles.breadcrumbs, styles.selected].join(' ')
            : [textStyles.breadcrumbs, styles.notSelected].join(' ')
        }
        onClick={handleClick}
      >
        Network (optional)
      </Link>
      <div className={selected === 2 ? styles.borderBottom : styles.noBorderBottom} />
    </div>,
    <div key="3">
      <Link
        className={
          selected === 3
            ? [textStyles.breadcrumbs, styles.selected].join(' ')
            : [textStyles.breadcrumbs, styles.notSelected].join(' ')
        }
        onClick={handleClick}
      >
        Calibrate
      </Link>
      <div className={selected === 3 ? styles.borderBottom : styles.noBorderBottom} />
    </div>,
    <div key="4">
      <Link
        className={
          selected === 4
            ? [textStyles.breadcrumbs, styles.selected].join(' ')
            : [textStyles.breadcrumbs, styles.notSelected].join(' ')
        }
        onClick={handleClick}
      >
        Simulate & Visualize
      </Link>
      <div className={selected === 4 ? styles.borderBottom : styles.noBorderBottom} />
    </div>,
  ];

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" className={styles.navigateNextIcon}/>}
      aria-label="breadcrumb"
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
}

export { CustomBreadcrumbs };
