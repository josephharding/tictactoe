
// construct the game board
$(document).ready(function() {
    
    // create the game object
    var gameManager = new GameManager();

    // bind the click listeners on the board units
    $(".spot").click(function() {
        $(this).fadeTo(100, 0.5);
        gameManager.handleBoardUnitClick(this.cellIndex, this.parentNode.rowIndex);
        $(this).fadeTo(200, 1.0);
    });

    $("#playAgainButton").click(function() {
        $(this).fadeTo(100, 0.5);
        gameManager.handlePlayAgainClick();
        $(this).fadeTo(200, 1.0);
    });

});
