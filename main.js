
// construct the game board
$(document).ready(function() {
    
    // create the game object
    var gameManager = new GameManager();

    // bind the click listeners on the board units
    $(".spot").click(function() {
        gameManager.handleBoardUnitClick(this.cellIndex, this.parentNode.rowIndex);
    });

});
