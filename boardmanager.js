
BoardManager.prototype.BOARD_DIM = 3;

BoardManager.prototype.mBoardState;
BoardManager.prototype.mCachedRowsColsDiags;

function BoardManager() {
    this.mBoardState = new Array(this.BOARD_DIM * this.BOARD_DIM);
}

BoardManager.prototype.setAllSpots = function(code) {
    var len = this.mBoardState.length;
    for(var i = 0; i < len; i++) {
        this.mBoardState[i] = code;
    }
};

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

BoardManager.prototype.gridCoordsToStateIndex = function(i, j) {
    return i + (this.BOARD_DIM * j);
};

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

BoardManager.prototype.setIndex = function(index, code) {
    this.mBoardState[index] = code;
};

BoardManager.prototype.getCode = function(index) {
    return this.mBoardState[index];
};

BoardManager.prototype.isBoardIndexCode = function(index, code) {
    return this.mBoardState[index] == code;
};

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

BoardManager.prototype.getMiddleSpotIndex = function() {
    return ((this.BOARD_DIM * this.BOARD_DIM) - 1) / 2;
};

BoardManager.prototype.getRowIndex = function(spotIndex) {
    return parseInt(spotIndex / this.BOARD_DIM);
};

BoardManager.prototype.getColIndex = function(spotIndex) {
    return spotIndex % this.BOARD_DIM;
};

BoardManager.prototype.areSpotIndexesAdjacent = function(indexOne, indexTwo) {
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
