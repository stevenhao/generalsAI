// bot loading

// be careful not to name these DummyBot, StevenBot, etc.
// those will be the names of the actual bot constructors
var Dummy = { name: 'DummyBot', path: './dummy.js' };
var Steven = { name: 'StevenBot', path: './stevenbot.js' };

var botSources = [Dummy, Steven];

function load({name, path}) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = path;
  document.head.appendChild(script);
}

function reloadBots() { // called when you update a source file, e.g.
  botSources.forEach(load);
}
reloadBots();

// "global" configs
var botPlayers = [Steven];
var numPlayers = 1;
var w = 20;
var h = 20;
var delay = 10;

function addBotPlayer() {
  numPlayers += 1;
  botPlayers.push(Dummy);
  drawBotSelector();
}


function setSpeed(speed) {
  speed = parseFloat(speed);
  delay = 10 / speed; // max speed: 10
}

function makeBotSelectElement(defaultValue, onselect) {
  var select = document.createElement('select');
  botSources.forEach((bot, idx) => {
    var option = document.createElement('option');
    if (bot === defaultValue) {
      option.selected = true;
    }
    option.value = idx;
    option.innerHTML = bot.name;
    select.appendChild(option);
  });
  select.onchange = () => onselect(botSources[parseInt(select.value)]);
  return select;
}

function drawBotSelector() {
  var botSelector = document.getElementById('bot-selector');
  botSelector.innerHTML = '';
  botPlayers.forEach((currentPlayer, idx) => {
    var select = makeBotSelectElement(currentPlayer, bot => {
      botPlayers[idx] = bot;
    });
    var hintOption = document.createElement('option');
    hintOption.innerHTML = 'Select Player ' + (idx + 1);
    hintOption.disabled = true;
    select.insertBefore(hintOption, select.childNodes[0]);
    botSelector.appendChild(select);
  });
}

// "local" vars, i.e. they are reset each game
var players;
var theMap;
function reset() {
  if (document.getElementById('grid') !== null) {
    document.getElementById('grid').remove();
  }
  if (document.getElementById('leaderboard') !== null) {
    document.getElementById('leaderboard').remove();
  }
  theMap = makeMap(numPlayers, w, h); // from generals-map.js
  players = botPlayers.map(fn => window[fn.name](numPlayers, w, h)); // instantiate each bot
}
reset();

var currentDelay = 10;

function step() {
  theMap.step();
  draw();
  for (var i = 0; i < numPlayers; i += 1) {
    if (players[i]) {
      players[i].step(theMap.vision(i), theMap.controls(i));
    } else {
      // no op bot will not do anything this turn
    }
  }
}

function preStep() {
  if (currentDelay > delay) currentDelay = delay; // just changed the speed. let's not keep anyone waiting
  if (currentDelay === 0) {
    step();
    currentDelay = delay;
  } else {
    currentDelay -= 1;
  }
}

var autoplayIntvl = 0;
function autoplay() {
  if (autoplayIntvl === 0) {
    autoplayIntvl = setInterval(preStep, 25);
  }
}

function pause() {
  clearInterval(autoplayIntvl);
  autoplayIntvl = 0;
}

var colors = {
  '-1': '#dcdcdc',
  '0': 'red',
  '1': 'blue',
};

function draw() {
  document.getElementById('turn').innerHTML = theMap.turn();
  if (!document.getElementById('grid')) { // redraw grid as necessary
    var grid = document.createElement('div');
    grid.id = 'grid';
    theMap.tiles.forEach((tile, idx) => {
      var r = Math.floor(idx / theMap.width()), c = idx % theMap.width();
      var sq = document.createElement('div');
      sq.className = 'square';
      sq.style.width = 30 + 'px';
      sq.style.height = 30 + 'px';
      sq.style.left = c * 30 + 'px';
      sq.style.top = r * 30 + 'px';
      grid.appendChild(sq);
    });
    grid.style.width = 30 * theMap.width() + 'px';
    grid.style.height = 30 * theMap.height() + 'px';
    document.getElementById('game').appendChild(grid);
  }

  theMap.tiles.forEach((tile, idx) => {
    var grid = document.getElementById('grid');
    var cell = grid.childNodes[idx];
    cell.style.backgroundColor = colors[tile.color];
    if (tile.army) {
      cell.innerHTML = '<div class="army-text">'+tile.army+'</div>';
    } else {
      cell.innerHTML = '';
    }
    if (theMap.generals.indexOf(idx) !== -1) {
      cell.style.backgroundImage = 'url(images/crown.png)';
    } else if (tile.color === TILE_MOUNTAIN) {
      cell.style.backgroundImage = 'url(images/mountain.png)';
    } else {
      cell.style.backgroundImage = '';
    }
  });

  var leaderboard = document.getElementById('leaderboard');
  if (leaderboard === null) {
    leaderboard = document.createElement('table');
    leaderboard.id = 'leaderboard';
    document.getElementById('game').appendChild(leaderboard);
  }

  leaderboard.innerHTML = '';
  function makeRow(strs) {
     var row = document.createElement('tr');
     row.innerHTML = strs.map(s => '<td>' + s + '</td>').join('');
    return row;
  }
  leaderboard.appendChild(makeRow(['Player', 'Army', 'Land']));
  players.forEach((player, idx) => {
    var row = makeRow([player.name,
      totalArmy(theMap, idx), totalLand(theMap, idx)]);
    row.childNodes[0].style.background = colors[idx];
    row.childNodes[0].style.color = 'white';
    leaderboard.appendChild(row);
  });

}

window.onload = () => {
  drawBotSelector()
  draw();
}
