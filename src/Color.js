class Color {
    static numberToHex(number) {
        const hex = number.toString(16)
        return hex.length === 1 ? `0${hex}` : hex
    }
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null
    }
    static rgbToHex(r, g, b) {
        return `#${Color.numberToHex(r)}${Color.numberToHex(g)}${Color.numberToHex(b)}`
    }
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }
    get hex() {
        return Color.rgbToHex(this.r, this.g, this.b)
    }
    set hex(value) {
        const color = Color.hexToRgb(value)
        this.r = color.r
        this.g = color.g
        this.b = color.b
    }
    get rgb() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }
    set rgb(value) {
        const result = /^rgb?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/igm.exec(value)
        if (result) {
            this.r = parseInt(result[1], 10)
            this.g = parseInt(result[2], 10)
            this.b = parseInt(result[3], 10)
        }
    }
}
