import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { ensureCurrentUser } from '../../util/data';
import * as errors from '../../util/errors';
import { Form, PrimaryButton, FieldTextInput } from '../../components';

import css from './GoodDollarAccountForm.module.css';

//const SHOW_EMAIL_SENT_TIMEOUT = 2000;

class GoodDollarAccountFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {  };
    
    this.submittedValues = {};
  }

  componentWillUnmount() {
    //window.clearTimeout(this.emailSentTimeoutId);
  }

  

  render() {
    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            
            saveGoodDollarAccountError,
            currentUser,
            formId,
            handleSubmit,
            inProgress,
            intl,
            invalid,
            
            values,
          } = fieldRenderProps;
          const { goodDollarAccount } = values;

          const user = ensureCurrentUser(currentUser);

          if (!user.id) {
            return null;
          }

          const { profile } = user.attributes;

          // email

          // has the email changed
          

          // goodDollarAccount
          const publicData = profile.publicData || {};
          const currentGoodDollarAccount = publicData.goodDollarAccount;

          // has the goodDollarAccount number changed
          const goodDollarAccountChanged = currentGoodDollarAccount !== goodDollarAccount;

          const goodDollarAccountPlaceholder = intl.formatMessage({
            id: 'GoodDollarAccountForm.goodDollarAccountPlaceholder',
          });
          const goodDollarAccountLabel = intl.formatMessage({ id: 'GoodDollarAccountForm.goodDollarAccountLabel' });

          let genericError = null;

          if (saveGoodDollarAccountError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="GoodDollarAccountForm.genericGoodDollarAccountFailure" />
              </span>
            );
          }


          

          const classes = classNames(rootClassName || css.root, className);
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid ||
            pristineSinceLastSubmit ||
            inProgress ||
            !(goodDollarAccountChanged);

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.goodDollarAccountSection}>
                
                <FieldTextInput
                  className={css.goodDollarAccount}
                  name="goodDollarAccount"
                  id={formId ? `${formId}.goodDollarAccount` : 'goodDollarAccount'}
                  label={goodDollarAccountLabel}
                  placeholder={goodDollarAccountPlaceholder}
                />

                <p></p>
              </div>

              
              <div className={css.bottomWrapper}>
                {genericError}
                <PrimaryButton
                  type="submit"
                  inProgress={inProgress}
                  ready={pristineSinceLastSubmit}
                  disabled={submitDisabled}
                >
                  <FormattedMessage id="GoodDollarAccountForm.saveChanges" />
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

GoodDollarAccountFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  
  saveGoodDollarAccountError: null,
  inProgress: false,
  
  
  goodDollarAccount: null,
  
};

const { bool, func, string } = PropTypes;

GoodDollarAccountFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,
  
  saveGoodDollarAccountError: propTypes.error,
  inProgress: bool,
  intl: intlShape.isRequired,
  
  ready: bool.isRequired,
  
};

const GoodDollarAccountForm = compose(injectIntl)(GoodDollarAccountFormComponent);

GoodDollarAccountForm.displayName = 'GoodDollarAccountForm';

export default GoodDollarAccountForm;
