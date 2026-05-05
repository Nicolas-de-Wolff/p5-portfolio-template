// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#D8DBE2';   // 60% — dominante
let col2 = '#5B6571';   // 30% — secondaire
let col3 = '#34FFB2';   // 10% — accent

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

let maxDepth = 6;
let spreadAngle;
let shrinkFactor = 0.72;

let noiseT = 0;
let globalRot = 0;

let nodeCount = 0;
let totalNodes = 1200;

// =====================
// 🚀 SETUP
// =====================
function setup() {
  createCanvas(500, 500);
  strokeCap(ROUND);

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  generateGrid();
}

// =====================
// 🎲 GRILLE COULEUR
// =====================
function generateGrid() {
  colorGrid = [];
  accentGrid = [];

  for (let i = 0; i < totalNodes; i++) {
    let r = random(100);
    colorGrid[i] = r < 42 ? 2 : 1;
    accentGrid[i] = random(100) < 10;
  }
}

// =====================
// 🎬 DRAW
// =====================
function draw() {
  background(0, 20);

  noiseT += 0.005;
  globalRot += 0.002;

  if (frameCount % reshuffleInterval === 0) {
    generateGrid();
  }

  // Accent apparition
  if (!showAccent && frameCount % accentInterval === 0 && random() < 0.5) {
    showAccent = true;
    accentTimer = accentDuration;
  }

  if (showAccent) {
    accentTimer--;
    if (accentTimer <= 0) showAccent = false;
  }

  // Souris influence
  let mx = mouseX;
  let my = mouseY;
  let mouseActive = mx > 0 && mx < width && my > 0 && my < height;

  let mouseSpread = mouseActive
    ? map(dist(mx, my, width/2, height/2), 0, 300, 0.4, 1.1, true)
    : 0.75;

  spreadAngle = noise(noiseT) * PI * mouseSpread;

  nodeCount = 0;

  translate(width/2, height/2);
  rotate(globalRot);

  // ✦ 6 centres de croissance
  for (let i = 0; i < 6; i++) {
    push();
    rotate((TWO_PI / 6) * i);
    translate(0, 40 + sin(frameCount * 0.01 + i) * 10);
    crystalBranch(80, 0, maxDepth);
    pop();
  }

  // ✦ Rosace centrale
  drawCore();

  // 🖱️ Aura souris
  if (mouseActive) {
    noFill();
    stroke(red(c3), green(c3), blue(c3), 20);
    strokeWeight(0.5);
    ellipse(mx - width/2, my - height/2, 150);
  }
}

// =====================
// ❄️ FRACTALE CRISTAL
// =====================
function crystalBranch(len, depth, maxD) {
  if (len < 2 || depth > maxD) return;

  nodeCount++;
  let idx = nodeCount % totalNodes;

  let col;
  if (showAccent && accentGrid[idx]) {
    col = c3;
  } else if (colorGrid[idx] === 2) {
    col = c2;
  } else {
    col = c1;
  }

  let depthFactor = map(depth, 0, maxD, 1, 0);
  let alpha = map(depthFactor, 0, 1, 35, 220);
  let sw = map(depthFactor, 0, 1, 0.25, 3);

  stroke(red(col), green(col), blue(col), alpha);
  strokeWeight(sw);

  let jitter = noise(depth * 0.3, nodeCount * 0.05, noiseT) * 0.25 - 0.12;

  line(0, 0, 0, -len);
  translate(0, -len);

  // Nœud lumineux
  noStroke();
  fill(red(col), green(col), blue(col), alpha * 0.3);
  ellipse(0, 0, sw * 5);
  noFill();

  // Branche gauche
  push();
  rotate(-spreadAngle + jitter);
  crystalBranch(len * shrinkFactor, depth + 1, maxD);
  pop();

  // Branche droite
  push();
  rotate(spreadAngle + jitter);
  crystalBranch(len * shrinkFactor, depth + 1, maxD);
  pop();

  // Branche diagonale supplémentaire
  if (depth % 2 === 0) {
    push();
    rotate(jitter * 4);
    crystalBranch(len * shrinkFactor * 0.65, depth + 2, maxD);
    pop();
  }
}

// =====================
// 💠 COEUR CENTRAL
// =====================
function drawCore() {
  noFill();

  for (let r = 20; r < 100; r += 18) {
    stroke(255, 8);
    strokeWeight(0.4);
    ellipse(0, 0, r * 2);
  }

  noStroke();
  fill(255, 25);
  ellipse(0, 0, 30);

  fill(255, 100);
  ellipse(0, 0, 8);
}

// =====================
// ⌨️ CONTROLES
// =====================
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('crystal_fractal', 'webp');
  }

  if (key === 'r' || key === 'R') {
    generateGrid();
  }

  if (key === '+' && maxDepth < 8) {
    maxDepth++;
  }

  if (key === '-' && maxDepth > 3) {
    maxDepth--;
  }
}