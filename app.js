const grid = document.querySelector(".grid-container");
const numPlate = document.querySelector(".num-plate");
const gridTabSound = new Audio("gridTap.wav");
for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
        const div = document.createElement("div");
        div.classList.add("grid-item");
        div.style.backgroundColor = `#FFFBAC`;
        div.style.borderRadius = `5px`;
        div.style.gridColumnStart = j;
        div.style.gridColumnEnd = j + 1;
        div.style.gridRowStart = i;
        div.style.gridRowEnd = i + 1;
        div.style.border = `0.4px solid black`;
        grid.appendChild(div);
        div.addEventListener("click", (event) => {
            console.dir(div);
            checkNum(div);
            console.log(div.firstElementChild.style.backgroundColor);
        })
    }
}
// calling API
let url = "https://sudoku-api.vercel.app/api/dosuku";
let data = [],rawData = [];
async function getData() {
    return await fetch(url)
        .then(async (res) => {
            return await res.json();
        })
        .then((res) => {
            data = res;
            console.log("res :",res);
            rawData = res.newboard.grids[0].value;
        })
}
getData();
let sudoku = [];
// fill grid values
setTimeout(() => {
    // data = rawData;
    createSudoku();
}, 500)
function createSudoku() {
    console.log("data = ", data);
    let k = 0, cell = 0;
    sudoku = data.newboard.grids[0].value;
    const gridItems = document.querySelectorAll(".grid-item");
    console.log(gridItems);
    for (let i = 0; i < 81; i++) {
        if ((i != 0 && i % 9) === 0) k++;
        let cellVal = data.newboard.grids[0].value[k][i % 9];
        if (cellVal == 0)
            gridItems[cell++].innerHTML = "";
        else {
            let circle = createNumCircle(`#E25E3E`, `#111`);
            circle.innerHTML = cellVal;
            gridItems[cell].innerHTML = "";
            gridItems[cell++].appendChild(circle);
        }
    }
}
// create linked list for undo / back 
class node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}
function insert(head, HTMLnode) {
    if (head == null) { return head = last = new node(HTMLnode); }
    // if (isPresent(HTMLnode.innerText));
    last.next = new node(HTMLnode);
    last = last.next;
    return head;
}
function delAtEnd(head) {
    if (head == null) return null;
    let curr = head;
    if (curr == last) {
        head = last = curr = null;
        return null;
    }
    while (curr.next != last) curr = curr.next;
    curr.next = null;
    last = curr;
    return head;
}
let head = null, last = null;
let prevCell;
let cellNo;
let circle;
function delCircle() {
    head = delAtEnd(head);
    console.log("last  ", last);
    const childCircle = prevCell.querySelector("div");
    console.log("childCircle", childCircle);
    if (prevCell.firstElementChild)
        prevCell.removeChild(childCircle); // move to another cell
    if (last)
        prevCell = last.data;
}
function checkNum(cell) {
    if (cell.innerHTML != "" && cell.firstElementChild.style.backgroundColor == `#E25E3E`) return; // can't updated by user
    if (head == null) prevCell = undefined;
    console.log("prevCell :", prevCell);
    if (prevCell != undefined && prevCell.innerText == "") {   // prev cell the user remains empty
        if(cell.innerHTML == ""){
            delAtEnd();
            if(last)
            prevCell = last.data;
        }
        delCircle();
    }
    console.log("cell clicked");
    cellNo = cell;
    circle = createNumCircle(`#FFBA86`, `#000`);
    circle.style.fontWeight = `900`;
    cell.innerHTML = "";
    cell.appendChild(circle);
    head = insert(head, cell);
    isSolved();
    printList(head);
    prevCell = cell;
    gridTabSound.play();
}
function printList(head) {
    let curr = head;
    console.log("print list : ");
    while (curr) {
        console.log(curr); curr = curr.next;
    }
}
function insertNum(btn) {
    circle.innerHTML = btn.innerHTML;
}
const btns = document.querySelectorAll("div.numBtn");
for (let btn of btns) {
    btn.addEventListener("click", () => {
        console.log(btn.innerHTML, " clicked");
        return insertNum(btn);
    });
}
function createNumCircle(bgcolor, color) {
    const circle = document.createElement("div");
    circle.style.height = `3rem`;
    circle.style.width = `3rem`;
    circle.style.borderRadius = `100%`;
    circle.style.backgroundColor = bgcolor;
    circle.style.color = color;
    circle.style.fontWeight = `600`;
    return circle;
}
let solutionBtn = document.querySelector(".solution");
solutionBtn.addEventListener("click", sudokuSolver);
function isSafe(r, c, num) {
    for (let i = 0; i < 9; i++) {
        if (sudoku[r][i] == num || sudoku[i][c] == num) return false;
    }
    let sr = r - r % 3;
    let sc = c - c % 3;
    for (let i = sr; i < sr + 3; i++) {
        for (let j = sc; j < sc + 3; j++)
            if (sudoku[i][j] == num) return false;
    }
    return true;
}
function sudokuSolve() {
    let r = -1, c = -1;
    for (let i = 0; i < sudoku.length; i++) {
        for (let j = 0; j < sudoku.length; j++) {
            if (sudoku[i][j] == 0) {
                r = i, c = j;
                break;
            }
        }
    }
    if (r == -1) {
        console.log("sudoku has been solved");
        console.log(sudoku);
        return true;
    }
    for (let digit = 1; digit <= 9; digit++) {
        if (isSafe(r, c, digit)) {
            sudoku[r][c] = digit;
            if (sudokuSolve() == true) return true;
            sudoku[r][c] = 0;
        }
    }
    return false;
}
function sudokuSolver() {
    sudokuSolve();
    const gridItems = document.querySelectorAll(".grid-item");
    let k = -1;
    for (let i = 0; i < 81; i++) {
        if (i % 9 == 0) k++;
        if (gridItems[i].innerText == "" || gridItems[i].firstElementChild.style.backgroundColor === `rgb(255, 186, 134)`) {
            let circle = createNumCircle(`#FFBA86`, `000`)
            circle.style.fontWeight = `900`;
            circle.innerText = sudoku[k][i % 9];
            gridItems[i].innerHTML = "";
            gridItems[i].appendChild(circle);
        }
    }
isSolved();

}
let backBtn = document.querySelector(".back");
backBtn.addEventListener("click", () => {
    if (head)
        delCircle();
});

// reset the sudoku
let resetBtn = document.querySelector(".reset");
resetBtn.addEventListener("click", () => {
    let resetSound = new Audio("reset-sound.wav");
    resetSound.play();
    const gridItems = document.querySelectorAll(".grid-item");
    for (let i = 0; i < 81; i++) {
        if(gridItems[i].firstElementChild&&gridItems[i].firstElementChild.style.backgroundColor == `rgb(255, 186, 134)`){
            gridItems[i].innerHTML = "";
        }
    }
    prevCell = undefined;
    head = last = null;
    let hline = document.querySelectorAll(".hline");
    let vline = document.querySelectorAll(".vline");
    for(let i = 0;i<2;i++){
        hline[i].style.backgroundColor = `#C63D2F`;
        vline[i].style.backgroundColor = `#C63D2F`;
    }
});
function isSafeUserSudoku(r,c,num){
    for (let i = 0; i < 9; i++) {
            if (i!=c&&userSudoku[r][i] == num || i!=r&&userSudoku[i][c] == num) return false;
    }
    let sr = r - r % 3;
    let sc = c - c % 3;
    for (let i = sr; i < sr + 3; i++) {
        for (let j = sc; j < sc + 3; j++)
        if(i!=r&&j!=c)
            if (userSudoku[i][j] == num) return false;
    }
    return true;
}
let userSudoku = [];
function isSolved() {
    userSudoku = sudoku;
    const gridItems = document.querySelectorAll(".grid-item");
    for (let i = 0; i < 81; i++) 
        if (gridItems[i].innerText == "")
            return false;
    let k = 0;
    for (let i = 0; i < 81; i++) {
        if (i != 0 && i % 9 == 0) k++;
        userSudoku[k][i % 9] = gridItems[i].innerText;
    }
    for (let i = 0; i < userSudoku.length; i++) {
        for (let j = 0; j < userSudoku.length; j++) {
            if (isSafeUserSudoku(i, j, userSudoku[i][j]) == false){
                console.log("i ,j val",i,j,userSudoku[i][j]);
                return false;
            }
        }
    }
    const success = new Audio("success-sound.mp3");
    success.play();
    console.log("userSudoku : ", userSudoku);
    let hline = document.querySelectorAll(".hline");
    let vline = document.querySelectorAll(".vline");
    for(let i = 0;i<2;i++){
        hline[i].style.backgroundColor = "gold";
        vline[i].style.backgroundColor = "gold";
    }

    return true;
}
