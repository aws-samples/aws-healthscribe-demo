import { AmplifyAuthCognitoStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    // Shorten token validity periods
    resources.userPoolClient.refreshTokenValidity = 1; // days
    resources.userPoolClient.accessTokenValidity = 1; // hours
    resources.userPoolClient.idTokenValidity = 1; // hours

    resources.userPoolClientWeb.refreshTokenValidity = 1; // days
    resources.userPoolClientWeb.accessTokenValidity = 1; // hours
    resources.userPoolClientWeb.idTokenValidity = 1; // hours
}
