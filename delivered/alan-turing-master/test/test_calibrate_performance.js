const test_funcs = require('./test_ppi_calibrate_funcs')

function test_performance_calibrate(){

    init_time_calibrate = performance.now()
    test_funcs.test_calibrate()
    final_time_calibrate = performance.now()

    console.log('Test calibrate finalized in %d minutes.', (final_time_calibrate - init_time_calibrate) / 60000)
}

console.log('---------- Test calibrate ----------')

test_performance_calibrate()
