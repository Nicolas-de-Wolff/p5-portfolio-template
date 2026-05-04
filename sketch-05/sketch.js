// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#5B6571';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#F8DD4D';   // 10% — accent

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

let cols = 20;
let rows = 14;
let trails = []; // trainées persistantes

function setup() {
  createCanvas(500, 500);
  noFill();
  strokeWeight(1.5);

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < cols; i++) {
    colorGrid[i] = [];
    accentGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      let r = random(100);
      colorGrid[i][j] = r < 40 ? 2 : 1;
      accentGrid[i][j] = random(100) < 3 ? true : false;
    }
  }
}

function draw() {
  // Fond avec légère persistance — effet trainée
  background(0, 35);

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

  let spacingX = width / cols;
  let spacingY = height / rows;

  // Influence de la souris
  let mx = mouseX;
  let my = mouseY;
  let mouseActive = mx > 0 && mx < width && my > 0 && my < height;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x1 = i * spacingX;
      let y1 = j * spacingY + spacingY / 2;
      let x2 = x1 + spacingX;

      // 🌊 Ondulation multicouche
      let wave1 = sin(frameCount * 0.02 + i * 0.6) * 18;
      let wave2 = sin(frameCount * 0.035 + j * 0.8 + i * 0.3) * 10;
      let wave3 = cos(frameCount * 0.015 + i * 0.4 - j * 0.5) * 8;

      // 🖱️ Déformation par la souris
      let midX = (x1 + x2) / 2;
      let dMouse = dist(mx, my, midX, y1);
      let mouseWave = 0;
      if (mouseActive) {
        mouseWave = map(dMouse, 0, 150, 30, 0, true) *
                    sin(frameCount * 0.05 + i + j);
      }

      let y2 = y1 + wave1 + wave2 + wave3 + mouseWave;

      // 🎨 Point de contrôle pour la courbe
      let ctrlX = midX;
      let ctrlY = y1 + wave2 * 2 + mouseWave * 0.5;

      // Couleur depuis la grille
      let col;
      if (showAccent && accentGrid[i][j]) {
        col = c3;
      } else if (colorGrid[i][j] === 2) {
        col = c2;
      } else {
        col = c1;
      }

      // Opacité selon distance à la souris
      let alpha = 200;
      if (mouseActive) {
        alpha = map(dMouse, 0, 200, 255, 120, true);
      }

      stroke(red(col), green(col), blue(col), alpha);

      // Épaisseur variable selon la vague
      let w = map(abs(wave1 + wave2), 0, 28, 0.4, 2.5);
      strokeWeight(w);

      // Ligne courbée au lieu d'une ligne droite
      beginShape();
      vertex(x1, y1);
      quadraticVertex(ctrlX, ctrlY, x2, y2);
      endShape();

      // Petit point aux intersections pour densifier
      if (i % 3 === 0 && j % 2 === 0) {
        noStroke();
        fill(red(col), green(col), blue(col), alpha * 0.4);
        ellipse(x1, y1, w * 2);
        noFill();
      }
    }
  }

  // 🖱️ Cercle de proximité autour de la souris
  if (mouseActive) {
    stroke(255, 15);
    strokeWeight(0.5);
    ellipse(mx, my, 200);
    ellipse(mx, my, 100);
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}