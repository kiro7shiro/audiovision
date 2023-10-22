/* browser.runtime.onStartup.addListener(function (event) {
    console.log(event)
})

browser.runtime.onMessage.addListener(function (event) {
    console.log(event)
})

let csPort = null
browser.runtime.onConnect.addListener(function (port) {
    if (!csPort) {
        csPort = port
        csPort.onMessage.addListener(function (event) {
            console.log(event)
        })
        csPort.postMessage({ test: 'tester-bs' })
        console.log(csPort)
    }
}) */
