# AWS HealthScribe Demo

The AWS HealthScribe Demo app shows the art of the possible with [AWS HealthScribe](https://aws.amazon.com/healthscribe/), a HIPAA-elgible service empowering healthcare software vendors to build clinical applications that automatically generate clinical notes by analyzing patient-clinician conversations.

After deploying the demo, you can submit audio files to AWS HealthScribe, view the status of the job, and visualize the transcript and summarized clinical notes, including sections like complaint, history of present illness, assessment, and treatment plan.

This project uses [AWS Amplify](https://aws.amazon.com/amplify/) to deploy a full-stack web application with an UI based on [Cloudscape](https://cloudscape.design/), authentication using [Amazon Cognito](https://aws.amazon.com/cognito/) and storage using [Amazon Simple Storage Service (S3)](https://aws.amazon.com/s3/).

-   [Deployment](#deployment)
    -   [Automatic Deployment](#automatic-deployment)
    -   [Semi-Automatic Deployment via AWS CodeCommit](#semi-automatic-deployment-via-aws-codecommit)
-   [Usage](#usage)
-   [Architecture](#architecture)
-   [Cleanup](#cleanup)
-   [Security](#security)
-   [License](#license)

## Deployment

### Automatic Deployment

This method uses AWS Amplify hosting to build, deploy, and serve the web app. You must have a GitHub account.

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/aws-samples/aws-healthscribe-demo)

-   Select the link above.
-   On the _Welcome to Amplify Hosting_ page, Select _Connect to GitHub_.
-   This redirects you to GitHub for authentication, after which you are redirected back to AWS Amplify.
-   In the _Select service role_ dropdown, select a service role that allows Amplify to deploy the app. If none exist, select _Create new role_ and follow the prompts.
-   Select _Save and deploy_.

### Semi-Automatic Deployment via AWS CodeCommit

See the [deployment guide](./docs/deploy.md) for semi-automatic steps.

## Usage

Amplify deploys a public-accessible website. When you first visit the site, select the **Sign In** link at the top right of the page. From there, select **Create Account** and fill in the required information. Once authenticated, you have access to all features of this web app. Note that all conversations are viewable by any authenticated user.

## Architecture

![AWS HealthScribe Demo Architecture](./images/AWS-HealthScribe-Demo-Architecture.png)

## Cleanup

_Note:_ the S3 bucket containing audio files and HealthScribe output is retained during delete. The S3 bucket containing access logs for the former is also retained during delete.

-   Navigate to the [AWS console for AWS Amplify](https://console.aws.amazon.com/amplify/home)
-   Select the web app
-   On the top right, select _Actions_, then _Delete app_

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
