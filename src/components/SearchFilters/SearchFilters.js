import React from 'react';
import { compose } from 'redux';
import { object, string, bool, number, func, shape } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import omit from 'lodash/omit';

import config from '../../config';
import {
  BookingDateRangeLengthFilter,
  SelectSingleFilter,
  SelectMultipleFilter,
  PriceFilter,
  KeywordFilter,
  SortBy,
} from '../../components';
import { parseDateFromISO8601, stringifyDateToISO8601 } from '../../util/dates';
import routeConfiguration from '../../routeConfiguration';
import { createResourceLocatorString } from '../../util/routes';
import { propTypes } from '../../util/types';
import css from './SearchFilters.css';

// Dropdown container can have a positional offset (in pixels)
const FILTER_DROPDOWN_OFFSET = -14;
const RADIX = 10;

// resolve initial value for a single value filter
const initialValue = (queryParams, paramName) => {
  return queryParams[paramName];
};

// resolve initial values for a multi value filter
const initialValues = (queryParams, paramName) => {
  return !!queryParams[paramName] ? queryParams[paramName].split(',') : [];
};

const initialPriceRangeValue = (queryParams, paramName) => {
  const price = queryParams[paramName];
  const valuesFromParams = !!price ? price.split(',').map(v => Number.parseInt(v, RADIX)) : [];

  return !!price && valuesFromParams.length === 2
    ? {
        minPrice: valuesFromParams[0],
        maxPrice: valuesFromParams[1],
      }
    : null;
};

const initialDateRangeValue = (queryParams, paramName) => {
  const dates = queryParams[paramName];
  const rawValuesFromParams = !!dates ? dates.split(',') : [];
  const valuesFromParams = rawValuesFromParams.map(v => parseDateFromISO8601(v));
  const initialValues =
    !!dates && valuesFromParams.length === 2
      ? {
          dates: { startDate: valuesFromParams[0], endDate: valuesFromParams[1] },
        }
      : { dates: null };

  return initialValues;
};

const SearchFiltersComponent = props => {
  const {
    rootClassName,
    className,
    urlQueryParams,
    sort,
    listingsAreLoaded,
    resultsCount,
    searchInProgress,
    certificateFilter,
    yogaStylesFilter,
    priceFilter,
    dateRangeLengthFilter,
    keywordFilter,
    isSearchFiltersPanelOpen,
    toggleSearchFiltersPanel,
    searchFiltersPanelSelectedCount,
    history,
    intl,
  } = props;

  const hasNoResult = listingsAreLoaded && resultsCount === 0;
  const classes = classNames(rootClassName || css.root, className);

  const certificateLabel = intl.formatMessage({
    id: 'SearchFilters.certificateLabel',
  });

  const yogaStylesLabel = intl.formatMessage({
    id: 'SearchFilters.yogaStylesLabel',
  });

  const keywordLabel = intl.formatMessage({
    id: 'SearchFilters.keywordLabel',
  });

  const initialyogaStyles = yogaStylesFilter
    ? initialValues(urlQueryParams, yogaStylesFilter.paramName)
    : null;

  const initialcertificate = certificateFilter
    ? initialValue(urlQueryParams, certificateFilter.paramName)
    : null;

  const initialPriceRange = priceFilter
    ? initialPriceRangeValue(urlQueryParams, priceFilter.paramName)
    : null;

  const initialDates = dateRangeLengthFilter
    ? initialDateRangeValue(urlQueryParams, dateRangeLengthFilter.paramName)
    : null;

  const initialMinDuration = dateRangeLengthFilter
    ? initialValue(urlQueryParams, dateRangeLengthFilter.minDurationParamName)
    : null;

  const handleSelectOptions = (urlParam, options) => {
    const queryParams =
      options && options.length > 0
        ? { ...urlQueryParams, [urlParam]: options.join(',') }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const handleSelectOption = (urlParam, option) => {
    // query parameters after selecting the option
    // if no option is passed, clear the selection for the filter
    const queryParams = option
      ? { ...urlQueryParams, [urlParam]: option }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const initialKeyword = keywordFilter
    ? initialValue(urlQueryParams, keywordFilter.paramName)
    : null;

  const isKeywordFilterActive = !!initialKeyword;

  const handlePrice = (urlParam, range) => {
    const { minPrice, maxPrice } = range || {};
    const queryParams =
      minPrice != null && maxPrice != null
        ? { ...urlQueryParams, [urlParam]: `${minPrice},${maxPrice}` }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const handleKeyword = (urlParam, values) => {
    const queryParams = values
      ? { ...urlQueryParams, [urlParam]: values }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const certificateFilterElement = certificateFilter ? (
    <SelectSingleFilter
      urlParam={certificateFilter.paramName}
      label={certificateLabel}
      onSelect={handleSelectOption}
      showAsPopup
      options={certificateFilter.options}
      initialValue={initialcertificate}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const yogaStylesFilterElement = yogaStylesFilter ? (
    <SelectMultipleFilter
      id={'SearchFilters.yogaStylesFilter'}
      name="yogaStyles"
      urlParam={yogaStylesFilter.paramName}
      label={yogaStylesLabel}
      onSubmit={handleSelectOptions}
      showAsPopup
      options={yogaStylesFilter.options}
      initialValues={initialyogaStyles}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const priceFilterElement = priceFilter ? (
    <PriceFilter
      id="SearchFilters.priceFilter"
      urlParam={priceFilter.paramName}
      onSubmit={handlePrice}
      showAsPopup
      {...priceFilter.config}
      initialValues={initialPriceRange}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  const handleDateRangeLength = values => {
    const hasDates = values && values[dateRangeLengthFilter.paramName];
    const { startDate, endDate } = hasDates ? values[dateRangeLengthFilter.paramName] : {};
    const start = startDate ? stringifyDateToISO8601(startDate) : null;
    const end = endDate ? stringifyDateToISO8601(endDate) : null;
    const minDuration =
      hasDates && values && values[dateRangeLengthFilter.minDurationParamName]
        ? values[dateRangeLengthFilter.minDurationParamName]
        : null;

    const restParams = omit(
      urlQueryParams,
      dateRangeLengthFilter.paramName,
      dateRangeLengthFilter.minDurationParamName
    );

    const datesMaybe =
      start != null && end != null ? { [dateRangeLengthFilter.paramName]: `${start},${end}` } : {};
    const minDurationMaybe = minDuration
      ? { [dateRangeLengthFilter.minDurationParamName]: minDuration }
      : {};

    const queryParams = {
      ...datesMaybe,
      ...minDurationMaybe,
      ...restParams,
    };
    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const dateRangeLengthFilterElement =
    dateRangeLengthFilter && dateRangeLengthFilter.config.active ? (
      <BookingDateRangeLengthFilter
        id="SearchFilters.dateRangeLengthFilter"
        dateRangeLengthFilter={dateRangeLengthFilter}
        datesUrlParam={dateRangeLengthFilter.paramName}
        durationUrlParam={dateRangeLengthFilter.minDurationParamName}
        onSubmit={handleDateRangeLength}
        showAsPopup
        contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
        initialDateValues={initialDates}
        initialDurationValue={initialMinDuration}
      />
    ) : null;

  const keywordFilterElement =
    keywordFilter && keywordFilter.config.active ? (
      <KeywordFilter
        id={'SearchFilters.keywordFilter'}
        name="keyword"
        urlParam={keywordFilter.paramName}
        label={keywordLabel}
        onSubmit={handleKeyword}
        showAsPopup
        initialValues={initialKeyword}
        contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
      />
    ) : null;

  const toggleSearchFiltersPanelButtonClasses =
    isSearchFiltersPanelOpen || searchFiltersPanelSelectedCount > 0
      ? css.searchFiltersPanelOpen
      : css.searchFiltersPanelClosed;
  const toggleSearchFiltersPanelButton = toggleSearchFiltersPanel ? (
    <button
      className={toggleSearchFiltersPanelButtonClasses}
      onClick={() => {
        toggleSearchFiltersPanel(!isSearchFiltersPanelOpen);
      }}
    >
      <FormattedMessage
        id="SearchFilters.moreFiltersButton"
        values={{ count: searchFiltersPanelSelectedCount }}
      />
    </button>
  ) : null;

  const handleSortBy = (urlParam, values) => {
    const queryParams = values
      ? { ...urlQueryParams, [urlParam]: values }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  const sortBy = config.custom.sortConfig.active ? (
    <SortBy
      sort={sort}
      showAsPopup
      isKeywordFilterActive={isKeywordFilterActive}
      onSelect={handleSortBy}
      contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
    />
  ) : null;

  return (
    <div className={classes}>
      <div className={css.searchOptions}>
        {listingsAreLoaded ? (
          <div className={css.searchResultSummary}>
            <span className={css.resultsFound}>
              <FormattedMessage id="SearchFilters.foundResults" values={{ count: resultsCount }} />
            </span>
          </div>
        ) : null}
        {sortBy}
      </div>

      <div className={css.filters}>
        {yogaStylesFilterElement}
        {certificateFilterElement}
        {priceFilterElement}
        {dateRangeLengthFilterElement}
        {keywordFilterElement}
        {toggleSearchFiltersPanelButton}
      </div>

      {hasNoResult ? (
        <div className={css.noSearchResults}>
          <FormattedMessage id="SearchFilters.noResults" />
        </div>
      ) : null}

      {searchInProgress ? (
        <div className={css.loadingResults}>
          <FormattedMessage id="SearchFilters.loadingResults" />
        </div>
      ) : null}
    </div>
  );
};

SearchFiltersComponent.defaultProps = {
  rootClassName: null,
  className: null,
  resultsCount: null,
  searchingInProgress: false,
  certificateFilter: null,
  yogaStylesFilter: null,
  priceFilter: null,
  dateRangeLengthFilter: null,
  isSearchFiltersPanelOpen: false,
  toggleSearchFiltersPanel: null,
  searchFiltersPanelSelectedCount: 0,
};

SearchFiltersComponent.propTypes = {
  rootClassName: string,
  className: string,
  urlQueryParams: object.isRequired,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchingInProgress: bool,
  onManageDisableScrolling: func.isRequired,
  certificateFilter: propTypes.filterConfig,
  yogaStylesFilter: propTypes.filterConfig,
  priceFilter: propTypes.filterConfig,
  dateRangeLengthFilter: propTypes.filterConfig,
  isSearchFiltersPanelOpen: bool,
  toggleSearchFiltersPanel: func,
  searchFiltersPanelSelectedCount: number,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SearchFilters = compose(
  withRouter,
  injectIntl
)(SearchFiltersComponent);

export default SearchFilters;
