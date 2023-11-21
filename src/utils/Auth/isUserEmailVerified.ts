import { AmplifyUser } from '@aws-amplify/ui';

/**
 * @description Return true if user's email is verified.
 *              Users that are not verified or forced to change their password do not have the attributes key.
 * @param {AmplifyUser | false} user
 * @returns {boolean}
 */
export function isUserEmailVerified(user: false | AmplifyUser): boolean {
    return !!(user && user?.attributes?.email_verified);
}
