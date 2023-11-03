import { AmplifyProjectInfo, AmplifyRootStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyRootStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    const authRole = resources.authRole;

    const basePolicies = Array.isArray(authRole.policies) ? authRole.policies : [authRole.policies];

    /**
     * Allow authenticated users access to HealthScribe APIs
     * The ability for authenticated users to pass the role below to HealthScribe is added in the storage/S3 override
     */
    authRole.policies = [
        ...basePolicies,
        {
            policyName: 'aws-healthscribe',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Resource: '*',
                        Action: [
                            'transcribe:DeleteMedicalScribeJob',
                            'transcribe:ListMedicalScribeJobs',
                            'transcribe:GetMedicalScribeJob',
                            'transcribe:StartMedicalScribeJob',
                        ],
                        Effect: 'Allow',
                    },
                ],
            },
        },
        {
            policyName: 'supporting-services',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Resource: '*',
                        Action: [
                            'polly:SynthesizeSpeech',
                            'comprehendmedical:InferICD10CM',
                            'comprehendmedical:InferRxNorm',
                            'comprehendmedical:InferSNOMEDCT',
                        ],
                        Effect: 'Allow',
                    },
                ],
            },
        },
    ];
}
