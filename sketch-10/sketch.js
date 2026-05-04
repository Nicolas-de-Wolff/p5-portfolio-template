// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#D8DBE2';   // 60% — dominante
let col2 = '#5B6571';   // 30% — secondaire
let col3 = '#FF9B34';   // 10% — accent (rare !)

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

let maxDepth = 7;        // profondeur de récursion
let angleL, angleR;      // angles gauche et droite des branches
let lengthFactor = 0.68; // ratio de réduction par génération
let globalAngle = 0;     // rotation globale lente
let noiseT = 0;          // offset bruit de Perlin
let branchCount = 0;     // compteur de branches pour la couleur
let totalBranches = 0;   // total estimé pour la grille

function setup() {
  createCanvas(500, 500);
  strokeCap(ROUND);

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  // Estimation du nombre de branches pour la grille
  totalBranches = 0;
  for (let d = 0; d <= maxDepth; d++) {
    totalBranches += pow(2, d);
  }
  totalBranches = int(totalBranches) * 3; // marge

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < totalBranches; i++) {
    let r = random(100);
    colorGrid[i] = r < 40 ? 2 : 1;
    accentGrid[i] = random(100) < 10 ? true : false;
  }
}

function draw() {
  background(0, 25); // trainée douce
  noiseT += 0.005;
  globalAngle += 0.003;

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

  // Influence souris sur les angles
  let mx = mouseX;
  let my = mouseY;
  let mouseActive = mx > 0 && mx < width && my > 0 && my < height;

  // Angles animés par bruit de Perlin + souris
  let baseAngleL = noise(noiseT) * PI * 0.6 + 0.15;
  let baseAngleR = noise(noiseT + 10) * PI * 0.6 + 0.15;

  if (mouseActive) {
    let mx01 = map(mx, 0, width, -0.3, 0.3);
    let my01 = map(my, 0, height, 0.1, 0.6);
    angleL = baseAngleL + mx01 + my01 * 0.3;
    angleR = baseAngleR - mx01 + my01 * 0.3;
  } else {
    angleL = baseAngleL;
    angleR = baseAngleR;
  }

  // Longueur du tronc animée
  let trunkLen = map(noise(noiseT * 0.7), 0, 1, 60, 100);

  // Réinitialise le compteur de branches
  branchCount = 0;

  // ✦ Arbre 1 — central vers le haut
  push();
  translate(width / 2, height - 40);
  rotate(globalAngle * 0.3);
  branch(trunkLen, 0, maxDepth);
  pop();

  // ✦ Arbre 2 — miroir vers le bas
  push();
  translate(width / 2, 40);
  rotate(PI + globalAngle * 0.3);
  branch(trunkLen * 0.8, 0, maxDepth - 1);
  pop();

  // ✦ Arbre 3 — gauche
  push();
  translate(30, height / 2);
  rotate(-HALF_PI + globalAngle * 0.2);
  branch(trunkLen * 0.65, 0, maxDepth - 2);
  pop();

  // ✦ Arbre 4 — droite
  push();
  translate(width - 30, height / 2);
  rotate(HALF_PI - globalAngle * 0.2);
  branch(trunkLen * 0.65, 0, maxDepth - 2);
  pop();

  // 🖱️ Cercle souris
  if (mouseActive) {
    noFill();
    stroke(red(c3), green(c3), blue(c3), 20);
    strokeWeight(0.5);
    ellipse(mx, my, 160);
    ellipse(mx, my, 80);
  }
}

function branch(len, depth, maxD) {
  if (len < 2 || depth > maxD) return;

  branchCount++;
  let idx = branchCount % totalBranches;

  // 🎨 Couleur selon profondeur et grille
  let col;
  if (showAccent && accentGrid[idx]) {
    col = c3;
  } else if (colorGrid[idx] === 2) {
    col = c2;
  } else {
    col = c1;
  }

  // Opacité et épaisseur selon profondeur
  let depthFactor = map(depth, 0, maxD, 1.0, 0.0);
  let alpha = map(depthFactor, 0, 1, 40, 220);
  let sw = map(depthFactor, 0, 1, 0.3, 3.5);

  stroke(red(col), green(col), blue(col), alpha);
  strokeWeight(sw);
  noFill();

  // Légère ondulation par bruit sur chaque branche
  let wobble = noise(depth * 0.5, branchCount * 0.1, noiseT) * 0.15 - 0.075;

  line(0, 0, 0, -len);
  translate(0, -len);

  // Halo lumineux sur les branches fines (feuilles)
  if (depth >= maxD - 1) {
    noStroke();
    fill(red(col), green(col), blue(col), alpha * 0.3);
    ellipse(0, 0, sw * 6);
    noFill();
  }

  // Nœud d'articulation visible
  if (depth < maxD - 2) {
    noStroke();
    fill(red(col), green(col), blue(col), alpha * 0.5);
    ellipse(0, 0, sw * 2.5);
    noFill();
  }

  // Branche gauche
  push();
  rotate(-angleL + wobble);
  branch(len * lengthFactor, depth + 1, maxD);
  pop();

  // Branche droite
  push();
  rotate(angleR + wobble);
  branch(len * lengthFactor, depth + 1, maxD);
  pop();

  // Branche centrale (mutation) — toutes les 2 profondeurs
  if (depth % 2 === 0 && depth < maxD - 1) {
    push();
    rotate(wobble * 3);
    branch(len * lengthFactor * 0.7, depth + 2, maxD);
    pop();
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('composition_fractals', 'webp');
  }
  if (key === 'r' || key === 'R') {
    generateGrid();
  }
  // + / - pour ajuster la profondeur
  if (key === '+' && maxDepth < 9) {
    maxDepth++;
    generateGrid();
  }
  if (key === '-' && maxDepth > 3) {
    maxDepth--;
    generateGrid();
  }
}