


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

function GameManager() {
    // calculate the winning combinations required for the game to be over
    this.calculateAndSetWinningCombs();
    
    // start the game automatically for now
    this.startGame();
}

GameManager.prototype.startGame = function() {
    this.moveCount = 0;
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
    // 0th round
    // always take a corner
    if(this.moveCount == 0) {
        result = this.computerGetAvailableCornerIndex();
    // 2nd round
    } else if(this.moveCount == 2) {
        // if the human player's first move was to take the middle, then choose a spot adjacent to
        // the cpu's first move
        if(this.moveHistory[1] == this.getMiddleSpotIndex()) {
            // get the first adjacent spot to our first move
            result = this.getAdjacentSpotIndexes(this.moveHistory[0])[0];
        // if the player's first move was to take an immediately adjacent spot to the cpu's first move
        // take the middle spot
        } else if(this.areSpotIndexesAdjacent(this.moveHistory[0], this.moveHistory[1])) {
            result = this.getMiddleSpotIndex();
        } else { 
            result = this.computerGetAvailableCornerIndex();
        }
    // 4th and 6th round
    } else if(this.moveCount == 4 || this.moveCount == 6) {
        // check if we are about to win
        result = this.computerGetWinningIndex(this.UNIT_COMP_CLAIMED);
        if(result == -1) {
            // if we aren't about to win, make sure the human player isn't about to win either
            result = this.computerGetWinningIndex(this.UNIT_PLAYER_CLAIMED);
            if(result == -1) {
                // if no one is about to win, take another corner
                result = this.computerGetAvailableCornerIndex();
            }
        }
    // 8th round
    // worst case scenario win or a draw
    } else if(this.moveCount == 8) {
        result = this.computerGetWinningIndex(this.UNIT_COMP_CLAIMED);
        if(result == -1) {
            result = this.getAnyFreeSpot();
        }
    }

    this.boardState[result] = this.UNIT_COMP_CLAIMED;
    this.moveHistory[this.moveCount] = result;

    this.moveCount++;
};

GameManager.prototype.getMiddleSpotIndex = function() {
    return ((this.BOARD_DIM * this.BOARD_DIM) - 1) / 2;
};

GameManager.prototype.getRowIndex = function(spotIndex) {
    return parseInt(spotIndex / this.BOARD_DIM);
};

GameManager.prototype.getColIndex = function(spotIndex) {
    return spotIndex % this.BOARD_DIM;
};

GameManager.prototype.areSpotIndexesAdjacent = function(indexOne, indexTwo) {
    var result = false;
    
    var colOne = this.getColIndex(indexOne);
    var colTwo = this.getColIndex(indexTwo);

    var rowOne = this.getRowIndex(indexOne);
    var rowTwo = this.getRowIndex(indexTwo);

    // if the rows are the same and the cols are off by one
    if(rowOne == rowTwo && (colOne - 1 == colTwo || colOne == colTwo - 1)) {
        result = true;
    // if the cols are the same and the rows are off by one
    } else if(colOne == colTwo && (rowOne - 1 == rowTwo || rowOne == rowTwo - 1)) {
        result = true
    }
    
    return result;
};

GameManager.prototype.getAnyFreeSpot = function() {
    var result;
    var len = this.boardState.length;
    for(var i = 0; i < len; i++) {
        if(this.boardState[i] == this.UNIT_UNCLAIMED) {
            result = i;
            break;
        }
    }
    return result;
};

GameManager.prototype.computerGetWinningIndex = function(code) {
    var result = -1;
    var len = this.winningCombs.length;
    for(var i = 0; i < len; i++) {
        var innerLen = this.winningCombs[i].length;
        var emptyIndex = -1;
        var playerCodeCount = 0;
        for(var j = 0; j < innerLen; j++) {
            var claimedCode = this.boardState[this.winningCombs[i][j]];
            if(claimedCode == code) {
                playerCodeCount++;
            } else if(claimedCode == this.UNIT_UNCLAIMED) {
                emptyIndex = this.winningCombs[i][j];
            }
        }
        if(emptyIndex != -1 && playerCodeCount == this.BOARD_DIM - 1) {
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
        freeCornerArray.push({"index" : topLeft, "rating" : this.getNumAdjacentSpotsOfType(topLeft, this.UNIT_UNCLAIMED)});
    }
    if(this.isBoardIndexFree(topRight)) {
        freeCornerArray.push({"index" : topRight, "rating" : this.getNumAdjacentSpotsOfType(topRight, this.UNIT_UNCLAIMED)});
    }
    if(this.isBoardIndexFree(bottomLeft)) {
        freeCornerArray.push({"index" : bottomLeft, "rating" : this.getNumAdjacentSpotsOfType(bottomLeft, this.UNIT_UNCLAIMED)});
    }
    if(this.isBoardIndexFree(bottomRight)) { 
        freeCornerArray.push({"index" : bottomRight, "rating" : this.getNumAdjacentSpotsOfType(bottomRight, this.UNIT_UNCLAIMED)});
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

GameManager.prototype.getAdjacentSpotIndexes = function(spotIndex) {
    var result = new Array();
    
    var rowIndex = this.getRowIndex(spotIndex);
    var colIndex = this.getColIndex(spotIndex);

    if(rowIndex > 0) {
        result.push(this.gridCoordsToStateIndex(colIndex, rowIndex - 1));
    }
    if(rowIndex < this.BOARD_DIM - 1) {
        result.push(this.gridCoordsToStateIndex(colIndex, rowIndex + 1));
    }
    if(colIndex > 0) {
        result.push(this.gridCoordsToStateIndex(colIndex - 1, rowIndex));
    }
    if(colIndex < this.BOARD_DIM - 1) {
        result.push(this.gridCoordsToStateIndex(colIndex + 1, rowIndex));
    }
    return result;
};

GameManager.prototype.getNumAdjacentSpotsOfType = function(spotIndex, code) {
    var result = 0;
    var adjacentSpotIndices = this.getAdjacentSpotIndexes(spotIndex);
    var len = adjacentSpotIndices.length;
    for(var i = 0; i < len; i++) {
        if(this.boardState[adjacentSpotIndices[i]] == code) {
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

GameManager.prototype.checkGameState = function() {
    // check if the game has been won
    var winResult = this.checkWin();
    if(winResult > 0) {
        // handle messaging the game result
        this.handleGameOver(winResult);
    }
};

GameManager.prototype.handleBoardUnitClick = function(i, j) {
    if(!this.gameOver) {
        // get the target state index
        var stateIndex = this.gridCoordsToStateIndex(i, j);
        // if the player selected a valid move then continue, else do nothing
        if(this.playerGo(stateIndex)) {
            
            // the player may have won, check
            this.checkGameState();
            
            if(!this.gameOver) {
                // let the computer go
                this.computerGo();
            
                // the computer may have won, check
                this.checkGameState();
            }

            // refresh the view of the game board
            this.refreshDraw();
        }
    }
};
