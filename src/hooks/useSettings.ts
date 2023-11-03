import { useEffect } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_SETTINGS } from '@/store/appSettings/defaultSettings';
import { updateConfig } from '@/utils/HealthScribeApi';

export function useSettings() {
    const [appSettings, setAppSettings] = useLocalStorage('App-Settings', DEFAULT_SETTINGS);

    // Update HealthScribe API settings when appSettings is changed
    useEffect(() => {
        const region = appSettings['app.region']?.value || 'us-east-1';
        const apiTiming = appSettings['app.apiTiming']?.value || 'off';
        updateConfig({ region: region, apiTiming: apiTiming });
    }, [appSettings]);

    return [appSettings, setAppSettings] as const;
}
