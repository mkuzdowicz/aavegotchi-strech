import party from "party-js"
import svgPath from "./vendor/icon/aavegotchi.svg"

const canvasParent = document.getElementById('main-canvas')

let img;
const gotchiSize = 80

const loadImgFn = () => {
  img = window.loadImage(svgPath)
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
      this.y = getHeight();
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
