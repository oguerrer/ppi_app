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
success_rates = df_param['success_rate'].values
R = df_param['R'].values
qm = df_param['qm'].values
rl = df_param['rl'].values
Bs = np.loadtxt(home+'/data/benchmark/integrated_in_template/Bs.csv', delimiter=',')
df_B_dict = pd.read_csv(home+'/data/benchmark/integrated_in_template/B_dict.csv', header=None)
B_dict = {}
for index, row in df_B_dict.iterrows():
    B_dict[int(row[0]-1)] = [int(c-1) for c in row[df_B_dict.columns[1::]].values if not np.isnan(c)]
A = np.loadtxt(home+'/data/benchmark/integrated_in_template/A.csv', delimiter=',')



## CALIBRATION WITH IMPERFECT BUDGET MATRIX AND INDICATOR PROPERTIES
parameters = ppi.calibrate(I0, IF, success_rates, parallel_processes=4, Bs=Bs, 
                           B_dict=B_dict, A=A, R=R, qm=qm, rl=rl, verbose=True,
                           threshold=0.9)
dfp = pd.DataFrame(parameters[1::,:], columns=parameters[0])
dfp.loc[dfp['T']=='nan', 'T'] = np.nan


df_param.loc[:, 'alpha'] = dfp['alpha']
df_param.loc[:, 'alpha_prime'] = dfp['alpha_prime']
df_param.loc[:, 'beta'] = dfp['beta']


dfp.to_csv(home+'/data/benchmark/integrated_in_template/parameters.csv', index=False)
df_param.to_csv(home+'/data/benchmark/integrated_in_template/indicators_calibrated.csv', index=False)













































