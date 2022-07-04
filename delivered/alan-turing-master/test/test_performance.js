var run_fun = require('../src/run')
var val_fun = require('../src/validate_functions')
var { assert } =require('../src/helpers/utils')

function test_performance_ppi(){
    const val_ind = val_fun.validate_indicators('xlsx', '/test/template_indicators.xlsx', indicator_sheet='example')

    const val_bs = val_fun.validate_budget('xlsx', '/test/template_budget.xlsx', val_ind.R,
                        budget_sheet='example_expenditure', relation_table_sheet='example_relation_table')

    const val_net = val_fun.validate_network('xlsx', '/test/template_network.xlsx', val_ind.ID,
                        network_sheet='example_network')

    starting_time = performance.now()
    a = run_fun.ppi(I0=val_ind.IF, alphas=val_ind.alpha, alphas_prime=val_ind.alpha_prime,
            betas=val_ind.beta, A=val_net.A, R=val_ind.R, null, qm=val_ind.qm, rl=val_ind.rl, val_ind.Imax, val_ind.Imin,
            Bs=val_bs.Bs, B_dict=val_bs.B_dict, val_ind.G, 50, null, test=true)
    final_time = performance.now()

    console.log('Test ppi finalized in %d ms.', final_time - starting_time)
};

test_performance_ppi()
