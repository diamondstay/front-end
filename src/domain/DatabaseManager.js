import Realm from 'realm';
import { ReminderType } from '@constant'
import { UUID } from '@util'
import _ from 'lodash'


const SCHEMA_VERSION = 20200401;
const MEDIA_TABLE = 'Media';
const REMINDER_CONFIG_TABLE = 'ReminderConfig';
const REMINDER_AFFIRMATION_TABLE = 'ReminderAffirmation'
// Define your models and their properties
const MediaSchema = {
    name: MEDIA_TABLE,
    properties: {
        id: 'int',
        url: 'string'
    }
}

const ReminderConfigSchema = {
    name: REMINDER_CONFIG_TABLE,
    primaryKey: 'id',
    properties: {
        id: 'string',
        title: 'string',
        type: 'string',
        repeatType: 'int',
        sound: 'string?',
        thumbnail: 'Media?',
        isEnable: 'bool',
        isSnoozeEnable: 'bool?',
        startTime: 'string?',
        endTime: 'string?',
        period: 'int?',
        media: 'Media?',
        templateId: 'int?', // the id of reminder template on the server. Using for synchronization.
        serverId: 'int?', // the id of this reminder on the server. Using for synchronization.
        localNotificationIds: 'int[]', // the ids of schedule local notification
        createdDate: 'date?',
        modifiedDate: 'date?',
        position: 'int?',
        codeTextColor: 'string?',
        codeBlockColor: 'string?',
        textBody: 'string?',
        textColor: 'string?',
        blockTextColor: 'string?'
    }
};

const ReminderAffirmation = {
    name: REMINDER_AFFIRMATION_TABLE,
    primaryKey: 'reminderCategoryId',
    properties: {
        reminderCategoryId: 'int',
        affirmations: 'string[]',
        backgrounds: 'Media[]',
        audios: 'Media[]'
    },
}

const DatabaseManager = {
    realm: null,
};

DatabaseManager.open = () => {
    if (!isConnectionClosed(DatabaseManager.realm)) {
        return Promise.resolve(true);
    }

    const configuration = {
        schema: [MediaSchema, ReminderConfigSchema, ReminderAffirmation],
        schemaVersion: SCHEMA_VERSION,
    }

    const currentVersion = Realm.schemaVersion(Realm.defaultPath);
    const isFirstRunning = currentVersion == -1; // If Realm.schemaVersion() returned -1, it means this is a new Realm file.

    return Realm.open(configuration)
        .then(realm => {
            DatabaseManager.realm = realm;

            return Promise.resolve(isFirstRunning);
        }).catch(error => {
            console.log('Initial DB error', error)
            return Promise.reject(error);
        })
}

function initReminderWithTemplate(template) {
    let thumbnail = null;
    if (template.thumbnail) {
        thumbnail = {
            id: template.thumbnail.id,
            url: template.thumbnail.url
        }
    }

    return {
        id: UUID.generateUUID(),
        templateId: template.id,
        title: template.title,
        type: template.type,
        repeatType: 127, // Every day
        sound: 'default',
        thumbnail: thumbnail,
        isEnable: false,
        isSnoozeEnable: true,
        startTime: null,
        endTime: null,
        period: 0,
        media: null,
        createdDate: new Date(),
        modifiedDate: null,
        localNotificationIds: [],
        serverId: null,
        position: template.position
    }
}

function updateReminderWithTemplate(reminder, template) {
    let thumbnail = null;
    if (template.thumbnail) {
        thumbnail = { id: template.thumbnail.id, url: template.thumbnail.url }
    } else {
        thumbnail = reminder.thumbnail
    }
    return {
        id: reminder.id,
        templateId: template.id,
        title: template.title,
        type: template.type,
        thumbnail: thumbnail,
        position: template.position
    }
}

DatabaseManager.initReminderWithType = (type) => {
    return {
        id: UUID.generateUUID(),
        templateId: null,
        title: "",
        type: type,
        repeatType: 127, // Every day
        sound: 'default',
        thumbnail: null,
        isEnable: false,
        isSnoozeEnable: true,
        startTime: null,
        endTime: null,
        period: 0,
        media: null,
        createdDate: new Date(),
        modifiedDate: null,
        localNotificationIds: [],
        serverId: null,
        position: null,
        textBody : ""
        
    }
}

DatabaseManager.initialize = (reminderTemplateList) => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }
    const realm = DatabaseManager.realm;

    try {
        realm.beginTransaction();

        for (i = 0; i < reminderTemplateList.length; i++) {
            const reminder = initReminderWithTemplate(reminderTemplateList[i]);
            realm.create(REMINDER_CONFIG_TABLE, reminder);
        }

        realm.commitTransaction();

        let remindersResults = realm.objects(REMINDER_CONFIG_TABLE);
        console.log("Init reminders: ", remindersResults)
        return Promise.resolve(remindersResults);
    } catch (error) {
        console.log('Initial reminder from template error', error)
        realm.cancelTransaction();
        return Promise.reject(error);
    }
}

DatabaseManager.merge = (templateList) => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }
    const realm = DatabaseManager.realm;

    const templateById = _.keyBy(templateList, template => template.id)

    const allReminders = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE);
    const configByTemplateId = _.keyBy(allReminders, reminder => reminder.templateId)

    try {
        realm.beginTransaction();

        const keys = Object.keys(templateById);
        for (let i = 0; i < keys.length; i++) {
            const templateId = keys[i];
            const template = templateById[templateId];
            const reminder = configByTemplateId[templateId];

            let reminderData = null;
            if (reminder) {
                // Update reminder following the new template
                reminderData = updateReminderWithTemplate(reminder, template)
            } else {
                // Create new reminder from this template
                reminderData = initReminderWithTemplate(template);
            }
            realm.create(REMINDER_CONFIG_TABLE, reminderData, 'modified');
        }
        realm.commitTransaction();

        let remindersResults = realm.objects(REMINDER_CONFIG_TABLE);
        console.log("Merged reminders: ", remindersResults)
        return Promise.resolve(remindersResults);
    } catch (error) {
        console.log('Merge reminder from template error', error)
        realm.cancelTransaction();
        return Promise.reject(error);
    }
}

DatabaseManager.resetData = () => {
    DatabaseManager.realm.write(() => {
        let allConfigs = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE);
        DatabaseManager.realm.delete(allConfigs);
    });
}

DatabaseManager.getAllReminders = () => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }

    return DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE)
}

DatabaseManager.getAllActiveAlarms = () => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }

    const allActiveAlarms = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE).filtered('isEnable = $0 AND type = $1 AND startTime != null', true, ReminderType.ALARM)
    return allActiveAlarms;
}

DatabaseManager.updateReminder = (reminder, silentUpdate = false) => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }

    return new Promise((resolve, reject) => {
        try {
            if (!silentUpdate) {
                reminder.modifiedDate = new Date()
            }

            DatabaseManager.realm.write(() => {
                DatabaseManager.realm.create(REMINDER_CONFIG_TABLE, reminder, 'modified');
            });

            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

DatabaseManager.deleteReminder = (reminder) => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }

    return new Promise((resolve, reject) => {
        try {
            DatabaseManager.realm.write(() => {

                let reminderToDelete = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE).filtered('id = $0', reminder.id);
                if (reminderToDelete == null) {
                    return Promise.reject('Reminder not found')
                }

                DatabaseManager.realm.delete(reminderToDelete);
                resolve()
            });
        } catch (error) {
            reject(error)
        }
    })
}

DatabaseManager.cleanup = () => {
    if (!isConnectionClosed(DatabaseManager.realm)) {
        DatabaseManager.realm.close();
        DatabaseManager.realm = null;
    }
}

function isConnectionClosed(realm) {
    return realm == null || realm.isClosed
}

DatabaseManager.saveAffirmations = (listAffirmations) => {
    if (isConnectionClosed(DatabaseManager.realm)) {
        return Promise.reject('DB connection was closed')
    }
    return new Promise((resolve, reject) => {
        DatabaseManager.realm.beginTransaction();
        try {
            for (let affirmation of listAffirmations) {
                DatabaseManager.realm.create(
                    REMINDER_AFFIRMATION_TABLE,
                    {
                        reminderCategoryId: affirmation.reminderCategoryId,
                        affirmations: affirmation.affirmations,
                        backgrounds: affirmation.backgrounds,
                        audios: affirmation.audios,
                    }, 'modified');
            }
            DatabaseManager.realm.commitTransaction();

            resolve()
        } catch (error) {
            DatabaseManager.realm.cancelTransaction();
            reject(error)
        }
    })
}

DatabaseManager.getReminderByNotificationId = (notificationId) => {
    let filteredReminders = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE);
    if (filteredReminders && filteredReminders.length) {
        for (let reminder of filteredReminders) {
            if (reminder.localNotificationIds && reminder.localNotificationIds.length) {
                for (let id of reminder.localNotificationIds) {
                    if (id == notificationId) {
                        return reminder;
                    }
                }
            }
        }
    }

    return null;
}

DatabaseManager.getAffirmationByCategoryId = (categoryId) => {
    let filteredAffirmation = DatabaseManager.realm.objects(REMINDER_AFFIRMATION_TABLE).filtered('reminderCategoryId = $0', categoryId);
    if (filteredAffirmation && filteredAffirmation.length) {
        return filteredAffirmation[0];
    }
    return null;
}

DatabaseManager.updateReminderNotifiation = (reminder, notificationId) => {
    let filteredReminders = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE).filtered('id = $0', reminder.id)
    if (filteredReminders && filteredReminders.length) {
        const reminderObject = filteredReminders[0];

        const localNotificationIds = [];
        for (let id of reminderObject.localNotificationIds) {
            localNotificationIds.push(id)
        }
        localNotificationIds.push(notificationId);

        DatabaseManager.realm.write(() => {
            DatabaseManager.realm.create(REMINDER_CONFIG_TABLE, {
                id: reminder.id,
                localNotificationIds: localNotificationIds,
            }, 'modified');
        });
    }
}

DatabaseManager.findReminderById = (id) => {
    const reminders = DatabaseManager.realm.objects(REMINDER_CONFIG_TABLE).filtered('id = $0', id);
    if (reminders && reminders.length) {
        return reminders[0];
    }

    return null;
}

export default DatabaseManager;