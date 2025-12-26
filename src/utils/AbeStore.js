// AbeStore.js - LocalStorage Logic for ABE Events
const STORAGE_KEY = 'abe_events_data';

export const saveToAbeStore = (data) => {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serializedData);
    } catch (error) {
        console.error("Error saving to AbeStore:", error);
    }
};

export const loadFromAbeStore = () => {
    try {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        if (serializedData === null) return null;
        return JSON.parse(serializedData);
    } catch (error) {
        console.error("Error loading from AbeStore:", error);
        return null;
    }
};

export const clearAbeStore = () => {
    localStorage.removeItem(STORAGE_KEY);
};
