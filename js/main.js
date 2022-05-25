'use strict'

const MINE = '💣';
const FLAG = '🚩';
const LIVES = '❤️'

var gBoard
var gClickCounts
var gLives
var gGame
var gIntervalId

var gLevel = {
    size: 4,
    mines: 4
}

function inIt() {
    gLives = 3
    gClickCounts = 0
    gBoard = buildBord();
    renderButton('😁');
    renderBoard(gBoard)
    renderLives();
    clearInterval(gIntervalId);
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    // addMines();
    // console.table(gBoard);
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
    // board[1][2].isMine = true
    // board[1][2].isShown = true
    // getRandomCell(gBoard);
    console.table(board)
    return board
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            cellClass += (currCell.isMine === false) ? '' : ' mine';

            strHTML += `<td class="cell ${cellClass}" onclick="cellClicked(${i}, ${j})" oncontextmenu="cellMarked(${i}, ${j})">`
            // if (currCell.isMine === true && currCell.isShown === true) strHTML += MINE;
            // if (currCell.isMarked === true && currCell.isShown === false) strHTML += FLAG;

            strHTML += '</td>';
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

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
    // console.log(count);
    return count
}

// מוסיפה מוקשים במיקומים רנדומלים 
function addMines() {
    for (var i = 0; i < gLevel.mines; i++) {
        var randCell = getRandomCell()
        gBoard[randCell.i][randCell.j].isMine = true;
    }
}

function getRandomCell() {
    var cells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine === false) {
                cells.push({ i: i, j: j })
            }
        }
    }
    // return cells
    var randIdx = getRandomInt(0, cells.length);
    var randCell = cells.splice(randIdx, 1)[0]
    console.log(randCell);
    return randCell
}


function cellClicked(i, j) {
    var cell = gBoard[i][j];
    if (cell.isShown === true) return
    if (gGame.isOn === false) return
    if (cell.isMarked === true) return;

    gClickCounts++
    if (gClickCounts === 1) addMines();
    startTimer()

    var minesCount = setMinesNegsCount(gBoard, i, j)
    cell.minesAroundCount = minesCount;

    // console.log(i, j);
    if (cell.isMine === true) {
        gLives--
        if (gLives === 0) {
            renderLives();
            gameOver();
        } else {
            cell.isShown = true;
            renderButton('😥')
            renderLives()
            renderCell({ i: i, j: j }, MINE)
        }
        // console.log(gLives);
    } else {
        cell.isShown = true;
        var num = (minesCount === 0) ? '' : minesCount;
        renderCell({ i: i, j: j }, num)
    }
    checkGameOver()
    // console.log(gBoard[i][j]);
}

// פונקציה שחושפת את כל המוקשים
function openMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                gBoard[i][j].isShown = true;
                renderCell({ i, j }, MINE)
            }
        }
    }
}


function cellMarked(i, j) {
    event.preventDefault()
    if (gBoard[i][j].isMarked === true) {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--
        renderCell({ i, j }, '');
    } else {
        gBoard[i][j].isMarked = true;
        renderCell({ i, j }, FLAG);
        gGame.markedCount++
    }
}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMarked === false || cell.isShown === false) return
        }
    }
    console.log('you winnnn');
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
    var elLives = document.querySelector('.lives')
    console.log(elLives);
    elLives.innerText = '';
    for (var i = 0; i < gLives; i++) {
        elLives.innerText += '❤️';
    }
}

function renderButton(img) {
    var elBtn = document.querySelector('.restart');
    elBtn.innerText = img
}







