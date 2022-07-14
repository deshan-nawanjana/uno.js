UNO.SetupView = class {

    constructor(requirements, connections) {

        // create element
        this.element = document.createElement('div')

        // setup element
        this.element.className = 'unjs-util-setup-view'

        // create inner elements
        this.element.innerHTML = `
            <div class="setup-view-title">Required Components</div>
            <div class="setup-view-list"></div>
            <div class="setup-view-title">Circuit Setup</div>
            <div class="setup-view-setup"></div>
        `

        // get list element
        const list = this.element.querySelector('.setup-view-list')

        // create list
        Object.keys(requirements).forEach(key => {
            const code = key.toLowerCase()
            const name = requirements[key]
            list.innerHTML += `<div
                class="unojs-icon-${code} setup-view-list-item"
            ><div class="setup-view-list-item-code">${key}</div>${name}</div>`
        })

        // get setup element
        const setup = this.element.querySelector('.setup-view-setup')

        // create setup
        connections.forEach(line => {
            // create item
            const item = document.createElement('div')
            // setup item
            item.className = 'setup-view-setup-item'
            // split to array
            const array = line.split('=')
            // add inner content
            item.innerHTML = `
                <div>
                ${array.join('</div><div class="setup-view-setup-join"></div><div>')}
                </div>
            `
            // append to setup
            setup.appendChild(item)
        })

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}