import { LocalStorage, AccessTokenManager } from '@domain';
const CURRENT_USER = "CURRENT_USER"

const UserManager = {
    currentUser: null,
};

// Should init in Splash Screen
UserManager.initialize = () => {
    return new Promise((resolve, reject) => {
        LocalStorage.get(CURRENT_USER, (error, result) => {
            if (error) {
                return resolve(false)
            }
            if (result == null) {
                return resolve(false)
            }

            UserManager.currentUser = JSON.parse(result)
            return resolve(UserManager.currentUser)
        })
    });
};

//  LOGGED USER 
UserManager.setCurrentUser = (user) => {
    UserManager.currentUser = user;
    LocalStorage.set(CURRENT_USER, JSON.stringify(user));
}

UserManager.clear = () => {
    LocalStorage.remove(CURRENT_USER);
    UserManager.currentUser = null;
}

UserManager.logout = () => {
    UserManager.clear();
    AccessTokenManager.clear();
}


export default UserManager;