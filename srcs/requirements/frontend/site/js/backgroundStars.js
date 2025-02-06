const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Dégradé du fond
function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#020111");
    gradient.addColorStop(1, "#202040");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Couches d'étoiles pour le parallax
const layers = [
	{ numStars: 20 * (canvas.width / 1440), speed: 0.0003, maxRadius: 1 },  
	{ numStars: 40 * (canvas.width / 1440), speed: 0.0002, maxRadius: 2 },  
	{ numStars: 50 * (canvas.width / 1440), speed: 0.0001, maxRadius: 3 }  
];

let stars = [];
let shootingStars = [];
let planet = {
    x: canvas.width / 2, 
    y: canvas.height / 3, 
    radius: 10, 
    angle: 0, 
    orbitX: canvas.width / 3, 
    orbitY: canvas.height / 6,
    descentSpeed: 0.2,
    ringAngle: 0
};

function generateStars() {
    stars = [];
    layers.forEach(layer => {
        for (let i = 0; i < layer.numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * layer.maxRadius + 0.5,
                speed: layer.speed,
                opacity: Math.random() * 0.7 + 0.3,
                flickerSpeed: 0.02 * (Math.random() > 0.5 ? 1 : -1)
            });
        }
    });
}

generateStars();

function createShootingStar() {
    const star = {
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        length: Math.random() * 100 + 50,
        speedX: Math.random() * 4 + 6,
        speedY: Math.random() * 2 + 1,
        opacity: 1
    };
    shootingStars.push(star);
}

function drawRing() {
    ctx.save();
    ctx.translate(planet.x, planet.y);
    ctx.rotate(planet.ringAngle);
    ctx.strokeStyle = "rgba(252, 122, 30, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, planet.radius * 2.2, planet.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawPlanet() {
    ctx.fillStyle = "rgb(242, 62, 0)";
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fill();
    drawRing();
    planet.angle += 0.002;
    planet.ringAngle += 0.01;
    planet.x = canvas.width / 2 + Math.cos(planet.angle) * planet.orbitX;
    planet.y += planet.descentSpeed;

    if (planet.y > canvas.height + planet.radius) planet.y = -planet.radius;
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

	// Dessiner les étoiles
	stars.forEach(star => {
		// Changement d'opacité pour le scintillement
		star.opacity += star.flickerSpeed * (Math.random() > 0.5 ? 1 : -1);
		if (star.opacity > 1) star.opacity = 1;
		if (star.opacity < 0.3) star.opacity = 0.3;

		ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
		ctx.beginPath();
		ctx.arc(star.x * canvas.width, star.y * canvas.height, star.radius, 0, Math.PI * 2);
		ctx.fill();

		// Déplacer l'étoile vers le bas pour l'effet de défilement
		star.y += star.speed;
		if (star.y > 1) {
		star.y = 0;
		star.x = Math.random(); // Nouvelle position X aléatoire
		}
	});

    shootingStars.forEach((star, index) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length, star.y - star.length / 2);
        ctx.stroke();
        star.x += star.speedX;
        star.y += star.speedY;
        star.opacity -= 0.015;
        if (star.opacity <= 0) shootingStars.splice(index, 1);
    });

    drawPlanet();
    requestAnimationFrame(drawScene);
}

setInterval(() => {
    if (Math.random() > 0.7) createShootingStar();
}, 2000);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateStars();
	drawScene();
});

drawScene();
