/** Connect to Moralis server */
const serverUrl = "https://y1md02ku7dmh.usemoralis.com:2053/server";
const appId = "3genlm4qoZgQleuTwsX4PVheWSnSNx1fgirpsgki";
Moralis.start({ serverUrl, appId });

let currentTrade = {};
let currentSelectedFrom;
let currentSelectedTo;
let tokensMap =  new Map();
let tokensList;
let modalType = 0;


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
  console.log("Default selected from " + currentSelectedFrom);
  renderSelectedFrom(currentSelectedFrom);

  currentSelectedTo = tokensMap.get("USDT");
  console.log("Default selected to " + currentSelectedFrom);
  renderSelectedTo();
}

function selectToken() {
  
  console.log("selectToken");
  if(modalType == 1) {
      currentSelectedFrom = JSON.parse(event.target.getAttribute("selected_token"));
      console.log(currentSelectedFrom);
      renderSelectedFrom();
  } else if (modalType == 2) {
      currentSelectedTo = JSON.parse(event.target.getAttribute("selected_token"));
      console.log(currentSelectedTo);
      renderSelectedTo();
  }
  closeModal();
}

function renderSelectedFrom() {
  document.getElementById("from_image").src = currentSelectedFrom.logoURI;
  document.getElementById("from_token").innerHTML  = currentSelectedFrom.symbol;
}

function renderSelectedTo() {
  document.getElementById("to_image").src = currentSelectedTo.logoURI;
  document.getElementById("to_token").innerHTML  = currentSelectedTo.symbol;
}

function openModal(type) {
  document.getElementById("token_modal").style.display = "block";
  modalType = type;
}

function closeModal() {
  document.getElementById("token_modal").style.display = "none";
  modalType = 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const quote = async function countQuote() {

      // disable button
  $("#to_input").prop("disabled", true);
  $("#from_input").append(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
  );
  console.log("countQuote");
  if(!currentSelectedFrom || !currentSelectedTo) return;

  let value = Number(Moralis.Units.Token(document.getElementById("from_input").value, currentSelectedFrom.decimals));

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentSelectedFrom.address, // The token you want to swap
    toTokenAddress: currentSelectedTo.address, // The token you want to receive
    amount: value,
  })
  console.log(quote);
  var finalValue = Number(Moralis.Units.FromWei(quote .toTokenAmount, currentSelectedTo.decimals));
  console.log(finalValue);
  document.getElementById("to_input").value = finalValue.toFixed(2);
}

init();

document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_currency_container").addEventListener("click", function() {
    openModal(1);
}, false);
document.getElementById("to_currency_container").addEventListener("click", function() {
    openModal(2);
}, false);
document.getElementById("from_input").addEventListener("input", quote);



