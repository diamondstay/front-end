/**
 * Wrap the AsyncStorage for latter change
 */
import AsyncStorage from '@react-native-community/async-storage';

export async function get(key, callback) {
    const result = await AsyncStorage.getItem(key, callback);
    return result;
}

export async function multiSet(set, callback) {
    await AsyncStorage.multiSet(set, callback);
}

export async function multiGet(set, callback) {
    await AsyncStorage.multiGet(set, callback);
}

export async function set(key, value, callback) {
    await AsyncStorage.setItem(key, value, callback);
}

export async function remove(key, callback) {
    await AsyncStorage.removeItem(key, callback);
}