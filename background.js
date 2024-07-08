import { fetchLocations } from "./api/fetchLocations.js"
import { fetchOpenSlots } from "./api/fetchOpenSlots.js"
import { createNotification } from "./lib/createNotification.js";

let cachedPrefs = {};
let firstApptTimestamp = null;


chrome.runtime.onInstalled.addListener(details => {
    fetchLocations()
})

chrome.runtime.onMessage.addListener(data => {

    const { event, prefs } = data

    switch (event) {
        case 'onStop':
            handleOnStop(prefs);
            break;
        case 'onStart':
            handleOnStart(prefs);
            break;
        default:
            break;
    }
})

const handleOnStart = (prefs) => {
    cachedPrefs = prefs
    chrome.storage.local.set(prefs)
    setRunningStatus(true);
    createAlarm();
}

const handleOnStop = () => {
    setRunningStatus(false);
    stopAlarm();
    cachedPrefs = {};
    firstApptTimestamp = null;
}

const setRunningStatus = (isRunning) => {
    chrome.storage.local.set({ isRunning })
}

const ALARM_JOB_NAME = "DROP_ALARM"
const createAlarm = () => {
    chrome.alarms.get(ALARM_JOB_NAME, existingAlarm => {
        if (!existingAlarm) {
            openSlotsJob(); 
            chrome.alarms.create(ALARM_JOB_NAME, {periodInMinutes: 1.0});
        }
    })
}

const stopAlarm = () => {
    chrome.alarms.clearAll();
}

chrome.alarms.onAlarm.addListener(() => {
    openSlotsJob(); 
})

const openSlotsJob = () => {
    fetchOpenSlots(cachedPrefs)
        .then(data => handleOpenSlots(data)) 
}

const handleOpenSlots = (openSlots) => {
    if (openSlots && openSlots.length && openSlots[0].timestamp != firstApptTimestamp) {
        firstApptTimestamp = openSlots[0].timestamp;
        createNotification(openSlots[0], openSlots.length, cachedPrefs)
    }
}