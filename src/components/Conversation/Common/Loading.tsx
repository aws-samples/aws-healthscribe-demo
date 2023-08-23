// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { memo } from 'react';

// Cloudscape
import Spinner from '@cloudscape-design/components/spinner';

import styles from './Loading.module.css';

type LoadingProps = {
    loading: boolean;
    text?: string;
};

export const Loading = memo(function Loading({ loading, text }: LoadingProps) {
    if (loading) {
        return (
            <div className={styles.loading}>
                <Spinner /> {text}
            </div>
        );
    } else {
        return null;
    }
});
