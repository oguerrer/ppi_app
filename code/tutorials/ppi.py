"""Policy Priority Inference Source Code

Authors: Omar A. Guerrero & Gonzalo Castañeda
Written in Pyhton 3.7


Example
-------



Rquired external libraries
--------------------------
- Numpy


"""

# import necessary libraries
from __future__ import division, print_function
import numpy as np
import warnings
warnings.simplefilter("ignore")


def run_ppi(I0, alphas, alphas_prime, betas, A=None, R=None, bs=None, qm=None, rl=None,
            Imax=None, Imin=None, Bs=None, B_dict=None, G=None, T=None, frontier=None):
    
    """Function to run one simulation of the Policy Priority Inference model.

    Parameters
    ----------
        I0: numpy array 
            Vector with initial values of the development indicators.
        alphas: numpy array
            Vector with parameters representing the size of a positive change 
            in the indicators.
        alphas_prime: numpy array
            Vector with parameters representing the size of a negative change 
            in the indicators.
        betas: numpy array
            Vector with parameters that normalize the contribution of public 
            expenditure and spillovers to the probability of a positive change
            in the indicators.
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
        Imax: numpy array (optional)
            Vector with the theoretical upper bound of the indicators. If an entry
            contains a missing value (NaN), then there is no upper bound defined
            for that indicator and it will grow indefinitely. If not provided,
            no indicator will have upper bound.
        Imin: numpy array (optional)
            Vector with the theoretical lower bound of the indicators. If an entry
            contains a missing value (NaN), then there is no lower bound defined
            for that indicator and it will decrease indefinitely. If not provided,
            no indicator will have lower bound.
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
        G: numpy array (optional)
            The development goals to be achieved for each indicator. These are
            used only to calculate the initial development gaps, which affect 
            the allocation decision of the government agent. If not provided,
            the default initial allocations are determined randomly.
        T: int (optional)
            The maximum number of simulation periods. If Bs is provided, then T
            is overwritten by the number of columns in Bs. If not provided, the
            default value in T=50.
        frontier: numpy array (optional)
            A vector with exogenous probabilities of positive growth for each
            indicator. If an entry contains NaN, then the corresponding
            probability is endogenous. This vector is typically use to perform
            analysis with the budgetary frontier, in which the proability of 
            success of the instrumental indicators is set to 1. Alternatively,
            the 'relaxed' frontier consists of imposing a high (but less than 1)
            probability of growth. If not provided, the default behavior is that
            all the probabilities of success are endogenous. It is recommended
            to not provide this parameter unless the user understants the
            budgetary frontier frontier analysis.
            
        
    Returns
    -------
        tsI: 2D numpy array
            Matrix with the time series of the simulated indicators. Each row
            corresponds to an indicator and each column to a simulation step.
        tsC: 2D numpy array
            Matrix with the time series of the simulated contributions. Each row
            corresponds to an indicator and each column to a simulation step.
        tsF: 2D numpy array
            Matrix with the time series of the simulated benefits. Each row
            corresponds to an indicator and each column to a simulation step.
        tsP: 2D numpy array
            Matrix with the time series of the simulated allocations. Each row
            corresponds to an indicator and each column to a simulation step.
        tsS: 2D numpy array
            Matrix with the time series of the simulated spillovers. Each row
            corresponds to an indicator and each column to a simulation step.
        tsG: 2D numpy array
            Matrix with the time series of the simulated growth proabilities. 
            Each row corresponds to an indicator and each column to a simulation step.
    """
    
    
    
    
    ## SET DEFAULT PARAMETERS & CHECK INPUT INTEGRITY 
    
    # Number of indicators
    assert np.sum(np.isnan(I0)) == 0, 'I0 should not contain missing values'
    N = len(I0) 
    
    # Structural factors
    assert np.sum(np.isnan(alphas)) == 0, 'alphas should not contain missing values'
    assert len(alphas) == N, 'alphas should have the same size as I0'
    assert np.sum(np.isnan(alphas_prime)) == 0, 'alphas_prime should not contain missing values'
    assert len(alphas_prime) == N, 'alphas_prime should have the same size as I0'
    
    # Normalizing factors
    assert np.sum(np.isnan(betas)) == 0, 'betas should not contain missing values'
    assert len(alphas) == N, 'betas should have the same size as I0'
    
    # Spillover network
    if A is None:
        A = np.zeros((N,N))
    else:
        assert np.sum(np.isnan(A)) == 0, 'A should not contain missing values'
        assert len(A.shape) == 2 and A.shape[0] == N and A.shape[1] == N, 'A should have as many rows and columns as the number of indicators'
        A = A.copy()
        np.fill_diagonal(A, 0) # make sure there are no self-loops
    
    # Instrumental indicators
    if R is None:
        R = np.ones(N).astype(bool)
    else:
        R[R!=1] = 0
        R = R.astype(bool)
        assert np.sum(R) > 0, 'R needs at least one entry with value 1'
        assert len(R) == N, 'R should have the same size as I0'
    
    # Number of instrumental indicators
    n = int(R.sum())
        
    # Modulating factors
    if bs is None:
        bs = np.ones(n)
    else:
        assert np.sum(np.isnan(bs)) == 0, 'bs should not contain missing values'
        assert len(bs) == n, 'bs should have the same size as the number of ones in R'
        
    if T is None:
        T = 50
        
    # Quality of monitoring
    if qm is None:
        qm = np.ones(n)*.5
    elif type(qm) is np.ndarray:
        assert np.sum(np.isnan(qm)) == 0, 'qm should not contain missing values'
        assert len(qm) == n, 'qm should have the same size as the number of ones in R'
        
    # Quality of the rule of law
    if rl is None:
        rl = np.ones(n)*.5
    elif type(rl) is np.ndarray:
        assert np.sum(np.isnan(rl)) == 0, 'rl should not contain missing values'
        assert len(rl) == n, 'rl should have the same size as the number of ones in R'
        
    # Theoretical upper bounds
    if Imax is not None:
        assert len(Imax) == N, 'Imax should have the same size as I0'
        if np.sum(~np.isnan(Imax)) > 0:
            assert np.sum(Imax[~np.isnan(Imax)] < I0[~np.isnan(Imax)]) == 0, 'All entries in Imax should be greater than I0'

    # Theoretical lower bounds
    if Imin is not None:
        assert len(Imin) == N, 'Imin should have the same size as I0'
        if np.sum(~np.isnan(Imin)) > 0:
            assert np.sum(Imin[~np.isnan(Imin)] < I0[~np.isnan(Imin)]) == 0, 'All entries in Imin should be lower than I0'


    # Payment schedule
    if Bs is None:
        Bs = np.array([np.ones(T)*100])
        B_dict = dict([(i,[0]) for i in range(N) if R[i]])
    elif type(Bs) is np.ndarray and len(Bs.shape) == 1:
        Bs = np.array([Bs])
        B_dict = dict([(i,[0]) for i in range(N) if R[i]])
        T = Bs.shape[1]
    elif type(Bs) is float or type(Bs) is np.float64:
        Bs = np.array([np.ones(T)*Bs])
        B_dict = dict([(i,[0]) for i in range(N) if R[i]])
    else:
        T = Bs.shape[1]
    
    assert np.sum(np.isnan(Bs)) == 0, 'Bs should not contain missing values'
    
    
    # Dictionary linking indicators to expenditure programs
    assert B_dict is not None, 'If you provide Bs, you must provide B_dict as well'
    assert len(B_dict) == n, 'The number of keys in B_dict should be the same as the number of ones in R'
    assert np.sum(np.in1d(np.array(list(B_dict.keys())), np.arange(N))) == n, 'The keys in B_dict must match the indices of the entries in R that contain ones'
    assert sum([type(val) is list for val in B_dict.values()]) == n, 'Every value in B_dict dictionary must be a list'
    assert sum([True for i in range(N) if R[i] and i not in B_dict]) == 0, 'Every key in B_dict must be mapped into a non-empty list'
    assert sum([True for i in B_dict.keys() if not R[i]]) == 0, 'The keys in B_dict must match the indices of the entries in R that contain ones'
    
    # Create reverse disctionary linking expenditure programs to indicators
    programs = sorted(np.unique([item for sublist in B_dict.values() for item in sublist]).tolist())
    program2indis = dict([(program, []) for program in programs])
    sorted_programs = sorted(program2indis.keys())
    for indi, programs in B_dict.items():
        for program in programs:
            if R[indi]:
                program2indis[program].append( indi )
    inst2idx = np.ones(N)*np.nan
    inst2idx[R] = np.arange(n)
    
    # Create initial allocation profile
    if G is not None:
        gaps = G-I0
        gaps[G<I0] = 0
        p0 = gaps/gaps.sum()
        P0 = np.zeros(n)
    else:
        P0 = np.zeros(n)
        p0 = np.random.rand(n)
    i=0
    for program in sorted_programs:
        indis = program2indis[program]
        relevant_indis = inst2idx[indis].astype(int)
        P0[relevant_indis] += Bs[i,0]*p0[relevant_indis]/p0[relevant_indis].sum()
        i+=1
    
    # Prevent null allocations
    P0 = Bs[:,0].sum()*P0/P0.sum()
    Bs[Bs==0] = 10e-12
    P0[P0==0] = 10e-12
    
    
    
    ## INSTANTIATE ALL VARIABLES AND CREATE CONTAINERS TO STORE DATA
        
    P = P0.copy() # first applocation
    F = np.random.rand(n) # policymakers' benefits
    Ft = np.random.rand(n) # lagged benefits
    X = np.random.rand(n)-.5 # policymakers' actions
    Xt = np.random.rand(n)-.5 # lagged actions
    H = np.ones(n) # cumulative spotted inefficiencies
    HC = np.ones(n) # number of times spotted so far
    signt = np.sign(np.random.rand(n)-.5) # direction of previous actions
    changeFt = np.random.rand(n)-.5 # change in benefits
    C = np.random.rand(n)*P # contributions
    I = I0.copy() # initial levels of the indicators
    It = np.random.rand(N) # lagged indicators

    tsI = [] # stores time series of indicators
    tsC = [] # stores time series of contributions
    tsF = [] # stores time series of benefits
    tsP = [] # stores time series of allocations
    tsS = [] # stores time series of spillovers
    tsG = [] # stores time series of gammas
    
    
    
    ## MAIN LOOP
    for t in range(T):
        
        tsI.append(I.copy()) # store this period's indicators
        tsP.append(P.copy()) # store this period's allocations


        ### REGISTER INDICATOR CHANGES ###
        deltaBin = (I>It).astype(int) # binary for computing spillovers
        deltaIIns = (I[R]-It[R]).copy() # instrumental indicators' changes
        if np.sum(np.abs(deltaIIns)) > 0: # relative change of instrumental indicators
            deltaIIns = deltaIIns/np.sum(np.abs(deltaIIns))
        

        ### DETERMINE CONTRIBUTIONS ###
        changeF = F - Ft # change in benefits
        changeX = X - Xt # change in actions
        sign = np.sign(changeF*changeX) # direction of the next action
        changeF[changeF==0] = changeFt[changeF==0] # if the benefit did not change, keep the last change
        sign[sign==0] = signt[sign==0] # if the sign is undefined, keep the last one
        Xt = X.copy() # update lagged actions
        X = X + sign*np.abs(changeF) # determine current action
        assert np.sum(np.isnan(X)) == 0, 'X has invalid values!'
        C = P/(1 + np.exp(-X)) # map action into contribution
        assert np.sum(np.isnan(C)) == 0, 'C has invalid values!'
        assert np.sum(P < C)==0, 'C cannt be larger than P!'
        signt = sign.copy() # update previous signs
        changeFt = changeF.copy() # update previous changes in benefits
        
        tsC.append(C.copy()) # store this period's contributions
        tsF.append(F.copy()) # store this period's benefits
                
        
        ### DETERMINE BENEFITS ###
        if type(qm) is int or type(qm) is np.int64: # if the quality of monitoring is endogenous
            trial = (np.random.rand(n) < (I[qm]/1) * P/P.max() * (P-C)/P) # monitoring outcomes
        else: # if the quality of monitoring is exogenous
            trial = (np.random.rand(n) < qm * P/P.max() * (P-C)/P) # monitoring outcomes
        theta = trial.astype(float) # indicator function of uncovering inefficiencies
        H[theta==1] += (P[theta==1] - C[theta==1])/P[theta==1] # cumulative inefficiencies spotted
        HC[theta==1] += 1 # number of times spotted so far being inefficient
        if type(rl) is int or type(rl) is np.int64: # if the quality of the rule of law is endogenous
            newF = deltaIIns*C/P + (1-theta*(I[rl]/1))*(P-C)/P # compute benefits
        else: # if the quality of the rule of law is exogenous
            newF = deltaIIns*C/P + (1-theta*rl)*(P-C)/P # compute benefits
        Ft = F.copy() # update lagged benefits
        F = newF # update benefits
        assert np.sum(np.isnan(F)) == 0, 'F has invalid values!'
        
        
        ### DETERMINE INDICATORS ###
        deltaM = np.array([deltaBin,]*len(deltaBin)).T # reshape deltaIAbs into a matrix
        S = np.sum(deltaM*A, axis=0) # compute spillovers
        assert np.sum(np.isnan(S)) == 0, 'S has invalid values!'
        tsS.append(S) # store spillovers
        cnorm = np.zeros(N) # initialize a zero-vector to store the normalized contributions
        cnorm[R] = C # compute contributions only for instrumental nodes
        gammas = ( betas*(cnorm + C.sum()/(P.sum()+1)) )/( 1 + np.exp(-S) ) # compute probability of succesful growth
        assert np.sum(np.isnan(gammas)) == 0, 'some gammas have invalid values!'
        assert np.sum(gammas==0) == 0, 'some gammas have zero value!'
        
        if frontier is not None: # if the user wants to perform frontier analysis
            gammas = frontier
            
        tsG.append(gammas) # store gammas
        success = (np.random.rand(N) < gammas) # determine if there is succesful growth
        newI = I.copy() # compute potential new values
        newI[success] = I[success] + alphas[success] # update growing indicators
        newI[~success] = I[~success] - alphas_prime[~success] # update decreasing indicators
        
        # if theoretical maximums are provided, make sure the indicators do not surpass them
        if Imax is not None:
            with_bound = ~np.isnan(Imax)
            newI[with_bound & (newI[with_bound] > Imax[with_bound])] = Imax[with_bound & (newI[with_bound] > Imax[with_bound])]
            assert np.sum(newI[with_bound] > Imax[with_bound])==0, 'some indicators have surpassed their theoretical upper bound!'
        
        # if theoretical minimums are provided, make sure the indicators do not become lower than them
        if Imin is not None:
            with_bound = ~np.isnan(Imin)
            newI[with_bound & (newI[with_bound] < Imin[with_bound])] = Imin[with_bound & (newI[with_bound] < Imin[with_bound])]
            assert np.sum(newI[with_bound] < Imin[with_bound])==0, 'some indicators have surpassed their theoretical lower bound!'
                        
        # if governance parameters are endogenous, make sure they are not larger than 1
        if (type(qm) is int or type(qm) is np.int64) and newI[qm] > 1:
            newI[qm] = 1
        
        if (type(rl) is int or type(rl) is np.int64) and newI[rl] > 1:
            newI[rl] = 1
            
        # if governance parameters are endogenous, make sure they are not smaller than 0
        if (type(qm) is int or type(qm) is np.int64) and newI[qm] < 0:
            newI[qm] = 0
        
        if (type(rl) is int or type(rl) is np.int64) and newI[rl] < 0:
            newI[rl] = 0
            
        It = I.copy() # update lagged indicators
        I =  newI.copy() # update indicators
        
        
        ### DETERMINE ALLOCATION PROFILE ###
        P0 += np.random.rand(n)*H/HC # interaction between random term and inefficiancy history
        assert np.sum(np.isnan(P0)) == 0, 'P0 has invalid values!'
        assert np.sum(P0==0) == 0, 'P0 has a zero value!'
        
        P = np.zeros(n)
        # iterate over the expenditure programs
        for i, program in enumerate(sorted_programs):
            indis = program2indis[program]
            relevant_indis = inst2idx[indis].astype(int)
            q = P0[relevant_indis]/P0[relevant_indis].sum() # compute expenditure propensities
            assert np.sum(np.isnan(q)) == 0, 'q has invalid values!'
            assert np.sum(q == 0 ) == 0, 'q has zero values!'
            qs_hat = q**bs[relevant_indis] # modulate expenditure propensities
            P[relevant_indis] += Bs[i,t]*qs_hat/qs_hat.sum()
            
        # optional assertion that checks for consistency between the total budget and the sum of the allocations
        # assert abs(P.sum() - Bs[:,t].sum()) < 1e-6, 'unequal budgets ' + str(abs(P.sum() - Bs[:,t].sum()))
        
        assert np.sum(np.isnan(P)) == 0, 'P has invalid values!'
        assert np.sum(P==0) == 0, 'P has zero values!'

    # turn time series into numpy matrices and return them
    return np.array(tsI).T, np.array(tsC).T, np.array(tsF).T, np.array(tsP).T, np.array(tsS).T, np.array(tsG).T



    







































