import ActionType from '../ActionType';

export function postEvent(eventType, data) {
    return async (dispatch) => {
        return dispatch({
            type: ActionType.REFRESH,
            data: { eventType, data }
        })
    }
}