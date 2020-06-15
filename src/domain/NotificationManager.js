import { ReminderHelper } from '@helper';
import _ from 'lodash';
import { Platform } from 'react-native';
import { ReminderRepeatType, ReminderType } from '@constant'
import DeviceInfo from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import moment from 'moment'

function onReiceivedNotification(notification, onNotification) {
    console.log("onReiceivedNotification")
    onNotification && onNotification(notification)
    notification.finish(PushNotificationIOS.FetchResult.NoData);
}

async function configure(onRegister, onNotification, onError) {
    const isEmulator = await DeviceInfo.isEmulator()
    if (isEmulator && Platform.OS === 'ios') {
        onRegister({ simulator: true, token: _.uniqueId('endota_') });
        return;
    }

    PushNotification.configure({
        onRegister: info => onRegister && onRegister(info),
        onError: err => onError && onError(err),
        onNotification: notification => onReiceivedNotification(notification, onNotification),

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
            alert: true,
            badge: true,
            sound: true
        },

        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,

        /**
          * (optional) default: true
          * - Specified if permissions (ios) and token (android and ios) will requested or not,
          * - if not, you must call PushNotificationsHandler.requestPermissions() later
          */
        requestPermissions: true,
    });
}

function unregister() {
    PushNotification.unregister();
}

function requestPermissions() {
    PushNotification.requestPermissions();
}

function resetBadgeNumber() {
    PushNotification.setApplicationIconBadgeNumber(0);
}

function checkPermissions(callback) {
    PushNotification.checkPermissions(callback)
}

function cancelAllLocalNotifications() {
    PushNotification.cancelAllLocalNotifications()
}

function cancelLocalNotifications(notificationIds) {
    for (let id of notificationIds) {
        PushNotification.cancelLocalNotifications({ id: id.toString() })
    }
    return Promise.resolve()
}

function localNotificationSchedule(fireDate, message, repeatType) {
    const id = generateNotificationID();
    const notificationId = Platform.OS == 'ios' ? id : id.toString();
    const reminderConfig = {
        id: notificationId,
        date: fireDate,
        message: message
    }

    if (repeatType && repeatType != ReminderRepeatType.NONE) {
        reminderConfig.repeatType = repeatType
    }

    const defaultConfig = {
        /* Android Only Properties */
        priority: "high", // (optional) set notification priority, default: high
        visibility: "public", // (optional) set notification visibility, default: private
        importance: "high", // (optional) set notification importance, default: high

        /* iOS only properties */
        alertAction: 'view',// (optional) default: view
        // category: null,// (optional) default: null

        /* iOS and Android properties */
        title: "", // (optional)
        playSound: true, // (optional) default: true
        soundName: 'default',
    }

    const config = {
        ...defaultConfig,
        ...reminderConfig,
        id: notificationId,
        userInfo: { id: notificationId }
    }
    if (Platform.OS == 'ios') {

    }

    console.log("localNotificationSchedule", config)

    PushNotification.localNotificationSchedule(config);

    return notificationId;
}

function generateNotificationID() {
    return _.uniqueId()
}

function scheduleReminderNotification(reminder) {
    if (!reminder.isEnable || !reminder.startTime) {
        return Promise.resolve([])
    }

    return new Promise((resolve, reject) => {
        if (Platform.OS == 'ios') {
            resolve(PushNotification.requestPermissions(['alert', 'badge', 'sound']));
        }

        resolve([]);
    }).then(permissions => {
        return new Promise((resolve, reject) => {
            const notificationIds = [];

            let fireDateList = []
            let reminderRepeatType = null;
            if (reminder.type == ReminderType.ALARM) {
                fireDateList = ReminderHelper.getAlarmDateList(reminder);
                reminderRepeatType = ReminderRepeatType.WEEK;
            } else {
                fireDateList = ReminderHelper.getReminderDateList(reminder);
                reminderRepeatType = ReminderRepeatType.DAY;
            }

            console.log("Reminder fire date:", fireDateList)
            console.log("Reminder repeat ", reminderRepeatType)
            for (let fireDate of fireDateList) {
                const id = localNotificationSchedule(fireDate, reminder.title, reminderRepeatType);
                notificationIds.push(id);
            }

            resolve(notificationIds)
        })

    }).catch(error => {
        return Promise.reject('Notifiation has been disabled');
    })
}

function snoozeAlarm(alarm, snoozeDate) {
    return localNotificationSchedule(snoozeDate, alarm.title, ReminderRepeatType.NONE)
}

export default {
    configure,
    unregister,
    requestPermissions,
    resetBadgeNumber,
    checkPermissions,
    cancelLocalNotifications,
    scheduleReminderNotification,
    snoozeAlarm,
    cancelAllLocalNotifications,
}