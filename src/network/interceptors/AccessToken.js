import Endpoint from '../Endpoint';
import { AccessTokenManager } from '@domain'

export function addExtraInfo(config) {
    const url = config.url;
    if (Endpoint.LOGIN == url) {
        return AccessTokenManager.addBasicAuthentication(config)
    } else {
        return AccessTokenManager.addBearerAuthentication(config)
    }
}

export function onRejected(error) {
    return Promise.reject(error);
}