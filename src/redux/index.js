import { combineReducers } from 'redux';

import StoreManager from './StoreManager'
import ActionType from './ActionType';
import * as RefreshActions from './refresh/action';
import * as DataActions from './data/action';

// Our custom reducers
// We need to import each one here and add them to the combiner at the bottom

import refresh from './refresh/reducer';
import data from './data/reducer';

// Combine all
const appReducer = combineReducers({
    refresh,
    data
});

// Setup root reducer
const rootReducer = (state, action) => {
    const newState = state;
    return appReducer(newState, action);
};

export default rootReducer;

export { StoreManager, ActionType, RefreshActions, DataActions }