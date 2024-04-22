import React from 'react';

import FormField from '@cloudscape-design/components/form-field';
import { OptionDefinition } from '@cloudscape-design/components/internal/components/option/interfaces';
import Select from '@cloudscape-design/components/select';

import { AppSettingKeys, AppSettings } from '@/store/appSettings/appSettings.type';
import { DEFAULT_SETTINGS } from '@/store/appSettings/defaultSettings';
import { appSettingOptions } from '@/store/appSettings/settingOptions';

type SettingSelectProps = {
    formLabel: string;
    formDescription: string | React.ReactNode;
    optionKey: AppSettingKeys;
    selectedOption: OptionDefinition;
    setLocalSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
};

export function SettingSelect({
    formLabel,
    formDescription,
    optionKey,
    selectedOption,
    setLocalSettings,
}: SettingSelectProps) {
    function updateSettings(settingKey: string, value: string | OptionDefinition) {
        setLocalSettings((prevSettings) => ({
            ...prevSettings,
            ...{
                [settingKey]: value,
            },
        }));
    }

    return (
        <FormField label={formLabel} description={formDescription}>
            <Select
                selectedOption={selectedOption || DEFAULT_SETTINGS[optionKey]}
                onChange={({ detail }) => updateSettings(optionKey, detail.selectedOption)}
                options={appSettingOptions[optionKey]}
            />
        </FormField>
    );
}
