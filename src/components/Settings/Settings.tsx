// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, useContext } from 'react';

// Contexts
import { AppContext } from '../App/contexts';

// Cloudscape
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import { OptionDefinition } from '@cloudscape-design/components/internal/components/option/interfaces';

// App
import { DEFAULT_SETTINGS } from './defaultSettings';
import { appRegionOptions } from './selectOptions';

export type AppSettings = {
    'app.region': { label: string; value: string };
    'app.apiTiming': { label: string; value: boolean };
};

type SettingsProps = {
    // eslint-disable-next-line no-unused-vars
    setAppSettings: (newValue: AppSettings) => void;
};

export default function Settings({ setAppSettings }: SettingsProps) {
    const { appSettings } = useContext(AppContext);
    // Saving is instant, but create artificial wait
    const [isSaving, setIsSaving] = useState(false);
    // Make a copy of appSettings, write back it after form validation
    const [settings, setSettings] = useState<AppSettings>(appSettings);

    // Update local settings state
    function updateSettings(settingKey: string, value: string | OptionDefinition) {
        setSettings((prevSettings) => ({
            ...prevSettings,
            ...{
                [settingKey]: value,
            },
        }));
    }

    // Reset settings to defaults, defined in consts
    function handleResetToDefaults() {
        setSettings(DEFAULT_SETTINGS);
    }

    // Reload settings from appSettings from appContext
    function handleReload() {
        setSettings(appSettings);
    }

    function handleSave() {
        setIsSaving(true);
        setTimeout(() => {
            setAppSettings(settings);
            setIsSaving(false);
            window.location.reload();
        }, 900);
    }

    return (
        <ContentLayout
            header={
                <Header variant="h2" description="Settings are saved locally to the browser">
                    Settings
                </Header>
            }
        >
            <Container>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <Form
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button disabled={isSaving} formAction="none" onClick={() => handleReload()}>
                                    Reload
                                </Button>
                                <Button disabled={isSaving} variant="primary">
                                    {isSaving ? <Spinner /> : 'Save'}
                                </Button>
                            </SpaceBetween>
                        }
                        secondaryActions={
                            <Button disabled={isSaving} formAction="none" onClick={() => handleResetToDefaults()}>
                                Reset to Defaults
                            </Button>
                        }
                    >
                        <FormField
                            label="AWS HealthScribe Region"
                            description="During the public preview, AWS HealthScribe is available in the US East (N. Virginia) region."
                        >
                            <Select
                                selectedOption={settings['app.region']}
                                onChange={({ detail }) => updateSettings('app.region', detail.selectedOption)}
                                options={appRegionOptions}
                            />
                        </FormField>
                    </Form>
                </form>
            </Container>
        </ContentLayout>
    );
}
