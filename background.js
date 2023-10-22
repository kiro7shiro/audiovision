//const socket = io('ws://localhost:3000', { query: { name: 'firefox', type: 'source' } })

const ports = {}

// handle messages
function handleMessage(message) {
    //console.log('background.handleMessage', message)
    const { name, command } = message
    switch (command) {
/*         case 'recievers':
            socket.emit('recievers', function (recievers) {
                if (ports[name] === null) throw new Error(`port ${name} not defined.`)
                ports[name].postMessage({ command, recievers })
            })
            break

        case 'data':
            socket.emit('data', { data: message.payload })
            break */

        default:
            console.log(`command: ${command} not suported.`)
            break
    }
}

// connect ports
browser.runtime.onConnect.addListener(function connected(port) {
    const { name } = port
    console.log(`port: ${name} connected.`)
    switch (true) {
        case !ports[name]:
            ports[name] = port
            break

        default:
            console.log(`TODO: background.js connect ports`)
            break
    }
    port.onMessage.addListener(handleMessage)
})
