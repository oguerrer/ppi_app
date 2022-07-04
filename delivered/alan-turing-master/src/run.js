/* var nj = require('numjs');
require("./numjs_additions");
var {assert, isNumeric} = require('./helpers/utils')


function get_values(N){
    rand_override = nj.array([].concat(...Array(12).fill([0.08066209,0.98050315,0.91849969,0.36335001,
                                    0.41457828,0.39910388,0.72283495,0.43502483,0.15210684,0.37843666])))
    return rand_override.slice([N])
}


function ppi(I0, alphas, alphas_prime, betas, A = null, R = null, bs = null, qm = null, rl = null,
    Imax = null, Imin = null, Bs = null, B_dict = null, G = null, T = null, frontier = null, test=false, for_calibrate=false) {

    // ## SET DEFAULT PARAMETERS & CHECK INPUT INTEGRITY

    // # Number of indicators
    const N = I0.length

    // # Spillover network
    if (A == null) {
        A = nj.zeros([N,N])
    } else {
        A = A
    }

    // # Instrumental indicators
    if (R == null) {
        R = nj.ones(N).tolist()
    } else {
        R = R.map(item => item != 1 ? 0 : item);
    }

    // # Number of instrumental indicators
    const n = parseInt(nj.sum(R))

    // # Modulating factors
    if (bs == null) {
        var bs = nj.ones(n).tolist()
    } else {
        assert(nj.sum(bs.map(i => isNaN(i))) == 0, 'bs should not contain missing values')
        assert(bs.length == n, 'bs should have the same size as the number of ones in R')
    }

    // # Quality of monitoring
    if (qm == null) {
        qm = nj.ones(n).multiply(0.5).tolist()
    } else if (qm.constructor.name === 'Array') {
        qm = Object.keys(R).map(i => R[i] == 1 ? qm[i] : R[i])
        qm = qm.map(item => isNaN(item) ? .5 : item )
    }

    // # Quality of the rule of law
    if (rl == null) {
        rl = nj.ones(n).multiply(0.5).tolist()
    } else if (rl.constructor.name === 'Array') {
        rl = Object.keys(R).map(i => R[i] == 1 ? rl[i] : R[i])
        rl = rl.map(item => isNaN(item) ? .5 : item)
    }

    // # Theoretical upper bounds
    if (Imax != null) {
        if (nj.sum(Imax.map(i => !isNaN(i)? 1 : 0)) > 0) {
            assert(nj.sum(Object.keys(Imax).map(i => !isNaN(Imax[i]) && Imax[i] < I0[i])) == 0, 'All entries in Imax should be greater than I0')
        }
    }

    // # Theoretical lower bounds
    if (Imin != null) {
        if (nj.sum(Imin.map(i => !isNaN(i)? 1 : 0)) > 0) {
            assert(nj.sum(Object.keys(Imin).map(i => !isNaN(Imin[i]) && Imin[i] > I0[i])) == 0, 'All entries in Imin should be lower than I0')
        }
    }

    // # Payment schedule
    if (T == null || (!test && for_calibrate)) {
        T=50
    }
    if (Bs == null) {
        Bs = nj.array(nj.ones(T).multiply(100).reshape(1,T))
        B_dict = {};
        [...Array(R.length).keys()].filter(r => R[r] == 1).map(i => B_dict[i] = [0])
    } else {
        Bs = Bs.map(i => nj.ones(T).multiply(i))
    }

    // # Dictionary linking indicators to expenditure programs
    assert(!(B_dict == null), 'If you provide Bs, you must provide B_dict as well')

    // # Create reverse disctionary linking expenditure programs to indicators
    let set_values = new Set();
    let programs = [];

    Array.from(Object.values(B_dict)?.map(i => i?.map(v => set_values.add(v))))
    set_values.forEach(i => programs.push(i))

    var program2indis = {};
    [...Array(programs.length).keys()].map(i => program2indis[i] = [])

    let sorted_programs = programs.sort(function(a, b){return a-b})

    Object.entries(B_dict).forEach(([indi, list_programs]) => {
        list_programs.forEach(value => {
            program2indis[value].push(Number(indi))
        })
    })

    var cont = -1
    var inst2idx = nj.array(Object.keys(R).map(i => R[i] != 1 ? NaN : cont += 1))

    // # Create initial allocation profile
    if (G != null) {
        var gaps = Object.keys(G).map(i => G[i] - I0[i])
        gaps = gaps.map(item => item < 0 ? 0 : item)
        var sum_gaps = nj.sum(gaps)
        var p0 = gaps.map(i => i/sum_gaps)
        var P0_budget = nj.zeros(n).tolist()
    } else {
        var P0_budget = nj.zeros(n).tolist()
        var p0 = !test ? nj.random(n).tolist() : get_values(n).tolist()
    }

    l = 0

    Object.values(sorted_programs).map(s => {
        var indis = program2indis[s]
        var relevant_indis = Object.values(indis).map(p => inst2idx.get(p))
        var temp_sum_p0 = nj.sum(relevant_indis.map(i => p0[i]))
        Object.values(relevant_indis).map(i => {
            P0_budget[i] += Bs[s].get(0, l) * p0[i] / temp_sum_p0
        })
        l += 1

    })

    // # Prevent null allocations
    let temp_sum_Bs = nj.sum(Object.values(Bs).map(i => i.get(0,0)))
    var temp_sum_P0_budget = nj.sum(P0_budget)
    P0_budget = P0_budget.map(i => temp_sum_Bs*i/temp_sum_P0_budget)
    Bs = Object.values(Bs).map(item => item == 0 ? 10e-12 : item)
    P0_budget = Object.values(P0_budget).map(item => item == 0 ? 10e-12 : item)

    // ## INSTANTIATE ALL VARIABLES AND CREATE CONTAINERS TO STORE DATA
    var P = P0_budget.slice() // first applocation
    var H = nj.ones(n).tolist() // cumulative spotted inefficiencies
    var HC = nj.ones(n).tolist() // number of times spotted so far
    var I = I0.slice() // initial levels of the indicators
    if (!test){
        var F = nj.random(n).tolist() // policymakers' benefits
        var Ft = nj.random(n).tolist() // lagged benefits
        var X = nj.random(n).subtract(.5).tolist() // policymakers' actions
        var Xt = nj.random(n).subtract(.5).tolist() // lagged actions
        var signt = nj.random(n).subtract(.5).tolist().map(i => Math.sign(i)) // direction of previous actions
        var changeFt = nj.random(n).subtract(.5).tolist() // change in benefits
        var C = [...Array(n).keys()].map(i => nj.random(1).get(0)*P[i]) // contributions
        var It = nj.random(N).tolist() // lagged indicators
    } else {
        var F = get_values(n).tolist() // policymakers' benefits
        var Ft = get_values(n).tolist() // lagged benefits
        var X = get_values(n).subtract(.5).tolist() // policymakers' actions
        var Xt = get_values(n).subtract(.5).tolist() // lagged actions
        var signt = get_values(n).subtract(.5).tolist().map(i => Math.sign(i)) // direction of previous actions
        var changeFt = get_values(n).subtract(.5).tolist() // change in benefits
        temp_for_C = get_values(n).tolist()
        var C = [...Array(n).keys()].map(i => temp_for_C[i]*P[i]) // contributions
        var It = get_values(N).tolist() // lagged indicators
    }


    var tsI = [] // stores time series of indicators
    var tsC = [] // stores time series of contributions
    var tsF = [] // stores time series of benefits
    var tsP = [] // stores time series of allocations
    var tsS = [] // stores time series of spillovers
    var tsG = [] // stores time series of gammas

    for (var t in Array.from({ length: T })) {
        t = Number(t)
        tsI.push(I.slice())
        tsP.push(P.slice())

        // ### REGISTER INDICATOR CHANGES ###

        deltaBin = Object.keys(I).map(i => I[i] > It[i] ? 1 : 0)
        deltaIIns = Object.keys(R).filter(v => R[v] == 1).map(r => I[r] - It[r]).slice() // instrumental indicators' changes

        let temp_abs_deltaIns = Object.values(deltaIIns).map(i => Math.abs(i))
        if (nj.sum(temp_abs_deltaIns) > 0) { // relative change of instrumental indicators
            let temp_sum_deltaIns = nj.sum(temp_abs_deltaIns)
            deltaIIns = Object.keys(deltaIIns).map(v => deltaIIns[v] / temp_sum_deltaIns)
        }

        // ### DETERMINE CONTRIBUTIONS ###

        changeF = [...Array(F.length).keys()].map(i => F[i] - Ft[i]) // change in benefits
        changeX = [...Array(X.length).keys()].map(i => X[i].toFixed(11) - Xt[i].toFixed(11)) // change in actions

        sign = [...Array(changeF.length).keys()].map(i => Math.sign(changeF[i] * changeX[i])) // direction of the next action
        Object.keys(changeF).filter(i => changeF[i] == 0).map(v => changeF[v] = changeFt[v]) // if the benefit did not change, keep the last change
        Object.keys(sign).filter(i => sign[i] == 0).map(v => sign[v] = signt[v]) // if the sign is undefined, keep the last one
        Xt = X.slice() // update lagged actions
        let temp_abs_changeF = Object.values(changeF).map(i => Math.abs(i))
        X = Object.keys(X).map(i => X[i] += sign[i] * temp_abs_changeF[i]) // determine current action
        assert(nj.sum(X.map(i => isNaN(i))) == 0, 'X has invalid values!')
        temp_X = nj.exp(nj.negative(X))
        C = Object.keys(P).map(i => P[i]/(1 +temp_X.get(i))) // map action into contribution
        assert(nj.sum(Object.entries(C).every(([_key, value]) => isNaN(value))) == 0, 'C has invalid values!')
        assert(nj.sum(Object.keys(C).map(i => P[i] < C[i])) == 0, 'C cannt be larger than P!')
        signt = sign.slice() // update previous signs
        changeFt = changeF.slice() // update previous changes in benefits

        tsC.push(C.slice()) // store this period's contributions
        tsF.push(F.slice()) // store this period's benefits

        // ### DETERMINE BENEFITS ###
        let temp_max_P = nj.max(P)
        if (isNumeric(qm)) {
            let temp_I_qm = Object.keys(qm).map(i => qm[i] != 0 && I[i])
            let temp_rand_qm = test ? get_values(n).tolist() : nj.random(n).tolist()
            trial = Object.keys(P).map(i => temp_rand_qm[i] < temp_I_qm[i]*P[i]/temp_max_P*(P[i]-C[i])/P[i])
        } else {
            let temp_rand_qm = test ? get_values(n).tolist() : nj.random(n).tolist()
            trial = Object.keys(P).map(i => temp_rand_qm[i] < qm[i]*(P[i]/temp_max_P)*(P[i]-C[i])/P[i])
        }
        theta = trial.slice()
        Object.keys(theta).filter(i => theta[i]==1).map(v => H[v]+=(P[v]-C[v])/P[v]) // cumulative inefficiencies spotted
        Object.keys(theta).filter(i => theta[i]==1).map(v => HC[v]+=1) // number of times spotted so far being inefficient
        if (isNumeric(rl)) {
            temp_I_rl = Object.keys(rl).map(i => rl[i] != 0 && I[i])
            newF = Object.keys(deltaIIns).map(i => deltaIIns[i] * C[i] / P[i] + (1 - theta[i] * temp_I_rl[i]) * (P[i] - C[i]) / P[i]) // compute benefits
        } else {
            newF = Object.keys(deltaIIns).map(i => deltaIIns[i] * C[i] / P[i] + (1 - theta[i] * rl[i]) * (P[i] - C[i]) / P[i]) // compute benefits
        }
        Ft = F.slice() // update lagged benefits
        F = newF // update benefits
        assert(nj.sum(F.map(i => isNaN(i))) == 0, 'F has invalid values!')

        // ### DETERMINE INDICATORS ###
        deltaM = Object.values(deltaBin).map(i => i == 1 ? nj.ones(deltaBin.length).tolist() : nj.zeros(deltaBin.length).tolist()) // reshape deltaIAbs into a matrix
        let temp_deltaM = nj.array(deltaM)
        let temp_multi = (temp_deltaM.multiply(A).T).tolist()
        S = Object.keys(deltaM).map(i => nj.sum(temp_multi[i])) // compute spillovers

        assert(nj.sum(S.map(i => isNaN(i))) == 0, 'S has invalid values!')
        tsS.push(S) // store spillovers
        cnorm = nj.zeros(N).tolist() // initialize a zero-vector to store the normalized contributions
        temp_index = 0
        Object.keys(R).map(j => {
            j = Number(j)
            if (R[j] == 1){
                cnorm[j]=C[j-temp_index]
            } else {
                cnorm[j]=0
                temp_index += 1
            }
        })  // compute contributions only for instrumental nodes
        let temp_sum_C = nj.sum(C)
        let temp_sum_P = nj.sum(P)
        let temP_exp_S = nj.exp(nj.negative(S)).add(1)
        gammas = Object.keys(cnorm).map(i => (betas[i] * (cnorm[i] + temp_sum_C / (temp_sum_P + 1))) / temP_exp_S.get(i)) // compute probability of succesful growth
        assert(nj.sum(gammas.map(i => isNaN(i))) == 0, 'some gammas have invalid values!')
        assert(nj.sum(gammas.map(i => i == 0)) == 0, 'some gammas have zero value!')

        if (frontier != null) { // if the user wants to perform frontier analysis
            gammas = frontier
        }

        tsG.push(gammas) // store gammas
        temp_success = test ? get_values(N).tolist() : nj.random(N).tolist()
        success = Object.keys(gammas).map(i => temp_success[i] < gammas[i]) // determine if there is succesful growth
        newI = I.slice() // compute potential new values
        Object.keys(success).map(i => success[i] == true ? newI[i] = I[i] + alphas[i] : newI[i] = I[i] - alphas_prime[i]) // update growing indicators & update decreasing indicators

        // # if theoretical maximums are provided, make sure the indicators do not surpass them
        if (Imax != null) {
            with_bound = Object.keys(Imax).map(i => !isNaN(Imax[i]) && Imax[i])
            var temp_comp_Imax = Object.keys(with_bound).map(j => with_bound[j] == 1 ? with_bound[j] && (newI[j] > Imax[j]) : 0)
            Object.keys(temp_comp_Imax).map(w => temp_comp_Imax[w] == 1 ? newI[w] = Imax[w] : 0)
            assert(nj.sum(Object.keys(with_bound).filter(i => with_bound[i] == true).map(j => with_bound[j] && (newI[j] > Imax[j]))) == 0, 'some indicators have surpassed their theoretical upper bound!')
        }

        // # if theoretical minimums are provided, make sure the indicators do not become lower than them
        if (Imin != null){
            with_bound = Object.keys(Imin).map(i => !isNaN(Imin[i]) && Imin[i])
            var temp_comp_Imin = Object.keys(with_bound).map(j => with_bound[j] == 1 ? with_bound[j] && (newI[j] < Imin[j]) : 0)
            Object.keys(temp_comp_Imin).map(w => temp_comp_Imin[w] == 1 ? newI[w] = Imin[w] : 0)
            assert(nj.sum(Object.keys(with_bound).filter(i => with_bound[i] == true).map(j => with_bound[j] && (newI[j] < Imin[j])))==0, 'some indicators have surpassed their theoretical lower bound!')
        }

        // # if governance parameters are endogenous, make sure they are not larger than 1 TODO FALTA...
        var temp_newI_qm = Object.keys(qm).map(i => qm[i] != 0 && newI[i] > 1)
        if (isNumeric(qm) && nj.sum(temp_newI_qm) > 0) {
            Object.keys(temp_newI_qm).map(i => temp_newI_qm[i] ? newI[i] = 1 : newI[i])
        }

        var temp_newI_rl = Object.keys(rl).map(i => rl[i] != 0 && newI[i] > 1)
        if (isNumeric(rl) && nj.sum(temp_newI_rl) > 0) {
            Object.keys(temp_newI_rl).map(i => temp_newI_rl[i] ? newI[i] = 1 : newI[i])
        }

        // # if governance parameters are endogenous, make sure they are not smaller than 0
        temp_newI_qm = Object.keys(qm).map(i => qm[i] != 0 && newI[i] < 0)
        if (isNumeric(qm) && nj.sum(temp_newI_qm) > 0) {
            Object.keys(temp_newI_qm).map(i => temp_newI_qm[i] ? newI[i] = 0 : newI[i])
        }

        temp_newI_rl = Object.keys(rl).map(i => rl != 0 && newI[i] < 0)
        if (isNumeric(rl) && nj.sum(temp_newI_rl) > 0) {
            Object.keys(temp_newI_rl).map(i => temp_newI_rl[i] ? newI[i] = 0 : newI[i])
        }

        It = I.slice() // update lagged indicators
        I = newI.slice() // update indicators

        // ### DETERMINE ALLOCATION PROFILE ###

        var temp_rand = test ? get_values(n).tolist() : nj.random(n).tolist()
        Object.keys(P0_budget).map(i => P0_budget[i] += (temp_rand[i] * H[i] / HC[i])) // interaction between random term and inefficiancy history


        assert(nj.sum(P0_budget.map(i => isNaN(i))) == 0, 'P0 has invalid values!')
        assert(nj.sum(P0_budget.map(i => i == 0)) == 0, 'P0 has a zero value!')

        P = nj.zeros(n).tolist()

        // # iterate over the expenditure programs

        Object.entries(sorted_programs).map(([key, program]) => {
            indis = program2indis[program]
            relevant_indis = Object.values(indis).map(v => inst2idx.get(v))
            temp_sum_P0 = nj.sum(Object.values(relevant_indis).map(v => P0_budget[v]))
            q = Object.values(relevant_indis).map(v => P0_budget[v] / temp_sum_P0) // compute expenditure propensities
            assert(nj.sum(q.map(i => isNaN(i))) == 0, 'q has invalid values!')
            assert(nj.sum(q.map(i => i == 0)) == 0, 'q has zero values!')
            temp_bs_relInd = Object.values(relevant_indis).map(i => bs[i])
            qs_hat = Object.keys(q).map(i => Math.pow(q[i], temp_bs_relInd[i])) // modulate expenditure propensities
            temp_Bs = Bs[Number(key)].tolist()
            let temp_sum_qs_hat = nj.sum(qs_hat)
            Object.values(relevant_indis).map(i => P[i] += temp_Bs[t] * qs_hat[Object.keys(relevant_indis).find(ind => relevant_indis[ind]===i)] / temp_sum_qs_hat)
        })

        assert(nj.sum(P.map(i => isNaN(i))) == 0, 'P has invalid values!')
        assert(nj.sum(P.map(i => i == 0)) == 0, 'P has zero values!')

    }

    tsI = nj.array(tsI).T
    tsC = nj.array(tsC).T
    tsF = nj.array(tsF).T
    tsP = nj.array(tsP).T
    tsS = nj.array(tsS).T
    tsG = nj.array(tsG).T

    return [tsI, tsC, tsF, tsP, tsS, tsG]

}

// Computes a set of Monte Carlo simulations of PPI, obtains their average statistics,
// and computes the error with respect to IF and success_rates. Called by the calibrate function.
function compute_error(I0, alphas, alphas_prime, betas, A, R, qm, rl, Bs, B_dict, T,
    IF, success_rates, parallel_processes, test, sample_size, for_calibrate=false) {
    
    sols = []
    if (parallel_processes === undefined || parallel_processes == null) {
        for (itera in Array.from({ length: sample_size })){
            sols.push(ppi(I0=I0, alphas=alphas, alphas_prime=alphas_prime,
                betas=betas, A=A, R=R, null, qm=qm, rl=rl, null,null,
                Bs=Bs, B_dict=B_dict, G=null, T=T, null, test=test, for_calibrate=for_calibrate))
        }
    }
    I_hat = []
    sols[0][0].tolist().map(j => {
            I_hat.push(nj.mean(j.slice(-1)))
        })

    gamma_hat = []
    sols[0][5].tolist().map(i =>{
        gamma_hat.push(nj.mean(i))
    })
    error_alpha = Object.keys(IF).map(i => IF[i] - I_hat[i])
    error_beta = Object.keys(success_rates).map(i => success_rates[i] - gamma_hat[i])
    sum_error_alpha_beta = []
    sum_error_alpha_beta = sum_error_alpha_beta.concat(error_alpha)
    sum_error_alpha_beta = sum_error_alpha_beta.concat(error_beta)
    return [nj.array(sum_error_alpha_beta), sols[0][0].shape[1]]

}

function calibrate(I0, IF, success_rates, A, R, qm, rl, Bs, B_dict,
    T=50, parallel_processes, threshold = 0.6, verbose = false, low_precision_counts = 101, increment = 1000,
    test=false, sample_size=10, for_calibrate=true) {
    nj.config.printThreshold = 4;

    // Check data integrity

    success_rates = success_rates.map(function (item) { return item >= 1 ? 0.95 : item; });
    success_rates = success_rates.map(function (item) { return item <= 0 ? 0.05 : item; });

    assert(threshold < 1, 'the threshold must be lower than 1')
    assert(I0.length == IF.length, 'I0 and IF must have the same size')


    // # Initialize hyperparameters and containers
    const N = I0.length
    var params = nj.ones(3 * N).multiply(0.5).tolist()  // vector containing all the parameters that need calibration

    var counter = 0
    let GoF_alpha = nj.zeros(N)
    let GoF_beta = nj.zeros(N)
    let list_TF = []

    // Main iteration of the calibration
    // Iterates until the minimum threshold criterion has been met, and at least 100 iterations have taken place
    while ((nj.mean(GoF_alpha) < threshold || nj.mean(GoF_beta) < threshold) || counter < low_precision_counts) {

        counter += 1 // Makes sure at least 100 iteartions are performed

        // unpack the parameter vector into 3 vectors that correspond to the different parameter types
        alphas = params.slice(0,N)
        alphas_prime = params.slice(N, 2 * N)
        betas = params.slice(2 * N)

        // compute the errors for the specified parameter vector
        
        let [errors_all, TF] = compute_error(I0 = I0, alphas = alphas, alphas_prime = alphas_prime, betas = betas, A = A,
            R = R, qm = qm, rl = rl, Bs = Bs, B_dict = B_dict,
            T = T, IF = IF, success_rates = success_rates,
            parallel_processes = parallel_processes, test=test,
            sample_size = sample_size, for_calibrate=true)

        // unpack the error vector
        let errors_alpha = errors_all.tolist().slice(0,N)
        let errors_beta = errors_all.tolist().slice(N)
        list_TF.push(TF)

        // normalize the errors
        let abs_errors_alpha = Object.keys(errors_alpha).map(i => Math.abs(errors_alpha[i]))
        let gaps = Object.keys(IF).map(i => IF[i] - I0[i])
        let temp_abs_gaps = Object.keys(gaps).map(i => Math.abs(gaps[i]))
        let normed_errors_alpha = Object.keys(abs_errors_alpha).map(i => abs_errors_alpha[i]/temp_abs_gaps[i])
        let abs_normed_errors_alpha = Object.keys(normed_errors_alpha).map(i => Math.abs(normed_errors_alpha[i]))
        let abs_errors_beta = Object.keys(errors_beta).map(i => Math.abs(errors_beta[i]))
        let normed_errors_beta = Object.keys(success_rates).map(i => abs_errors_beta[i]/success_rates[i])
        let abs_normed_errors_beta = Object.keys(normed_errors_beta).map(i => Math.abs(normed_errors_beta[i]))

        // apply the gradient descent and update the parameters
        for (let i = 0; i < N; i++) {
            if (errors_alpha[i] < 0) {
                if (IF[i] != I0[i]) {
                    params[i] = params[i] * nj.clip(1 - abs_normed_errors_alpha[i], 0.25, 0.99).get(0)
                    params[i + N] = params[i + N] * nj.clip(1 + abs_normed_errors_alpha[i], 1.01, 1.5).get(0)
                }
            } else if (errors_alpha[i] > 0) {
                if (IF[i] != I0[i]) {
                    params[i] = params[i] * nj.clip(1 + abs_normed_errors_alpha[i], 1.01, 1.5).get(0)
                    params[i + N] = params[i + N] * nj.clip(1 - abs_normed_errors_alpha[i], 0.25, 0.99).get(0)
                }
            }
            if (errors_beta[i] > 0) {
                params[i + 2 * N] = params[i + 2 * N] * nj.clip(1 + abs_normed_errors_beta[i], 1.01, 1.5).get(0)
            } else if (errors_beta[i] < 0) {
                params[i + 2 * N] = params[i + 2 * N] * nj.clip(1 - abs_normed_errors_beta[i], 0.25, 0.99).get(0)
            }
        }

        // # compute the goodness of fit
        GoF_alpha = nj.array(Object.values(normed_errors_alpha).map(i => 1 - i))
        GoF_beta = nj.array(Object.values(abs_normed_errors_beta).map(i => 1 - i))

        //     # check low_precision_counts iterations have been reached
        //     # after low_precision_counts iterations, increase the number of Monte Carlo simulations by
        //     # 1000 in every iterations in order to achieve higher precision and
        //     # minimize the error more effectively
        if (counter >= low_precision_counts) {
            sample_size += increment;
        }

        // prints the calibration iteration and the worst goodness-of-fit metric
        if (verbose) {
            min_gof_alpha_beta = []
            min_gof_alpha_beta = min_gof_alpha_beta.concat(GoF_alpha.tolist())
            min_gof_alpha_beta = min_gof_alpha_beta.concat(GoF_beta.tolist())
            console.log("Iteration: %d. Worst goodness of fit: %d", counter, nj.mean(min_gof_alpha_beta))
        }

    }
    // # save the last parameter vector and de associated errors and goodness-of-fit metrics

    output = nj.zeros(1)
    output.set(0,['alpha', 'alpha_prime', 'beta', 'T', 'error_alpha', 'error_beta', 'GoF_alpha', 'GoF_beta']);
    [...Array(N).keys()].map(i => output.set(i+1,[alphas[i], alphas_prime[i], betas[i], i == 0 ? nj.nan : list_TF[i], error_alpha[i],
             error_beta[i], GoF_alpha.get(i), GoF_beta.get(i)]))

    return output
}

module.exports = {ppi, calibrate, compute_error} */
