// =====================
// 🎨 PALETTE 60-30-10
// =====================
// 👇 Modifie les couleurs ici
let col1 = '#D8DBE2';   // 60% — dominante
let col2 = '#5B6571';   // 30% — secondaire
let col3 = '#47E73E';   // 10% — accent (rare !)

let c1, c2, c3;
let anchors = [];
let numAnchors = 8;
let numLines = 24;
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

  // Points d'ancrage fixes répartis en cercle
  for (let i = 0; i < numAnchors; i++) {
    let angle = map(i, 0, numAnchors, 0, TWO_PI);
    let r = random(120, 180);
    anchors.push(createVector(
      width / 2 + cos(angle) * r,
      height / 2 + sin(angle) * r
    ));
  }

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  let total = numLines * numAnchors;
  for (let i = 0; i < total; i++) {
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

  let mx = mouseX;
  let my = mouseY;

  // Si la souris est hors du canvas, on centre
  if (mx === 0 && my === 0) {
    mx = width / 2;
    my = height / 2;
  }

  let lineIdx = 0;

  // 🧲 Lignes de champ depuis la souris vers chaque ancrage
  for (let a = 0; a < anchors.length; a++) {
    let anchor = anchors[a];

    for (let l = 0; l < numLines; l++) {
      // Angle de départ légèrement éventail autour de la direction vers l'ancrage
      let baseAngle = atan2(anchor.y - my, anchor.x - mx);
      let spread = map(l, 0, numLines - 1, -PI / 6, PI / 6);
      let angle = baseAngle + spread;

      // Point de départ légèrement décalé autour de la souris
      let startOffset = 12;
      let sx = mx + cos(angle) * startOffset;
      let sy = my + sin(angle) * startOffset;

      // Point de contrôle intermédiaire — courbure magnétique
      let midX = (sx + anchor.x) / 2 + sin(angle + PI / 2) * random(-40, 40);
      let midY = (sy + anchor.y) / 2 + cos(angle + PI / 2) * random(-40, 40);

      // Distance souris → ancrage pour l'opacité
      let d = dist(mx, my, anchor.x, anchor.y);
      let alpha = constrain(map(d, 0, 400, 220, 30), 30, 220);
      let weight = constrain(map(d, 0, 400, 1.5, 0.3), 0.3, 1.5);

      // 🎨 Couleur depuis la grille figée
      let idx = lineIdx % (numLines * numAnchors);
      let col;
      if (showAccent && accentGrid[idx]) {
        col = c3;
      } else if (colorGrid[idx] === 2) {
        col = c2;
      } else {
        col = c1;
      }

      stroke(red(col), green(col), blue(col), alpha);
      strokeWeight(weight);
      noFill();

      // Courbe de Bézier quadratique
      beginShape();
      vertex(sx, sy);
      quadraticVertex(midX, midY, anchor.x, anchor.y);
      endShape();

      lineIdx++;
    }
  }

  // Points d'ancrage
  noStroke();
  for (let anchor of anchors) {
    let d = dist(mx, my, anchor.x, anchor.y);
    let pulse = map(sin(frameCount * 0.05), -1, 1, 4, 9);
    let brightness = constrain(map(d, 0, 300, 255, 100), 100, 255);
    fill(brightness);
    ellipse(anchor.x, anchor.y, pulse);
  }

  // Point souris
  fill(255, 200);
  ellipse(mx, my, 8);
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}