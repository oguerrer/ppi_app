import matplotlib.pyplot as plt
import os, warnings
import numpy as np
import pandas as pd

warnings.simplefilter("ignore")

home =  os.getcwd()[:-4]

import calibrator, ppi






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





## CALIBRATION WITH SINGLE TOTAL BUDGET

budget = np.loadtxt(home+'/data/benchmark/expenditure_mean.csv', delimiter=',', dtype=float)
Bs = float(budget)

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_total_budget.csv', index=False)




## CALIBRATION WITH TOTAL BUDGET TIME SERIES

budget = np.loadtxt(home+'/data/benchmark/expenditure_serie.csv', delimiter=',', dtype=float)
Bs = budget

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_budget_serie.csv', index=False)




## CALIBRATION WITH PERFECT BUDGET MATRIX

budget = np.loadtxt(home+'/data/benchmark/expenditure_matrix_perfect.csv', delimiter=',', dtype=float)
Bs = budget
B_dict = {}
for i in range(len(I0)):
    B_dict[i] = [i]

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])
df.to_csv(home+'/data/benchmark/calibrations/parameters_budget_matrix_perfect.csv', index=False)




## CALIBRATION WITH IMPERFECT BUDGET MATRIX

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




## CALIBRATION WITH INDICATOR PROPERTIES

df2 = pd.read_csv(home+'/data/benchmark/indicators_properties.csv')
# instrumental indicators
R = df2.instrumental.values
# quality of monitoring
qm = df2.controlOfCorruption.values[R==1]
# quality of monitoring
rl = df2.ruleOfLaw.values[R==1]
# spillover network
A = np.loadtxt(home+'/data/benchmark/network.csv', delimiter=',', dtype=float)

# update B_dict to consider instrumental indicators only
B_dict = {}
j = 0
for i in range(len(I0)):
    if R[i] == 1:
        B_dict[i] = [j]
        if i%2==0 and j<len(Bs)-1:
            j+=1

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, A=A, R=R, qm=qm, rl=rl, verbose=True)
dfp1 = pd.DataFrame(parameters[1::,:], columns=parameters[0])
dfp1.to_csv(home+'/data/benchmark/calibrations/parameters_all_1.csv', index=False)

parameters = calibrator.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, A=A, R=R, qm=qm, rl=rl, verbose=True)
dfp2 = pd.DataFrame(parameters[1::,:], columns=parameters[0])
dfp2.to_csv(home+'/data/benchmark/calibrations/parameters_all_2.csv', index=False)





## VERIFY CONSISTENCY BETWEEN TWO INDEPENDENT CALIBRATIONS

plt.plot(dfp1.alpha, dfp2.alpha, '.')
plt.xlabel('alpha calibration 1')
plt.ylabel('alpha calibration 2')
plt.show()




## PROSPECTIVE SIMULATIONS

# projected budget matrix
Bs_future = np.tile(Bs[:,-1], (20,1)).T
# Minimum and maximum values
Imin = np.zeros(len(I0))
Imax = np.ones(len(I0))
# paramters
alphas = dfp2.alpha.values.astype(float)
alphas_prime = dfp2.alpha_prime.values.astype(float)
betas = dfp2.beta.values.astype(float)

# single simulation
outputs = ppi.run_ppi(I0=I0, alphas=alphas, alphas_prime=alphas_prime, 
                          betas=betas, A=A, R=R, qm=qm, rl=rl,
                          Bs=Bs_future, B_dict=B_dict, Imin=Imin, Imax=Imax)

# unpack matrices with time series
tsI, tsC, tsF, tsP, tsS, tsG = outputs

for serie in tsI:
    plt.plot(serie)
plt.xlabel('time')
plt.ylabel('indicator')
plt.show()




# Monte Carlo simulations
all_outputs = []
for sim in range(100):
    outputs = ppi.run_ppi(I0=I0, alphas=alphas, alphas_prime=alphas_prime, 
                          betas=betas, A=A, R=R, qm=qm, rl=rl,
                          Bs=Bs_future, B_dict=B_dict, Imin=Imin, Imax=Imax)
    all_outputs.append(outputs)

# unpack Monte Carlo samples
tsI, tsC, tsF, tsP, tsS, tsG = zip(*all_outputs)

# compute means
mean_tsI = np.mean(tsI, axis=0)
for serie in mean_tsI:
    plt.plot(serie)
plt.xlabel('time')
plt.ylabel('indicator')
plt.show()





# Counterfactual with twice as much budget
all_outputs = []
for sim in range(100):
    outputs = ppi.run_ppi(I0=I0, alphas=alphas, alphas_prime=alphas_prime, 
                          betas=betas, A=A, R=R, qm=qm, rl=rl,
                          Bs=2*Bs_future, B_dict=B_dict, Imin=Imin, Imax=Imax)
    all_outputs.append(outputs)

# unpack Monte Carlo samples
tsI, tsC, tsF, tsP, tsS, tsG = zip(*all_outputs)

# compute means
mean_tsI = np.mean(tsI, axis=0)
for serie in mean_tsI:
    plt.plot(serie)
plt.xlabel('time')
plt.ylabel('indicator')
plt.show()














































