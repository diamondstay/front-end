import * as LocalStorage from './LocalStorage';
import { AppConfig } from '@constant'

/*
Client ID: cImQgyuF28A4RIiZV2WZ6Dkalr5ZNI2C
Client Secret: IfNMhBRDS3PYxeZ0

ClientEncoded = base64Encoder(clientIdValue:clientSecretValue)
BASIC_AUTHENTICATION = 'Basic ' + ClientEncoded
*/
const BASIC_AUTHENTICATION = AppConfig.API_BASIC_AUTHENTICATION[AppConfig.ENVIRONMENT]

const ACCESS_TOKEN = 'accessToken'
const REFRESING_TIME = 30  // in second.

const AccessTokenManager = {
    accessToken: null,
    expiresIn: null,

    refreshToken: null,
    refreshTokenExpiresIn: null,

    // The time token will be saved. 
    // Token invalid if: tokenStartTime +  expiresIn < currentTime
    tokenStartTime: null
};


AccessTokenManager.initializeAndValidate = () => {
    return new Promise((resolve, reject) => {
        LocalStorage.get(ACCESS_TOKEN, (error, result) => {
            if (error) {
                return resolve(false)
            }
            if (result == null) {
                return resolve(false)
            }

            const savedData = JSON.parse(result)

            AccessTokenManager.accessToken = savedData.accessToken;
            AccessTokenManager.expiresIn = savedData.expiresIn;
            AccessTokenManager.refreshToken = savedData.refreshToken;
            AccessTokenManager.refreshTokenExpiresIn = savedData.refreshTokenExpiresIn;
            AccessTokenManager.tokenStartTime = savedData.tokenStartTime;


            resolve(true);
            // AccessTokenManager.validate()
            //     .then(success => {
            //         resolve(success)
            //     })
            //     .catch(error => {
            //         resolve(false)
            //     })
        });
    })
};

function getCurrentInSecond() {
    const currentTimeInMillis = new Date().getTime();
    return Math.round(currentTimeInMillis / 1000)
}

AccessTokenManager.validate = () => {

    if (AccessTokenManager.accessToken == null) {
        return Promise.reject(false)
    }

    const validTime = parseInt(AccessTokenManager.tokenStartTime) + parseInt(AccessTokenManager.expiresIn) * 1000;
    const isTokenExpire = getCurrentInSecond() > (validTime - REFRESING_TIME)

    // const validRefreshTime = parseInt(AccessTokenManager.tokenStartTime) + parseInt(AccessTokenManager.refreshTokenExpiresIn) * 1000
    // const isRefreshTokenExpire = getCurrentInSecond() > (validRefreshTime - REFRESING_TIME)

    // if (isRefreshTokenExpire) {
    //     return Promise.reject(false)
    // }

    if (isTokenExpire) {
        return Promise.reject(false)
        // return TokenRefreshManager.refreshToken()
        //     .then(response => {
        //         return Promise.resolve(true)
        //     }).catch(error => {
        //         return Promise.reject(false)
        //     })
    }

    return Promise.resolve(true)
}

AccessTokenManager.saveAccessToken = (loginResponse) => {

    AccessTokenManager.accessToken = loginResponse.access_token;
    AccessTokenManager.expiresIn = loginResponse.expires_in
    AccessTokenManager.refreshToken = loginResponse.refresh_token
    AccessTokenManager.refreshTokenExpiresIn = loginResponse.refresh_token_expires_in

    AccessTokenManager.tokenStartTime = getCurrentInSecond();

    const savedData = {
        accessToken: AccessTokenManager.accessToken,
        expiresIn: AccessTokenManager.expiresIn,
        refreshToken: AccessTokenManager.refreshToken,
        refreshTokenExpiresIn: AccessTokenManager.refreshTokenExpiresIn,
        tokenStartTime: AccessTokenManager.tokenStartTime,
    }
    LocalStorage.set(ACCESS_TOKEN, JSON.stringify(savedData))
};


AccessTokenManager.clear = () => {
    AccessTokenManager.accessToken = null
    AccessTokenManager.expiresIn = null
    AccessTokenManager.refreshToken = null
    AccessTokenManager.refreshTokenExpiresIn = null
    AccessTokenManager.tokenStartTime = null

    LocalStorage.remove(ACCESS_TOKEN);
};

AccessTokenManager.getAccessToken = () => {
    return AccessTokenManager.accessToken;
};

AccessTokenManager.getRefreshToken = () => {
    return AccessTokenManager.refreshToken;
};

AccessTokenManager.getBearerAuthentication = () => {
    return 'Bearer ' + AccessTokenManager.accessToken
};

AccessTokenManager.addBasicAuthentication = (config) => {
    config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
        'Authorization': BASIC_AUTHENTICATION,
    };

    return config;
};

AccessTokenManager.addBearerAuthentication = (config) => {
    config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
    };

    if (AccessTokenManager.accessToken) {
        config.headers['Authorization'] = AccessTokenManager.getBearerAuthentication();
    }

    return config;
};

AccessTokenManager.isLoggedIn = () => {
    if (AccessTokenManager.accessToken) {
        return true;
    }

    return false;
}

export default AccessTokenManager;