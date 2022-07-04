import * as ops from 'ndarray-ops';

// eslint-disable-next-line no-undef
nj.NdArray.prototype.gt = function (x, copy = true) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;

  if (isNumber(x)) {
    ops.gtseq(arr.selection, x);
    return arr;
  } else {
    // eslint-disable-next-line no-undef
    x = createArray(x, this.dtype);
    ops.gteq(arr.selection, x.selection);
    return arr;
  }
};

// eslint-disable-next-line no-undef
nj.NdArray.prototype.lt = function (x, copy = true) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;

  if (isNumber(x)) {
    ops.ltseq(arr.selection, x);
    return arr;
  } else {
    // eslint-disable-next-line no-undef
    x = createArray(x, this.dtype);
    ops.lteq(arr.selection, x.selection);
    return arr;
  }
};

function isNumber(value) {
  return typeof value === 'number';
}
