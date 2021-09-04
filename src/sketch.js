import party from "party-js"
import * as MoralisSDK from 'moralis'

// bg
import graveyardBGPath from './vendor/assets/bg/graveyard.png'
import desertBGPath from './vendor/assets/bg/desert.png'
import forestBGPath from './vendor/assets/bg/forest.png'
import winterBGPath from './vendor/assets/bg/winter.png'

// sounds
import successSoundPath from './vendor/assets/sounds/success.mp3'
import popSoundPath from './vendor/assets/sounds/pop.mp4'

// init moralis
const moralisAppID = process.env.MORALIS_APPLICATION_ID || ''
const moralisServerUrl = process.env.MORALIS_SERVER_URL || ''
const Moralis = MoralisSDK.default
Moralis.initialize(moralisAppID)
Moralis.serverURL = moralisServerUrl

// fetch and setup player SVG
// at index 0 is hat
const numericTraits = [1, 5, 99, 29, 6, 8]
const equippedWearables = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const renderTraits = () => {
  const gotchiTraitsDiv = document.getElementById('gotchi-traits')
  const numericTraitsNames = ['⚡️ Energy', '👹 Aggression', '👻 Spookiness', '🧠 Brain size']
  let traits = ''
  numericTraits.slice(0, 4).forEach((_, i) => {
    traits += `<li class="list-group-item"><span>${numericTraitsNames[i]}</span> <span>${numericTraits[i]}</span></li>`
  })
  gotchiTraitsDiv.innerHTML = `<ul class="list-group">${traits}</ul>`
}

const getGotchiSVG = async (wearables) => {
  const rawSVG = await Moralis.Cloud.
    run("getSVG", {
      numericTraits: numericTraits,
      equippedWearables: wearables
    })
  const removeBG = (svg) => {
    const styledSvg = svg.replace("<style>", "<style>.gotchi-bg,.wearable-bg{display: none}");
    return styledSvg;
  };
  const rawSVGNoBG = removeBG(rawSVG)
  const svgStrBase64 = window.btoa(rawSVGNoBG)
  const svgDataUri = `data:image/svg+xml;base64,${svgStrBase64}`
  return svgDataUri
}

const setupPlayerSVG = async () => {
  const svgDataUri = await getGotchiSVG(equippedWearables)
  const aavegotchiPreview = document.getElementById('aavegotchi-preview')
  aavegotchiPreview.src = svgDataUri
  renderTraits()
  return svgDataUri
}

const setupSketch = async () => {
  console.log('setup sketch start')
  const svgDataUri = await setupPlayerSVG()
  console.log('svgDataUri fetched')
  const canvasParent = document.getElementById('main-canvas')

  let gotchiImg;
  let level = 0
  let graveyardBG, desertBG, forestBG, winterBG;
  let backgrounds;
  let successSound, popSound;
  const gotchiSize = 90

  const repreviewGotchi = async () => {
    const hat = equippedWearables[0] + 1
    equippedWearables[0] = hat
    const svgDataUri = await getGotchiSVG(equippedWearables)
    gotchiImg = window.loadImage(svgDataUri)
  }

  const loadAssetsFn = () => {
    gotchiImg = window.loadImage(svgDataUri) // p5js fn

    successSound = new Audio(successSoundPath)
    successSound.volume = 0.5
    popSound = new Audio(popSoundPath)
    popSound.volume = 0.2

    graveyardBG = window.loadImage(graveyardBGPath) // p5js fn

    desertBG = window.loadImage(desertBGPath) // p5js fn
    forestBG = window.loadImage(forestBGPath) // p5js fn
    winterBG = window.loadImage(winterBGPath) // p5js fn
    backgrounds = [graveyardBG, desertBG, forestBG, winterBG]
  }

  // p5js fn
  window.preload = () => {
    console.log('p5js preload')
    loadAssetsFn()
  }

  class Gotchi {
    constructor(x, y) {
      this.x = x
      this.y = y - gotchiSize + 30
      this.speed = 5.5
    }

    draw() {
      window.image(gotchiImg, this.x, this.y, gotchiSize, gotchiSize) // p5js fn
    }

    moveUp() {
      // Moving up at a constant speed
      this.y -= this.speed
      // Reset to the bottom
      // if top was reached
      if (this.y < 0) {
        // SCORED!

        // update stat
        if (window.player) {
          window.gameScore += 1
          window.totalStrechCount += window.strechesInSession
          window.player.set('score', window.gameScore)
          window.player.set('total_strech_count', window.totalStrechCount)
          window.player.save()

          document.getElementById('user-score').innerHTML = window.gameScore
          document.getElementById('strech-count-in-session').innerHTML = window.strechesInSession
          document.getElementById('total-strech-count').innerHTML = window.totalStrechCount
        }
        // party
        party.confetti(canvasParent)
        successSound.play()
        // change background
        level = (level + 1) % backgrounds.length
        drawBackground(backgrounds[level]);
        // reset gotchi position to beginning
        this.y = getHeight() - gotchiSize + 10;
        repreviewGotchi()
      }
    }
  }

  function getHeight() {
    return height - 25
  }

  const w = window.innerWidth / 1.3
  const h = window.innerHeight / 1.25

  function drawLadder() {
    window.fill(81, 1, 176); // p5js fn
    const rectWidth = 90
    window.rect((w / 2) - rectWidth / 2, 0, rectWidth, h - 90); // p5js fn
  }

  function drawBackground(bg) {
    window.noStroke();
    window.background(bg);
  }

  let gotchi;

  // needs to be defined in window for bundler
  window.setup = () => {
    console.log('setup p5js sketch')
    const sketchCanvas = window.createCanvas(w, h - 90);
    sketchCanvas.parent("main-canvas");
    drawBackground(backgrounds[level]);
    // init gotchi
    let x = (w / 2) - (gotchiSize / 2);
    let y = getHeight() - 9;
    gotchi = new Gotchi(x, y)

    // for debuggin
    window.setupP5JsDone = true
  }

  // needs to be defined in window for bundler
  window.draw = () => {
    drawLadder()

    if (window.gameState) {
      gotchi.draw()

      if (window.gameStateIsInMove()) {
        gotchi.moveUp()
        popSound.play()
      }
    }
  }
  console.log('setup sketch finish')
}

// init sketch
setupSketch()

window.setTimeout(
  () => {
    if (!window.setupP5JsDone) {
      alert('something went wrong with fethcin p5js library please refresh the page')
    }
  }, 1000
)

