// 'use strict'
import ActionType from './ActionType'
const StoreManager = {

    register(store) {
        this._store = store;
    },

    unregister() {
        this._store = null;
    },

    setReminders(reminders) {
        this._store.dispatch({ type: ActionType.SET_REMINDERS, reminders: reminders})
    }

}
export default StoreManager


