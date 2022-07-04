

import { getValues } from './get-values';
import { assert, isNumeric } from '../utils';


const ppi = (I0, alphas, alphas_prime, betas, A = null, R = null, bs = null, qm = null, rl = null,
  Imax = null, Imin = null, Bs = null, B_dict = null, G = null, T = null, frontier = null, test = false, for_calibrate = false) => {
  // # Number of indicators
  const N = I0.length
  // # Spillover network
  if (A == null) {
    // eslint-disable-next-line no-undef
    A = nj.zeros([N, N])
  } else {
    A = A
  }

  // # Instrumental indicators
  if (R == null) {
    // eslint-disable-next-line no-undef
    R = nj.ones(N).tolist()
  } else {
    R = R.map(item => item != 1 ? 0 : item);
  }

  // # Number of instrumental indicators
  // eslint-disable-next-line no-undef
  const n = parseInt(nj.sum(R))

  // # Modulating factors
  if (bs == null) {
    // eslint-disable-next-line no-undef
    var bs = nj.ones(n).tolist()
  } else {
    // eslint-disable-next-line no-undef
    assert(nj.sum(bs.map(i => isNaN(i))) == 0, 'bs should not contain missing values')
    assert(bs.length == n, 'bs should have the same size as the number of ones in R')
  }

  // # Quality of monitoring
  if (qm == null) {
    // eslint-disable-next-line no-undef
    qm = nj.ones(n).multiply(0.5).tolist()
  } else if (qm.constructor.name === 'Array') {
    qm = Object.keys(R).map(i => R[i] == 1 ? qm[i] : R[i])
    qm = qm.map(item => isNaN(item) ? .5 : item)
  }

  // # Quality of the rule of law
  if (rl == null) {
    // eslint-disable-next-line no-undef
    rl = nj.ones(n).multiply(0.5).tolist()
  } else if (rl.constructor.name === 'Array') {
    rl = Object.keys(R).map(i => R[i] == 1 ? rl[i] : R[i])
    rl = rl.map(item => isNaN(item) ? .5 : item)
  }

  // # Theoretical upper bounds
  if (Imax != null) {
    // eslint-disable-next-line no-undef
    if (nj.sum(Imax.map(i => !isNaN(i) ? 1 : 0)) > 0) {
      // eslint-disable-next-line no-undef
      assert(nj.sum(Object.keys(Imax).map(i => !isNaN(Imax[i]) && Imax[i] < I0[i])) == 0, 'All entries in Imax should be greater than I0')
    }
  }

  // # Theoretical lower bounds
  if (Imin != null) {
    // eslint-disable-next-line no-undef
    if (nj.sum(Imin.map(i => !isNaN(i) ? 1 : 0)) > 0) {
      // eslint-disable-next-line no-undef
      assert(nj.sum(Object.keys(Imin).map(i => !isNaN(Imin[i]) && Imin[i] > I0[i])) == 0, 'All entries in Imin should be lower than I0')
    }
  }

  // # Payment schedule
  if (T == null || (!test && for_calibrate)) {
    T = 50
  }
  if (Bs == null) {
    // eslint-disable-next-line no-undef
    Bs = nj.array(nj.ones(T).multiply(100).reshape(1, T))
    B_dict = {};
    R.forEach((r, key) => {
      if (r === 1) {
        B_dict[key] = [0];
      }
    });
    // [...Array(R.length).keys()].filter(r => R[r] == 1).map(i => B_dict[i] = [0])
  } else if (typeof Bs === 'object') {
    // eslint-disable-next-line no-undef
    Bs = Bs.map(i => nj.ones(T).multiply(i));
  }
  if (B_dict == null) {
    B_dict = {};
    R.forEach((r, key) => {
      if (r === 1) {
        B_dict[key] = [0];
      }
    });
    // [...Array(R.length).keys()].filter(r => R[r] === 1).map(i => B_dict[i] = [0]);
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

  let sorted_programs = programs.sort(function (a, b) { return a - b })

  Object.entries(B_dict).forEach(([indi, list_programs]) => {
    list_programs.forEach(value => {
      if (R[indi]) {
        program2indis[value].push(Number(indi));
      }
    })
  })
  let cont = -1
  // eslint-disable-next-line no-undef
  const inst2idx = nj.array(Object.keys(R).map(i => R[i] !== 1 ? NaN : cont += 1));
  // # Create initial allocation profile
  let P0_budget = [];
  if (G != null) {
    var gaps = Object.keys(G).map(i => G[i] - I0[i])
    gaps = gaps.map(item => item < 0 ? 0 : item)
    // eslint-disable-next-line no-undef
    var sum_gaps = nj.sum(gaps)
    var p0 = gaps.map(i => i / sum_gaps)
    // eslint-disable-next-line no-undef
    P0_budget = nj.zeros(n).tolist()
  } else {
    // eslint-disable-next-line no-undef
    P0_budget = nj.zeros(n).tolist()
    // eslint-disable-next-line no-undef
    var p0 = !test ? nj.random(n).tolist() : getValues(n).tolist()
  }
  let l = 0
  Object.values(sorted_programs).forEach(s => {
    var indis = program2indis[s];
    var relevant_indis = Object.values(indis).map(p => inst2idx.get(p))
    // eslint-disable-next-line no-undef
    var temp_sum_p0 = nj.sum(relevant_indis.map(i => p0[i]))
    Object.values(relevant_indis).map(i => {
      if (typeof Bs === 'object') {
        P0_budget[i] += Bs[l].get(0) * p0[i] / temp_sum_p0;
      } else {
        P0_budget[i] += Bs * p0[i] / temp_sum_p0;
      }
      
    })
    l += 1
  })
  // # Prevent null allocations
  let temp_sum_Bs = 0;
  if (typeof Bs === 'object') {
  // eslint-disable-next-line no-undef
    temp_sum_Bs = nj.sum(Object.values(Bs).map(i => i.get(0, 0)));
  } else {
    temp_sum_Bs = Bs;
  }
  // eslint-disable-next-line no-undef
  var temp_sum_P0_budget = nj.sum(P0_budget)
  P0_budget = P0_budget.map(i => temp_sum_Bs * i / temp_sum_P0_budget);
  if (typeof Bs === 'object') {
    Bs = Object.values(Bs).map(item => item == 0 ? 10e-12 : item);
  } else {
    if (Bs == 0) Bs = 10e-12;
  }
  P0_budget = Object.values(P0_budget).map(item => item == 0 ? 10e-12 : item)
  // ## INSTANTIATE ALL VARIABLES AND CREATE CONTAINERS TO STORE DATA
  var P = P0_budget.slice() // first applocation
  // eslint-disable-next-line no-undef
  var H = nj.ones(n).tolist() // cumulative spotted inefficiencies
  // eslint-disable-next-line no-undef
  var HC = nj.ones(n).tolist() // number of times spotted so far
  var I = I0.slice() // initial levels of the indicators
  let F = [];
  if (!test) {
    // eslint-disable-next-line no-undef
    F = nj.random(n).tolist() // policymakers' benefits
    // eslint-disable-next-line no-undef
    var Ft = nj.random(n).tolist() // lagged benefits
    // eslint-disable-next-line no-undef
    var X = nj.random(n).subtract(.5).tolist() // policymakers' actions
    // eslint-disable-next-line no-undef
    var Xt = nj.random(n).subtract(.5).tolist() // lagged actions
    // eslint-disable-next-line no-undef
    var signt = nj.random(n).subtract(.5).tolist().map(i => Math.sign(i)) // direction of previous actions
    // eslint-disable-next-line no-undef
    var changeFt = nj.random(n).subtract(.5).tolist() // change in benefits
    // eslint-disable-next-line no-undef
    var C = [...Array(n).keys()].map(i => nj.random(1).get(0) * P[i]) // contributions
    // eslint-disable-next-line no-undef
    var It = nj.random(N).tolist() // lagged indicators
  } else {
    F = getValues(n).tolist() // policymakers' benefits
    var Ft = getValues(n).tolist() // lagged benefits
    var X = getValues(n).subtract(.5).tolist() // policymakers' actions
    var Xt = getValues(n).subtract(.5).tolist() // lagged actions
    var signt = getValues(n).subtract(.5).tolist().map(i => Math.sign(i)) // direction of previous actions
    var changeFt = getValues(n).subtract(.5).tolist() // change in benefits
    const temp_for_C = getValues(n).tolist()
    const C = [...Array(n).keys()].map(i => temp_for_C[i] * P[i]) // contributions
    var It = getValues(N).tolist() // lagged indicators
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

    const deltaBin = Object.keys(I).map(i => I[i] > It[i] ? 1 : 0)
    let deltaIIns = Object.keys(R).filter(v => R[v] == 1).map(r => I[r].toFixed(11) - It[r].toFixed(11)).slice() // instrumental indicators' changes

    let temp_abs_deltaIns = Object.values(deltaIIns).map(i => Math.abs(i))
    // eslint-disable-next-line no-undef
    if (nj.sum(temp_abs_deltaIns) > 0) { // relative change of instrumental indicators
      // eslint-disable-next-line no-undef
      let temp_sum_deltaIns = nj.sum(temp_abs_deltaIns)
      deltaIIns = Object.keys(deltaIIns).map(v => deltaIIns[v] / temp_sum_deltaIns)
    }
    // ### DETERMINE CONTRIBUTIONS ###
    const changeF = [...Array(F.length).keys()].map(i => F[i].toFixed(11) - Ft[i].toFixed(11)) // change in benefits
    const changeX = [...Array(X.length).keys()].map(i => X[i].toFixed(11) - Xt[i].toFixed(11)) // change in actions
    const sign = [...Array(changeF.length).keys()].map(i => Math.sign((changeF[i] * changeX[i]).toFixed(11))) // direction of the next action
    Object.keys(changeF).filter(i => changeF[i] == 0).map(v => changeF[v] = changeFt[v]) // if the benefit did not change, keep the last change
    Object.keys(sign).filter(i => sign[i] == 0).map(v => sign[v] = signt[v]) // if the sign is undefined, keep the last one
    Xt = X.slice() // update lagged actions
    let temp_abs_changeF = Object.values(changeF).map(i => Math.abs(i))
    X = Object.keys(X).map(i => X[i] += sign[i] * temp_abs_changeF[i]) // determine current action
    // eslint-disable-next-line no-undef
    assert(nj.sum(X.map(i => isNaN(i))) == 0, 'X has invalid values!')
    // eslint-disable-next-line no-undef
    const temp_X = nj.exp(nj.negative(X))
    C = Object.keys(P).map(i => P[i] / (1 + temp_X.get(i))) // map action into contribution
    // eslint-disable-next-line no-undef
    assert(nj.sum(Object.entries(C).every(([_key, value]) => isNaN(value))) == 0, 'C has invalid values!')
    // eslint-disable-next-line no-undef
    assert(nj.sum(Object.keys(C).map(i => P[i] < C[i])) == 0, 'C cannt be larger than P!')
    signt = sign.slice() // update previous signs
    changeFt = changeF.slice() // update previous changes in benefits

    tsC.push(C.slice()) // store this period's contributions
    tsF.push(F.slice()) // store this period's benefits

    // ### DETERMINE BENEFITS ###
    // eslint-disable-next-line no-undef
    let temp_max_P = nj.max(P)
    let trial = null;
    if (isNumeric(qm)) {
      let temp_I_qm = Object.keys(qm).map(i => qm[i] != 0 && I[i])
      // eslint-disable-next-line no-undef
      let temp_rand_qm = test ? getValues(n).tolist() : nj.random(n).tolist()
      trial = Object.keys(P).map(i => temp_rand_qm[i] < temp_I_qm[i] * P[i] / temp_max_P * (P[i] - C[i]) / P[i])
    } else {
      // eslint-disable-next-line no-undef
      let temp_rand_qm = test ? getValues(n).tolist() : nj.random(n).tolist()
      trial = Object.keys(P).map(i => temp_rand_qm[i] < qm[i] * (P[i] / temp_max_P) * (P[i] - C[i]) / P[i])
    }
    const theta = trial.slice()
    Object.keys(theta).filter(i => theta[i] == 1).map(v => H[v] += (P[v] - C[v]) / P[v]) // cumulative inefficiencies spotted
    Object.keys(theta).filter(i => theta[i] == 1).map(v => HC[v] += 1) // number of times spotted so far being inefficient
    let newF = null;
    if (isNumeric(rl)) {
      const temp_I_rl = Object.keys(rl).map(i => rl[i] != 0 && I[i])
      newF = Object.keys(deltaIIns).map(i => deltaIIns[i] * C[i] / P[i] + (1 - theta[i] * temp_I_rl[i]) * (P[i] - C[i]) / P[i]) // compute benefits
    } else {
      newF = Object.keys(deltaIIns).map(i => deltaIIns[i] * C[i] / P[i] + (1 - theta[i] * rl[i]) * (P[i] - C[i]) / P[i]) // compute benefits
    }
    Ft = F.slice() // update lagged benefits
    F = newF // update benefits
    // eslint-disable-next-line no-undef
    assert(nj.sum(F.map(i => isNaN(i))) == 0, 'F has invalid values!')

    // ### DETERMINE INDICATORS ###
    // eslint-disable-next-line no-undef
    const deltaM = Object.values(deltaBin).map(i => i == 1 ? nj.ones(deltaBin.length).tolist() : nj.zeros(deltaBin.length).tolist()) // reshape deltaIAbs into a matrix
    // eslint-disable-next-line no-undef
    let temp_deltaM = nj.array(deltaM)
    let temp_multi = (temp_deltaM.multiply(A).T).tolist()
    // eslint-disable-next-line no-undef
    const S = Object.keys(deltaM).map(i => nj.sum(temp_multi[i])) // compute spillovers
    // eslint-disable-next-line no-undef
    assert(nj.sum(S.map(i => isNaN(i))) == 0, 'S has invalid values!')
    tsS.push(S) // store spillovers
    // eslint-disable-next-line no-undef
    let cnorm = nj.zeros(N).tolist() // initialize a zero-vector to store the normalized contributions
    let temp_index = 0
    Object.keys(R).map((j) => {
      j = Number(j)
      if (R[j] == 1) {
        cnorm[j] = C[j - temp_index]
      } else {
        cnorm[j] = 0
        temp_index += 1
      }
    })  // compute contributions only for instrumental nodes
    // eslint-disable-next-line no-undef
    let temp_sum_C = nj.sum(C)
    // eslint-disable-next-line no-undef
    let temp_sum_P = nj.sum(P)
    // eslint-disable-next-line no-undef
    let temP_exp_S = nj.exp(nj.negative(S)).add(1)
    let gammas = Object.keys(cnorm).map(i => {
      return (betas[i] * (cnorm[i] + temp_sum_C / (temp_sum_P + 1))) / temP_exp_S.get(i);
    }) // compute probability of succesful growth
    // eslint-disable-next-line no-undef
    assert(nj.sum(gammas.map(i => isNaN(i))) == 0, 'some gammas have invalid values!')
    // eslint-disable-next-line no-undef
    assert(nj.sum(gammas.map(i => i == 0)) == 0, 'some gammas have zero value!')

    if (frontier != null) { // if the user wants to perform frontier analysis
      gammas = frontier
    }

    tsG.push(gammas) // store gammas
    // eslint-disable-next-line no-undef
    const temp_success = test ? getValues(N).tolist() : nj.random(N).tolist()
    const success = Object.keys(gammas).map(i => temp_success[i] < gammas[i]) // determine if there is succesful growth
    const newI = [...I] // compute potential new values
    Object.keys(success).map(i => success[i] == true ? newI[i] = I[i] + alphas[i] : newI[i] = I[i] - alphas_prime[i]) // update growing indicators & update decreasing indicators

    // # if theoretical maximums are provided, make sure the indicators do not surpass them
    if (Imax != null) {
      const with_bound = Object.keys(Imax).map(i => !isNaN(Imax[i]) && Imax[i])
      var temp_comp_Imax = Object.keys(with_bound).map(j => with_bound[j] == 1 ? with_bound[j] && (newI[j] > Imax[j]) : 0)
      Object.keys(temp_comp_Imax).map(w => temp_comp_Imax[w] == 1 ? newI[w] = Imax[w] : 0)
      // eslint-disable-next-line no-undef
      assert(nj.sum(Object.keys(with_bound).filter(i => with_bound[i] == true).map(j => with_bound[j] && (newI[j] > Imax[j]))) == 0, 'some indicators have surpassed their theoretical upper bound!')
    }

    // # if theoretical minimums are provided, make sure the indicators do not become lower than them
    if (Imin != null) {
      const with_bound = Object.keys(Imin).map(i => !isNaN(Imin[i]) && Imin[i])
      var temp_comp_Imin = Object.keys(with_bound).map(j => with_bound[j] == 1 ? with_bound[j] && (newI[j] < Imin[j]) : 0)
      Object.keys(temp_comp_Imin).map(w => temp_comp_Imin[w] == 1 ? newI[w] = Imin[w] : 0)
      // eslint-disable-next-line no-undef
      assert(nj.sum(Object.keys(with_bound).filter(i => with_bound[i] == true).map(j => with_bound[j] && (newI[j] < Imin[j]))) == 0, 'some indicators have surpassed their theoretical lower bound!')
    }

    // # if governance parameters are endogenous, make sure they are not larger than 1 TODO FALTA...
    var temp_newI_qm = Object.keys(qm).map(i => qm[i] != 0 && newI[i] > 1)
    // eslint-disable-next-line no-undef
    if (isNumeric(qm) && nj.sum(temp_newI_qm) > 0) {
      Object.keys(temp_newI_qm).map(i => temp_newI_qm[i] ? newI[i] = 1 : newI[i])
    }

    var temp_newI_rl = Object.keys(rl).map(i => rl[i] != 0 && newI[i] > 1)
    // eslint-disable-next-line no-undef
    if (isNumeric(rl) && nj.sum(temp_newI_rl) > 0) {
      Object.keys(temp_newI_rl).map(i => temp_newI_rl[i] ? newI[i] = 1 : newI[i])
    }

    // # if governance parameters are endogenous, make sure they are not smaller than 0
    temp_newI_qm = Object.keys(qm).map(i => qm[i] != 0 && newI[i] < 0)
    // eslint-disable-next-line no-undef
    if (isNumeric(qm) && nj.sum(temp_newI_qm) > 0) {
      Object.keys(temp_newI_qm).map(i => temp_newI_qm[i] ? newI[i] = 0 : newI[i])
    }

    temp_newI_rl = Object.keys(rl).map(i => rl != 0 && newI[i] < 0)
    // eslint-disable-next-line no-undef
    if (isNumeric(rl) && nj.sum(temp_newI_rl) > 0) {
      Object.keys(temp_newI_rl).map(i => temp_newI_rl[i] ? newI[i] = 0 : newI[i])
    }

    It = I.slice() // update lagged indicators
    I = [...newI] // update indicators
    // ### DETERMINE ALLOCATION PROFILE ###

    // eslint-disable-next-line no-undef
    var temp_rand = test ? getValues(n).tolist() : nj.random(n).tolist()
    Object.keys(P0_budget).map(i => P0_budget[i] += (temp_rand[i] * H[i] / HC[i])) // interaction between random term and inefficiancy history
    // eslint-disable-next-line no-undef
    assert(nj.sum(P0_budget.map(i => isNaN(i))) == 0, 'P0 has invalid values!')
    // eslint-disable-next-line no-undef
    assert(nj.sum(P0_budget.map(i => i == 0)) == 0, 'P0 has a zero value!')

    // eslint-disable-next-line no-undef
    P = nj.zeros(n).tolist()

    // # iterate over the expenditure programs

    Object.entries(sorted_programs).map(([key, program]) => {
      const indis = program2indis[program]
      const relevant_indis = Object.values(indis).map(v => inst2idx.get(v))
      // eslint-disable-next-line no-undef
      const temp_sum_P0 = nj.sum(Object.values(relevant_indis).map(v => P0_budget[v]))
      const q = Object.values(relevant_indis).map(v => P0_budget[v] / temp_sum_P0) // compute expenditure propensities
      // eslint-disable-next-line no-undef
      assert(nj.sum(q.map(i => isNaN(i))) == 0, 'q has invalid values!')
      // eslint-disable-next-line no-undef
      assert(nj.sum(q.map(i => i == 0)) == 0, 'q has zero values!')
      const temp_bs_relInd = Object.values(relevant_indis).map(i => bs[i])
      const qs_hat = Object.keys(q).map(i => Math.pow(q[i], temp_bs_relInd[i])) // modulate expenditure propensities
      let temp_Bs = [];
      if (typeof Bs.get === 'function') {
        temp_Bs = Bs.get(Number(key)).tolist()
      } else {
        if (typeof Bs === 'object') {
          temp_Bs = Bs[Number(key)].tolist();
        } else {
          temp_Bs = Bs;
        }
      }
      // eslint-disable-next-line no-undef
      let temp_sum_qs_hat = nj.sum(qs_hat);
      if (typeof Bs === 'object') {
        Object.values(relevant_indis).map(i => {
          P[i] += temp_Bs[t] * qs_hat[Object.keys(relevant_indis).find(ind => relevant_indis[ind] === i)] / temp_sum_qs_hat;
        });
      } else {
        Object.values(relevant_indis).map(i => P[i] += temp_Bs * qs_hat[Object.keys(relevant_indis).find(ind => relevant_indis[ind] === i)] / temp_sum_qs_hat);
      }
    })
    // TODO: fix next line (delete and fix error)
    // P = P.map((item) => item === 0 || isNaN(item) ? 10e-12 : item);
    // eslint-disable-next-line no-undef
    assert(nj.sum(P.map(i => isNaN(i))) == 0, 'P has invalid values!')
    // eslint-disable-next-line no-undef
    assert(nj.sum(P.map(i => i == 0)) == 0, 'P has zero values!')
  }
  // eslint-disable-next-line no-undef
  tsI = nj.array(tsI).T
  // eslint-disable-next-line no-undef
  tsC = nj.array(tsC).T
  // eslint-disable-next-line no-undef
  tsF = nj.array(tsF).T
  // eslint-disable-next-line no-undef
  tsP = nj.array(tsP).T
  // eslint-disable-next-line no-undef
  tsS = nj.array(tsS).T
  // eslint-disable-next-line no-undef
  tsG = nj.array(tsG).T

  return [tsI, tsC, tsF, tsP, tsS, tsG]
}

export { ppi }
