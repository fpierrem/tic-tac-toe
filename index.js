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
        displayController.updatePrompt();
        if (turn === player.getSymbol()) {
            displayController.waitForPlayerMove();
        } else {
            displayController.deactivateListeners();
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
        player.setSymbol(undefined);
        computer.setSymbol(undefined);
        displayController.clearBoard();
    }

    // Update board when a move is made
    const update = (i,j,symbol) => {
        board[i][j] = symbol;
        displayController.updateSquare(i,j,symbol);
        if (!isOver()) {
            switchTurns();
        }
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

    // When empty square is clicked, update game and check for possible victory
    const move = (e) => {
        // Prevent player from making a move if computer already won
        if (game.winner()) {
            return;
        }
        let square = e.target;
        let i = square.dataset.coordinates[0];
        let j = square.dataset.coordinates[2];
        game.update(i,j,getSymbol());
    };
    return { getSymbol,setSymbol,move };
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
        let bestMove = boardCalculator.minimax(game.board);
        let i = bestMove[0], j = bestMove[1];
        game.update(i,j,getSymbol());
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
   
    const symbolSelectors = document.querySelectorAll(".symbol-selector");
    const prompt = document.getElementById("prompt");
    const squares = document.querySelectorAll("#square");
    const resetButtons = document.querySelectorAll("#reset-button");

    // Let player pick symbol and then start the game
    const showSymbolSelectors = () => {
        deactivateListeners();
        symbolSelectors.forEach((btn) => {
            btn.style.visibility = "visible";
            btn.onclick = () => {
                player.setSymbol(btn.innerHTML);
                computer.setSymbol((player.getSymbol() === X) ? O : X);
                hideSymbolSelectors();
                game.startTurn();
            };
        });
    };

    // Update prompt on top of the board
    const updatePrompt = () => {
        if (game.getTurn() === player.getSymbol()) {
            setTimeout(() => {prompt.innerHTML = "Your turn."}, 300);
        }
        else if (game.getTurn() === computer.getSymbol()) {            
            prompt.innerHTML = "Computer's turn."
        }
        else {
            prompt.innerHTML = "Choose a symbol."
        }
    }

    // Listen for click on empty square
    const waitForPlayerMove = () => {
        squares.forEach((square) => {
            square.removeEventListener("click",player.move);
            if (square.classList.contains("empty")) {
                square.addEventListener("click",player.move);
            }
        });
    };    

    // Listen for click on empty square
    const deactivateListeners = () => {
        squares.forEach((square) => {
            square.removeEventListener("click",player.move);
        });
    };    

    // Hide symbol selection area once symbol has been picked by player
    const hideSymbolSelectors = () => {
        symbolSelectors.forEach((btn) => {
            btn.style.visibility = "hidden";
        });
        // Ensure all squares are now clickable
        squares.forEach((square) => {
            square.classList.add("empty");
        });
    };
 
    // Update content of square
    const updateSquare = (i,j,symbol) => {
        let square = document.querySelector(`[data-coordinates="${i} ${j}"]`);
        square.innerHTML = symbol;
        square.classList.remove('empty');
    };

    // Control reset button
    const resetController = () => {
        resetButtons.forEach((btn) => {
            btn.onclick = () => {
                game.reset();
                // Calling closeModal for simplicity as the most probable use case is that game is over
                closeModal();
            };
        });
    };

    const clearBoard = () => {
        squares.forEach((square) => {
            square.innerHTML = "";
            square.classList.remove("empty");
        });
        updatePrompt();
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

    return { showSymbolSelectors,updatePrompt,waitForPlayerMove,deactivateListeners,hideSymbolSelectors,updateSquare,resetController,clearBoard,showModal,closeModal };

})(); 

// Set up initial display
displayController.showSymbolSelectors();
displayController.resetController();



