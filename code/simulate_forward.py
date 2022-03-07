import matplotlib.pyplot as plt
import os, warnings
import numpy as np
import pandas as pd
from joblib import Parallel, delayed

warnings.simplefilter("ignore")

home =  os.getcwd()[:-4]

import ppi



## LOAD ALL THE BENCHMARKING DATA
df_param = pd.read_csv(home+'/data/benchmark/integrated_in_template/indicators_calibrated.csv')
I0 = df_param['IF'].values
R = df_param['R'].values
qm = df_param['qm'].values
rl = df_param['rl'].values
Imin = df_param['Imin'].values
Imax = df_param['Imax'].values
G = df_param['G'].values

Bs = np.loadtxt(home+'/data/benchmark/integrated_in_template/Bs.csv', delimiter=',')
df_B_dict = pd.read_csv(home+'/data/benchmark/integrated_in_template/B_dict.csv', header=None)
B_dict = {}
for index, row in df_B_dict.iterrows():
    B_dict[int(row[0]-1)] = [int(c-1) for c in row[df_B_dict.columns[1::]].values if not np.isnan(c)]
A = np.loadtxt(home+'/data/benchmark/integrated_in_template/A.csv', delimiter=',')

alpha = df_param['alpha'].values
alpha_prime = df_param['alpha_prime'].values
beta = df_param['beta'].values

T = 50
sample_size = 1000
parallel_processes = 4




output = np.array(Parallel(n_jobs=parallel_processes, verbose=0)(delayed(ppi.run_ppi)\
                (I0=I0, alphas=alpha, alphas_prime=alpha_prime, betas=beta, 
                 A=A, R=R, qm=qm, rl=rl, Bs=Bs, B_dict=B_dict, T=T) for itera in range(sample_size)))

tsI, tsC, tsF, tsP, tsS, tsG = zip(*output)
mean_series = np.mean(tsI, axis=0)



















