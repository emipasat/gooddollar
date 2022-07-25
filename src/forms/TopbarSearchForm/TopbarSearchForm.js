import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form as FinalForm, Field } from 'react-final-form';
import classNames from 'classnames';
import { intlShape, injectIntl } from '../../util/reactIntl';
import { Form, LocationAutocompleteInput } from '../../components';
import config from '../../config';
import IconSearchDesktop from './IconSearchDesktop';
import css from './TopbarSearchForm.module.css';

const identity = v => v;

const KeywordSearchField = props => {
  const { keywordSearchWrapperClasses, iconClass, intl, isMobile, inputRef } = props;
  return (
    <div className={keywordSearchWrapperClasses}>
      <button className={css.searchSubmit}>
        <div className={iconClass}>
          <IconSearchDesktop />
        </div>
      </button>
      <Field
        name="keywords"
        render={({ input, meta }) => {
          return (
            <input
              className={isMobile ? css.mobileInput : css.desktopInput}
              {...input}
              id="keyword-search"
              ref={inputRef}
              type="text"
              placeholder={intl.formatMessage({
                id: 'TopbarSearchForm.placeholder',
              })}
              autoComplete="off"
            />
          );
        }}
      />
    </div>
  );
};

const LocationSearchField = props => {
  const { desktopInputRootClass, intl, isMobile, inputRef, onLocationChange } = props;
  return (
    <Field
      name="location"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;

        // Merge the standard onChange function with custom behaviur. A better solution would
        // be to use the FormSpy component from Final Form and pass this.onChange to the
        // onChange prop but that breaks due to insufficient subscription handling.
        // See: https://github.com/final-form/react-final-form/issues/159
        const searchOnChange = value => {
          onChange(value);
          onLocationChange(value);
        };

        return (
          <LocationAutocompleteInput
            className={isMobile ? css.mobileInputRoot : desktopInputRootClass}
            iconClassName={isMobile ? css.mobileIcon : css.desktopIcon}
            inputClassName={isMobile ? css.mobileInput : css.desktopInput}
            predictionsClassName={isMobile ? css.mobilePredictions : css.desktopPredictions}
            predictionsAttributionClassName={isMobile ? css.mobilePredictionsAttribution : null}
            placeholder={intl.formatMessage({ id: 'TopbarSearchForm.placeholder' })}
            closeOnBlur={!isMobile}
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
          />
        );
      }}
    />
  );
};

class TopbarSearchFormComponent extends Component {
  constructor(props) {
    super(props);
    // onChange is used for location search
    this.onChange = this.onChange.bind(this);
    // onSubmit is used for keywords search
    this.onSubmit = this.onSubmit.bind(this);

    // Callback ref
    this.searchInput = null;
    this.setSearchInputRef = element => {
      this.setSearchInput = element;
    };
  }

  onChange(location) {
    if (location.selectedPlace) {
      // Note that we use `onSubmit` instead of the conventional
      // `handleSubmit` prop for submitting. We want to autosubmit
      // when a place is selected, and don't require any extra
      // validations for the form.
      this.props.onSubmit({ location });
      // blur search input to hide software keyboard
      this.searchInput?.blur();
    }
  }

  onSubmit(values) {
    this.props.onSubmit({ keywords: values.keywords });
    // blur search input to hide software keyboard
    this.searchInput?.blur();
  }

  render() {
    const { onSubmit, ...restOfProps } = this.props;
    const submit = this.onSubmit;
    return (
      <FinalForm
        {...restOfProps}
        onSubmit={submit}
        render={formRenderProps => {
          const {
            rootClassName,
            className,
            desktopInputRoot,
            intl,
            isMobile,
            handleSubmit,
          } = formRenderProps;
          const classes = classNames(rootClassName, className);
          const desktopInputRootClass = desktopInputRoot || css.desktopInputRoot;
          const isKeywordsSearch = true;

          // Location search: allow form submit only when the place has changed
          const preventFormSubmit = e => e.preventDefault();
          const submitFormFn = isKeywordsSearch ? handleSubmit : preventFormSubmit;

          const keywordSearchWrapperClasses = classNames(
            css.keywordSearchWrapper,
            isMobile ? css.mobileInputRoot : desktopInputRootClass
          );

          return (
            <Form className={classes} onSubmit={submitFormFn} enforcePagePreloadFor="SearchPage">
              {isKeywordsSearch ? (
                <KeywordSearchField
                  keywordSearchWrapperClasses={keywordSearchWrapperClasses}
                  iconClass={classNames(isMobile ? css.mobileIcon : css.desktopIcon || css.icon)}
                  intl={intl}
                  isMobile={isMobile}
                  inputRef={this.setSearchInputRef}
                />
              ) : (
                <LocationSearchField
                  desktopInputRootClass={desktopInputRootClass}
                  intl={intl}
                  isMobile={isMobile}
                  inputRef={this.setSearchInputRef}
                  onLocationChange={this.onChange}
                />
              )}
            </Form>
          );
        }}
      />
    );
  }
}

const { func, string, bool } = PropTypes;

TopbarSearchFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  desktopInputRoot: null,
  isMobile: false,
};

TopbarSearchFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  desktopInputRoot: string,
  onSubmit: func.isRequired,
  isMobile: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const TopbarSearchForm = injectIntl(TopbarSearchFormComponent);

export default TopbarSearchForm;
