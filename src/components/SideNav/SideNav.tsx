// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import SideNavigation from '@cloudscape-design/components/side-navigation';
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';

export default function SideNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const sideNavItems: SideNavigationProps.Item[] = [
        {
            type: 'link',
            text: 'Appointments',
            href: '/appointments',
        },
        {
            type: 'link',
            text: 'New Appointment',
            href: '/new',
        },
    ];

    return (
        <SideNavigation
            activeHref={`/${location.pathname.split('/')[1]}`}
            header={{ text: 'Raintree AI Scribe POC', href: '/' }}
            items={sideNavItems}
            onFollow={(e) => {
                e.preventDefault();
                if (e.detail.external === true) {
                    window.open(e.detail.href, '_blank', 'noopener');
                    return;
                }
                navigate(e.detail.href, { relative: 'route' });
            }}
        />
    );
}
