// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export default async function sleep(milliseconds: number) {
    await new Promise((resolve) => {
        return setTimeout(resolve, milliseconds);
    });
}
