function createMat(size) {
    var mat = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function startTimer() {
    gStartTime = Date.now()
    gIntervalId = setInterval(updateTime, 100)
}

function updateTime() {
    var now = Date.now();
    var diff = now - gStartTime;
    var seconds = diff / 1000;
    var elSpanTimer = document.querySelector('.timer');
    elSpanTimer.innerText = seconds.toFixed(0);

}

// console.table(createMat(gLevel.size));