UNO.LiquidCrystalDisplay = class {

    constructor(controller) {

        this.begin = async function(width, height) {
            return controller.send('MD_1', 'LCD_BEGN', [width, height])
        }

        this.setCursor = async function(x, y) {
            return controller.send('MD_1', 'LCD_CRSR', [x, y])
        }

        this.print = async function(text) {
            const array = _UNO_.HLP.encodeText(text)
            return controller.send('MD_1', 'LCD_PRNT', array)
        }

        this.clear = async function() {
            return controller.send('MD_1', 'LCD_CLER')
        }

    }

}