$(document).ready(function() {
    var fleet = [{name: "Carrier",
          size: 5},
         {name: "Battleship",
          size: 4},
         {name: "Cruiser",
          size: 3},
         {name: "Submarine",
          size: 3},
         {name: "Destroyer",
          size: 2}];
    var game = new SuperBattleship({
        boardSize: 50,
        missAge: 50,
        turnLimit: 1000,
        fleet: fleet
    });
    var cli_player_one = new CLIPlayer(game, $('#p1_cli_input'), $('#p1_cli_output'), $('#p1_view'), true, 600, fleet);
    var ai_player_two = new DumbAI(game, false, 0);
    game.startGame();
});
