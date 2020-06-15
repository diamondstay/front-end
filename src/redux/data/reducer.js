import ActionType from '../ActionType';

// Set initial state
const initialState = {
    reminders: []
}


export default function dataReducer(state = initialState, action) {
    switch (action.type) {
        case ActionType.SET_REMINDERS: {
            
            return {
                ...state,
                reminders: action.reminders
            };
        }

        default:
            return state;
    }
}