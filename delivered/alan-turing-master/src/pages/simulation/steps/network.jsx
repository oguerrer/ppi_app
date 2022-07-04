import React from 'react';
import { Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import networkTemplate from '../../../assets/templates/templateNetwork.xls';
import styles from './steps.module.scss';
import textStyles from '../../../assets/stylesheets/text-styles.module.scss';
import { CustomBreadcrumbs } from '../breadcrumbs';
import { MediaUploader } from '../../../common/media-uploader/media-uploader';
import { FileValidation } from './validations/fileValidation';
import { getFileExtention } from '../../../helpers/file-helper';
import { validateNetwork } from '../../../helpers/validations/validateNetwork';

const Network = (props) => {
  const { nextStep, simulationState, networkFile, setNetworkFile, setNetworkResults, indicatorsResult } = props;
  const [verified, setVerified] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState([]);
  const { ID } = indicatorsResult;
  const uploadFile = async (file) => {
    if (file && file.name) {
      const extention = getFileExtention(file);
      const fileValidation = await validateNetwork(extention, file, ID);
      setNetworkFile(file);
      if (
        !fileValidation.error
      ) {
        setVerified(true);
        setValidationResult(fileValidation);
        setNetworkResults(fileValidation);
      } else {
        setVerified(false);
        setValidationResult(fileValidation);
      }
    } else {
      setNetworkFile([]);
      setVerified(false);
      setValidationResult(null);
    }
  }
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.leftDiv}>
          <div className={styles.primaryTitle}>
            <Typography className={textStyles.headingSmallBold}>
              Policy Priority Inference
            </Typography>
          </div>
          <div className={styles.secondaryTitle}>
            <Typography className={textStyles.headingLarge}>
              Upload network
            </Typography>
            <Typography className={textStyles.headingMedium}>
              (Optional)
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
              Here you can upload the network of interdependencies between the indicators. You can construct this network using various statistical methods, or through the opinion of experts. PPI is agnostic of your approach and it will take into account these interdependencies if provided.. You can learn more about network estimation methods for development indicator data in this open access article:
            </Typography>
            <a
              href="https://doi.org/10.1016/j.im.2020.103342"
              className={[textStyles.bodyMedium, styles.greyText].join(' ')}
            >
              https://doi.org/10.1016/j.im.2020.103342
            </a>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <CustomBreadcrumbs selected={simulationState} />
          <div className={styles.rightSubDiv}>
            <div className={styles.column}>
              <div className={styles.networkDiv}>
                <Typography className={textStyles.bodyMedium}>
                  A matrix containing all the interdependencies between indicators. The rows correspond to the indicators sending spillovers and the columns to those receiving them. The diagonal values must be zero (the app will enforce this). If not provided, PPI assumes that there are no spillover effects (a matrix full of zeros).
                </Typography>
              </div>
              <div className={styles.fileContainer}>
                <MediaUploader
                  className={styles.mediaUploader}
                  maxFiles={1}
                  previewsPerLine={1}
                  supportedExtensions={['xlsx', 'xls']}
                  onFileSelection={(files) => {
                    if (files) {
                      uploadFile(files[0]);
                    } else {
                      uploadFile([]);
                    }
                  }}
                />
                {networkFile
                  && (
                    <FileValidation verified={verified} component="network" validationResult={validationResult} />
                  )}
              </div>
            </div>
            <a download href={networkTemplate} className={[styles.downloadLink, styles.end, styles.downloadNetworkButton].join(' ')}>
              <div className={styles.downloadTemplateButton}>Download example</div>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={[textStyles.bodyMediumBold, styles.skipButton].join(' ')}
          onClick={() => nextStep()}
        >
          Skip this step
        </button>
        <button
          className={[textStyles.bodyMediumBold, styles.nextButton].join(' ')}
          onClick={() => nextStep()}
          disabled={!verified}
        >
          Next
          <NavigateNextIcon className={styles.icon} />
        </button>
      </div>
    </div>
  )
}

export { Network };
