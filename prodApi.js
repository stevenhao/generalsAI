function getGameState() {
  if (window.GameMap) {
    var theMap = GameMap.props.map;
    var grid = theMap._map.map((color, idx) => ({
      color: color,
      army: theMap._armies[idx],
    }));

    var generals = GameMap.props.generals;
    return {
      width: theMap.width,
      height: theMap.height,
      numberOfPlayers: generals.length,
      me: GameMap.props.playerIndex,
      generals: generals,
      grid: grid,
    };
  } else {
    console.log('window.GameMap missing');
  }
}

var ctrl = (function() {
  function move(fromSq, toSq) {
    if (window.GameMap) {
      console.log('moving', fromSq, toSq);
      s.attack(fromSq, toSq, false);
    } else {
      console.log('window.GameMap missing');
    }
  }
  return {
    move: move,
  };
}());

var intvl = 0;
function autoplay(bot) {
  intvl = setInterval(() => {
    var game = getGameState();
    bot.step(game, ctrl);
  }, 500);
}

function pause() {
  clearInterval(intvl);
  intvl = 0;
}

window.autoplay = autoplay;
window.pause = pause;


// autoplay(DummyAI)
