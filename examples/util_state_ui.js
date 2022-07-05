const uno = new UNO()
// create state ui
const gui = new UNO.StateUI(uno)

const init = async function() {
    // start uno.js
    await uno.init()
    // start loop
    loop()
}

const loop = async function() {
    // update uno
    await uno.delay(100)
    // loop again
    loop()
}

// append gui to body
document.body.append(gui.domElement)

document.querySelector('button').addEventListener('click', init)