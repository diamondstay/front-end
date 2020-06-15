import { API } from '@network'
import { ReminderType } from '@constant'
import DatabaseManager from './DatabaseManager'
import NotificationManager from './NotificationManager'
import AlarmManager from './AlarmManager'
import ReminderTemplate from './ReminderTemplate'
import AccessTokenManager from './AccessTokenManager'
import moment from 'moment'
import _ from 'lodash'
import { ReminderHelper } from '@helper'
import { UUID } from '@util'


const SNOOZE_TIME = 540000; // 9 minutes in milliseconds

const ReminderDataManager = {
    reminders: null,
    initialized: false,
    initializeCall: null,
    synchronizing: false,
};

const TemplateSource = {
    LOCAL: 'local',
    SERVER: 'server'
}

function getReminderTemplate() {
    return new Promise((resolve, reject) => {
        API.getReminderTemplate()
            .then(response => {
                resolve({
                    data: response.data.responseData,
                    source: TemplateSource.SERVER
                })
            }).catch(error => {
                console.log("Fetch reminder template from server got error", error)
                resolve({
                    data: ReminderTemplate,
                    source: TemplateSource.LOCAL
                })
            })
    });
}

function getAffirmation() {
    return new Promise((resolve, reject) => {
        API.getAffirmation()
            .then(response => {
                resolve(response.data.responseData)
            }).catch(error => {
                console.log("Fetch reminder affirmation from server got error", error)
                resolve([])
            })
    });
}

function initialize() {
    return Promise.all([getReminderTemplate(), DatabaseManager.open(), getAffirmation()])
        .then(values => {
            const template = values[0];
            const isFirstRunning = values[1];
            const affirmations = values[2]

            if (affirmations && affirmations.length) {
                for (let affirmation of affirmations) {
                    const backgroundList = _.map(affirmation.backgrounds, background => {
                        return {
                            id: background.id,
                            url: background.url
                        }
                    })
                    affirmation.backgrounds = backgroundList;

                    const audioList = _.map(affirmation.audios, audio => {
                        return {
                            id: audio.id,
                            url: audio.url
                        }
                    })
                    affirmation.audios = audioList;
                }
                DatabaseManager.saveAffirmations(affirmations)
            }

            if (isFirstRunning) {
                return DatabaseManager.initialize(template.data)
            } else {
                // App already initialized. 
                if (template.source == TemplateSource.LOCAL) {
                    // For some reason that we can not fetch template from server, we will use the defaut template from local. 
                    // But if App already initialized, we will not merge data
                    return DatabaseManager.getAllReminders()
                } else {
                    // Merge reminder: from 2 sources: Local database and the the temlate.
                    return DatabaseManager.merge(template.data)
                }
            }

        }).then(reminders => {
            ReminderDataManager.reminders = reminders;
            ReminderDataManager.initializeCall = null

            console.log("ReminderDataManager init success with reminders", reminders)
            return Promise.resolve()
        }).catch(error => {
            console.log("ReminderDataManager init error", error)
            return Promise.reject(error)
        })
}

ReminderDataManager.initialize = () => {
    if (ReminderDataManager.initialized) {
        if (ReminderDataManager.initializeCall) {
            return ReminderDataManager.initializeCall
        }

        return Promise.resolve()
    }

    AlarmManager.configure();

    ReminderDataManager.initialized = true
    ReminderDataManager.initializeCall = initialize()

    return ReminderDataManager.initializeCall;
}

ReminderDataManager.cleanup = () => {
    DatabaseManager.cleanup()
    ReminderDataManager.reminders = null;
    AlarmManager.cleanup();
}

ReminderDataManager.getAllReminders = () => {
    const allReminders = ReminderDataManager.reminders.filtered('id != null SORT(position ASC)');
    return allReminders
}

ReminderDataManager.getActiveReminders = () => {
    return ReminderDataManager.reminders.filtered('isEnable = $0 SORT(position ASC)', true)
}

ReminderDataManager.deleteReminder = (reminder) => {
    return DatabaseManager.deleteReminder(reminder);
}

// @params reminderStatusRequest: [{id, isEnable}]
// 
ReminderDataManager.updateReminderStatus = (reminderStatusRequest) => {
    return new Promise((resolve, reject) => {
        for (let reminder of reminderStatusRequest) {
            ReminderDataManager.updateReminder(reminder, false)
        }

        return resolve()
    })
}

ReminderDataManager.updateReminder = (reminder, forceUpdate = true) => {
    const reminderToCancel = DatabaseManager.findReminderById(reminder.id);
    if (!forceUpdate) {
        const initialReminder = ReminderHelper.getInitialReminder(reminderToCancel);
        if (_.isEqual(reminder, initialReminder)) {
            // Does not change anything. Skip update
            return Promise.resolve()
        }
    }

    return cancelReminder(reminderToCancel, reminder, forceUpdate)
        .then(() => NotificationManager.scheduleReminderNotification(reminder))
        .then(localNotificationIds => {
            // Save to database
            const newReminder = Object.assign(reminder)
            newReminder.localNotificationIds = _.map(localNotificationIds, id => parseInt(id))
            if (!newReminder.id) {
                // new custom reminder
                newReminder.id = UUID.generateUUID()
            }
            return DatabaseManager.updateReminder(newReminder);
        }).then(() => {
            if (reminder.type == ReminderType.ALARM) {
                return AlarmManager.onAlarmChanged(reminder)
            }

            return Promise.resolve()
        })
}

ReminderDataManager.getReminderDataByNotificationId = (notifiationId) => {
    return new Promise((resolve, reject) => {
        const reminder = DatabaseManager.getReminderByNotificationId(notifiationId)

        let reminderAffirmation = null;
        if (reminder != null) {
            reminderAffirmation = DatabaseManager.getAffirmationByCategoryId(reminder.templateId)
        }

        let affirmation = null;
        let background = null;
        let audio = { id: 0, url: "https://www.bensound.com/bensound-music/bensound-summer.mp3" }
        if (reminderAffirmation != null) {
            if (reminderAffirmation.affirmations && reminderAffirmation.affirmations.length) {
                const affirmationIndex = Math.floor(Math.random() * reminderAffirmation.affirmations.length);
                affirmation = reminderAffirmation.affirmations[affirmationIndex]
            }

            if (reminderAffirmation.backgrounds && reminderAffirmation.backgrounds.length) {
                const backgroundIndex = Math.floor(Math.random() * reminderAffirmation.backgrounds.length);
                background = reminderAffirmation.backgrounds[backgroundIndex]
            }

            if (reminderAffirmation.audios && reminderAffirmation.audios.length) {
                const audioIndex = Math.floor(Math.random() * reminderAffirmation.audios.length);
                audio = reminderAffirmation.audios[audioIndex]
            }
        }

        const data = {
            reminder,
            affirmation,
            background,
            audio
        }

        resolve(data)
    })
}

ReminderDataManager.snoozeAlarm = (alarm) => {
    return new Promise((resolve, reject) => {
        const snoozeInMillis = new Date().getTime() + SNOOZE_TIME;
        const snoozeDate = moment(snoozeInMillis).toDate();

        AlarmManager.snoozeAlarm(alarm, snoozeDate);
        const notificationId = NotificationManager.snoozeAlarm(alarm, snoozeDate)

        DatabaseManager.updateReminderNotifiation(alarm, parseInt(notificationId));

        resolve()
    })
}

// Using this function when the user logout
// This function will: 
// 1. Cancel all local notifications
// 2. Cancel all alarms 
// 3. Remove all old reminder
// 4. Init default reminders
ReminderDataManager.resetData = () => {
    return new Promise((resolve, reject) => {
        NotificationManager.cancelAllLocalNotifications();

        const reminderIds = []
        const allReminders = ReminderDataManager.getAllReminders();
        for (let reminder of allReminders) {
            reminderIds.push(reminder.id)
        }
        AlarmManager.cancelAlarms(reminderIds)

        DatabaseManager.resetData();

        initialize().then(() => { return resolve() })
    });
}

function cancelReminder(reminderToCancel, reminderRequest, forceCancel) {
    return new Promise((resolve) => {
        if (!reminderToCancel) {
            return resolve();
        }

        // Cancelling local notification & cancelling alarm sound
        if (reminderRequest.isEnable != reminderToCancel.isEnable || forceCancel) {
            const localNotificationIds = [];
            for (let id of reminderToCancel.localNotificationIds) {
                localNotificationIds.push(id)
            }

            if (reminderToCancel.type == ReminderType.ALARM) {
                // Cancel alarm sound
                AlarmManager.cancelAlarms([reminderToCancel.id])
            }

            if (localNotificationIds && localNotificationIds.length) {
                NotificationManager.cancelLocalNotifications(localNotificationIds)
            }
        }

        return resolve()
    }).catch(error => {
        console.log("Cancel Reminders Error", error)
        return resolve()
    })
}

ReminderDataManager.prepareAfterLogin = () => {
    return new Promise((resolve, reject) => {
        // Get reminder already being synced.
        ReminderDataManager.synchronizing = true;
        const request = { configs: [] };
        return API.synchronize(request)
            .then(response => {
                const syncedReminders = response.data.responseData;
                if (!syncedReminders || !syncedReminders.length) {
                    return resolve();
                }

                const remindersToSync = ReminderDataManager.reminders;
                if (!remindersToSync || !remindersToSync.length) {
                    return resolve();
                }

                const oldRemindersMap = _.keyBy(remindersToSync, reminder => reminder.templateId);
                const newRemindersMap = _.keyBy(syncedReminders, reminder => reminder.category.id);

                const cateIds = Object.keys(newRemindersMap)
                for (let cateId of cateIds) {
                    if (oldRemindersMap[cateId]) {
                        // replace old id by new id from synced reminder.
                        const request = ReminderHelper.getInitialReminder(oldRemindersMap[cateId]);
                        DatabaseManager.deleteReminder(request);

                        request.id = newRemindersMap[cateId].uuid;
                        DatabaseManager.updateReminder(request, true);
                    }
                }
                return resolve();
            }).then(() => {
                ReminderDataManager.synchronizing = false;
                return ReminderDataManager.sync(); // marked as finish sync
            }).catch(error => { 
                ReminderDataManager.synchronizing = false;
                return resolve() 
            })// marked as finish sync
    })
}

ReminderDataManager.initCustomReminder = () => {
    return DatabaseManager.initReminderWithType(ReminderType.REMINDER)
}

ReminderDataManager.sync = () => {
    if (ReminderDataManager.synchronizing) {
        return Promise.resolve();
    }

    ReminderDataManager.synchronizing = true; // marked as start sync
    if (!AccessTokenManager.isLoggedIn()) {

        ReminderDataManager.synchronizing = false; // marked as finish sync
        return Promise.resolve()
    }

    const remindersToSync = ReminderDataManager.reminders.filtered('modifiedDate != null SORT(position ASC)');
    const configs = _.map(remindersToSync, reminder => {
        return {
            uuid: reminder.id,
            repeatType: reminder.repeatType,
            sound: reminder.sound,
            enable: reminder.isEnable,
            snoozeEnable: reminder.isSnoozeEnable,
            startTime: reminder.startTime,
            endTime: reminder.endTime,
            clientModifiedDate: reminder.modifiedDate,
            period: reminder.period,
            category: {
                id: reminder.templateId,
                title: reminder.title,
                type: reminder.type,
                textBody: reminder.textBody,
                textColor: reminder.textColor,
                blockColor: reminder.blockColor,
                photoUrl: reminder.photo,
            }
        }
    })

    const reminderRequests = _.map(remindersToSync, reminder => ReminderHelper.getInitialReminder(reminder))
    const oldRemindersMap = _.keyBy(reminderRequests, reminder => reminder.id);

    return API.synchronize({ configs: configs })
        .then((response) => {
            const newReminders = response.data.responseData;
            const newRemindersMap = _.keyBy(newReminders, reminder => reminder.uuid);

            const ids = Object.keys(newRemindersMap);
            for (let id of ids) {
                const newReminder = ReminderHelper.getInitialReminderFromNetworkResponse(newRemindersMap[id]);
                const oldReminder = oldRemindersMap[id];
                if (!oldReminder) {
                    ReminderDataManager.updateReminder(newReminder);
                    continue;
                }

                const request = { ...oldReminder, ...newReminder };
                ReminderDataManager.updateReminder(request);
            }

            ReminderDataManager.synchronizing = false;

            return Promise.resolve();
        }).catch(error => {
            console.log("Synchronize reminder data got error", error);
            ReminderDataManager.synchronizing = false;
            return Promise.reject(error);
        })
}

export default ReminderDataManager;