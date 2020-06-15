import ActionType from '../ActionType';

// Set initial state
const initialState = {}

export default function refreshReducer(state = initialState, action) {
    switch (action.type) {
        case ActionType.REFRESH: {
            return {
                ...state,
                event: action.data
            };
        }

        default:
            return state;
    }
}