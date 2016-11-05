var CLIPlayer = function(game, cli_input, cli_output, map, is_player_one) {

    if (is_player_one) {
        var key = game.registerPlayerOne();
    } else {
        key = game.registerPlayerTwo();
    }


    cli_output = $(cli_output);
    cli_input = $(cli_input);
    map = $(map);

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


    var mapDrawHandler = function(e) {
        var boardEdge = 600;
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
                                cell.addClass('front');
                            } else {
                                cell.addClass('ship');
                            }
                        } else {
                            cell.addClass('hit');
                        }
                        break;
                    case "p2":
                        if (sqr.state == SBConstants.OK) {
                            if (sqr.segment == 0){
                                cell.addClass('front');
                            } else {
                                cell.addClass('ship');
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
        var x = $(this).data('x');
        var y = $(this).data('y');
        var sqr = game.queryLocation(key, x, y);
        if (sqr.type == 'p1') {
            var direction = sqr.ship.getPosition(key).direction;
             game.moveShipForward(key, sqr.ship);
            // map.on('keypress', function(e) {
            //     if (e.keyCode == 38) {
            //         e.preventDefault();
            //         game.moveShipForward(key, sqr.ship);
            //     }
            // })


        } else {
            game.shootAt(key, x, y);
        }
    })

    cli_input.on('keypress', function(e) {
        if (e.keyCode == 13) {
            var cmd_str = $(this).val();
            //	    $(this).val('');
            var cmd_array = cmd_str.split(' ');
            if (cmd_array[0] == "shootAt") {
                var x = parseInt(cmd_array[1]);
                var y = parseInt(cmd_array[2]);
                game.shootAt(key, x, y);
            } else if (cmd_array[0] == "fleetInfo") {
                var fleet = game.getFleetByKey(key);
                var fleet_ul = $('<ul></ul>');
                fleet.forEach(function(s) {
                    var ship_str = "<li>" + s.getName();
                    var ship_pos = s.getPosition(key);
                    ship_str += "<ul>";
                    ship_str += "<li>Position: " + ship_pos.x + ", " + ship_pos.y + "</li>";
                    ship_str += "<li>Direction: " + ship_pos.direction + "</li>";
                    ship_str += "<li>Size: " + s.getSize() + "</li>";
                    if (s.getStatus() == SBConstants.ALIVE) {
                        ship_str += "<li>Status: ALIVE</li>";
                    } else {
                        ship_str += "<li>Status: DEAD</li>";
                    }
                    ship_str += "</ul></li>";
                    fleet_ul.append(ship_str);
                })
                cli_output.prepend($('<div class="cli_msg"></div>').append(fleet_ul));
            } else if (cmd_array[0] == "moveForward") {
                var ship_name = cmd_array[1];
                var ship = game.getShipByName(key, ship_name);
                if (ship != null) {
                    game.moveShipForward(key, ship);
                }
            } else if (cmd_array[0] == "moveBackward") {
                var ship_name = cmd_array[1];
                var ship = game.getShipByName(key, ship_name);
                if (ship != null) {
                    game.moveShipBackward(key, ship);
                }
            } else if (cmd_array[0] == "rotateCW") {
                var ship_name = cmd_array[1];
                var ship = game.getShipByName(key, ship_name);
                if (ship != null) {
                    game.rotateShipCW(key, ship);
                }
            } else if (cmd_array[0] == "rotateCCW") {
                var ship_name = cmd_array[1];
                var ship = game.getShipByName(key, ship_name);
                if (ship != null) {
                    game.rotateShipCCW(key, ship);
                }
            }
        }
    });
};
