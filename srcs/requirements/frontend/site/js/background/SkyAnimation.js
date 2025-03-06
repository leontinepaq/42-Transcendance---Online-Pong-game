import { ShootingStar } from "./ShootingStar.js";
import { Star } from "./Star.js";
import { setupCanvas } from "./utils.js";

export const SkyAnimation = {
  canvas: null,
  ctx: null,
  stars: [],
  shootingStars: [],
  animationId: null,
  lastTs: performance.now(),
  lastShootingStarTs: performance.now(),

  starLayers: [
    { numStars: 20, speed: 3 / 100000, maxRadius: 1 },
    { numStars: 40, speed: 2 / 100000, maxRadius: 2 },
    { numStars: 50, speed: 1 / 100000, maxRadius: 3 },
  ],

  launch() {
    this.lastTs = performance.now();
    this.lastShootingStarTs = performance.now();

    if (this.animationId !== null) return;
    this.canvas = document.getElementById("stars");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    setupCanvas(this.canvas);

    this.initStars();
    this.animate();

    window.addEventListener("resize", () => {
      setupCanvas(this.canvas);
    });
  },

  initStars() {
    this.stars = [];
    this.starLayers.forEach((layer) => {
      for (let i = 0; i < layer.numStars; i++) {
        this.stars.push(
          new Star({
            x: Math.random(),
            y: Math.random(),
            radius: Math.random() * layer.maxRadius + 0.5,
            speed: layer.speed,
            opacity: Math.random(),
            flickerSpeed: Math.random() > 0.9 ? 0.1 : 0,
          })
        );
      }
    });
  },

  createShootingStar() {
    const minAngle = (Math.PI * 1) / 6;
    const maxAngle = (Math.PI * 5) / 6;

    this.shootingStars.push(
      new ShootingStar({
        x: Math.random(),
        y: Math.random() / 2,
        length: Math.random() * 0.1 + 0.02,
        speed: (Math.random() + 2) / 10000,
        angle: Math.random() * Math.PI * 2,
        angle: minAngle + Math.random() * (maxAngle - minAngle),
        opacity: Math.random() * 0.7 + 0.3,
      })
    );
  },

  tryCreateShootingStar(ts) {
    if (ts - this.lastShootingStarTs < 2000) return;
    if (Math.random() > 0.7) this.createShootingStar();
    this.lastShootingStarTs = ts;
  },

  animate(ts = performance.now()) {
    const deltaTime = Math.min(ts - this.lastTs, 100);

    this.tryCreateShootingStar(ts);

    this.shootingStars = this.shootingStars.filter(
      (shootingStar) => shootingStar.opacity > 0
    );
    this.stars.forEach((star) => star.update(deltaTime));
    this.shootingStars.forEach((shootingStar) =>
      shootingStar.update(deltaTime)
    );

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars.forEach((star) => star.draw(this.ctx, this.canvas));
    this.shootingStars.forEach((shootingStar) =>
      shootingStar.draw(this.ctx, this.canvas)
    );

    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    this.lastTs = ts;
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },
};
