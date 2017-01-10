var DummyAI = (function() {
  // called every step of the game.
  // game: an object representing the game state
  // ctrl: an object used to submit moves
  // call ctrl.move(sq1, sq2)

  // -3: fogged empty square
  // -4: fogged mountain
  // -2: unfogged mountain
  // -1: uncaptured stuff
  // 0: your stuff

  var generals = null;

  // 1) find any shortest path between square with >1 army and square not occupied with 0 army count
  // 2) move that square in that direction
  function step(game, ctrl) {
    console.log('stepping. gamestate = ', game);
    if (generals == null) {
      generals = game.generals;
    }
    game.generals.forEach(function(x, i) {
      if (x != -1) {
        generals[i] = x;
      }
    });
    var best_path = null;
    for (var i = 0; i < game.grid.length; ++i) {
      if (game.grid[i].color == -1 && game.grid[i].army == 0) {
        var path = getShortestPath(i, game);
        if (path !== null && (best_path == null || path.length < best_path.length)) {
          best_path = path;
        }
      }
    }
    if (best_path != null) {
      ctrl.move(best_path[0], best_path[1]);
    }
  }

  // gets the indices of the neighbors of an index x
  function getNeighbors(x, game) {
    var ans = [];
    if (x % game.width > 0) {
      ans.push(x - 1);
    }
    if (x % game.width < game.width - 1) {
      ans.push(x + 1);
    }
    if (x - game.width > 0) {
      ans.push(x - game.width);
    }
    if (x + game.width < game.grid.length) {
      ans.push(x + game.width);
    }
    return ans;
  }

  // given the index of a square, get shortest path from start to a square s
  // such that the the square has >= 2 army on it.
  function getShortestPath(start, game) {
    var path = [start];
    var prev = {};
    prev[start] = null;
    var queue = [start];
    while (queue.length > 0) {
      var cur = queue.shift();
      if (game.grid[cur].color == game.me && game.grid[cur].army > 1) {
        ans = [cur];
        while (prev[ans[ans.length - 1]] != null) {
          ans.push(prev[ans[ans.length - 1]]);
        }
        return ans;
      }
      getNeighbors(cur, game).forEach(function (neigh) {
        if (game.grid[neigh].color == game.me && !(neigh in prev)) {
          queue.push(neigh);
          prev[neigh] = cur;
        }
      });
    }
    return null;
  }

  var that = {
    name: 'DummyAI',
    step: step,
  };

  return that;
}());


window.DummyAI = DummyAI;
