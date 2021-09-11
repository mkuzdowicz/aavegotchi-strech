import * as MoralisSDK from 'moralis'

// init moralis
const moralisAppID = process.env.MORALIS_APPLICATION_ID || ''
const moralisServerUrl = process.env.MORALIS_SERVER_URL || ''

const Moralis = MoralisSDK.default
Moralis.initialize(moralisAppID)
Moralis.serverURL = moralisServerUrl

const connectWalletBtn = document.getElementById('connect-wallet')

const updateUserStatsView = () => {
    const player = window.player
    const score = player.get && player.get('score') ? player.get('score') : 0
    const totalStrechCount = player.get && player.get('total_strech_count') ? player.get('total_strech_count') : 0
    window.gameScore = score
    window.totalStrechCount = totalStrechCount
    document.getElementById('user-score').innerHTML = window.gameScore
    document.getElementById('total-strech-count').innerHTML = window.totalStrechCount
}

const ethAddressEllipsis = (str) => {
    if (str.length > 15) {
        return str.substr(0, 5) + '...' + str.substr(str.length - 5, str.length);
    }
    return str;
}

const initWeb3 = async () => {
    window.web3 = await Moralis.Web3.enable()
    const user = await Moralis.User.current()
    if (user) {
        const userEthAddress = user.get('ethAddress')
        window.player = user
        connectWalletBtn.innerHTML = ethAddressEllipsis(userEthAddress)
        updateUserStatsView()
    }
}

const login = async () => {
    try {
        await Moralis.Web3.authenticate()
    } catch (err) {
        alert(err.message)
    }
    const user = await Moralis.User.current()
    window.player = user
    const userEthAddress = user.get('ethAddress')
    console.log('user ethAddress after login', userEthAddress)
    connectWalletBtn.innerHTML = ethAddressEllipsis(userEthAddress)
    updateUserStatsView()
}

const logout = async () => {
    await Moralis.User.logOut()
    console.log('current user logout')
    connectWalletBtn.innerHTML = 'Connect Wallet'
    window.player = {}
    updateUserStatsView()
}

// uses Moralis CloudFunction `getSVG`
const getGotchiSVG = async (wearables, numericTraits) => {
    const rawSVG = await Moralis.Cloud.
        run("getSVG", {
            numericTraits: numericTraits,
            equippedWearables: wearables
        })

    const parser = new DOMParser();
    const result = parser.parseFromString(rawSVG, 'text/xml');
    const inlineSVG = result.getElementsByTagName("svg")[0];
    if (inlineSVG.getAttribute('width') == undefined) {
        inlineSVG.setAttribute('width', '180px');
        inlineSVG.setAttribute('height', '180px');
    }

    const rawSVGEnhanced = new XMLSerializer().serializeToString(inlineSVG)

    const removeBG = (svg) => {
        const styledSvg = svg.replace("<style>", "<style>.gotchi-bg,.wearable-bg{display: none}");
        return styledSvg;
    };
    const rawSVGNoBG = removeBG(rawSVGEnhanced)
    const blob = new Blob([rawSVGNoBG], { type: 'image/svg+xml;charset=utf-8' });
    const svgDataUri = URL.createObjectURL(blob);
    return svgDataUri
}

export { initWeb3, login, logout, getGotchiSVG }
