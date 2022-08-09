import React from 'react';
import { FormattedMessage } from 'react-intl/dist/react-intl';
import beAwareIcon from './beAwareIcon.png';
import css from './Disclaimer.module.css';

function Disclaimer(props) {
  const { rootClassName } = props;
  const readMoreLink = (
    <a
      href="https://gooddollar.notion.site/GoodMarket-Safety-Tips-4ccb6cc4b96d4cd3a71d63e116436a1a"
      target="_blank"
    >
      <FormattedMessage id="Disclaimer.redMore" />
    </a>
  );
  return (
    <div className={rootClassName}>
      <div className={css.sectionLeft}>
        <img src={beAwareIcon} className={css.beAwareIcon} />
      </div>
      <div className={css.sectionRight}>
        <p className={css.title}>
          <FormattedMessage id="Disclaimer.title" />
        </p>
        <p className={css.bodyText}>
          <FormattedMessage id="Disclaimer.text" values={{ readMoreLink }} />
        </p>
      </div>
    </div>
  );
}

export default Disclaimer;
