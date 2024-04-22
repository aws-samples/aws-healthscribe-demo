// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Modal from '@cloudscape-design/components/modal';

import SuspenseLoader from './SuspenseLoader';

export default function ModalLoader() {
    return (
        <Modal visible={true}>
            <SuspenseLoader />
        </Modal>
    );
}
