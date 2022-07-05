const uno = new UNO()

const init = async function() {
    // start uno.js
    await uno.init()
    // set pin mode for led
    await uno.pinMode(5, OUTPUT)
    // start loop
    loop()
}

const loop = async function() {
    // check analog value from ir sensor
    if(uno.analogRead(0) > 100) {
        // turn off led for no detection
        await uno.digitalWrite(5, LOW)
    } else {
        // turn on led for detection
        await uno.digitalWrite(5, HIGH)
    }
    // update uno state
    await uno.update()
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)