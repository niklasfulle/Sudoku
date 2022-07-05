var play = true;
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var field;
var fieldChecks;
var selected;
const gameString = "9n7nnnnnnbnnnn4n8n2bnnnnnnn9nbnn56nnn7nb4n683nn5nb7nn9nn4n1b12n385n46b5nnn9nn83b3nnn71n2n";

function init() {
    field = new Array(9);
    fieldChecks = new Array(9);
    for (var i = 0; i < field.length; i++) {
        field[i] = new Array(9);
        fieldChecks[i] = new Array(9);
    }

    initGame();
    dispalyField();
}

function initGame() {
    var [y, x] = [0, 0];
    for (var i = 0; i < gameString.length; i++) {
        if (gameString[i] != "n" && gameString[i] != "b") {
            field[y][x] = gameString[i];
            fieldChecks[y][x] = "x";
        } else {
            if (gameString[i] == "n") {
                field[y][x] = " ";
                fieldChecks[y][x] = " ";
            }
        }
        if (gameString[i] == "b") {
            x = 0;
            y++;
        } else {
            x++;
        }
    }

    for (var i = 0; i < gameString.length; i++) {
        if (gameString[i] != "n" && gameString[i] != "b") {
            numberCount[gameString[i] - 1]++;
        }
    }
}

function count() {
    numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (field[i][j] != " ") {
                numberCount[field[i][j] - 1]++;
                var divNumber = document.getElementById("number" + field[i][j]);
                if (numberCount[field[i][j] - 1] == 9) {
                    divNumber.classList.add("active1");
                } else {
                    divNumber.classList.remove("active1");
                }
            }
        }
    }
}

function dispalyField() {
    var divField = document.getElementById("game");
    divField.innerHTML = "";
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var div = document.createElement("div");
            div.innerHTML = field[i][j];
            div.setAttribute("class", "piece");
            var id = "field" + i + "" + j + "";
            div.setAttribute("id", "" + id + "");
            if (i % 3 == 0) {
                div.setAttribute("class", "piece pieceT");
                if (j == 2 || j == 5) {
                    div.setAttribute("class", "piece pieceT pieceR");
                }

                if (j == 3 || j == 6) {
                    div.setAttribute("class", "piece pieceT pieceL");
                }
            }
            if (i == 2 || i == 5 || i == 8) {
                div.setAttribute("class", "piece pieceB");
                if (j == 2 || j == 5) {
                    div.setAttribute("class", "piece pieceB pieceR");
                }

                if (j == 3 || j == 6) {
                    div.setAttribute("class", "piece pieceB pieceL");
                }
            }
            if (j % 3 == 0) {
                div.setAttribute("class", "piece pieceL");
                if (i == 2 || i == 5 || i == 8) {
                    div.setAttribute("class", "piece pieceL pieceB");
                }

                if (i % 3 == 0) {
                    div.setAttribute("class", "piece pieceL pieceT");
                }
            }

            if (j == 2 || j == 5 || j == 8) {
                div.setAttribute("class", "piece pieceR");
                if (i == 2 || i == 5 || i == 8) {
                    div.setAttribute("class", "piece pieceR pieceB");
                }

                if (i % 3 == 0) {
                    div.setAttribute("class", "piece pieceR pieceT");
                }
            }
            div.setAttribute("onclick", "selectField(" + i + "," + j + ")");
            divField.append(div);
        }
    }
}

function dispalyNumbers() {
    var divNumbers = document.getElementById("numberSelect");
    for (var i = 0; i < 9; i++) {
        var div = document.createElement("div");
        div.innerHTML = numbers[i];
        var number = i + 1;
        div.setAttribute("class", "piece");
        div.setAttribute("id", "number" + number);
        div.setAttribute("onclick", "selectNumber(" + number + ")");
        divNumbers.append(div);
    }
}

function selectNumber(number) {
    selected = number;
    var divNumber = document.getElementById("number" + number);
    for (var i = 1; i <= 9; i++) {
        document.getElementById("number" + i).classList.remove("active");
    }
    divNumber.classList.add("active");
}

function selectField(i, j) {
    if (numberCount[selected - 1] <= 8) {
        if (selected != undefined) {
            if (fieldChecks[i][j] != "x") {
                field[i][j] = selected;
            }
        }
        numberCount[selected - 1]++;
    }
    count();
    dispalyField();
    checkForFinish() ? (play = false) : (play = true);
}

function checkForFinish() {
    var check = true;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (field[i][j] == " ") {
                return false;
            }
        }
    }
    return check;
}