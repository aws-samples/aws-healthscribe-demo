// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Box from '@cloudscape-design/components/box';
import Spinner from '@cloudscape-design/components/spinner';

export default function SuspenseLoader() {
    return (
        <Box textAlign={'center'} margin={'xl'}>
            <Spinner size={'large'} />
        </Box>
    );
}
