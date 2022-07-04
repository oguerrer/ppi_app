import React from 'react';
import {
  Typography,
  Slider,
  CircularProgress,
} from '@mui/material';
import { CSVLink, CSVDownload } from "react-csv";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Timer from 'react-timer-wrapper';
import Timecode from 'react-timecode';
import styles from './steps.module.scss';
import textStyles from '../../../assets/stylesheets/text-styles.module.scss';
import { CustomBreadcrumbs } from '../breadcrumbs';
import { styled } from '@mui/system';
import { calibrate } from '../../../helpers/logical-functions/calibrate';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import {
  CALIBRATE_PERIOD, CALIBRATE_SAMPLE_SIZE,
  INCREMENT, INITIAL_THRESHOLD, LOW_PRECISION_COUNTS,
  PARALLEL_PROCESSES, TEST, VERBOSE,
} from '../../../global/constants';

const CustomSlider = styled(Slider)({
  color: '#303030',
  height: 8,
  width: '300px',
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-SliderfocusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: 'transparent',
    marginTop: '73px',
  },
  '& .MuiSlider-valueLabelLabel': {
    color: 'black',
  },
  '& .MuiTypography-body1': {
    fontWeight: 700,
    fontSize: '22px',
    lineHeight: '30px',
  }
});

const getAccuracy = (threshold) => {
  if ((0.5 < threshold) && (threshold <= 0.7)) {
    return 'Medium';
  } else if ((0.7 < threshold) && (threshold <= 0.9)) {
    return 'High';
  } else if (threshold > 0.9) {
    return 'Very high'
  }
  return 'Low';
}

const canSkip = (indicatorsResult) => {
  let canSkip = true;
  indicatorsResult.alpha.forEach((a) => {
    if (typeof a !== 'number') canSkip = false;
  });
  if (!canSkip) return false;
  indicatorsResult.alpha_prime.forEach((ap) => {
    if (typeof ap !== 'number') canSkip = false;
  });
  if (!canSkip) return false;
  indicatorsResult.beta.forEach((b) => {
    if (typeof b !== 'number') canSkip = false;
  });
  if (!canSkip) return false;
  return canSkip;
}

const Calibrate = (props) => {
  const {
    nextStep, simulationState,
    indicatorsResult, budgetResults,
    setCalibration, calibration, budget,
    networkResults,
  } = props;
  const [quality, setQuality] = React.useState(INITIAL_THRESHOLD);
  const [accuracy, setAccuracy] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [canSkipCalibrate, setCanSkipCalibrate] = React.useState(false);
  const [doCalibration, setDoCalibration] = React.useState(false);

  const calibrate2 = () => {
    return new Promise ((resolve) => {
      const { I0, IF, success_rates, R, qm, rl } = indicatorsResult;
      const A = networkResults !== null ? networkResults.A : null;
      let Bs = budget || null;
      let B_dict = null;
      if (budgetResults && budgetResults.Bs) {
        Bs = budgetResults.Bs;
        B_dict = budgetResults.B_dict;
      }
      const parallel_processes = PARALLEL_PROCESSES;
      const low_precision_counts = LOW_PRECISION_COUNTS; // use for speed tests
      const increment = INCREMENT;
      const test = TEST;
      const sample_size = CALIBRATE_SAMPLE_SIZE; // use for speed tests
      const verbose = VERBOSE;
      const T = CALIBRATE_PERIOD;
      const calibrationResult = calibrate(
        I0,
        IF,
        success_rates,
        A,
        R,
        qm,
        rl,
        Bs,
        B_dict,
        T,
        parallel_processes,
        quality,
        verbose,
        low_precision_counts,
        increment,
        test,
        sample_size,
      );
      resolve(calibrationResult);
    }).then((result) => {
      setCalibration(result);
      setLoading(false);
    })
  }
  const downloadExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = `CalibratedData-${new Date().toLocaleDateString().replaceAll('/', '-')}`;
    const worksheet = XLSX.utils.aoa_to_sheet(calibration.selection.data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS');
    const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  
  React.useEffect(() => {
    setAccuracy(getAccuracy(quality));
  }, [quality]);
  React.useEffect(() => {
    if (loading === true) {
      setDoCalibration(true);
    }
  }, [loading]);
  React.useEffect(() => {
    const onClickCalibrate = async () => {
      calibrate2();
    };
    if (doCalibration === true) {
      onClickCalibrate();
    }
  }, [doCalibration]);
  React.useEffect(() => {
    const localCanSkip = canSkip(indicatorsResult);
    setCanSkipCalibrate(localCanSkip);
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
              Calibrate model
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
              href="https://doi.org/10.1007/s11625-022-01095-1"
              className={[textStyles.bodyMedium, styles.greyText].join(' ')}
            >
              https://doi.org/10.1007/s11625-022-01095-1
            </a>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <CustomBreadcrumbs selected={simulationState} />
          <div className={styles.rightSubDiv}>
            <div className={styles.column}>
              <div>
                <Typography className={[textStyles.subtitle, styles.tableTitle].join(' ')}>
                  Calibration quality
                </Typography>
              </div>
              <div className={styles.networkDiv}>
                <Typography className={textStyles.bodyMedium}>
                  The algorithm allows you to set the quality of the calibration through a slider. The higher the quality, the more time it takes to calibrate PPI. If the calibration is taking too long, you can always reset it and choose a lower quality. You can also accelerate the calibration through parallel computing, so if your computer has multiple cores, you can specify how many parallel processes should be run.
                </Typography>
              </div>
              <div className={[styles.column, styles.mt40].join(' ')}>
                <div className={styles.row}>
                  <CustomSlider
                    defaultValue={0.7}
                    value={quality}
                    valueLabelDisplay="on"
                    onChange={(e) => setQuality(e.target.value)}
                    min={0}
                    max={1}
                    step={0.05}
                    valueLabelFormat={(value) => (<Typography>{value}</Typography>)}
                    />
                  </div>
                <div className={styles.row}>
                  <Typography className={[textStyles.sliderNumbers, styles.firstNumber].join(' ')}>
                    {quality !== 0 ? '0' : ''}
                  </Typography>
                  {quality === 0 && <div className={styles.sliderInvisibleDiv0} />}
                  <Typography className={[textStyles.sliderNumbers, styles.lastNumber].join(' ')}>
                    {quality !== 1 ? '1' : ''}
                  </Typography>
                  {quality === 1 && <div className={styles.sliderInvisibleDiv1} />}
                    {!loading
                    && !calibration
                    && (
                      <button
                        className={[textStyles.bodyMediumBold, styles.startCalibrationButton, loading ? styles.hide : ''].join(' ')}
                        onClick={() => {
                          setLoading(true);
                        }}
                        disabled={quality === 0 || quality === 1}
                      >
                        Start calibration
                      </button>
                    )}
                    {!loading
                    && calibration
                    && calibration.selection
                    && calibration.selection.data
                    && (
                      <>
                        <CSVLink
                          filename={`CalibratedData-${new Date().toLocaleDateString().replaceAll('/', '-')}`}
                          data={calibration.selection.data}
                          className={[textStyles.bodyMediumBold, styles.startCalibrationButton, loading ? styles.hide : ''].join(' ')}
                        >
                            Download CSV
                        </CSVLink>
                        <button
                          className={[textStyles.bodyMediumBold, styles.startCalibrationButton, styles.downloadExcel, loading ? styles.hide : ''].join(' ')}
                        onClick={() => downloadExcel()}
                        >
                          Download EXCEL
                        </button>
                      </>
                    )}
                  {loading
                    && (
                      <Typography className={[textStyles.subtitle, styles.calibrating].join(' ')}>
                        Calibrating...
                      </Typography>
                    )}
                </div>
                <Typography className={textStyles.bodyMedium}>
                  Accuracy: {accuracy}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={[textStyles.bodyMediumBold, styles.skipButton].join(' ')}
          onClick={() => nextStep()}
          disabled={!canSkipCalibrate}
        >
          Skip this step
        </button>
        <button
          className={[textStyles.bodyMediumBold, styles.nextButton].join(' ')}
          onClick={() => nextStep()}
          disabled={calibration === null}
        >
          Next
          <NavigateNextIcon className={styles.icon} />
        </button>
      </div>
    </div>
  )
}

export { Calibrate };
