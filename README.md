# Aavegotchi Strech Mini Game 
## (Moralis Aavegotchi Game Jam)

![gotchi-jam-devlog2](https://user-images.githubusercontent.com/86926500/132110272-a570f63c-3a8d-4161-b474-7e1e7043d8d2.gif)

(video deom)[https://www.youtube.com/watch?v=WJXl-rI7pyA]

### Supported features so far:
- It works mainly on `Google Chrome`
- login with `Metamask` by using `Moralis` and display logged-in address
- user is registered in `Moralis` users tables
    - storing user `score`, `total strech count` in `Moralis`
    - next time user log in `score` and `total strech count` will be preserved
- preview `Aavegotchi` from `Aavegotchi` smart contract with `Moralis`
    - load `Aavegotchi SVG` from `previewAavegotchi` function in `Aavegotchi` smart contract
    - display info about previewed `Aavegotchi NFT`
    - use `Moralis` Cloud Function to `previewAavegotchi`
- Move `Aavegotchi` by stretching your neck (moving your head) thanks to `Tensorflow.js` Face recognition

### What's Next
- improve gameplay (By using `Phaser` instead of `p5.js`)
    - I have an idea for a `vertical floppy bird` like game
    - I think nech streches can be integrated nicelly into that
- load `Aavegotchi SVG` from `NFT`
- display info about loaded `Aavegotchi NFT`
- `Aavegotchi NFT` will gain `Experience` through gameplay

# Technologies Used
- Moralis
- Aavegotchi
- Tensorflow.js
- p5.js
- Parcel Bundler
- Vanilla ES6 JavaScript
- Bootstrap

# Running locally

```shel
npm install
npm run start
# open localhost:1234
```
