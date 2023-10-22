class WaveformControls {
    constructor(container) {
        this.container = container
        this.controls = {
            fftSize: document.createElement('input'),
            color: null,
            background: null,
            size: null,
            pos: null
        }
        const { fftSize } = this.controls
        fftSize.classList.add('w3-input')
        container.appendChild(fftSize)
    }
}