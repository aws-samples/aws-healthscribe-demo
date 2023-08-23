// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// Axios
const axios = require('axios');
const axiosRetry = require('axios-retry');

exports.SUCCESS = 'SUCCESS';
exports.FAILED = 'FAILED';

exports.send = async function (event, context, responseStatus, responseData, physicalResourceId, noEcho) {
    const responseBody = {
        Status: responseStatus,
        Reason: 'See the details in CloudWatch Log Stream: ' + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: noEcho || false,
        Data: responseData,
    };

    console.log('Response body:\n', responseBody);

    axiosRetry(axios, {
        retries: 10,
        retryDelay: axiosRetry.exponentialDelay,
    });

    try {
        const cfnResponse = await axios.put(event.ResponseURL, responseBody);
        console.debug('CloudFormation response:', cfnResponse);
    } catch (e) {
        console.error('Error sending status', e);
    }
};
