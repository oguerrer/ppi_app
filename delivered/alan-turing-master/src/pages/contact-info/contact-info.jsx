import React from 'react';
import {  Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import styles from './contact-info.module.scss';
import textStyles from '../../assets/stylesheets/text-styles.module.scss';

const ContactInfo = (props) => {
  return (
    <div className={[styles.container, styles.mt40].join(' ')}>
      <div className={styles.subContainer}>
        <div className={styles.leftDiv}>
          <div className={styles.primaryTitle}>
            <Typography className={textStyles.headingSmallBold}>
              Policy Priority Inference
            </Typography>
          </div>
          <div className={styles.secondaryTitle}>
            <Typography className={textStyles.headingLarge}>
              Contact
            </Typography>
          </div>
          <div className={styles.paragraphDiv}>
            <div className={styles.informationDiv} >
              <ErrorOutlineIcon className={styles.errorIcon} />
              <Typography className={textStyles.headingSmall}>
                Information
              </Typography>
            </div>
            <Typography className={[textStyles.bodyMedium, styles.greyText].join(' ')}>
              PPI was created by Dr Omar A Guerrero, Head of Computational Social Science Research at The Alan Turing Institute (London), and by Prof Gonzalo Castañeda, Professor of Economics at the Centro de Investigación y Docencia Económica (Mexico City).
            </Typography>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <div className={styles.rightSubDiv}>
            <div className={styles.column}>
              <div>
                <Typography className={[textStyles.subtitle, styles.tableTitle].join(' ')}>
                  For further information on this app or on PPI in general, please contact:
                </Typography>
              </div>
              <div className={[styles.leftSubDiv, styles.row].join(' ')}>
                <div className={styles.column}>
                <Typography className={textStyles.bodyMediumBold}>
                    Dr Omar A Guerrero
                </Typography>
                  <Typography className={textStyles.bodyMedium}>
                  Head of Computational Social Science Research
                </Typography>
                  <Typography className={textStyles.bodyMedium}>
                    Public Policy Programe
                </Typography>
                <Typography className={textStyles.bodyMedium}>
                    The Alan Turing Institute
                </Typography>
                <Typography className={textStyles.bodyMedium}>
                    oguerrero@turing.ac.uk
                </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  )
}

export { ContactInfo };
