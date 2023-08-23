## AWS Amplify Deployment Details

-   [AWS Amplify Deployment Details](#aws-amplify-deployment-details)
    -   [Amplify Base](#amplify-base)
    -   [Auth](#auth)
    -   [Storage](#storage)
    -   [Function](#function)
    -   [Custom](#custom)
    -   [Other](#other)

All backend resources are deployed by AWS Amplify. This document describes where/how these resources are deployed.

### Amplify Base

This stack creates:

-   A deployment S3 bucket to keep track of the Amplify deployment.

-   An auth and unauth role for Amazon Cognito Identity Pool

This stack is overriden in [awscloudformation/override.ts](../amplify/backend/awscloudformation/override.ts) to:

-   Add HealthScribe IAM actions to the auth role. This allows authenticated users in the app to call HealthScribe.

### Auth

This stack creates:

-   An Amazon Cognito user pool and identity pool.

-   The identity pool uses the auth and unauth roles from the base stack. In this webapp, unauth logins are not permitted.

This stack is overriden in [auth/healthScribeDemo/auth/override.ts](../amplify/backend/auth/healthScribeDemoAuth/override.ts) to:

-   Reduce the timeframe for token validity periods:

    -   Refresh token to 1 day

    -   Access token to 1 hour

    -   Identity token to 1 hour

### Storage

This stack creates:

-   An S3 bucket used for audio files and HealthScribe output files.

-   IAM policies that allow authenticated users access to specific keys in this bucket.

This stack is overriden in [storage/healthScribeDemoStorage/override.ts](../amplify/backend/storage/healthScribeDemoStorage/override.ts) to:

-   Create an IAM policy for the auth role to allow PutObject, PubObjectAcl, and GetObject. This allows any authenticated user to upload files and download HealthScribe output json.

-   Block public access for the Amplify-created bucket.

-   Create a private S3 bucket to store access logs from the Amplify-created storage S3 bucket.

-   Create an IAM service role for `transcribe.amazon.com` to assume, that allows s3:GetObject, s3:PubObject, and s3:ListBucket on the Amplify-created bucket. This role is assumed by HealthScribe to read the audio file and write the results.

-   Create an IAM PassRole policy for the auth role to allow authenticated users to pass the service role to HealthScribe.

### Function

This stack creates:

-   A Node.js 18 Lambda function that is meant to be used as a custom resource. It expects two properties: the names of the storage bucket and logging bucket. The Lambda function turns on logging on the storage bucket and the destination is `loggingBucket/s3-access-logs/`.

This is done because the AWS-managed AdministratorAccess-Amplify role does not have s3:PutBucketLogging permissions.

### Custom

This custom CDK resource creates:

-   An S3 bucket for S3 access logs and a least-privilege bucket policy. This bucket receives access logs for the Amplify-created storage bucket.

-   A custom resource to invoke the Lambda function above to turn on access logging for the storage S3 bucket.

### Other

The order of deployment matters in this case. As of Aug 22, 2023, Amplify deploys resources based on the order in [backend-config.json](../amplify/backend/backend-config.json).
