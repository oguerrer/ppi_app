var run_fun = require('../src/run')
var val_fun = require('../src/validate_functions')
var { assert } =require('../src/helpers/utils')
var XLSX = require("xlsx");
var nj = require('numjs')

function test_ppi(){

    const dir = process.cwd()
    const val_ind = val_fun.validate_indicators('xlsx', '/test/template_indicators.xlsx', indicator_sheet='example')

    const val_bs = val_fun.validate_budget('xlsx', '/test/template_budget.xlsx', val_ind.R,
                        budget_sheet='example_expenditure', relation_table_sheet='example_relation_table')

    const val_net = val_fun.validate_network('xlsx', '/test/template_network.xlsx', val_ind.ID,
                        network_sheet='example_network')

    var sols = []

    for (itera in Array.from({ length: 1 })){
        sols.push(run_fun.ppi(I0=val_ind.IF, alphas=val_ind.alpha, alphas_prime=val_ind.alpha_prime,
            betas=val_ind.beta, A=val_net.A, R=val_ind.R, null, qm=val_ind.qm, rl=val_ind.rl, val_ind.Imax, val_ind.Imin,
            Bs=val_bs.Bs, B_dict=val_bs.B_dict, val_ind.G, 3, null, test=true, for_calibrate=false))
    }

    var tsI = sols.map(i => i[0])
    var tsC = sols.map(i => i[1])
    var tsF = sols.map(i => i[2])
    var tsP = sols.map(i => i[3])
    var tsS = sols.map(i => i[4])
    var tsG = sols.map(i => i[5])

    var file = XLSX.readFile(dir + '/test/sim_outputs.csv')

    var sim_1 = []
    var sim_2 = []
    var sim_3 = []

    const indicators = file.Sheets['Sheet1']

    Object.keys(indicators).map(k => {
        const re_B = new RegExp("^B")
        if (re_B.test(k) && k != 'B1'){
            sim_1.push(indicators[k]['v'])
        }
        const re_C = new RegExp("^C")
        if (re_C.test(k) && k != 'C1'){
            sim_2.push(indicators[k]['v'])
        }
        const re_D = new RegExp("^D")
        if (re_D.test(k) && k != 'D1'){
            sim_3.push(indicators[k]['v'])
        }
    })

    var sim = []
    sim = sim.concat(sim_1)
    sim = sim.concat(sim_2)
    sim = sim.concat(sim_3)

    tsI_list = tsI[0]['selection'].data
    var comparison = [...Array(tsI[0].size).keys()].map(i => Math.abs(tsI_list[i] - sim[i]) > 0.001)

    assert(nj.sum(comparison) == 0,
        `The difference between test_values and real_values is larger than 0.001 in ${nj.sum(comparison)} cases.`)

}

function test_calibrate(){

    const dir = process.cwd()

    let val_ind = val_fun.validate_indicators('xlsx', '/test/template_indicators.xlsx', indicator_sheet='example')

    let val_bs = val_fun.validate_budget('xlsx', '/test/template_budget.xlsx', val_ind.R,
                    budget_sheet='example_expenditure', relation_table_sheet='example_relation_table')

    let val_net = val_fun.validate_network('xlsx', '/test/template_network.xlsx', val_ind.ID,
                    network_sheet='example_network')

    sols = run_fun.calibrate(val_ind.I0, val_ind.IF, val_ind.success_rates, val_net.A, val_ind.R,val_ind.qm,val_ind.rl,val_bs.Bs,
                val_bs.B_dict,50,null,0.6,true,101,1000, false,10, true)

    var file = XLSX.readFile(dir + '/test/parameters.csv')

    var sim_1 = []
    var sim_2 = []
    var sim_3 = []
    var sim_4 = []
    var sim_5 = []
    var sim_6 = []
    var sim_7 = []
    var sim_8 = []

    const indicators = file.Sheets['Sheet1']
    Object.keys(indicators).map(k => {
        const re_A = new RegExp("^A")
        if (re_A.test(k) && k != 'A1'){
            sim_1.push(indicators[k]['v'])
        }
        const re_B = new RegExp("^B")
        if (re_B.test(k) && k != 'B1'){
            sim_2.push(indicators[k]['v'])
        }
        const re_C = new RegExp("^C")
        if (re_C.test(k) && k != 'C1'){
            sim_3.push(indicators[k]['v'])
        }
        const re_D = new RegExp("^D")
        if (re_D.test(k) && k != 'D1'){
            sim_4.push(indicators[k]['v'])
        }
        const re_E = new RegExp("^E")
        if (re_E.test(k) && k != 'E1'){
            sim_5.push(indicators[k]['v'])
        }
        const re_F = new RegExp("^F")
        if (re_F.test(k) && k != 'F1'){
            sim_6.push(indicators[k]['v'])
        }
        const re_G = new RegExp("^G")
        if (re_G.test(k) && k != 'G1'){
            sim_7.push(indicators[k]['v'])
        }
        const re_H = new RegExp("^H")
        if (re_H.test(k) && k != 'H1'){
            sim_8.push(indicators[k]['v'])
        }
    })

    var sim = []
    sim = sim.concat(sim_1)
    sim = sim.concat(sim_2)
    sim = sim.concat(sim_3)
    sim = sim.concat(sim_4)
    sim = sim.concat(sim_5)
    sim = sim.concat(sim_6)
    sim = sim.concat(sim_7)
    sim = sim.concat(sim_8)

    var comparison = [...Array(sols.size).keys()].map(i => Math.abs(sols['selection'].data[i] - sim[i]) > 0.001)

    assert(nj.sum(comparison) == 0,
        `The difference between test_values and real_values is larger than 0.001 in ${nj.sum(comparison)} cases.`)

}

test_ppi()

module.exports = { test_ppi, test_calibrate }
