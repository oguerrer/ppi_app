import { Typography } from '@mui/material';
import React from 'react';
import graphic from '../../assets/images/graphic.png';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

import textStyles from '../../assets/stylesheets/text-styles.module.scss';
import styles from './home.module.scss';
import { goToPage, routeNaming } from '../../routes';

const Home = () => {
  return (
  <div className={styles.container}>
    <div className={styles.leftDiv}>
      <div className={styles.width100}>
        <Typography className={[textStyles.headingLarge, styles.title].join(' ')}>
          Policy Priority Inference
        </Typography>
      </div>
      <div className={styles.row}>
        <div className={styles.textDiv}>
          <Typography className={[textStyles.bodyMedium, styles.text]}>

            Welcome to the Policy Priority Inference (PPI) web app. PPI is
            an artificial intelligence framework that supports evidence-
            based decisions related to government spending in the
            context of multidimensional and interdependent
            development. In this app, you can upload development
            indicators, a network of interdependencies between them,
            and budgetary data to simulate policy experiments that
            capture scenarios with different expenditure decisions. The
            app allows you to export your simulated data and to generate
            intuitive visualizations about the expected performance of the
            indicators under the different experiments.
          </Typography>
        </div>
        <div className={styles.imgDiv}>
          <img src={graphic} alt="" className={styles.graphic}/>
        </div>
      </div>
    </div>
    <div className={styles.buttonContainer}>
        <button
          className={[textStyles.bodyMediumBold, styles.startButton].join(' ')}
          onClick={() => goToPage(routeNaming.SIMULATION)}
        >
        Start
        <DoubleArrowIcon className={styles.icon} />
      </button>
    </div>
  </div>
  )};

export { Home };
