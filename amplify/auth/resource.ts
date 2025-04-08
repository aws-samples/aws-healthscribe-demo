import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
    loginWith: {
        email: {
            verificationEmailStyle: 'CODE',
            verificationEmailSubject: 'Welcome to the AWS HealthScribe Demo',
            verificationEmailBody: (createCode) => `Your verification code is: ${createCode()}`,
        },
    },
});
