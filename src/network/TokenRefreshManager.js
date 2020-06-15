import axios from 'axios'
import Endpoint from './Endpoint'
import { AccessTokenManager } from '@domain'

const TokenRefreshManager = { isRefreshing: false, refreshCall: null }

TokenRefreshManager.refreshToken = (baseURL) => {
    if (TokenRefreshManager.isRefreshing) {
        return TokenRefreshManager.refreshCall
    }

    if (!AccessTokenManager.getRefreshToken()) {
        Promise.reject(false);
    }

    TokenRefreshManager.isRefreshing = true;
    TokenRefreshManager.refreshCall = new Promise((resolve, reject) => {
        var refreshBody = {
            grant_type: "refresh_token",
            refresh_token: AccessTokenManager.getRefreshToken(),
        }
        const defaultConfigs = AccessTokenManager.addBasicAuthentication(axios.defaults);
        defaultConfigs.baseURL = baseURL

        axios.post(Endpoint.REFRESH, refreshBody, defaultConfigs)
            .then(response => {
                console.log("Refresh token success: ", response)

                // Clear old data
                TokenRefreshManager.isRefreshing = false;
                TokenRefreshManager.refreshCall = null;

                // Notify get new token success
                resolve(response);
            })
            .catch((error) => {
                console.log("Refresh token error: ", error)
                TokenRefreshManager.isRefreshing = false;
                TokenRefreshManager.refreshCall = null;

                reject(error);
            });
    });

    return TokenRefreshManager.refreshCall
}

export default TokenRefreshManager