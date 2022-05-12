const X = 'X';
const O = '0';
const EMPTY = "";
const SIZE = 3;

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
    
    // Switch turns
    const switchTurns = () => {
        turn = (turn === X) ? O : X;
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
    }

    // Update board when a move is made
    const update = (i,j,symbol) => {
        console.log(i,j,symbol);
        board[i][j] = symbol;
        let square = document.querySelector(`[data-coordinates="${i} ${j}"]`);
        square.innerHTML = symbol;
        square.classList.remove('empty');
    }

    // Detect full board
    const boardFull = () => {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === EMPTY) {
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

    return { board,switchTurns,getTurn,reset,update,boardFull,winner,isOver }
})();

// const Player = (symbol) => {
//     // To come
//     return { }
// }

// PlayerX = Player(X);
// PlayerO = Player(X);


// Display controller
document.querySelectorAll("#square").forEach((element) => {
    if (element.classList.contains("empty")) {
        element.addEventListener("click",detectMove);
    }
});

function detectMove(e) {
    console.log('Player move detected');
    let square = e.target;
    let i = square.dataset.coordinates[0];
    let j = square.dataset.coordinates[2];
    // square.classList.remove('empty');
    console.log(i,j);
    game.update(i,j,X);
    console.log(game.board);
    if (game.isOver()) {
        alert('You won!');
    } else {
        game.switchTurns();
        computer.move();
    }
}

const computer = (() => {
    let symbol = O;
    const move = () => {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (game.board[i][j] === EMPTY) {
                    game.update(i,j,symbol);
                    console.log(game.board);
                    if (game.isOver()) {
                        alert('Computer won!');
                    }
                    else {
                        game.switchTurns();
                    };
                    return;
                };
            };
        };   
    };
    return { move };
})();


// PLACEHOLDER FOR SYMBOL SELECTION INTERFACE
// const symbolSelector = document.querySelector("#symbolSelector");
// symbolSelector.onclick = () => {

// }