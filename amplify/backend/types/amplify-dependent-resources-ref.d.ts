export type AmplifyDependentResourcesAttributes = {
    auth: {
        healthScribeDemoAuth: {
            AppClientID: 'string';
            AppClientIDWeb: 'string';
            IdentityPoolId: 'string';
            IdentityPoolName: 'string';
            UserPoolArn: 'string';
            UserPoolId: 'string';
            UserPoolName: 'string';
        };
    };
    storage: {
        healthScribeDemoStorage: {
            BucketName: 'string';
            HealthScribeServiceRoleArn: 'string';
            Region: 'string';
        };
    };

    function: {
        addBucketLogging: {
            Arn: 'string';
            LambdaExecutionRole: 'string';
            LambdaExecutionRoleArn: 'string';
            Name: 'string';
            Region: 'string';
        };
    };
    custom: {
        addBucketLogging: {
            LoggingBucketName: 'string';
        };
    };
};
