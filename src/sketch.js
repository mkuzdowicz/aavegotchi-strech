import party from "party-js"
import updatePlayerStats from './game-state'
import * as moralis from './moralis-wrapper'

// bg
import graveyardBGPath from './vendor/assets/bg/graveyard.png'
import desertBGPath from './vendor/assets/bg/desert.png'
import forestBGPath from './vendor/assets/bg/forest.png'
import winterBGPath from './vendor/assets/bg/winter.png'

// sounds
import successSoundPath from './vendor/assets/sounds/success.mp3'
import popSoundPath from './vendor/assets/sounds/pop.mp4'

// p5
import p5 from 'p5';

// fetch and setup player SVG (previewed Aavegotchi)
const numericTraits = [1, 5, 99, 29, 6, 8] // at index 0 is hat
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

const setupPlayerSVG = async () => {
  const svgDataUri = await moralis.getGotchiSVG(equippedWearables, numericTraits)
  const aavegotchiPreview = document.getElementById('aavegotchi-preview')
  aavegotchiPreview.src = svgDataUri
  renderTraits()
  return svgDataUri
}

const initSketch = async () => {
  const svgDataUri = await setupPlayerSVG()
  const canvasParent = document.getElementById('main-canvas')

  const sketch = async (s) => {
    // for making bigger on mobile
    const scaleSketch = window.innerWidth > 450
    console.log('scaleSketch', scaleSketch)
    const w = scaleSketch ? window.innerWidth / 1.3 : window.innerWidth
    const h = window.innerHeight / 1.25
    const gotchiSize = 90

    let gotchiImg;
    let level = 0
    let graveyardBG, desertBG, forestBG, winterBG, backgrounds;
    let successSound, popSound;
  
    const rePreviewGotchi = async () => {
      const hat = equippedWearables[0] + 1
      equippedWearables[0] = hat
      const svgDataUri = await moralis.getGotchiSVG(equippedWearables, numericTraits)
      gotchiImg = s.loadImage(svgDataUri)
    }

    const loadAssetsFn = () => {
      gotchiImg = s.loadImage(svgDataUri)
      successSound = new Audio(successSoundPath)
      successSound.volume = 0.5
      popSound = new Audio(popSoundPath)
      popSound.volume = 0.2
      graveyardBG = s.loadImage(graveyardBGPath)
      desertBG = s.loadImage(desertBGPath)
      forestBG = s.loadImage(forestBGPath)
      winterBG = s.loadImage(winterBGPath)
      backgrounds = [graveyardBG, desertBG, forestBG, winterBG]
    }

    const drawBackground = (bg) => {
      s.noStroke();
      s.background(bg);
    }

    const getHeight = () => s.height - 25

    class Gotchi {
      constructor(x, y) {
        this.x = x
        this.y = y - gotchiSize + 30
        this.speed = 5.5
      }

      draw() {
        s.image(gotchiImg, this.x, this.y, gotchiSize, gotchiSize)
      }

      moveUp() {
        // Moving up at a constant speed
        this.y -= this.speed
        // if top was reached
        if (this.y < 0) {
          // if top was reached
          // SCORED!
          updatePlayerStats()
          // party
          party.confetti(canvasParent)
          successSound.play()
          // change background
          level = (level + 1) % backgrounds.length
          drawBackground(backgrounds[level]);
          // reset gotchi position to beginning
          this.y = getHeight() - gotchiSize + 10;
          rePreviewGotchi()
        }
      }
    }

    const drawLadder = () => {
      s.fill(81, 1, 176);
      const rectWidth = 90
      s.rect((w / 2) - rectWidth / 2, 0, rectWidth, h - 90);
    }
    
    s.preload = () => {
      console.log('p5js preload')
      loadAssetsFn()
    }

    let gotchi;
    s.setup = () => {
      console.log('setup p5js sketch')
      const sketchCanvas = s.createCanvas(w, h - 90);
      sketchCanvas.parent("main-canvas");
      drawBackground(backgrounds[level]);

      // init gotchi
      let gx = (w / 2) - (gotchiSize / 2);
      let gy = getHeight() - 9;
      gotchi = new Gotchi(gx, gy)

      // for debuggin and alerting
      window.setupP5JsDone = true
    }

    s.draw = () => {
      drawLadder()
      if (window.gameState) {
        gotchi.draw()
        if (window.gameStateIsInMove()) {
          gotchi.moveUp()
          popSound.play()
        }
      }
    }
  }

  const sketchInstance = new p5(sketch);
}

// init sketch
initSketch()

window.setTimeout(
  () => {
    if (!window.setupP5JsDone) {
      alert('something went wrong with fetching p5js library please refresh the page')
    }
  }, 3000
)

