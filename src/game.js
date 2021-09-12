import Phaser from "phaser";
import party from "party-js"
import * as moralis from './moralis-wrapper'
import updatePlayerStats from './game-state'

// tiles
import ladderPath from "./vendor/assets/tiles/ladder.png";

// bg
import graveyardBGPath from './vendor/assets/bg/graveyard.png'
import desertBGPath from './vendor/assets/bg/desert.png'
import forestBGPath from './vendor/assets/bg/forest.png'
import winterBGPath from './vendor/assets/bg/winter.png'

// sounds
import successSoundPath from './vendor/assets/sounds/success.mp3'
import popSoundPath from './vendor/assets/sounds/pop.mp4'

const canvasParent = document.getElementById('main-canvas')

const backGrounds = new Map([
    ["graveyard", graveyardBGPath],
    ["desert", desertBGPath],
    ["forest", forestBGPath],
    ["winter", winterBGPath]])

let bgs = [...backGrounds.keys()]
let level = 0
let successSound, popSound
let rePreviewed = false
let gotchi

const numericTraits = [1, 5, 99, 29, 6, 8] // at index 0 is hat
const equippedWearables = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const renderTraits = (svgString) => {
    const aavegotchiPreview = document.getElementById('aavegotchi-preview')
    const svgStrBase64 = window.btoa(svgString)
    const svgDataUri = `data:image/svg+xml;base64,${svgStrBase64}`
    aavegotchiPreview.src = svgDataUri
    const gotchiTraitsDiv = document.getElementById('gotchi-traits')
    const numericTraitsNames = ['⚡️ Energy', '👹 Aggression', '👻 Spookiness', '🧠 Brain size']
    let traits = ''
    numericTraits.slice(0, 4).forEach((_, i) => {
        traits += `<li class="list-group-item"><span>${numericTraitsNames[i]}</span> <span>${numericTraits[i]}</span></li>`
    })
    gotchiTraitsDiv.innerHTML = `<ul class="list-group">${traits}</ul>`
}

const setupPlayerSVG = async () => {
    const svgString = await moralis.getGotchiSVG(equippedWearables, numericTraits)
    renderTraits(svgString)
    return svgString
}

const svgStringToURL = (svgString) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(blob);
}

const setupGame = async () => {
    const svgString = await setupPlayerSVG()
    const svgDataUrl = svgStringToURL(svgString)

    const gamePlay = new Phaser.Class({
        // Define scene
        Extends: Phaser.Scene,
        initialize: function GamePlay() {
            Phaser.Scene.call(this, { key: "GamePlay" });
        },

        rePreviewGotchi: async function () {
            const hat = equippedWearables[0] + 1
            equippedWearables[0] = hat
            const svgString = await moralis.getGotchiSVG(equippedWearables, numericTraits)
            const svgDataUrl = svgStringToURL(svgString)
            this.textures.removeKey('gotchi')
            this.load.svg('gotchi', svgDataUrl)
            this.load.start()
        },

        preload: function () {
            // sounds
            successSound = new Audio(successSoundPath)
            successSound.volume = 0.5
            popSound = new Audio(popSoundPath)
            popSound.volume = 0.2
            // Preload images
            backGrounds.forEach((path, name) => this.load.image(name, path))
            this.load.image(
                "ladder",
                ladderPath
            );
            this.load.svg('gotchi', svgDataUrl)
        },

        updateSrites: function () {
            // Create background
            this.bg = this.add.image(config.width / 2, config.height / 2, bgs[level]);
            this.bg.setDisplaySize(config.width, config.height);
            // draw ladders
            let ladderCount = 3
            let ladderY = config.height - 250
            for (let i = ladderCount; i--;) {
                let curLadder = this.add.image(config.width / 2, ladderY, 'ladder')
                    .setScale(0.1)
                ladderY = ladderY - curLadder.displayHeight
            }
            // Create gotchi
            gotchi = this.physics.add
                .sprite(config.width / 2, config.height - 60, 'gotchi')
            gotchi.setScale(0.55)
        },

        create: function () {
            this.updateSrites()
        },

        update: function () {
            // Update objects & variables
            const scored = gotchi.y <= 0
            if (!rePreviewed) {
                this.rePreviewGotchi()
                rePreviewed = true
            }
            if (scored) {
                party.confetti(canvasParent)
                successSound.play()
                updatePlayerStats()
                // open next level
                level = (level + 1) % bgs.length
                this.updateSrites()
                rePreviewed = false
            }
            gotchi.setVelocity(0, 0);
            if (window.gameStateIsInMove()) {
                //  Move up
                const velocity = isMobile ? 90 : 200
                gotchi.setVelocityY(-velocity);
                popSound.play()
            }
        }
    });

    /*--- CONFIG + RUNNING THE GAME ---*/

    //Define the game config once everything else is defined
    const isMobile = window.innerWidth < 450
    const scaleDownSketch = !isMobile

    const config = {
        type: Phaser.AUTO,
        width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
        height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
        parent: 'main-canvas',
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: gamePlay,
        debug: true
    };

    //Instantiate the game with the config
    const game = new Phaser.Game(config)
}

setupGame()
