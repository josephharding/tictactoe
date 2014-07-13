


// number of units per board dimension
GameManager.prototype.BOARD_DIM = 3;

GameManager.prototype.UNIT_UNCLAIMED = 0;
GameManager.prototype.UNIT_COMP_CLAIMED = -1;
GameManager.prototype.UNIT_PLAYER_CLAIMED = 1;

GameManager.prototype.boardState;
GameManager.prototype.winningCombs;
GameManager.prototype.moveCount;
GameManager.prototype.gameOver;
GameManager.prototype.moveHistory;

GameManager.prototype.testing_alt;

function GameManager() {
    // calculate the winning combinations required for the game to be over
    this.calculateAndSetWinningCombs();
    
    // start the game automatically for now
    this.startGame();
}

GameManager.prototype.startGame = function() {
    this.moveCount = 0;
    this.testing_alt = 1;
    this.gameOver = false;

    // init an empty board
    this.boardState = new Array(this.BOARD_DIM * this.BOARD_DIM);
    for(var i = 0; i < this.boardState.length; i++) {
        this.boardState[i] = this.UNIT_UNCLAIMED;
    }

    this.moveHistory = new Array(this.BOARD_DIM * this.BOARD_DIM);

    // the computer goes first
    this.computerGo();

    // refresh the draw view
    this.refreshDraw();
}

GameManager.prototype.calculateAndSetWinningCombs = function() {
    this.winningCombs = new Array();

    var bottomLeftDiag = new Array();
    var bottomRightDiag = new Array();

    // add all rows and cols to winnings combs
    for(var i = 0; i < this.BOARD_DIM; i++) {
        var currentRow = new Array();
        var currentCol = new Array();
        for(var j = 0; j < this.BOARD_DIM; j++) {
            currentRow.push(j + (i * this.BOARD_DIM));
            currentCol.push(i + (j * this.BOARD_DIM));
        }
        this.winningCombs.push(currentRow);
        this.winningCombs.push(currentCol);

        bottomLeftDiag.push(i * (this.BOARD_DIM + 1));
        bottomRightDiag.push((i * 2) + (this.BOARD_DIM - 1));
    }

    // add the diagonal winnings combs
    this.winningCombs.push(bottomLeftDiag);
    this.winningCombs.push(bottomRightDiag);

};

GameManager.prototype.computerGo = function() {
    var result;

    // 1st round
    // always take a corner
    if(this.moveCount == 0) {
        result = this.computerGetAvailableCornerIndex();
    // 2nd round
    // always take another corner, unless the player has taken an immediately adjacent position to your first move
    // if that happened, then take the center
    } else if(this.moveCount == 2) {
        if(this.moveHistory[1] == 4) {
            result = 1;
        } else if(this.lastPlayerClaimWasAjacentToComputerFirstClaim()) {
            result = 4;
        } else { 
            result = this.computerGetAvailableCornerIndex();
        }
    // 3rd and 5th round
    // being to attempt to make a winning move, if that doesn't work take another corner
    } else if(this.moveCount == 4 || this.moveCount == 6) {
        result = this.computerGetWinningIndex();
        if(result == -1) {
            result = this.computerGetAvailableCornerIndex();
        }
    // 7th round
    // worst case scenario win
    } else if(this.moveCount == 8) {
        result = this.computerGetWinningIndex();
    }

    this.boardState[result] = this.UNIT_COMP_CLAIMED;
    this.moveHistory[this.moveCount] = result;

    this.moveCount++;
};

GameManager.prototype.lastPlayerClaimWasAjacentToComputerFirstClaim = function() {
    var result = false;
    if(this.moveHistory[0] == 0 && (this.moveHistory[1] == 1 || this.moveHistory[1] == 3)) {
        result = true;
    } else if(this.moveHistory[0] == 2 && (this.moveHistory[1] == 1 || this.moveHistory[1] == 5)) {
        result = true;
    } else if(this.moveHistory[0] == 6 && (this.moveHistory[1] == 7 || this.moveHistory[1] == 3)) {
        result = true;
    } else if(this.moveHistory[0] == 8 && (this.moveHistory[1] == 7 || this.moveHistory[1] == 5)) {
        result = true;
    }
    return result;
};

GameManager.prototype.computerGetWinningIndex = function() {
    var result = -1;
    var len = this.winningCombs.length;
    for(var i = 0; i < len; i++) {
        var innerLen = this.winningCombs[i].length;
        var emptyIndex = -1;
        var computerCount = 0;
        for(var j = 0; j < innerLen; j++) {
            var code = this.boardState[this.winningCombs[i][j]];
            if(code == this.UNIT_COMP_CLAIMED) {
                computerCount++;
            } else if(code == this.UNIT_UNCLAIMED) {
                emptyIndex = this.winningCombs[i][j];
            }
        }
        if(emptyIndex != -1 && computerCount == this.BOARD_DIM - 1) {
            result = emptyIndex;
            break;
        }
    }
    return result;
};

GameManager.prototype.computerGetAvailableCornerIndex = function() {
    var result = -1;
    
    var topLeft = 0;
    var topRight = this.BOARD_DIM - 1;
    var bottomLeft = (this.BOARD_DIM * this.BOARD_DIM) - this.BOARD_DIM;
    var bottomRight = (this.BOARD_DIM * this.BOARD_DIM) - 1;

    var freeCornerArray = new Array();
    if(this.isBoardIndexFree(topLeft)) {
        freeCornerArray.push({"index" : topLeft, "rating" : this.getCornerRating(topLeft)});
    }
    if(this.isBoardIndexFree(topRight)) {
        freeCornerArray.push({"index" : topRight, "rating" : this.getCornerRating(topRight)});
    }
    if(this.isBoardIndexFree(bottomLeft)) {
        freeCornerArray.push({"index" : bottomLeft, "rating" : this.getCornerRating(bottomLeft)});
    }
    if(this.isBoardIndexFree(bottomRight)) { 
        freeCornerArray.push({"index" : bottomRight, "rating" : this.getCornerRating(bottomRight)});
    }
    
    // sort the corner options by their rating
    freeCornerArray.sort(function (a, b) {
        if (a.rating < b.rating)
            return 1;
        if (a.rating > b.rating)
            return -1;
        return 0;
    });

    if(freeCornerArray.length > 0) {
        result = freeCornerArray[0].index
    }

    return result;
};

GameManager.prototype.getCornerRating = function(index) {
    var result = 0;
    if(index == 0) {
        if(this.boardState[1] == this.UNIT_UNCLAIMED) {
            result++;
        }
        if(this.boardState[3] == this.UNIT_UNCLAIMED) {
            result++;
        }
    } else if(index == 2) {
        if(this.boardState[1] == this.UNIT_UNCLAIMED) {
            result++;
        }
        if(this.boardState[5] == this.UNIT_UNCLAIMED) {
            result++;
        }
    } else if(index == 6) {
        if(this.boardState[3] == this.UNIT_UNCLAIMED) {
            result++;
        }
        if(this.boardState[7] == this.UNIT_UNCLAIMED) {
            result++;
        }
    } else if(index == 8) {
        if(this.boardState[5] == this.UNIT_UNCLAIMED) {
            result++;
        }
        if(this.boardState[7] == this.UNIT_UNCLAIMED) {
            result++;
        }
    }
    return result;
};

GameManager.prototype.isBoardIndexFree = function(index) {
    return this.boardState[index] == this.UNIT_UNCLAIMED;
};

GameManager.prototype.playerGo = function(index) {
    var result = false;
    if(this.isBoardIndexFree(index)) {
        this.boardState[index] = this.UNIT_PLAYER_CLAIMED;
        this.moveHistory[this.moveCount] = index;
        this.moveCount++;
        result = true;
    }
    return result;
};

GameManager.prototype.gridCoordsToStateIndex = function(i, j) {
    return i + (this.BOARD_DIM * j);
};

GameManager.prototype.refreshDraw = function() {
    var classScope = this;
    $("#gameBoard td").each(function() {
            var i = this.cellIndex;
            var j = this.parentNode.rowIndex;
            var character;
            var val = classScope.boardState[classScope.gridCoordsToStateIndex(i, j)];
            switch(val) {
                case classScope.UNIT_PLAYER_CLAIMED:
                    character = "X";
                    break;
                case classScope.UNIT_COMP_CLAIMED:
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
    var len = this.winningCombs.length;
    for(var i = 0; i < len; i++) {
        var sum = 0;
        var absMax = 0;
        var innerLen = this.winningCombs[i].length;
        for(var j = 0; j < innerLen; j++) {
            sum += this.boardState[this.winningCombs[i][j]];
            
            // if the absolute value of the sum has not increased, break out
            if(Math.abs(sum) > absMax) {
                absMax = Math.abs(sum);
            } else {
                break
            }
        }
        
        // check to see if we reached a winning sum
        if(sum == this.BOARD_DIM) {
            result = 2;
            break;
        } else if(sum == -this.BOARD_DIM) {
            result = 3;
            break;
        }
    }

    // if we have filled all the board units and there is no winner, call a draw
    if(result == 0 && this.moveCount == this.BOARD_DIM * this.BOARD_DIM) {
        result = 1
    }

    return result;
};

GameManager.prototype.handleGameOver = function(winResult) {
    var message;
    switch(winResult) {
        case 2:
            message = "You beat the computer! ... how did that happen?";
            break;
        case 3:
            message = "Only Human."
            break;
        default:
            message = "Draw."
            break;
    }
    $("#messages").text(message);

    this.gameOver = true;
};

GameManager.prototype.handleBoardUnitClick = function(i, j) {
    if(!this.gameOver) {
        // get the target state index
        var stateIndex = this.gridCoordsToStateIndex(i, j);
        // if the player selected a valid move then continue, else do nothing
        if(this.playerGo(stateIndex)) {
            // let the computer go
            this.computerGo();
            // check if the game has been won
            var winResult = this.checkWin();
            if(winResult > 0) {
            // handle messaging the game result
                this.handleGameOver(winResult);
            }
            // refresh the view of the game board
            this.refreshDraw();
        }
    }
};
