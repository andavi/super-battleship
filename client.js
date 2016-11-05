$(document).ready(function() {
    var game = new SuperBattleship({
        boardSize: 20,
        missAge: 50
    });
    var cli_player_one = new CLIPlayer(game, $('#p1_cli_input'),
        $('#p1_cli_output'), $('#p1_view'), true);
    var ai_player_two = new DumbAI(game, false);
    game.startGame();
});
