const getValues = (N) => {
  // (nj is a global value from numjs script)
  // eslint-disable-next-line no-undef
  const rand_override = nj.array([].concat(...Array(12).fill([0.08066209, 0.98050315, 0.91849969, 0.36335001,
    0.41457828, 0.39910388, 0.72283495, 0.43502483, 0.15210684, 0.37843666])))
  return rand_override.slice([N])
}

export { getValues };
