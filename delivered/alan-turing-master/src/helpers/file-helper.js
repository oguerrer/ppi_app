const SIZE_UNITS = [
  'b',
  'kb',
  'mb',
  'gb',
];

/**
 *
 * @param {number} size
 * @returns string
 *
 * Given a number, returns the humanized size in bit magnitudes,
 * rounded down to the biggest order of magnitude.
 *
 * @example humanizedFileSize(25660)
 * // Returns '25kb'
 *
 * @example humanizedFileSize(456_040_020)
 * // Returns '456mb'
 *
 * @example humanizedFileSize(1)
 * // Returns '1b'
 */
export const humanizedFileSize = (size) => {
  // This is the order of magnitude of the size.
  // if `size` === 1_000_000 then `magnitude` === 2 (mb)
  const magnitude = Math.floor(Math.log(size) / Math.log(1000));
  const sizeUnit = SIZE_UNITS[magnitude];

  const humanizedSize = Math.floor(size / (1000 ** (magnitude)));

  return `${humanizedSize}${sizeUnit}`;
};

export const getFileExtension = (file) => {
  const splitFileName = file.name ? file.name.split('.') : file.split('.');

  return splitFileName[splitFileName.length - 1];
};

export const FILE_READING_OPTIONS = {
  DATA_URL: 'DATA_URL',
  TEXT: 'TEXT',
};
export const readLocalFile = (file, as = FILE_READING_OPTIONS.DATA_URL) => {
  return new Promise((resolve) => {
    // NOTE: this logic is inspired on https://stackoverflow.com/questions/24585189/rendering-image-for-preview-from-selected-file-in-file-input-tag
    const fr = new FileReader();
    if (as === FILE_READING_OPTIONS.DATA_URL) {
      fr.readAsDataURL(file);
    } else if (as === FILE_READING_OPTIONS.TEXT) {
      fr.readAsText(file);
    }
    // NOTE: This has to be a function expression and NOT
    // an arrow function. If not then `this` will be undefined.
    fr.onload = function(){
      resolve(this.result);
    }
  });
};

export const parseCsv = (csvString) => {
  return csvString.split(/(?:\r\n|\n)/).filter(Boolean).map(row => (
    // NOTE: if a cell contains a comma then its contents are wrapped in
    // double quotes. This means we need to split the string by double quotes and then
    // by comma.
    row.split(/(".*?"),?/).reduce((acc, item) => {
      if (item.match(/^".*"$/)) {
        return [
          ...acc,
          item.replace(/"/g, ''),
        ];
      } else {
        return [
          ...acc,
          ...item.split(','),
        ];
      }
    }, []).filter(Boolean)
  ));
};

export const getFileExtention = (file) => {
  let fileType;
  if (file.type === 'application/vnd.ms-excel') {
    fileType = 'xls';
  } else if (file.type
    === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    fileType = 'xlsx';
  }
  return fileType;
}

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = error => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
