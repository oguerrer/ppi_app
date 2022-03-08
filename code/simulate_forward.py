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
                (I0=I0, alphas=alpha, alphas_prime=alpha_prime, betas=beta, Imin=Imin, Imax=Imax,
                 A=A, R=R, qm=qm, rl=rl, Bs=Bs, B_dict=B_dict, T=T) for itera in range(sample_size)))

tsI, tsC, tsF, tsP, tsS, tsG = zip(*output)

## THE MAIN OUTPUR OF THE APP
mean_series = np.mean(tsI, axis=0)
dff = pd.DataFrame([[df_param['ID'].values[i]]+c for i, c in enumerate(mean_series.tolist())], 
                   columns=['ID']+list(range(1, mean_series.shape[1]+1)))

dff.to_csv(home+'/data/benchmark/integrated_in_template/sim_outputs.csv', index=False)






## THE 4 VISUALIZATIONS

colors = df_param['color'].values
ids = df_param['ID'].values
goals = df_param['G'].values





# Visualization 1: time series of net progress

net_progresses = []
for serie in mean_series:
    net_progresses.append(serie-serie[0])

fig = plt.figure(figsize=(6,4))
for i, net_progress in enumerate(net_progresses):
    plt.plot( net_progress, color=colors[i], linewidth=2 )

plt.xlim(0, mean_series.shape[1])
plt.gca().spines['top'].set_visible(False)
plt.gca().spines['right'].set_visible(False)
plt.xlabel('time', fontsize=14)
plt.ylabel('net progress', fontsize=14)
plt.tight_layout()
plt.savefig(home+'/data/benchmark/integrated_in_template/viz_1.pdf')
plt.show()






# Visualization 2: bars of net progress and goals

fig = plt.figure(figsize=(12,4))
for i, serie in enumerate(mean_series):
    plt.bar( i, serie[0], color=colors[i], width=.65, alpha=.5 )
    plt.arrow( x=i, y=serie[0], dx=0, dy=serie[-1]-serie[0], color=colors[i], 
              linewidth=2, alpha=1, head_width=.3, head_length=.01 )
    plt.plot( i, goals[i], '.', mfc=colors[i], mec='w', markersize=12 )
    
plt.xlim(-1, len(mean_series))
plt.gca().set_xticks(range(len(mean_series)))
plt.gca().set_xticklabels(ids, rotation=90)
plt.gca().spines['top'].set_visible(False)
plt.gca().spines['right'].set_visible(False)
plt.ylabel('levels', fontsize=14)
plt.tight_layout()
plt.savefig(home+'/data/benchmark/integrated_in_template/viz_2.pdf')
plt.show()





# Visualization 3: doughnut of proportional progress
# (show only non-empty groups)

low_group = []
mid_group = []
high_group = []
null_group = []

for i, serie in enumerate(mean_series):
    if serie[0] > 0:
        proportional_progress = 100*(serie[-1]-serie[0])/serie[0]
        if proportional_progress <= 0:
            low_group.append( (ids[i], colors[i]) )
        elif 0 < proportional_progress <= 50:
            mid_group.append( (ids[i], colors[i]) )
        elif 50 < proportional_progress:
            high_group.append( (ids[i], colors[i]) )
    else:
        null_group.append( (ids[i], colors[i]) )

fig = plt.figure(figsize=(4.5,4.5))
ax = fig.add_subplot(111)
ax.axis('equal')
width = 0.3

cm = plt.get_cmap("tab20c")
cout = cm(np.arange(3)*4)
pie, texts, pcts = ax.pie([len(low_group), len(mid_group), len(high_group)], radius=1-width, startangle=90, counterclock=False,
                          colors=['lightgrey', 'grey', 'black'], autopct='%.0f%%', pctdistance=0.79)
plt.setp( pie, width=width, edgecolor='white')
plt.setp(pcts[0], color='black')
plt.setp(pcts[1], color='black')
plt.setp(pcts[2], color='white')
ax.legend(pie, ['more\nthan 50%', '0 to 50%', 'negative'],
          loc="center",
          bbox_to_anchor=(.25, .5, 0.5, .0),
          fontsize=8,
          frameon=False
          )

cin = [c[1] for c in high_group] + [c[1] for c in mid_group] + [c[1] for c in low_group]
labels = [c[0] for c in high_group] + [c[0] for c in mid_group] + [c[0] for c in low_group]
pie2, _ = ax.pie(np.ones(len(low_group)+len(mid_group)+len(high_group)), radius=1, 
                 colors=cin, labels=labels, rotatelabels=True, shadow=False, counterclock=False,
                 startangle=90, textprops=dict(va="center", ha='center', rotation_mode='anchor', fontsize=7, color='w'), 
                 labeldistance=.85)
plt.setp( pie2, width=width, edgecolor='none')
plt.tight_layout()
plt.savefig(home+'/data/benchmark/integrated_in_template/viz_3.pdf')
plt.show()







# Visualization 4: gap closure
# (show only non-empty groups)

low_group = []
mid_group = []
high_group = []
null_group = []

for i, serie in enumerate(mean_series):
    initial_gap = goals[i] - serie[0]
    if initial_gap > 0:
        final_gap = max(0, goals[i] - serie[-1])
        gap_closure = 100*(1 - final_gap/initial_gap)
        if gap_closure <= 25:
            low_group.append( (ids[i], colors[i]) )
        elif 25 < gap_closure <= 75:
            mid_group.append( (ids[i], colors[i]) )
        elif 75 < gap_closure:
            high_group.append( (ids[i], colors[i]) )
    else:
        null_group.append( (ids[i], colors[i]) )

fig = plt.figure(figsize=(4.5,4.5))
ax = fig.add_subplot(111)
ax.axis('equal')
width = 0.3

cm = plt.get_cmap("tab20c")
cout = cm(np.arange(3)*4)
pie, texts, pcts = ax.pie([len(low_group), len(mid_group), len(high_group)], radius=1-width, startangle=90, counterclock=False,
                          colors=['lightgrey', 'grey', 'black'], autopct='%.0f%%', pctdistance=0.79)
plt.setp( pie, width=width, edgecolor='white')
plt.setp(pcts[0], color='black')
plt.setp(pcts[1], color='black')
plt.setp(pcts[2], color='white')
ax.legend(pie, ['more\nthan 75%', '25 to 75%', '25% or less'],
          loc="center",
          bbox_to_anchor=(.25, .5, 0.5, .0),
          fontsize=8,
          frameon=False
          )

cin = [c[1] for c in high_group] + [c[1] for c in mid_group] + [c[1] for c in low_group]
labels = [c[0] for c in high_group] + [c[0] for c in mid_group] + [c[0] for c in low_group]
pie2, _ = ax.pie(np.ones(len(low_group)+len(mid_group)+len(high_group)), radius=1, 
                 colors=cin, labels=labels, rotatelabels=True, shadow=False, counterclock=False,
                 startangle=90, textprops=dict(va="center", ha='center', rotation_mode='anchor', fontsize=7, color='w'), 
                 labeldistance=.85)
plt.setp( pie2, width=width, edgecolor='none')
plt.tight_layout()
plt.savefig(home+'/data/benchmark/integrated_in_template/viz_4.pdf')
plt.show()











































