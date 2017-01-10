var DummyAI = (function() {
  // called every step of the game.
  // game: an object representing the game state
  // ctrl: an object used to submit moves
  // call ctrl.move(sq1, sq2)
  function step(game, ctrl) {
    console.log('stepping. gamestate = ', game);
    ctrl.move(game.generals[game.me], game.generals[game.me] + 1);
  }
  var that = {
    name: 'DummyAI',
    step: step,
  };

  return that;
}());


window.DummyAI = DummyAI;
