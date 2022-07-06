UNO.LiquidCrystalDisplay = class {

    constructor(controller) {

        this.begin = async function(width, height) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_BEGN, resolve, reject, [width, height])
            })
        }

        this.setCursor = async function(x, y) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_CRSR, resolve, reject, [x, y])
            })
        }

        const encoder = new TextEncoder()

        this.print = async function(text) {
            const arr = Array.from(encoder.encode(text))
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_PRNT, resolve, reject, arr)
            })
        }

        this.clear = async function() {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_CLER, resolve, reject, [])
            })
        }

    }

}