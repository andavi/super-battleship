$(document).ready(function() {
    var game = new SuperBattleship({
        boardSize: 30,
        missAge: 100,
        turnLimit: 1000
    });
    var cli_player_one = new CLIPlayer(game, $('#p1_cli_input'), $('#p1_cli_output'), $('#p1_view'), true, 600);
    var ai_player_two = new DumbAI(game, false, 100);
    game.startGame();
});
