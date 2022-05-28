'use strict'

const MINE = '💀';
const FLAG = '🚩';
const LIVES = '❤️';
const HINT = '💡';

var gIsHint
var gHints
var gBoard
var gClickCounts
var gLives
var gGame
var gIntervalId
var gLevel = {
    size: 4,
    mines: 2
}

function inIt() {
    gIsHint = false;
    gHints = 3;
    gLives = 3;
    gClickCounts = 0;
    gBoard = buildBord();
    renderButton('😁');
    renderBoard(gBoard)
    renderLives();
    addMines();
    renderHints()
    clearInterval(gIntervalId);
    var elSpanTimer = document.querySelector('.timer');
    elSpanTimer.innerText = '';
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}

function buildBord() {
    var board = createMat(gLevel.size)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            // var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            strHTML += `<td class="cell ${cellClass}" onclick="cellClicked(${i}, ${j}, this)" oncontextmenu="cellMarked(${i}, ${j})">`
            strHTML += '</td>';
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// סופרת שכנים
function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (cell.isMine === true) {
                count++
            }
        }
    }
    return count
}

// מוסיפה מוקשים במיקומים רנדומלים 
function addMines() {
    for (var i = 0; i < gLevel.mines; i++) {
        var randCell = getRandomCell()
        gBoard[randCell.i][randCell.j].isMine = true;
        // console.log(gBoard[randCell.i][randCell.j].isMine);
    }
}

// מחזירה תא רנדומאלי
function getRandomCell() {
    var cells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine === false) {
                cells.push({ i: i, j: j })
            }
        }
    }
    var randIdx = getRandomInt(0, cells.length);
    var randCell = cells.splice(randIdx, 1)[0]
    console.log(randCell);
    return randCell
}


function cellClicked(i, j, elCell) {
    var cell = gBoard[i][j];
    if (cell.isShown === true) return
    if (gGame.isOn === false) return
    if (cell.isMarked === true) return;

    var minesCount = setMinesNegsCount(gBoard, i, j);
    cell.minesAroundCount = minesCount
    var num = (minesCount === 0) ? '' : minesCount;

    if (gClickCounts === 0) {
        if (cell.isMine === true) {
            var newMine = getRandomCell();
            gBoard[newMine.i][newMine.j].isMine = true;

            cell.isMine = false;
            cell.isShown = true;
            elCell.classList.add('occupited');
            renderCell({ i: i, j: j }, num);
        }
        startTimer()
        gClickCounts++
    }

    if (gIsHint === true) {
        // renderCellColor({ i: i, j: j }, 'grey');
        elCell.classList.add('occupited');
        renderCell({ i: i, j: j }, num);
        openNegsAround(gBoard, i, j);

        setTimeout(function () {
            gIsHint = false;
            closeNegsAround(gBoard, i, j)
            renderHints()
        }, 500)
    }

    if (cell.isMine === true) {
        if (gIsHint === true) return
        cell.isShown = true;
        renderCellColor({ i: i, j: j }, 'rgb(191, 26, 26)');
        gLives--
        if (gLives === 0) {
            renderLives();
            gameOver();
        } else {
            // cell.isShown = true;
            renderButton('😥')
            renderLives()
            renderCell({ i: i, j: j }, MINE)
        }
    } else {
        if (cell.minesAroundCount === 0) {
            openNegsAround(gBoard, i, j);
        }
        cell.isShown = true;
        renderCell({ i: i, j: j }, num);
        renderCellColor({ i: i, j: j }, 'grey');
    }
    checkGameOver()
}

// פותחת את השכנים מסביב
function openNegsAround(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            // if (i === rowIdx && j === colIdx) continue;
            var cell = board[i][j];
            // if(gBoard[i][j].isShown === true)continue;
            if (cell.isMine === true && gIsHint === true) {
                renderCell({ i: i, j: j }, MINE);
            } else {
                cell.isShown = true;
                var minesCount = setMinesNegsCount(gBoard, i, j);
                cell.minesAroundCount = minesCount;
                var num = (minesCount === 0) ? '' : minesCount;
                renderCell({ i: i, j: j }, num);
            }
            renderCellColor({ i: i, j: j }, 'grey');
        }
    }
}

function renderCellColor(location, color) {
    var cellSelector = '.' + getClassName(location); // {i:i,j:j}
    var elCell = document.querySelector(cellSelector);
    elCell.style.backgroundColor = color;
}

// פונקציה שחושפת את כל המוקשים
function openMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                gBoard[i][j].isShown = true;
                renderCell({ i, j }, MINE)
                renderCellColor({ i, j }, 'grey')
            }
        }
    }
}

function cellMarked(i, j) {
    event.preventDefault()
    var cell = gBoard[i][j];
    if (gClickCounts === 0) {
        startTimer()
        gClickCounts++
    }
    if (cell.isMarked === true) {
        cell.isMarked = false;
        cell.isShown = false;
        gGame.markedCount--
        renderCell({ i, j }, '');
    } else {
        cell.isMarked = true;
        cell.isShown = true;
        renderCell({ i, j }, FLAG);
        gGame.markedCount++
    }
}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            if (cell.isShown === false) return
        }
    }
    clearInterval(gIntervalId);
    renderButton('🏆');
}

function gameOver() {
    gGame.isOn = false;
    clearInterval(gIntervalId);
    openMines();
    renderButton('😑');
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location) // {i:i,j:j}
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

function renderLives() {
    var elLives = document.querySelector('.lives');
    elLives.innerText = '';
    for (var i = 0; i < gLives; i++) {
        elLives.innerText += LIVES;
    }
}

function renderButton(img) {
    var elBtn = document.querySelector('.restart');
    elBtn.innerText = img
}

function restart(size, minesCount) {
    gLevel.size = size;
    gLevel.mines = minesCount;
    inIt();
}

function openHint() {
    gIsHint = true;
    gHints--
    renderHints();
    var elHint = document.querySelector('.hints');
    elHint.innerText += '🤓';
}

function renderHints() {
    var elHint = document.querySelector('.hints');
    elHint.innerText = '';
    for (var i = 0; i < gHints; i++) {
        elHint.innerText += HINT;
    }
}

function closeNegsAround(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            // if(gBoard[i][j].isShown === true)continue;
            var cell = board[i][j];
            cell.isShown = false;
            renderCell({ i: i, j: j }, '');
            renderCellColor({ i: i, j: j }, 'rgb(94 94 94)');
        }
    }
}