import { AppSettingsOptions } from '@/store/appSettings/appSettings.type';

export const appSettingOptions: AppSettingsOptions = {
    'app.region': [
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'US East (Ohio)', value: 'us-east-2', disabled: true },
        { label: 'US East (N. Virginia)', value: 'us-west-1', disabled: true },
        { label: 'US West (Oregon)', value: 'us-west-2', disabled: true },
    ],
    'app.apiTiming': [
        { label: 'Off', value: 'off' },
        { label: 'On', value: 'on' },
    ],
    'app.comprehendMedicalEnabled': [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled' },
    ],
};
