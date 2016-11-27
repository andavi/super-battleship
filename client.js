var CLIPlayer = function(game, cli_input, cli_output, map, is_player_one,
    boardEdge, fleet) {

    var key;
    if (is_player_one) {
        key = game.registerPlayerOne();
    } else {
        key = game.registerPlayerTwo();
    }

    cli_output = $(cli_output);
    cli_input = $(cli_input);
    map = $(map);
    var ship = null;

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
                cli_msg.addClass('bold');
                break;
            case SBConstants.SHIP_SUNK_EVENT:
                var pos;
                var ship = e.ship;
                if (ship.isMine(key)) {
                    pos = ship.getPosition(key);
                    cli_msg.text("Foe sunk your " + ship.getName() + " at (" + pos.x + ", " + pos.y + ")");
                } else {
                    pos = ship.getPosition(null); // This works because ship is dead.
                    cli_msg.text("You sunk their " + ship.getName() + " at (" + pos.x + ", " + pos.y + ")");
                    cli_msg.addClass('bold');
                }
                break;
            case SBConstants.GAME_OVER_EVENT:
                if (is_player_one && e.winner == SBConstants.PLAYER_ONE) {
                    cli_msg.text("Game over. You win!");
                } else {
                    cli_msg.text("Game over. You lose!");
                }
                cli_msg.addClass('bold');
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

    function getForecastleColor(sqr){
        var color;
        if (sqr.type === 'p1') {
            if (sqr.state == SBConstants.OK) {
                if (sqr.ship == ship){
                    color = 'white';
                } else {
                    color = 'gray';
                }
            } else {
                color = 'red';
            }

        } else if (sqr.type === 'p2' && sqr.state == SBConstants.OK){
            color = 'darkslategray';
        } else {
            color = 'darkred';
        }
        return color;
    }

    function getDirectionEnemyShip(sqr, x, y) {
        var shipName = sqr.ship.getName();
        var queries = [];
        var table = {0: 'south', 1: 'north', 2: 'west', 3: 'east'};
        queries.push(game.queryLocation(key, x, y-1)); //south
        queries.push(game.queryLocation(key, x, y+1)); //north
        queries.push(game.queryLocation(key, x+1, y)); //west
        queries.push(game.queryLocation(key, x-1, y)); //east
        for (var i=0; i < queries.length; i++){
            if (queries[i].type==='p2' && queries[i].ship.getName()===shipName){
                return table[i];
            }
        }
        return 'unknown';
    }

    function createForecastle(sqr, x, y, cell, cellEdge) {
        var direction;
        if (sqr.type === 'p1') {
            direction = sqr.ship.getPosition(key).direction;
        } else {
            direction = getDirectionEnemyShip(sqr, x, y);
        }
        var forecastle = $('<div></div>');
        var forecastleColor = getForecastleColor(sqr);
        var side = cellEdge/2 + 'px solid transparent';
        var base = cellEdge + 'px solid ' + forecastleColor;
        forecastle.css({width: '0px', height: '0px'});
        switch(direction) {
            case('north'):
                forecastle.css('border-bottom', base);
                forecastle.css('border-left', side);
                forecastle.css('border-right', side);
                break;
            case('south'):
                forecastle.css('border-top', base);
                forecastle.css('border-left', side);
                forecastle.css('border-right', side);
                break;
            case('east'):
                forecastle.css('border-bottom', side);
                forecastle.css('border-left', base);
                forecastle.css('border-top', side);
                break;
            case('west'):
                forecastle.css('border-bottom', side);
                forecastle.css('border-right', base);
                forecastle.css('border-top', side);
                break;
            case('unknown'):
                forecastle.css({width: cellEdge+'px', height: cellEdge+'px'});
                forecastle.css('background-color', forecastleColor);
                break;
        }
        cell.append(forecastle);
        return cell;
    }

    function isVisible(x, y) {
        for (var i=0; i<fleet.length; i++){
            shipName = fleet[i].name;
            shipObject = game.getShipByName(key, shipName);
            if (shipObject.canSee(key, x, y)){
                return true;
            }
        }
        return false;
    }

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
                        if (sqr.segment === 0){
                            cell.addClass('empty');
                            cell = createForecastle(sqr, x, y, cell, cellEdge);
                        } else {
                            if (sqr.state == SBConstants.OK) {
                                if (sqr.ship == ship) {
                                    cell.addClass('highlighted');
                                } else {
                                    cell.addClass('p1');
                                }
                            } else {
                                cell.addClass('damaged');
                            }
                        }
                        break;
                    case "p2":
                        if (sqr.segment === 0){
                            if (isVisible(x, y)){
                                cell.addClass('empty');
                            } else {
                                cell.addClass('invisible');
                            }
                            cell = createForecastle(sqr, x, y, cell, cellEdge);
                        } else {
                            if (sqr.state == SBConstants.OK) {
                                cell.addClass('p2');
                            } else {
                                cell.addClass('hit');
                            }
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
            ship = sqr.ship;
            mapDrawHandler(e);
        } else {
            game.shootAt(key, x, y);
        }
    });

    $(document).on('keypress', function(e) {
        if (ship){
            switch (e.charCode) {
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
