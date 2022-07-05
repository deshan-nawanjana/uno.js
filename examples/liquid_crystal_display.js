const uno = new UNO()
// create liquid crystal display
const lcd = new UNO.LiquidCrystalDisplay(uno)

const init = async function() {
    // start uno.js
    await uno.init()
    // start lcd
    await lcd.begin(16, 2)
    // start loop
    loop()
}

const loop = async function() {
    // set cursor position
    await lcd.setCursor(0, 0)
    // print on lcd
    await lcd.print(Date.now())
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)