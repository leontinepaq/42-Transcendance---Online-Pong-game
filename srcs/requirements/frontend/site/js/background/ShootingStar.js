export class ShootingStar {
  constructor({ x, y, length, speed, opacity, angle }) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.speed = speed;
    this.opacity = opacity;
    this.angle = angle;
  }

  update(deltaTime) {
    this.x += this.speed * Math.cos(this.angle) * deltaTime;
    this.y += this.speed * Math.sin(this.angle) * deltaTime;
    this.opacity -= 0.001 * deltaTime;
    if (this.opacity <= 0 || this.x < 0 || this.x > 1 || this.y > 1)
      this.opacity = 0;
  }

  draw(ctx, canvas) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x * canvas.width, this.y * canvas.height);
    ctx.lineTo(
      (this.x - this.length * Math.cos(this.angle)) * canvas.width,
      (this.y - this.length * Math.sin(this.angle)) * canvas.height
    );
    ctx.stroke();
  }
}
