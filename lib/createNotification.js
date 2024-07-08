

export const createNotification = (openSlot, numOfSlots, prefs) => {
    const { tzData } = prefs;

    console.log(prefs)
    
    let message = ""
    if (numOfSlots > 1) {
        message = `Found an open interview at ${openSlot.timestamp} (${tzData} timezone) and ${numOfSlots - 1} additional slots.`
    } else {
        message = `Found an open interview at ${openSlot.timestamp} (${tzData} timezone).`
    }

    chrome.notifications.create({
        title: "Global Entry Drops",
        message: message,
        iconUrl: "./images/icon-64.png",
        type: "basic"
    })
}

chrome.notifications.onClicked.addListener(() => {
    chrome.tabs.create({ url: "https://www.minecraft.com" })
})