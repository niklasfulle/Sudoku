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
            field[y][x] = Number(gameString[i]);
            fieldChecks[y][x] = "x";
        } else {
            if (gameString[i] == "n") {
                field[y][x] = 0;
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
            if (field[i][j] == 0) {
                div.innerHTML = "";
            } else {
                div.innerHTML = field[i][j];
            }
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
    if (check) {
        if (checkX() && checkY() && checkBlock()) {
            play = false;
        } else {}
    }
}

function checkX() {
    for (let x = 0; x < 9; x++) {
        var sum = field[x][0] + field[x][1] + field[x][2] + field[x][3] + field[x][4] + field[x][5] + field[x][6] + field[x][7] + field[x][8];
        if (sum != 45) {
            return false;
        }
    }
    return true;
}

function checkY() {
    for (let y = 0; y < 9; y++) {
        var sum = field[0][y] + field[1][y] + field[2][y] + field[3][y] + field[4][y] + field[5][y] + field[6][y] + field[7][y] + field[8][y];
        if (sum != 45) {
            return false;
        }
    }
    return true;
}

function checkBlock() {
    var block1 = field[0][0] + field[0][1] + field[0][2] + field[1][0] + field[1][1] + field[1][2] + field[2][0] + field[2][1] + field[2][2];
    var block2 = field[0][3] + field[0][4] + field[0][5] + field[1][3] + field[1][4] + field[1][5] + field[2][3] + field[2][4] + field[2][5];
    var block3 = field[0][6] + field[0][7] + field[0][8] + field[1][6] + field[1][7] + field[1][8] + field[2][6] + field[2][7] + field[2][8];
    var block4 = field[3][0] + field[3][1] + field[3][2] + field[4][0] + field[4][1] + field[4][2] + field[5][0] + field[5][1] + field[5][2];
    var block5 = field[3][3] + field[3][4] + field[3][5] + field[4][3] + field[4][4] + field[4][5] + field[5][3] + field[5][4] + field[5][5];
    var block6 = field[3][6] + field[3][7] + field[3][8] + field[4][6] + field[4][7] + field[4][8] + field[5][6] + field[5][7] + field[5][8];
    var block7 = field[6][0] + field[6][1] + field[6][2] + field[7][0] + field[7][1] + field[7][2] + field[8][0] + field[8][1] + field[8][2];
    var block8 = field[6][3] + field[6][4] + field[6][5] + field[7][3] + field[7][4] + field[7][5] + field[8][3] + field[8][4] + field[8][5];
    var block9 = field[6][6] + field[6][7] + field[6][8] + field[7][6] + field[7][7] + field[7][8] + field[8][6] + field[8][7] + field[8][8];

    if (block1 != 45 || block2 != 45 || block3 != 45 || block4 != 45 || block5 != 45 || block6 != 45 || block7 != 45 || block8 != 45 || block9 != 45) {
        return false;
    }

    return true;
}