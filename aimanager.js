
AIManager.prototype.mBoardManager;

AIManager.prototype.moveCount;
AIManager.prototype.moveHistory;

function AIManager(boardManager) {
    this.mBoardManager = boardManager;
}

AIManager.prototype.resetMoveHistory = function() {
    this.moveHistory = new Array(9);
    this.moveCount = 0;
};

AIManager.prototype.registerMove = function(index) {
    this.moveHistory[this.moveCount] = index;
    this.moveCount++;
};

AIManager.prototype.getMoveCount = function() {
    return this.moveCount;
};

AIManager.prototype.computerGo = function() {
    var result;
    // 0th round
    // always take a corner
    if(this.moveCount == 0) {
        result = this.computerGetAvailableCornerIndex();
    // 2nd round
    } else if(this.moveCount == 2) {
        // if the human player's first move was to take the middle, then choose a spot adjacent to
        // the cpu's first move
        if(this.moveHistory[1] == this.mBoardManager.getMiddleSpotIndex()) {
            // get the first adjacent spot to our first move
            result = this.mBoardManager.getAdjacentSpotIndexes(this.moveHistory[0])[0];
        // if the player's first move was to take an immediately adjacent spot to the cpu's first move
        // take the middle spot
        } else if(this.mBoardManager.areSpotIndexesAdjacent(this.moveHistory[0], this.moveHistory[1])) {
            result = this.mBoardManager.getMiddleSpotIndex();
        } else {
            result = this.computerGetAvailableCornerIndex();
        }
    // 4th and 6th round
    } else if(this.moveCount == 4 || this.moveCount == 6) {
        // check if we are about to win
        result = this.computerGetWinningIndex(GameManager.prototype.SPOT_CLAIMED_CPU);
        if(result == -1) {
            // if we aren't about to win, make sure the human player isn't about to win either
            result = this.computerGetWinningIndex(GameManager.prototype.SPOT_CLAIMED_HUMAN);
            if(result == -1) {
                // if no one is about to win, take another corner
                result = this.computerGetAvailableCornerIndex();
            }
        }
    // 8th round
    // worst case scenario win or a draw
    } else if(this.moveCount == 8) {
        result = this.computerGetWinningIndex(GameManager.prototype.SPOT_CLAIMED_CPU);
        if(result == -1) {
            result = this.mBoardManager.getAnySpot(GameManager.prototype.SPOT_UNCLAIMED);
        }
    }

    this.mBoardManager.setIndex(result, GameManager.prototype.SPOT_CLAIMED_CPU);
    this.registerMove(result);
};

AIManager.prototype.computerGetWinningIndex = function(code) {
    var result = -1;
    var winningCombs = this.mBoardManager.getAllRowsColsDiags();
    var len = winningCombs.length;
    for(var i = 0; i < len; i++) {
        var innerLen = winningCombs[i].length;
        var emptyIndex = -1;
        var playerCodeCount = 0;
        for(var j = 0; j < innerLen; j++) {
            var claimedCode = this.mBoardManager.getCode(winningCombs[i][j]);
            if(claimedCode == code) {
                playerCodeCount++;
            } else if(claimedCode == GameManager.prototype.SPOT_UNCLAIMED) {
                emptyIndex = winningCombs[i][j];
            }
        }
        if(emptyIndex != -1 && playerCodeCount == BoardManager.prototype.BOARD_DIM - 1) {
            result = emptyIndex;
            break;
        }
    }
    return result;
};

AIManager.prototype.computerGetAvailableCornerIndex = function() {
    var result = -1;

    var topLeft = 0;
    var topRight = BoardManager.prototype.BOARD_DIM - 1;
    var bottomLeft = (BoardManager.prototype.BOARD_DIM * BoardManager.prototype.BOARD_DIM) - BoardManager.prototype.BOARD_DIM;
    var bottomRight = (BoardManager.prototype.BOARD_DIM * BoardManager.prototype.BOARD_DIM) - 1;

    var freeCornerArray = new Array();
    if(this.mBoardManager.isBoardIndexCode(topLeft, GameManager.prototype.SPOT_UNCLAIMED)) {
        freeCornerArray.push(
        {"index" : topLeft, "rating" : this.mBoardManager.getNumAdjacentSpotsOfType(topLeft, GameManager.prototype.SPOT_UNCLAIMED)}
        );
    }
    if(this.mBoardManager.isBoardIndexCode(topRight, GameManager.prototype.SPOT_UNCLAIMED)) {
        freeCornerArray.push(
        {"index" : topRight, "rating" : this.mBoardManager.getNumAdjacentSpotsOfType(topRight, GameManager.prototype.SPOT_UNCLAIMED)}
        );
    }
    if(this.mBoardManager.isBoardIndexCode(bottomLeft, GameManager.prototype.SPOT_UNCLAIMED)) {
        freeCornerArray.push(
        {"index" : bottomLeft, "rating" : this.mBoardManager.getNumAdjacentSpotsOfType(bottomLeft, GameManager.prototype.SPOT_UNCLAIMED)}
        );
    }
    if(this.mBoardManager.isBoardIndexCode(bottomRight, GameManager.prototype.SPOT_UNCLAIMED)) {
        freeCornerArray.push(
        {"index" : bottomRight, "rating" : this.mBoardManager.getNumAdjacentSpotsOfType(bottomRight, GameManager.prototype.SPOT_UNCLAIMED)}
        );
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
