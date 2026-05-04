// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#FFFFFF';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#30FA36';   // 10% — accent (rare !)

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

let layers = [];        // plusieurs spirographes superposés
let numLayers = 3;      // nombre de couches simultanées
let maxPoints = 600;    // points max par couche
let globalAngle = 0;    // rotation globale lente

function setup() {
  createCanvas(500, 500);

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  generateLayers();
  generateGrid();
}

function generateLayers() {
  layers = [];
  for (let l = 0; l < numLayers; l++) {
    let numArms = int(random(3, 6));
    let arms = [];
    for (let i = 0; i < numArms; i++) {
      arms.push({
        radius: random(30, 130 / (i + 1)),
        speed:  random(0.008, 0.035) * (i % 2 === 0 ? 1 : -1),
        angle:  random(TWO_PI),
        phase:  random(TWO_PI)
      });
    }
    layers.push({
      arms:    arms,
      points:  [],
      colorIdx: l // index de couche pour la couleur
    });
  }
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  for (let i = 0; i < maxPoints; i++) {
    let r = random(100);
    colorGrid[i] = r < 40 ? 2 : 1;
    accentGrid[i] = random(100) < 10 ? true : false;
  }
}

function draw() {
  background(0, 18); // trainée longue et douce
  globalAngle += 0.002; // rotation globale très lente

  // 🔄 Redistribue toutes les 4 secondes
  if (frameCount % reshuffleInterval === 0) {
    generateLayers();
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
  let mouseDist = dist(mx, my, width / 2, height / 2);
  let mouseInfluence = mouseActive ? map(mouseDist, 0, 300, 1.4, 0.6, true) : 1.0;

  translate(width / 2, height / 2);
  rotate(globalAngle);

  for (let l = 0; l < layers.length; l++) {
    let layer = layers[l];

    // Mise à jour des bras
    for (let arm of layer.arms) {
      arm.angle += arm.speed * mouseInfluence;
    }

    // Position du stylo
    let x = 0, y = 0;
    for (let arm of layer.arms) {
      x += cos(arm.angle + arm.phase) * arm.radius;
      y += sin(arm.angle + arm.phase) * arm.radius;
    }

    // Ajout du point
    layer.points.push(createVector(x, y));
    if (layer.points.length > maxPoints) layer.points.shift();

    // ✨ Dessin de la courbe
    noFill();
    for (let i = 1; i < layer.points.length; i++) {
      let ageFactor = i / layer.points.length;
      let alpha = map(ageFactor, 0, 1, 0, 200);

      // 🎨 Couleur depuis la grille
      let idx = i % maxPoints;
      let col;
      if (showAccent && accentGrid[idx]) {
        col = c3;
      } else if (colorGrid[idx] === 2) {
        col = c2;
      } else {
        col = c1;
      }

      // Épaisseur selon l'âge et la couche
      let sw = map(ageFactor, 0, 1, 0.2, 1.8) * (1 + l * 0.3);
      strokeWeight(sw);
      stroke(red(col), green(col), blue(col), alpha);
      line(
        layer.points[i - 1].x, layer.points[i - 1].y,
        layer.points[i].x,     layer.points[i].y
      );

      // Halo sur les points récents
      if (i > layer.points.length - 20) {
        noStroke();
        fill(red(col), green(col), blue(col), alpha * 0.12);
        ellipse(layer.points[i].x, layer.points[i].y, sw * 8);
        noFill();
      }
    }

    // 🔧 Bras mécaniques visibles en transparence
    let bx = 0, by = 0;
    for (let arm of layer.arms) {
      let nx = bx + cos(arm.angle + arm.phase) * arm.radius;
      let ny = by + sin(arm.angle + arm.phase) * arm.radius;
      stroke(255, 12);
      strokeWeight(0.4);
      line(bx, by, nx, ny);

      // Articulation
      noStroke();
      fill(255, 20);
      ellipse(nx, ny, 3);

      bx = nx;
      by = ny;
    }

    // 💡 Point stylo lumineux
    noStroke();
    fill(255, 80);
    ellipse(x, y, 5);
    fill(255, 180);
    ellipse(x, y, 2);

    // ✦ Cercle de rayon total pour chaque couche
    noFill();
    let totalR = layer.arms.reduce((sum, a) => sum + a.radius, 0);
    stroke(255, 6);
    strokeWeight(0.3);
    ellipse(0, 0, totalR * 2);
  }

  // ✦ Rosace centrale fixe
  noFill();
  for (let r = 20; r < 160; r += 35) {
    stroke(255, 5);
    strokeWeight(0.3);
    ellipse(0, 0, r * 2);
  }

  // 🖱️ Cercle souris (en coordonnées globales)
  if (mouseActive) {
    let lmx = mx - width / 2;
    let lmy = my - height / 2;
    stroke(red(c3), green(c3), blue(c3), 25);
    strokeWeight(0.5);
    ellipse(lmx, lmy, 120);
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('composition_spiro', 'webp');
  }
  if (key === 'r' || key === 'R') {
    generateLayers();
    generateGrid();
  }
  // Espace pour ajouter une couche supplémentaire
  if (key === ' ') {
    if (layers.length < 6) {
      numLayers++;
      generateLayers();
    } else {
      numLayers = 1;
      generateLayers();
    }
  }
}