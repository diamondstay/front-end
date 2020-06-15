/**
 * App Theme - Sizes
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const screenHeight = width < height ? height : width;
const screenWidth = width < height ? width : height;

export default {
    // Window Dimensions
    screen: {
        height: screenHeight,
        width: screenWidth,
    },

    paddingXLarge: 40,
    paddingLarge: 32,
    paddingMedium: 24,
    padding: 16,
    paddingSmall: 8,
    paddingXSmall: 4,

    marginXLarge: 40,
    marginLarge: 32,
    marginMedium: 24,
    margin: 16,
    marginSmall: 8,
    marginXSmall: 4,

    fontSmall: 12,
    fontBase: 14,
    fontMedium: 16,
    fontLarge: 20,
    fontXLarge: 30,
};