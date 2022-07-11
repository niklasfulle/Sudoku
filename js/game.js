var play = false;
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var field;
var fieldChecks;
var selected;
var gameString = "";
var gameDifficulty = "";

function init() {
  field = new Array(9);
  fieldChecks = new Array(9);
  for (var i = 0; i < field.length; i++) {
    field[i] = new Array(9);
    fieldChecks[i] = new Array(9);
  }

  selectGameString();
  initGame();
  dispalyField();
}

function selectGameString() {
  if (document.getElementById("easy").checked) {
    gameString = sudoku.generate("easy");
  } else if (document.getElementById("medium").checked) {
    gameString = sudoku.generate("medium");
  } else if (document.getElementById("hard").checked) {
    gameString = sudoku.generate("hard");
  } else if (document.getElementById("veryhard").checked) {
    gameString = sudoku.generate("very-hard");
  } else if (document.getElementById("insane").checked) {
    gameString = sudoku.generate("insane");
  } else if (document.getElementById("inhuman").checked) {
    gameString = sudoku.generate("inhuman");
  }
}

function initGame() {
  var [x, y] = [0, 0];
  for (var i = 0; i < gameString.length; i++) {
    if (gameString[i] != ".") {
      field[x][y] = Number(gameString[i]);
      fieldChecks[x][y] = "x";
    } else {
      field[x][y] = 0;
      fieldChecks[x][y] = " ";
    }
    if (x == 8) {
      y++;
      x = 0;
    } else {
      x++;
    }
  }

  for (var i = 0; i < gameString.length; i++) {
    if (gameString[i] != ".") {
      numberCount[gameString[i] - 1]++;
    }
  }
}

function start() {
  play = true;
  init();
  document.getElementById("background").style.display = "none";
  document.getElementById("start").style.display = "none";
}

function count() {
  numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var x = 0; x < 9; x++) {
    for (var y = 0; y < 9; y++) {
      if (field[x][y] != " ") {
        numberCount[field[x][y] - 1]++;
        var divNumber = document.getElementById("number" + field[x][y]);
        if (numberCount[field[x][y] - 1] == 9) {
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
  for (var x = 0; x < 9; x++) {
    for (var y = 0; y < 9; y++) {
      var div = document.createElement("div");
      if (field[y][x] == 0) {
        div.innerHTML = "";
      } else {
        div.innerHTML = field[y][x];
      }
      div.setAttribute("class", "piece");
      var id = "field" + x + "" + y + "";
      div.setAttribute("id", "" + id + "");
      if (x % 3 == 0) {
        div.setAttribute("class", "piece pieceT");
        if (y == 2 || y == 5) {
          div.setAttribute("class", "piece pieceT pieceR");
        }

        if (y == 3 || y == 6) {
          div.setAttribute("class", "piece pieceT pieceL");
        }
      }
      if (x == 2 || x == 5 || x == 8) {
        div.setAttribute("class", "piece pieceB");
        if (y == 2 || y == 5) {
          div.setAttribute("class", "piece pieceB pieceR");
        }

        if (y == 3 || y == 6) {
          div.setAttribute("class", "piece pieceB pieceL");
        }
      }
      if (y % 3 == 0) {
        div.setAttribute("class", "piece pieceL");
        if (x == 2 || x == 5 || x == 8) {
          div.setAttribute("class", "piece pieceL pieceB");
        }

        if (x % 3 == 0) {
          div.setAttribute("class", "piece pieceL pieceT");
        }
      }

      if (y == 2 || y == 5 || y == 8) {
        div.setAttribute("class", "piece pieceR");
        if (x == 2 || x == 5 || x == 8) {
          div.setAttribute("class", "piece pieceR pieceB");
        }

        if (x % 3 == 0) {
          div.setAttribute("class", "piece pieceR pieceT");
        }
      }
      div.setAttribute("onclick", "selectField(" + x + "," + y + ")");
      divField.append(div);
    }
  }
}

function dispalyNumbers() {
  var divNumbers = document.getElementById("numberSelect");
  for (var i = 0; i < 9; i++) {
    var div = document.createElement("div");
    numbers[i] != 0 ? (div.innerHTML = numbers[i]) : (div.innerHTML = "");

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
      if (fieldChecks[j][i] != "x") {
        field[j][i] = selected;
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
  for (var x = 0; x < 9; x++) {
    for (var y = 0; y < 9; y++) {
      if (field[x][y] == " ") {
        return false;
      }
    }
  }
  if (check) {
    if (checkX() && checkY() && checkBlock()) {
      play = false;
    } else {
    }
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
