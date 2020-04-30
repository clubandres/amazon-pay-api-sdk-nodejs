'use strict';

// Including Required Modules 
const Client = require('../src/client');
const config = require('./config');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const headers = {
    'x-amz-pay-idempotency-key': uuidv4().toString().replace(/-/g, '')
};

// Intiating InStoreClient Class
const inStoreClient = new Client.InStoreClient(config);

// Constants required to execute Unit Test cases
var chargePermissionId;
var chargeId;
const merchantScanPayload = {
    scanData: "UKhrmatMeKdlfY6b",
    scanReferenceId: uuidv4().toString().replace(/-/g, ''),
    merchantCOE: "DE",
    ledgerCurrency: "EUR",
    storeLocation: {
        countryCode: "DE"
    },
    metadata: {
        merchantNote: "Software Purchase",
        customInformation: "in-store Software Purchase",
        communicationContext: {
            merchantStoreName: "TESTSTORE",
            merchantOrderId: "789123"
        }
    }
}
const merchantScanExpectedResponse = {
    chargePermissionId: ""
}
const chargeExpectedResponse = {
    chargeId: "",
    chargeStatus: {
        state: "Completed"
    }
}
const refundExpectedResponse = {
    refundId: "",
    refundStatus: {
        state: "Pending"
    }
}

describe('InStore Client Test Cases', (done) => {

    it('Validating Merchant Scan API', (done) => {
        inStoreClient.merchantScan(merchantScanPayload).then(function (result) {
            var actualResponse = JSON.parse(result.body);
            chargePermissionId = actualResponse.chargePermissionId;
            assert.deepEqual(Object.keys(merchantScanExpectedResponse), Object.keys(actualResponse));
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Validating Charge API', (done) => {
        const chargePayload = {
            chargePermissionId: chargePermissionId,
            chargeReferenceId: uuidv4().toString().replace(/-/g, ''),
            chargeTotal: {
                currencyCode: "EUR",
                amount: 2
            },
            softDescriptor: "amzn-store"
        }
        inStoreClient.charge(chargePayload).then(function (result) {
            var actualResponse = JSON.parse(result.body);
            chargeId = actualResponse.chargeId;
            assert.deepEqual(Object.keys(chargeExpectedResponse), Object.keys(actualResponse));
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Validating Refund API', (done) => {
        const refundPayload = {
            chargeId: chargeId,
            refundReferenceId: uuidv4().toString().replace(/-/g, ''),
            refundTotal: {
                currencyCode: "EUR",
                amount: 2
            },
            softDescriptor: "amzn-store"
        }
        inStoreClient.refund(refundPayload).then(function (result) {
            var actualResponse = JSON.parse(result.body);
            assert.deepEqual(Object.keys(refundExpectedResponse), Object.keys(actualResponse));
            done();
        }).catch(err => {
            done(err);
        });
    });
});