export class Star {
  constructor({ x, y, radius, speed, opacity, flickerSpeed }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.opacity = opacity;
    this.flickerSpeed = flickerSpeed;
  }

  update(deltaTime) {
    this.opacity += this.flickerSpeed * (Math.random() > 0.5 ? 1 : -1);
    this.opacity = Math.max(0.3, Math.min(1, this.opacity));

    this.y += this.speed * deltaTime;
    if (this.y > 1) {
      this.y = 0;
      this.x = Math.random();
    }
  }

  draw(ctx, canvas) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; // todo: changer
    ctx.beginPath();
    ctx.arc(
      this.x * canvas.width,
      this.y * canvas.height,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}
