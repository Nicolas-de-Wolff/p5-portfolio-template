// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#FFFFFF';   // 60% — dominante
let col2 = '#5B6571';   // 30% — secondaire
let col3 = '#FF9B34';   // 10% — accent

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
let rows = 15;
let noiseOffset = 0;

function setup() {
  createCanvas(500, 500);
  noFill();

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < rows; i++) {
    let r = random(100);
    colorGrid[i] = r < 40 ? 2 : 1;
    accentGrid[i] = random(100) < 10 ? true : false;
  }
}

function draw() {
  background(0, 30); // trainée légère
  noiseOffset += 0.008;

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

  let spacing = height / rows;

  for (let i = 0; i < rows; i++) {
    let y = i * spacing + spacing / 2;

    // 🌊 Ondulation multicouche
    let wave1 = sin(frameCount * 0.08 + i * 0.7) * 100;
    let wave2 = sin(frameCount * 0.05 + i * 1.2) * 40;
    let wave3 = cos(frameCount * 0.03 + i * 0.4) * 25;
    let w = 380 + wave1 + wave2;

    // Hauteur variable via bruit de Perlin
    let n = noise(i * 0.3, noiseOffset);
    let h = map(n, 0, 1, 10, 120);

    // 🖱️ Déformation par la souris
    let dMouse = dist(mx, my, width / 2, y);
    let mouseEffect = 0;
    if (mouseActive) {
      mouseEffect = map(dMouse, 0, 150, 60, 0, true) *
                    sin(frameCount * 0.08 + i);
      w += mouseEffect;
      h += map(dMouse, 0, 150, 20, 0, true);
    }

    // 🎨 Couleur depuis la grille
    let col;
    if (showAccent && accentGrid[i]) {
      col = c3;
    } else if (colorGrid[i] === 2) {
      col = c2;
    } else {
      col = c1;
    }

    // Opacité selon le bruit
    let alpha = map(n, 0, 1, 100, 255);
    if (mouseActive) {
      alpha = map(dMouse, 0, 200, 255, alpha, true);
    }

    // Épaisseur variable
    let sw = map(n, 0, 1, 0.4, 2.5);
    strokeWeight(sw);

    // 🔵 Ellipse principale
    stroke(red(col), green(col), blue(col), alpha);
    ellipse(width / 2, y, w, h);

    // ⭕ Ellipse décalée — effet de profondeur
    let offsetX = wave3 * 0.4;
    let offsetY = sin(frameCount * 0.04 + i * 0.9) * 6;
    stroke(red(col), green(col), blue(col), alpha * 0.35);
    strokeWeight(sw * 0.5);
    ellipse(width / 2 + offsetX, y + offsetY, w * 0.75, h * 0.75);

    // ✦ Ellipse intérieure fine sur les accents
    if (showAccent && accentGrid[i]) {
      stroke(red(c3), green(c3), blue(c3), 200);
      strokeWeight(1);
      ellipse(width / 2, y, w * 0.5, h * 1.5);
      ellipse(width / 2, y, w * 0.25, h * 2.5);
    }

    // 🛰️ Petit satellite orbital
    if (n > 0.6) {
      let orbitAngle = frameCount * 0.04 + i * 1.1;
      let orbitX = width / 2 + cos(orbitAngle) * (w / 2 + 8);
      let orbitY = y + sin(orbitAngle) * (h / 2 + 4);
      noStroke();
      fill(red(col), green(col), blue(col), alpha * 0.7);
      ellipse(orbitX, orbitY, sw * 4);
      noFill();
    }
  }

  // 🖱️ Cercles de proximité autour de la souris
  if (mouseActive) {
    stroke(red(c3), green(c3), blue(c3), 25);
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