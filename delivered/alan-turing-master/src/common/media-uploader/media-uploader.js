import React, { useState } from 'react';
import PropTypes, { arrayOf, number, string } from 'prop-types';

import { ReactComponent as UploadIcon } from '../../assets/images/upload.svg';
import { ReactComponent as AlertIcon } from '../../assets/images/alert.svg';
import styles from './media-uploader.module.scss';
import textStyles from '../../assets/stylesheets/text-styles.module.scss';
import { getFileExtension } from '../../helpers/file-helper';
import { FileBlock } from './file-block';
import { Typography } from '@mui/material';


const IPropTypes = {
  className: PropTypes.string,
  onFileSelection: PropTypes.func,
  onFileUpload: PropTypes.func,
  maxFiles: number.isRequired,
  previewsPerLine: number,
  supportedExtensions: arrayOf(string).isRequired,
  instantUpload: PropTypes.bool,
  fileGroupId: PropTypes.string,
  typeParameter: PropTypes.string,
  uploadUrl: PropTypes.func,
  onError: PropTypes.func,
};

const defaultProps = {
  className: '',
  onFileSelection: () => {},
  onFileUpload: () => {},
  previewsPerLine: 1,
  instantUpload: false,
  fileGroupId: null,
  typeParameter: null,
  uploadUrl: null,
  onError: () => { },
  disabled: false,
};

const extensionIsSupported = (extension, supportedExtensions) => supportedExtensions.some(ext => ext.toLocaleLowerCase() === extension.toLocaleLowerCase());

const generateFileKey = file => `${file.name}-${file.size}-${file.type}-${file.lastModified}`;

const MediaUploader = ({
  className,
  onFileSelection,
  onFileUpload,
  maxFiles,
  previewsPerLine,
  supportedExtensions,
  uploadImmediately,
  fileGroupId,
  typeParameter,
  uploadUrl,
  onError,
  disabled,
}) => {
  const [fileData, setFileData] = useState([]);
  const [fileHover, setFileHover] = useState(false);
  const [invalidFormat, setInvalidFormat] = useState(false);

  const addToFileList = (fileList) => {
    setInvalidFormat(false);
    const newAdditions = Array.from(fileList)
      .filter(file => !fileData.map(data => data.key).includes(generateFileKey(file)))
    const validAdditions = newAdditions.filter(file => extensionIsSupported(getFileExtension(file), supportedExtensions));
    if (newAdditions.length > validAdditions.length) {
      // Some file has invalid format
      setInvalidFormat(true);
    }
    const newFileData = validAdditions.map(file => ({
      file,
      key: generateFileKey(file),
      url: null,
    }));
    const newFiles = [...fileData, ...newFileData];
    if (newFiles.length > maxFiles) {
      return;
    }
    setFileData(newFiles);
    onFileSelection(newFiles.map(data => data.file));
  }

  const fileUploaded = (targetData, url) => {
    const updatedDataList = [...fileData].map(data => {
      if (data.key === targetData.key) {
        return {
          ...targetData,
          url,
        };
      } else {
        return data;
      }
    });
    setFileData(updatedDataList);
    onFileUpload(updatedDataList.map(data => data.url).filter(Boolean));
  };

  const onFileChange = (e) => {
    addToFileList(e.target.files);
  };

  const onDragOver = e => {
    setFileHover(true);
    e.preventDefault();
  }

  const onDrop = (e) => {
    setFileHover(false);
    e.preventDefault();
    const newFiles = e.dataTransfer.files || [];
    addToFileList(newFiles);
  }

  const removeFile = (dataToRemove) => {
    setFileData([]);
    onFileSelection(null);
  };

  const filePreviewWidth = `calc(100% / ${previewsPerLine} - 3% * ${previewsPerLine - 1})`;
  return (
    <div className={className}>
      <div
        className={[styles.uploaderContainer, fileHover ? styles.fileHover : ''].join(' ')}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setFileHover(false)}
      >
        {fileData.length === 0
        && (
          <div className={styles.textContainer}>
            <div className={styles.row}>
              <UploadIcon className={styles.downloadIcon}/>
              <div className={[styles.column, styles.text].join(' ')}>
                <p className={textStyles.bodyMedium}>
                  Drag and drop your file here
                </p>
                {
                  !invalidFormat
                  && (
                    <p className={styles.subText}>
                      supportedExtensions
                      ({supportedExtensions.join(', ')}) max {maxFiles}.
                    </p>
                  )}
            </div>
              <input
                type="file"
                className={styles.browseButton}
                onChange={onFileChange}
                disabled={(fileData && fileData.length === 1) || disabled}
              />
              {
                !!invalidFormat
                && (
                  <p className={[textStyles.paragraphReg, styles.invalidFormat].join(' ')}>
                    Invalid file format
                  </p>
                )
              }
            </div>
          </div>
        )}
        {
          fileData.map((data) => (
            <FileBlock
              fileData={data}
              className={styles.mediaCard}
              style={{ width: filePreviewWidth }}
              key={data.key}
              onRemove={() => removeFile(data)}
              onUpload={(url) => fileUploaded(data, url)}
              uploadImmediately={uploadImmediately}
              fileGroupId={fileGroupId}
              typeParameter={typeParameter}
              uploadUrl={uploadUrl}
              onError={onError}
            />
          ))
        }
      </div>
      {fileData.length !== 0
      && (
        <Typography className={styles.replaceText}>
          To replace the file for a new one, please delete the current one.
        </Typography>
      )}
    </div>
  )
};

MediaUploader.propTypes = IPropTypes;
MediaUploader.defaultProps = defaultProps;

export { MediaUploader };
