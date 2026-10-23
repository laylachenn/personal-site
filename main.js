import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// The portfolio is built entirely in the Three.js scene. Canvas textures are
// used for lettering and tiny illustrations, so every visible element remains
// part of the WebGL experience.
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#aaa9cc');
scene.fog = new THREE.Fog('#aaa9cc', 20, 42);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
if (innerWidth < 700) camera.fov = 62;
camera.position.set(10.5, 8.2, 13.8);
scene.add(camera); // The comic panel is attached to the camera as a 3D overlay.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 3.4;
controls.maxDistance = 22;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.48;
controls.target.set(0, 2.4, 0);

scene.add(new THREE.HemisphereLight('#fff4fa', '#68749b', 2.1));
const sun = new THREE.DirectionalLight('#fff0df', 3.2);
sun.position.set(-6, 12, 8); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
sun.shadow.bias = -0.0003;
scene.add(sun);
const fill = new THREE.DirectionalLight('#b7c9ff', 1.25); fill.position.set(8, 7, -6); scene.add(fill);

const mat = (color, roughness = .78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const wood = mat('#c9835d'), woodLight = mat('#e7ad83'), woodDark = mat('#9d5f47');
const cream = mat('#fff1ea'), wall = mat('#f4e4ed'), lilac = mat('#c8a8dc');
const pink = mat('#ecaed0'), palePink = mat('#f6d8e9'), mint = mat('#a8d1c3');
const dark = mat('#414257'), white = mat('#fffaf4'), leafMat = mat('#75ae79');
const room = new THREE.Group(); scene.add(room);
const clickable = [];

function roundedBox(parent, size, radius, material, pos, name) {
  const geo = new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true;
  if (name) { mesh.userData.section = name; clickable.push(mesh); }
  parent.add(mesh); return mesh;
}
function box(parent, size, material, pos, name) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true;
  if (name) { mesh.userData.section = name; clickable.push(mesh); }
  parent.add(mesh); return mesh;
}
function cylinder(parent, r1, r2, h, material, pos, segments = 18) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, segments), material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function sphere(parent, scale, material, pos, seg = 20) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(12, seg - 4)), material);
  mesh.scale.set(...scale); mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function labelTexture(text, options = {}) {
  const c = document.createElement('canvas'); c.width = options.width || 512; c.height = options.height || 160;
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = `${options.weight || 700} ${options.size || 52}px ${options.fontFamily || '"Trebuchet MS", sans-serif'}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (options.outlineColor) {
    ctx.strokeStyle = options.outlineColor; ctx.lineWidth = options.outlineWidth || 5;
    ctx.lineJoin = 'round'; ctx.strokeText(text, c.width / 2, c.height / 2, c.width - 24);
  }
  ctx.fillStyle = options.color || '#fff4e9'; ctx.shadowColor = 'rgba(55,35,42,.32)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
  ctx.fillText(text, c.width / 2, c.height / 2, c.width - 24);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function textOn(parent, text, width, height, pos, options = {}) {
  const material = new THREE.MeshBasicMaterial({ map: labelTexture(text, options), transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.position.set(...pos); if (options.rotationY) mesh.rotation.y = options.rotationY; parent.add(mesh); return mesh;
}
function makeSign(text, section, position, rotation = 0) {
  const g = new THREE.Group(); g.position.set(...position); g.rotation.y = rotation; room.add(g);
  roundedBox(g, [1.8, .57, .16], .09, wood, [0, 0, 0], section);
  roundedBox(g, [1.66, .44, .035], .06, woodLight, [0, 0, .092]);
  textOn(g, text, 1.5, .4, [0, 0, .12], {
    size: 46, color: '#29232b', outlineColor: '#fff0df', outlineWidth: 4
  }); return g;
}

// Layered indoor display plinth in place of the outdoor floating island.
roundedBox(room, [8.75, .42, 6.85], .28, lilac, [0, -.25, 0]);
roundedBox(room, [8.48, .16, 6.58], .18, cream, [0, .025, 0]);
roundedBox(room, [8.4, .58, 6.5], .22, cream, [0, .26, 0]);
roundedBox(room, [7.95, .22, 6.08], .12, wood, [0, .65, 0]);
// Individual planks make the floor read as warm timber.
for (let i = 0; i < 8; i++) {
  const plank = roundedBox(room, [1.02, .11, 5.9], .045, i % 2 ? woodLight : wood, [-3.52 + i * 1.005, .79, 0]);
  plank.rotation.y = 0;
}

// Roofless open-front room with pastel walls.
roundedBox(room, [7.9, 5.5, .28], .1, wall, [0, 3.45, -3.05]);
roundedBox(room, [.28, 5.3, 6.2], .1, wall, [-3.9, 3.4, -.05]);
roundedBox(room, [.28, 5.3, 6.2], .1, wall, [3.9, 3.4, -.05]);
// Three slim timber rails outline the back and sides, leaving the front open.
roundedBox(room, [8.05, .25, .28], .08, woodLight, [0, 6.18, -3.02]);
roundedBox(room, [.28, .25, 6.0], .08, woodLight, [-3.88, 6.18, 0]);
roundedBox(room, [.28, .25, 6.0], .08, woodLight, [3.88, 6.18, 0]);

// Desk and storage along the back wall.
roundedBox(room, [3.85, .25, 1.35], .09, woodLight, [-.65, 2.48, -1.82], 'Work');
for (const x of [-2.1, .8]) for (const z of [-2.22, -1.42])
  roundedBox(room, [.14, 1.65, .14], .045, wood, [x, 1.62, z]);
roundedBox(room, [1.05, 1.63, .9], .1, lilac, [-2.55, 1.65, -1.88], 'About');
for (let i = 0; i < 3; i++) {
  roundedBox(room, [.84, .035, .06], .015, palePink, [-2.55, 2.08 - i * .42, -1.405]);
  const knob = sphere(room, [.07, .07, .07], woodLight, [-2.55, 1.93 - i * .42, -1.36], 12);
}
// Desktop monitor and keyboard, with the gaming tower tucked underneath.
roundedBox(room, [1.48, 1.02, .13], .1, dark, [-.58, 3.42, -2.63]);
roundedBox(room, [1.3, .82, .035], .045, mat('#d4bce7'), [-.58, 3.43, -2.545]);
roundedBox(room, [1.18, .7, .018], .025, mat('#9c8db8'), [-.58, 3.43, -2.518]);
// A soft gradient-like screen glow and desktop wallpaper accents.
roundedBox(room, [.34, .09, .025], .035, palePink, [-.88, 3.42, -2.5]);
roundedBox(room, [.2, .09, .025], .035, mint, [-.56, 3.42, -2.5]);
roundedBox(room, [.12, .09, .025], .035, mat('#f4d58d'), [-.39, 3.42, -2.5]);
roundedBox(room, [.12, .4, .11], .045, woodLight, [-.58, 2.88, -2.61]);
roundedBox(room, [.54, .08, .32], .04, woodLight, [-.58, 2.66, -2.48]);
roundedBox(room, [.58, .88, .56], .09, dark, [-.48, 1.56, -1.91], 'Gaming PC');
roundedBox(room, [.48, .76, .035], .055, mat('#8d83a9', .3, .25), [-.48, 1.56, -1.61]);
for (let i = 0; i < 3; i++) {
  const fan = new THREE.Mesh(new THREE.TorusGeometry(.115, .022, 8, 24), mat(['#e7a9dc', '#98dce2', '#aab2ff'][i], .3, .2));
  fan.position.set(-.48, 1.82 - i * .25, -1.57); room.add(fan);
  cylinder(room, .073, .073, .018, mat('#d9c9f3', .3), [-.48, 1.82 - i * .25, -1.58], 20).rotation.x = Math.PI / 2;
}
roundedBox(room, [.92, .075, .3], .04, lilac, [.62, 2.66, -1.48], 'Studio');
for (let i = 0; i < 12; i++) roundedBox(room, [.065, .022, .2], .009, i % 7 === 1 ? dark : white, [.21 + i * .075, 2.71, -1.48]);
// Books and a cup.
for (let i = 0; i < 4; i++) roundedBox(room, [.72, .11, .46], .035, [woodLight, lilac, mint, palePink][i], [-2.45, 2.66 + i * .12, -1.8]);
cylinder(room, .19, .17, .38, mat('#9fcad1'), [.72, 2.84, -1.72]);
cylinder(room, .19, .19, .055, white, [.72, 3.04, -1.72]);

// A small adjustable desk lamp and a few study reminders pinned above the desk.
cylinder(room, .2, .2, .055, woodDark, [1.02, 2.64, -1.95]);
cylinder(room, .055, .055, .56, dark, [1.02, 2.93, -1.95]);
const lampArm = roundedBox(room, [.07, .58, .07], .03, dark, [1.2, 3.18, -1.95]);
lampArm.rotation.z = -.5;
const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(.13, .27, .3, 20, 1, false), mat('#e8bf83'));
lampShade.position.set(1.37, 3.43, -1.95); lampShade.rotation.z = -.5; lampShade.castShadow = true; room.add(lampShade);
const lampGlow = new THREE.PointLight('#ffe2ae', 1.5, 3.3, 2);
lampGlow.position.set(1.38, 3.26, -1.82); room.add(lampGlow);
for (const [x, y, color, tilt] of [[.2, 4.08, '#f7e99f', -.08], [.75, 3.94, '#bfe4d2', .06], [1.3, 4.1, '#f2c6d9', -.04]]) {
  const note = roundedBox(room, [.43, .46, .035], .025, mat(color), [x, y, -2.77]);
  note.rotation.z = tilt;
  box(room, [.22, .018, .012], mat('#8d8190'), [x, y + .07, -2.744]);
  box(room, [.28, .018, .012], mat('#8d8190'), [x, y - .015, -2.744]);
  box(room, [.18, .018, .012], mat('#8d8190'), [x - .035, y - .1, -2.744]);
}

// Swivel chair with rounded seat, back and little casters.
roundedBox(room, [.98, .24, .85], .18, palePink, [-.65, 1.78, -.65], 'About');
roundedBox(room, [.88, 1.05, .28], .18, pink, [-.65, 2.35, -.29]);
cylinder(room, .09, .09, .62, white, [-.65, 1.35, -.65]);
const chairBase = new THREE.Group(); chairBase.position.set(-.65, 1.04, -.65); room.add(chairBase);
for (let i = 0; i < 5; i++) {
  const a = i * Math.PI * 2 / 5;
  const dx = Math.cos(a), dz = Math.sin(a);
  const spoke = roundedBox(chairBase, [.68, .085, .12], .04, white, [dx * .25, 0, dz * .25]);
  spoke.rotation.y = -a;
  const casterX = dx * .48, casterZ = dz * .48;
  cylinder(chairBase, .045, .045, .16, white, [casterX, -.025, casterZ], 12);
  const wheel = cylinder(chairBase, .12, .12, .12, dark, [casterX, -.08, casterZ], 18);
  wheel.rotation.z = Math.PI / 2;
}

// Floating display shelves with framed prints, plant, and trinkets.
for (const [y, x, length] of [[4.25, -2.15, 2.1], [4.75, 1.15, 2.4], [3.75, -2.05, 1.45]]) {
  roundedBox(room, [length, .13, .48], .055, wood, [x, y, -2.68]);
  for (const dx of [-length * .38, length * .38]) roundedBox(room, [.11, .34, .12], .035, woodLight, [x + dx, y - .18, -2.74]);
}
function frame(x, y, color, w = .48, h = .58) {
  roundedBox(room, [w, h, .09], .035, woodLight, [x, y, -2.82]);
  roundedBox(room, [w - .09, h - .1, .025], .012, mat(color), [x, y, -2.765]);
  sphere(room, [.09, .12, .04], palePink, [x, y, -2.74], 14);
}
frame(-2.8, 4.62, '#d8c5e8'); frame(-2.08, 4.62, '#f4dbc9');
frame(.3, 5.1, '#d8c5e8', .4, .5); frame(.83, 5.1, '#f1d3db', .4, .5); frame(1.36, 5.1, '#efc8ac', .4, .5);
function comicCoverTexture(subtitle, glowColor) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 256, 320);
  bg.addColorStop(0, '#210d28'); bg.addColorStop(.52, '#5e1736'); bg.addColorStop(1, '#170e26');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 320);
  // Comic burst and magical rings behind the heroine.
  ctx.save(); ctx.translate(128, 176);
  for (let i = 0; i < 20; i++) {
    ctx.rotate(Math.PI / 10); ctx.fillStyle = i % 2 ? 'rgba(238,91,116,.13)' : 'rgba(247,191,104,.12)';
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-58, -155); ctx.lineTo(8, -155); ctx.lineTo(8, 0); ctx.fill();
  }
  ctx.strokeStyle = glowColor; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 74, .2, Math.PI * 1.85); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 88, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  // Scarlet cloak, hair and face as bold printed comic shapes.
  ctx.fillStyle = '#b71f43'; ctx.beginPath(); ctx.moveTo(73, 275); ctx.lineTo(90, 190); ctx.lineTo(128, 170); ctx.lineTo(168, 194); ctx.lineTo(190, 275); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ed3c57'; ctx.beginPath(); ctx.moveTo(91, 203); ctx.quadraticCurveTo(51, 223, 63, 282); ctx.lineTo(88, 263); ctx.lineTo(112, 214); ctx.fill();
  ctx.fillStyle = '#e28b68'; ctx.beginPath(); ctx.ellipse(129, 149, 25, 32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8c1739'; ctx.beginPath(); ctx.moveTo(102, 148); ctx.quadraticCurveTo(84, 91, 108, 103); ctx.lineTo(114, 126); ctx.lineTo(126, 100); ctx.lineTo(145, 124); ctx.lineTo(162, 98); ctx.quadraticCurveTo(179, 157, 153, 180); ctx.lineTo(151, 139); ctx.lineTo(131, 128); ctx.lineTo(110, 145); ctx.lineTo(108, 180); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f8cf9c'; ctx.beginPath(); ctx.moveTo(108, 111); ctx.lineTo(117, 82); ctx.lineTo(127, 106); ctx.lineTo(139, 82); ctx.lineTo(151, 112); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff4e8'; ctx.textAlign = 'center'; ctx.font = 'bold 26px Georgia'; ctx.fillText('SCARLET', 128, 34); ctx.font = 'bold 29px Georgia'; ctx.fillText('WITCH', 128, 63);
  ctx.font = 'bold 12px sans-serif'; ctx.fillStyle = '#f4c983'; ctx.fillText(subtitle.toUpperCase(), 128, 302);
  ctx.fillStyle = '#fff4e8'; ctx.font = '9px sans-serif'; ctx.fillText('MARVEL • 01', 128, 316);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
for (const [x, subtitle, glow] of [[-2.8, 'THE HEX FILES', '#f89d9c'], [-2.08, 'CHAOS REIGNS', '#f6c774']]) {
  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(.39, .49),
    new THREE.MeshBasicMaterial({ map: comicCoverTexture(subtitle, glow) })
  );
  cover.position.set(x, 4.62, -2.69);
  cover.userData.section = 'Scarlet Witch Comics';
  clickable.push(cover); room.add(cover);
}
// Wall clock.
cylinder(room, .37, .37, .08, wood, [-1.15, 5.08, -2.68], 32).rotation.x = Math.PI / 2;
cylinder(room, .31, .31, .035, mat('#f8e8d8'), [-1.15, 5.08, -2.62], 32).rotation.x = Math.PI / 2;
box(room, [.025, .21, .025], woodDark, [-1.15, 5.14, -2.58]).rotation.z = -.45;
box(room, [.18, .025, .025], woodDark, [-1.1, 5.04, -2.58]).rotation.z = .25;

// Hanging snapshots and warm fairy lights across the back wall.
const cableMat = mat('#866d79');
const pts = [];
for (let i = 0; i <= 32; i++) { const x = -3.25 + i * .2; pts.push(new THREE.Vector3(x, 4.5 - Math.sin(i / 32 * Math.PI) * .7, -2.48)); }
room.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .018, 6, false), cableMat));
for (let i = 0; i < 9; i++) {
  const x = -3.05 + i * .72, y = 4.47 - Math.sin(i / 8 * Math.PI) * .7;
  sphere(room, [.085, .085, .085], mat('#ffe5b3', .3), [x, y, -2.44], 12);
  const photo = roundedBox(room, [.28, .34, .025], .025, [pink, mint, lilac][i % 3], [x, y - .36, -2.45]);
  photo.rotation.z = (i % 2 ? -.1 : .1);
}

// Plants with tapered leaves, placed in small pots.
function plant(x, z, scale = 1) {
  cylinder(room, .22 * scale, .16 * scale, .28 * scale, woodLight, [x, .96 + .14 * scale, z]);
  cylinder(room, .23 * scale, .22 * scale, .045 * scale, wood, [x, 1.12 * scale, z]);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7, h = (.55 + (i % 3) * .12) * scale;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), leafMat);
    leaf.scale.set(.12 * scale, h * .55, .07 * scale); leaf.position.set(x + Math.cos(a) * .24 * scale, 1.25 * scale + h * .4, z + Math.sin(a) * .2 * scale);
    leaf.rotation.z = Math.cos(a) * .35; leaf.castShadow = true; room.add(leaf);
  }
}
plant(-3.2, -1.65, .85); plant(-2.75, -1.05, .55); plant(3.32, -2.15, .62);

// A student backpack by the doorway, with a front pocket and straps.
roundedBox(room, [.78, 1.02, .42], .2, mat('#7384a8'), [-3.12, 1.46, .58]);
roundedBox(room, [.56, .36, .13], .12, mat('#91a0be'), [-3.12, 1.2, .845]);
roundedBox(room, [.5, .16, .12], .06, mat('#d5b2c8'), [-3.12, 1.53, .84]);
for (const x of [-3.42, -2.82]) {
  const strap = new THREE.Mesh(new THREE.TorusGeometry(.24, .055, 8, 18, Math.PI), mat('#596a8d'));
  strap.position.set(x, 1.48, .35); strap.rotation.z = Math.PI; room.add(strap);
}
// A water bottle clipped to the side pocket.
cylinder(room, .105, .105, .48, mat('#a8d7d3'), [-2.67, 1.32, .58]);
cylinder(room, .07, .07, .08, mat('#65758f'), [-2.67, 1.59, .58], 12);

// Two tiny cats, sculpted from the same soft, rounded forms as the room.
function makeCat(name, baseColor, patches, position) {
  const cat = new THREE.Group(); cat.position.set(...position); cat.scale.setScalar(.72); room.add(cat);
  const fur = mat(baseColor), eye = mat('#37405d', .35), pinkNose = mat('#d987a2');
  sphere(cat, [.34, .23, .22], fur, [0, .25, 0], 20);
  sphere(cat, [.22, .22, .2], fur, [-.2, .39, .015], 20);
  // Upright triangular ears and tiny face details.
  for (const x of [-.32, -.08]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(.09, .2, 12), fur);
    ear.position.set(x, .58, .015); ear.rotation.z = x < -.2 ? .16 : -.16; cat.add(ear);
  }
  sphere(cat, [.035, .045, .025], eye, [-.27, .41, .19], 12);
  sphere(cat, [.035, .045, .025], eye, [-.13, .41, .19], 12);
  sphere(cat, [.04, .03, .025], pinkNose, [-.2, .33, .205], 12);
  // Irregular coat spots sit proud of the body so each color reads clearly.
  for (const [x, y, z, sx, sy, color] of patches) sphere(cat, [sx, sy, .035], mat(color), [x, y, z], 14);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.19, .055, 10, 22, Math.PI * 1.35), fur);
  tail.position.set(.32, .4, -.04); tail.rotation.z = -.45; cat.add(tail);
  for (const x of [-.13, .19]) sphere(cat, [.09, .11, .11], fur, [x, .09, .015], 14);
  cat.userData.catName = name; return cat;
}
const calicoCat = makeCat('Calico', '#fff5ec', [
  [-.28, .49, .19, .095, .1, '#d88760'], [-.12, .3, .19, .13, .08, '#493d49'],
  [.1, .34, .17, .14, .1, '#d88760'], [.03, .44, .15, .1, .065, '#493d49']
], [.65, .83, 1.25]);
const grayCat = makeCat('Gray cat', '#a8a8b6', [
  [-.28, .49, .19, .075, .09, '#f2e7e2'], [.1, .34, .17, .12, .08, '#d9d5dc']
], [3.05, .83, 1.55]);

// Signpost on the left, matching the illustrated portfolio navigation.
roundedBox(room, [.22, 2.8, .2], .07, wood, [-4.85, 3.45, .7]);
makeSign('MY WORK', 'Work', [-4.82, 4.45, .72]);
makeSign('ABOUT', 'About', [-4.82, 3.73, .72], -.04);
makeSign('CONTACT', 'Contact', [-4.82, 3.01, .72], .03);
makeSign('RESUME', 'Resume', [-4.82, 2.29, .72], -.025);

// Low floor cushion and a small, soft-styled Eevee figure.
roundedBox(room, [2.05, .15, 1.05], .16, lilac, [-1.2, .94, 1.8]);
textOn(room, 'WELCOME', 1.35, .2, [-1.2, 1.03, 2.23], { size: 38, color: '#fff9f2' });
const eevee = new THREE.Group(); eevee.position.set(1.95, .93, 1.65); room.add(eevee);
const eeveeFur = mat('#b8784d'), eeveeLight = mat('#d0925d'), eeveeCream = mat('#f4e3c2');
const eeveeDark = mat('#503a38'), eeveeEye = mat('#352c3d', .3), eeveeNose = mat('#4b3438', .35);
// Body, four paws, and a fluffy cream neck ruff.
sphere(eevee, [.38, .3, .48], eeveeFur, [0, .32, -.08], 22);
for (const x of [-.22, .22]) for (const z of [-.34, .22]) {
  roundedBox(eevee, [.16, .32, .16], .07, eeveeFur, [x, .16, z]);
  sphere(eevee, [.1, .055, .12], eeveeLight, [x, .055, z + .025], 12);
}
sphere(eevee, [.34, .34, .32], eeveeCream, [0, .55, -.02], 20);
for (let i = 0; i < 7; i++) {
  const a = i * Math.PI * 2 / 7;
  sphere(eevee, [.16, .18, .15], eeveeCream, [Math.cos(a) * .27, .56 + Math.sin(a) * .06, -.02 + Math.sin(a) * .24], 14);
}
// Round face with long dark-tipped ears and bright eyes.
sphere(eevee, [.32, .31, .3], eeveeLight, [0, .67, .24], 22);
for (const side of [-1, 1]) {
  const ear = new THREE.Mesh(new THREE.ConeGeometry(.13, .58, 14), eeveeFur);
  ear.position.set(side * .2, 1.02, .15); ear.rotation.z = side * -.19; ear.castShadow = true; eevee.add(ear);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.075, .18, 12), eeveeDark);
  tip.position.set(side * .245, 1.205, .15); tip.rotation.z = side * -.19; tip.castShadow = true; eevee.add(tip);
  sphere(eevee, [.055, .085, .035], eeveeEye, [side * .145, .71, .51], 14);
  sphere(eevee, [.018, .03, .012], white, [side * .155, .735, .54], 10);
}
for (const side of [-1, 1]) sphere(eevee, [.12, .095, .12], eeveeCream, [side * .085, .52, .48], 14);
sphere(eevee, [.055, .04, .04], eeveeNose, [0, .58, .59], 12);
// Bushy tail with a cream tip.
sphere(eevee, [.2, .23, .2], eeveeFur, [.34, .48, -.43], 18);
sphere(eevee, [.2, .33, .19], eeveeLight, [.4, .67, -.48], 18);
sphere(eevee, [.16, .22, .16], eeveeCream, [.43, .88, -.5], 16);

const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
let comicPanel = null;
let comicPanelClose = null;
let previousView = null;
let cameraTransition = null;

function tweenCamera(position, target, onComplete) {
  cameraTransition = {
    fromPosition: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPosition: position.clone(),
    toTarget: target.clone(),
    started: performance.now(), duration: 900, onComplete
  };
  controls.enabled = false;
}

function comicBodyTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#403747'; ctx.font = '500 30px "Avenir Next", "Segoe UI", sans-serif'; ctx.textAlign = 'left';
  const body = 'I’ve been really into collecting Scarlet Witch comics recently. I love discovering the different covers and stories, and hunting down new issues to add to my collection.';
  const words = body.split(' '); const lines = []; let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 464 && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  lines.forEach((text, i) => ctx.fillText(text, 20, 72 + i * 51));
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function showComicPanel() {
  if (comicPanel) return;
  previousView = { position: camera.position.clone(), target: controls.target.clone() };
  tweenCamera(new THREE.Vector3(-1.35, 5.2, 2.25), new THREE.Vector3(-2.44, 4.58, -2.69));

  comicPanel = new THREE.Group();
  const z = -4.35;
  const halfViewWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 4.35 * camera.aspect;
  const width = Math.min(innerWidth < 700 ? 1.28 : 1.66, halfViewWidth * 1.8);
  const height = innerWidth < 700 ? 1.82 : 1.9;
  const x = halfViewWidth - width / 2 - .1;
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#e8d9f6', roughness: .2, metalness: .04,
    transparent: true, opacity: .72, transmission: .14, thickness: .14,
    clearcoat: .9, clearcoatRoughness: .12
  });
  const glassHighlight = new THREE.MeshPhysicalMaterial({
    color: '#fffaff', roughness: .13, metalness: .025,
    transparent: true, opacity: .28, transmission: .18, thickness: .08,
    clearcoat: 1, clearcoatRoughness: .08
  });
  roundedBox(comicPanel, [width, height, .12], .15, glass, [x, 0, z]);
  roundedBox(comicPanel, [width - .12, height - .12, .035], .12, glassHighlight, [x, 0, z + .08]);
  const titleY = height / 2 - .31;
  textOn(comicPanel, 'Scarlet Witch Comics', width - .22, .3, [x, titleY, z + .115], {
    size: 33, weight: 700, fontFamily: 'Georgia, "Times New Roman", serif', color: '#56374f'
  });
  const bodyHeight = width - .34;
  const body = new THREE.Mesh(
    new THREE.PlaneGeometry(width - .3, bodyHeight),
    new THREE.MeshBasicMaterial({ map: comicBodyTexture(), transparent: true, depthWrite: false })
  );
  body.position.set(x, -.13, z + .12); comicPanel.add(body);
  comicPanelClose = roundedBox(comicPanel, [.29, .29, .1], .1, glassHighlight, [x + width / 2 - .22, height / 2 - .21, z + .16]);
  comicPanelClose.userData.closeComicPanel = true; clickable.push(comicPanelClose);
  textOn(comicPanel, '×', .2, .22, [x + width / 2 - .22, height / 2 - .21, z + .225], { size: 58, color: '#44374c' });
  comicPanel.traverse(object => {
    if (!object.isMesh) return;
    object.renderOrder = 1000;
    object.material.depthTest = false;
    object.material.depthWrite = false;
  });
  camera.add(comicPanel);
}

function closeComicPanel() {
  if (!comicPanel) return;
  camera.remove(comicPanel);
  if (comicPanelClose) {
    const index = clickable.indexOf(comicPanelClose);
    if (index !== -1) clickable.splice(index, 1);
  }
  comicPanel = null; comicPanelClose = null;
  if (previousView) {
    const view = previousView; previousView = null;
    tweenCamera(view.position, view.target, () => { controls.enabled = true; });
  } else controls.enabled = true;
}

renderer.domElement.addEventListener('pointerdown', event => {
  pointer.x = event.clientX / innerWidth * 2 - 1; pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickable, false)[0];
  if (hit?.object.userData.closeComicPanel) { closeComicPanel(); return; }
  if (hit?.object.userData.section === 'Resume') {
    window.open('./assets/LaylaChenResume.pdf', '_blank', 'noopener,noreferrer');
  }
  if (hit?.object.userData.section === 'Scarlet Witch Comics') showComicPanel();
});
renderer.domElement.addEventListener('pointermove', event => {
  pointer.x = event.clientX / innerWidth * 2 - 1; pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickable, false)[0];
  renderer.domElement.style.cursor = hit?.object.userData.section === 'Resume'
    || hit?.object.userData.section === 'Scarlet Witch Comics'
    || hit?.object.userData.closeComicPanel ? 'pointer' : 'grab';
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < 700 ? 62 : 34; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate); const t = clock.getElapsedTime();
  eevee.position.y = .93 + Math.sin(t * 1.8) * .025;
  eevee.rotation.y = Math.sin(t * .65) * .06;
  calicoCat.rotation.z = Math.sin(t * 1.5) * .025;
  grayCat.rotation.z = Math.sin(t * 1.25 + 1) * .02;
  if (cameraTransition) {
    const progress = Math.min(1, (performance.now() - cameraTransition.started) / cameraTransition.duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    camera.position.lerpVectors(cameraTransition.fromPosition, cameraTransition.toPosition, eased);
    controls.target.lerpVectors(cameraTransition.fromTarget, cameraTransition.toTarget, eased);
    camera.lookAt(controls.target);
    if (progress === 1) {
      const done = cameraTransition.onComplete; cameraTransition = null;
      if (done) done();
    }
  } else if (!comicPanel) controls.update();
  renderer.render(scene, camera);
}
animate();
