import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';
import { I18nManager } from 'react-native';

const Localization = {}

const translationGetters = {
    // lazy requires (metro bundler does not support symlinks)
    en: () => require('./locales/en.json'),
    fr: () => require('./locales/fr.json'), // France
};

// Cache
Localization.t = memoize(
    (key, config) => i18n.t(key, config || { defaultValue: key }),
    (key, config) => (config ? key + JSON.stringify(config) : key)
);

Localization.setI18nConfig = () => {
    // fallback if no available language fits
    const fallback = { languageTag: 'en', isRTL: false };

    const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback;

    // clear translation cache
    Localization.t.cache.clear();

    // update layout direction
    I18nManager.forceRTL(isRTL);

    // set i18n-js config
    i18n.translations = { [languageTag]: translationGetters[languageTag]() };
    i18n.locale = languageTag;
};
export default Localization