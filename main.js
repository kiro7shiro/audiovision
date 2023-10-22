class Application {
    constructor() {
        const self = this
        self.sound = new Sound()
        self.video = new Video('video')
        self.visualizers = []
        // init
        self.connected = false
        const { video, sound } = self
        // catch video events
        video.element.addEventListener('playing', function () {
            if (!self.connected) self.connect()
            if (!video.check) video.check = video.element.src
            if (video.check !== video.element.src) {
                self.disconnect()
                console.log('src changed')
            }
            if (!sound.connected || !sound.source) self.connect()
            console.log('playing')
        })
        video.element.addEventListener('pause', function () {
            self.disconnect()
            console.log('pause')
        })
        video.element.addEventListener('ended', function () {
            self.disconnect()
            console.log('ended')
        })
    }
    connect() {
        const { sound, video, visualizers } = this
        if (!sound.connected || !sound.source) sound.connect(video)
        for (const visualizer of visualizers) {
            visualizer.connect(sound)
            visualizer.start()
        }
        this.connected = true
    }
    disconnect() {
        const { sound, visualizers } = this
        for (const visualizer of visualizers) {
            visualizer.disconnect()
            visualizer.stop()
        }
        sound.disconnect()
        this.connected = false
    }
}

// connect port to background script
const port = browser.runtime.connect({ name: 'main' })
port.onMessage.addListener(function (message) {
    const { command } = message
    switch (command) {
        case 'recievers':
            const { recievers } = message
            console.log(recievers)
            break

        default:
            console.log(`command: ${command} not suported.`)
            break
    }
})
port.postMessage({ name: 'main', command: 'recievers' })

// setup
const app = new Application()
const analyser1 = app.sound.createAnalyser({ fftSize: 256 })
const waveform1 = new Visualizer.Waveform(analyser1, new Color(0, 0, 0), 2)
const bars1 = new Visualizer.Bars(analyser1, { sampleRate: app.sound.context.sampleRate })
//const visualizerPort1 = new Visualizer.Port(port, analyser1)
const visualizer1 = new Visualizer(512, 256, '25px', '25px')

visualizer1.add(bars1)
visualizer1.add(waveform1)
//visualizer1.add(visualizerPort1)
app.visualizers.push(visualizer1)
