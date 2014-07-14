
/* making a constant of the length of a row or a column on a tictactoe board */
BoardManager.prototype.BOARD_DIM = 3;

/* an array representing the claim codes on each spot on the board */
BoardManager.prototype.mBoardState;

/* a cached value representing each row, column, and diagonal on the board */
BoardManager.prototype.mCachedRowsColsDiags;

function BoardManager() {
    this.mBoardState = new Array(this.BOARD_DIM * this.BOARD_DIM);
}

/*
Set all the spots on the board to the specific code

@param code int - the code value for each spot
*/
BoardManager.prototype.setAllSpots = function(code) {
    var len = this.mBoardState.length;
    for(var i = 0; i < len; i++) {
        this.mBoardState[i] = code;
    }
};

/*
Gets all the rows, columns, and diagonals as arrays of indices

@return array - an array of arrays
*/
BoardManager.prototype.getAllRowsColsDiags = function() {
    if(this.mCachedRowsColsDiags == null) {
        this.mCachedRowsColsDiags = new Array();

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
            this.mCachedRowsColsDiags.push(currentRow);
            this.mCachedRowsColsDiags.push(currentCol);

            // calculating diagonals
            bottomLeftDiag.push(i * (this.BOARD_DIM + 1));
            bottomRightDiag.push((i * 2) + (this.BOARD_DIM - 1));
        }

        // add the diagonal winnings combs
        this.mCachedRowsColsDiags.push(bottomLeftDiag);
        this.mCachedRowsColsDiags.push(bottomRightDiag);
    }
    return this.mCachedRowsColsDiags;
};

/*
Convert a row index (i) and column index (j) to a single board index

@return int - the board index
*/
BoardManager.prototype.gridCoordsToStateIndex = function(i, j) {
    return i + (this.BOARD_DIM * j);
};

/*
Given an index in the board state array, find all the indices
that are immediately adjacent to that index on a tictactoe grid

@param  int spotIndex - the index for which to get the neighbors

@return array - all the indices that are adjacent to the requested index
*/
BoardManager.prototype.getAdjacentSpotIndexes = function(spotIndex) {
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

/*
Find the number of indices that are adjacent to the given index that
are marked with the code given.

For example:

[-][X][-]
[X][X][-]
[-][-][-]

index 0 has 2 adjacent indices with code X, while index 2 has only 1

@param int spotIndex - the index on the game board
@param int code - spot code serves as the type differentiator
@return int - the number of adjacent indices
*/
BoardManager.prototype.getNumAdjacentSpotsOfType = function(spotIndex, code) {
    var result = 0;
    var adjacentSpotIndices = this.getAdjacentSpotIndexes(spotIndex);
    var len = adjacentSpotIndices.length;
    for(var i = 0; i < len; i++) {
        if(this.mBoardState[adjacentSpotIndices[i]] == code) {
            result++;
        }
    }
    return result;
};

/*
Set an spot on the board index to a specific code

@param int index - the index at which to set the code
@param int code - the code to mark at the index
*/
BoardManager.prototype.setIndex = function(index, code) {
    this.mBoardState[index] = code;
};

/*
@return int - the code at the given index
*/
BoardManager.prototype.getCode = function(index) {
    return this.mBoardState[index];
};

/*
@param int - the index to check
@param int - the value to look for at the index

@return boolean - true if the index contains the passed in code
*/
BoardManager.prototype.isBoardIndexCode = function(index, code) {
    return this.mBoardState[index] == code;
};

/*
Returns the first index with the given code value
@return int - an index in the game board
*/
BoardManager.prototype.getAnySpot = function(code) {
    var result;
    var len = this.mBoardState.length;
    for(var i = 0; i < len; i++) {
        if(this.mBoardState[i] == code) {
            result = i;
            break;
        }
    }
    return result;
};

/*
@return int - the index in the middle of the tictactoe board
*/
BoardManager.prototype.getMiddleSpotIndex = function() {
    return ((this.BOARD_DIM * this.BOARD_DIM) - 1) / 2;
};

/*
Given a board index, find the row index in a tictactoe board
@return int - the row index
*/
BoardManager.prototype.getRowIndex = function(spotIndex) {
    return parseInt(spotIndex / this.BOARD_DIM);
};

/*
Given a board index, find the column index
@return int - the column index
*/
BoardManager.prototype.getColIndex = function(spotIndex) {
    return spotIndex % this.BOARD_DIM;
};

/*
Returns true if the two board indices are adjacent on a game board

@param int indexOne - the first index to check
@param int indexTwo - the second index to check
@return boolean - true if the two indices are adjacent
*/
BoardManager.prototype.areSpotIndexesAdjacent = function(indexOne, indexTwo) {
    var result = false;

    var firstIndexNeighbors = this.getAdjacentSpotIndexes(indexOne);
    var len = firstIndexNeighbors.length;
    for(var i = 0; i < len; i++) {
        if(firstIndexNeighbors[i] == indexTwo) {
            result = true;
            break;
        }
    }
    
    return result;
};
