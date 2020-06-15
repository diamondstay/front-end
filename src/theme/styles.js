/**
 * App Styles
 */
import Colors from './colors';
import Fonts from './fonts';

const appStylesBase = {

    // Text Styles
    appContainer: {
        flex: 1,
    },
    baseText: {
        fontFamily: Fonts.base.family,
        fontSize: Fonts.base.size,
        color: Colors.dark,
    },
    boldText: {
        fontFamily: Fonts.bold.family,
        fontSize: Fonts.base.size,
        color: Colors.dark,
    },
    semiboldText: {
        fontFamily: Fonts.semibold.family,
        fontSize: Fonts.base.size,
        color: Colors.dark,
    },
    lightText: {
        fontFamily: Fonts.light.family,
        fontSize: Fonts.base.size,
        color: Colors.dark,
    },
    domaineDispRegular: {
        fontFamily: Fonts.ddnRegular.family,
        fontSize: Fonts.base.size,
        color: Colors.dark
    },
}

export default {
    // Import app styles base
    ...appStylesBase
}