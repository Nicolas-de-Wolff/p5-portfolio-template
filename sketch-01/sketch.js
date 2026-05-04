// =====================
// 🎨 PALETTE 60-30-10
// =====================
// 👇 Modifie les couleurs ici
let col1 = '#5B6571';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#F3102C';   // 10% — accent (rare !)

let c1, c2, c3;
let particles = [];
let colorGrid = [];
let accentGrid = [];
let numParticles = 300;
let reshuffleInterval = 240; // 4 secondes à 60fps

// =====================
// ⚙️ PARAMÈTRES ACCENT
// =====================
let showAccent = false;
let accentTimer = 0;
let accentDuration = 120;  // 2 secondes
let accentInterval = 120;

function setup() {
  createCanvas(500, 500);
  noStroke();

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < numParticles; i++) {
    let r = random(100);
    colorGrid[i] = r < 40 ? 2 : 1;
    accentGrid[i] = random(100) < 10 ? true : false;
  }
}

function draw() {
  background(0, 40); // trainée légère

  // 🔄 Redistribue toutes les 4 secondes
  if (frameCount % reshuffleInterval === 0) {
    generateGrid();
  }

  // 🎲 Apparition de l'accent
  if (!showAccent && frameCount % accentInterval === 0 && random() < 0.5) {
    showAccent = true;
    accentTimer = accentDuration;
  }
  if (showAccent) {
    accentTimer--;
    if (accentTimer <= 0) showAccent = false;
  }

  let cx = width / 2;
  let cy = height / 2;

  // Centre gravitationnel
  fill(255, 60);
  ellipse(cx, cy, 6, 6);

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.update(cx, cy, particles);
    
    // 🎨 Couleur depuis la grille figée
    let col;
    if (showAccent && accentGrid[i]) {
      col = c3;
    } else if (colorGrid[i] === 2) {
      col = c2;
    } else {
      col = c1;
    }

    fill(red(col), green(col), blue(col), 200);
    ellipse(p.pos.x, p.pos.y, p.size);
  }
}

class Particle {
  constructor() {
    // Position en orbite aléatoire autour du centre
    let angle = random(TWO_PI);
    let radius = random(30, 200);
    this.pos = createVector(
      width / 2 + cos(angle) * radius,
      height / 2 + sin(angle) * radius
    );

    // Vitesse orbitale perpendiculaire au rayon
    let speed = sqrt(0.08 * 800 / radius) * random(0.8, 1.2);
    this.vel = createVector(
      -sin(angle) * speed,
      cos(angle) * speed
    );

    this.acc = createVector(0, 0);
    this.size = random(2, 5);
    this.mass = this.size * 0.5;
  }

  update(cx, cy, others) {
    // Attraction vers le centre
    let toCenter = createVector(cx - this.pos.x, cy - this.pos.y);
    let d = toCenter.mag();
    d = constrain(d, 10, 300);
    let gravForce = 0.08 * 800 / (d * d);
    toCenter.normalize().mult(gravForce);
    this.acc.add(toCenter);

    // Répulsion entre particules proches
    for (let other of others) {
      if (other === this) continue;
      let diff = p5.Vector.sub(this.pos, other.pos);
      let dist = diff.mag();
      if (dist < 20 && dist > 0) {
        diff.normalize().mult(0.3 / dist);
        this.acc.add(diff);
      }
    }

    this.vel.add(this.acc);
    this.vel.limit(4);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Rebond sur les bords
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}