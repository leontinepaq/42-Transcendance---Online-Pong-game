import { Planet } from "./Planet.js";
import { setupCanvas } from "./utils.js";

export const PlanetAnimation = {
  canvas: null,
  ctx: null,
  planets: [],
  animationId: null,
  planetColors: [
    { planet: "#511db2", ring: "#402092" },
    { planet: "#9628b3", ring: "#7a1e91" },
    { planet: "#fc318a", ring: "#d02771" },
  ],

  init() {
    if (this.animationId !== null) return;
    this.canvas = document.getElementById("stars");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    setupCanvas(this.canvas);

    this.planets = this.createPlanets(Math.random() * 3 + 2);
    this.animate();
    window.addEventListener("resize", () => {
      setupCanvas(this.canvas);
    });
  },

  createPlanets(nbPlanets) {
    const planets = [];
    for (let i = 0; i < nbPlanets; i++) {
      const color = this.planetColors[i % this.planetColors.length];
      planets.push(
        new Planet({
          color: color,
          x: i % 2 ? 0 : 1,
          y: (i + Math.random() / 2) / nbPlanets,
          radius: Math.random() * 10 + 5,
          angle: Math.random() * Math.PI * 2,
          orbitX: 0.2 + Math.random() * 0.3,
          descentSpeed: Math.random() * 0.0003 + 0.0001,
          ringAngle: Math.random() * Math.PI * 2,
        })
      );
    }
    return planets;
  },

  animate() {
    this.planets.forEach((planet) => {
      planet.update(this.canvas);
      planet.draw(this.ctx, this.canvas);
    });
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.planets.every((planet) => planet.exited)) this.stop();
  },

  exit() {
    this.planets.forEach((planet) => (planet.exiting = true));
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },
};
