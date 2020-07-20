"use strict";

class Block {
  constructor(xAxis, yAxis, width, height, value) {
    this.x = xAxis;
    this.y = yAxis;
    this.w = width;
    this.h = height;
    this.value = value;
  }

  drawboard() {
    if (this.value) {
      let padding = 5;
      canvascontext.strokeStyle = "#000";
      canvascontext.font = (this.w / 4).toString() + "px Georgia";
      canvascontext.textAlign = "center";
      canvascontext.textBaseline = "middle";
      canvascontext.fillStyle = "#7d4b1488";
      canvascontext.fillRect(this.x + padding, this.y + padding, this.w - padding, this.h - padding);
      canvascontext.strokeRect(this.x + padding, this.y + padding, this.w - padding, this.h - padding);
      canvascontext.fillStyle = "#000";
      canvascontext.fillText(this.value.toString(), this.x + this.w / 2, this.y + this.h / 2, width * 0.75);
    }
  }

  meetPoint(xAxis, yAxis) {
    return (
      xAxis > this.x &&
      xAxis < this.x + this.w &&
      yAxis > this.y &&
      yAxis < this.y + this.h
    );
  }

  sendingTo(position) {
    moving++;
    let pos = {
      xAxis: position.x,
      yAxis: position.y,
    }
    let vel = {
      xAxis: (this.x - pos.x) / 10,
      yAxis: (this.y - pos.y) / 10,
    }
    let self = this;
    let n = 0;
    let movement = () => {
      drawCompleteBoard();
      self.x -= vel.xAxis;
      self.y -= vel.yAxis;
      if (n >= 10) {
        self.x = pos.xAxis;
        self.y = pos.yAxis;
        moving--;
      }
      else {
        setTimeout(movement, 8);
        n++;
      }
    };
    setTimeout(movement, 8);
  }
}

function shuffleBox(array) {
  for (let i = 0; i < array.length; ++i) {
    let newI = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[newI];
    array[newI] = temp;
  }
}

function isValidNearBox(index1, index2) {
  let position1 = toNested(index1);
  let position2 = toNested(index2);
  let distance1 = Math.abs(position1[0] - position2[0]);
  let distance2 = Math.abs(position1[1] - position2[1]);
  if (!distance1 || !distance2) {
    if (distance1 === 1 || distance2 === 1) {
      return distance1 !== distance2;
    }
  }
  return false;
}

function toNested(index) {
  return [ index % boardSize, Math.floor(index / boardSize) ];
}

function findZero() {
  for (let i = 0; i < board.length; ++i) {
    if (board[i].value === 0) {
      return i;
    }
  }
}

function win() {
  if (!moving) {
    canvascontext.clearRect(0, 0, width, height);
    canvascontext.fillStyle = "#000";
    canvascontext.font = "50px Georgia";
    canvascontext.textAlign = "center";
    canvascontext.textBaseline = "middle";
    canvascontext.fillText(`You won the game}!`, width / 2, height / 2);
    setTimeout(() => {
      location.reload();
    }, 2000);
  }
  else {
    setTimeout(win, 150);
  }
}

function drawCompleteBoard() {
  canvascontext.clearRect(0, 0, width, height);
  board.forEach(block => {
    block.drawboard();
  });
}

function updateBoard() {
  drawCompleteBoard();
  if (checkWinner()) {
    setTimeout(() => {
      canvas.removeEventListener("click", handleClick);
      setTimeout(win, 1000);
    }, 200);
  }
}

function checkWinner() {
  let blockcordinate = board.slice(0);
  blockcordinate.splice(findZero(), 1);
  for (let i = 1; i < blockcordinate.length; ++i) {
    if (blockcordinate[i].value < blockcordinate[i - 1].value) {
      return false;
    }
  }
  return true;
}

const canvas = document.getElementById("display");
const canvascontext = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
let boardSize;
let board;
let moving;

function init() {

boardSize = 3;
  board = Array.from(Array(boardSize ** 2).keys());
  shuffleBox(board);
  for (let i = 0; i < board.length; ++i) {
    let pos = toNested(i);
    let w = width / boardSize;
    let h = height / boardSize;
    board[i] = new Block(pos[0] * w, pos[1] * h, w, h, board[i]);
  }
  updateBoard();
}

function handleClick(e) {
  if (!moving) {
    let rect = canvas.getBoundingClientRect();
    for (let i = 0; i < board.length; ++i) {
      if (board[i].meetPoint(e.clientX - rect.x, e.clientY - rect.y)) {
        let zIndex = findZero();
        if (isValidNearBox(i, zIndex)) {
          let tempPosition = {
            x: board[i].x,
            y: board[i].y,
          };
          board[i].sendingTo(board[zIndex]);
          board[zIndex].sendingTo(tempPosition);
          let temp = board[i];
          board[i] = board[zIndex];
          board[zIndex] = temp;
        }
        break;
      }
    }
    updateBoard();
  }
}

canvas.addEventListener("click", handleClick);

init();