var upgradeTime = 1;
var seconds = upgradeTime;

function timer() {
    var days = Math.floor(seconds / 24 / 60 / 60);
    var hoursLeft = Math.floor(seconds - days * 86400);
    var hours = Math.floor(hoursLeft / 3600);
    var minutesLeft = Math.floor(hoursLeft - hours * 3600);
    var minutes = Math.floor(minutesLeft / 60);
    var remainingSeconds = seconds % 60;

    function pad(n) {
        return n < 10 ? "0" + n : n;
    }
    document.getElementById("timer").innerHTML = pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds);
    if (play) {
        if (seconds == 3600) {
            clearInterval(countdownTimer);
            document.getElementById("timer").innerHTML = "Overtime";
        } else {
            seconds++;
        }
    }
}

var countdown = setInterval("timer()", 1000);

function getCountdown() {
    return countdown;
}