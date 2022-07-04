import * as XLSX from 'xlsx';
import { getBase64 } from '../file-helper';

const validateBudget = async (format, f, indicatorsResult, budget_sheet = 'template_expenditure',
  relation_table_sheet = 'template_relation_table') => {
  const R = indicatorsResult.R;
  var re = new RegExp("^program");
  let res_exp_error = {
    'expenditure': [],
    'program_id': [],
    'out_of_programs': [],
    error: false,
  }

  if (format !== 'xlsx' && format !== 'xls') {
    throw new Error("Wrong format file");
  } else {
    const f64 = await getBase64(f);
    const file = XLSX.read(f64, { type: 'base64' });

    var program_exp = []
    var Bs = []
    var B_dict = {}

    // Verify errors and storage programs and Bs
    const expend = file.Sheets[budget_sheet]
    Object.keys(expend).map((k) => {
      const value = expend[k]
      if (value['t'] !== 'n' && value['v'] !== 'program_ID' && value['v'] !== 'expenditure' && k !== '!ref' && k !== '!margins') {
        res_exp_error['expenditure'].push(k);
        res_exp_error.error = true;
      } else {
        const re_A = new RegExp("^A")
        if (re_A.test(k) && k !== 'A1') { program_exp.push(value['v']) }
        const re_B = new RegExp("^B")
        if (re_B.test(k) && k !== 'B1') { Bs.push(value['v']) }
      }
    })

    // Verify if relations table has correct values
    const prog = file.Sheets[relation_table_sheet]
    Object.keys(prog).map((k) => {
      const value = prog[k];
      if (value['t'] !== 'n' && value['v'] !== 'indicator_ID' && re.exec(value['v']) == null
        && k !== '!ref' && k !== '!margins') {
        res_exp_error['program_id'].push(k);
        res_exp_error.error = true;
      }
      const re_prog = new RegExp("^A")
      if (!program_exp.includes(value['v']) && value['t'] === 'n' && !re_prog.test(k)) {
        res_exp_error['out_of_programs'].push(k);
        res_exp_error.error = true;
      }
    })

    // Storage into B_dict arrays programs.
    var range = XLSX.utils.decode_range(prog['!ref'])
    for (var r = (range.s.r + 1); r <= range.e.r; r += 1) {
      const aColumnValue = prog[XLSX.utils.encode_cell({ c: 0, r: r })]['v'] - 1;
      B_dict[(aColumnValue).toString()] = [];
      for (var c = (range.s.c + 1); c <= range.e.c; c += 1) {
        if (!(prog[XLSX.utils.encode_cell({ c: c, r: r })] === undefined)) {
          B_dict[(aColumnValue).toString()]
            .push(prog[XLSX.utils.encode_cell({ c: c, r: r })]['v'] - 1)
        }
      }
      if (B_dict[(aColumnValue).toString()].length === 0) {
        res_exp_error['out_of_programs'].push(XLSX.utils.encode_cell({ c: 0, r: r }));
        res_exp_error.error = true;
      }
    }
  }
  if (!Object.values(res_exp_error).filter(i => i.length > 0).length) {
    return { Bs, B_dict }
  } else {
    return res_exp_error
  }
}

export {
  validateBudget,
}
