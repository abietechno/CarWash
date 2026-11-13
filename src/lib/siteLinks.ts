import { Locale } from '../i18n';

const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://washwuzz.cloudbizz.my.id';

// Landing page WashWuzz: Indonesia di "/", Melayu di "/ms", Inggris di "/en".
export const landingUrl = (locale: Locale) => (locale === 'id' ? LANDING_URL : `${LANDING_URL.replace(/\/$/, '')}/${locale}`);
