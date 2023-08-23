// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const AMPLIFY_META_PATH = './amplify/backend/amplify-meta.json';
const AWS_CUSTOM_PATH = './src/aws-custom.json';
// const AWS_EXPORTS_PATH = './src/aws-exports.js';
// const TEAM_PROVIDER_INFO_PATH = './amplify/team-provider-info.json';

/**
 * @param data { { amplify: { environment: { envName: string, projectPath: string, defaultEditor: string }, command: string, subCommand: string, argv: string[] } } }
 * @param error { { message: string, stack: string } }
 */
const hookHandler = async () => {
    // Get Amplify Metadata
    const amplifyMeta = JSON.parse(fs.readFileSync(AMPLIFY_META_PATH, 'utf8'));
    // Get IAM role's ARN from the output in the Amplify root stack
    const healthScribeServiceRole = amplifyMeta.storage.healthScribeDemoStorage.output.HealthScribeServiceRoleArn;

    // Write the ARN to AMPLIFY_CUSTOM_PATH, which can be accessed by the frontend
    console.log(`Writing HealthScribe service role to ${AWS_CUSTOM_PATH}`);
    fs.writeFileSync(
        AWS_CUSTOM_PATH,
        JSON.stringify({
            healthScribeServiceRole: healthScribeServiceRole,
        })
    );
};

const getParameters = async () => {
    return JSON.parse(fs.readFileSync(0, { encoding: 'utf8' }));
};

getParameters()
    .then((event) => hookHandler(event.data, event.error))
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    });
