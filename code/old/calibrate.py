import matplotlib.pyplot as plt
import os, warnings
import numpy as np
import pandas as pd

warnings.simplefilter("ignore")

home =  os.getcwd()[:-4]

import ppi



## LOAD ALL THE BENCHMARKING DATA
df_param = pd.read_csv(home+'/data/benchmark/integrated_in_template/indicators_no_parameters.csv')
I0 = df_param['I0'].values
IF = df_param['IF'].values
success_rates = df_param['success_rates'].values
R = df_param['R'].values
qm = df_param['qm'].values
rl = df_param['rl'].values
Bs = np.loadtxt(home+'/data/benchmark/integrated_in_template/Bs.csv', delimiter=',')
B_dict = dict([(int(key), [int(val)]) for key, val in np.loadtxt(home+'/data/benchmark/integrated_in_template/B_dict.csv', delimiter=',')])
A = np.loadtxt(home+'/data/benchmark/integrated_in_template/A.csv', delimiter=',')




## CALIBRATION ONLY WITH INDICATOR TIME SERIES
parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=20, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])





## CALIBRATION WITH SINGLE TOTAL BUDGET
Bs_mean = np.mean(Bs)
parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs_mean, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])




## CALIBRATION WITH TOTAL BUDGET TIME SERIES
Bs_mean_ts = Bs.mean(axis=0)
parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs_mean_ts, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])




## CALIBRATION WITH PERFECT BUDGET MATRIX
Bs_perfect = np.vstack( (np.tile(Bs, (4,1)), Bs[0:5,:]) )
B_dict_perfect = dict([(i,[i]) for i in range(len(I0))])
parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs_perfect, B_dict=B_dict_perfect, verbose=True)
df = pd.DataFrame(parameters[1::,:], columns=parameters[0])




## CALIBRATION WITH IMPERFECT BUDGET MATRIX AND INDICATOR PROPERTIES
parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, A=A, R=R, qm=qm, rl=rl, verbose=True)
dfp1 = pd.DataFrame(parameters[1::,:], columns=parameters[0])

parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=20, Bs=Bs, B_dict=B_dict, A=A, R=R, qm=qm, rl=rl, verbose=True)
dfp2 = pd.DataFrame(parameters[1::,:], columns=parameters[0])





## VERIFY CONSISTENCY BETWEEN TWO INDEPENDENT CALIBRATIONS
plt.plot(dfp1.alpha, dfp2.alpha, '.')
plt.xlabel('alpha calibration 1')
plt.ylabel('alpha calibration 2')
plt.show()



## COMPARE THIS ESTIMATION AGAINST THE BENCHMARK ONE
dfpb = pd.read_csv(home+'/data/benchmark/parameters_original.csv')
plt.plot(dfpb.alpha, dfp1.alpha, '.')
plt.xlabel('alpha benchmark')
plt.ylabel('alpha calibration')
plt.show()






## PROSPECTIVE SIMULATIONS

# projected budget matrix
Bs_future = np.tile(Bs[:,-1], (100,1)).T
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














































