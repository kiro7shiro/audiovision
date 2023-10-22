class Visualizer {
    static Waveform = class {
        constructor(analyser, lineColor, lineWidth) {
            this.analyser = analyser
            this.buffer = new Uint8Array(analyser.frequencyBinCount)
            this.lineColor = lineColor
            this.lineWidth = lineWidth
        }
        get controls() {
            const form = document.createElement('form')
            form.classList.add('w3-container')
            const lineColorInput = document.createElement('input')
            const lineColorLabel = document.createElement('label')
            const lineWidthInput = document.createElement('input')
            const lineWidthLabel = document.createElement('label')
            lineColorInput.type = 'color'
            lineColorInput.value = this.lineColor.hex
            lineColorInput.classList.add('w3-button')
            lineColorLabel.innerText = 'lineColor'
            lineWidthInput.value = this.lineWidth
            lineWidthInput.classList.add('w3-input')
            lineWidthLabel.innerText = 'lineWidth'
            const self = this
            lineColorInput.addEventListener('input', function (event) {
                self.lineColor.hex = event.target.value
            })
            lineWidthInput.addEventListener('change', function (event) {
                self.lineWidth = event.target.value
            })
            form.appendChild(lineColorLabel)
            form.appendChild(lineColorInput)
            form.appendChild(document.createElement('br'))
            form.appendChild(lineWidthLabel)
            form.appendChild(lineWidthInput)
            return {
                form
            }
        }
        connect(sound) {
            let { analyser } = this
            if (!analyser) {
                analyser = sound.createAnalyser()
                this.buffer = new Uint8Array(analyser.frequencyBinCount)
                this.analyser = analyser
            }
            sound.source.connect(analyser)
        }
        disconnect() {
            if (this.analyser) this.analyser.disconnect()
        }
        draw(screen, { timestamp = null } = {}) {
            const { analyser, buffer } = this
            const { context } = screen
            context.lineWidth = this.lineWidth
            context.strokeStyle = this.lineColor.rgb
            context.beginPath()
            let x = 0
            const slice = screen.width / buffer.length
            analyser.getByteTimeDomainData(buffer)
            for (let i = 0; i < buffer.length; i++) {
                const v = buffer[i] / 128
                const y = v * (screen.height / 2)
                if (i === 0) {
                    context.moveTo(x, y)
                } else {
                    context.lineTo(x, y)
                }
                x += slice
            }
            context.lineTo(screen.width, (buffer[buffer.length - 1] / 128) * (screen.height / 2))
            context.stroke()
        }
    }

    static Bars = class extends Visualizer.Waveform {
        constructor(analyser, { sampleRate = 44100 } = {}) {
            super(analyser)
            this.sampleRate = sampleRate
            this.barColors = [new Color(0, 0, 255), new Color(0, 255, 0), new Color(255, 0, 0)]
        }
        get controls() {
            return {}
        }
        draw(screen, { timestamp = null } = {}) {
            const { analyser, buffer, sampleRate } = this
            const { context } = screen

            function freqToX(freq) {
                const mLog10 = Math.log(10)
                const minF = Math.log(20) / mLog10
                const maxF = Math.log(sampleRate) / mLog10
                const range = maxF - minF
                return (Math.log(freq) / mLog10 - minF) / range
            }

            analyser.getByteFrequencyData(buffer)
            const colorStop = parseInt(buffer.length / this.barColors.length)
            let barWidth = 0
            let x = 0
            let lastOffset = 0
            let colorCnt = 0
            for (let i = 0; i < buffer.length; i++) {
                const barHeight = parseInt((buffer[i] * screen.height) / 255)
                const freq = Math.round(((i + 1) * sampleRate) / buffer.length)
                const offset = parseInt(freqToX(freq) * screen.width)
                barWidth = offset - lastOffset
                lastOffset = offset
                const color = this.barColors[colorCnt]
                if (i % colorStop === 0 && i > 0) colorCnt++
                context.fillStyle = color.rgb
                context.fillRect(x, screen.height - barHeight, barWidth, barHeight)
                x += barWidth
                if (colorCnt >= this.barColors.length) colorCnt = 0
            }
        }
    }

    static Port = class {
        constructor(port, analyser) {
            this.port = port
            this.analyser = analyser
            this.buffer = new Uint8Array(analyser.frequencyBinCount)
        }
        connect(sound) {
            let { analyser } = this
            sound.source.connect(analyser)
        }
        disconnect() {
            if (this.analyser) this.analyser.disconnect()
        }
        draw() {
            const { name, port, analyser, buffer } = this
            analyser.getByteTimeDomainData(buffer)
            port.postMessage({ name: this.port.name, command: 'data', payload: buffer })
        }
    }

    constructor(width, height, top, left, { fps = 60, background = null } = {}) {
        this.elements = []
        // screen
        this.delta = 1000 / fps
        this.fps = 0
        this.handle = null
        this.lastDraw = 0
        this.screen = new Screen(width, height, '0px', '0px')
        this.timer = new Timer()
        this.background = background ? background : new Color(255, 255, 255)
        // create ui elements
        this.container = document.createElement('div')
        const { container, screen } = this
        // container
        container.style.top = top
        container.style.left = left
        container.style.width = `${width}px`
        container.style.height = `${height}px`
        container.isDragging = false
        container.offsetX = 0
        container.offsetY = 0
        container.classList.add('visualizer')
        // append screen
        container.appendChild(screen.canvas)
        // append container
        document.body.appendChild(container)
        // container dragging
        function handleMouseDown(event) {
            container.isDragging = true
            // Calculate the offset between mouse position and div position
            container.offsetX = event.clientX - parseInt(container.style.left)
            container.offsetY = event.clientY - parseInt(container.style.top)
            container.addEventListener('mousemove', handleMouseMove)
            container.addEventListener('mouseup', handleMouseUp)
        }
        function handleMouseMove(event) {
            if (container.isDragging) {
                // Calculate new div position based on mouse position and offset
                const newX = event.clientX - container.offsetX
                const newY = event.clientY - container.offsetY
                // Update container position
                container.style.left = newX + 'px'
                container.style.top = newY + 'px'
            }
        }
        function handleMouseUp() {
            container.isDragging = false
            container.removeEventListener('mousemove', handleMouseMove)
            container.removeEventListener('mouseup', handleMouseUp)
        }
        container.addEventListener('mousedown', handleMouseDown)
    }
    add(element) {
        this.elements.push(element)
    }
    connect(sound) {
        const { elements } = this
        for (const element of elements) {
            element.connect(sound)
        }
    }
    disconnect() {
        const { elements } = this
        for (const element of elements) {
            element.disconnect()
        }
    }
    draw(timestamp) {
        const { elements, screen, timer } = this
        //if (timer.tick(timestamp)) this.fps = timer.rate
        // check if we have time left in the current frame
        let delta = timestamp - this.lastDraw
        //if (delta <= this.delta) {
            screen.clear()
            screen.drawBackground(this.background.rgb)
            let index = 0
            elements[index].draw(screen)
            /* while (delta > 0 && index < elements.length) {
                const start = performance.now()
                elements[index].draw(screen)
                index++
                delta -= performance.now() - start
            } */
        //}
        this.lastDraw = timestamp
        this.handle = requestAnimationFrame(this.draw.bind(this))
    }
    start() {
        if (!this.handle) this.handle = requestAnimationFrame(this.draw.bind(this))
    }
    stop() {
        if (this.handle) {
            cancelAnimationFrame(this.handle)
            this.handle = null
        }
    }
}
