import { defineBackend } from '@aws-amplify/backend';
import { Aws, Stack } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

import { auth } from './auth/resource';
import { HealthScribeDependencies } from './custom/healthScribeDependencies';

const backend = defineBackend({
    auth,
});

/**
 * Authentication overrides
 */
const { cfnIdentityPool, cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources;
// Disable guest access
cfnIdentityPool.allowUnauthenticatedIdentities = false;
// Enable self-service sign-up. Set to true to disable
cfnUserPool.adminCreateUserConfig = { allowAdminCreateUserOnly: false };
// Enable threat protection
cfnUserPool.userPoolAddOns = { advancedSecurityMode: 'ENFORCED' };
// Set password policy
cfnUserPool.policies = {
    passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        temporaryPasswordValidityDays: 7,
    },
};

// Set token validity periods
cfnUserPoolClient.refreshTokenValidity = 600;
cfnUserPoolClient.accessTokenValidity = 10;
cfnUserPoolClient.idTokenValidity = 1;
cfnUserPoolClient.tokenValidityUnits = {
    refreshToken: 'minutes',
    accessToken: 'minutes',
    idToken: 'hours',
};

/**
 * HealthScribe dependencies:
 * - S3 bucket for HealthScribe output
 * - S3 bucket for access logging
 * - IAM service role for HealthScribe to access S3 bucket
 */
const healthScribeDependenciesStack = backend.createStack('hs-dependencies');
const healthScribeDependencies = new HealthScribeDependencies(healthScribeDependenciesStack, 'dependencies');

// Set authenticated user IAM policies
const authStack = Stack.of(backend.auth.resources.userPool);
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
    new Policy(authStack, 'healthscribe-demo', {
        statements: [
            new PolicyStatement({
                sid: 'HealthScribe',
                actions: [
                    'transcribe:DeleteMedicalScribeJob',
                    'transcribe:ListMedicalScribeJobs',
                    'transcribe:GetMedicalScribeJob',
                    'transcribe:StartMedicalScribeJob',
                ],
                resources: ['*'],
                effect: Effect.ALLOW,
            }),
            new PolicyStatement({
                sid: 'S3',
                actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
                resources: [`${healthScribeDependencies.hsStorageBucket.bucketArn}/*`],
                effect: Effect.ALLOW,
            }),
            new PolicyStatement({
                sid: 'HealthScribeServicePassrole',
                actions: ['iam:PassRole'],
                resources: [healthScribeDependencies.hsServiceRole.roleArn],
                effect: Effect.ALLOW,
            }),
            new PolicyStatement({
                sid: 'Polly',
                actions: ['polly:SynthesizeSpeech'],
                resources: ['*'],
                effect: Effect.ALLOW,
            }),
            new PolicyStatement({
                sid: 'ComprehendMedical',
                actions: [
                    'comprehendmedical:DetectEntitiesV2',
                    'comprehendmedical:InferICD10CM',
                    'comprehendmedical:InferRxNorm',
                    'comprehendmedical:InferSNOMEDCT',
                ],
                resources: ['*'],
                effect: Effect.ALLOW,
            }),
        ],
    })
);

backend.addOutput({
    storage: {
        aws_region: Aws.REGION,
        bucket_name: healthScribeDependencies.hsStorageBucket.bucketName,
    },
    custom: {
        hsServiceRoleArn: healthScribeDependencies.hsServiceRole.roleArn,
    },
});
