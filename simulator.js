var numPlayers = 1;
var w = 10;
var h = 10;
var bots = [];

var theMap = makeMap(numPlayers, w, h); // from generals-map.js
bots[0] = DummyAI;

function step() {
  theMap.step();
  draw();
  for (var i = 0; i < numPlayers; i += 1) {
    if (bots[i]) {
      bots[i].step(theMap.vision(i), theMap.controls(i));
    }
  }
}

var autoplayIntvl = 0;
function autoplay() {
  autoplayIntvl = setInterval(step, 500);
}

function pause() {
  clearInterval(autoplayIntvl);
}

var colors = {
  '-1': '#dcdcdc',
  '0': 'red',
  '1': 'blue',
};

function draw() {
  document.getElementById('turn').innerHTML = theMap.turn();
  if (!document.getElementById('grid')) {
    var grid = document.createElement('div');
    grid.id = 'grid';
    grid.style.cssText = 'position:relative;margin: 10 10 10 10;text-align:center;';
    theMap.tiles.forEach((tile, idx) => {
      var r = Math.floor(idx / theMap.width()), c = idx % theMap.width();
      var sq = document.createElement('div');
      sq.style.cssText = 'border: 1px solid black;position:absolute;vertical-align:middle;color:white;background-blend-mode: multiply;background-position:center;background-repeat:no-repeat;background-size:25px 25px';
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
      cell.innerHTML = '<div style="position:absolute;transform:translateY(-50%);top:50%;width:100%;font-family:Andale Mono">'+tile.army+'</div>';
    }
    if (theMap.generals.indexOf(idx) !== -1) {
      cell.style.backgroundImage = 'url(images/crown.png)';
    } else if (tile.color === TILE_MOUNTAIN) {
      cell.style.backgroundImage = 'url(images/mountain.png)';
    }
  });
}

window.onload = draw;
