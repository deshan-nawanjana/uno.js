const uno = new UNO()

const init = async function() {
    // start uno.js
    await uno.init()
    // start loop
    loop()
}

const loop = async function() {
    // get value from analog read
    const value = uno.analogRead(0)
    // print value
    console.log(value)
    // update uno state
    await uno.update()
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)