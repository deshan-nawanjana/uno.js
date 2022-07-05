UNO.LiquidCrystalDisplay = class {

    constructor(controller) {

        this.begin = async function(width, height) {
            return new Promise((resolve, reject) => {
                controller.send(203, 20, resolve, reject, [width, height])
            })
        }

        this.setCursor = async function(x, y) {
            return new Promise((resolve, reject) => {
                controller.send(203, 21, resolve, reject, [x, y])
            })
        }

        const encoder = new TextEncoder()

        this.print = async function(text) {
            const arr = Array.from(encoder.encode(text))
            return new Promise((resolve, reject) => {
                controller.send(203, 22, resolve, reject, arr)
            })
        }

        this.clear = async function() {
            return new Promise((resolve, reject) => {
                controller.send(203, 23, resolve, reject, [])
            })
        }

    }

}