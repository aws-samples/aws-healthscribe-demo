import { fetchAuthSession } from 'aws-amplify/auth';

import config from '@/amplifyconfiguration.json';

export type ApiConfig = {
    region: string;
    apiTiming: string;
};

let apiConfig: ApiConfig = {
    region: '',
    apiTiming: 'off',
};

/**
 * Update the API config with the new values.
 * This is used to update the API config when the user changes the region or timing.
 * @param newApiConfig
 */
function updateConfig(newApiConfig: ApiConfig) {
    apiConfig = { ...apiConfig, ...newApiConfig };
}

/**
 * Return the credentials for the AWS SDK
 * @returns Promise<AWSCredentials>
 */
async function getCredentials() {
    const sessionAuthData = await fetchAuthSession();
    return sessionAuthData.credentials;
}

/**
 * Return the region where the Amplify S3 bucket is located.
 * @returns string
 */
function getAmplifyRegion() {
    return config?.aws_project_region || 'us-east-1';
}

/**
 * Return the region configured in Settings in the app
 * @returns string
 */
function getConfigRegion() {
    return apiConfig.region;
}

/**
 * Print the timing of an API call to the console if apiTiming is on
 * @param duration - The duration of the API call in milliseconds
 * @param description - A description of the API call
 */
function printTiming(duration: number, description: string) {
    if (apiConfig.apiTiming === 'on') console.debug(`Time: ${duration}ms for ${description}`);
}

export { apiConfig, updateConfig, getCredentials, getAmplifyRegion, getConfigRegion, printTiming };
