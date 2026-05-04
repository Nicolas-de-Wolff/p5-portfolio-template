// =====================
// 🎨 PALETTE 60-30-10
// =====================
// 👇 Modifie les couleurs ici
let col1 = '#FFFFFF';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#E91E63';   // 10% — accent (rare !)

let c1, c2, c3;
let pts = [];
let numPts = 40;
let triangles = [];
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

  // Création des points avec vélocité lente
  for (let i = 0; i < numPts; i++) {
    pts.push({
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-0.4, 0.4), random(-0.4, 0.4))
    });
  }

  generateGrid();
}

function generateGrid() {
  colorGrid = [];
  accentGrid = [];
  // On prépare assez de slots pour tous les triangles possibles
  for (let i = 0; i < 500; i++) {
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

  // Mise à jour des positions
  for (let p of pts) {
    p.pos.add(p.vel);

    // Rebond sur les bords
    if (p.pos.x < 0 || p.pos.x > width)  p.vel.x *= -1;
    if (p.pos.y < 0 || p.pos.y > height) p.vel.y *= -1;
  }

  // Calcul des triangles par proximité
  triangles = [];
  let maxDist = 160;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      let dij = dist(pts[i].pos.x, pts[i].pos.y, pts[j].pos.x, pts[j].pos.y);
      if (dij > maxDist) continue;
      for (let k = j + 1; k < pts.length; k++) {
        let dik = dist(pts[i].pos.x, pts[i].pos.y, pts[k].pos.x, pts[k].pos.y);
        let djk = dist(pts[j].pos.x, pts[j].pos.y, pts[k].pos.x, pts[k].pos.y);
        if (dik < maxDist && djk < maxDist) {
          triangles.push([i, j, k]);
        }
      }
    }
  }

  // 🎨 Dessin des triangles
  let tIdx = 0;
  for (let [a, b, c] of triangles) {
    let pA = pts[a].pos;
    let pB = pts[b].pos;
    let pC = pts[c].pos;

    let col;
    let idx = tIdx % 500;
    if (showAccent && accentGrid[idx]) {
      col = c3;
    } else if (colorGrid[idx] === 2) {
      col = c2;
    } else {
      col = c1;
    }

    // Remplissage très transparent
    fill(red(col), green(col), blue(col), 18);
    // Contour légèrement visible
    stroke(red(col), green(col), blue(col), 120);
    strokeWeight(0.6);

    triangle(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y);
    tIdx++;
  }

  // Points
  noStroke();
  for (let p of pts) {
    fill(255, 180);
    ellipse(p.pos.x, p.pos.y, 3);
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nom_image', 'webp'); // Sauvegarde l'image en appuyant sur 's'
  }
}