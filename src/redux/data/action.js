import ActionType from '../ActionType';

export function setReminders(reminders) {
    return {
        type: ActionType.SET_REMINDERS,
        reminders: reminders
    }
}