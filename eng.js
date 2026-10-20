(function() {
console.clear();
console.log("%c--- PIR13 ANALYTICAL 3D v31.0 ---", "color: #00ffaa; font-weight: bold;");

document.body.innerHTML = ''; 
document.body.style.margin = '0';
document.body.style.overflow = 'hidden'; 
document.body.style.backgroundColor = '#010103';

const canvas = document.createElement('canvas');
const WIDTH = 320, HEIGHT = 240; 
canvas.width = WIDTH; 
canvas.height = HEIGHT;
canvas.style.width = '100vw'; 
canvas.style.height = '100vh'; 
canvas.style.imageRendering = 'pixelated';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
const mem = new Float32Array(4096);

const REG_TIME = 0, REG_CAM_X = 1, REG_CAM_Y = 2, REG_CAM_Z = 3, REG_ROT_X = 4, REG_ROT_Y = 5;
const GRAVITY = -9.81;
const BOUNCE_RESTITUTION = 0.82;
const AIR_DENSITY = 0.12; 
const GROUND_Y = -3.0;
const MAX_OBJECTS = 40;
const OBJ_STRIDE = 14; 
const OBJ_START = 10;
const sortIndices = new Int32Array(MAX_OBJECTS);

mem[REG_CAM_X] = 0.0; 
mem[REG_CAM_Y] = 2.0; 
mem[REG_CAM_Z] = -24.0;
mem[REG_ROT_X] = 0.15; 
mem[REG_ROT_Y] = 0.0;

const keys = { w: 0, s: 0, a: 0, d: 0, q: 0, e: 0 };
window.addEventListener('keydown', (event) => { const k = event.key.toLowerCase(); if(k in keys) keys[k] = 1; });
window.addEventListener('keyup', (event) => { const k = event.key.toLowerCase(); if(k in keys) keys[k] = 0; });
window.addEventListener('mousemove', (event) => {
if (document.pointerLockElement === canvas) {
mem[REG_ROT_Y] += event.movementX * 0.0025;
mem[REG_ROT_X] -= event.movementY * 0.0025;
mem[REG_ROT_X] = Math.max(-1.45, Math.min(1.45, mem[REG_ROT_X]));
}
});

canvas.addEventListener('mousedown', () => {
window.focus();
if (document.hasFocus()) {
canvas.requestPointerLock();
}
});

for (let i = 0; i < MAX_OBJECTS; i++) {
const idx = OBJ_START + i * OBJ_STRIDE;
mem[idx] = 1.0;
mem[idx + 1] = (Math.sin(i * 4.3) * 6.0);
mem[idx + 2] = 4.0 + Math.abs(Math.cos(i * 7.1) * 6.0);
mem[idx + 3] = (Math.cos(i * 2.9) * 6.0);
mem[idx + 4] = (Math.sin(i * 12.5) * 7.0);
mem[idx + 5] = Math.abs(Math.cos(i * 3.3) * 5.0);
mem[idx + 6] = (Math.cos(i * 8.9) * 7.0);
mem[idx + 7] = 0.35 + (Math.sin(i * 9.3) * 0.5 + 0.5) * 0.4;
mem[idx + 8] = 0.0;
mem[idx + 9] = 0.0;
mem[idx + 10] = 0.0;
mem[idx + 11] = 0.0;
mem[idx + 12] = 0.0;
mem[idx + 13] = 0.0;
}

let lastTime = performance.now();

function analyticalEngineTick() {
const currentTime = performance.now();
const delta = Math.min((currentTime - lastTime) / 1000, 0.02);
lastTime = currentTime;

ctx.fillStyle = "#040409";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

const rotX = mem[REG_ROT_X], rotY = mem[REG_ROT_Y];
const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

const fwdX = sinY * cosX, fwdY = sinX, fwdZ = cosY * cosX;
const rgtX = cosY, rgtZ = -sinY;

const flySpeed = 12.0 * delta;
mem[REG_CAM_X] += (keys.w - keys.s) * fwdX * flySpeed + (keys.d - keys.a) * rgtX * flySpeed;
mem[REG_CAM_Y] += (keys.w - keys.s) * fwdY * flySpeed + (keys.e - keys.q) * flySpeed;
mem[REG_CAM_Z] += (keys.w - keys.s) * fwdZ * flySpeed + (keys.d - keys.a) * rgtZ * flySpeed;

const camX = mem[REG_CAM_X], camY = mem[REG_CAM_Y], camZ = mem[REG_CAM_Z];

ctx.strokeStyle = "#121222";
ctx.lineWidth = 1;
ctx.beginPath();
for (let g = -14; g <= 14; g += 2) {
for (let zLine = -14; zLine < 14; zLine += 2) {
let dx1 = g - camX, dy1 = GROUND_Y - camY, dz1 = zLine - camZ;
let rx1 = dx1 * cosY - dz1 * sinY; let rz1 = dx1 * sinY + dz1 * cosY;
let ry1 = dy1 * cosX - rz1 * sinX; let fz1 = dy1 * sinX + rz1 * cosX;

let dx2 = g - camX, dy2 = GROUND_Y - camY, dz2 = (zLine + 2) - camZ;
let rx2 = dx2 * cosY - dz2 * sinY; let rz2 = dx2 * sinY + dz2 * cosY;
let ry2 = dy2 * cosX - rz2 * sinX; let fz2 = dy2 * sinX + rz2 * cosX;

if (fz1 > 0.5 && fz2 > 0.5) {
let scale1 = 220.0 / fz1, scale2 = 220.0 / fz2;
ctx.moveTo(WIDTH/2 + rx1 * scale1, HEIGHT/2 - ry1 * scale1);
ctx.lineTo(WIDTH/2 + rx2 * scale2, HEIGHT/2 - ry2 * scale2);
}

let dx3 = (zLine + 2) - camX, dy3 = GROUND_Y - camY, dz3 = g - camZ;
let rx3 = dx3 * cosY - dz3 * sinY; let rz3 = dx3 * sinY + dz3 * cosY;
let ry3 = dy3 * cosX - rz3 * sinX; let fz3 = dy3 * sinX + rz3 * cosX;

if (fz1 > 0.5 && fz3 > 0.5) {
let scale1 = 220.0 / fz1, scale3 = 220.0 / fz3;
ctx.moveTo(WIDTH/2 + rx1 * scale1, HEIGHT/2 - ry1 * scale1);
ctx.lineTo(WIDTH/2 + rx3 * scale3, HEIGHT/2 - ry3 * scale3);
}
}
}
ctx.stroke();

for (let i = 0; i < MAX_OBJECTS; i++) {
const idx = OBJ_START + i * OBJ_STRIDE;
if (mem[idx] === 0.0) continue;

const radius = mem[idx + 7];
let vx = mem[idx + 4], vy = mem[idx + 5], vz = mem[idx + 6];
let vSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz) + 0.0001;

const crossSectionArea = Math.PI * radius * radius;
const dragMagnitude = 0.5 * AIR_DENSITY * vSpeed * vSpeed * 0.47 * crossSectionArea;

mem[idx + 4] -= (vx / vSpeed) * dragMagnitude * delta;
mem[idx + 5] -= ((vy / vSpeed) * dragMagnitude - GRAVITY) * delta;
mem[idx + 6] -= (vz / vSpeed) * dragMagnitude * delta;

mem[idx + 1] += mem[idx + 4] * delta;
mem[idx + 2] += mem[idx + 5] * delta;
mem[idx + 3] += mem[idx + 6] * delta;

let rotVX = mem[idx + 8], rotVY = mem[idx + 9], rotVZ = mem[idx + 10];
mem[idx + 11] += rotVX * delta;
mem[idx + 12] += rotVY * delta;
mem[idx + 13] += rotVZ * delta;
mem[idx + 8] *= 0.98; mem[idx + 9] *= 0.98; mem[idx + 10] *= 0.98;

if (mem[idx + 2] - radius < GROUND_Y) {
mem[idx + 2] = GROUND_Y + radius;
mem[idx + 5] = -mem[idx + 5] * BOUNCE_RESTITUTION;

let slipX = mem[idx + 4], slipZ = mem[idx + 6];
mem[idx + 8] += slipZ * 0.15;
mem[idx + 10] -= slipX * 0.15;

mem[idx + 4] *= 0.85; 
mem[idx + 6] *= 0.85;
}

if (Math.abs(mem[idx + 1]) > 11.0) { 
mem[idx + 1] = Math.sign(mem[idx + 1]) * 11.0; 
mem[idx + 4] = -mem[idx + 4] * BOUNCE_RESTITUTION; 
mem[idx + 9] *= -0.8;
}
if (Math.abs(mem[idx + 3]) > 11.0) { 
mem[idx + 3] = Math.sign(mem[idx + 3]) * 11.0; 
mem[idx + 6] = -mem[idx + 6] * BOUNCE_RESTITUTION; 
mem[idx + 9] *= -0.8;
}
}

for (let i = 0; i < MAX_OBJECTS; i++) {
const idxA = OBJ_START + i * OBJ_STRIDE;
if (mem[idxA] === 0.0) continue;
const rA = mem[idxA + 7];
const massA = (4.0 / 3.0) * Math.PI * rA * rA * rA;

for (let j = i + 1; j < MAX_OBJECTS; j++) {
const idxB = OBJ_START + j * OBJ_STRIDE;
if (mem[idxB] === 0.0) continue;
const rB = mem[idxB + 7];

const dx = mem[idxB + 1] - mem[idxA + 1];
const dy = mem[idxB + 2] - mem[idxA + 2];
const dz = mem[idxB + 3] - mem[idxA + 3];
const actualDistance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.0001;
const totalTargetRadius = rA + rB;

if (actualDistance < totalTargetRadius) {
const nx = dx / actualDistance; 
const ny = dy / actualDistance; 
const nz = dz / actualDistance;
const overlapCorrection = totalTargetRadius - actualDistance;
const massB = (4.0 / 3.0) * Math.PI * rB * rB * rB;
const totalMassRatioInverse = 1.0 / (massA + massB);

mem[idxA + 1] -= nx * overlapCorrection * (massB * totalMassRatioInverse);
mem[idxA + 2] -= ny * overlapCorrection * (massB * totalMassRatioInverse);
mem[idxA + 3] -= nz * overlapCorrection * (massB * totalMassRatioInverse);
mem[idxB + 1] += nx * overlapCorrection * (massA * totalMassRatioInverse);
mem[idxB + 2] += ny * overlapCorrection * (massA * totalMassRatioInverse);
mem[idxB + 3] += nz * overlapCorrection * (massA * totalMassRatioInverse);

const kx = mem[idxA + 4] - mem[idxB + 4];
const ky = mem[idxA + 5] - mem[idxB + 5];
const kz = mem[idxA + 6] - mem[idxB + 6];
const velAlongNormal = kx * nx + ky * ny + kz * nz;

if (velAlongNormal > 0) {
const impulse = (2.0 * velAlongNormal) * totalMassRatioInverse;
const factorA = impulse * massB * BOUNCE_RESTITUTION;
const factorB = impulse * massA * BOUNCE_RESTITUTION;

mem[idxA + 4] -= nx * factorA;
mem[idxA + 5] -= ny * factorA;
mem[idxA + 6] -= nz * factorA;
mem[idxB + 4] += nx * factorB;
mem[idxB + 5] += ny * factorB;
mem[idxB + 6] += nz * factorB;

const tangentX = kx - (velAlongNormal * nx);
const tangentY = ky - (velAlongNormal * ny);
const tangentZ = kz - (velAlongNormal * nz);
const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ) + 0.0001;

const tx = tangentX / tangentLen;
const ty = tangentY / tangentLen;
const tz = tangentZ / tangentLen;

const frictionMagnitude = 0.12 * factorA;
mem[idxA + 8] += tz * frictionMagnitude; mem[idxA + 10] -= tx * frictionMagnitude;
mem[idxB + 8] -= tz * frictionMagnitude; mem[idxB + 10] += tx * frictionMagnitude;
}
}
}
}

const zDepths = new Float32Array(MAX_OBJECTS);
for (let i = 0; i < MAX_OBJECTS; i++) {
sortIndices[i] = i;
const idx = OBJ_START + i * OBJ_STRIDE;
if (mem[idx] === 0.0) { zDepths[i] = -99999; continue; }
const dx = mem[idx + 1] - camX, dy = mem[idx + 2] - camY, dz = mem[idx + 3] - camZ;
const rz = dx * sinY + dz * cosY;
zDepths[i] = dy * sinX + rz * cosX;
}

for (let i = 0; i < MAX_OBJECTS - 1; i++) {
for (let j = 0; j < MAX_OBJECTS - i - 1; j++) {
if (zDepths[sortIndices[j]] < zDepths[sortIndices[j + 1]]) {
const temp = sortIndices[j];
sortIndices[j] = sortIndices[j + 1];
sortIndices[j + 1] = temp;
}
}
}

for (let i = 0; i < MAX_OBJECTS; i++) {
const objIndex = sortIndices[i];
const idx = OBJ_START + objIndex * OBJ_STRIDE;
if (mem[idx] === 0.0) continue;

const radius = mem[idx + 7];
const dx = mem[idx + 1] - camX, dy = mem[idx + 2] - camY, dz = mem[idx + 3] - camZ;

const rx = dx * cosY - dz * sinY;
const rz = dx * sinY + dz * cosY;
const ry = dy * cosX - rz * sinX;
const fz = dy * sinX + rz * cosX;

if (fz < 0.5) continue;

const scale = 220.0 / fz;
const screenX = Math.floor(WIDTH / 2 + rx * scale);
const screenY = Math.floor(HEIGHT / 2 - ry * scale);
const screenRadius = Math.floor(radius * scale);

if (screenRadius <= 0) continue;

const currentRotZ = mem[idx + 13];
const lightX = screenX - screenRadius * 0.35;
const lightY = screenY - screenRadius * 0.35;

ctx.beginPath();
const gradient = ctx.createRadialGradient(
lightX, lightY, screenRadius * 0.05,
screenX, screenY, screenRadius
);

const baseHue = (objIndex * 37) % 360;
gradient.addColorStop(0, `hsl(${baseHue}, 100%, 80%)`);
gradient.addColorStop(0.3, `hsl(${baseHue}, 95%, 45%)`);
gradient.addColorStop(0.7, `hsl(${baseHue}, 100%, 20%)`);
gradient.addColorStop(1, '#020206');

ctx.fillStyle = gradient;
ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
ctx.fill();

ctx.strokeStyle = `rgba(0, 255, 170, ${Math.min(1.0, 3.0 / fz)})`;
ctx.lineWidth = 1;
ctx.beginPath();

const segments = 4;
for (let s = 0; s < segments; s++) {
const angleOffset = (s * Math.PI) / segments;
ctx.arc(screenX, screenY, screenRadius, currentRotZ + angleOffset, currentRotZ + angleOffset + Math.PI * 0.1);
}
ctx.stroke();

ctx.strokeStyle = `hsl(${baseHue}, 100%, 10%)`;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
ctx.stroke();
}

requestAnimationFrame(analyticalEngineTick);
}

requestAnimationFrame(analyticalEngineTick);
})();
