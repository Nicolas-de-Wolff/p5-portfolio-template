// =====================
// 🎨 PALETTE 60-30-10
// =====================
let c1, c2, c3;
// 👇 Modifie les couleurs ici
let col1 = '#5B6571';   // 60% — dominante
let col2 = '#D8DBE2';   // 30% — secondaire
let col3 = '#FF47D3';   // 10% — accent

// =====================
// ⚙️ PARAMÈTRES
// =====================
let particles = [];
let rings = [];
let totalParticles = 180;
let totalRings = 5;

let accentPulse = false;
let accentTimer = 0;
let accentDuration = 100;
let accentInterval = 140;

let driftAngle = 0;
let driftSpeed = 0.0015;

let connectDistance = 80;
let reshuffleInterval = 260;

// =====================
// 🚀 SETUP
// =====================
function setup() {
  createCanvas(500, 500);

  c1 = color(col1);
  c2 = color(col2);
  c3 = color(col3);

  generateParticles();
  generateRings();
}

// =====================
// ✨ GÉNÉRATION PARTICULES
// =====================
function generateParticles() {
  particles = [];

  for (let i = 0; i < totalParticles; i++) {
    let a = random(TWO_PI);
    let r = random(30, 190);

    particles.push({
      baseAngle: a,
      radius: r,
      size: random(1, 3),
      speed: random(0.002, 0.008),
      offset: random(TWO_PI),
      colorMode: random() < 0.4 ? 2 : 1,
      accent: random() < 0.08
    });
  }
}

// =====================
// ⭕ GÉNÉRATION ANNEAUX
// =====================
function generateRings() {
  rings = [];

  for (let i = 0; i < totalRings; i++) {
    rings.push({
      radius: 40 + i * 35,
      deform: random(4, 18),
      speed: random(0.002, 0.01),
      phase: random(TWO_PI)
    });
  }
}

// =====================
// 🎬 DRAW
// =====================
function draw() {
  background(0, 15);

  driftAngle += driftSpeed;

  if (frameCount % reshuffleInterval === 0) {
    generateParticles();
    generateRings();
  }

  // 🎲 Accent color pulse
  if (!accentPulse && frameCount % accentInterval === 0 && random() < 0.5) {
    accentPulse = true;
    accentTimer = accentDuration;
  }

  if (accentPulse) {
    accentTimer--;
    if (accentTimer <= 0) accentPulse = false;
  }

  // 🖱️ Influence souris
  let mx = mouseX;
  let my = mouseY;
  let mouseActive = mx > 0 && mx < width && my > 0 && my < height;
  let mouseForce = mouseActive ? map(dist(mx, my, width/2, height/2), 0, 250, 1.6, 0.7, true) : 1;

  translate(width/2, height/2);
  rotate(driftAngle);

  drawRings(mouseForce);
  drawConnections(mouseForce);
  drawParticles(mouseForce);
  drawCenterGlow();
  drawMouseAura(mouseActive, mx, my);
}

// =====================
// ⭕ ANNEAUX ORGANIQUES
// =====================
function drawRings(mouseForce) {
  noFill();

  for (let ring of rings) {
    stroke(255, 10);
    strokeWeight(0.4);
    beginShape();

    for (let a = 0; a < TWO_PI; a += 0.08) {
      let deformWave = sin(a * 3 + frameCount * ring.speed + ring.phase) * ring.deform * mouseForce;
      let r = ring.radius + deformWave;
      let x = cos(a) * r;
      let y = sin(a) * r;
      vertex(x, y);
    }

    endShape(CLOSE);
  }
}

// =====================
// 🔗 CONNEXIONS
// =====================
function drawConnections(mouseForce) {
  for (let i = 0; i < particles.length; i++) {
    let p1 = getParticlePos(particles[i], mouseForce);

    for (let j = i + 1; j < particles.length; j++) {
      let p2 = getParticlePos(particles[j], mouseForce);

      let d = dist(p1.x, p1.y, p2.x, p2.y);

      if (d < connectDistance) {
        let alpha = map(d, 0, connectDistance, 30, 0);

        let col = c1;
        if (particles[i].colorMode === 2 || particles[j].colorMode === 2) col = c2;
        if (accentPulse && (particles[i].accent || particles[j].accent)) col = c3;

        stroke(red(col), green(col), blue(col), alpha);
        strokeWeight(0.3);
        line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }
}

// =====================
// ✨ PARTICULES
// =====================
function drawParticles(mouseForce) {
  noStroke();

  for (let p of particles) {
    let pos = getParticlePos(p, mouseForce);

    let col = c1;
    if (p.colorMode === 2) col = c2;
    if (accentPulse && p.accent) col = c3;

    fill(red(col), green(col), blue(col), 30);
    ellipse(pos.x, pos.y, p.size * 5);

    fill(red(col), green(col), blue(col), 180);
    ellipse(pos.x, pos.y, p.size);
  }
}

// =====================
// 📍 POSITION PARTICULE
// =====================
function getParticlePos(p, mouseForce) {
  let a = p.baseAngle + frameCount * p.speed * mouseForce + p.offset;
  let wave = sin(frameCount * 0.01 + p.offset) * 12;

  return {
    x: cos(a) * (p.radius + wave),
    y: sin(a) * (p.radius + wave)
  };
}

// =====================
// 💡 CENTRE LUMINEUX
// =====================
function drawCenterGlow() {
  noStroke();

  fill(255, 10);
  ellipse(0, 0, 90);

  fill(255, 20);
  ellipse(0, 0, 40);

  fill(255, 120);
  ellipse(0, 0, 8);
}

// =====================
// 🖱️ HALO SOURIS
// =====================
function drawMouseAura(active, mx, my) {
  if (active) {
    let lx = mx - width/2;
    let ly = my - height/2;

    noFill();
    stroke(red(c3), green(c3), blue(c3), 20);
    strokeWeight(0.5);
    ellipse(lx, ly, 130);
  }
}

// =====================
// ⌨️ CONTROLES
// =====================
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('orbital_constellation', 'webp');
  }

  if (key === 'r' || key === 'R') {
    generateParticles();
    generateRings();
  }

  if (key === ' ') {
    totalParticles += 30;

    if (totalParticles > 300) {
      totalParticles = 120;
    }

    generateParticles();
  }
}