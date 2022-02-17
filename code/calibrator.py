"""Policy Priority Inference Calibrator

Authors: Omar A. Guerrero & Gonzalo Castañeda
Written in Pyhton 3.7


Example
-------



Rquired external libraries
--------------------------
- Numpy
- Joblib (for optional parallel computing)

"""

import os, warnings
import numpy as np
from joblib import Parallel, delayed

warnings.simplefilter("ignore")

home =  os.getcwd()


os.chdir(home)
import ppi






## Computes a set of Monte Carlo simulations of PPI, obtains their average statistics, 
## and computes the error with respect to IF and success_rates. Called by the calibrate function.
def compute_error(I0, alphas, alphas_prime, betas, A, R, qm, rl, Bs, B_dict, T, 
                  IF, success_rates, parallel_processes, sample_size):
    if parallel_processes is None:
        sols = np.array([ppi.run_ppi(I0=I0, alphas=alphas, alphas_prime=alphas_prime, 
                          betas=betas, A=A, R=R, qm=qm, rl=rl,
                          Bs=Bs, B_dict=B_dict, T=T) for itera in range(sample_size)])
    else:
        sols = np.array(Parallel(n_jobs=parallel_processes, verbose=0)(delayed(ppi.run_ppi)\
                (I0=I0, alphas=alphas, alphas_prime=alphas_prime, betas=betas, 
                 A=A, R=R, qm=qm, rl=rl, Bs=Bs, B_dict=B_dict, T=T) for itera in range(sample_size)))
        
    tsI, tsC, tsF, tsP, tsS, tsG = zip(*sols)
    I_hat = np.mean(tsI, axis=0)[:,-1]
    gamma_hat = np.mean(tsG, axis=0).mean(axis=1)
    error_alpha = IF - I_hat
    error_beta = success_rates - gamma_hat
    return np.array(error_alpha.tolist() + error_beta.tolist())



## Calibrates PPI automatically and return a Pandas DataFrame with the parameters, errors, and goodness of fit
def calibrate(I0, IF, success_rates, A=None, R=None, qm=None, rl=None,  Bs=None, B_dict=None, 
              T=None, threshold=.8, parallel_processes=None, 
              verbose=False, low_precision_counts=101, increment=1000):

    """Function to calibrate PPI.

    Parameters
    ----------
        I0: numpy array 
            Vector with initial values of the development indicators. These are
            the initial conditions for the indicators in the simulations.
        IF: numpy array 
            Vector with final values of the development indicators. These are
            used to compute one type of error: whether the simulated values
            end at the same levels as the empirical ones.
        success_rates: numpy array 
            Vector with the rate of growth of the development indicators.
            A growth rate, for an indicator, is the number of times a posivite 
            change was observed, divided by the the total number of changes 
            (which should be the number of periods in the time series minus one).
            These rates must be greater than zero and less or equal to 1.
            If an indicator does not show positive changes, it is suggested
            to assign a rate close to zero. If success_rates contains values 
            that are zero (or less) or ones, they will be automatically replaced
            by 0.01 and 1.0 respectively.
            This input is used to compute another type of error: whether the 
            endogenous probability of success of each indicator matches the 
            empirical rate of positive changes.
        A:  2D numpy array (optional)
            The adjacency matrix of the spillover network of development 
            indicators. The rows denote the origins of spillovers and the columns
            their destinations. Self-loops are not allowed, so PPI turns A's
            diagonal into zeros. If not provided, the default value is a matrix 
            full of zeros.
        R:  numpy array (optional)
            Vector that specifies whether an indicator is instrumental
            or collateral. Instrumental indicators have value 1 and collateral
            ones have zero. If not provided, the default value is
            a vector of ones.
        bs: numpy array (optional)
            Vector with modulating factors for the budgetary allocation of
            each instrumental indicator. Its size should be equal to the number
            of instrumental indicators. If not provided, the default value is
            a vector of ones.
        qm: A floating point, an integer, or a numpy array (optional)
            Vector with parametrs capturing the quality of the monitoring 
            mechanisms that procure public governance. There are three options
            to specify qm:
                - A floating: it assumes that the quality of monitoring is qm,
                that it is the same for every indicator, that it is exogenous, 
                and that it remains constant through time. In this case, qm 
                should have a value between 0 and 1.
                - An integer: it assumes that the quality of monitoring is one 
                of the indicators, so qm gives the index in I0 where this indicator
                is located. Here, the quality of monitoring is endogenous, 
                dynamic, and homogenous across the indicators.
                - A vector: it assumes that the quality of monitoring is
                heterogeneous across indicators, exogenous, and constant. Thus,
                qm has to have a size equal to the number of instrumental
                indicators. Each entry in qm denotes the quality of monitoring
                in a particular policy issue (indicator).
            If not provided, the default values is qm=0.5.
        rl: A floating point, an integer, or a numpy array (optional)
            Vector with parametrs capturing the quality of the rule of law. 
            There are three options to specify rl:
                - A floating: it assumes that the quality of the rule of law  is rl,
                that it is the same for every indicator, that it is exogenous, 
                and that it remains constant through time. In this case, rl 
                should have a value between 0 and 1.
                - An integer: it assumes that the quality of the rule of law is one 
                of the indicators, so rl gives the index in I0 where this indicator
                is located. Here, the quality of the rule of law is endogenous, 
                dynamic, and homogenous across the indicators.
                - A vector: it assumes that the quality of the rule of law is
                heterogeneous across indicators, exogenous, and constant. Thus,
                rl has to have a size equal to the number of instrumental
                indicators. Each entry in rl denotes the quality of monitoring
                in a particular policy issue (indicator).
            If not provided, the default values is rl=0.5.
        Bs: numpy ndarray or floating point (optional)
            Disbursement schedule across expenditure programs. There are three 
            options to specify Bs:
                - A matrix: this is a disaggregated specification of the 
                disbursement schedule across expenditure programs and time. 
                The rows correspond to expenditure programs and the columns
                to simulation periods. Since there may be more or less expenditure 
                programs than indicators, the number of rows in Bs should be
                consistent with the information contained in parameter B_dict,
                otherwise PPI will throw and exception. Since the number of 
                columns denotes the number of simulation periods, parameter T
                will be overriden.
                - A vector: this would be equivalent to a matrix with a single
                row, i.e. to having a single expenditure program. This representation
                is useful when there is no information available across programs,
                but there is across time. Like in the matrix representation, 
                this input should be consistent with B_dict.
                - A floating point: this assumes there is no information about
                expenditure across programs nor time. In this case, PPI uses
                the amount provided for every simulated period, as in the case
                of the vector specification. Since here, there is no temporal 
                information about the disbursement schedule, the number of 
                simulated periods is given by parameter T.
            If not provided, the default value is Bs=100.
        B_dict: dictionary (optional)
            A dictionary that maps the indices of every indicator into the 
            expenditure program(s) designed to impact them. Since there may be
            multiple programs designed to impact and indicator, or multiple
            indicators impacted by the same program, this mapping is not 
            one to one. To account for this, B_dict has, as keys, the indices 
            of the instrumental indicators and, as values, lists containing
            the indices of the expenditure programs designed to impact them.
            The user should make sure that the keys are consistent with the 
            indices of those indicators that are instrumental. Likewise, the
            indices of the expenditure programs should be consistent with the
            number of rows in Bs, otherwise PPI will throw an exception.
            Providing B_dict is necessary if Bs is a matrix with more than one 
            row.
        T: int (optional)
            The maximum number of simulation periods. If Bs is provided, then T
            is overwritten by the number of columns in Bs. If not provided, the
            default value in T=50.
        threshold: float (optional)
            The goodness-of-fit threshold to stop the calibration routine. This
            consists of the worst goodness-of-fit metric (across indicators) that
            the user would like to obtain. The best possible metric is 1, but it
            is impossible to achieve due to the model's stochasticity. Higher
            thresholds demand more computing because more simulations are 
            necessary in order to achieve high precision. If not provided,
            the default value is 0.8.
        parallel_processes: integer (optional)
            The number of processes to be run in parallel. Each process carries
            a work load of multiple Monte Carlo simulations of PPI. Parallel
            processing is optional. If not provided, the Monte Carlo simulations
            are run in a serial fashion.
        verbose: boolean (optional)
            Whether to print the calibration progress. If not provided, the
            default value is False.
        low_precision_counts: integer (optional)
            Hyperparameter of how many low-precision iterations will be run.
            Low precision means that only 10 Monte Carlo simulations are performed
            in each iteration/evaluation. Once low_precision_counts has been met,
            the number of Monte Carlo simulations increases in each iteration
            by the amount specified in the hyperparameter: increment. If not
            provided, the default value is 100.
        increment: integer (optional)
            Hyperparameter that sets the number of Montecarlo Simulations to
            increase with each iteration, once low_precision_counts has been
            reached. If not provided, the default value is 1000.
        
    Returns
    -------
        output: 2D numpy array
            A matrix with the calibration results, organized in the following 
            columns (the matrix includes the column titles):
                - alpha: The structural parameter of each indicator associated
                    with positive changes.
                - alpha_prime: The structural parameter of each indicator associated
                    with negative changes.
                - beta: The normalizing constant of each parameter that helps 
                    mapping the expenditure and spillovers into a probability.
                - T: The number of simulation periods to be run in each simulation.
                    It only appears in the first row of the column, while the 
                    rest remain empty.
                - error_alpha: The indicator-specific error related to the 
                    final value.
                - error_beta: The indicator-specific error related to the 
                    rate of positive changes.
                - GoF_alpha: The indicator-specific goodness-of-fit metric 
                    related to the final value.
                - GoF_beta: The indicator-specific goodness-of-fit metric 
                    related to the rate of positive changes.
    """
    
    
    
    # Check data integrity
    success_rates[success_rates<=0] = 0.01
    success_rates[success_rates>1] = 1.0
    assert threshold < 1, 'the threshold must be lower than 1'
    assert len(I0) == len(IF), 'I0 and IF must have the same size'
    
    # Initialize hyperparameters and containers
    N = len(I0)
    params = np.ones(3*N)*.5 # vector containing all the parameters that need calibration
    sample_size = 10
    counter = 0
    GoF_alpha = np.zeros(N)
    GoF_beta = np.zeros(N)
    
    # Main iteration of the calibration
    # Iterates until the minimum threshold criterion has been met, and at least 100 iterations have taken place
    while np.sum(GoF_alpha<threshold) > 0 or np.sum(GoF_beta<threshold) > 0 or counter < low_precision_counts:

        counter += 1 # Makes sure at least 100 iteartions are performed
        
        # unpack the parameter vector into 3 vectors that correspond to the different parameter types
        alphas = params[0:N] 
        alphas_prime = params[N:2*N]
        betas = params[2*N::]
    
        # compute the errors for the specified parameter vector
        errors_all = compute_error(I0=I0, alphas=alphas, alphas_prime=alphas_prime, betas=betas, A=A, 
                                        R=R, qm=qm, rl=rl, Bs=Bs, B_dict=B_dict, 
                                        T=T, IF=IF, success_rates=success_rates, 
                                        parallel_processes=parallel_processes, 
                                        sample_size=sample_size)
        
        # unpack the error vector
        errors_alpha = errors_all[0:N]
        errors_beta = errors_all[N::]
        
        # normalize the errors
        abs_errors_alpha = np.abs(errors_alpha)
        gaps = IF-I0
        normed_errors_alpha = abs_errors_alpha/np.abs(gaps)
        abs_normed_errors_alpha = np.abs(normed_errors_alpha)
        abs_errors_beta = np.abs(errors_beta)
        normed_errors_beta = abs_errors_beta/success_rates
        abs_normed_errrors_beta = np.abs(normed_errors_beta)
        
        # apply the gradient descent and update the parameters
        params[0:N][(errors_alpha<0) & (IF>I0)] *= np.clip(1-abs_normed_errors_alpha[(errors_alpha<0) & (IF>I0)], .25, .99)
        params[0:N][(errors_alpha>0) & (IF>I0)] *= np.clip(1+abs_normed_errors_alpha[(errors_alpha>0) & (IF>I0)], 1.01, 1.5)
        params[N:2*N][(errors_alpha<0) & (IF>I0)] *= np.clip(1+abs_normed_errors_alpha[(errors_alpha<0) & (IF>I0)], 1.01, 1.5)
        params[N:2*N][(errors_alpha>0) & (IF>I0)] *= np.clip(1-abs_normed_errors_alpha[(errors_alpha>0) & (IF>I0)], .25, .99)
        params[0:N][(errors_alpha>0) & (IF<I0)] *= np.clip(1+abs_normed_errors_alpha[(errors_alpha>0) & (IF<I0)], 1.01, 1.5)
        params[0:N][(errors_alpha<0) & (IF<I0)] *= np.clip(1-abs_normed_errors_alpha[(errors_alpha<0) & (IF<I0)], .25, .99)
        params[N:2*N][(errors_alpha>0) & (IF<I0)] *= np.clip(1-abs_normed_errors_alpha[(errors_alpha>0) & (IF<I0)], .25, .99)
        params[N:2*N][(errors_alpha<0) & (IF<I0)] *= np.clip(1+abs_normed_errors_alpha[(errors_alpha<0) & (IF<I0)], 1.01, 1.5)
        params[2*N::][errors_beta<0] *= np.clip(1-abs_normed_errrors_beta[errors_beta<0], .25, .99)
        params[2*N::][errors_beta>0] *= np.clip(1+abs_normed_errrors_beta[errors_beta>0], 1.01, 1.5)
        
        # compute the goodness of fit
        GoF_alpha = 1 - normed_errors_alpha
        GoF_beta = 1 - abs_normed_errrors_beta
        
        # check low_precision_counts iterations have been reached
        # after low_precision_counts iterations, increase the number of Monte Carlo simulations by
        # 1000 in every iterations in order to achieve higher precision and 
        # minimize the error more effectively
        if counter >= low_precision_counts:
            sample_size += increment
            
        # prints the calibration iteration and the worst goodness-of-fit metric
        if verbose:
            print( 'Iteration:', counter, '.    Worst goodness of fit:', np.min(GoF_alpha.tolist()+GoF_beta.tolist()) )
    
    # save the last parameter vector and de associated errors and goodness-of-fit metrics
    output = np.array([['alpha', 'alpha_prime', 'beta', 'T', 'error_alpha', 
            'error_beta', 'GoF_alpha', 'GoF_beta']] + [[alphas[i], alphas_prime[i], betas[i], T, 
            errors_alpha[i], errors_beta[i], GoF_alpha[i], GoF_beta[i]] \
            if i==0 else [alphas[i], alphas_prime[i], betas[i], 
             np.nan, errors_alpha[i], errors_beta[i], 
             GoF_alpha[i], GoF_beta[i]] \
            for i in range(N)])
        
    return output
    






























