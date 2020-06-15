import * as LocalStorage from './LocalStorage';
import { Actions } from 'react-native-router-flux'
import AccessTokenManager from './AccessTokenManager'
import ReminderDataManager from './ReminderDataManager'

const AppManager = {
    showDailyAffirmation: true,
    skipLogin: false,
    initializeCall: null,
};


const SKIP_LOGIN = 'SKIP_LOGIN'
function initializeLogin() {
    return new Promise((resolve, reject) => {
        LocalStorage.get(SKIP_LOGIN, (error, result) => {
            if (error || result == null) {
                return resolve(false)
            }
            
            const skipLogin = JSON.parse(result)
            return resolve(skipLogin)
        });
    })
}

AppManager.initialize = () => {
    if (AppManager.initializeCall) {
        return AppManager.initializeCall;
    }

    AppManager.initializeCall = Promise.all([initializeLogin(), AccessTokenManager.initializeAndValidate(), ReminderDataManager.initialize()])
                    .then(values => {
                        const isSkipLogin = values[0];
                        const success = values[1]
                        if (success || isSkipLogin) {
                            AppManager.initializeCall = null;
                            Actions.replace('root')
                            
                            return Promise.resolve(true)
                        }
                        //do not have token, open Login Screen
                        Actions.replace('login')
                        AppManager.initializeCall = null;
                        return Promise.resolve(true)
                    }).catch(error => {
                        console.log(error);
                        AppManager.initializeCall = null;
                        Promise.resolve(true)
                    })

    return AppManager.initializeCall;
}

AppManager.skipLogin = () => {
    LocalStorage.set(SKIP_LOGIN, JSON.stringify(true))
}


export default AppManager