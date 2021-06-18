
const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, getTrustedSdk, handleError, serialize } = require('../api-util/sdk');
const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const CLIENT_ID = "5cf914e4-9934-4c3f-a45d-e445a625e109";//process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID;
const CLIENT_SECRET = "e0684a7d8955341c79eeb434e7eaacdc8784b183";//process.env.SHARETRIBE_SDK_CLIENT_SECRET;

//const types =require('../../src/util/sdkLoader'); //'../scr../../util/sdkLoader';
//const { UUID } = types;

module.exports = (req, res) => {

    var txId = req.query.txId;
    
    const integrationSdk = flexIntegrationSdk.createInstance({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });

    integrationSdk.transactions.transition({
        id: { uuid: txId, _sdkType: "UUID" },//new UUID(txId), // knowhow in integration ca nu pot importa type, nu stiu de ce
        transition: "transition/accept",
        params: {}
      }, {
        expand: true
      }).then(apiResponse => {
        // res.data contains the response data
        const { status, statusText, data } = apiResponse;
        res
            .status(status)
            .set('Content-Type', 'application/transit+json')
            .send(
            serialize({
                status,
                statusText,
                data,
            })
            )
            .end();
      })
      .catch(e => {
        handleError(res, e);
      });
};