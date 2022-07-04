import React from 'react';
import {
  FormControl,
  InputLabel, TextField, Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import styles from './steps.module.scss';
import textStyles from '../../../assets/stylesheets/text-styles.module.scss';
import { CustomBreadcrumbs } from '../breadcrumbs';
import { ppi } from '../../../helpers/logical-functions/runppi';

import * as d3 from 'd3';
import { psd3 } from '../steps/charts/psd3';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import {
  COLUMN_WIDTH, HIGHLIGHT,
  LABEL_COLOR, PERIOD,
  PIE_COLORS, ROTATE_LABELS,
  RUN_PPI_ITERATIONS, STROKE,
} from '../../../global/constants';
import PrintIcon from '@mui/icons-material/Print';

const runPPIs = (
  iterations, IF, alphas, alphas_prime, betas, A, R, bs, qm, rl,
  Imax, Imin, Bs, B_dict, G, period, frontier, test, forCalibrate
) => {
  const ppiResults = [];
  let rows = 0;
  let cols = 0;
  for (let iter = 0; iter < iterations; iter++) {
    const intermediateResult = ppi(IF, alphas, alphas_prime, betas, A, R, bs, qm, rl,
      Imax, Imin, Bs, B_dict, G, period, frontier, test, forCalibrate);
    [rows, cols] = intermediateResult[0].shape;
    ppiResults[iter] = intermediateResult[0].tolist();
  }
  let returnPPI = [];
  for (let r = 0; r < rows; r++){
    returnPPI.push([]);
    for (let c = 0; c < cols; c++) {
      returnPPI[r].push(0);
      ppiResults.forEach((ppiResult) => {
        returnPPI[r][c] += ppiResult[r][c];
      });
      returnPPI[r][c] = returnPPI[r][c] / iterations;
    }
  }
  // eslint-disable-next-line no-undef
  return nj.array(returnPPI);
}

const numberOfPeriodsInfo = "Choose the number of periods that you wish to simulate. As a reference, the model parameters were calibrating assuming 50 periods. Therefore, if your budget data represent the average annual expenditure of 10 years, there is an equivalence of 10 years = 50 simulation periods. Accordingly, for example, if you wish to simulate 5 years, you wold need to input 25 periods in the field. You should avoid simulating too many periods, as PPI is a short-term oriented tool. Hence, the app will limit your input to a maximum of 1000 periods.";
/* LINE CHART */
const getLineData = (data, indicatorsResult) => {
  const [numberRows, numberPeriods] = data.shape;
  const indicatorsIds = indicatorsResult.ID;
  const indicatorsColors = indicatorsResult.color;
  const initialValues = indicatorsResult.IF;
  let localLineData = [];
  for (const iterRow in Array.from({ length: numberRows })) {
    let localDataSerie = [];
    for (const iterCol in Array.from({ length: numberPeriods })) {
      localDataSerie.push({
        name: indicatorsIds[iterRow],
        value: data.get(iterRow, iterCol) - initialValues[iterRow],
        color: indicatorsColors[iterRow],
        period: parseInt(iterCol),
      });
    }
    localLineData.push(localDataSerie);
  }
  return localLineData;
}
 /* PIE CHART */
const getPieData = (data, indicatorsResult) => {
  const [numberRows, numberPeriods] = data.shape;
  const indicatorsIds = indicatorsResult.ID;
  const indicatorsColors = indicatorsResult.color;
  const indicatorsNames = indicatorsResult.name;
  const initialValues = indicatorsResult.IF;
  const firstVariation = {
    id: "Negative",
    name: "Negative",
    color: PIE_COLORS.negative,
    pieValue: 0,
    indicatorValue: 0,
    variation: 0,
    drilldown: [],
  }
  const secondVariation = {
    id: "0 to 50%",
    name: "0 to 50%",
    color: PIE_COLORS.middle,
    pieValue: 0,
    indicatorValue: 0,
    variation: 0,
    drilldown: [],
  }
  const thirdVariation = {
    id: "More than 50%",
    name: "More than 50%",
    color: PIE_COLORS.higher,
    pieValue: 0,
    indicatorValue: 0,
    variation: 0,
    drilldown: [],
  }
  let totalValues = 0;
  for (const iterRow in Array.from({ length: numberRows })) {
    totalValues += !isNaN(data.get(iterRow, numberPeriods - 1))
      ? data.get(iterRow, numberPeriods - 1)
      : 0;
    const variation = ((data.get(iterRow, numberPeriods - 1) - initialValues[iterRow]) / initialValues[iterRow]) * 100;
    const drilldownData = {
      id: indicatorsIds[iterRow],
      name: indicatorsNames[iterRow],
      color: indicatorsColors[iterRow],
      indicatorValue: !isNaN(data.get(iterRow, numberPeriods - 1))
        ? data.get(iterRow, numberPeriods - 1)
        : 0,
      initialValue: !isNaN(initialValues[iterRow])
        ? initialValues[iterRow]
        : 0,
      variation: !isNaN(variation)
        ? variation
        : 0,
    };
    if (variation < 0) {
      firstVariation.drilldown.push(drilldownData);
    } else if (variation >= 0 && variation <= 0.5){
      secondVariation.drilldown.push(drilldownData);
    } else {
      thirdVariation.drilldown.push(drilldownData);
    }
  }
  const pieData = [firstVariation, secondVariation, thirdVariation];
  pieData.forEach((pd, key) => {
    let localTotal = 0;
    pd.drilldown.forEach((d, key2) => {
      pieData[key].drilldown[key2].pieValue = pieData[key].drilldown[key2].indicatorValue * 100 / totalValues;
      localTotal += !isNaN(pieData[key].drilldown[key2].indicatorValue * 100 / totalValues)
        ? pieData[key].drilldown[key2].indicatorValue * 100 / totalValues
        : 0;
    });
    pieData[key].pieValue = localTotal;
    pieData[key].indicatorValue = localTotal;
  });
  return pieData;
}

const getDownloadData = (data, indicatorsResult) => {
  const [numberRows, numberPeriods] = data.shape;
  const downloadData = [];
  for (const iterRow in Array.from({ length: numberRows })) {
    const col = [];
    for (const iterColumn in Array.from({ length: numberPeriods })) {
      col.push(data.get(iterRow, iterColumn));
    }
    downloadData.push(col);
  }
  const returnData = downloadData.map((d, key) => [indicatorsResult.ID[key], ...d]);
  return returnData;
}

const getVariationData = (data, indicatorsResult) => {
  const [numberRows, numberPeriods] = data.shape;
  const indicatorsIds = indicatorsResult.ID;
  const indicatorsColors = indicatorsResult.color;
  const indicatorsNames = indicatorsResult.name;
  const initialValues = indicatorsResult.IF;
  const localVariationData = [];
  for (const iterRow in Array.from({ length: numberRows })) {
    localVariationData.push({
      name: indicatorsIds[iterRow],
      value: initialValues[iterRow],
      valueNext: data.get(iterRow, numberPeriods - 1),
      color: indicatorsColors[iterRow],
    });
  }

  return localVariationData;
}


const Simulate = (props) => {
  const { simulationState, calibration, indicatorsResult, budgetResults, networkResults, budget } = props;
  const [simulateResult, setSimulateResult] = React.useState();
  const [period, setPeriod] = React.useState(PERIOD);
  const [loading, setLoading] = React.useState(false);
  const [pieData, setPieData] = React.useState([]);
  const [variationData, setVariationData] = React.useState([]);
  const [lineData, setLineData] = React.useState([]);
  const [doSimulation, setDoSimulation] = React.useState(false);
  const { IF, R, qm, rl, Imax, Imin } = indicatorsResult;
  const A = networkResults !== null ? networkResults.A : null;
  let alphas = indicatorsResult.alpha || [];
  let alphas_prime = indicatorsResult.alpha_prime || [];
  let betas = indicatorsResult.beta || [];
  let T = [];
  let Bs = null;
  let B_dict = null;
  if (budgetResults !== null) {
    Bs = budgetResults.Bs;
    B_dict = budgetResults.B_dict;
  } else {
    Bs = budget;
  }
  if (calibration) {
    calibration.selection.data.forEach((d, key) => {
      if (key !== 0) {
        alphas[key] = d[0];
        alphas_prime[key] = d[1];
        betas[key] = d[2];
        T[key] = d[3];
      }
    });
  }
  const simulate = () => {
    return new Promise((resolve) => {
      setLoading(true);
      const localSimulateResult = runPPIs(RUN_PPI_ITERATIONS, IF, alphas, alphas_prime, betas, A, R, null, qm, rl,
        Imax, Imin, Bs, B_dict, null, period, null, false, false);
      resolve(localSimulateResult);
      
    }).then((result) => {
      setSimulateResult(result);
      setPieData(getPieData(result, indicatorsResult));
      setLineData(getLineData(result, indicatorsResult));
      setVariationData(getVariationData(result, indicatorsResult));
    });
  }
  
   var color = d3.scale.ordinal()
     .domain([1, 2, 3, 4])
     .range([PIE_COLORS.inner, PIE_COLORS.negative, PIE_COLORS.middle, PIE_COLORS.higher]);
    // Draw chart
  // eslint-disable-next-line no-undef
  let samplePie = null;
  React.useEffect(() => {
    if (pieData && pieData.length > 0) {
      var config = {
        containerId: "chartContainer",
        width: 600,
        height: 600,
        data: pieData,
        heading: {
          text: "Historical levels and expected progress",
          pos: "top"
        },
        label: function (d) {
          return d.data.id
        },
        value: "pieValue",
        inner: "drilldown",
        tooltip: function (d) {
          return "<div style='background-color:" + d.color +"; color: white; padding: 10px; text-align: middle; border: solid 1px black;'><strong> ID: </strong>" + d.id + "<br> <strong>Value: </strong>" + d.indicatorValue.toFixed(12) + "<br> <strong>Variation: </strong>" + d.variation.toFixed(12) + "</div>";
        },
        transition: "linear",
        transitionDuration: 1200,
        donutRadius: 50,
        colors: color,
        labelColor: LABEL_COLOR,
        stroke: STROKE,
        strokeWidth: 1,
        drilldownTransition: "linear",
        drilldownTransitionDuration: 1000,
        highlightColor: HIGHLIGHT,
        rotateLabel: ROTATE_LABELS,
      };
      if (samplePie) {
        samplePie.remove();
        samplePie = new psd3.Pie(config);
      } else {
        samplePie = new psd3.Pie(config);
      }
    }
  }, [pieData]);

  React.useEffect(() => {
    if (lineData && lineData.length > 0) {
      /* Line chart */
      let rootLine = am5.Root.new("lineChartDiv");
      rootLine.setThemes([
        am5themes_Animated.new(rootLine)
      ]);

      let lineChart = rootLine.container.children.push(am5xy.XYChart.new(rootLine, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        maxTooltipDistance: 0,
        pinchZoomX: true,
      }));

      let cursorLine = lineChart.set("cursor", am5xy.XYCursor.new(rootLine, {
        behavior: "none"
      }));
      cursorLine.lineY.set("visible", false);

      let xAxisLine = lineChart.xAxes.push(
        am5xy.ValueAxis.new(rootLine, {
          maxDeviation: 0,
          renderer: am5xy.AxisRendererX.new(rootLine, {}),
          tooltip: am5.Tooltip.new(rootLine, {}),
        })
      );

      let yAxisLine = lineChart.yAxes.push(am5xy.ValueAxis.new(rootLine, {
        renderer: am5xy.AxisRendererY.new(rootLine, {})
      }));

      const [numberRows, numberPeriods] = simulateResult.shape;
      for (const iterRow in Array.from({ length: numberRows })) {
        let seriesLine = lineChart.series.push(am5xy.LineSeries.new(rootLine, {
          name: "Series " + iterRow,
          xAxis: xAxisLine,
          yAxis: yAxisLine,
          valueYField: "value",
          valueXField: "period",
          legendValueText: "{valueY}",
          fill: am5.color(indicatorsResult.color[iterRow]),
          stroke: am5.color(indicatorsResult.color[iterRow]),
          tooltip: am5.Tooltip.new(rootLine, {
            pointerOrientation: "horizontal",
            labelText: '[bold]ID: [/]{name}\n[bold]Value: [/]{valueY}',
          })
        }));
        seriesLine.data.setAll(lineData[iterRow]);

        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        seriesLine.appear();
      }
      lineChart.appear(1000, 100);
    }
  }, [lineData]);

  React.useEffect(() => {
    if (variationData && variationData.length > 0) {
      /* Variation chart */
      let root = am5.Root.new("chartDiv");
      root.setThemes([
        am5themes_Animated.new(root)
      ]);

      let chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        layout: root.verticalLayout
      }));
      var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
      xRenderer.labels.template.setAll({
        rotation: -90,
        centerY: am5.p0,
        centerX: am5.p50,
        // paddingRight: 15,
        // cellStartLocation: 0.1,
        // cellEndLocation: 0.9,
        // minGridDistance: 30,
      });
      let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: xRenderer,
        maxDeviation: 0.3,
        tooltip: am5.Tooltip.new(root, {})
      }));

      xAxis.data.setAll(variationData);

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {})
      }));

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "name"
      }));

      series.columns.template.setAll({
        tooltipText: "{categoryX}: {valueY}",
        width: am5.percent(COLUMN_WIDTH),
        tooltipY: 0,
      });

      series.data.setAll(variationData);
      series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5 });
      series.columns.template.adapters.add("fill", function (fill, target) {
        return target.dataItem.dataContext.color;
      });

      series.columns.template.adapters.add("stroke", function (stroke, target) {
        return target.dataItem.dataContext.color;
      });
      // Variance indicator series
      let series2 = chart.series.push(am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "valueNext",
        openValueYField: "value",
        categoryXField: "name",
        fill: am5.color(0x555555),
        stroke: am5.color(0x555555),
      }));

      // arrow line width
      series2.columns.template.setAll({
        width: 1
      });
      series2.data.setAll(variationData);

      /* series2.bullets.push(function () {
        let label = am5.Label.new(root, {
          text: "{valueY}",
          fontWeight: "500",
          fill: am5.color(0x00cc00),
          centerY: am5.p100,
          centerX: am5.p50,
          populateText: true
        });

        // Modify text of the bullet with percent
        label.adapters.add("text", function (text, target) {
          let percent = getVariancePercent(target.dataItem);
          return percent ? percent + "%" : text;
        });

        // Set dynamic color of the bullet
        label.adapters.add("centerY", function (center, target) {
          return getVariancePercent(target.dataItem) < 0 ? 0 : center;
        });

        // Set dynamic color of the bullet
        // label.adapters.add("fill", function (fill, target) {
        //  return getVariancePercent(target.dataItem) < 0 ? am5.color(0xcc0000) : fill;
        // });

        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: label
        });
      }); */

      series2.bullets.push(function () {
        let arrow = am5.Graphics.new(root, {
          rotation: -90,
          // centerX: am5.p0,
          // centerY: am5.p50,
          dy: 3,
          fill: am5.color(0x555555),
          stroke: am5.color(0x555555),
          draw: function (display) {
            display.moveTo(0, -3);
            display.lineTo(8, 0);
            display.lineTo(0, 3);
            display.lineTo(0, -3);
          }
        });

        arrow.adapters.add("rotation", function (rotation, target) {
          return getVariancePercent(target.dataItem) < 0 ? 90 : rotation;
        });

        arrow.adapters.add("dy", function (dy, target) {
          return getVariancePercent(target.dataItem) < 0 ? -3 : dy;
        });

        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: arrow
        })
      })


      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear(1000);
      chart.appear(1000, 100);

      function getVariancePercent(dataItem) {
        if (dataItem) {
          let value = dataItem.get("valueY");
          let openValue = dataItem.get("openValueY");
          let change = value - openValue;
          return Math.round(change / openValue * 100);
        }
        return 0;
      }
    }
  }, [variationData]);

  const downloadExcel = (dataArray) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = `SimulationData-${new Date().toLocaleDateString().replaceAll('/', '-')}`;
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS');
    const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  React.useEffect(() => {
    if (loading) {
      setDoSimulation(true);
    }
  }, [loading]);

  React.useEffect(() => {
    const onClickSimulate = async () => {
      simulate();
    };
    if (doSimulation === true) {
      onClickSimulate();
      setLoading(false);
      setDoSimulation(false);
    }
  }, [doSimulation]);


  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={[styles.leftDiv, styles.noPrint].join(' ')}>
          <div className={styles.primaryTitle}>
            <Typography className={textStyles.headingSmallBold}>
              Policy Priority Inference
            </Typography>
          </div>
          <div className={styles.secondaryTitle}>
            <Typography className={textStyles.headingLarge}>
              Simulate & visualize
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
              Now, you are all set to run simulations with PPI. By default, PPI uses the final values of your indicators (the column "final_value" in the template) as the initial conditions for the simulations. If you would like to change these initial conditions, you need to open a new tab with the app, and upload a new data file with the parameters already calibrated (so you should skip the calibration), and different values in the column "final_value". The same logic applies if you would like to change the budget. In addition, you should choose a number of periods to simulate.
            </Typography>
            <Typography className={[textStyles.bodyMedium, styles.greyText, styles.mt30].join(' ')}>
              To learn about the meaning of a simulated period, click on the information icon above the relevant field. The output of these simulations consists of a representative time series (across many independent simulations) for each indicator. Here, you will see a series of basic plots summarizing the outputs of these simulations. You can also download these data to perform more detailed analyses.
            </Typography>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <CustomBreadcrumbs selected={simulationState} />
          <div className={styles.rightSubDiv}>
            <div className={styles.column}>
              <div className={[styles.column, styles.mt40].join(' ')}>
                {!simulateResult
                  && (
                    <div className={[styles.row, styles.mb52].join(' ')}>
                      <FormControl variant="standard" className={styles.mr70}>
                        <InputLabel shrink htmlFor="period" className={[textStyles.labelReg, styles.inputLabel].join(' ')}>
                          Number of periods to simulate
                          <Tooltip title={numberOfPeriodsInfo} className={styles.infoIcon}>
                            <InfoOutlinedIcon />
                          </Tooltip>
                        </InputLabel>
                        <TextField
                          id="period"
                          variant="outlined"
                          className={styles.input}
                          value={period}
                          onChange={(e) => setPeriod(Number(e.target.value))}
                          placeholder="1 - 1000"
                          disabled={loading}
                        />
                      </FormControl>
                    </div>
                )}
                {!simulateResult
                  && (
                    <button
                      className={[textStyles.bodyMediumBold, styles.startSimulationButton].join(' ')}
                      onClick={() => setLoading(true)}
                      disabled={period <= 0 || period >= 1000 || loading}
                    >
                      Start simulation
                    </button>
                  )
                }
                {loading
                  && (
                    <Typography className={[textStyles.subtitle, styles.simulating].join(' ')}>
                      Simulating...
                    </Typography>
                  )}
                {!loading
                  && simulateResult
                  && (
                    <div className={styles.downloadDiv}>
                      <CSVLink
                        filename={`SimulationData-${new Date().toLocaleDateString().replaceAll('/', '-')}`}
                        data={getDownloadData(simulateResult, indicatorsResult)}
                        className={[textStyles.bodyMediumBold, styles.startCalibrationButton, styles.ml20, loading ? styles.hide : '', styles.noPrint].join(' ')}
                      >
                        Download CSV
                      </CSVLink>
                      <button
                      className={[textStyles.bodyMediumBold, styles.startCalibrationButton, styles.downloadExcel, loading ? styles.hide : '', styles.noPrint].join(' ')}
                        onClick={() => downloadExcel(getDownloadData(simulateResult, indicatorsResult))}
                      >
                        Download EXCEL
                      </button>
                    <button
                      className={[textStyles.bodyMediumBold, styles.startCalibrationButton, styles.downloadExcel, loading ? styles.hide : '', styles.noPrint, styles.printButton].join(' ')}
                      onClick={() => window.print()}
                    >
                      <PrintIcon />
                    </button>
                    </div>
                  )}
                {!loading
                && simulateResult
                && (
                  <div className={styles.chartsDiv}>
                    <Typography className={styles.variationTitle}>
                      Evolution of the indicators
                    </Typography>
                    <div id="lineChartDiv" style={{ height: '375px', width: '1000px' }}/>
                    <div id="chartContainer" />
                    <Typography className={styles.variationTitle}>
                      Expected progress in relation to the indicators' levels
                    </Typography>
                    <div id="chartDiv" style={{ height: '400px', width: '1000px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Simulate };
