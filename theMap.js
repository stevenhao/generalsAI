function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function rand(n) { return Math.floor(Math.random() * n); };
const DIRECTIONS = [{dr: -1, dc: 0}, {dr: 0, dc: 1}, {dr: 1, dc: 0}, {dr: 0, dc: -1}];

function makeMap(p, w, h) {
  p = p || 1;
  w = w || 10; h = h || 10;

  function toRC(sq) {
    return {
      r: Math.floor(sq / w),
      c: sq % w,
    };
  }

  function toSQ(rc) {
    return w * rc.r + rc.c;
  }

  function isAdjacent(a, b) {
    a = toRC(a); b = toRC(b);
    if (a.r == b.r) {
      return Math.abs(a.c - b.c) === 1;
    }
    if (a.c == b.c) {
      return Math.abs(a.r - b.r) === 1;
    }
    return false;
  }

  function inbounds(rc) {
    return 0 <= rc.r && rc.r < h && 0 <= rc.c && rc.c < w;
  }

  function neighbors(sq) {
    sq = toRC(sq);
    return DIRECTIONS.map(({dr, dc}) => ({r: sq.r + dr, c: sq.c + dc}))
      .filter(inbounds)
      .map(toSQ);
  }

  var tiles = [];
  var generals = [];
  for (var i = 0; i < h; i += 1) {
    for (var j = 0; j < w; j += 1) {
      tiles.push({
        color: TILE_EMPTY,
        army: 0,
      });
    }
  }

  for (var i = 0; i < p; i += 1) {
    var sq = rand(w * h);
    generals.push(sq);
    tiles[sq].color = i;
    tiles[sq].army = 1;
  }

  function vision(player) {
    var grid = tiles.map((tile, idx) => {
      if (neighbors(idx).concat([idx]).some(nidx => tiles[nidx].color === player)) {
        return tile;
      } else {
        return {
          color: tile.color == TILE_MOUNTAIN ? TILE_FOG_OBSTACLE : TILE_FOG,
          army: 0,
        };
      }
    });

    var generalsVision = generals.map(idx => {
      if (grid[idx].color === TILE_FOG) {
        return -1;
      } else {
        return idx;
      }
    });
    return {
      width: theMap.width(),
      height: theMap.height(),
      numberOfPlayers: generals.length,
      me: player,
      generals: generalsVision,
      grid: grid,
    }
  }

  function controls(player) {
    function validMove(fromSq, toSq) {
      if (tiles[fromSq].color === player) {
        if (tiles[fromSq].army >= 2) {
          if (isAdjacent(fromSq, toSq)) {
            return true;
          }
        }
      }
      return false;
    }

    function makeMove(fromSq, toSq) {
      console.log('makeMove', fromSq, toSq);
      if (tiles[toSq].color === player) {
        tiles[toSq].army += tiles[fromSq].army - 1;
      } else {
        tiles[toSq].army -= tiles[fromSq].army - 1;
        if (tiles[toSq].army < 0) {
          tiles[toSq].army *= -1;
          tiles[toSq].color = player;
        }
      }
      tiles[fromSq].army = 1;
    }

    return {
      move: function(fromSq, toSq) {
        if (validMove(fromSq, toSq)) {
          makeMove(fromSq, toSq);
        } else {
          console.log('invalid move:', fromSq, toSq);
        }
      }
    };
  }

  var turn = 0;
  function step() {
    turn += 1;
    if (turn % 2 === 0) {
      // grow generals
      generals.forEach(idx => {
        tiles[idx].army += 1;
      });
    }
    if (turn % 50 === 0) {
      // grow everyone
      tiles.forEach((tile, idx) => {
        if (tile.color >= 0) {
          tiles[idx].army += 1;
        }
      });
    }
  }

  var theMap = {
    width: () => w,
    height: () => h,
    turn: () => turn,
    tiles: tiles,
    vision: vision,
    controls: controls,
    step: step,
    generals: generals,
  };
  return theMap;
}

function totalArmy(map, player) {
  var sum = 0;
  map.tiles.filter(tile => tile.color === player).forEach(tile => {
    sum += tile.army;
  });
  return sum;
}

function totalLand(map, player) {
  return map.tiles.filter(tile => tile.color === player).length;
}
