import React, { createContext, useContext, useEffect, useState } from 'react';

import { AmplifyUser } from '@aws-amplify/ui';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Auth, Hub } from 'aws-amplify';
import { ICredentials } from 'aws-amplify/lib/Common/types/types';

type AuthContextType = {
    user: false | AmplifyUser;
    credentials: false | ICredentials;
    signOut: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: false,
    credentials: false,
    signOut: () => {},
});

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthContextProvider');
    }
    return context;
}

export default function AuthContextProvider({ children }: { children: React.ReactElement }) {
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const [credentials, setCredentails] = useState<false | ICredentials>(false);

    useEffect(() => {
        async function authListener(data: { payload?: { event?: string } }) {
            if (data?.payload?.event) getAuthUser().catch(console.error);
        }
        async function getAuthUser() {
            try {
                const credentials = await Auth.currentCredentials();
                setCredentails(credentials);
            } catch {
                setCredentails(false);
            }
        }
        getAuthUser().catch(console.error);
        Hub.listen('auth', authListener);
    }, []);

    const authContextValue = {
        user: user,
        credentials: credentials,
        signOut: signOut,
    };

    return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}
