// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
// This is a modal authentication component that displays the AWS Amplify Authenticator.
import React, { useMemo } from 'react';

import * as awsui from '@cloudscape-design/design-tokens';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { Authenticator, Theme, ThemeProvider, defaultDarkModeOverride } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { useAppThemeContext } from '@/store/appTheme';

const authUiComponents = {
    SignUp: {
        Header() {
            return (
                <div
                    style={{
                        textAlign: 'center',
                        paddingTop: '10px',
                        fontStyle: 'italic',
                    }}
                >
                    A verification code will be sent to your email address to validate the account.
                </div>
            );
        },
    },
};

type AuthParams = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
};

export default function Auth({ visible, setVisible }: AuthParams) {
    const { appTheme } = useAppThemeContext();

    /**
     * Amplify-UI's <Authentication /> uses 80 for the button, 90 for hover
     * Override to Cloudscape colors - https://cloudscape.design/foundation/visual-foundation/colors/
     */
    const amplifyTheme: Theme = {
        name: 'AuthTheme',
        overrides: [defaultDarkModeOverride],
        tokens: {
            colors: {
                primary: {
                    80: awsui.colorBackgroundButtonPrimaryActive,
                    90: awsui.colorBackgroundButtonPrimaryDefault,
                    100: awsui.colorBackgroundButtonPrimaryActive,
                },
            },
            components: {
                tabs: {
                    item: {
                        _hover: {
                            color: {
                                value: awsui.colorBackgroundButtonPrimaryDefault,
                            },
                        },
                    },
                },
            },
        },
    };

    const colorMode = useMemo(() => {
        if (appTheme.color === 'appTheme.light') {
            return 'light';
        } else if (appTheme.color === 'appTheme.dark') {
            return 'dark';
        } else {
            return 'system';
        }
    }, [appTheme]);

    return (
        <Modal
            onDismiss={() => setVisible(false)}
            visible={visible}
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => setVisible(false)}>
                            Cancel
                        </Button>
                    </SpaceBetween>
                </Box>
            }
        >
            <ThemeProvider theme={amplifyTheme} colorMode={colorMode}>
                <Authenticator components={authUiComponents}>
                    <Box variant="p" textAlign="center">
                        You will be redirected shortly.
                    </Box>
                </Authenticator>
            </ThemeProvider>
        </Modal>
    );
}
