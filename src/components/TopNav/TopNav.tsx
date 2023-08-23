// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, useEffect } from 'react';

// Context
import { useAuthContext, useAppContext } from '../App';

// App
import Auth from '../Auth';
import isUserAuth from '../../utils/Auth/isUserAuth';

// Cloudscape
import { applyDensity, applyMode, Density, Mode } from '@cloudscape-design/global-styles';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { TopNavigationProps } from '@cloudscape-design/components/top-navigation';

type TopNavParams = {
    signOut: () => void;
    // eslint-disable-next-line no-unused-vars
    setAppTheme: (theme: string) => void;
};

type TopNavClick = {
    detail: {
        id: string;
    };
};

export default function TopNav({ signOut, setAppTheme }: TopNavParams) {
    const { user } = useAuthContext();
    const { appTheme } = useAppContext();

    const [authVisible, setAuthVisible] = useState(false); // authentication modal visibility
    const [density, setDensity] = useState('density.comfortable'); // app density

    // Set appTheme
    useEffect(() => {
        switch (appTheme) {
            case 'theme.light':
                applyMode(Mode.Light);
                break;
            case 'theme.dark':
                applyMode(Mode.Dark);
                break;
            default:
                break;
        }
    }, [appTheme]);

    // When user authenticates, close authentication modal window
    useEffect(() => {
        if (isUserAuth(user)) {
            setAuthVisible(false);
        }
        // no else because we want the auth window to only pop up by clicking sign in, not automatically
    }, [user]);

    // Change visualization
    function handleUtilVisualClick(e: TopNavClick) {
        switch (e.detail.id) {
            case 'theme.light':
                setAppTheme('theme.light');
                break;
            case 'theme.dark':
                setAppTheme('theme.dark');
                break;
            case 'density.comfortable':
                applyDensity(Density.Comfortable);
                setDensity('density.comfortable');
                break;
            case 'density.compact':
                applyDensity(Density.Compact);
                setDensity('density.compact');
                break;
            default:
                break;
        }
    }

    const utilVisual: TopNavigationProps.MenuDropdownUtility = {
        type: 'menu-dropdown',
        iconName: 'settings',
        ariaLabel: 'Settings',
        title: 'Settings',
        items: [
            {
                id: 'theme',
                text: 'Theme',
                items: [
                    {
                        id: 'theme.light',
                        text: 'Light',
                        disabled: appTheme === 'theme.light',
                        disabledReason: 'Currently selected',
                    },
                    {
                        id: 'theme.dark',
                        text: 'Dark',
                        disabled: appTheme === 'theme.dark',
                        disabledReason: 'Currently selected',
                    },
                ],
            },
            {
                id: 'density',
                text: 'Density',
                items: [
                    {
                        id: 'density.comfortable',
                        text: 'Comfortable',
                        disabled: density === 'density.comfortable',
                        disabledReason: 'Currently selected',
                    },
                    {
                        id: 'density.compact',
                        text: 'Compact',
                        disabled: density === 'density.compact',
                        disabledReason: 'Currently selected',
                    },
                ],
            },
        ],
        onItemClick: (e) => handleUtilVisualClick(e),
    };

    const utilUser: TopNavigationProps.ButtonUtility | TopNavigationProps.MenuDropdownUtility = !isUserAuth(user)
        ? {
              type: 'button',
              text: 'Sign In',
              onClick: () => setAuthVisible(true),
          }
        : {
              type: 'menu-dropdown',
              text: user?.attributes?.email || user?.username,
              description: user?.attributes?.email,
              iconName: 'user-profile',
              items: [{ id: 'signout', text: 'Sign out' }],
              onItemClick: () => signOut(),
          };

    const navUtils = [utilVisual, utilUser];

    return (
        <>
            <Auth visible={authVisible} setVisible={setAuthVisible} />
            <TopNavigation
                identity={{
                    href: '/',
                    title: 'Amazon Web Services',
                }}
                utilities={navUtils}
            />
        </>
    );
}
