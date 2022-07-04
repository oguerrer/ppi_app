import * as XLSX from 'xlsx';
import { getBase64 } from "../file-helper"

const validateNetwork = async (format, f, ID, network_sheet = 'template_network') => {

  let res_network_error = {
    'sender_id': [],
    'values': [],
    error: false,
  }

  const N = ID.length

  // Verify values
  // (nj is a global value from numjs script)
  // eslint-disable-next-line no-undef
  let A = nj.zeros([N, N])

  if (format !== 'xlsx' && format !== 'xls') {
    throw new Error("Wrong format file");
  } else {
    const f64 = await getBase64(f);
    const file = XLSX.read(f64, { type: 'base64' });
    
    

    const net = file.Sheets[network_sheet]
    let range = '';
    if (N === 0) {
      // If doesn't exist array names will be set by numbers from 1 to array indicators length
      range = XLSX.utils.decode_range(net['!ref'])
      for (var r = (range.s.r + 1); r <= range.e.r; r += 1) {
        net[XLSX.utils.encode_cell({ c: 0, r: r })]['v'] = r
      }
      // XLSX.writeFile(file, dir + file_path)

    } else {
      var cont = 0

      // Verify if indicators names are correctly
      Object.keys(net).map((k) => {
        const re_A = new RegExp("^A[0-9]")
        if (re_A.test(k) && k !== 'A1') {
          if (net[k]['v'] === ID[cont]) {
            cont += 1
          } else {
            res_network_error['sender_id'].push(k)
            cont += 1
            res_network_error.error = true;
          }
        }
      })

      // Convert to NdArray matrix and doing the diagonal zero
      range = XLSX.utils.decode_range(net['!ref'])
      for (var r = (range.s.r + 1); r <= range.e.r; r += 1) {
        for (var c = (range.s.c + 1); c <= range.e.c; c += 1) {
          if (r !== c) {
            if (isNaN(net[XLSX.utils.encode_cell({ c: c, r: r })]['v'])) {
              res_network_error['values'].push(XLSX.utils.encode_cell({ c: c, r: r }))
              res_network_error.error = true;
            } else {
              A.set((r - 1), (c - 1), net[XLSX.utils.encode_cell({ c: c, r: r })]['v'])
            }
          }
        }
      }
    }
  }
  if (!Object.values(res_network_error).filter(i => i.length > 0).length) {
    return { A }
  } else {
    return res_network_error
  }
}

export { validateNetwork };
