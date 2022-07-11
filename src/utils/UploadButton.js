UNO.UploadButton = class {

    constructor(uploader, input) {

        // create element
        this.element = document.createElement('div')

        //  get values from input
        const labels = Object.keys(input)
        const values = Object.values(input)
        const boards = values.map(x => x.board)

        let state = 'upload'

        this.element.className = 'unojs-util unojs-util-uploader unojs-upload'

        // create options for select
        const options = labels.map((x, i) => {
            return `<option value="${boards[i]}">${x}</option>`
        })

        // create child elements
        this.element.innerHTML = `
            <select>${options.join('')}</select>
            <div class="unojs-upload-button"></div>
        `

        const button = this.element.querySelector('.unojs-upload-button')
        const select = this.element.querySelector('select')

        const setState = stateCode => {
            state = stateCode
            this.element.className = 'unojs-util unojs-util-uploader unojs-' + stateCode
        }

        if('serial' in navigator) {
            button.addEventListener('click', () => {
                if(state !== 'upload') { return }
                setState('uploading')
                const board = select.value
                const item = values.find(x => x.board === board)
                uploader.uploadFile(select.value, item.file).then(() => {
                    setState('uploaded')
                    setTimeout(() => {
                        setState('upload')
                    }, 2000)
                }).catch(e => {
                    if(e.toString() === 'NotFoundError: No port selected by the user.') {
                        // port not selected
                        setState('upload')
                    } else {
                        // upload error
                        setState('failed')
                        setTimeout(() => {
                            setState('upload')
                        }, 1000)
                    }
                })
            })
        } else {
            setState('serial')
            this.element.classList.add('serial-error')
            button.addEventListener('click', _UNO_.HLP.showUnsupported)
        }

    }

}