/*****LOGICAL**VARIABLES******/
// CALIBRATION
const INCREMENT = 1000;
const TEST = true;
const CALIBRATE_SAMPLE_SIZE = 10;// 500;
const VERBOSE = true;
const CALIBRATE_PERIOD = 50;
const LOW_PRECISION_COUNTS = 101;
const PARALLEL_PROCESSES = null; // not implemented yet
const INITIAL_THRESHOLD = 0.3;

// SIMULATE
const PERIOD = 50;
const RUN_PPI_ITERATIONS = 500;
//***SIMULATE (UI)
/******PIE**CHART******/
const PIE_COLORS = {
  inner: '#646363',
  negative: '#bcbaba',
  middle: 'grey',
  higher: 'black',

}
const LABEL_COLOR = 'white';
const STROKE = '#eee;';
const HIGHLIGHT = '#0A97D9';
const ROTATE_LABELS = true;

/******COLUMN**CHART******/
const COLUMN_WIDTH = 90;

//SYSTEM VARIABLES
const URL_PREFIX = "/ppiapp";

export {
  INCREMENT,
  TEST,
  CALIBRATE_SAMPLE_SIZE,
  VERBOSE,
  CALIBRATE_PERIOD,
  LOW_PRECISION_COUNTS,
  PARALLEL_PROCESSES,
  INITIAL_THRESHOLD,
  PERIOD,
  RUN_PPI_ITERATIONS,
  PIE_COLORS,
  LABEL_COLOR,
  STROKE,
  HIGHLIGHT,
  ROTATE_LABELS,
  COLUMN_WIDTH,
  URL_PREFIX,
}
