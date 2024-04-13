export enum AppSettingKeys {
    Region = 'app.region',
    ApiTiming = 'app.apiTiming',
    ComprehendMedicalEnabled = 'app.comprehendMedicalEnabled',
}

export type AppSettingOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type AppSettingsOptions = {
    [key in AppSettingKeys]: AppSettingOption[];
};

export type AppSettings = {
    [key in AppSettingKeys]: AppSettingOption;
};
