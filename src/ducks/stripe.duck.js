import { storableError } from '../util/errors';
import * as log from '../util/log';

// ================ Action types ================ //

export const STRIPE_ACCOUNT_CLEAR_ERROR = 'app/stripe/STRIPE_ACCOUNT_CLEAR_ERROR';

export const ACCOUNT_OPENER_CREATE_REQUEST = 'app/stripe/ACCOUNT_OPENER_CREATE_REQUEST';
export const ACCOUNT_OPENER_CREATE_SUCCESS = 'app/stripe/ACCOUNT_OPENER_CREATE_SUCCESS';
export const ACCOUNT_OPENER_CREATE_ERROR = 'app/stripe/ACCOUNT_OPENER_CREATE_ERROR';

export const PERSON_CREATE_REQUEST = 'app/stripe/PERSON_CREATE_REQUEST';
export const PERSON_CREATE_SUCCESS = 'app/stripe/PERSON_CREATE_SUCCESS';
export const PERSON_CREATE_ERROR = 'app/stripe/PERSON_CREATE_ERROR';

export const CLEAR_PAYMENT_TOKEN = 'app/stripe/CLEAR_PAYMENT_TOKEN';

export const HANDLE_CARD_PAYMENT_REQUEST = 'app/stripe/HANDLE_CARD_PAYMENT_REQUEST';
export const HANDLE_CARD_PAYMENT_SUCCESS = 'app/stripe/HANDLE_CARD_PAYMENT_SUCCESS';
export const HANDLE_CARD_PAYMENT_ERROR = 'app/stripe/HANDLE_CARD_PAYMENT_ERROR';

export const HANDLE_CARD_SETUP_REQUEST = 'app/stripe/HANDLE_CARD_SETUP_REQUEST';
export const HANDLE_CARD_SETUP_SUCCESS = 'app/stripe/HANDLE_CARD_SETUP_SUCCESS';
export const HANDLE_CARD_SETUP_ERROR = 'app/stripe/HANDLE_CARD_SETUP_ERROR';

export const CLEAR_HANDLE_CARD_PAYMENT = 'app/stripe/CLEAR_HANDLE_CARD_PAYMENT';

export const RETRIEVE_PAYMENT_INTENT_REQUEST = 'app/stripe/RETRIEVE_PAYMENT_INTENT_REQUEST';
export const RETRIEVE_PAYMENT_INTENT_SUCCESS = 'app/stripe/RETRIEVE_PAYMENT_INTENT_SUCCESS';
export const RETRIEVE_PAYMENT_INTENT_ERROR = 'app/stripe/RETRIEVE_PAYMENT_INTENT_ERROR';

// ================ Reducer ================ //

const initialState = {
  handleCardPaymentInProgress: false,
  handleCardPaymentError: null,
  handleCardSetupInProgress: false,
  handleCardSetupError: null,
  paymentIntent: null,
  setupIntent: null,
  retrievePaymentIntentInProgress: false,
  retrievePaymentIntentError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case STRIPE_ACCOUNT_CLEAR_ERROR:
      return { ...initialState };

    case ACCOUNT_OPENER_CREATE_REQUEST:
      return {
        ...state,
        createAccountOpenerError: null,
        createAccountOpenerInProgress: true,
      };
    case ACCOUNT_OPENER_CREATE_SUCCESS:
      return { ...state, createAccountOpenerInProgress: false, personAccountOpener: payload };
    case ACCOUNT_OPENER_CREATE_ERROR:
      console.error(payload);
      return { ...state, createAccountOpenerError: payload, createAccountOpenerInProgress: false };

    case PERSON_CREATE_REQUEST:
      return {
        ...state,
        persons: [
          ...state.persons,
          {
            ...payload,
            createStripePersonError: null,
            createStripePersonInProgress: true,
          },
        ],
      };
    case PERSON_CREATE_SUCCESS:
      return {
        ...state,
        persons: state.persons.map(p => {
          return p.personToken === payload.personToken
            ? { ...payload, createStripePersonInProgress: false }
            : p;
        }),
      };
    case PERSON_CREATE_ERROR:
      console.error(payload);
      return {
        ...state,
        persons: state.persons.map(p => {
          return p.personToken === payload.personToken
            ? { ...p, createStripePersonInProgress: false, createStripePersonError: payload.error }
            : p;
        }),
      };

    case HANDLE_CARD_PAYMENT_REQUEST:
      return {
        ...state,
        handleCardPaymentError: null,
        handleCardPaymentInProgress: true,
      };
    case HANDLE_CARD_PAYMENT_SUCCESS:
      return { ...state, paymentIntent: payload, handleCardPaymentInProgress: false };
    case HANDLE_CARD_PAYMENT_ERROR:
      console.error(payload);
      return { ...state, handleCardPaymentError: payload, handleCardPaymentInProgress: false };

    case HANDLE_CARD_SETUP_REQUEST:
      return {
        ...state,
        handleCardSetupError: null,
        handleCardSetupInProgress: true,
      };
    case HANDLE_CARD_SETUP_SUCCESS:
      return { ...state, setupIntent: payload, handleCardSetupInProgress: false };
    case HANDLE_CARD_SETUP_ERROR:
      console.error(payload);
      return { ...state, handleCardSetupError: payload, handleCardSetupInProgress: false };

    case CLEAR_HANDLE_CARD_PAYMENT:
      return {
        ...state,
        handleCardPaymentInProgress: false,
        handleCardPaymentError: null,
        paymentIntent: null,
      };

    case RETRIEVE_PAYMENT_INTENT_REQUEST:
      return {
        ...state,
        retrievePaymentIntentError: null,
        retrievePaymentIntentInProgress: true,
      };
    case RETRIEVE_PAYMENT_INTENT_SUCCESS:
      return { ...state, paymentIntent: payload, retrievePaymentIntentInProgress: false };
    case RETRIEVE_PAYMENT_INTENT_ERROR:
      console.error(payload);
      return {
        ...state,
        retrievePaymentIntentError: payload,
        retrievePaymentIntentInProgress: false,
      };

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const stripeAccountClearError = () => ({
  type: STRIPE_ACCOUNT_CLEAR_ERROR,
});

export const handleCardPaymentRequest = () => ({
  type: HANDLE_CARD_PAYMENT_REQUEST,
});

export const handleCardPaymentSuccess = payload => ({
  type: HANDLE_CARD_PAYMENT_SUCCESS,
  payload,
});

export const handleCardPaymentError = payload => ({
  type: HANDLE_CARD_PAYMENT_ERROR,
  payload,
  error: true,
});

export const handleCardSetupRequest = () => ({
  type: HANDLE_CARD_SETUP_REQUEST,
});

export const handleCardSetupSuccess = payload => ({
  type: HANDLE_CARD_SETUP_SUCCESS,
  payload,
});

export const handleCardSetupError = payload => ({
  type: HANDLE_CARD_SETUP_ERROR,
  payload,
  error: true,
});

export const initializeCardPaymentData = () => ({
  type: CLEAR_HANDLE_CARD_PAYMENT,
});

export const retrievePaymentIntentRequest = () => ({
  type: RETRIEVE_PAYMENT_INTENT_REQUEST,
});

export const retrievePaymentIntentSuccess = payload => ({
  type: RETRIEVE_PAYMENT_INTENT_SUCCESS,
  payload,
});

export const retrievePaymentIntentError = payload => ({
  type: RETRIEVE_PAYMENT_INTENT_ERROR,
  payload,
  error: true,
});

// ================ Thunks ================ //

export const retrievePaymentIntent = params => dispatch => {
  const { stripe, stripePaymentIntentClientSecret } = params;
  dispatch(retrievePaymentIntentRequest());

  return stripe
    .retrievePaymentIntent(stripePaymentIntentClientSecret)
    .then(response => {
      if (response.error) {
        return Promise.reject(response);
      } else {
        dispatch(retrievePaymentIntentSuccess(response.paymentIntent));
        return response;
      }
    })
    .catch(err => {
      // Unwrap Stripe error.
      const e = err.error || storableError(err);
      dispatch(retrievePaymentIntentError(e));

      // Log error
      const { code, doc_url, message, payment_intent } = err.error || {};
      const loggableError = err.error
        ? {
            code,
            message,
            doc_url,
            paymentIntentStatus: payment_intent
              ? payment_intent.status
              : 'no payment_intent included',
          }
        : e;
      log.error(loggableError, 'stripe-retrieve-payment-intent-failed', {
        stripeMessage: loggableError.message,
      });
      throw err;
    });
};

export const handleCardPayment = params => dispatch => {
  // It's required to use the same instance of Stripe as where the card has been created
  // so that's why Stripe needs to be passed here and we can't create a new instance.
  const { stripe, card, paymentParams, stripePaymentIntentClientSecret } = params;
  const transactionId = params.orderId;

  dispatch(handleCardPaymentRequest());

  // When using default payment method, card (aka Stripe Element) is not needed.
  // We also set paymentParams.payment_method already in Flex API side,
  // when request-payment transition is made - so there's no need for paymentParams
  const args = card
    ? [stripePaymentIntentClientSecret, card, paymentParams]
    : [stripePaymentIntentClientSecret];

  return stripe
    .handleCardPayment(...args)
    .then(response => {
      if (response.error) {
        return Promise.reject(response);
      } else {
        dispatch(handleCardPaymentSuccess(response));
        return { ...response, transactionId };
      }
    })
    .catch(err => {
      // Unwrap Stripe error.
      const e = err.error || storableError(err);
      dispatch(handleCardPaymentError(e));

      // Log error
      const containsPaymentIntent = err.error && err.error.payment_intent;
      const { code, doc_url, message, payment_intent } = containsPaymentIntent ? err.error : {};
      const loggableError = containsPaymentIntent
        ? {
            code,
            message,
            doc_url,
            paymentIntentStatus: payment_intent.status,
          }
        : e;
      log.error(loggableError, 'stripe-handle-card-payment-failed', {
        stripeMessage: loggableError.message,
      });
      throw e;
    });
};

export const handleCardSetup = params => dispatch => {
  // It's required to use the same instance of Stripe as where the card has been created
  // so that's why Stripe needs to be passed here and we can't create a new instance.
  const { stripe, card, setupIntentClientSecret, paymentParams } = params;

  dispatch(handleCardSetupRequest());

  return stripe
    .handleCardSetup(setupIntentClientSecret, card, paymentParams)
    .then(response => {
      if (response.error) {
        return Promise.reject(response);
      } else {
        dispatch(handleCardSetupSuccess(response));
        return response;
      }
    })
    .catch(err => {
      // Unwrap Stripe error.
      const e = err.error || storableError(err);
      dispatch(handleCardSetupError(e));

      // Log error
      const containsSetupIntent = err.error && err.error.setup_intent;
      const { code, doc_url, message, setup_intent } = containsSetupIntent ? err.error : {};
      const loggableError = containsSetupIntent
        ? {
            code,
            message,
            doc_url,
            paymentIntentStatus: setup_intent.status,
          }
        : e;
      log.error(loggableError, 'stripe-handle-card-setup-failed', {
        stripeMessage: loggableError.message,
      });
      throw e;
    });
};
