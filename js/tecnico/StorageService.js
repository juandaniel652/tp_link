export default class StorageService {
    static get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
    }

    static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    }
}
