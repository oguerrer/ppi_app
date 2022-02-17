import matplotlib.pyplot as plt
import os, warnings
import numpy as np
import pandas as pd

warnings.simplefilter("ignore")

home =  os.getcwd()[:-4]

import calibrator






## CALIBRATION ONLY WITH INDICATOR TIME SERIES

# Load indicators
series = np.loadtxt(home+'/data/benchmark/indicators_series.csv', delimiter=',', dtype=float)
# Get initial values
I0 = series[:,0]
# Get final values
IF = series[:,-1]
# Get success rates
success_rates = np.sum(series[:,1::] < series[:,0:-1], axis=1)/(series.shape[1]-1)


parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_only_indicators.csv', index=False)





## CALIBRATION ONLY WITH SINGLE TOTAL BUDGET

budget = np.loadtxt(home+'/data/benchmark/expenditure_mean.csv', delimiter=',', dtype=float)
Bs = float(budget)

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_total_budget.csv', index=False)




## CALIBRATION ONLY WITH TOTAL BUDGET TIME SERIES

budget = np.loadtxt(home+'/data/benchmark/expenditure_serie.csv', delimiter=',', dtype=float)
Bs = budget

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_budget_serie.csv', index=False)




## CALIBRATION ONLY WITH PERFECT BUDGET MATRIX

budget = np.loadtxt(home+'/data/benchmark/expenditure_matrix_perfect.csv', delimiter=',', dtype=float)
Bs = budget
B_dict = {}
for i in range(len(I0)):
    B_dict[i] = [i]

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_budget_matrix_perfect.csv', index=False)




## CALIBRATION ONLY WITH IMPERFECT BUDGET MATRIX

budget = np.loadtxt(home+'/data/benchmark/expenditure_matrix_imperfect.csv', delimiter=',', dtype=float)
Bs = budget
B_dict = {}
j = 0
for i in range(len(I0)):
    B_dict[i] = [j]
    if i%2==0 and j<len(Bs)-1:
        j+=1

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_budget_matrix_imperfect.csv', index=False)










## CALIBRATION ONLY WITH INDICATOR PROPERTIES

df2 = pd.read_csv(home+'/data/benchmark/indicators_properties.csv')

# instrumental indicators
R = df2.instrumental.values

# quality of monitoring
qm = df2.controlOfCorruption.values[R==1]

# quality of monitoring
rl = df2.ruleOfLaw.values[R==1]

# update B_dict to consider instrumental indicators only
B_dict = {}
j = 0
for i in range(len(I0)):
    if R[i] == 1:
        B_dict[i] = [j]
        if i%2==0 and j<len(Bs)-1:
            j+=1

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, R=R, qm=qm, rl=rl, verbose=True)
dfp1 = pd.DataFrame(parameters[1::,:], columns=parameters[0])
dfp1.to_csv(home+'/data/benchmark/calibrations/parameters_all_1.csv', index=False)

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, R=R, qm=qm, rl=rl, verbose=True)
dfp2 = pd.DataFrame(parameters[1::,:], columns=parameters[0])
dfp2.to_csv(home+'/data/benchmark/calibrations/parameters_all_2.csv', index=False)





## VERIFY CONSISTENCY BETWEEN TWO INDEPENDENT CALIBRATIONS

plt.plot(dfp1.alpha, dfp2.alpha, '.')
plt.xlabel('alpha calibration 1')
plt.xlabel('alpha calibration 2')
plt.show()







































































