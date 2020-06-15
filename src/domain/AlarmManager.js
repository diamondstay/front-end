import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
const { AlarmManagerIos, AlarmManagerAndroid } = NativeModules;
import { ReminderType } from '@constant'
import DatabaseManager from './DatabaseManager'
import { ReminderHelper } from '@helper'
import moment from 'moment'

const AlarmManager = {
    subscription: null,
}

function startObservingAlarmSoundEvent(event) {
    // Find the nearlest alarm date and trigger playing sound at this date.
    console.log('startObservingAlarmSoundEvent', event)
    scheduleNearlestAlarmIos({ id: event.alarmId });
}

AlarmManager.configure = () => {
    if (Platform.OS == 'ios' && AlarmManager.subscription == null) {
        const alarmSoundEmitter = new NativeEventEmitter(AlarmManagerIos);

        const subscription = alarmSoundEmitter.addListener(
            AlarmManagerIos.EventAlarmDidFinishPlaying,
            startObservingAlarmSoundEvent
        );

        AlarmManager.subscription = subscription;
    }
}

AlarmManager.cleanup = () => {
    if (AlarmManager.subscription) {
        AlarmManager.subscription.remove()
        AlarmManager.subscription = null;
    }
}

function startScheduleAlarm(date, sound, alarmId) {
    if (Platform.OS == 'ios') {
        AlarmManagerIos.startScheduleAlarm(date.toISOString(), sound, alarmId)
    } else {
        const androidTimeFormat = moment(date).format(AlarmManagerAndroid.ALARM_DATE_FORMAT);
        AlarmManagerAndroid.startScheduleAlarm(androidTimeFormat, sound, alarmId)
    }
}

function startOneTimeScheduleAlarm(date, sound, alarmId) {
    if (Platform.OS == 'ios') {
        AlarmManagerIos.snoozeScheduleAlarm(date.toISOString(), sound, alarmId)
    } else {
        const androidTimeFormat = moment(date).format(AlarmManagerAndroid.ALARM_DATE_FORMAT);
        console.log("startOneTimeScheduleAlarm", androidTimeFormat, sound, alarmId)
        AlarmManagerAndroid.startOneTimeScheduleAlarm(androidTimeFormat, sound, alarmId)
    }
}

AlarmManager.cancelAlarms = (alarmIds) => {
    for (let alarmId of alarmIds) {
        if (Platform.OS == 'ios') {
            AlarmManagerIos.cancelAlarm(alarmId)
        } else {
            AlarmManagerAndroid.cancelAlarm(alarmId)
        }
    }
}

AlarmManager.stopAlarmSound = (alarm) => {
    if (Platform.OS == 'ios') {
        AlarmManagerIos.stopAlarmSound(alarm.id)
        scheduleNearlestAlarmIos(alarm)
    } else {
        AlarmManagerAndroid.stopAlarmSound(alarm.id, alarm.sound)
    }
}

AlarmManager.stopAllSound = () => {
    if (Platform.OS == 'ios') {
        AlarmManagerIos.stopAllSound()
    }
}

AlarmManager.onAlarmChanged = (alarm) => {
    return new Promise((resolve) => {
        if (alarm.type == ReminderType.ALARM) {
            if (Platform.OS == 'ios') {
                scheduleNearlestAlarmIos(alarm);
            } else {
                scheduleAlarmAndroid(alarm)
            }
        }

        return resolve()
    })
}

AlarmManager.snoozeAlarm = (alarm, snoozeDate) => {
    startOneTimeScheduleAlarm(snoozeDate, alarm.sound, alarm.id);
}

function scheduleNearlestAlarmIos(alarm) {
    const activeAlarms = DatabaseManager.getAllActiveAlarms();
    if (activeAlarms && activeAlarms.length) {
        const nextAlarm = ReminderHelper.findNearlestAlarmByDate(activeAlarms)
        console.log("scheduleNearlestAlarmIos: ", nextAlarm)
        if (nextAlarm) {
            startScheduleAlarm(nextAlarm.date, nextAlarm.sound, nextAlarm.id)
        }
    // } else {
    //     // Stop alarm if needed
    //     if (alarm && alarm.id) {
    //         AlarmManagerIos.cancelAlarm(alarm.id)
    //     }
    }
}

function scheduleAlarmAndroid(alarm) {
    if (alarm.isEnable) {
        const alarmDateList = ReminderHelper.getAlarmDateList(alarm)
        for (let fireDate of alarmDateList) {
            startScheduleAlarm(fireDate, alarm.sound, alarm.id);
        }
    } else {
        AlarmManagerAndroid.cancelAlarm(alarm.id)
        AlarmManager.stopAlarmSound(alarm)
    }
}

export default AlarmManager;