import matplotlib.pyplot as plt
import os, warnings
import pandas as pd
import numpy as np
from joblib import Parallel, delayed
from sklearn.linear_model import LinearRegression
import csv

warnings.simplefilter("ignore")

home =  os.getcwd()[:-8]


from functions import *


df = pd.read_csv(home+"/data/modeling/indicators_SDR_sample.csv")
country = 'MEX'
shift = 1

colYears = (np.array([year for year in range(1999, 2013)]) + shift).astype(str)
sub_periods = 4
T = len(colYears)*sub_periods

num_years = len(colYears)
min_value = 1e-2

# Extract country data
dft = df[df.countryCode==country]
df_expt = pd.read_csv(home+"/data/modeling/budgets/total/"+country+".csv")

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
usdgs = sorted(dft[R==1].sdg.unique())
sdg2index = dict(zip(usdgs, range(len(usdgs))))
sdgs = dft.sdg.values
B_dict = dict([(i,[sdg2index[sdgs[i]]+1]) for i in range(N) if R[i]==1])
for key, values in B_dict.items():
    new = np.random.choice(list(range(len(usdgs))))+1
    if new not in values:
        B_dict[key].append(new)
    new = np.random.choice(list(range(len(usdgs))))+1
    if new not in values:
        B_dict[key].append(new)
Bs = get_dirsbursement_schedule(Bs, B_dict, T)

# Network
A = np.loadtxt(home+"/data/modeling/networks_sdr/"+country+".csv", delimiter=',')

# Governance
qm = np.ones(n)*dft.controlOfCorruption.values[0]
rl = np.ones(n)*dft.ruleOfLaw.values[0]

# Parameters
# df_param = pd.read_csv(home+"/data/modeling/indicators_SDR_sample.csv")


### Create files of benchmark data

# np.savetxt(home+'/data/benchmark/I0.csv', I0, delimiter=',')
# np.savetxt(home+'/data/benchmark/IF.csv', IF, delimiter=',')
# np.savetxt(home+'/data/benchmark/success_rates.csv', success_rates, delimiter=',')
# np.savetxt(home+'/data/benchmark/A.csv', A, delimiter=',')
# np.savetxt(home+'/data/benchmark/R.csv', R, delimiter=',')
# np.savetxt(home+'/data/benchmark/qm.csv', qm, delimiter=',')
# np.savetxt(home+'/data/benchmark/rl.csv', rl, delimiter=',')
# np.savetxt(home+'/data/benchmark/Bs.csv', Bs, delimiter=',')
# np.savetxt(home+'/data/benchmark/B_dict.csv', [[key, val[0]] for key, val in B_dict.items()], delimiter=',')



dfr = pd.read_excel(home+"data/raw/SDR 2021 - Database.xlsx", sheet_name='Codebook')
names = dict(zip(dfr.IndCode, dfr.Indicator))
names['sdg8_gdpgrowth'] = 'GDP growth'



seriesCodes = [c.split('_')[1] for c in dft.seriesCode.values]
seriesNames = [names[c] for c in dft.seriesCode.values]

file = open(home+"/data/misc/sdg_colors.txt", 'r')
colors_sdg = dict([(i+1, line[0]) for i, line in enumerate(csv.reader(file))])
file.close()
colors = [colors_sdg[c] for c in dft.sdg.values]


qmo = np.ones(N)
qmo[R==1] = qm
qmo[R==0] = np.nan

rlo = np.ones(N)
rlo[R==1] = rl
rlo[R==0] = np.nan

missings = ['' for c in range(N)]

dff = pd.DataFrame( np.array([I0, missings, missings, missings,
                              IF, success_rates, R, qmo, rlo, np.zeros(N), np.ones(N),
                              dft.goal.values, seriesCodes, seriesNames, colors]).T,
                   columns=['I0', 'alpha', 'alpha_prime', 'beta', 'IF', 'success_rate',
                            'R', 'qm', 'rl', 'Imin', 'Imax', 'G', 'ID', 'name', 'color'])

dff.loc[dff.qm=='nan', 'qm'] = np.nan
dff.loc[dff.rl=='nan', 'rl'] = np.nan
dff.to_csv(home+'/data/benchmark/integrated_in_template/indicators_no_parameters.csv', index=False)

max_b = max([len(val) for val in B_dict.values()])
B_dict_v = np.array([[key+1]+[np.nan if i>=len(val) else val[i] for i in range(max_b)] for key, val in B_dict.items()])


np.savetxt(home+'/data/benchmark/integrated_in_template/Bs.csv', Bs.mean(axis=1), delimiter=',')
pd.DataFrame(B_dict_v).to_csv(home+'/data/benchmark/integrated_in_template/B_dict.csv', index=False, header=None)
np.savetxt(home+'/data/benchmark/integrated_in_template/A.csv', A, delimiter=',')



















































