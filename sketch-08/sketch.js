// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#5B6571';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#EB0707';   // 10% — accent (rare !)

// =====================
// ⚙️ PARAMÈTRES
// =====================
let showAccent = false;
let accentTimer = 0;
let accentDuration = 120;
let accentInterval = 120;
let colorGrid = [];
let accentGrid = [];
let reshuffleInterval = 240;

let trail = [];         // sillage principal
let particles = [];     // particules secondaires
let maxTrail = 80;      // longueur max du sillage
let prevMX, prevMY;     // position précédente de la souris

function setup() {
  createCanvas(500, 500);
  noStroke();

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  prevMX = width / 2;
  prevMY = height / 2;

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < maxTrail; i++) {
    let r = random(100);
    colorGrid[i] = r < 40 ? 2 : 1;
    accentGrid[i] = random(100) < 10 ? true : false;
  }
}

function draw() {
  background(0, 30); // trainée légère

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

  let mx = mouseX;
  let my = mouseY;

  // Vélocité de la souris
  let vx = mx - prevMX;
  let vy = my - prevMY;
  let speed = sqrt(vx * vx + vy * vy);

  // Ajoute le point au sillage si la souris bouge
  if (speed > 0.5) {
    trail.push({
      x: mx,
      y: my,
      vx: vx,
      vy: vy,
      age: 0
    });

    // 🌟 Éjection de particules secondaires perpendiculaires
    let numSecondary = int(map(speed, 0, 20, 1, 5));
    for (let k = 0; k < numSecondary; k++) {
      // Vecteur perpendiculaire à la direction
      let perpX = -vy;
      let perpY = vx;
      let perpLen = sqrt(perpX * perpX + perpY * perpY);
      if (perpLen > 0) {
        perpX /= perpLen;
        perpY /= perpLen;
      }
      let side = random([-1, 1]);
      let ejSpeed = random(0.5, 3.5);

      // 🎨 Couleur de la particule
      let r = random(100);
      let col;
      if (showAccent && r < 10) {
        col = c3;
      } else if (r < 40) {
        col = c2;
      } else {
        col = c1;
      }

      particles.push({
        x: mx + random(-3, 3),
        y: my + random(-3, 3),
        vx: perpX * side * ejSpeed + random(-0.5, 0.5),
        vy: perpY * side * ejSpeed + random(-0.5, 0.5),
        life: 255,
        decay: random(3, 8),
        size: random(1.5, 5),
        col: col
      });
    }
  }

  // Limite la longueur du sillage
  if (trail.length > maxTrail) trail.shift();

  // ✨ Dessin du sillage principal
  for (let i = 0; i < trail.length; i++) {
    let t = trail[i];
    t.age++;

    let ageFactor = map(i, 0, trail.length, 0, 1);
    let alpha = map(ageFactor, 0, 1, 20, 220);
    let s = map(ageFactor, 0, 1, 2, 14);

    // 🎨 Couleur depuis la grille figée
    let idx = i % maxTrail;
    let col;
    if (showAccent && accentGrid[idx]) {
      col = c3;
    } else if (colorGrid[idx] === 2) {
      col = c2;
    } else {
      col = c1;
    }

    // Halo extérieur diffus
    fill(red(col), green(col), blue(col), alpha * 0.15);
    ellipse(t.x, t.y, s * 3.5);

    // Halo intermédiaire
    fill(red(col), green(col), blue(col), alpha * 0.35);
    ellipse(t.x, t.y, s * 1.8);

    // Point central brillant
    fill(red(col), green(col), blue(col), alpha);
    ellipse(t.x, t.y, s * 0.7);
  }

  // 🛸 Dessin des particules secondaires
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94; // friction
    p.vy *= 0.94;
    p.life -= p.decay;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    // Halo diffus
    fill(red(p.col), green(p.col), blue(p.col), p.life * 0.15);
    ellipse(p.x, p.y, p.size * 3);

    // Point central
    fill(red(p.col), green(p.col), blue(p.col), p.life);
    ellipse(p.x, p.y, p.size);
  }

  // 💡 Point lumineux au bout de la souris
  if (speed > 0.5) {
    let glow = map(speed, 0, 20, 8, 24);
    fill(255, 60);
    ellipse(mx, my, glow * 2);
    fill(255, 150);
    ellipse(mx, my, glow * 0.6);
  }

  prevMX = mx;
  prevMY = my;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('composition_sillage', 'webp');
  }
  if (key === 'r' || key === 'R') {
    trail = [];
    particles = [];
    generateGrid();
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}