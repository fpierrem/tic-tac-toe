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
        board[i][j] = symbol;
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

// PLACEHOLDER FOR PLAYER CONSTRUCTOR AND OBJECTS
// const Player = (symbol) => {
//     // To come
//     return { }
// }

// PlayerX = Player(X);
// PlayerO = Player(X);


