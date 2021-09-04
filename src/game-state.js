const play = "play"
const move = "move"
const stop = "stop"

let prevState = stop
let lastTimeChangeToStop = Date.now()

window.gameStateInit = () => {
    window.gameState = stop
}

window.gameStateMove = () => {
    prevState = window.gameState
    window.gameState = move
}

window.gameStateStop = () => {
    prevState = window.gameState
    if (prevState == move) {
        lastTimeChangeToStop = Date.now()
    }
    window.gameState = stop
}

window.gameStateIsInMove = () => {
    if (prevState == stop && window.gameState == move) {
        const now = Date.now()
        const timeDiff = (now - lastTimeChangeToStop) / 1000
        // if first time just increment
        // otherwise do not increment if it was flickering
        if (window.strechesInSession == 0) {
            window.strechesInSession = window.strechesInSession + 1
        } else if (timeDiff >= 0.5) {
            window.strechesInSession = window.strechesInSession + 1
        }
    }
    return window.gameState == move
}

window.gameStateInit()

window.player = {}
window.gameScore = 0
window.strechesInSession = 0
window.totalStrechCount = 0