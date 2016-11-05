var CLIPlayer = function(game, cli_input, cli_output, map, is_player_one,
    boardEdge) {

    if (is_player_one) {
        var key = game.registerPlayerOne();
    } else {
        key = game.registerPlayerTwo();
    }


    cli_output = $(cli_output);
    cli_input = $(cli_input);
    map = $(map);
    ship = null;

    var eventLogHandler = function(e) {
        var cli_msg = $('<div class="cli_msg"></div>');

        switch (e.event_type) {
            case SBConstants.TURN_CHANGE_EVENT:
                if (e.who == SBConstants.PLAYER_ONE) {
                    cli_msg.text("Player one's turn (count = " + game.getTurnCount() + ")");
                } else {
                    cli_msg.text("Player two's turn (count = " + game.getTurnCount() + ")");
                }
                break;
            case SBConstants.MISS_EVENT:
                cli_msg.text("Miss event at (" + e.x + ", " + e.y + ")");
                break;
            case SBConstants.HIT_EVENT:
                cli_msg.text("Hit event at (" + e.x + ", " + e.y + ")");
                break;
            case SBConstants.SHIP_SUNK_EVENT:
                var ship = e.ship;
                if (ship.isMine(key)) {
                    var pos = ship.getPosition(key);
                    cli_msg.text("Foe sunk your " + ship.getName() + " at (" + pos.x + ", " + pos.y + ")");
                } else {
                    var pos = ship.getPosition(null); // This works because ship is dead.
                    cli_msg.text("You sunk their " + ship.getName() + " at (" + pos.x + ", " + pos.y + ")");
                }
                break;
            case SBConstants.GAME_OVER_EVENT:
                if (is_player_one && e.winner == SBConstants.PLAYER_ONE) {
                    cli_msg.text("Game over. You win!");
                } else {
                    cli_msg.text("Game over. You lose!");
                }
                break;
        }
        cli_output.prepend(cli_msg);
    };

    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT,
        eventLogHandler);
    game.registerEventHandler(SBConstants.MISS_EVENT,
        eventLogHandler);
    game.registerEventHandler(SBConstants.HIT_EVENT,
        eventLogHandler);
    game.registerEventHandler(SBConstants.SHIP_SUNK_EVENT,
        eventLogHandler);
    game.registerEventHandler(SBConstants.GAME_OVER_EVENT,
        eventLogHandler);


    var mapDrawHandler = function(e) {
        var cellEdge = boardEdge / game.getBoardSize();
        map.empty();
        map.css({width: boardEdge+'px', height: boardEdge+'px'});

        for (var y = 0; y < game.getBoardSize(); y++) {
            for (var x = 0; x < game.getBoardSize(); x++) {
                var cell = $('<div></div>');
                cell.css({width: cellEdge+'px', height: cellEdge+'px'});
                cell.addClass('cell');
                cell.data({x: x, y: y});
                var sqr = game.queryLocation(key, x, y);
                switch (sqr.type) {
                    case "miss":
                        cell.addClass('miss');
                        break;
                    case "p1":
                        if (sqr.state == SBConstants.OK) {
                            if (sqr.segment == 0){
                                cell.addClass('forecastle');
                            } else {
                                cell.addClass('p1');
                            }
                        } else {
                            cell.addClass('hit');
                        }
                        break;
                    case "p2":
                        if (sqr.state == SBConstants.OK) {
                            if (sqr.segment == 0){
                                cell.addClass('forecastle');
                            } else {
                                cell.addClass('p2');
                            }
                        } else {
                            cell.addClass('hit');
                        }
                        break;
                    case "empty":
                        cell.addClass('empty');
                        break;
                    case "invisible":
                        cell.addClass('invisible');
                        break;
                }
                map.append(cell);
            }
        }
    };

    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT, mapDrawHandler);
    game.registerEventHandler(SBConstants.GAME_OVER_EVENT, mapDrawHandler);

    map.on('click', '.cell', function(e) {
        e.stopPropagation();
        var x = $(this).data('x');
        var y = $(this).data('y');
        var sqr = game.queryLocation(key, x, y);
        if (sqr.type == 'p1') {
            ship = sqr.ship;
        } else {
            game.shootAt(key, x, y);
        }
    });
    $(document).on('keypress', function(e) {
        console.log(e.keyCode);
        if (ship){
            switch (e.keyCode) {
                case 102:
                    game.moveShipForward(key, ship);
                    break;
                case 98:
                    game.moveShipBackward(key, ship);
                    break;
                case 114:
                    game.rotateShipCW(key, ship);
                    break;
                case 108:
                    game.rotateShipCCW(key, ship);
                    break;
            }
        }
    });
};
