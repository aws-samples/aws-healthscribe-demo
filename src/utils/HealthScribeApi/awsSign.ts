// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Auth, Signer } from 'aws-amplify';
import axios from 'axios';

import { ApiConfig } from '.';

type Creds = {
    access_key: string;
    secret_key: string;
    session_token: string;
};

// Return accessInfo for Amplify Signer input
async function getCreds(): Promise<Creds> {
    const credentials = await Auth.currentCredentials();
    return {
        access_key: credentials.accessKeyId,
        secret_key: credentials.secretAccessKey,
        session_token: credentials.sessionToken,
    };
}

type HealthScribePost = {
    apiConfig: ApiConfig;
    url: string;
    headers?: object;
    data?: object;
};

export async function healthScribePost({ apiConfig, url, headers = {}, data = {} }: HealthScribePost) {
    if (!apiConfig.region || !url) throw new Error('API configuration not set');

    const serviceInfo = {
        service: 'transcribe',
        region: apiConfig.region,
    };

    const apiReqeust: { [key: string]: unknown } = {
        method: 'POST',
        url: url,
        headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            ...headers,
        },
    };
    if (data) {
        apiReqeust.data = JSON.stringify(data);
        apiReqeust.body = JSON.stringify(data);
    }

    const signedReq = Signer.sign(apiReqeust, await getCreds(), serviceInfo);
    // Remove the host header, as we have signedReq.url
    delete signedReq.headers?.host;

    const start = performance.now();
    const reqResult = await axios(signedReq);
    const end = performance.now();
    if (apiConfig.apiTiming === 'on') console.debug(`Time: ${end - start}ms for URL ${url}`);

    return reqResult;
}
