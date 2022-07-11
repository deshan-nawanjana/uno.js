UNO.ServoMotor = class {

    constructor(controller, pin) {

        this.attach = async function() {
            return controller.send('MD_1', 'SVR_ATCH', [pin])
        }

        this.write = async function(angle) {
            return controller.send('MD_1', 'SVR_WRTE', [pin, angle])
        }

        this.read = async function() {
            return new Promise((resolve, reject) => {
                controller.send('MD_1', 'SVR_READ', [pin]).then(arr => {
                    resolve(arr[0][0])
                }).catch(reject)
            })
        }

        this.detach = async function() {
            return controller.send('MD_1', 'SVR_DTCH', [pin])
        }

    }

}