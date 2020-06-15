import ApiManager from './ApiManager'
import Endpoint from './Endpoint'

import { AppConfig } from '@constant';

import _ from 'lodash';

/**
 * Init API
 */
const API = ApiManager.getInstance(AppConfig.ENVIRONMENT) // Init with test env by default. 
// LocalStorage.get('env', (error, result) => {
//     if (!error) {
//         const manager = ApiManager.getInstance(result = Env.test);
//         API.env = manager.env
//         API.instance = manager.instance
//     }
// });

// API.switchEnv = (env) => {
//     const manager = ApiManager.getInstance(result);
//     API.env = manager.env
//     API.instance = manager.instance
//     LocalStorage.set('env', env);
// }


API.DEFAULT_PAGE_SIZE = 100

/* Export Component ==================================================================== */

API.getReminderTemplate = () => {
  return API.instance.get(Endpoint.GET_REMINDER_TEMPLATE)
}

API.getAffirmation = () => {
  return API.instance.get(Endpoint.GET_AFFIRMATION)
}

API.loginGoogle = (params) => {
  return API.instance.post(Endpoint.LOGIN_GOOGLE, params)
}

API.loginFacebook = (params) => {
  return API.instance.post(Endpoint.LOGIN_FACEBOOK, params)
}

API.loginApple = (params) => {
  return API.instance.post(Endpoint.LOGIN_APPLE, params)
}

API.getAffirmation = () => {
  return API.instance.get(Endpoint.GET_AFFIRMATION)
}

API.getQuote = () => {
  return API.instance.get(Endpoint.GET_QUOTE)
}

API.synchronize = (params) => {
  return API.instance.post(Endpoint.SYNCHRONIZED, params)
}

export default API;
