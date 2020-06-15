import moment from 'moment';
import Constant from '@constant'

const dateTimeFormat = (datetimeFormat, timeInMillis) => {
    if (timeInMillis) {
        return moment(timeInMillis).format(datetimeFormat)
    }
    return ''
}

const audioTimeFormat = (timeInMillis) => {
    if (timeInMillis == 0 || timeInMillis == -1) {
        return '0:00'
    }
    const data = dateTimeFormat('mm:ss', timeInMillis)
    return data
}

const defaultFormat = (timeInMillis) => {
    const data = dateTimeFormat(Constant.DATE_DEFAULT_FORMAT, timeInMillis)
    return data
}

const defaultTimeFormat = (timeInMillis) => {
    const data = dateTimeFormat(Constant.TIME_DEFAULT_FORMAT, timeInMillis)
    return data
}

const startOfDay = (timeInMillis) => {
    const date = new Date(timeInMillis);
    // date.setUTCHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date;
}

const endOfDay = (timeInMillis) => {
    const date = new Date(timeInMillis);
    // date.setUTCHours(23, 59, 59, 999);
    date.setHours(23, 59, 59, 999);

    return date;
}

export default {
    audioTimeFormat,
    dateTimeFormat,
    defaultFormat,
    defaultTimeFormat,
    startOfDay,
    endOfDay,
};