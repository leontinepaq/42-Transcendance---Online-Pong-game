import {doLanguage} from "./translate.js"
import { show, hide } from "./utils.js";

const i18n = {
  "Waiting for 2nd player": "waiting",
  "Player got disconnected": "disconnected",
}

export default class Game {

  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.leftScore = document.getElementById("leftScore");
    this.rightScore = document.getElementById("rightScore");
    this.backgroundText = document.getElementById("gameBackgroundText");
    this.instructions = document.getElementById("gameInstructions");
    this.instructionsText = document.getElementById("instructionsText");
    this.drawPause();
  }

  clear() {
    // this.clearMessage();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBall(x, y, r) {
    this.ctx.beginPath();
    this.ctx.arc(
      (x * this.canvas.width) / 100,
      (y * this.canvas.height) / 100,
      (r * this.canvas.width) / 100,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.arcTo(x + width, y, x + width, y + radius, radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arcTo(x, y, x + radius, y, radius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawPaddle(state) {
    this.drawRoundedRect(
      (state.left.top_left_corner.x * this.canvas.width) / 100,
      (state.left.top_left_corner.y * this.canvas.height) / 100,
      (state.left.width * this.canvas.width) / 100,
      (state.left.height * this.canvas.height) / 100,
      5
    );
    this.drawRoundedRect(
      (state.right.top_left_corner.x * this.canvas.width) / 100,
      (state.right.top_left_corner.y * this.canvas.height) / 100,
      (state.right.width * this.canvas.width) / 100,
      (state.right.height * this.canvas.height) / 100,
      5
    );
  }

  drawPrediction(state) {
    this.ctx.beginPath();
    this.ctx.arc(
      (state.right.top_left_corner.x * this.canvas.width) / 100 - 5,
      (state.prediction_y * this.canvas.height) / 100,
      (state.ball.r * this.canvas.width) / 100,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = "red";
    this.ctx.fill();
    this.ctx.fillStyle = "white";
  }

  drawPause() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "50px Arial";
    this.ctx.textAlign = "center";

    const barWidth = 20;
    const barHeight = 100;
    const pauseX = this.canvas.width / 2 - 40;
    const pauseY = this.canvas.height / 2 - barHeight / 2;
    this.ctx.fillRect(pauseX + 10, pauseY, barWidth, barHeight);
    this.ctx.fillRect(pauseX + 50, pauseY, barWidth, barHeight);
    show(this.instructions);
  }

  updateScore(state) {
    this.leftScore.textContent = state.score[0];
    this.rightScore.textContent = state.score[1];
  }

  writeMessage(msg) {
    // console.log("Writing game message ", msg);
    this.clear();
    this.backgroundText.setAttribute("data-i18n", i18n[msg]);
    doLanguage();
  }

  clearMessage() {
    this.backgroundText.removeAttribute("data-i18n");
    this.backgroundText.innerText = "";
  }

  draw(state) {
    this.clear();
    hide(this.instructions);
    this.updateScore(state);
    this.drawBall(state.ball.x, state.ball.y, state.ball.r);
    this.drawPaddle(state);
  }

  setInstructions(mode) {
    if (mode == "multi")
      this.instructionsText.dataset.i18n="instructions-local"
    else
      this.instructionsText.dataset.i18n="instructions"
  }
}
