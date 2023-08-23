// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState } from 'react';

function save(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key: string) {
    // returns null if key is not present
    const value = localStorage.getItem(key);
    try {
        return value && JSON.parse(value);
    } catch (e) {
        return undefined;
    }
}

/**
 * Usage:
 * const [value, setValue] = useCache(key, 'defaultValue');
 */
export function useLocalStorage<SettingType>(key: string, defaultValue: SettingType) {
    const [value, setValue] = useState<SettingType>(() => load(key) ?? defaultValue);

    function handleValueChange(newValue: SettingType) {
        setValue(newValue);
        save(key, newValue);
    }

    return [value, handleValueChange] as const;
}
