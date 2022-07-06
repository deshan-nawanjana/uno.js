UNO.StateView = class {

    constructor(title, text = 'NO_TEXT', colorIndex = 0, hidden = false) {

        this.element = document.createElement('div')

        this.element.className = 'unojs-util unojs-util-state-view'

        this.element.innerHTML = `
            <div class="state-view-title">${title}</div>
            <div class="state-view-inner">${text}</div>
        `

        if(hidden) { this.element.style.display = 'none' }

        const inner = this.element.querySelector('.state-view-inner')

        inner.style.backgroundColor = CLR(colorIndex)

        this.update = (text, colorIndex) => {
            inner.innerHTML = text
            inner.style.backgroundColor = CLR(colorIndex)
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}