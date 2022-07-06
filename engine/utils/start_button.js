UNO.StartButton = class {

    constructor(controller, event) {

        // create element
        this.element = document.createElement('button')

        // setup element
        this.element.className = 'unojs-util unojs-util-start-button'
        this.element.classList.add('unojs-util-start-button-stopped')

        this.element.addEventListener('click', () => {
            if(controller._state.runs === false) {
                // start event
                event()
            } else {
                // stop controller
                controller.stop()
            }
        })

        // update method
        const update = () => {
            // select state
            if(controller._state.runs && this.element.lang !== 'RUNNING') {
                this.element.lang = 'RUNNING'
                this.element.classList.add('unojs-util-start-button-running')
                this.element.classList.remove('unojs-util-start-button-stopped')
            } else if(!controller._state.runs && this.element.lang !== 'START') {
                this.element.lang = 'START'
                this.element.classList.add('unojs-util-start-button-stopped')
                this.element.classList.remove('unojs-util-start-button-running')
            }
        }

        // render loop
        const render = () => {
            update()
            setTimeout(() => {
                requestAnimationFrame(render)
            }, 50)
        }

        // start render
        render()

    }

}