import { Typography } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import styles from './fileValidation.module.scss';
import textStyles from '../../../../assets/stylesheets/text-styles.module.scss';

const FileValidation = (props) => {
  const { verified, component, validationResult } = props;
  if (verified) {
    return (
      <div>
        <Typography className={[textStyles.subtitle, styles.title].join(' ')}>
          File Validation
        </Typography>
        <div className={styles.valueDiv}>
          <div className={styles.verificationDiv}>
            <CheckIcon className={styles.checkIcon} />
            <Typography className={textStyles.labelReg}>File validation succeeded!</Typography>
          </div>
        </div>
      </div>
    );
  }
  if (component === 'indicator') {
    return (
      <div>
        <Typography className={[textStyles.subtitle, styles.title].join(' ')}>
          File Validation
        </Typography>
        {(validationResult.I0.type
          || validationResult.I0.dimension
          || validationResult.I0.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                I0 (required always)
              </Typography>
              {validationResult.I0.type
              && (
                <div className={styles.verificationDiv}>
                  <CloseIcon className={styles.closeIcon} />
                  <Typography className={textStyles.labelReg}>{validationResult.I0.type}</Typography>
                </div>
              )}
              {validationResult.I0.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.I0.dimension}</Typography>
                  </div>
                )}
              {validationResult.I0.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.I0.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.IF.type
          || validationResult.IF.dimension
          || validationResult.IF.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                IF (required always)
              </Typography>
              {validationResult.IF.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                  <Typography className={textStyles.labelReg}>{validationResult.IF.type}</Typography>
                  </div>
                )}
              {validationResult.IF.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.IF.dimension}</Typography>
                  </div>
                )}
              {validationResult.IF.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.IF.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.alpha.type
          || validationResult.alpha.dimension
          || validationResult.alpha.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                alpha (required if column ‘success_rate’ is not provided)
              </Typography>
              {validationResult.alpha.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.alpha.type}</Typography>
                  </div>
                )}
              {validationResult.alpha.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.alpha.dimension}</Typography>
                  </div>
                )}
              {validationResult.alpha.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.alpha.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.alpha_prime.type
          || validationResult.alpha_prime.dimension
          || validationResult.alpha_prime.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                alpha_prime (required if column ‘success_rate’ is not provided)
              </Typography>
              {validationResult.alpha_prime.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.alpha_prime.type}</Typography>
                  </div>
                )}
              {validationResult.alpha_prime.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.alpha_prime.dimension}</Typography>
                  </div>
                )}
              {validationResult.alpha_prime.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.alpha_prime.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.beta.type
          || validationResult.beta.dimension
          || validationResult.beta.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                beta (required if column ‘success_rate’ is not provided)
              </Typography>
              {validationResult.beta.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.beta.type}</Typography>
                  </div>
                )}
              {validationResult.beta.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.beta.dimension}</Typography>
                  </div>
                )}
              {validationResult.beta.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.beta.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.success_rates.type
          || validationResult.success_rates.dimension
          || validationResult.success_rates.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                success_rate (required if column ‘alpha’ or ‘alpha_prime’, or ‘beta’ is not provided)
              </Typography>
              {validationResult.success_rates.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.success_rates.type}</Typography>
                  </div>
                )}
              {validationResult.success_rates.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.success_rates.dimension}</Typography>
                  </div>
                )}
              {validationResult.success_rates.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.success_rates.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.R.type
          || validationResult.R.dimension
          || validationResult.R.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                R (optional)
              </Typography>
              {validationResult.R.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.R.type}</Typography>
                  </div>
                )}
              {validationResult.R.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.R.dimension}</Typography>
                  </div>
                )}
              {validationResult.R.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.R.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.qm.type
          || validationResult.qm.dimension
          || validationResult.qm.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                qm (optional)
              </Typography>
              {validationResult.qm.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.qm.type}</Typography>
                  </div>
                )}
              {validationResult.qm.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.qm.dimension}</Typography>
                  </div>
                )}
              {validationResult.qm.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.qm.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.rl.type
          || validationResult.rl.dimension
          || validationResult.rl.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                rl (optional)
              </Typography>
              {validationResult.rl.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.rl.type}</Typography>
                  </div>
                )}
              {validationResult.rl.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.rl.dimension}</Typography>
                  </div>
                )}
              {validationResult.rl.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.rl.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.Imin.type
          || validationResult.Imin.dimension
          || validationResult.Imin.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                Imin (optional)
              </Typography>
              {validationResult.Imin.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.Imin.type}</Typography>
                  </div>
                )}
              {validationResult.Imin.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.Imin.dimension}</Typography>
                  </div>
                )}
              {validationResult.Imin.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.Imin.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.Imax.type
          || validationResult.Imax.dimension
          || validationResult.Imax.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                Imax (optional)
              </Typography>
              {validationResult.Imax.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.Imax.type}</Typography>
                  </div>
                )}
              {validationResult.Imax.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.Imax.dimension}</Typography>
                  </div>
                )}
              {validationResult.Imax.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.Imax.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.G.type
        || validationResult.G.dimension
        || validationResult.G.value)
        &&(
          <div className={styles.valueDiv}>
            <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
              G (optional)
            </Typography>
            {validationResult.G.type
              && (
                <div className={styles.verificationDiv}>
                  <CloseIcon className={styles.closeIcon} />
                  <Typography className={textStyles.labelReg}>{validationResult.G.type}</Typography>
                </div>
              )}
            {validationResult.G.dimension
              && (
                <div className={styles.verificationDiv}>
                  <CloseIcon className={styles.closeIcon} />
                  <Typography className={textStyles.labelReg}>{validationResult.G.dimension}</Typography>
                </div>
              )}
            {validationResult.G.value
              && (
                <div className={styles.verificationDiv}>
                  <CloseIcon className={styles.closeIcon} />
                  <Typography className={textStyles.labelReg}>{validationResult.G.value}</Typography>
                </div>
              )}
          </div>
        )}
        {(validationResult.ID.type
          || validationResult.ID.dimension
          || validationResult.ID.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                ID (optional)
              </Typography>
              {validationResult.ID.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.ID.type}</Typography>
                  </div>
                )}
              {validationResult.ID.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.ID.dimension}</Typography>
                  </div>
                )}
              {validationResult.ID.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.ID.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.name.type
          || validationResult.name.dimension
          || validationResult.name.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                name (optional)
              </Typography>
              {validationResult.name.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.name.type}</Typography>
                  </div>
                )}
              {validationResult.name.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.name.dimension}</Typography>
                  </div>
                )}
              {validationResult.name.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.name.value}</Typography>
                  </div>
                )}
            </div>
          )}
        {(validationResult.color.type
          || validationResult.color.dimension
          || validationResult.color.value)
          && (
            <div className={styles.valueDiv}>
              <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                color (optional)
              </Typography>
              {validationResult.color.type
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.color.type}</Typography>
                  </div>
                )}
              {validationResult.color.dimension
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.color.dimension}</Typography>
                  </div>
                )}
              {validationResult.color.value
                && (
                  <div className={styles.verificationDiv}>
                    <CloseIcon className={styles.closeIcon} />
                    <Typography className={textStyles.labelReg}>{validationResult.color.value}</Typography>
                  </div>
                )}
            </div>
          )}
      </div>
    );
  } else if (component === 'budget') {
    if ((validationResult.expenditure && validationResult.expenditure.length > 0)
      || (validationResult.out_of_programs && validationResult.out_of_programs.length > 0)
      || (validationResult.program_id && validationResult.program_id.length > 0)) {
        return (
          <div>
            <Typography className={[textStyles.subtitle, styles.title].join(' ')}>
              File Validation
            </Typography>
            {validationResult.expenditure
              && validationResult.expenditure.length > 0
              && (
                <div className={styles.valueDiv}>
                  <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                    Expenditure errors:
                  </Typography>
                  {validationResult.expenditure.map((errorCell) => (
                    <div className={styles.verificationDiv}>
                      <CloseIcon className={styles.closeIcon} />
                      <Typography className={textStyles.labelReg}>{errorCell}</Typography>
                    </div>
                  ))}
                </div>
            )}
            {validationResult.out_of_programs
              && validationResult.out_of_programs.length > 0
              && (
                <div className={styles.valueDiv}>
                  <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                    Out of program errors:
                  </Typography>
                  {validationResult.out_of_programs.map((errorCell) => (
                    <div className={styles.verificationDiv}>
                      <CloseIcon className={styles.closeIcon} />
                      <Typography className={textStyles.labelReg}>{errorCell}</Typography>
                    </div>
                  ))}
                </div>
              )}
            {validationResult.program_id
              && validationResult.program_id.length > 0
              && (
                <div className={styles.valueDiv}>
                  <Typography className={[textStyles.bodyMediumSemiBold, styles.subTitle].join(' ')}>
                    Out of program errors:
                  </Typography>
                  {validationResult.program_id.map((errorCell) => (
                    <div className={styles.verificationDiv}>
                      <CloseIcon className={styles.closeIcon} />
                      <Typography className={textStyles.labelReg}>{errorCell}</Typography>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )
      }
  }
  return (
    <div>
      <Typography className={[textStyles.subtitle, styles.title].join(' ')}>
        File Validation
      </Typography>
      <div className={styles.valueDiv}>
        <div className={styles.verificationDiv}>
          <CheckIcon className={styles.checkIcon} />
          <Typography className={textStyles.labelReg}>File validation succeeded!</Typography>
        </div>
      </div>
    </div>
  );
};

export { FileValidation };
