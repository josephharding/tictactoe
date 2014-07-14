
GameManager.prototype.SPOT_UNCLAIMED = 0;
GameManager.prototype.SPOT_CLAIMED_CPU = -1;
GameManager.prototype.SPOT_CLAIMED_HUMAN = 1;

GameManager.prototype.GAME_OVER_WIN_HUMAN = 3;
GameManager.prototype.GAME_OVER_WIN_CPU = 2;
GameManager.prototype.GAME_OVER_DRAW = 1;

GameManager.prototype.mBoardManager;
GameManager.prototype.mAIManager;

GameManager.prototype.mGameOver;

function GameManager() {

    this.mBoardManager = new BoardManager();
    this.mAIManager = new AIManager(this.mBoardManager);
    
    // start the game automatically for now
    this.startGame();
}

GameManager.prototype.startGame = function() {
    this.mGameOver = false;

    this.mBoardManager.setAllSpots(this.SPOT_UNCLAIMED);
    this.mAIManager.resetMoveHistory();
    
    // the computer goes first
    this.mAIManager.computerGo();

    // refresh the draw view
    this.refreshDraw();
}

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

GameManager.prototype.refreshDraw = function() {
    var classScope = this;
    $("#gameBoard td").each(function() {
            var i = this.cellIndex;
            var j = this.parentNode.rowIndex;
            var character;
            var index = classScope.mBoardManager.gridCoordsToStateIndex(i, j);
            switch(classScope.mBoardManager.getCode(index)) {
                case classScope.SPOT_CLAIMED_HUMAN:
                    character = "X";
                    break;
                case classScope.SPOT_CLAIMED_CPU:
                    character = "O";
                    break;
                default:
                    character = " ";
                    break;
            }
            $(this).text(character);
    });

};

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

GameManager.prototype.handleGameOver = function(winResult) {
    var message;
    switch(winResult) {
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

GameManager.prototype.checkGameState = function() {
    // check if the game has been won
    var winResult = this.checkWin();
    if(winResult > 0) {
        // handle messaging the game result
        this.handleGameOver(winResult);
    }
};

GameManager.prototype.handlePlayAgainClick = function() {
    $(".gameOverMessage").hide();
    this.startGame();
};

GameManager.prototype.handleBoardUnitClick = function(i, j) {
    if(!this.mGameOver) {
        // if the player selected a valid move then continue, else do nothing
        if(this.humanGo(i, j)) {
            
            // the player may have won, check
            this.checkGameState();
            
            if(!this.mGameOver) {
                // let the computer go
                this.mAIManager.computerGo();
            
                // the computer may have won, check
                this.checkGameState();
            }

            // refresh the view of the game board
            this.refreshDraw();
        }
    }
};
