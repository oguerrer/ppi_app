import * as XLSX from 'xlsx';
import { getBase64 } from '../file-helper';

const validateIndicators = async (format, f, indicator_sheet = 'template') => {
  let error = false;
  let res_indicator_error = {
    I0: {
      type: '',
      dimension: '',
      value: '',
    },
    IF: {
      type: '',
      dimension: '',
      value: '',
    },
    alpha: {
      type: '',
      dimension: '',
      value: '',
    },
    alpha_prime: {
      type: '',
      dimension: '',
      value: '',
    },
    beta: {
      type: '',
      dimension: '',
      value: '',
    },
    success_rates: {
      type: '',
      dimension: '',
      value: '',
    },
    R: {
      type: '',
      dimension: '',
      value: '',
      zero: '',
    },
    qm: {
      type: '',
      dimension: '',
      value: '',
    },
    rl: {
      type: '',
      dimension: '',
      value: '',
    },
    Imax: {
      type: '',
      dimension: '',
      value: '',
    },
    Imin: {
      type: '',
      dimension: '',
      value: '',
    },
    G: {
      type: '',
      dimension: '',
      value: '',
    },
    ID: {
      type: '',
      dimension: '',
      value: '',
    },
    name: {
      type: '',
      dimension: '',
      value: '',
    },
    color: {
      type: '',
      dimension: '',
      value: '',
    },
    error: true,
  }

  const addError = (variable, cell, type) => {
    if (type === 'type') {
      res_indicator_error[variable][type] = `All values should be numeric - ${cell}`;
    } else if (type === 'dimension') {
      res_indicator_error[variable][type] = 'The number of values should be the same as the number of values in column ‘I0’';
    } else if (type === 'R') {
      res_indicator_error[variable][type] = 'At less one value must be > 0';
    } else if (type === 'ID') {
      res_indicator_error[variable][type] = `Each value should not contain more than 12 characters - ${cell}`;
    } else {
      res_indicator_error[variable][type] = `All values should be between 0 and 1 - ${cell}`;
    }
    error = true;
  };
  if (format !== 'xlsx' && format !== 'xls') {
    throw new Error("Wrong format file");
  } else {
    const f64 = await getBase64(f);
    const file = XLSX.read(f64, { type: 'base64' });
    var I0 = [];
    var IF = [];
    var alpha = [];
    var alpha_prime = [];
    var beta = [];
    var success_rates = [];
    var R = [];
    var qm = [];
    var rl = [];
    var Imax = [];
    var Imin = [];
    var G = [];
    var ID = [];
    var name = [];
    var color = [];
    
    // Verify if exists NaN values
    const indicators = file.Sheets[indicator_sheet]
    Object.keys(indicators).map((k) => {
      const re_A = new RegExp("^A")
      if (re_A.test(k) && k !== 'A1') {
        indicators[k]['t'] === 'n' ? I0.push(indicators[k]['v']) : addError('I0', k, 'type');
      }
      const re_B = new RegExp("^B")
      if (re_B.test(k) && k !== 'B1') {
        indicators[k]['t'] === 'n' ? IF.push(indicators[k]['v']) : addError('IF', k, 'type');
      }
      const re_C = new RegExp("^C")
      if (re_C.test(k) && k !== 'C1') {
        indicators[k]['t'] === 'n' ? alpha.push(indicators[k]['v']) : addError('alpha', k, 'type');
      }
      const re_D = new RegExp("^D")
      if (re_D.test(k) && k !== 'D1') {
        indicators[k]['t'] === 'n' ? alpha_prime.push(indicators[k]['v']) : addError('alpha_prime', k, 'type');
      }
      const re_E = new RegExp("^E")
      if (re_E.test(k) && k !== 'E1') {
        indicators[k]['t'] === 'n' ? beta.push(indicators[k]['v']) : addError('beta', k, 'type');
      }
      const re_F = new RegExp("^F")
      if (re_F.test(k) && k !== 'F1') {
        if (indicators[k]['t'] === 'n') {
          if (indicators[k]['v'] <= 0 || indicators[k]['v'] >= 1) {
            addError('success_rates', k, 'value');
          } else {
            success_rates.push(indicators[k]['v'])
          }
        } else {
          addError('success_rates', k, 'type');
        }
      }
      const re_G = new RegExp("^G")
      if (re_G.test(k) && k !== 'G1') {
        if (indicators[k]['t'] === 'n') {
          if (indicators[k]['v'] === 1 || indicators[k]['v'] === 0) {
            R.push(indicators[k]['v']);
          } else {
            addError('R', k, 'type')
          }
        } else {
          addError('R', k, 'type');
        }
      }
      const re_H = new RegExp("^H")
      if (re_H.test(k) && k !== 'H1') {
        if (indicators[k]['t'] === 'n') {
          if (indicators[k]['v'] < 0 || indicators[k]['v'] >= 1) {
            addError('qm', k, 'type');
          } else {
            qm.push(indicators[k]['v']);
          }
        } else {
          addError('qm', k, 'type');
        }
      }
      const re_I = new RegExp("^I")
      if (re_I.test(k) && k !== 'I1') {
        if (indicators[k]['t'] === 'n') {
          if (indicators[k]['v'] < 0 || indicators[k]['v'] >= 1) {
            addError('rl', k, 'type');
          } else {
            rl.push(indicators[k]['v']);
          }
        } else {
          addError('rl', k, 'type');
        }
      }
      const re_J = new RegExp("^J")
      if (re_J.test(k) && k !== 'J1') {
        indicators[k]['t'] === 'n' ? Imin.push(indicators[k]['v']) : addError('Imin', k, 'type');
      }
      const re_K = new RegExp("^K")
      if (re_K.test(k) && k !== 'K1') {
        indicators[k]['t'] === 'n' ? Imax.push(indicators[k]['v']) : addError('Imax', k, 'type');
      }
      const re_L = new RegExp("^L")
      if (re_L.test(k) && k !== 'L1') {
        indicators[k]['t'] === 'n' ? G.push(indicators[k]['v']) : addError('G', k, 'type');
      }
      const re_M = new RegExp("^M")
      if (re_M.test(k) && k !== 'M1') {
        if (indicators[k]['t'] === 's') {
          if (indicators[k]['v'].length > 12) {
            addError('ID', k, 'value');
          } else {
            ID.push(indicators[k]['v']);
          }
        } else {
          addError('ID', k, 'type');
        }
      }
      const re_N = new RegExp("^N")
      if (re_N.test(k) && k !== 'N1') {
        name.push(indicators[k]['v'])
      }
      const re_O = new RegExp("^O")
      if (re_O.test(k) && k !== 'O1') {
        color.push(indicators[k]['v'])
      }
    })

    // Verify the dimensions of arrays
    if (I0.length !== qm.length) {
      addError('qm', null, 'dimension');
    }
    if (I0.length !== alpha.length) {
      addError('alpha', null, 'dimension');
    }
    if (I0.length !== alpha_prime.length) {
      addError('alpha_prime', null, 'dimension');
    }
    if (I0.length !== beta.length) {
      addError('beta', null, 'dimension');
    }
    if (I0.length !== R.length) {
      addError('R', null, 'dimension');
    }
    if (I0.length !== rl.length) {
      addError('rl', null, 'dimension');
    }
    if (I0.length !== Imax.length) {
      addError('Imax', null, 'dimension');
    }
    if (I0.length !== Imin.length) {
      addError('Imin', null, 'dimension');
    }
    if (I0.length !== name.length) {
      addError('name', null, 'dimension');
    }

    // Verify values
    // (nj is a global value from numjs script)
    // eslint-disable-next-line no-undef
    if (!(nj.sum(R) > 0)) {
      addError('R', null, 'zero');
    }
  }
  if (!error) {
    return { I0, IF, alpha, alpha_prime, beta, success_rates, R, qm, rl, Imax, Imin, G, ID, color, name }
  } else {
    return res_indicator_error
  }
}

export { validateIndicators };
