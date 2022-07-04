const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var field;
var selected;
const gameString = "9n7nnnnnnbnnnn4n8n2bnnnnnnn9bnn56nnn7nb4n683nn5nb7nn9nn4n1b12n385n46b5nnn9nn83b3nnn71n2n";

function init() {
    field = new Array(9);
    for (var i = 0; i < field.length; i++) {
        field[i] = new Array(9);
    }

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            field[i][j] = "";
        }
    }
    initGame();
    dispalyField();
}

function initGame() {
    var [y, x] = [0, 0];
    for (var i = 0; i < gameString.length; i++) {
        if (gameString[i] != "n" && gameString[i] != "b") {
            field[y][x] = gameString[i];
        } else {
            if (gameString[i] == "n") {
                field[y][x] = " ";
            }
        }
        if (gameString[i] == "b") {
            x = 0;
            y++;
        } else {
            x++;
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
    if (selected != undefined) {
        field[i][j] = selected;
    }
    dispalyField();
}