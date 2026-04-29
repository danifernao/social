import { usePage } from '@inertiajs/react';
import { ComponentType, useEffect } from 'react';
import i18n from './i18n';
import { Auth } from './types';

type LangProps = {
    Component: ComponentType;
    props: Record<string, unknown>;
};

export default function Lang({ Component, props }: LangProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const navLocale = new Intl.Locale(navigator.language);
    const language = auth.user?.language ?? navLocale.language;

    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    return <Component {...props} />;
}
