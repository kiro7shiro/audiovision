/**
 * Count ticks of a loop.
 */
class Timer {
    /**
     * Default config
     */
    static defaults = {
        count: 0,
        diff: 0,
        fpt: 0,
        last: 0,
        rate: 0,
        ticks: 0,
        threshold: 1000,
        weights: [0.75, 0.25]
    }

    /**
     * Returns a new timer instance.
     * @param {Object} [options]
     * @param {Number} [options.count] - count of ticks since timer was started
     * @param {Number} [options.diff] - time difference between frames in milliseconds
     * @param {Number} [options.fpt] - frames per threshold
     * @param {Number} [options.last] - time of the last tick
     * @param {Number} [options.rate] - rate of ticks
     * @param {Number} [options.ticks] - tick count of current threshold frame
     * @param {Number} [options.threshold] - When to tick in milliseconds. (Default = 1000, tick every second.)
     * @param {Number[]} [options.weights] - Adjust 'ramp up' and 'ramp down' of the fpt count.
     * @returns {Timer}
     */
    constructor({ count, diff, fpt, last, rate, ticks, threshold, weights } = {}) {
        Object.assign(this, Timer.defaults, arguments[0])
    }
    /**
     * Count the ticks of a loop by repeatedly calling tick().
     * If the threshold is reached it will return true and then reset
     * until the next tick is reached and so on.
     * @param {Number} [now] Timestamp to use for the tick in milliseconds.
     *                       If you want to use a specific time e.g. requestAnimationFrame()'s timestamp.
     *                       ( default = Date.now())
     * @returns {Boolean}
     */
    tick(now = 0) {
        if (now <= 0) now = Date.now()
        if (!this.last) this.last = now
        this.diff = now - this.last
        this.ticks++
        if (this.ticks + 1 === Number.MAX_SAFE_INTEGER) this.ticks = 0
        this.rate = this.threshold / (this.threshold / this.ticks)
        if (this.last + this.threshold <= now) {
            this.fpt = this.fpt * this.weights[0] + this.rate * this.weights[1]
            this.last = now
            this.ticks = 0
            this.count++
            if (this.count + 1 === Number.MAX_SAFE_INTEGER) this.count = 0
            return true
        }
        return false
    }
}
