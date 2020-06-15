/**
 * App Theme - Fonts
 */
import { Platform } from 'react-native';

function lineHeight(fontSize) {
    const multiplier = (fontSize > 20) ? 0.1 : 0.33;
    return parseInt(fontSize + (fontSize * multiplier), 10);
}

const ddnRegular = {
    size: 14,
    lineHeight: lineHeight(14),
    ...Platform.select({
        ios: {
            family: 'DomaineDisp-Regular',
        },
        android: {
            family: 'DomaineDisp-Regular',
        },
    }),
};

const base = {
    size: 14,
    lineHeight: lineHeight(14),
    ...Platform.select({
        ios: {
            family: 'Graphik-Regular',
        },
        android: {
            family: 'GraphikRegular',
        },
    }),
};

const graphikLight = {
    size: 14,
    lineHeight: lineHeight(14),
    ...Platform.select({
        ios: {
            family: 'GraphikLight',
        },
        android: {
            family: 'GraphikLight',
        },
    }),
}

const bold = {
    size: 14,
    lineHeight: lineHeight(14),
    ...Platform.select({
        ios: {
            family: 'DomaineDisplay-Bold',
        },
        android: {
            family: 'DomaineDisplayBold',
        },
    }),
};

const domaineDisplaySemiBold = {
    size: 14,
    lineHeight: lineHeight(14),
    ...Platform.select({
        ios: {
            family: 'DomaineDisplaySemibold',
        },
        android: {
            family: 'DomaineDisp-Semibold',
        },
    }),
};

export default {
    base: { ...base },
    bold: { ...bold },
    semibold: { domaineDisplaySemiBold },
    light: { graphikLight },
    ddnRegular: { ...ddnRegular },

    h1: { ...bold, size: base.size * 1.75, lineHeight: lineHeight(base.size * 2) },
    h2: { ...bold, size: base.size * 1.5, lineHeight: lineHeight(base.size * 1.75) },
    h3: { ...bold, size: base.size * 1.25, lineHeight: lineHeight(base.size * 1.5) },
    h4: { ...base, size: base.size * 1.1, lineHeight: lineHeight(base.size * 1.25) },
    h5: { ...base },
    lineHeight: (fontSize) => lineHeight(fontSize),
}