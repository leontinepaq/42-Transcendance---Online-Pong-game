const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Couches d'étoiles pour le parallax
const layers = [
	{ numStars: 20 * (canvas.width / 1440), speed: 0.3, maxRadius: 1 },  
	{ numStars: 40 * (canvas.width / 1440), speed: 0.2, maxRadius: 2 },  
	{ numStars: 50 * (canvas.width / 1440), speed: 0.1, maxRadius: 3 }  
];

let stars = [];
let shootingStars = [];
let planet = {
	x: canvas.width / 2, 
	y: canvas.height / 3, 
	radius: 10, 
	angle: 0, 
	orbitX: canvas.width / 3,  // Largeur de l'orbite
	orbitY: canvas.height / 6, // Hauteur de l'orbite
	descentSpeed: 0.2,         // Vitesse de descente
	ringAngle: 0  // Rotation de l'anneau
  };

// Générer les étoiles
layers.forEach(layer => {
for (let i = 0; i < layer.numStars; i++) {
	stars.push({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		radius: Math.random() * layer.maxRadius + 0.5,
		speed: layer.speed,
		opacity: Math.random(),
		flickerSpeed: 0.1 * (Math.random() > 0.9 ? 1 : 0) // vitesse de scintillement
	});
}
});

// Créer une étoile filante
function createShootingStar() {
	const star = {
		x: Math.random() * canvas.width, // Départ aléatoire
		y: Math.random() * (canvas.height / 2), // Apparaît en haut
		length: Math.random() * 100 + 50, // Longueur de la traînée
		speedX: Math.random() * 4 + 6, // Vitesse horizontale
		speedY: 0, // Initialisation de la vitesse verticale
		opacity: 1
	};
	star.speedY = star.speedX / 2, // Vitesse verticale
	shootingStars.push(star);

	// Supprime l'étoile filante après 1 seconde
	setTimeout(() => {
	shootingStars.shift();
	}, 2000);
}

// Dessiner l'anneau autour de la planète
function drawRing() {
	ctx.save();
	ctx.translate(planet.x, planet.y);
	ctx.rotate(planet.ringAngle);  // Rotation de l'anneau
	ctx.strokeStyle = "rgb(252, 122, 30)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(0, 0, planet.radius * 2, planet.radius * 0.6, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
  }

// Dessiner la planète
function drawPlanet() {
	ctx.fillStyle =  "rgb(242, 62, 0)";
	ctx.beginPath();
	ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
	ctx.fill();

	drawRing();

	// Mise à jour de la position en courbes
	planet.angle += 0.002; // Modifier cette valeur pour des mouvements plus amples ou plus serrés
	planet.ringAngle += 0.01; // Rotation de l'anneau
	planet.x = canvas.width / 2 + Math.cos(planet.angle) * planet.orbitX;  
	planet.y += planet.descentSpeed ;
  
	// Faire reboucler la planète si elle sort de l'écran
	if (planet.x > canvas.width + planet.radius) planet.x = -planet.radius;
	if (planet.y > canvas.height + planet.radius) planet.y = -planet.radius;
}


// Animation du ciel
function drawScene() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Dessiner les étoiles
	stars.forEach(star => {
		// Changement d'opacité pour le scintillement
		star.opacity += star.flickerSpeed * (Math.random() > 0.5 ? 1 : -1);
		if (star.opacity > 1) star.opacity = 1;
		if (star.opacity < 0.3) star.opacity = 0.3;

		ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
		ctx.fill();

		// Déplacer l'étoile vers le bas pour l'effet de défilement
		star.y += star.speed;
		if (star.y > canvas.height) {
		star.y = 0;
		star.x = Math.random() * canvas.width; // Nouvelle position X aléatoire
		}
	});

	// Dessiner les étoiles filantes
	shootingStars.forEach(star => {
		ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(star.x, star.y);
		ctx.lineTo(star.x - star.length, star.y - star.length / 2);
		ctx.stroke();
		
		// Déplacer l'étoile filante
		star.x += star.speedX;
		star.y += star.speedY;
		star.opacity -= 0.01; // Réduire l'opacité
	});

	// Dessiner la planète animée
	drawPlanet();

	requestAnimationFrame(drawScene);
}

// Générer une étoile filante de manière aléatoire
setInterval(() => {
	if (Math.random() > 0.7) createShootingStar(); // 30% de chances d'apparition
}, 2000);

// Ajuster la taille du canvas si la fenêtre est redimensionnée
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

drawScene();
