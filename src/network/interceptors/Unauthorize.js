import { Actions } from 'react-native-router-flux';
import Endpoint from '../Endpoint';

const UnauthorizeStatusCode = 401;
const MAX_RETRY_COUNT = 3;

export function onFullfilled(response) {
    //check if server response error
    if (response.data.error) {
        return Promise.reject(response);
    }
    return Promise.resolve(response);
}

export function onRejected(axiosIntance, error) {
    const originalRequest = error.config;
    const response = error.response;

    // Return any error which is not due to authentication back to the calling service 
    // or if user login failed.
    if (response.status !== UnauthorizeStatusCode || originalRequest.url.includes(Endpoint.LOGIN)) {
        return Promise.reject(error);
    }

    // UnauthorizeStatusCode
    Actions.replace("login")

    // // Implement retry count to avoid refreshing token call multiple times. 
    // // Maximum = 3. 
    // const retryCount = originalRequest.headers['Retry'] || 0;
    // if (retryCount >= MAX_RETRY_COUNT) {
    //     return Promise.reject(error);
    // }

    // // Trying refresh token
    // return TokenRefreshManager.refreshToken(originalRequest.baseURL)
    //     .then((response) => {
    //         // Save acessToken
    //         AccessTokenManager.saveAccessToken(response.data)

    //         // Overide authorization with new token
    //         AccessTokenManager.addBearerAuthentication(originalRequest);

    //         // Retry
    //         originalRequest.headers = {
    //             ...originalRequest.headers,
    //             'Retry': retryCount + 1
    //         };
            
    //         // Retry request with new token
    //         return axiosIntance(originalRequest)
    //     })
    //     .catch((refreshTokenError) => {
    //         // Token refresh didn't work
    //         // Logout user 
    //         // Passing previous error
    //         console.log("Refresh token error:" + refreshTokenError)
    //         Actions.replace("login")
    //         StoreManager.logout()
    //     })
}