class Sudoku {
    #digits = "123456789"; // Allowed digits
    #rows = "ABCDEFGHI"; // Row lables
    #cols = this.#digits; // Column lables
    #squares = null; // Square IDs
    #unists = null; // All units (row, column, or box)
    #squareUnitsMap = null; // Squares -> units map
    #squarePeersMap = null; // Squares -> peers map
    #minGivens = 17; // Minimum number of givens
    #nrSquares = 81; // Number of squares
    #difficulty = {
        easy: 62,
        medium: 53,
        hard: 44,
        "very-hard": 35,
        insane: 26,
        inhuman: 17,
    };
    // Blank character and board representation
    #blankChar = ".";
    #blankBoard =
        "...................................................." + ".............................";

    constructor() {
        this.#squares = this.cross(this.#rows, this.#cols);
        this.#unists = this.getAllUnits(this.#rows, this.#cols);
        this.#squareUnitsMap = this.getSquareUnitsMap(this.#squares, this.#unists);
        this.#squarePeersMap = this.getSquarePeersMap(this.#squares, this.#squareUnitsMap);
    }

    /**
     *
     * @param difficulty
     * @param unique
     * @returns
     */
    generate(difficulty, unique) {
        // If `difficulty` is a string or undefined, convert it to a number or
        // default it to "easy" if undefined.

        if (typeof difficulty === "string" || typeof difficulty === "undefined") {
            difficulty = this.#difficulty[difficulty] || this.#difficulty.easy;
        }

        gameDifficulty = difficulty;

        // Force difficulty between 17 and 81 inclusive
        //difficulty = this.forceRange(difficulty, this.#nrSquares + 1, this.#minGivens);

        // Default unique to true
        unique = unique || true;

        // Get a set of squares and all possible candidates for each square
        var blankBoard = "";
        for (var i = 0; i < this.#nrSquares; ++i) {
            blankBoard += ".";
        }
        var candidates = this.getCandidatesMap(blankBoard);

        // For each item in a shuffled list of squares
        var shuffledSquares = this.shuffel(this.#squares);
        for (var si in shuffledSquares) {
            var square = shuffledSquares[si];

            // If an assignment of a random chioce causes a contradictoin, give
            // up and try again
            var randCandidateIdx = this.randRange(candidates[square].length);
            var randCandidate = candidates[square][randCandidateIdx];
            if (!this.assign(candidates, square, randCandidate)) {
                break;
            }

            // Make a list of all single candidates
            var singleCandidates = [];
            for (var si in this.#squares) {
                var square = this.#squares[si];

                if (candidates[square].length == 1) {
                    singleCandidates.push(candidates[square]);
                }
            }

            // If we have at least difficulty, and the unique candidate count is
            // at least 8, return the puzzle!
            if (
                singleCandidates.length >= difficulty &&
                this.stripDups(singleCandidates).length >= 8
            ) {
                var board = "";
                var givensIdxs = [];
                for (var i in this.#squares) {
                    var square = this.#squares[i];
                    if (candidates[square].length == 1) {
                        board += candidates[square];
                        givensIdxs.push(i);
                    } else {
                        board += this.#blankChar;
                    }
                }

                // If we have more than `difficulty` givens, remove some random
                // givens until we're down to exactly `difficulty`
                var nrGivens = givensIdxs.length;
                if (nrGivens > difficulty) {
                    givensIdxs = this.shuffel(givensIdxs);
                    for (var i = 0; i < nrGivens - difficulty; ++i) {
                        var target = parseInt(givensIdxs[i]);
                        board =
                            board.substr(0, target) + this.#blankChar + board.substr(target + 1);
                    }
                }

                // Double check board is solvable
                if (this.solve(board)) {
                    return board;
                }
            }
        }

        // Give up and try a new puzzle
        return this.generate(difficulty);
    }

    /**
     * Solve a sudoku puzzle given a sudoku `board`, i.e., an 81-character
     * string of sudoku.DIGITS, 1-9, and spaces identified by '.', representing the
     * squares. There must be a minimum of 17 givens. If the given board has no
     * solutions, return false.
     *
     * Optionally set `reverse` to solve "backwards", i.e., rotate through the
     * possibilities in reverse. Useful for checking if there is more than one
     * solution.
     *
     * @param board
     * @param reverse
     */
    solve(board, reverse) {
        // Assure a valid board
        var report = this.validateBoard(board);
        if (report !== true) {
            throw report;
        }

        // Check number of givens is at least MIN_GIVENS
        var nrGivens = 0;
        for (var i in board) {
            if (board[i] !== this.#blankChar && this.in(board[i], this.#digits)) {
                ++nrGivens;
            }
        }
        if (nrGivens < this.#minGivens) {
            throw "Too few givens. Minimum givens is " + this.#minGivens;
        }

        // Default reverse to false
        reverse = reverse || false;

        var candidates = this.getCandidatesMap(board);
        var result = this.search(candidates, reverse);

        if (result) {
            var solution = "";
            for (var square in result) {
                solution += result[square];
            }
            return solution;
        }
        return false;
    }

    /**
     * Return all possible candidatees for each square as a grid of candidates, returnning `false` if a contradiction is encountered.
     *
     * Really just a wrapper for this.getCandidatesMap for programmer consumption.
     *
     * @param  board
     * @returns
     */
    getCandidates(board) {
        var report = this.validateBoard(board);
        if (report !== true) {
            throw report;
        }

        // Get a candidates map
        var candidatesMap = this.getCandidatesMap(board);

        // If there's an error, return false
        if (!candidatesMap) {
            return false;
        }

        // Transform candidates map into grid
        var rows = [];
        var currentRow = [];
        var i = 0;
        for (var square in candidatesMap) {
            var candidates = candidatesMap[square];
            currentRow.push(candidates);
            if (i % 9 == 8) {
                rows.push(currentRow);
                currentRow = [];
            }
            ++i;
        }
        return rows;
    }

    /**
     * Get all possible candidates for each square as a map in the form
     * {square: this.#digits} using recursive constraint propagation.
     * Return `false` if a contradiction is encountered
     *
     * @param  board
     * @returns {Object|boolean}
     */
    getCandidatesMap(board) {
        var report = this.validateBoard(board);
        if (report !== true) {
            throw report;
        }

        var candidateMap = {};
        var squaresValuesMap = this.getSquareValsMap(board);

        // Start by assigning every digit as a candidate to every square
        for (var si in this.#squares) {
            candidateMap[this.#squares[si]] = this.#digits;
        }

        // For each non-blank square, assign its value in the candidate map and
        // propigate.
        for (var square in squaresValuesMap) {
            var val = squaresValuesMap[square];

            if (this.in(val, this.#digits)) {
                var newCandidates = this.assign(candidateMap, square, val);

                // Fail if we can't assign val to square
                if (!newCandidates) {
                    return false;
                }
            }
        }

        return candidateMap;
    }

    /**
     * Given a map of squares -> candiates, using depth-first search,
     * recursively try all possible values until a solution is found, or false
     * if no solution exists.
     *
     * @param candidates
     * @param reverse
     * @returns {Object|boolean}
     */
    search(candidates, reverse) {
        // Return if error in previous iteration
        if (!candidates) {
            return false;
        }

        // Default reverse to false
        reverse = reverse || false;

        // If only one candidate for every square, we've a solved puzzle!
        // Return the candidates map.
        var maxNrCandidates = 0;
        var maxCandidatesSquare = null;
        for (var si in this.#squares) {
            var square = this.#squares[si];

            var nrCandidates = candidates[square].length;

            if (nrCandidates > maxNrCandidates) {
                maxNrCandidates = nrCandidates;
                maxCandidatesSquare = square;
            }
        }
        if (maxNrCandidates === 1) {
            return candidates;
        }

        // Choose the blank square with the fewest possibilities > 1
        var minNrCandidates = 10;
        var minCandidatesSquare = null;
        for (si in this.#squares) {
            var square = this.#squares[si];

            var nrCandidates = candidates[square].length;

            if (nrCandidates < minNrCandidates && nrCandidates > 1) {
                minNrCandidates = nrCandidates;
                minCandidatesSquare = square;
            }
        }

        // Recursively search through each of the candidates of the square
        // starting with the one with fewest candidates.

        // Rotate through the candidates forwards
        var minCandidates = candidates[minCandidatesSquare];
        if (!reverse) {
            for (var vi in minCandidates) {
                var val = minCandidates[vi];

                var candidatesCopy = JSON.parse(JSON.stringify(candidates));
                var candidatesNext = this.search(
                    this.assign(candidatesCopy, minCandidatesSquare, val)
                );

                if (candidatesNext) {
                    return candidatesNext;
                }
            }

            // Rotate through the candidates backwards
        } else {
            for (var vi = minCandidates.length - 1; vi >= 0; --vi) {
                var val = minCandidates[vi];

                var candidatesCopy = JSON.parse(JSON.stringify(candidates));
                var candidatesNext = this.search(
                    this.assign(candidatesCopy, minCandidatesSquare, val),
                    reverse
                );

                if (candidatesNext) {
                    return candidatesNext;
                }
            }
        }

        // If we get through all combinations of the square with the fewest
        // candidates without finding an answer, there isn't one. Return false.
        return false;
    }

    /**
     * Eliminate all values, *except* for `val`, from `candidates` at
     * `square` (candidates[square]), and propagate. Return the candidates map
     * when finished. If a contradiciton is found, return false.
     *
     * WARNING: This will modify the contents of `candidates` directly.
     *
     * @param candidates
     * @param square
     * @param val
     * @returns {Object|boolean}
     */
    assign(candidates, square, val) {
        // Grab a list of canidates without 'val'
        var otherVals = candidates[square].replace(val, "");

        // Loop through all other values and eliminate them from the candidates
        // at the current square, and propigate. If at any point we get a
        // contradiction, return false.
        for (var ovi in otherVals) {
            var otherVal = otherVals[ovi];

            var candidatesNext = this.eliminate(candidates, square, otherVal);

            if (!candidatesNext) {
                //console.log("Contradiction found by _eliminate.");
                return false;
            }
        }

        return candidates;
    }

    /**
     * Eliminate `val` from `candidates` at `square`, (candidates[square]),
     * and propagate when values or places <= 2. Return updated candidates,
     * unless a contradiction is detected, in which case, return false.
     *
     * WARNING: This will modify the contents of `candidates` directly.
     *
     * @param candidates
     * @param square
     * @param val
     * @returns {Object|boolean}
     */
    eliminate(candidates, square, val) {
        // If `val` has already been eliminated from candidates[square], return
        // with candidates.
        if (!this.in(val, candidates[square])) {
            return candidates;
        }

        // Remove `val` from candidates[square]
        candidates[square] = candidates[square].replace(val, "");

        // If the square has only candidate left, eliminate that value from its
        // peers
        var nrCandidates = candidates[square].length;
        if (nrCandidates === 1) {
            var targetVal = candidates[square];

            for (var pi in this.#squarePeersMap[square]) {
                var peer = this.#squarePeersMap[square][pi];

                var candidatesNew = this.eliminate(candidates, peer, targetVal);

                if (!candidatesNew) {
                    return false;
                }
            }

            // Otherwise, if the square has no candidates, we have a contradiction.
            // Return false.
        }
        if (nrCandidates === 0) {
            return false;
        }

        // If a unit is reduced to only one place for a value, then assign it
        for (var ui in this.#squareUnitsMap[square]) {
            var unit = this.#squareUnitsMap[square][ui];

            var valPlaces = [];
            for (var si in unit) {
                var unitSquare = unit[si];
                if (this.in(val, candidates[unitSquare])) {
                    valPlaces.push(unitSquare);
                }
            }

            // If there's no place for this value, we have a contradition!
            // return false
            if (valPlaces.length === 0) {
                return false;

                // Otherwise the value can only be in one place. Assign it there.
            } else if (valPlaces.length === 1) {
                var candidates_new = this.assign(candidates, valPlaces[0], val);

                if (!candidates_new) {
                    return false;
                }
            }
        }

        return candidates;
    }

    /**
     * Return a map of squares -> values
     *
     * @param board
     * @returns {Object}
     */
    getSquareValsMap(board) {
        var squaresValsMap = {};

        // Make sure `board` is a string of length 81
        if (board.length != this.#squares.length) {
            throw "Board/squares length mismatch.";
        } else {
            for (var i in this.#squares) {
                squaresValsMap[this.#squares[i]] = board[i];
            }
        }

        return squaresValsMap;
    }

    /**
     * Return a map of `squares` and their associated units (row, col, box)
     *
     * @param squares
     * @param units
     * @returns {Object}
     */
    getSquareUnitsMap(squares, units) {
        var squareUnitMap = {};

        // For every square...
        for (var si in squares) {
            var curSquare = squares[si];

            // Maintain a list of the current square's units
            var curSquareUnits = [];

            // Look through the units, and see if the current square is in it,
            // and if so, add it to the list of of the square's units.
            for (var ui in units) {
                var curUnit = units[ui];

                if (curUnit.indexOf(curSquare) !== -1) {
                    curSquareUnits.push(curUnit);
                }
            }

            // Save the current square and its units to the map
            squareUnitMap[curSquare] = curSquareUnits;
        }

        return squareUnitMap;
    }

    /**
     * Return a map of `squares` and their associated peers, i.e., a set of
     * other squares in the square's unit.
     *
     * @param squares
     * @param unitsMap
     * @returns {Object}
     */
    getSquarePeersMap(squares, unitsMap) {
        var squarePeersMap = {};

        // For every square...
        for (var si in squares) {
            var curSquare = squares[si];
            var curSquareUnits = unitsMap[curSquare];

            // Maintain list of the current square's peers
            var curSquarePeers = [];

            // Look through the current square's units map...
            for (var sui in curSquareUnits) {
                var cur_unit = curSquareUnits[sui];

                for (var ui in cur_unit) {
                    var curUnitSquare = cur_unit[ui];

                    if (
                        curSquarePeers.indexOf(curUnitSquare) === -1 &&
                        curUnitSquare !== curSquare
                    ) {
                        curSquarePeers.push(curUnitSquare);
                    }
                }
            }

            // Save the current square an its associated peers to the map
            squarePeersMap[curSquare] = curSquarePeers;
        }

        return squarePeersMap;
    }

    /**
     * Return a list of all units (rows, cols, boxes)
     *
     * @param rows
     * @param cols
     * @returns {Array}
     */
    getAllUnits(rows, cols) {
        var units = [];

        // Rows
        for (var ri in rows) {
            units.push(this.cross(rows[ri], cols));
        }

        // Columns
        for (var ci in cols) {
            units.push(this.cross(rows, cols[ci]));
        }

        // Boxes
        var rowSquares = ["ABC", "DEF", "GHI"];
        var colSquares = ["123", "456", "789"];
        for (var rsi in rowSquares) {
            for (var csi in colSquares) {
                units.push(this.cross(rowSquares[rsi], colSquares[csi]));
            }
        }

        return units;
    }

    /**
     * Convert a board string to a two-dimensional array
     *
     * @param boardString
     * @returns {Array}
     */
    boardStringToGrid(boardString) {
        var rows = [];
        var currentRow = [];
        for (var i in boardString) {
            cur_row.push(boardString[i]);
            if (i % 9 == 8) {
                rows.push(currentRow);
                currentRow = [];
            }
        }
        return rows;
    }

    /**
     * Convert a board grid to a string
     *
     * @param boardGrid
     * @returns {string}
     */
    boardGridToString(boardGrid) {
        var boardString = "";
        for (var r = 0; r < 9; ++r) {
            for (var c = 0; c < 9; ++c) {
                boardString += boardGrid[r][c];
            }
        }
        return boardString;
    }

    /**
     * Print a sudoku `board` to the console.
     *
     * @param board
     */
    printBoard(board) {
        var report = this.validateBoard(board);
        if (report !== true) {
            throw report;
        }

        var V_PADDING = " "; // Insert after each square
        var H_PADDING = "\n"; // Insert after each row

        var V_BOX_PADDING = "  "; // Box vertical padding
        var H_BOX_PADDING = "\n"; // Box horizontal padding

        var displayString = "";

        for (var i in board) {
            var square = board[i];

            // Add the square and some padding
            displayString += square + V_PADDING;

            // Vertical edge of a box, insert v. box padding
            if (i % 3 === 2) {
                displayString += V_BOX_PADDING;
            }

            // End of a line, insert horiz. padding
            if (i % 9 === 8) {
                displayString += H_PADDING;
            }

            // Horizontal edge of a box, insert h. box padding
            if (i % 27 === 26) {
                displayString += H_BOX_PADDING;
            }
        }

        console.log(displayString);
    }

    /**
     * Return if the given `board` is valid or not. If it's valid, return true. If it's not, return a string of the reason why it's not.
     *
     * @param board
     * @returns {boolean|string}
     */
    validateBoard(board) {
        // Check for empty board
        if (!board) {
            return "Empty board";
        }

        // Invalid board length
        if (board.length !== this.#nrSquares) {
            return "Invalid board size. Board must be exactly " + this.#nrSquares + " squares.";
        }

        // Check for invalid characters
        for (var i in board) {
            if (!this.in(board[i], this.#digits) && board[i] !== this.#blankChar) {
                return "Invalid board character encountered at index " + i + ": " + board[i];
            }
        }

        // Otherwise, we're good. Return true.
        return true;
    }

    /**
     * Cross product of all elements in `a` and `b`, e.g.,
     * this.cross("abc", "123") ->
     * ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"]
     *
     * @param a rows
     * @param b cols
     * @returns {Array}
     */
    cross(a, b) {
        var result = [];
        for (var ai in a) {
            for (var bi in b) {
                result.push(a[ai] + b[bi]);
            }
        }
        return result;
    }

    /**
     * Return if a value `val` is in sequence `seq`.
     *
     * @param val
     * @param seq
     * @returns {boolean}
     */
    in(val, seq) {
        return seq.indexOf(val) !== -1;
    }

    /**
     * Return the first element in `seq` that is true. If no element is true, return false.
     *
     * @param seq
     * @returns
     */
    firstTrue(seq) {
        for (var i in seq) {
            if (seq[i]) {
                return seq[i];
            }
        }
        return false;
    }

    /**
     * Return a shuffled version of `seq`
     *
     * @param seq
     * @returns {Array}
     */
    shuffel(seq) {
        //Create an array of the same size as `seq` filled with false
        var shuffled = [];
        for (var i = 0; i < seq.length; ++i) {
            shuffled.push(false);
        }

        for (var i in seq) {
            var ti = this.randRange(seq.length);

            while (shuffled[ti]) {
                ti = ti + 1 > seq.length - 1 ? 0 : ti + 1;
            }

            shuffled[ti] = seq[i];
        }

        return shuffled;
    }

    /**
     * Get a random integer in the range of `min` to `max` (non inclusive).
     * If `min` not defined, default to 0. If `max` not defined, throw an error.
     *
     * @param max
     * @param min
     * @returns {number}
     */
    randRange(max, min) {
        min = min || 0;
        if (max) {
            return Math.floor(Math.random() * (max - min)) + min;
        } else {
            throw "Range undefined";
        }
    }

    /**
     * Strip duplicate values from `seq`
     *
     * @param seq
     * @returns {Array}
     */
    stripDups(seq) {
        var seqSet = [];
        var dupMap = {};
        for (var i in seq) {
            var e = seq[i];
            if (!dupMap[e]) {
                seqSet.push(e);
                dupMap[e] = true;
            }
        }
        return seqSet;
    }

    /**
     * Force `nr` to be within the range from `min` to, but not including,
     * `max`. `min` is optional, and will default to 0. If `nr` is undefined,
     * treat it as zero.
     *
     * @param nr
     * @param min
     * @param max
     * @returns {number}
     */
    forceRange(nr, min, max) {
        min = min || 0;
        nr = nr || 0;
        if (nr < min) {
            return min;
        }
        if (nr > max) {
            return max;
        }
        return nr;
    }
}
