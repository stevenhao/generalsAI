var stevenbotcnt = 0;
var StevenBot = (function(numplayers, w, h) {
  const TILE_EMPTY = -1;
  const TILE_MOUNTAIN = -2;
  const TILE_FOG = -3;
  const TILE_FOG_OBSTACLE = -4;
  const DIRECTIONS = [{dr: -1, dc: 0}, {dr: 0, dc: 1}, {dr: 1, dc: 0}, {dr: 0, dc: -1}];
  const DIAGS = [{dr: -1, dc: -1}, {dr: -1, dc: 1}, {dr: 1, dc: -1}, {dr: 1, dc: 1}];

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

  function diagNeighbors(sq) {
    sq = toRC(sq);
    return DIAGS.concat(DIRECTIONS).map(({dr, dc}) => ({r: sq.r + dr, c: sq.c + dc}))
      .filter(inbounds)
      .map(toSQ);
  }

  function getEvil(sq, game) {
    return diagNeighbors(sq)
      .filter(nsq => game.grid[nsq].color === game.them)
      .length;
  }

  var TRANSPORT = 0;
  var EXPLORE = 1;
  var ATTACK = 2;

  function getMoveType(tileA, tileB) {
    if (tileB.color === tileA.color) {
      return TRANSPORT;
    } else if (tileB.color === TILE_EMPTY) {
      return EXPLORE;
    } else {
      return ATTACK;
    }
  }

  function getValidMoves(game) {
    var result = [];
    game.grid.forEach((tile, a) => {
      if (tile.color === game.me && tile.army >= 2) {
        neighbors(a).forEach(b => {
          var from = game.grid[a], to = game.grid[b];
          if (to.color === TILE_MOUNTAIN) return;
          if (to.color === -1 && to.army > 0) return; // ignore towers for now
          var move = {
            a: a,
            b: b,
            from: from,
            to: to,
            mass: from.army - 1,
            type: getMoveType(from, to),
          };
          if (move.type === EXPLORE) {
            move.sum = from.army - 1;
          } else if (move.type === ATTACK) {
            move.sum = from.army - 1 - to.army;
          } else {
            move.sum = from.army - 1 + to.army;
          }
          if (move.sum < 0) move.sum = 0;
          result.push(move);
        });
      }
    });
    return result;
  }

  function getDistancesFrom(center, grid) {
    if (center === undefined) return grid.map(() => 0);
    // run a bfs
    var vis = grid.map(() => false);
    var dst = grid.map(() => -1);
    var queue = [];
    function push(sq, d) {
      if (vis[sq]) return;
      vis[sq] = true;
      dst[sq] = d;
      queue.push(sq);
    }
    function visit(sq) {
      vis[sq] = true;
      neighbors(sq).forEach(nsq => {
        if (grid[nsq].color !== TILE_MOUNTAIN &&
            grid[nsq].color !== TILE_FOG_OBSTACLE) {
          push(nsq, dst[sq] + 1);
        }
      });
    }

    push(center, 0);
    while (queue.length > 0) {
      var front = queue.shift();
      visit(front);
    }
    console.log('getDistancesFrom', center);
    console.log(dst);
    return dst;
  }

  function flip(sq) {
    sq = toRC(sq);
    sq.r = h - sq.r - 1;
    sq.c = w - sq.c - 1;
    return toSQ(sq);
  }

  function manhattan(sq1, sq2) {
    sq1 = toRC(sq1);
    sq2 = toRC(sq2);
    return Math.abs(sq1.r - sq2.r) + Math.abs(sq1.c - sq2.c);
  }

  function estimateOtherGeneral(myGeneral, game) {
    var result = -1;
    var resEvil = 0;
    game.grid.forEach((tile, sq) => {
      if (tile.color !== TILE_FOG) return;
      var evil = getEvil(sq, game);
      if (result === -1 || evil > resEvil ||
        (evil === resEvil &&
          manhattan(sq, myGeneral) > manhattan(result, myGeneral))) {
            result = sq;
            resEvil = evil;
      }
    });
    console.log('resEvil', resEvil);
    return result;
  }

  function fillImportance(game) {
    var general = game.generals[game.me];
    var otherGeneral = game.generals[game.me ^ 1];
    if (otherGeneral === -1) {
      otherGeneral = estimateOtherGeneral(general, game);
      var aggression = getEvil(otherGeneral, game) + 1;
    } else {
      aggression = 10;
    }
    console.log('estimating other=', otherGeneral);
    var myDists = getDistancesFrom(general, game.grid);
    var score1 = myDists.map(dst => dst);
    if (otherGeneral !== -1) {
      var theirDists = getDistancesFrom(otherGeneral, game.grid);
      var score2 = theirDists.map(dst => -dst);
    } else {
      var score2 = game.grid.map(() => 0);
    }
    game.importance = score1.map((score, idx) => score + aggression * score2[idx]);
  }

  function getTransportBonus(m) {
    var needed = 1000;
    if (m.sum < needed) {
      return m.sum;
    } else {
      return needed + (m.sum - needed) / 10;
    }
  }

  const ATTACK_BONUS = 30;
  const EXPLORE_BONUS = 15;
  const VISION_BONUS = 1;

  function newVision(sq, game) {
    var fog_tiles = neighbors(sq).filter(nsq => game.grid[nsq].color === TILE_FOG);
    return fog_tiles.length;
  }

  function evalHeuristic(m, game) {
    window.game = game;
    var score = 0;
    if (m.type === ATTACK) {
      if (m.to.army < m.from.army - 1) {
        // successful attack
        score += ATTACK_BONUS;
        score += VISION_BONUS * newVision(m.b, game);
      }
    } else if (m.type === EXPLORE) {
      score += EXPLORE_BONUS;
      score += VISION_BONUS * newVision(m.b, game);
    }

    var ttbonus = getTransportBonus(m) * (game.importance[m.b] - game.importance[m.a]);
    score += getTransportBonus(m) * (game.importance[m.b] - game.importance[m.a]);

    return score;
  }


  function step(game, ctrl) {
    console.log('step', game);
    w = game.width; h = game.height;
    game.them = game.me ^ 1;
    var moves = getValidMoves(game);
    fillImportance(game);
    moves.forEach((move) => {
      move.score = evalHeuristic(move, game);
    });
    moves.sort((a, b) => b.score - a.score);

    var bestMove = moves[0];
    console.log('best move:', bestMove);
    if (bestMove) {
      ctrl.move(bestMove.a, bestMove.b);
    }
  }

  stevenbotcnt++;
  var that = {
    name: 'stevenbot'+stevenbotcnt,
    step: step,
  };

  return that;
});

window.StevenBot = StevenBot;
