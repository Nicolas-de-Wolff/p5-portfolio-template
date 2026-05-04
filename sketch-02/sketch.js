// =====================
// 🎨 PALETTE 60-30-10
// =====================
// 👇 Modifie les couleurs ici
let col1 = '#5B6571';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#42BAFF';   // 10% — accent (rare !)

let c1, c2, c3;
let points = [];
let connections = [];
let numPoints = 30;
let colorGrid = [];
let accentGrid = [];
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

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  // Points fixes répartis sur le canvas
  for (let i = 0; i < numPoints; i++) {
    points.push(createVector(random(40, width - 40), random(40, height - 40)));
  }

  // Connexions entre points proches
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      let d = dist(points[i].x, points[i].y, points[j].x, points[j].y);
      if (d < 150) {
        connections.push([i, j]);
      }
    }
  }

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < connections.length; i++) {
    let r = random(100);
    colorGrid[i] = r < 40 ? 2 : 1;
    accentGrid[i] = random(100) < 10 ? true : false;
  }
}

function draw() {
  background(0);

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

  let mouse = createVector(mouseX, mouseY);

  // 🕸️ Dessin des fils
  for (let i = 0; i < connections.length; i++) {
    let [a, b] = connections[i];
    let pA = points[a];
    let pB = points[b];

    // Distance de la souris au milieu du fil
    let mid = createVector((pA.x + pB.x) / 2, (pA.y + pB.y) / 2);
    let dMouse = dist(mouse.x, mouse.y, mid.x, mid.y);
    let influence = constrain(map(dMouse, 0, 150, 1, 0), 0, 1);

    // Point de contrôle attiré vers la souris
    let ctrl = createVector(
      mid.x + (mouse.x - mid.x) * influence * 0.5,
      mid.y + (mouse.y - mid.y) * influence * 0.5
    );

    // 🎨 Couleur depuis la grille figée
    let col;
    if (showAccent && accentGrid[i]) {
      col = c3;
    } else if (colorGrid[i] === 2) {
      col = c2;
    } else {
      col = c1;
    }

    // Opacité selon tension
    let alpha = map(influence, 0, 1, 80, 255);
    let weight = map(influence, 0, 1, 0.5, 2);

    stroke(red(col), green(col), blue(col), alpha);
    strokeWeight(weight);
    noFill();

    // Fil courbé vers la souris
    beginShape();
    vertex(pA.x, pA.y);
    quadraticVertex(ctrl.x, ctrl.y, pB.x, pB.y);
    endShape();
  }

  // Points fixes
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let dMouse = dist(mouse.x, mouse.y, p.x, p.y);
    let influence = constrain(map(dMouse, 0, 100, 1, 0), 0, 1);
    let s = map(influence, 0, 1, 3, 7);

    noStroke();
    fill(255, 150 + influence * 105);
    ellipse(p.x, p.y, s);
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}