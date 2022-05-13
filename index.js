const X = 'X';
const O = 'O';
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
            console.log('waiting for player move');
            player.waitForMove();
        } else {
            computer.move();
        }
    }

    // Switch turns
    const switchTurns = () => {
        turn = (turn === X) ? O : X;
        console.log("turn: ", turn);
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

    // Detect if board is full
    const boardFull = () => boardCalculator.boardFull(board);

    // Detect potential winner
    const winner = () => boardCalculator.winner(board);

    // Evaluate if game is over
        const isOver = () => {
            if (boardFull() || winner()) {
                displayController.showModal();
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
            element.removeEventListener("click",move);
            if (element.classList.contains("empty")) {
                element.addEventListener("click",move);
            }
        });
    };
    
    // When empty square is clicked, update game and check for possible victory
    const move = (e) => {
        // Prevent player from making a move if computer already won
        if (game.winner()) {
            return;
        }
        console.log('Player move detected');
        let square = e.target;
        let i = square.dataset.coordinates[0];
        let j = square.dataset.coordinates[2];
        console.log("player move: ", i,j);
        game.update(i,j,getSymbol());
        if (!game.isOver()) {
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
        let bestMove = boardCalculator.minimax(game.board);
        console.log('best move: ', bestMove);
        let i = bestMove[0], j = bestMove[1];
        console.log('computer move: ', i, j);
        game.update(i,j,getSymbol());
        if (!game.isOver()) {
            game.switchTurns();
        };
    };

    return { move, getSymbol, setSymbol };
})();

// Functions driving computer moves
const boardCalculator = (() => {

    // Determine whose turn it is by comparing number of X's and O's
    const turn = (board) => {
        let countX = 0, countO = 0;
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === X) {
                    countX ++;
                }
                if (board[i][j] === O) {
                    countO ++;
                }
            }    
        }
        if (countX > countO) {
            return O;
        }
        return X;
    }

    // List possible moves on a given board
    const possibleMoves = (board) => {
        let result = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    result.push([i,j]);
                };
            };
        };
        return result;
    };

    // Determine result of a given move on a given board
    const result = (board, move) => {
        let board_copy = JSON.parse(JSON.stringify(board));
        let i = move[0], j = move[1];
        board_copy[i][j] = turn(board);
        return board_copy;
    };

    // Detect whether a board is full
    const boardFull = (board) => {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    return false;
                };
            };
        };
        return true;
    };

    // Detect winner of a given board
    const winner = (board) => {

        // Define board cols and diags to track possible winner
        let cols = new Array(SIZE);
        for (let col = 0; col < SIZE; col++) {
            cols[col] = new Array(SIZE);
            for (let row = 0; row < SIZE; row++) {
                cols[col][row] = board[row][col];
            };
        };

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
            };
            if (JSON.stringify(board[i]) === Owinner || JSON.stringify(cols[i]) === Owinner) {
                return O;
            };
        };

        for (let i = 0; i < 2 ; i++) {

            if (JSON.stringify(diags[i]) === Xwinner) {
                return X;
            };
            if (JSON.stringify(diags[i]) === Owinner) {
                return O;
            };
        };

        if (boardFull(board)) {
            return "Tie";
        };
    };

    // Calculates the utility of a final board
    const utility = (board) => {
        if (winner(board) == X) {
            return 1;
        };
        if (winner(board) == O) {
            return -1;
        };
        if (boardFull(board)) {
            return 0;
        };
    };

    // Calculates the compounded utility of a board
    const value = (board) => {
        if (winner(board) || boardFull(board)) {
            return utility(board);
        };
        let values = [];
        if (turn(board) === X){
            for (key in possibleMoves(board)) {
                let move = possibleMoves(board)[key];
                let next_board = result(board,move);
                let v = value(next_board);
                if (values.length > 0 && v < Math.max(...values)) {
                    break;
                };
                values.push(v);
            };
            return Math.max(...values);            
        };
        if (turn(board) === O){
            for (key in possibleMoves(board)) {
                let move = possibleMoves(board)[key];
                let next_board = result(board,move);
                let v = value(next_board);
                if (values.length > 0 && v > Math.min(...values)) {
                    break;
                };
                values.push(v);
            };
            return Math.min(...values);            
        };
    };
    
    // Determine optimal move on a given board for the current player
    const minimax = (board) => {

        let bestMove = [];

        if (turn(board) === X) {
            let bestOutcome = Number.NEGATIVE_INFINITY;
            for (key in possibleMoves(board)) {
                let move = possibleMoves(board)[key];
                let next_board = result(board,move);
                if (value(next_board) > bestOutcome) {
                    bestMove = move;
                    bestOutcome = value(next_board);
                };
            };
        };

        if (turn(board) === O) {
            let bestOutcome = Number.POSITIVE_INFINITY;
            for (key in possibleMoves(board)) {
                let move = possibleMoves(board)[key];
                let next_board = result(board,move);
                if (value(next_board) < bestOutcome) {
                    bestMove = move;
                    bestOutcome = value(next_board);
                };
            };
        };
        return bestMove;
    }
    return { boardFull,winner,minimax };
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
        document.querySelectorAll("#reset-button").forEach((btn) => {
            btn.onclick = () => {
                game.reset();
                // Calling closeModal for simplicity as the most probable use case is that game is over
                closeModal();
            };
        });
    };

    const clearBoard = () => {
        document.querySelectorAll("#square").forEach((square) => {
            square.innerHTML = "";
            square.classList.add("empty")
        });
        showSymbolSelectors();
    };

    const showModal = () => {       
        let modal = document.getElementById('modal');
        let message = document.getElementById('game-over-message');
        modal.style.visibility = "visible";
        if (game.winner() === computer.getSymbol()) {
            message.innerHTML = "Computer won!"
        }
        if (game.winner() === "Tie") {
            message.innerHTML = "It's a tie!"
        }
        if (game.winner() === player.getSymbol()) {
            message.innerHTML = "You won!"
        }
        window.onclick = (event) => {
            if (event.target === modal) {
              closeModal();
            };
          };
        };

        const closeModal = () => {
            let modal = document.getElementById('modal');
            let message = document.getElementById('game-over-message');
            modal.style.visibility = "hidden";
            message.innerHTML = "";                
        }

    return { showSymbolSelectors, hideSymbolSelectors, updateSquare, resetController, clearBoard, showModal, closeModal };

})(); 


displayController.showSymbolSelectors();
displayController.resetController();



