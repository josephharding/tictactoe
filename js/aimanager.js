
/* reference to the board manager, responsible for all board logic */
AIManager.prototype.mBoardManager;

/* keep track of which move we are currently on */
AIManager.prototype.mMoveCount;

/* a record of the previous moves, both by the human player and the cpu player */
AIManager.prototype.mMoveHistory;

function AIManager(boardManager) {
    this.mBoardManager = boardManager;
}

/*
reset the aimanager's writable game session data
*/
AIManager.prototype.resetMoveHistory = function() {
    this.mMoveHistory = new Array(BoardManager.prototype.BOARD_DIM * BoardManager.prototype.BOARD_DIM);
    this.mMoveCount = 0;
};

/*
Record the index that was taken on the board during the last move

@param int index - the index in the board just claimed
*/
AIManager.prototype.registerMove = function(index) {
    this.mMoveHistory[this.mMoveCount] = index;
    this.mMoveCount++;
};

/*
return int - the number of moves executed so far, both cpu and human
*/
AIManager.prototype.getMoveCount = function() {
    return this.mMoveCount;
};

/*
The method responsible for the a.i.'s tictactoe strategy

The overall strategy is made up of several small strategies,
which small strategy is used depends on the current move count.

This strategy can guarantee that the human player never wins.
The human player can achieve a draw however.
*/
AIManager.prototype.computerGo = function() {
    var result;
    // 0th round
    // always take a corner
    if(this.mMoveCount == 0) {
        result = this.getAvailableCornerIndex();
    // 2nd round
    } else if(this.mMoveCount == 2) {
        // if the human player's first move was to take the middle, then choose a spot adjacent to
        // the cpu's first move
        if(this.mMoveHistory[1] == this.mBoardManager.getMiddleSpotIndex()) {
            // get the first adjacent spot to our first move, this is guaranteed to exist
            // as our first move is a corner, the next move was the middle, so we have two of these available
            result = this.mBoardManager.getAdjacentSpotIndexes(this.mMoveHistory[0])[0];
        // if the player's first move was to take an immediately adjacent spot to the cpu's first move
        // take the middle spot
        } else if(this.mBoardManager.areSpotIndexesAdjacent(this.mMoveHistory[0], this.mMoveHistory[1])) {
            result = this.mBoardManager.getMiddleSpotIndex();
        } else {
            result = this.getAvailableCornerIndex();
        }
    // 4th and 6th round
    } else if(this.mMoveCount == 4 || this.mMoveCount == 6) {
        // check if we are about to win
        result = this.getWinningIndex(GameManager.prototype.SPOT_CLAIMED_CPU);
        if(result == -1) {
            // if we aren't about to win, make sure the human player isn't about to win either
            result = this.getWinningIndex(GameManager.prototype.SPOT_CLAIMED_HUMAN);
            if(result == -1) {
                // if no one is about to win, take another corner
                result = this.getAvailableCornerIndex();
            }
        }
    // 8th round
    // worst case scenario win or a draw
    } else if(this.mMoveCount == 8) {
        result = this.getWinningIndex(GameManager.prototype.SPOT_CLAIMED_CPU);
        if(result == -1) {
            result = this.mBoardManager.getAnySpot(GameManager.prototype.SPOT_UNCLAIMED);
        }
    }

    this.mBoardManager.setIndex(result, GameManager.prototype.SPOT_CLAIMED_CPU);
    this.registerMove(result);
};

/*
A winning index is an index on the game board that will complete a "three
in the row" tictactoe win.

For example, in the row below indices 0, 1, and 2 the index 1 is a winning index:
[X - X]

@param code int - the spot code to use when seeking a winning index
*/
AIManager.prototype.getWinningIndex = function(code) {
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

/*
Gets a corner index in a tictactoe board that has the greatest number
of unclaimed spots near it. This preference for unclaimed spot neighbors
in our corners ensures we achieve the "winning triangle" pattern on the board
such that two winning indexes become available

winning triangle examples:
[x][-][-]
[-][-][-]
[x][-][x]

[x][-][-]
[-][x][-]
[x][-][-]

@return int - an index in a corner position on a tictactoe board
*/
AIManager.prototype.getAvailableCornerIndex = function() {
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
