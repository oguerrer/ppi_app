import os, warnings
import pandas as pd
import numpy as np
from joblib import Parallel, delayed

warnings.simplefilter("ignore")

home =  os.getcwd()[:-4]


import ppi, calibrator


# Load indicators
series = np.loadtxt(home+'/data/benchmark/indicators_series.csv', delimiter=',', dtype=float)

# Get initial values
I0 = series[:,0]

# Get final values
IF = series[:,-1]

# Get success rates
success_rates = np.sum(series[:,1::] < series[:,0:-1], axis=1)/(series.shape[1]-1)



## RUN CALIBRATOR
# parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20)





budget = np.loadtxt(home+'/data/benchmark/expenditure_serie.csv', delimiter=',', dtype=float)


mean_budget = budget.mean()
np.savetxt(home+'/data/benchmark/expenditure_mean.csv', [mean_budget], delimiter=',')


budget_matrix = np.tile(budget/len(I0), (len(I0),1))
budget_matrix += np.random.rand(budget_matrix.shape[0], budget_matrix.shape[1])*3
np.savetxt(home+'/data/benchmark/expenditure_matrix_perfect.csv', budget_matrix, delimiter=',')



np.savetxt(home+'/data/benchmark/expenditure_matrix_imperfect.csv', budget_matrix[0:30, ::], delimiter=',')






























































































