// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#D8DBE2';   // 60% — dominante
let col2 = '#5B6571';   // 30% — secondaire
let col3 = '#B23DFF';   // 10% — accent

// =====================
// ⚙️ PARAMÈTRES
// =====================
let showAccent = false;
let accentTimer = 0;
let accentDuration = 60;
let accentInterval = 60;
let colorGrid = [];
let accentGrid = [];
let noiseGrid = [];
let reshuffleInterval = 40;
let cols, rows;
let cellSize = 25;
let noiseOffset = 0;

function setup() {
  createCanvas(500, 500);
  frameRate(10);
  cols = width / cellSize;
  rows = height / cellSize;

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  noiseGrid = [];
  for (let i = 0; i < cols; i++) {
    colorGrid[i] = [];
    accentGrid[i] = [];
    noiseGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      let r = random(100);
      colorGrid[i][j] = r < 40 ? 2 : 1;
      accentGrid[i][j] = random(100) < 2 ? true : false;
      noiseGrid[i][j] = random(1000); // seed unique par cellule
    }
  }
}

function draw() {
  background(255);
  noiseOffset += 0.04;

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

  // Influence souris
  let mx = mouseX;
  let my = mouseY;
  let mouseActive = mx > 0 && mx < width && my > 0 && my < height;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;

      // 🎨 Couleur de base
      let col;
      if (showAccent && accentGrid[i][j]) {
        col = c3;
      } else if (colorGrid[i][j] === 2) {
        col = c2;
      } else {
        col = c1;
      }

      // 🌊 Taille variable via bruit de Perlin
      let n = noise(i * 0.25, j * 0.25, noiseOffset);
      let sizeRatio = map(n, 0, 1, 0.2, 1.0);
      let s = cellSize * sizeRatio;

      // 🖱️ Distorsion par la souris
      let dMouse = dist(mx, my, x + cellSize / 2, y + cellSize / 2);
      let mouseEffect = 0;
      if (mouseActive) {
        mouseEffect = map(dMouse, 0, 120, 1.4, 1.0, true);
        s *= mouseEffect;
      }

      // Centrage dans la cellule
      let cx = x + cellSize / 2;
      let cy = y + cellSize / 2;

      // Rotation par cellule
      let rot = noise(i * 0.3, j * 0.3, noiseOffset * 0.5) * TWO_PI;

      // Opacité selon le bruit
      let alpha = map(n, 0, 1, 120, 255);
      if (mouseActive) {
        alpha = map(dMouse, 0, 150, 255, alpha, true);
      }

      push();
      translate(cx, cy);
      rotate(rot);

      noStroke();

      // 🔲 Forme principale — carré rotatif
      fill(red(col), green(col), blue(col), alpha);
      rectMode(CENTER);
      rect(0, 0, s, s);

      // ➕ Forme intérieure — carré concentrique plus petit
      let innerSize = s * 0.45;
      let innerCol = colorGrid[i][j] === 2 ? c1 : c2;
      if (showAccent && accentGrid[i][j]) innerCol = c3;
      fill(red(innerCol), green(innerCol), blue(innerCol), alpha * 0.7);
      rect(0, 0, innerSize, innerSize);

      // ● Point central sur les cellules accent
      if (showAccent && accentGrid[i][j]) {
        fill(red(c3), green(c3), blue(c3), 255);
        ellipse(0, 0, s * 0.15);
      }

      pop();
    }
  }

  // 🖱️ Cercle de proximité autour de la souris
  if (mouseActive) {
    noFill();
    stroke(red(c3), green(c3), blue(c3), 40);
    strokeWeight(0.5);
    ellipse(mx, my, 240);
    ellipse(mx, my, 120);
    noStroke();
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}