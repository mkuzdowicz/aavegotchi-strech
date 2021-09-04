import party from "party-js"
import * as MoralisSDK from 'moralis'

// init moralis
const moralisAppID = process.env.MORALIS_APPLICATION_ID || ''
const moralisServerUrl = process.env.MORALIS_SERVER_URL || ''
const Moralis = MoralisSDK.default
Moralis.initialize(moralisAppID)
Moralis.serverURL = moralisServerUrl

// fetch and setup player SVG
const numericTraits = [1, 5, 99, 29, 1, 1]
const equippedWearables = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const renderTraits = () => {
  const gotchiTraitsDiv = document.getElementById('gotchi-traits')
  const numericTraitsNames = ['⚡️ Energy', '👹 Aggression', '👻 Spookiness', '🧠 Brain size']
  let traits = ''
  const numericTraitsMap = numericTraits.slice(0, 4).forEach((_, i) => {
    traits += `<li class="list-group-item"><span>${numericTraitsNames[i]}</span> <span>${i}</span></li>`
  })
  gotchiTraitsDiv.innerHTML = `<ul class="list-group">${traits}</ul>`
}

const setupPlayerSVG = async () => {
  const rawSVG = await Moralis.Cloud.run("getSVG", { numericTraits: numericTraits, equippedWearables: equippedWearables })
  const removeBG = (svg) => {
    const styledSvg = svg.replace("<style>", "<style>.gotchi-bg,.wearable-bg{display: none}");
    return styledSvg;
  };
  const rawSVGNoBG = removeBG(rawSVG)
  const svgStrBase64 = window.btoa(rawSVGNoBG)
  const svgDataUri = `data:image/svg+xml;base64,${svgStrBase64}`

  const aavegotchiPreview = document.getElementById('aavegotchi-preview')
  aavegotchiPreview.src = svgDataUri
  renderTraits()
  return svgDataUri
}

const setupSketch = async () => {
  const svgDataUri = await setupPlayerSVG()
  const canvasParent = document.getElementById('main-canvas')

  let img;
  const gotchiSize = 80

  const loadImgFn = () => {
    img = window.loadImage(svgDataUri)
    console.log('image loaded', img)
  }

  window.preload = () => {
    loadImgFn()
  }

  class Ball {
    constructor(x, y) {
      this.x = x
      this.y = y - 50
      this.speed = 1.8
    }

    draw() {
      image(img, this.x, this.y, gotchiSize, gotchiSize)
    }

    moveUp() {
      // Moving up at a constant speed
      this.y -= this.speed
      // Reset to the bottom
      // if top was reached
      if (this.y < 0) {
        // trigger confetti
        party.confetti(canvasParent)
        // reset to beginning
        this.y = getHeight() - 50;
      }
    }
  }

  function getHeight() {
    return height - 25
  }

  function drawLadder() {
    fill(81, 1, 176);
    const rectWidth = 80
    rect((window.innerWidth / 2) - rectWidth / 2, 0, 80, window.innerHeight - 90);
  }

  function drawBackground() {
    noStroke();
    background(18, 2, 47);
  }

  let ball

  // needs to be defined in window for bundler
  window.setup = () => {
    console.log('setup p5js sketch')
    var sketchCanvas = createCanvas(window.innerWidth, window.innerHeight - 90);
    sketchCanvas.parent("main-canvas");

    // init ball
    let x = (window.innerWidth / 2) - (gotchiSize / 2);
    let y = getHeight() - 9;
    ball = new Ball(x, y)
  }

  // needs to be defined in window for bundler
  window.draw = () => {
    drawBackground()

    drawLadder()

    if (window.gameState) {
      ball.draw()

      if (window.gameStateIsInMove()) {
        ball.moveUp()
      }
    }
  }
}

// init sketch
setupSketch()

