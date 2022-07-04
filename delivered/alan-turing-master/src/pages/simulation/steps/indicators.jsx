import React from 'react';
import { Typography } from '@mui/material';
import indicatorsTable from '../../../assets/images/table.png';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ImageViewer from 'react-simple-image-viewer';
import indicatorsTemplate from '../../../assets/templates/templateIndicators.xls';
import styles from './steps.module.scss';
import textStyles from '../../../assets/stylesheets/text-styles.module.scss';
import { CustomBreadcrumbs } from '../breadcrumbs';
import { MediaUploader } from '../../../common/media-uploader/media-uploader';
import { FileValidation } from './validations/fileValidation';
import { validateIndicators } from '../../../helpers/validations/validateIndicators';
import { getFileExtention } from '../../../helpers/file-helper';

const Indicators = (props) => {
  const { nextStep, indicatorsFile, setIndicatorsFile , simulationState, setIndicatorsResult} = props;
  const [verified, setVerified] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  const uploadFile = async (file) => {
    if (file && file.name) {
      const extention = getFileExtention(file);
      const fileValidation = await validateIndicators(extention, file);
      setIndicatorsFile(file);
      if (
        !fileValidation.error
      ) {
        setVerified(true);
        setValidationResult(fileValidation);
        setIndicatorsResult(fileValidation);
      } else {
        setVerified(false);
        setValidationResult(fileValidation);
      }
    } else {
      setIndicatorsFile([]);
      setVerified(false);
      setValidationResult(null);
    }
  }

  const openImageViewer = React.useCallback(() => {
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setIsViewerOpen(false);
  };

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);
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
              Upload indicators
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
              Here you can upload the data related to the development indicators that you want to analyse. These data should be formatted according to our template, which you can download here as well. The values of the indicators should be normalised between 0 and 1 before uploading them. On the right hand side of this page you can find further information about the template for the indicators.
            </Typography>
            <div className={styles.darkDiv}>
              <Typography className={[textStyles.bodyMedium, styles.lightText].join(' ')}>
                You can check the following steps but you can’t run a simulation until you upload at least the required files.
              </Typography>
            </div>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <CustomBreadcrumbs selected={simulationState} />
          <div className={styles.rightSubDiv}>
            <div className={styles.column}>
              <div>
                <Typography className={[textStyles.subtitle, styles.tableTitle].join(' ')}>
                  Template references
                </Typography>
              </div>
              <div className={[styles.leftSubDiv, styles.row].join(' ')}>
                <div className={styles.column}>
                  <img
                    src={indicatorsTable}
                    alt="indicators table"
                    className={styles.indicatorsTable}
                    onClick={() => openImageViewer()}
                  />
                  {isViewerOpen && (
                    <ImageViewer
                      src={[indicatorsTable]}
                      currentIndex={0}
                      disableScroll={false}
                      closeOnClickOutside={true}
                      onClose={closeImageViewer}
                    />
                  )}
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
                    {indicatorsFile
                    && validationResult
                    && indicatorsFile.name
                    && (
                      <FileValidation component="indicator" verified={verified} validationResult={validationResult} />
                    )}
                  </div>
                </div>
                <div className={[textStyles.bodyMedium, styles.column, styles.leftParagraph].join(' ')}>
                  <Typography>
                    The table on the left explains the columns that your dataset should contain. Most columns are optional, however, the more information you provide, the better insights you will gain from PPI. If you have already calibrated PPI, then upload the template with the parameter columns filled in. If you have not, leave them empty and the app will take you to the calibration phase.
                  </Typography>
                  <a download href={indicatorsTemplate} className={styles.downloadLink}>
                    <div className={[styles.whiteButton, styles.downloadTemplateButton].join(' ')}>Download template</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
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

export { Indicators };
