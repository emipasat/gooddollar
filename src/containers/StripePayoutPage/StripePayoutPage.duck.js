import merge from 'lodash/merge';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import { fetchCurrentUser, currentUserShowSuccess } from '../../ducks/user.duck';
import { decode, encode, isMNID } from 'mnid'

// ================ Action types ================ //

export const SAVE_STRIPE_PAYOUT_REQUEST = 'app/StripePayoutPage/SAVE_STRIPE_PAYOUT_REQUEST';
export const SAVE_STRIPE_PAYOUT_SUCCESS = 'app/StripePayoutPage/SAVE_STRIPE_PAYOUT_SUCCESS';
export const SAVE_GOOD_DOLLAR_ACCOUNT_ERROR = 'app/StripePayoutPage/SAVE_GOOD_DOLLAR_ACCOUNT_ERROR';

export const SAVE_STRIPE_PAYOUT_CLEAR = 'app/StripePayoutPage/SAVE_STRIPE_PAYOUT_CLEAR';


// ================ Reducer ================ //

const initialState = {
  saveGoodDollarAccountError: null,
  saveStripePayoutInProgress: false,
  contactDetailsChanged: false,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SAVE_STRIPE_PAYOUT_REQUEST:
      return {
        ...state,
        saveStripePayoutInProgress: true,
        
        saveGoodDollarAccountError: null,
        contactDetailsChanged: false,
      };
    case SAVE_STRIPE_PAYOUT_SUCCESS:
      return { ...state, saveStripePayoutInProgress: false, contactDetailsChanged: true };
    case SAVE_GOOD_DOLLAR_ACCOUNT_ERROR:
      return { ...state, saveStripePayoutInProgress: false, saveGoodDollarAccountError: payload };

    case SAVE_STRIPE_PAYOUT_CLEAR:
      return {
        ...state,
        saveStripePayoutInProgress: false,
        
        saveGoodDollarAccountError: null,
        contactDetailsChanged: false,
      };

    
    default:
      return state;
  }
}

// ================ Action creators ================ //

export const saveStripePayoutRequest = () => ({ type: SAVE_STRIPE_PAYOUT_REQUEST });
export const saveStripePayoutSuccess = () => ({ type: SAVE_STRIPE_PAYOUT_SUCCESS });

export const saveGoodDollarAccountError = error => ({
  type: SAVE_GOOD_DOLLAR_ACCOUNT_ERROR,
  payload: error,
  error: true,
});

export const saveStripePayoutClear = () => ({ type: SAVE_STRIPE_PAYOUT_CLEAR });



// ================ Thunks ================ //

/**
 * Make a phone number update request to the API and return the current user.
 */
const requestSaveGoodDollarAccount = params => (dispatch, getState, sdk) => {
  const goodDollarAccountAddress = params.goodDollarAccount;
  // this should be the address 0x5A5C943FC6aA7b29499eE3734Af3eD5071410676
  // convert it to the one which base64 understands

  const networkId = 122;
  const goodDollarAccount = encode({ goodDollarAccountAddress, network: `0x${networkId.toString(16)}` })


  return sdk.currentUser
    .updateProfile(
      { publicData: { goodDollarAccount } },
      {
        expand: true,
        include: ['profileImage'],
        'fields.image': ['variants.square-small', 'variants.square-small2x'],
      }
    )
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
      }

      const currentUser = entities[0];
      return currentUser;
    })
    .catch(e => {
      dispatch(saveGoodDollarAccountError(storableError(e)));
      // pass the same error so that the SAVE_STRIPE_PAYOUT_SUCCESS
      // action will not be fired
      throw e;
    });
};


/**
 * Save phone number and update the current user.
 */
export const saveGoodDollarAccount = params => (dispatch, getState, sdk) => {
  return (
    dispatch(requestSaveGoodDollarAccount(params))
      .then(user => {
        dispatch(currentUserShowSuccess(user));
        dispatch(saveStripePayoutSuccess());
      })
      // error action dispatched in requestSaveGoodDollarAccount
      .catch(e => null)
  );
};

/**
 * Save email and phone number and update the current user.
 */
const saveEmailAndPhoneNumber = params => (dispatch, getState, sdk) => {
  const { goodDollarAccount } = params;

  // order of promises: 1. email, 2. phone number
  const promises = [
    //dispatch(requestSaveEmail({ email, currentPassword })),
    dispatch(requestSaveGoodDollarAccount({ goodDollarAccount })),
  ];

  return Promise.all(promises)
    .then(values => {
      // Array of two user objects is resolved
      // the first one is from the email update
      // the second one is from the phone number update

      //const saveEmailUser = values[0];
      const saveGoodDollarAccountUser = values[1];

      // merge the protected data from the user object returned
      // by the phone update operation
      const protectedData = saveGoodDollarAccountUser.attributes.profile.protectedData;
      const goodDollarAccountMergeSource = { attributes: { profile: { protectedData } } };

      const currentUser = merge(saveEmailUser, goodDollarAccountMergeSource);
      dispatch(currentUserShowSuccess(currentUser));
      dispatch(saveStripePayoutSuccess());
    })
    .catch(e => null);
};

/**
 * Update contact details, actions depend on which data has changed
 */
export const saveStripePayout = params => (dispatch, getState, sdk) => {
  dispatch(saveStripePayoutRequest());

  const { goodDollarAccount, currentGoodDollarAccount } = params;
  //const emailChanged = email !== currentEmail;
  const goodDollarAccountChanged = goodDollarAccount !== currentGoodDollarAccount;

  //if (goodDollarAccountChanged) {
  //  return dispatch(saveEmailAndPhoneNumber({ email, currentPassword, goodDollarAccount }));
  //} else if (emailChanged) {
  //  return dispatch(saveEmail({ email, currentPassword }));
  //} else 
  if (goodDollarAccountChanged) {
    return dispatch(saveGoodDollarAccount({ goodDollarAccount }));
  }
};

export const loadData = () => {
  // Since verify email happens in separate tab, current user's data might be updated
  return fetchCurrentUser();
};
