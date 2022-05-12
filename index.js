const X = 'X';
const O = '0';
const EMPTY = "";
const SIZE = 3;


// Game controller
const game = (() => {

    // Create board as 2D array
    let board = new Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
        board[i] = new Array(SIZE);
        for (let j = 0; j < SIZE; j++) {
            board[i][j] = EMPTY;
        };
    };

    let turn = X;
    
    // Start game
    const startTurn = () => {
        if (turn === player.getSymbol()) {
            player.waitForMove();
        } else {
            computer.move();
        }
    }

    // Switch turns
    const switchTurns = () => {
        turn = (turn === X) ? O : X;
        startTurn();
    };
    
    // Get current turn
    // NB- https://stackoverflow.com/questions/56509812/js-how-to-change-variable-in-function-iife/56509901#56509901
    const getTurn = () => turn;

    // Reset board
    const reset = () => {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                board[i][j] = EMPTY;
            };
        };
        turn = X;  
        displayController.clearBoard();
    }

    // Update board when a move is made
    const update = (i,j,symbol) => {
        board[i][j] = symbol;
        displayController.updateSquare(i,j,symbol);
    }

    // Detect full board
    const boardFull = () => {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }

    // Detect winner
    const winner = () => {

        // Define board cols and diags to track possible winner
        let cols = new Array(SIZE);
        for (let col = 0; col < SIZE; col++) {
            cols[col] = new Array(SIZE);
            for (let row = 0; row < SIZE; row++) {
                cols[col][row] = board[row][col];
            }
        }

        let diags = new Array(2);
        diags[0] = new Array(board[0][0],board[1][1],board[2][2]);
        diags[1] = new Array(board[2][0],board[1][1],board[0][2]);

        // Define winning sequence
        const Xwinner = JSON.stringify([X,X,X]);
        const Owinner = JSON.stringify([O,O,O]);
        
        // Check equality
        for (let i = 0; i < SIZE ; i++) {
            if (JSON.stringify(board[i]) === Xwinner || JSON.stringify(cols[i]) === Xwinner) {
                return X;
            }
            if (JSON.stringify(board[i]) === Owinner || JSON.stringify(cols[i]) === Owinner) {
                return O;
            }
        }

        for (let i = 0; i < 2 ; i++) {

            if (JSON.stringify(diags[i]) === Xwinner) {
                return X;
            }
            if (JSON.stringify(diags[i]) === Owinner) {
                return O;
            }
        }

        if (boardFull()) {
            return "Tie";
        }
    }

    // Evaluate if game is over
        const isOver = () => {
            if (boardFull() || winner()) {
                return true;
            }
            return false;
        }

    return { board,startTurn,switchTurns,getTurn,reset,update,boardFull,winner,isOver }
})();

// Player functions
const player = (() => {
    
    let symbol;
    
    const setSymbol = (s) => {
        symbol = s;
    }
    const getSymbol = () => symbol;

    // Listen for click on empty square
    const waitForMove = () => {
        document.querySelectorAll("#square").forEach((element) => {
            if (element.classList.contains("empty")) {
                element.addEventListener("click",move);
            }
        });
    };
    
    // When empty square is clicked, update game and check for possible victory
    const move = (e) => {
        console.log('Player move detected');
        let square = e.target;
        let i = square.dataset.coordinates[0];
        let j = square.dataset.coordinates[2];
        console.log("player move: ", i,j);
        game.update(i,j,X);
        if (game.isOver()) {
            alert('You won!');
        } else {
            game.switchTurns();
        }
    };
    return { getSymbol, setSymbol, waitForMove };
})();

// Computer functions
const computer = (() => {

    let symbol;
    const setSymbol = (s) => {
        symbol = s;
    }
    const getSymbol = () => symbol;

    // Handle computer move
    const move = () => {
        console.log('computer about to make a move');
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (game.board[i][j] === EMPTY) {
                    game.update(i,j,symbol);
                    if (game.isOver()) {
                        console.log('Computer won!');
                    }
                    else {
                        game.switchTurns();
                    };
                    return;
                };
            };
        };   
    };
    return { move, getSymbol, setSymbol };
})();


const displayController = (() => {
   
    // Let player pick symbol and then start the game
    const showSymbolSelectors = () => {
        document.querySelectorAll(".symbol-selector").forEach((e) => {
            document.querySelector('.symbol-selector-area').style.visibility = "visible";
            e.onclick = () => {
                player.setSymbol(e.innerHTML);
                computer.setSymbol((player.getSymbol() === X) ? O : X);
                console.log('player symbol', player.getSymbol());
                console.log('computer symbol', computer.getSymbol());
                hideSymbolSelectors();
                game.startTurn();
            };
        });
    };

    // Hide symbol selection area once symbol has been picked by player
    const hideSymbolSelectors = () => {
        document.querySelectorAll(".symbol-selector").forEach(() => {
            document.querySelector('.symbol-selector-area').style.visibility = "hidden";
        });
    };
    
    const updateSquare = (i,j,symbol) => {
        let square = document.querySelector(`[data-coordinates="${i} ${j}"]`);
        square.innerHTML = symbol;
        square.classList.remove('empty');
    };

    // Control reset button
    const resetController = () => {
        document.querySelector("#reset-button").onclick = () => {
            game.reset();
        }
    };

    const clearBoard = () => {
        document.querySelectorAll("#square").forEach((square) => {
            square.innerHTML = "";
            square.classList.add("empty")
        });
        showSymbolSelectors();
    };

    return { showSymbolSelectors, hideSymbolSelectors, updateSquare, resetController, clearBoard };

})(); 


displayController.showSymbolSelectors();
displayController.resetController();



