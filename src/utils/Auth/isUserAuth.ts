// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// https://github.com/aws-amplify/amplify-js/issues/11113
import { AmplifyUser } from '@aws-amplify/ui';

// user is authenticated if the object has the email_verified: true attribute
export default function isUserAuth(user: AmplifyUser | undefined) {
    return user?.attributes?.email_verified ? true : false;
}
