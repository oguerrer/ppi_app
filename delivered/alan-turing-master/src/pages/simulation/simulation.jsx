import { Typography } from '@mui/material';
import React from 'react';
import { getValues } from '../../helpers/logical-functions/get-values';
import styles from './simulation.module.scss';
import { Budget } from './steps/budget';
import { Calibrate } from './steps/calibrate';
import { Indicators } from './steps/indicators';
import { Network } from './steps/network';
import { Simulate } from './steps/simulate';

const STATES = {
  indicators: 0,
  budget: 1,
  network: 2,
  calibrate: 3,
  simulate: 4,
};

const Simulation = () => {
  const [simulationState, setSimulationState] = React.useState(STATES.indicators);
  const [indicatorsFile, setIndicatorsFile] = React.useState([]);
  const [indicatorsResult, setIndicatorsResult] = React.useState(null);
  const [budgetFile, setBudgetFile] = React.useState(null);
  const [budgetResults, setBudgetResults] = React.useState(null);
  const [networkFile, setNetworkFile] = React.useState(null);
  const [networkResults, setNetworkResults] = React.useState(null);
  const [calibration, setCalibration] = React.useState(null);
  const [budget, setBudget] = React.useState(null);
  const nextStep = () => {
    setSimulationState(simulationState + 1);
  }
  return (
    <div className={styles.container}>
      {
        simulationState === STATES.indicators
        && (
          <Indicators
            indicatorsFile={indicatorsFile}
            setIndicatorsFile={setIndicatorsFile}
            nextStep={nextStep}
            simulationState={simulationState}
            setIndicatorsResult={setIndicatorsResult}
          />
        )
      }
      {
        simulationState === STATES.budget
        && (
          <Budget
            nextStep={nextStep}
            simulationState={simulationState}
            budgetFile={budgetFile}
            setBudgetFile={setBudgetFile}
            indicatorsResult={indicatorsResult}
            setBudgetResults={setBudgetResults}
            budget={budget}
            setBudget={setBudget}
          />
        )
      }
      {
        simulationState === STATES.network
        && (
          <Network
            nextStep={nextStep}
            simulationState={simulationState}
            networkFile={networkFile}
            setNetworkFile={setNetworkFile}
            setNetworkResults={setNetworkResults}
            indicatorsResult={indicatorsResult}
          />
        )
      }
      {
        simulationState === STATES.calibrate
        && (
          <Calibrate
            nextStep={nextStep}
            simulationState={simulationState}
            indicatorsResult={indicatorsResult}
            budgetResults={budgetResults}
            networkResults={networkResults}
            setCalibration={setCalibration}
            calibration={calibration}
            budget={budget}
          />
        )
      }
      {
        simulationState === STATES.simulate
        && (
          <Simulate
            nextStep={nextStep}
            simulationState={simulationState}
            indicatorsFile={indicatorsFile}
            budgetFile={budgetFile}
            networkFile={networkFile}
            setIndicatorsFile={setIndicatorsFile}
            setBudgetFile={setBudgetFile}
            setNetworkFile={setNetworkFile}
            calibration={calibration}
            indicatorsResult={indicatorsResult}
            budgetResults={budgetResults}
            networkResults={networkResults}
            budget={budget}
            setBudget={setBudget}
          />
        )
      }
    </div>
  )};

export { Simulation };
