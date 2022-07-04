/* import nj from 'numjs';
import XLSX from 'xlsx';

// template_network, template, template_expenditure, template_relation_table

function validate_budget(format, file_path, R, budget_sheet='template_expenditure',
                         relation_table_sheet='template_relation_table') {
    var re = new RegExp("^program");

    const dir = process.cwd()

    let res_exp_error = {
        'expenditure': [],
        'program_id': [],
        'out_of_programs': []
    }

    if (format != 'xlsx'){
        throw new Error("Wrong format file");
    } else {
        const file = XLSX.readFile(dir + file_path)

        var program_exp = []
        var Bs = []
        var B_dict = {}

        // Verify errors and storage programs and Bs
        const expend = file.Sheets[budget_sheet]
        Object.keys(expend).map(k => {
            const value = expend[k]
            if (value['t'] != 'n' && value['v'] != 'program_ID' && value['v'] != 'expenditure' && k!='!ref' && k!='!margins'){
                res_exp_error['expenditure'].push(k)
            } else{
                const re_A = new RegExp("^A")
                if (re_A.test(k) && k != 'A1'){ program_exp.push(value['v']) }
                const re_B = new RegExp("^B")
                if (re_B.test(k) && k != 'B1'){ Bs.push(value['v']) }
            }
        })

        // Verify if relations table has correct values
        const prog = file.Sheets[relation_table_sheet]
        Object.keys(prog).map(k => {
            const value = prog[k]
            if (value['t'] != 'n' && value['v'] != 'indicator_ID' && re.exec(value['v']) == null
                 && k!='!ref' && k!='!margins'){
                res_exp_error['program_id'].push(k)
            }
            const re_prog = new RegExp("^A")
            if (!program_exp.includes(value['v']) && value['t'] == 'n' && !re_prog.test(k)){
                res_exp_error['out_of_programs'].push(k)
            }
        })

        // Storage into B_dict arrays programs.
        var range = XLSX.utils.decode_range(prog['!ref'])
        for (var r = (range.s.r+1); r <= range.e.r; r+=1){
            if (R[r-1] == 1){
                B_dict[(r-1).toString()] = []
            } else {
                continue
            }
            for (var c = (range.s.c+1); c <= range.e.c; c+=1){
                if (!(prog[XLSX.utils.encode_cell({ c: c, r: r })] === undefined)){
                    B_dict[(r-1).toString()]
                        .push(prog[XLSX.utils.encode_cell({ c: c, r: r })]['v']-1)
                }
            }
            if (B_dict[(r-1).toString()].length == 0){
                res_exp_error['out_of_programs'].push(XLSX.utils.encode_cell({ c: 0, r: r }))
            }
        }
    }
    if (!Object.values(res_exp_error).filter(i => i.length > 0).length){
        return {Bs, B_dict}
    } else {
        return res_exp_error
    }
}

function validate_indicators(format, file_path, indicator_sheet='template'){

    const dir = process.cwd()

    let res_indicator_error = {
        'type': [],
        'dimension': [],
        'values': [],
    }

    if (format != 'xlsx'){
        throw new Error("Wrong format file");
    } else {
        const file = XLSX.readFile(dir + file_path)

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
        Object.keys(indicators).map(k => {
            const re_A = new RegExp("^A")
            if (re_A.test(k) && k != 'A1'){
                indicators[k]['t'] == 'n' ? I0.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_B = new RegExp("^B")
            if (re_B.test(k) && k != 'B1'){
                indicators[k]['t'] == 'n' ? IF.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_C = new RegExp("^C")
            if (re_C.test(k) && k != 'C1'){
                indicators[k]['t'] == 'n' ? alpha.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_D = new RegExp("^D")
            if (re_D.test(k) && k != 'D1'){
                indicators[k]['t'] == 'n' ? alpha_prime.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_E = new RegExp("^E")
            if (re_E.test(k) && k != 'E1'){
                indicators[k]['t'] == 'n' ? beta.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_F = new RegExp("^F")
            if (re_F.test(k) && k != 'F1'){
                if (indicators[k]['t'] == 'n'){
                    if (indicators[k]['v'] <= 0 || indicators[k]['v'] >= 1){
                        res_indicator_error['values'].push(k)
                    } else {
                        success_rates.push(indicators[k]['v'])
                    }
                } else {
                    res_indicator_error['type'].push(k)
                }
            }
            const re_G = new RegExp("^G")
            if (re_G.test(k) && k != 'G1'){
                if (indicators[k]['t'] == 'n'){
                    if (indicators[k]['v'] == 1 || indicators[k]['v'] == 0){
                        R.push(indicators[k]['v'])
                    } else{
                        res_indicator_error['values'].push(k)
                    }
                } else {
                    res_indicator_error['type'].push(k)
                }
            }
            const re_H = new RegExp("^H")
            if (re_H.test(k) && k != 'H1'){
                if (indicators[k]['t'] == 'n'){
                    if (indicators[k]['v'] < 0 || indicators[k]['v'] >=1){
                        res_indicator_error['values'].push(k)
                    } else {
                        qm.push(indicators[k]['v'])
                    }
                } else {
                    res_indicator_error['type'].push(k)
                }
            }
            const re_I = new RegExp("^I")
            if (re_I.test(k) && k != 'I1'){
                if (indicators[k]['t'] == 'n'){
                    if (indicators[k]['v'] < 0 || indicators[k]['v'] >= 1){
                        res_indicator_error['values'].push(k)
                    } else {
                        rl.push(indicators[k]['v'])
                    }
                } else {
                    res_indicator_error['type'].push(k)
                }  
            }
            const re_J = new RegExp("^J")
            if (re_J.test(k) && k !='J1'){
                indicators[k]['t'] == 'n' ? Imin.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_K = new RegExp("^K")
            if (re_K.test(k) && k != 'K1'){
                indicators[k]['t'] == 'n' ? Imax.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_L = new RegExp("^L")
            if (re_L.test(k) && k != 'L1'){
                indicators[k]['t'] == 'n' ? G.push(indicators[k]['v']) : res_indicator_error['type'].push(k)
            }
            const re_M = new RegExp("^M")
            if (re_M.test(k) && k != 'M1'){
                if (indicators[k]['t'] == 's'){
                    if (indicators[k]['v'].length > 12){
                        res_indicator_error['values'].push(k)
                    } else {
                        ID.push(indicators[k]['v'])
                    }
                } else {
                    res_indicator_error['type'].push(k)
                }  
            }
            const re_N = new RegExp("^N")
            if (re_N.test(k) && k != 'N1'){
                name.push(indicators[k]['v'])
            }
            const re_O = new RegExp("^O")
            if (re_O.test(k) && k != 'O1'){
                color.push(indicators[k]['v'])
            }
        })

        // Verify Data Integrity
        if (success_rates.length == 0){
            if (alpha.length == 0){
                res_indicator_error['values'].push('alpha is required')
            } else if (alpha_prime.length == 0){
                res_indicator_error['values'].push('alpha_prime is required')
            } else if (beta.length == 0){
                res_indicator_error['values'].push('beta is required')
            }
        } 
        if (alpha.length == 0 || alpha_prime.length == 0 || beta.length == 0){
            if (success_rates.length == 0){
                res_indicator_error['values'].push('success_rate is required')
            }
        }

        // Verify the dimensions of arrays
        if (I0.length != qm.length){
            res_indicator_error['dimension'].push('qm')
        }
        if (I0.length != alpha.length){
            res_indicator_error['dimension'].push('alpha')
        }
        if (I0.length != alpha_prime.length){
            res_indicator_error['dimension'].push('alpha_prime')
        }
        if (I0.length != beta.length){
            res_indicator_error['dimension'].push('qm')
        }
        if (I0.length != R.length){
            res_indicator_error['dimension'].push('R')
        }
        if (I0.length != rl.length){
            res_indicator_error['dimension'].push('rl')
        }
        if (I0.length != Imax.length){
            res_indicator_error['dimension'].push('Imax')
        }
        if (I0.length != Imin.length){
            res_indicator_error['dimension'].push('Imin')
        }
        if (I0.length != name.length){
            res_indicator_error['dimension'].push('Name')
        }

        // Verify values
        if (!(nj.sum(R) > 0)){
            res_indicator_error['values'].push('At less one value must be > 0')
        }
    }
    if (!Object.values(res_indicator_error).filter(i => i.length > 0).length){
        return {I0, IF, alpha, alpha_prime, beta, success_rates, R, qm, rl, Imax, Imin, G, ID}
    } else {
        return res_indicator_error
    }
}

function validate_network(format, file_path, ID, network_sheet='template_network'){

    const dir = process.cwd()

    let res_network_error = {
        'sender_id': [],
        'values': [],
    }

    const N = ID.length

    let A = nj.zeros([N,N])

    if (format != 'xlsx'){
        throw new Error("Wrong format file");
    } else {
        const file = XLSX.readFile(dir + file_path)

        const net = file.Sheets[network_sheet]

        if (N == 0){
            // If doesn't exist array names will be set by numbers from 1 to array indicators length
            var range = XLSX.utils.decode_range(net['!ref'])
            for (var r = (range.s.r+1); r <= range.e.r; r+=1){
                net[XLSX.utils.encode_cell({ c: 0, r: r })]['v']=r
            }
            XLSX.writeFile(file, dir+file_path)

        } else {
            var cont = 0

            // Verify if indicators names are correctly
            Object.keys(net).map(k => {
                const re_A = new RegExp("^A[0-9]")
                if (re_A.test(k) && k != 'A1'){
                    if (net[k]['v'] == ID[cont]){
                        cont+=1
                    } else {
                        res_network_error['sender_id'].push(k)
                        cont +=1
                    }
                }
            })

            // Convert to NdArray matrix and doing the diagonal zero
            var range = XLSX.utils.decode_range(net['!ref'])
            for (var r = (range.s.r+1); r <= range.e.r; r+=1){
                for (var c = (range.s.c+1); c <= range.e.c; c+=1){
                    if (r!=c){
                        if (isNaN(net[XLSX.utils.encode_cell({ c: c, r: r })]['v'])){
                            res_network_error['values'].push(XLSX.utils.encode_cell({ c: c, r: r }))
                        } else {
                            A.set((r-1), (c-1), net[XLSX.utils.encode_cell({ c: c, r: r })]['v'])
                        }
                    }
                }
            }
        }
    }
    if (!Object.values(res_network_error).filter(i => i.length > 0).length){
        return {A}
    } else {
        return res_network_error
    }
}

module.exports = {validate_budget,validate_indicators,validate_network} */
