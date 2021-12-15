// ES6 Minimized



/** Connect to Moralis server */
const serverUrl = "https://y1md02ku7dmh.usemoralis.com:2053/server";
const appId = "3genlm4qoZgQleuTwsX4PVheWSnSNx1fgirpsgki";
Moralis.start({ serverUrl, appId });


let currentTrade = {};
let currentSelectedFrom;
let tokensMap =  new Map();
let tokensList;


/** Add from here down */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
      console.log(user)
      console.log(user.get('ethAddress'))
   } catch(error) {
     console.log(error)
   }
  }
}

async function init() {
  await Moralis.initPlugins();
  //await Moralis.enable();
  listTokens();
}

async function listTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
  });
  tokensList = result.tokens;
  let parent = document.getElementById("token_list");
  console.log(tokensList);
  for(const address in tokensList) {
    let token = tokensList[address];
    let div = document.createElement("div");
    div.className = "token_raw";
    let symbol = token.symbol;
    let imageSrc = token.logoURI;
    let html = 
    '<img class="token_list_image" src="' + imageSrc + '"><span class="token_list_symbol">' + symbol + '</span>';
    div.innerHTML = html;
    div.setAttribute("selected_token", JSON.stringify(token));
    div.onclick = selectToken;
    parent.appendChild(div);
    tokensMap.set(symbol, token);
  }
  selectDefaultToken();
}

function selectDefaultToken() {
  currentSelectedFrom = tokensMap.get("ETH");
  console.log("Default selected " + currentSelectedFrom);
  renderSelected();
}

function selectToken() {
  closeModal();
  currentSelectedFrom = JSON.parse(event.target.getAttribute("selected_token"));
  console.log(currentSelectedFrom);
  renderSelected(currentSelectedFrom.symbol);
}

function renderSelected() {
  document.getElementById("from_image").src = currentSelectedFrom.logoURI;
  document.getElementById("from_token").innerHTML  = currentSelectedFrom.symbol;
}

function openModal() {
  document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}


init();

document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_currency_container").onclick = openModal;

//document.getElementById(" ").onclick = login;

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/
