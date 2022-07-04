import React from 'react';
import { Button, Collapse, FormControl, FormControlLabel, InputBase, InputLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, TextField, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import budgetTemplate from '../../../assets/templates/templateBudget.xls';
import styles from './steps.module.scss';
import textStyles from '../../../assets/stylesheets/text-styles.module.scss';
import { CustomBreadcrumbs } from '../breadcrumbs';
import { MediaUploader } from '../../../common/media-uploader/media-uploader';
import { FileValidation } from './validations/fileValidation';
import { validateBudget } from '../../../helpers/validations/validateBudget';
import { getFileExtention } from '../../../helpers/file-helper';

const Budget = (props) => {
  const { nextStep, simulationState, budgetFile, setBudgetFile, indicatorsResult, setBudgetResults, budget, setBudget } = props;
  const [budgetType, setBudgetType] = React.useState('single');
  const [collapsed, setCollapsed] = React.useState(true);
  const [next, setNext] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState(null);


  const uploadFile = async (file) => {
    if (file && file.name) {
      const extention = getFileExtention(file);
      const fileValidation = await validateBudget(extention, file, indicatorsResult);
      setBudgetFile(file);
      if (
        !fileValidation.error
      ) {
        setVerified(true);
        setValidationResult(fileValidation);
        setBudgetResults(fileValidation);
      } else {
        setVerified(false);
        setValidationResult(fileValidation);
      }
    } else {
      setBudgetFile([]);
      setVerified(false);
      setValidationResult(null);
    }
  }

  const canGoNext = () => {
    if (budgetType === 'single' && budget && budget !== '') {
      setBudgetFile(null);
      setVerified(true);
    } else if (budgetFile && budgetFile.length !== 0) {
      setBudget('');
      setVerified(true);
    } else {
      setVerified(false);
    }
  }
  React.useEffect(() => {
    setNext(canGoNext());
  }, [budgetType, budget, budgetFile]);
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.leftDiv}>
          <div className={styles.primaryTitle}>
            <Typography className={textStyles.headingSmallBold}>
              Policy Priority Inference
            </Typography>
          </div>
          <div className={styles.secondaryTitle}>
            <Typography className={textStyles.headingLarge}>
              Budget
            </Typography>
          </div>
          <div className={styles.paragraphDiv}>
            <div className={styles.informationDiv} >
              <ErrorOutlineIcon className={styles.errorIcon} />
              <Typography className={textStyles.headingSmall}>
                Information
              </Typography>
            </div>
            <Typography className={[textStyles.bodyMedium, styles.greyText].join(' ')}>
              Here you can upload data on the average budget that was exercised during the sample period of the indicators. If only have the total amount, then input it in the corresponding field as a single number (option 1). If you have a vector with expenditure disaggregated into different categories, then upload the required files in option 2.
            </Typography>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <CustomBreadcrumbs selected={simulationState} />
          <div className={styles.rightSubDiv}>
            <div className={styles.column}>
              <FormControl className={styles.outerFormControl}>
                <RadioGroup
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                >
                  <FormControlLabel
                    value={'single'}
                    control={<Radio />}
                    label={<Typography className={textStyles.headingSmallBold}>Provide budget as a single number</Typography>}
                  />
                  <Typography className={[textStyles.bodyMedium, styles.mt30].join(' ')}>
                    Enter the average total budget exercised during the sample period of the indicators. If you do not provide any data, PPI will set a budget of 100.
                  </Typography>
                  <div className={[styles.row, styles.mt30, styles.mb52].join(' ')}>
                    <FormControl variant="standard" className={styles.mr70}>
                      <InputLabel shrink htmlFor="budget" className={[textStyles.labelReg, styles.inputLabel].join(' ')}>
                        Total budget
                      </InputLabel>
                      <TextField
                        id="budget"
                        variant="outlined"
                        className={styles.input}
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        disabled={budgetType !== 'single'}
                        type="number"
                      />
                        
                    </FormControl>
                  </div>
                  <div className={styles.separator} />
                  <FormControlLabel
                    value={'disaggregated'}
                    control={<Radio />}
                    label={<Typography className={textStyles.headingSmallBold}>Upload disaggregated budget into expenditure programs</Typography>}
                   />
                  <Typography className={[textStyles.bodyMedium, styles.mt30, styles.mb52].join(' ')}>
                    Provide a vector with the average budget, disaggregated into different categories. This should be a CSV file with a single column and as many rows as categories in the data. Each row should provide the budget allocated to each category.
                  </Typography>
                  <Typography className={textStyles.subtitle}>
                    Upload relation table between indicators and expenditure programs
                  </Typography>
                  <div className={styles.collapsedContainer}>
                    <div className={styles.column}>
                      <Collapse in={collapsed}>
                        <Typography className={textStyles.bodyMedium}>
                          In order to link each expenditure category to one or more indicators, PPI needs a relational table. The table should consist of a CSV file where the first column contains the IDs of all the instrumental indicators.
                        </Typography>
                      </Collapse>
                      <Collapse in={!collapsed}>
                        <Typography className={textStyles.bodyMedium}>
                          In order to link each expenditure category to one or more indicators, PPI needs a relational table. The table should consist of a CSV file where the first column contains the IDs of all the instrumental indicators. In the second column, you need to write the expenditure category in which the indicator is classified. For example, an indicator about extreme poverty may be classified into the expenditure tranche of social development. If an indicator is classified into multiple expenditure categories, you should input those in the second column, and the third, and so forth.
                        </Typography>
                        <Typography className={[textStyles.bodyMedium, styles.mt30].join(' ')}>
                          If your indicator data do not contain a column with IDs, you can use the number of the row of the indicator as its identifier (being 1 the first row/indicator). Likewise, the IDs for the expenditure categories correspond to the row number of each category (starting at 1).
                        </Typography>
                        <Typography className={[textStyles.bodyMedium, styles.mt30].join(' ')}>
                          All the expenditure categories should be linked to at least one instrumental indicator. Only instrumental indicators can be registered in the relational table. The table should not contain any names (headers) in its columns. You can download an example to get a better idea of how this file should look like.
                          Read less
                        </Typography>
                      </Collapse>
                      <Button
                        className={[textStyles.bodyMediumBold, styles.readMore].join(' ')}
                        onClick={() => setCollapsed(!collapsed)}
                      >
                        {collapsed ? 'Read more...' : 'Read less'}
                      </Button>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <div className={styles.fileContainer}>
                <MediaUploader
                  className={styles.mediaUploader}
                  maxFiles={1}
                  previewsPerLine={1}
                  supportedExtensions={['xlsx', 'xls']}
                  onFileSelection={(files) => {
                    if (files) {
                      uploadFile(files[0]);
                    } else {
                      uploadFile([]);
                    }
                  }}
                  disabled={budgetType === 'single'}
                />
                {budgetFile
                  && budgetFile.length !== 0
                  && validationResult
                  && budgetFile.name
                  && (
                    <FileValidation component="budget" verified={verified} validationResult={validationResult} />
                  )}
              </div>
            </div>
            <a download href={budgetTemplate} className={[styles.downloadLink, styles.end].join(' ')}>
              <div className={[styles.downloadTemplateButton, styles.mt155].join(' ')}>Download example</div>
            </a>
          </div>
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        <button
          className={[textStyles.bodyMediumBold, styles.nextButton].join(' ')}
          onClick={() => {nextStep(); setVerified(true)}}
          disabled={!verified}
        >
          Next
          <NavigateNextIcon className={styles.icon} />
        </button>
      </div>
    </div>
  )
}

export { Budget };
