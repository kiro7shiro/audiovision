class Sound {
    constructor() {
        this.connected = false
        this.context = null
        this.source = null
    }
    createAnalyser({ fftSize = 256, smoothingTimeConstant = 0.5 } = {}) {
        if (!this.context) this.context = new AudioContext()
        const analyser = this.context.createAnalyser()
        analyser.fftSize = fftSize
        analyser.smoothingTimeConstant = smoothingTimeConstant
        return analyser
    }
    connect(video) {
        if (!this.context) this.context = new AudioContext()
        const { context } = this
        video.stream = video.element.mozCaptureStream()
        this.source = context.createMediaStreamSource(video.stream)
        this.source.connect(context.destination)
        this.connected = true
    }
    disconnect() {
        if (this.source) this.source.disconnect()
        this.source = null
        this.connected = false
    }
}
