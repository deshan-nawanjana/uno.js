UNO.StartButton = class {

    constructor(controller, startEvent, stopEvent) {

        // create element
        this.element = document.createElement('button')

        // button mode
        let mode = 'start'

        // setup element
        this.element.className = 'unojs-util unojs-util-start-button start'

        // button click event
        this.element.addEventListener('click', () => {
            // return if unsupported
            if(mode === 'error') {
                _UNO_.HLP.showUnsupported()
                return
            }
            // return if busy
            if(mode === 'starting' || mode === 'stopping') { return }
            // select controller state
            if(controller._state.runs === false) {
                if(startEvent) {
                    // start event
                    startEvent()
                } else if(controller.init) {
                    // init controller
                    controller.init()
                } else if(controller.start) {
                    // start communicator
                    controller.start()
                }
            } else {
                if(stopEvent) {
                    // stop event
                    stopEvent()
                } else {
                    // stop controller
                    controller.stop()
                }
            }
        })

        // update method
        const update = () => {
            // get controller states
            const runs = controller._state.runs
            const wait = controller._state.wait
            // select state
            if(runs === false && wait === null) {
                mode = 'start'
            } else if(runs === false && wait === true) {
                mode = 'starting'
            } else if(runs === true && wait === false) {
                mode = 'running'
            } else if(runs === true && wait === true) {
                mode = 'stopping'
            }

            if(this.element.lang !== mode) {
                this.element.lang = mode
                this.element.className = 'unojs-util unojs-util-start-button ' + mode
            }
        }

        // render loop
        const render = () => {
            update()
            setTimeout(() => {
                requestAnimationFrame(render)
            }, 50)
        }



        if("serial" in navigator) {
            // start render
            render()
        } else {
            this.element.className = 'unojs-util unojs-util-start-button error'
            mode = 'error'
        }

    }

}