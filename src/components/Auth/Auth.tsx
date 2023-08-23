// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// This is a modal authentication component that displays the AWS Amplify Authenticator.
import { useMemo } from 'react';

// Context
import { useAppContext } from '../App';

// Cloudscape
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';

// AWS
import { Authenticator, ThemeProvider, defaultDarkModeOverride } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

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
    const { appTheme } = useAppContext();

    /**
     * Amplify-UI's <Authentication /> uses 80 for the button, 90 for hover
     * Override to Cloudscape colors - https://cloudscape.design/foundation/visual-foundation/colors/
     * light mode primary : blue-800 #033160
     * light mode hover   : blue-600 #0972d3
     * dark mode primary  : blue-500 #539fe5
     * dark mode hover    : blue-400 #89bdee
     */
    const theme = {
        name: 'AuthTheme',
        overrides: [defaultDarkModeOverride],
        tokens: {
            colors: {
                brand: {
                    primary: {
                        80: appTheme === 'theme.light' ? '#033160' : '#539fe5',
                        90: appTheme === 'theme.light' ? '#0972d3' : '#89bdee',
                        100: appTheme === 'theme.light' ? '#033160' : '#539fe5',
                    },
                },
            },
            components: {
                tabs: {
                    item: {
                        _hover: {
                            color: {
                                value: appTheme === 'theme.light' ? '#0972d3' : '#89bdee',
                            },
                        },
                    },
                },
            },
        },
    };

    const colorMode = useMemo(() => {
        if (appTheme === 'theme.light') {
            return 'light';
        } else if (appTheme === 'theme.dark') {
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
            <ThemeProvider theme={theme} colorMode={colorMode}>
                <Authenticator components={authUiComponents}>
                    <Box variant="p" textAlign="center">
                        You will be redirected shortly.
                    </Box>
                </Authenticator>
            </ThemeProvider>
        </Modal>
    );
}
