
$(document).ready(function() {
   
    // load the correct css file based on the user agent
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) { 
        $("head").append("<link rel='stylesheet' type='text/css' href='css/mobile.css'>");
    } else {
        $("head").append("<link rel='stylesheet' type='text/css' href='css/screen.css'>");
    }
    // create the game manager object
    var gameManager = new GameManager();

    // bind the click listeners on the board units
    // adding responsivness to click event with jquery fader
    $(".spot").click(function() {
        $(this).fadeTo(100, 0.5);
        gameManager.handleBoardUnitClick(this.cellIndex, this.parentNode.rowIndex);
        $(this).fadeTo(200, 1.0);
    });

    // bind the play again button behavior
    // adding some responsivness to the click event using jquery fader
    $("#playAgainButton").click(function() {
        $(this).fadeTo(100, 0.5);
        gameManager.handlePlayAgainClick();
        $(this).fadeTo(200, 1.0);
    });
});
