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
            document.getElementById('strech-count-in-session').innerHTML = window.strechesInSession
        } else if (timeDiff >= 0.5) {
            window.strechesInSession = window.strechesInSession + 1
            document.getElementById('strech-count-in-session').innerHTML = window.strechesInSession
        }
    }
    return window.gameState == move
}

window.gameStateInit()

window.gameScore = 0
window.strechesInSession = 0
window.totalStrechCount = 0

export default function updatePlayerStats() {
    window.gameScore += 1
    window.totalStrechCount += window.strechesInSession
    if (window.player && window.player.set) {
        window.player.set('score', window.gameScore)
        window.player.set('total_strech_count', window.totalStrechCount)
        window.player.save()
    }
    document.getElementById('user-score').innerHTML = window.gameScore
    document.getElementById('total-strech-count').innerHTML = window.totalStrechCount
}
