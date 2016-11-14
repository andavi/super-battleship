var DumbAI = function(game, is_player_one, delay) {
    var key;
    if (is_player_one) {
        key = game.registerPlayerOne();
    } else {
        key = game.registerPlayerTwo();
    }

    var turn_delay = 0;
    if (delay !== undefined) {
        turn_delay = delay;
    }

    last_hit = {};

    var eventHandler = function(e) {
        switch (e.event_type) {
            case SBConstants.TURN_CHANGE_EVENT:
                if (((e.who == SBConstants.PLAYER_ONE) && is_player_one) ||
                    ((e.who == SBConstants.PLAYER_TWO) && (!is_player_one))) {


                    var target_x;
                    var target_y;
                    var foundShip = false;

                        for (y=0; y < game.getBoardSize() && !foundShip; y++){
                            for (x=0; x < game.getBoardSize(); x++){
                                var sqr = game.queryLocation(key, x, y);

                                if ((sqr.type=='p1' || sqr.type=='p2')&& sqr.state==SBConstants.OK && !sqr.ship.isMine(key)){
                                    console.log('see one at ' + x +' '+ y);
                                    foundShip = true;
                                    target_x = x;
                                    target_y = y;
                                    break;
                                }
                            }
                        }

                        if (!foundShip)  {
                             target_x = Math.floor(Math.random() * game.getBoardSize());
                             target_y = Math.floor(Math.random() * game.getBoardSize());
                             console.log('randoms: ' + x +' '+ y);
                        }

                        setTimeout(function() {
                            console.log('shot at: ' + x+ ' ' + y);
                            game.shootAt(key, target_x, target_y);
                        }, turn_delay);



                }
        }
    };

    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT,
        eventHandler);

    this.giveUpKey = function() {
        return key;
    };

};
