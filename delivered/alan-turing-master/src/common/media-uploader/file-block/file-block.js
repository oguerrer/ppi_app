import React from 'react';
import PropTypes from 'prop-types';

import { humanizedFileSize } from '../../../helpers/file-helper';
import textStyles from '../../../assets/stylesheets/text-styles.module.scss';
import styles from './file-block.module.scss';
import { ReactComponent as TrashIcon } from '../../../assets/images/trash.svg';

const IPropTypes = {
  fileData: PropTypes.shape({
    file: PropTypes.instanceOf(File),
  }).isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  onRemove: PropTypes.func,
  onUpload: PropTypes.func,
  uploadImmediately: PropTypes.bool,
  fileGroupId: PropTypes.string,
  typeParameter: PropTypes.string,
  uploadUrl: PropTypes.func,
  onError: PropTypes.func,
};

const defaultProps = {
  style: {},
  className: '',
  onRemove: () => {},
  onUpload: () => {},
  uploadImmediately: false,
  fileGroupId: null,
  typeParameter: null,
  uploadUrl: null,
  onError: () => {},
};

const FileBlock = ({
  fileData,
  className,
  style,
  onRemove,
  onUpload,
  uploadImmediately,
  fileGroupId,
  typeParameter,
  uploadUrl,
  onError,
}) => {


  return (
    <div
      className={[className, styles.container].join(' ')}
      style={style}
    >
      <div className={styles.dataContainer}>
        <p className={[textStyles.bodyReg, styles.marginB10].join(' ')}>
          <span className={styles.fileName}>
            {fileData.file.name}
          </span>
          <span className={styles.fileSize}>
            {humanizedFileSize(fileData.file.size)}
          </span>
        </p>
        {
          <div className={styles.loadingBar}>
            <div className={styles.progress} style={{ width: `100%` }} />
          </div>
        }
      </div>
      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
      >
        <TrashIcon />
      </button>
    </div>
  )
};

FileBlock.propTypes = IPropTypes;
FileBlock.defaultProps = defaultProps;

export { FileBlock };
