export class Planet {
  constructor({ color, x, y, radius, angle, orbitX, descentSpeed, ringAngle }) {
    this.color = color;
    this.entrySide = x < 0.5 ? "left" : "right";
    this.x = this.entrySide === "left" ? -0.2 : 1.2;
    this.y = y;
    this.radius = radius;
    this.angle = angle;
    this.orbitX = orbitX;
    this.descentSpeed = descentSpeed;
    this.ringAngle = ringAngle;
    this.entering = true;
    this.entryProgress = 0.2 * Math.random();
    this.exiting = false;
    this.exited = false;
  }

  update(canvas) {
    if (this.exiting) this.exitUpdate(canvas);
    else if (this.entering) this.entryUpdate();
    else this.normalUpdate(canvas);
  }

  normalUpdate(canvas) {
    this.angle += 0.002;
    this.ringAngle += 0.01;
    this.x = 0.5 + Math.cos(this.angle) * this.orbitX;
    this.y += this.descentSpeed;
    if (this.y > 1 + this.radius / canvas.height)
      this.y = -this.radius / canvas.height - 0.01;
  }

  entryUpdate() {
    this.entryProgress += 0.005;
    if (this.entryProgress >= 1) this.entering = false;
    const easeOutCubic = (t) => --t * t * t + 1;
    const t = easeOutCubic(this.entryProgress);
    const finalX = 0.5 + Math.cos(this.angle) * this.orbitX;
    if (this.entrySide === "left") this.x = -0.2 + (finalX + 0.2) * t;
    else this.x = 1.2 - (1.2 - finalX) * t;
    this.y += this.descentSpeed;
  }

  exitUpdate(canvas) {
    this.angle += 0.03;
    this.orbitX += 0.004;
    this.x = 0.5 + Math.cos(this.angle) * this.orbitX;
    this.y += this.descentSpeed * 1.8;
    if (
      this.y > 1 + this.radius / canvas.height ||
      this.x < -this.radius / canvas.width ||
      this.x > 1 + this.radius / canvas.width
    )
      this.exited = true;
  }

  draw(ctx, canvas) {
    if (this.exited) return;
    //draw body
    ctx.fillStyle = this.color.planet;
    ctx.beginPath();
    ctx.arc(
      this.x * canvas.width,
      this.y * canvas.height,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    //draw ring
    ctx.save();
    ctx.translate(this.x * canvas.width, this.y * canvas.height);
    ctx.rotate(this.ringAngle);
    ctx.strokeStyle = this.color.ring;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 2, this.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
