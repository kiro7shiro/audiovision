const recieversList = document.getElementById('recieversList')

const port = browser.runtime.connect({ name: 'actions' })
port.onMessage.addListener(function (message) {
    console.log('actoions.handleMessage', message)
    const { command } = message
    switch (command) {
        case 'recievers':
            const { recievers } = message
            for (const reciever of recievers) {
                const div = document.createElement('div')
                div.textContent = reciever
                recieversList.appendChild(div)
            }
            break
        default:
            console.log(`command: ${command} not suported.`)
            break
    }
})
port.postMessage({ name: 'browserAction', command: 'recievers' })
