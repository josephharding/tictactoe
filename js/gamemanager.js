
/* how long the ai delays after the player's turn before taking its turn */
GameManager.prototype.CPU_TURN_DELAY = 800;

/*
constants representing the different codes a spot can be marked with
*/
GameManager.prototype.SPOT_UNCLAIMED = 0;
GameManager.prototype.SPOT_CLAIMED_CPU = -1;
GameManager.prototype.SPOT_CLAIMED_HUMAN = 1;

/*
constants representing the game over states that are possible in tictactoe
*/
GameManager.prototype.GAME_OVER_WIN_HUMAN = 3;
GameManager.prototype.GAME_OVER_WIN_CPU = 2;
GameManager.prototype.GAME_OVER_DRAW = 1;

/*
constants representing the character to use as the game board token for the players
*/
GameManager.prototype.TOKEN_HUMAN = "X";
GameManager.prototype.TOKEN_CPU = "O";
GameManager.prototype.TOKEN_EMPTY = " ";

/* manages all the logic for the game board */
GameManager.prototype.mBoardManager;

/* manages the logic for executing winning moves in tictactoe */
GameManager.prototype.mAIManager;

/* true if the human player may make a move */
GameManager.prototype.mHumanTurn;

/* true if we have reached the end of the game */
GameManager.prototype.mGameOver;

function GameManager() {

    this.mBoardManager = new BoardManager();
    this.mAIManager = new AIManager(this.mBoardManager);
    
    // start the game automatically
    this.startGame();
}

/*
initialize a fresh game state, allow the computer to make the first move
and refresh the drawing of the board
*/
GameManager.prototype.startGame = function() {
    this.mGameOver = false;

    this.mBoardManager.setAllSpots(this.SPOT_UNCLAIMED);
    this.mAIManager.resetMoveHistory();
    
    // the computer goes first
    this.mAIManager.computerGo();

    // refresh the draw view
    this.refreshDraw();

    this.mHumanTurn = true;
}

/*
Execute a turn of tic tac toe on behalf of the human player

@param int i - the i index on the tictactoe grid
@param int j - the j index on the tictactoe grid

return boolean result - true if the move is a valid
*/
GameManager.prototype.humanGo = function(i, j) {
    var result = false;
    var index = this.mBoardManager.gridCoordsToStateIndex(i, j);
    if(this.mBoardManager.isBoardIndexCode(index, this.SPOT_UNCLAIMED)) {
        this.mBoardManager.setIndex(index, this.SPOT_CLAIMED_HUMAN);
        this.mAIManager.registerMove(index);
        result = true;
    }
    return result;
};

/*
Redraws the game board
*/
GameManager.prototype.refreshDraw = function() {
    var classScope = this;
    $("#gameBoard td").each(function() {
            var i = this.cellIndex;
            var j = this.parentNode.rowIndex;
            var character;
            var index = classScope.mBoardManager.gridCoordsToStateIndex(i, j);
            switch(classScope.mBoardManager.getCode(index)) {
                case GameManager.prototype.SPOT_CLAIMED_HUMAN:
                    character = GameManager.prototype.TOKEN_HUMAN;
                    break;
                case GameManager.prototype.SPOT_CLAIMED_CPU:
                    character = GameManager.prototype.TOKEN_CPU;
                    break;
                default:
                    character = GameManager.prototype.TOKEN_EMPTY;
                    break;
            }
            $(this).text(character);
    });

};

/*
Check to see if a game over condition has been met

return int result - the game over state, if any, else 0
*/
GameManager.prototype.checkWin = function() {
    var result = 0;
    var winningCombs = this.mBoardManager.getAllRowsColsDiags();
    var len = winningCombs.length;
    for(var i = 0; i < len; i++) {
        var sum = 0;
        var absMax = 0;
        var innerLen = winningCombs[i].length;
        for(var j = 0; j < innerLen; j++) {
            sum += this.mBoardManager.getCode(winningCombs[i][j]);
            
            // if the absolute value of the sum has not increased, break out
            if(Math.abs(sum) > absMax) {
                absMax = Math.abs(sum);
            } else {
                break
            }
        }
        
        // check to see if we reached a winning sum
        if(sum == BoardManager.prototype.BOARD_DIM) {
            result = this.GAME_OVER_WIN_HUMAN;
            break;
        } else if(sum == -BoardManager.prototype.BOARD_DIM) {
            result = this.GAME_OVER_WIN_CPU;
            break;
        }
    }

    // if we have filled all the board units and there is no winner, call a draw
    if(result == 0 && this.mAIManager.getMoveCount() == BoardManager.prototype.BOARD_DIM * BoardManager.prototype.BOARD_DIM) {
        result = this.GAME_OVER_DRAW;
    }

    return result;
};

/*
Given a game over state, handle messaging to the user the result of the match

@param int gameOverState - the state of the game to handle
*/
GameManager.prototype.handleGameOver = function(gameOverState) {
    var message;
    switch(gameOverState) {
        case this.GAME_OVER_WIN_HUMAN:
            $("#humanWin").show();
            break;
        case this.GAME_OVER_WIN_CPU:
            $("#cpuWin").show();
            break;
        default:
            $("#draw").show();
            break;
    }

    this.mGameOver = true;
};

/*
Wrapper function around checking the game over state and then 
acting on it if necessary
*/
GameManager.prototype.checkGameState = function() {
    // check if the game has been won
    var winResult = this.checkWin();
    if(winResult > 0) {
        // handle messaging the game result
        this.handleGameOver(winResult);
    }
};

/*
Handles the user clicking on the "Play Again" button
*/
GameManager.prototype.handlePlayAgainClick = function() {
    $(".gameOverMessage").hide();
    this.startGame();
};

/*
Handles the user clicking on a board spot

@param int i - a column index
@param int j - a row index
*/
GameManager.prototype.handleBoardUnitClick = function(i, j) {
    if(!this.mGameOver) {
        // if the player selected a valid move then continue, else do nothing
        if(this.mHumanTurn && this.humanGo(i, j)) {
            this.mHumanTurn = false;
            
            // the player may have won, check
            this.checkGameState();
            
            if(!this.mGameOver) {
                // let the computer go after a delay
                var thisScope = this;
                setTimeout(function() {
                    thisScope.mAIManager.computerGo();
                    thisScope.checkGameState();
                    thisScope.refreshDraw();
                    thisScope.mHumanTurn = true;
                }, this.CPU_TURN_DELAY);
            }

            // refresh the view of the game board
            this.refreshDraw();
        }
    }
};
