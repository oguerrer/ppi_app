import matplotlib.pyplot as plt
import os, warnings
import pandas as pd
import numpy as np
from joblib import Parallel, delayed
from sklearn.linear_model import LinearRegression

warnings.simplefilter("ignore")

home =  os.getcwd()[:-14]


import ppi, calibrator
from functions import *


df = pd.read_csv(home+"data/modeling/indicators_SDR_sample.csv")
country = 'MEX'
shift = 1

colYears = (np.array([year for year in range(1999, 2013)]) + shift).astype(str)
sub_periods = 4
T = len(colYears)*sub_periods

num_years = len(colYears)
min_value = 1e-2

# Extract country data
dft = df[df.countryCode==country]
df_expt = pd.read_csv(home+"data/modeling/budgets/total/"+country+".csv")

# Indicators
series = dft[colYears].values
N = len(dft)

Imax = None
Imin=None
R = dft.instrumental.values.copy()
n = R.sum()
I0 = series[:,0]
IF = []
for serie in series:
    x = np.array([float(year) for year in colYears]).reshape((-1, 1))
    y = serie
    model = LinearRegression().fit(x, y)
    coef = model.coef_
    if coef > 0 and serie[-1] > serie[0]:
        IF.append(serie[-1])
    elif coef > 0 and serie[-1] <= serie[0]:
        IF.append(np.max(serie[serie!=serie[0]]))
    elif coef < 0 and serie[-1] < serie[0]:
        IF.append(serie[-1])
    elif coef < 0 and serie[-1] >= serie[0]:
        IF.append(np.min(serie[serie!=serie[0]]))

IF = np.array(IF)
success_rates = get_success_rates(series)
mean_drops = np.array([serie[serie<0].mean() for serie in np.diff(series, axis=1)])
mean_drops[np.isnan(mean_drops)] = 0
aa = np.abs(mean_drops/sub_periods)


# Budget 
Bs = np.tile(df_expt.values[:,1::].mean(axis=1), (num_years,1)).T 
usdgs = sorted(dft.sdg.unique())
sdg2index = dict(zip(usdgs, range(len(usdgs))))
sdgs = dft.sdg.values
B_dict = dict([(i,[sdg2index[sdgs[i]]]) for i in range(N) if R[i]==1])
Bs = get_dirsbursement_schedule(Bs, B_dict, T)

# Network
A = np.loadtxt(home+"data/modeling/networks_sdr/"+country+".csv", delimiter=',')

# Governance
qm = np.ones(n)*dft.controlOfCorruption.values[0]
rl = np.ones(n)*dft.ruleOfLaw.values[0]

## RUN CALIBRATOR
# parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20)
# parameters = pd.DataFrame(parameters[1::, :], columns=parameters[0] )



parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict,
                                  A=A, R=R, qm=qm, rl=rl, verbose=True)
dfc = pd.DataFrame(parameters[1::,:], columns=parameters[0])



# budget = np.loadtxt(home+'/data/benchmark/expenditure_serie.csv', delimiter=',', dtype=float)


# mean_budget = budget.mean()
# np.savetxt(home+'/data/benchmark/expenditure_mean.csv', [mean_budget], delimiter=',')


# budget_matrix = np.tile(budget/len(I0), (len(I0),1))
# budget_matrix += np.random.rand(budget_matrix.shape[0], budget_matrix.shape[1])*3
# np.savetxt(home+'/data/benchmark/expenditure_matrix_perfect.csv', budget_matrix, delimiter=',')



# np.savetxt(home+'/data/benchmark/expenditure_matrix_imperfect.csv', budget_matrix[0:30, ::], delimiter=',')


# dft = pd.read_csv('/Users/tequilamambo/Dropbox/Projects/ppi4aid/data/modeling/parameters_1/MEX.csv')


























































































