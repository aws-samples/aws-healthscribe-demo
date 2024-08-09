import React from 'react';

import { CollectionPreferencesProps } from '@cloudscape-design/components';
import CollectionPreferences from '@cloudscape-design/components/collection-preferences';

import { collectionPreferencesProps } from '@/components/Conversations/conversationsPrefs';

type TablePreferencesProps = {
    preferences: CollectionPreferencesProps.Preferences;
    setPreferences: (newValue: CollectionPreferencesProps.Preferences) => void;
};
export function TablePreferences({ preferences, setPreferences }: TablePreferencesProps) {
    return (
        <CollectionPreferences
            {...collectionPreferencesProps}
            preferences={preferences}
            onConfirm={({ detail }) => setPreferences(detail)}
        />
    );
}
