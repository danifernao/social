import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Welcome() {
    const { t } = useTranslation('welcome');

    return (
        <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <Head title={t('metaTitle')} />
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">{t('title', { siteName: 'Social' })}</h1>
            <p className="mb-8 max-w-2xl text-lg md:text-xl">{t('description')}</p>
            <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        {t('login')}
                    </Button>
                </Link>
                <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                        {t('register')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
