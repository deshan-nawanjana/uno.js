const uno = new UNO()

const init = () => {
    uno.init().then(() => {
        uno.pinMode({
            input : [5],
            output : [6]
        }).then(loop)
    })
}

const loop = () => {


    uno.digitalWrite(6, HIGH).then(() => {
        uno.digitalWrite(2, HIGH).then(() => {
            
        })
    })

}

document.querySelector('button').addEventListener('click', init)