const uno = new UNO.Controller()
// create liquid crystal display
const lcd = new UNO.LiquidCrystalDisplay(uno)
// create sensor with trigger pin and echo pin
const uss = new UNO.UltrasonicSensor(uno, 4, 5)

const init = async function() {
    // start uno.js
    await uno.init()
    // start lcd
    await lcd.begin(16, 2)
    // start sensor
    await uss.init()
    // start loop
    loop()
}

const loop = async function() {
    // read duration from sensor
    const duration = await uss.read()
    // calculate distance
    const distance = (duration * 340 * 100 * 0.5) / 1000000
    // set cursor position
    await lcd.setCursor(0, 0)
    // print on lcd
    await lcd.print(distance)
    // delay 300 milliseconds
    await uno.delay(300)
    // loop again
    loop()
}

// create start button
const btn = new UNO.StartButton(uno, init)

// append start button to body
document.body.append(btn.element)