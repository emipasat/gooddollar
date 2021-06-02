import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav,
} from '../../components';
import { GoodDollarAccountForm } from '../../forms';
import { TopbarContainer } from '../../containers';

import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  saveStripePayout,
  saveStripePayoutClear,
  resetPassword,
} from './StripePayoutPage.duck';
import css from './StripePayoutPage.module.css';

export const StripePayoutPageComponent = props => {
  const {
    
    saveGoodDollarAccountError,
    saveStripePayoutInProgress,
    currentUser,
    contactDetailsChanged,
    onChange,
    scrollingDisabled,
    
    onSubmitStripePayout,
    
    intl,
  } = props;

  const user = ensureCurrentUser(currentUser);
  //const currentEmail = user.attributes.email || '';
  const protectedData = user.attributes.profile.protectedData || {};
  const currentGoodDollarAccount = protectedData.goodDollarAccount || '';
  const contactInfoForm =  user.id ? (
    <GoodDollarAccountForm
      className={css.form}
      initialValues={{ goodDollarAccount: currentGoodDollarAccount }}
      saveGoodDollarAccountError={saveGoodDollarAccountError}
      currentUser={currentUser}
      
      onSubmit={values => onSubmitStripePayout({ ...values, currentGoodDollarAccount })}
      onChange={onChange}

      inProgress={saveStripePayoutInProgress}
      ready={contactDetailsChanged}
      
    />
  ) : null;

  const title = intl.formatMessage({ id: 'StripePayoutPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            currentPage="StripePayoutPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
          <UserNav selectedPageName="StripePayoutPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperAccountSettingsSideNav currentTab="StripePayoutPage" />
        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.title}>
              <FormattedMessage id="StripePayoutPage.heading" />
            </h1>
            {contactInfoForm}
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

StripePayoutPageComponent.defaultProps = {
  
  saveGoodDollarAccountError: null,
  currentUser: null,
  
};

const { bool, func } = PropTypes;

StripePayoutPageComponent.propTypes = {
  saveGoodDollarAccountError: propTypes.error,
  saveStripePayoutInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  contactDetailsChanged: bool.isRequired,
  onChange: func.isRequired,
  onSubmitStripePayout: func.isRequired,
  scrollingDisabled: bool.isRequired,
  
  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const { currentUser } = state.user;
  const {
    
    saveGoodDollarAccountError,
    saveStripePayoutInProgress,
    contactDetailsChanged,
    
  } = state.StripePayoutPage;
  return {
    
    saveGoodDollarAccountError,
    saveStripePayoutInProgress,
    currentUser,
    contactDetailsChanged,
    scrollingDisabled: isScrollingDisabled(state),
    
  };
};

const mapDispatchToProps = dispatch => ({
  onChange: () => dispatch(saveStripePayoutClear()),
  onSubmitStripePayout: values => dispatch(saveStripePayout(values)),
});

const StripePayoutPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(StripePayoutPageComponent);

export default StripePayoutPage;
