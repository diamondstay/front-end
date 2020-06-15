/**
 * Global App Config
 */

/* global __DEV__ */
import { Platform } from 'react-native';
import Env from './Environment'
const ApiConfig = {
    TEST_API_BASE_URL: 'https://test.haven.fruitful.io/api/',
    // UAT_API_BASE_URL: 'https://uat.haven.fruitful.io/api/',
    // PRO_API_BASE_URL: 'https://test.haven.fruitful.io/api/'
}

export default {
    // App Details
    appName: 'Endota Haven Portal',

    // Build Configuration - eg. Debug or Release?
    DEV: __DEV__,

    ENVIRONMENT: Env.test,

    // platform type: 1: IOS 2: Android
    platformType: Platform.OS === 'ios' ? 1 : 2,

    // URLs
    API_BASE_URL: {
        test: ApiConfig.TEST_API_BASE_URL,
        prod: ApiConfig.PRO_API_BASE_URL,
        uat: ApiConfig.UAT_API_BASE_URL
    },

    // ClientEncoded = base64Encoder(clientIdValue:clientSecretValue)
    // BASIC_AUTHENTICATION = 'Basic ' + ClientEncoded
    API_BASIC_AUTHENTICATION: {
        // Client ID: cImQgyuF28A4RIiZV2WZ6Dkalr5ZNI2C
        // Client Secret: IfNMhBRDS3PYxeZ0
        test: 'Basic Y0ltUWd5dUYyOEE0UklpWlYyV1o2RGthbHI1Wk5JMkM6SWZOTWhCUkRTM1BZeGVaMA==',

        // Client ID: yLYGTTo0trjUJGMYptRKiRBSnUXuFRhr
        // Client Secret: E4lPPNU8M7oASaJ5
        pro: 'Basic eUxZR1RUbzB0cmpVSkdNWXB0UktpUkJTblVYdUZSaHI6RTRsUFBOVThNN29BU2FKNQ=='
    },
    GOOGLE_AUTH_WEB_CLIENT_ID: '897143998964-q6ohbt1vhd1a7lvojvgiv1n55mfr91g3.apps.googleusercontent.com' // Web client id from google-services.json file
};