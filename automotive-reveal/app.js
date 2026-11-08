import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// OBSIDIAN / An original procedural automotive art direction & 3D animation.
// No vehicle model, texture, brand art or animation is copied from the reference.
const $ = (s) => document.querySelector(s);
const container = $('#scene');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 700px)').matches;
const duration = 13.1;
const ease = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const range = (t, a, b) => ease((t - a) / (b - a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (i, k = 1) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453123; return x - Math.floor(x); };

let renderer, camera, scene, controls, carRoot, carParts = [], liquid, hand, crest, spikes, particles;
let elapsed = reducedMotion ? duration : 0, prevTime = 0, paused = false, isExploring = false, audioEnabled = false, audioCtx;
let previousPhase = -1, playSoundAt = -1;
const stages = [
  { at: 0, name: 'THE BEGINNING', label: '00 — AN ORIGIN IN MOTION', number: '00' },
  { at: 1.3, name: 'LIQUID METAL', label: '01 — SOMETHING IS AWAKENING', number: '01' },
  { at: 3.65, name: 'RAW ENERGY', label: '02 — THE ART OF TRANSFORMATION', number: '02' },
  { at: 5.5, name: 'TAKING SHAPE', label: '03 — ENGINEERED INTO EXISTENCE', number: '03' },
  { at: 9.3, name: 'THE ARRIVAL', label: '04 — ARRIVE LIKE YOU MEAN IT', number: '04' }
];

try { initialize(); } catch (err) {
  console.error('OBSIDIAN initialization failed:', err);
  $('#loadingText').textContent = '3D NOT SUPPORTED ON THIS DEVICE';
  $('#loading').classList.add('hidden');
  const fallback = document.createElement('div');
  fallback.className = 'fallback';
  fallback.textContent = 'A live 3D showcase. Please enable WebGL to view the animation.';
  fallback.style.cssText = 'position:absolute;right:10%;top:50%;font:600 13px sans-serif;max-width:240px;text-align:center;color:#555';
  container.appendChild(fallback);
}

function initialize() {
  scene = new THREE.Scene();
  scene.background = null;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false });
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(room).texture;
  room.dispose();
  pmrem.dispose();
  renderer.setClearColor(0xffffff, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.65;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.6 : 2));
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(mobile ? 38 : 32, 1, .1, 100);
  camera.position.set(-8.1, 4.2, 9.4);
  camera.lookAt(0, 1.3, 0);
  const ambient = new THREE.HemisphereLight('#ffffff', '#777a78', 3.2); scene.add(ambient);
  const key = new THREE.DirectionalLight('#ffffff', 4.4); key.position.set(-3.5, 10, 7); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -8; key.shadow.camera.right = 8; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.bias = -.0003; scene.add(key);
  const fill = new THREE.DirectionalLight('#ffffff', 3.2); fill.position.set(6, 5, -8); scene.add(fill);
  const rim = new THREE.DirectionalLight('#dbe6f3', 2.2); rim.position.set(2, 4, 6); scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({color:0xf4f4f1,roughness:.92,metalness:.05}));
  floor.rotation.x = -Math.PI/2; floor.position.y=-.12; floor.receiveShadow=true; scene.add(floor);
  addFloorShadow();
  createLiquid();
  createHand();
  createEmblem();
  createSpikes();
  createParticles();
  createVehicle();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,1.35,0); controls.enableDamping=true; controls.dampingFactor=.055;
  controls.minDistance=6; controls.maxDistance=18; controls.minPolarAngle=.52; controls.maxPolarAngle=1.6;
  controls.enablePan=false; controls.enabled=false;
  controls.autoRotate = false;
  setCamera();
  window.addEventListener('resize', resize, {passive:true});
  resize();
  wireUI();
  $('#loading').classList.add('hidden');
  requestAnimationFrame(tick);
}

function addFloorShadow() {
  const c = document.createElement('canvas'); c.width=c.height=256;
  const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(128,128,4,128,128,125);
  g.addColorStop(0,'rgba(0,0,0,.44)');g.addColorStop(.45,'rgba(0,0,0,.24)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(7.7,4.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,opacity:.42}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-.112;scene.add(shadow);
}
function material(color=0x090b0b, roughness=.22, metalness=.82, extra={}) {
  return new THREE.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:1,clearcoatRoughness:.16,...extra});
}
const paint = material(0x080b0d,.19,.87);
const dark = material(0x181b1e,.34,.65);
const rubber = new THREE.MeshStandardMaterial({color:0x0a0c0d,roughness:.94});
const blackGlass = material(0x1a252b,.075,.35,{transparent:true,opacity:.86,side:THREE.DoubleSide,transmission:.06});
const silver = material(0xabb3b6,.15,1);
const chrome = material(0xe8eeed,.09,1);
const headlights = new THREE.MeshPhysicalMaterial({color:0xeef6f9,emissive:0x99aebb,emissiveIntensity:.7,metalness:.25,roughness:.18});
const red = material(0x8e1223,.37,.05);

function mesh(geo, mat, parent, x=0,y=0,z=0,track=true,tag='detail') {
  const object = new THREE.Mesh(geo,mat); object.position.set(x,y,z);
  object.castShadow = true;object.receiveShadow=true;
  parent.add(object);
  if(track && parent === carRoot) {
    object.userData.home=object.position.clone();
    object.userData.originalScale=object.scale.clone();
    object.userData.birth=5.3+rand(carParts.length,1)*2.8;
    object.userData.flight = new THREE.Vector3((rand(carParts.length,2)-.5)*5,(rand(carParts.length,3)-.1)*3,(rand(carParts.length,4)-.5)*5);
    object.userData.tag=tag;
    carParts.push(object);
  }
  return object;
}
const box=(a,b,c,mat,parent,x,y,z,tag)=>mesh(new THREE.BoxGeometry(a,b,c),mat,parent,x,y,z,true,tag);
const sphere=(r,mat,parent,x,y,z,track=false)=>mesh(new THREE.SphereGeometry(r,28,16),mat,parent,x,y,z,track);
const cyl=(r1,r2,h,mat,parent,x,y,z,rot=[0,0,0],tag='detail')=>{
  const o=mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat,parent,x,y,z,true,tag);
  o.rotation.set(...rot);return o;
};
function planeShape(points, mat, parent, tag='glass') {
  const shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
  const geo=new THREE.ShapeGeometry(shape);
  return mesh(geo,mat,parent,0,0,0,true,tag);
}
function createVehicle() {
  carRoot = new THREE.Group(); scene.add(carRoot);
  const main = new THREE.Group(); carRoot.add(main);
  // `part` attaches direct children to carRoot so staggered model assembly works.
  const part=(g,m,x,y,z,tag='body')=>mesh(g,m,carRoot,x,y,z,true,tag);
  // Lower ladder frame, underfloor and sculpted side rocker panels.
  part(new THREE.BoxGeometry(4.78,.43,1.82),dark,0,.80,0);
  part(new THREE.BoxGeometry(4.55,.70,1.98),paint,0,1.23,0);
  part(new THREE.BoxGeometry(4.48,.50,1.82),paint,0,1.72,0);
  part(new THREE.BoxGeometry(4.25,.11,1.95),paint,.20,2.82,0);
  part(new THREE.BoxGeometry(1.56,.19,1.89),paint,-1.52,2.05,0);
  part(new THREE.BoxGeometry(.65,.21,1.90),paint,1.95,1.98,0);
  part(new THREE.BoxGeometry(1.95,.09,1.95),paint,-1.40,2.15,0);
  // A/B/C pillars and roof edge.
  for(const z of [-.91,.91]){
    part(new THREE.BoxGeometry(.12,1.05,.12),paint,-.76,2.3,z);
    part(new THREE.BoxGeometry(.11,1.07,.12),paint,.36,2.31,z);
    part(new THREE.BoxGeometry(.1,1.05,.12),paint,1.36,2.31,z);
    part(new THREE.BoxGeometry(.17,.99,.12),paint,2.14,2.29,z);
    part(new THREE.BoxGeometry(3.05,.085,.14),paint,.72,2.79,z);
    part(new THREE.BoxGeometry(4.47,.09,.13),paint,0,1.97,z);
    // Side glass windows, tinted with glancing reflections.
    for (const [x,w] of [[-.23,.90],[.88,.89],[1.76,.65]]){
      const glass=part(new THREE.BoxGeometry(w,.62,.016),blackGlass,x,2.39,z*(1.016/.91),'glass');
      glass.material=blackGlass;
    }
    // door breaks, hinges, metallic handles.
    for(const x of [-.64,.53,1.45]){
      part(new THREE.BoxGeometry(.017,.92,.022),dark,x,1.58,z*1.09,'detail');
      part(new THREE.BoxGeometry(.23,.05,.07),silver,x+.1,1.73,z*1.12,'chrome');
      part(new THREE.BoxGeometry(.09,.09,.075),paint,x-.88,1.75,z*1.09,'detail');
    }
    part(new THREE.BoxGeometry(4.23,.07,.17),dark,0,.88,z*1.1,'detail');
    part(new THREE.BoxGeometry(4.32,.035,.13),silver,0,.96,z*1.07,'chrome');
    // Fender flares follow wheel arches.
    for (const x of [-1.56,1.53]){
      const arch=part(new THREE.TorusGeometry(.63,.12,12,28,Math.PI),dark,x,.66,z*1.055,'detail');
      arch.rotation.z=Math.PI;
    }
    // Rear-view mirrors, indicator and dark underside.
    part(new THREE.BoxGeometry(.39,.25,.31),paint,-.83,2.22,z*1.22,'body');
    part(new THREE.BoxGeometry(.24,.08,.31),dark,-.78,2.20,z*1.21,'detail');
    part(new THREE.BoxGeometry(.32,.045,.1),silver,-.83,2.23,z*1.4,'chrome');
    // Interior seats visible in red through the deep tinted windows.
    for(const x of [-.10,1.13]){
      part(new THREE.BoxGeometry(.52,.67,.21),red,x,2.26,z*.59,'interior');
      const head=part(new THREE.BoxGeometry(.34,.25,.22),red,x,2.68,z*.59,'interior');
      head.rotation.z=-.04;
    }
  }
  // Front windscreen, black framed windshield and wipers.
  part(new THREE.BoxGeometry(.045,.61,1.76),blackGlass,-.83,2.41,0,'glass');
  part(new THREE.BoxGeometry(.075,.092,1.9),dark,-.856,2.725,0,'detail');
  part(new THREE.BoxGeometry(.05,.07,1.70),dark,-.89,2.09,0,'detail');
  for(const z of [-.46,.46]){
    const wiper=part(new THREE.BoxGeometry(.06,.014,.74),silver,-.91,2.11,z,'chrome');
    wiper.rotation.x=.06;
  }
  // Front face: pronounced bumper, square inlets, round lamps, 12-slat grille.
  part(new THREE.BoxGeometry(.21,.72,1.90),paint,-2.39,1.57,0,'body');
  part(new THREE.BoxGeometry(.22,.23,2.05),dark,-2.47,1.10,0,'detail');
  part(new THREE.BoxGeometry(.19,.17,1.80),paint,-2.57,1.27,0,'detail');
  part(new THREE.BoxGeometry(.1,.63,1.03),dark,-2.535,1.73,0,'detail');
  for(let i=0;i<12;i++) part(new THREE.BoxGeometry(.035,.57,.035),silver,-2.596,1.72,-.47+i*.086,'chrome');
  for(const z of [-.75,.75]){
    cyl(.295,.295,.085,dark,carRoot,-2.59,1.76,z,[0,0,Math.PI/2],'detail');
    cyl(.238,.238,.095,headlights,carRoot,-2.657,1.76,z,[0,0,Math.PI/2],'detail');
    const ring=part(new THREE.TorusGeometry(.26,.024,8,36),chrome,-2.69,1.76,z,'chrome'); ring.rotation.y=Math.PI/2;
    const smaller=part(new THREE.TorusGeometry(.16,.012,8,30),silver,-2.71,1.76,z,'chrome'); smaller.rotation.y=Math.PI/2;
    part(new THREE.BoxGeometry(.24,.12,.22),paint,-2.24,2.18,z,'detail');
    part(new THREE.BoxGeometry(.12,.035,.15),headlights,-2.31,2.29,z,'detail');
    part(new THREE.BoxGeometry(.27,.09,.27),dark,-2.59,1.24,z,'detail');
    part(new THREE.BoxGeometry(.20,.05,.22),silver,-2.64,1.25,z,'chrome');
  }
  // Circular conceptual emblem with a three-pointed geometry on the front fascia.
  const emblem=part(new THREE.TorusGeometry(.235,.024,10,48),chrome,-2.64,1.74,0,'chrome');emblem.rotation.y=Math.PI/2;
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3+Math.PI/2;
    const spoke=part(new THREE.BoxGeometry(.019,.20,.025),chrome,-2.667,1.74+Math.cos(a)*.10,Math.sin(a)*.10,'chrome');
    spoke.rotation.x=-a;
  }
  // Roof channel, rain gutters, spare-wheel tire on the rear tailgate.
  for(const z of [-.78,.78]) part(new THREE.BoxGeometry(3.7,.065,.08),silver,.15,2.91,z,'chrome');
  part(new THREE.BoxGeometry(.08,.75,1.67),paint,2.35,1.74,0,'body');
  cyl(.52,.52,.21,rubber,carRoot,2.49,1.68,0,[0,0,Math.PI/2],'wheels');
  cyl(.37,.37,.22,paint,carRoot,2.60,1.68,0,[0,0,Math.PI/2],'chrome');
  // Wheels: real geometry with sidewall, rims, spokes, lug nuts, brake caliper.
  for(const x of [-1.62,1.55]) for(const z of [-1.08,1.08]) {
    const sign=Math.sign(z),outer=z+sign*.08;
    const tire=cyl(.59,.59,.37,rubber,carRoot,x,.59,z,[Math.PI/2,0,0],'wheels');
    tire.material=rubber;
    const wall=part(new THREE.TorusGeometry(.45,.15,16,44),rubber,x,.59,outer,'wheels');
    const rim=cyl(.405,.405,.06,dark,carRoot,x,.59,outer+sign*.07,[Math.PI/2,0,0],'wheels');
    const bead=part(new THREE.TorusGeometry(.386,.02,8,52),silver,x,.59,outer+sign*.12,'chrome');
    for(let j=0;j<12;j++) {
      const angle=j*Math.PI*2/12;
      const sp=part(new THREE.BoxGeometry(.075,.29,.043),silver,x+Math.sin(angle)*.175,.59+Math.cos(angle)*.175,outer+sign*.12,'chrome');
      sp.rotation.z=-angle;
    }
    cyl(.085,.085,.022,chrome,carRoot,x,.59,outer+sign*.16,[Math.PI/2,0,0],'chrome');
    for(let j=0;j<7;j++){
      const a=j*Math.PI*2/7;
      const lug=sphere(.018,silver,carRoot,x+Math.sin(a)*.10,.59+Math.cos(a)*.10,outer+sign*.18,true);
      lug.userData.tag='chrome';
    }
  }
  // Underbody exhaust and trim details.
  for(const z of [-.71,.71]) {
    const pipe=cyl(.075,.075,.29,silver,carRoot,1.75,.57,z,[0,0,Math.PI/2],'chrome');
  }
  // Tiny highlight pinstripes create luxury-body reflections.
  for(const z of [-.993,.993]) part(new THREE.BoxGeometry(3.2,.014,.012),silver,.43,1.91,z,'chrome');
  carRoot.position.y=-.08;
  // Save post-construction orientations (headlight rings, grille badge, wheel axes).
  for(const component of carParts) component.userData.finalRotation = component.rotation.clone();
}

function createLiquid() {
  liquid = new THREE.Group(); scene.add(liquid);
  const mercury=material(0x08090c,.075,1);
  const pool=sphere(1,mercury,liquid,0,.025,0);pool.scale.set(2.45,.105,1.23);pool.castShadow=false;
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2+i*.26,.035-i*.004,8,88),mercury);
    ring.rotation.x=-Math.PI/2;ring.scale.set(1.5,1,1);ring.position.y=.045+i*.012;liquid.add(ring);
  }
  for(let i=0;i<16;i++){
    const a=i*Math.PI*2/16;
    const droplet=sphere(.11+rand(i)*.08,mercury,liquid,Math.cos(a)*1.45,.02,Math.sin(a)*.75);
    droplet.scale.set(.9, .3+rand(i,6)*.6,.9);
  }
}
function createHand(){
  hand=new THREE.Group();scene.add(hand);
  const handmat=material(0x090b10,.075,1);
  const wrist=sphere(.53,handmat,hand,0,1.30,0);wrist.scale.set(.82,1.2,.68);
  const palm=sphere(.68,handmat,hand,-.1,1.96,0);palm.scale.set(1,.68,.78);
  for(let i=0;i<5;i++){
    const z=(i-2)*.25;
    const base=-.28-(i===0?.24:0);
    const finger=new THREE.Group();finger.position.set(base,2.22,z);hand.add(finger);
    const p1=sphere(.17,handmat,finger,-.24,.19,0);p1.scale.set(1.2,1.7,.78);
    const bone=sphere(.13,handmat,finger,-.48,.35,.01);bone.scale.set(1.5,1.5,.75);
    const tip=sphere(.12,handmat,finger,-.69,.36,.025);tip.scale.set(1.3,1,.72);
    finger.rotation.z=-.1+i*.14;
  }
  hand.position.set(-.2,-.9,.0);hand.rotation.z=-.42;
}
function createEmblem() {
  crest=new THREE.Group();scene.add(crest);
  const ring=mesh(new THREE.TorusGeometry(.75,.10,18,84),chrome,crest,0,0,0,false);
  ring.rotation.y=.12;
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3+Math.PI/2;
    const beam=mesh(new THREE.BoxGeometry(.085,.54,.12),silver,crest,Math.cos(a)*.27,Math.sin(a)*.27,.01,false);
    beam.rotation.z=a-Math.PI/2;
  }
  crest.position.set(0,1.12,0);
}
function createSpikes(){
  spikes=new THREE.Group();scene.add(spikes);
  const spikeMat=material(0x0b0c10,.14,1);
  for(let i=0;i<60;i++){
    const a=rand(i,2)*Math.PI*2;
    const r=.25+rand(i,3)*1.17;
    const len=.65+rand(i,5)*2.15;
    const o=mesh(new THREE.ConeGeometry(.06+rand(i,1)*.095,len,5),spikeMat,spikes,Math.cos(a)*r,len*.45,Math.sin(a)*r,false);
    o.rotation.z=(rand(i,7)-.5)*.7;o.rotation.x=(rand(i,8)-.5)*.8;
  }
  spikes.position.y=-.25;
}
function createParticles() {
  const g=new THREE.TetrahedronGeometry(.033,0);
  const m=material(0x373c42,.14,.94,{side:THREE.DoubleSide});
  const count=mobile?240:420;
  particles=new THREE.InstancedMesh(g,m,count);particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  particles.frustumCulled=false;
  const t=new THREE.Object3D();
  particles.userData.motion=[];
  for(let i=0;i<count;i++){
    const a=rand(i,9)*Math.PI*2;
    const r=.3+rand(i,10)*3.7;
    const y=(rand(i,11)-.4)*2.8;
    const speed=.45+rand(i,12)*1.65;
    particles.userData.motion.push([a,r,y,speed,.3+rand(i,13)*2.4]);
    t.position.set(0,-20,0);t.updateMatrix();particles.setMatrixAt(i,t.matrix);
  }
  scene.add(particles);
}

function revealCar(t) {
  const r=range(t,5.05,9.1);
  carRoot.visible=r>0;
  for(const part of carParts){
    const d=part.userData;
    const v=range(t,d.birth,d.birth+1.18);
    part.visible=v>.001;
    if(!part.visible)continue;
    const fly=1-v;
    part.position.copy(d.home).addScaledVector(d.flight,fly*1.65);
    part.scale.copy(d.originalScale).multiplyScalar(.09+.91*v);
    part.rotation.copy(d.finalRotation);
    part.rotation.y += (d.tag==='wheels'||d.tag==='chrome'?fly*.65:0)+(d.tag==='glass'?fly*.3:0);
  }
  carRoot.position.y=-.08+Math.sin(t*1.8)*.006*r;
  carRoot.rotation.y=.02 + Math.sin(t*.21)*.034*r;
}

function animateFx(t) {
  const poolStrength=1-range(t,3.5,5.65);
  liquid.visible=poolStrength>.001;
  liquid.scale.setScalar(.01 + range(t,.1,1.4)*.99);
  liquid.scale.y=.5+Math.sin(t*4)*.1;
  liquid.position.y= -.09;
  liquid.rotation.y=t*.05;
  hand.visible=t>1.15&&t<4.95;
  hand.scale.setScalar(range(t,1.1,2.4)*(1-range(t,4.1,4.95)));
  hand.position.set(-.2, -.85 +range(t,1.1,3)*.8,0);
  hand.rotation.z=-.5+range(t,2,4)*.34+Math.sin(t*1.2)*.06;
  crest.visible=t>2.85&&t<5.35;
  crest.scale.setScalar(range(t,2.8,3.6)*(1-range(t,4.7,5.3)));
  crest.position.y=.8+range(t,3,4)*1.0;
  crest.rotation.y=t*1.1;
  spikes.visible=t>3.9&&t<6.15;
  spikes.scale.setScalar(range(t,3.85,4.72)*(1-range(t,5.2,6.15)));
  spikes.rotation.y=t*.16;
  // A moving, reflected constellation of metal fragments supplies the morphing illusion.
  const cloudStrength=range(t,3.55,4.65)*(1-range(t,7.9,9.6));
  particles.visible=cloudStrength>.001;
  if(particles.visible){
    const dummy=new THREE.Object3D();
    const movements=particles.userData.motion;
    for(let i=0;i<movements.length;i++){
      const [a,r,y,speed,size]=movements[i];
      const progress=range(t,5.1,9.1);
      const angle=a+t*speed*.38;
      dummy.position.set(Math.cos(angle)*(r*(1-progress)+.12),y+(1-progress)*Math.sin(a*2+t*1.4)*.26+1.4,Math.sin(angle)*(r*(1-progress)+.16));
      dummy.scale.setScalar(size*cloudStrength*(.8+rand(i,8)*.7));
      dummy.rotation.set(a,t*speed,a*.3);
      dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);
    }
    particles.instanceMatrix.needsUpdate=true;
  }
  revealCar(t);
}
function setCamera() {
  const aspect=container.clientWidth / Math.max(container.clientHeight,1);
  camera.aspect=aspect;
  camera.fov=mobile ? 48 : aspect<1.3 ? 38 : 33;
  camera.updateProjectionMatrix();
}
function resize(){
  const w=container.clientWidth,h=container.clientHeight;
  if(!w||!h)return;
  renderer.setSize(w,h,false);
  setCamera();
}
function updateCamera(t) {
  if(isExploring) { controls.update();return; }
  const p=range(t,6.4,10.3);
  const mobileScale=mobile?1.35:1;
  camera.position.set(-8.1*mobileScale+1.7*p,4.2*mobileScale-.5*p,9.4*mobileScale-2.1*p);
  camera.lookAt(0,1.36,0);
  controls.target.set(0,1.35,0);
}
function updateUI(t){
  const percent=clamp(t/duration*100,0,100);
  $('#timelineFill').style.width=percent+'%';$('#timelineDot').style.left=percent+'%';
  $('#timelineTrack').setAttribute('aria-valuenow',Math.round(percent));
  let p=0; for(let i=0;i<stages.length;i++){if(t>=stages[i].at)p=i;}
  if(p!==previousPhase){
    previousPhase=p;
    $('#timelineIndex').textContent=stages[p].number;
    $('#timelineTitle').textContent=stages[p].name;
    $('#sceneLabel').textContent=stages[p].label;
    if(audioEnabled&&t>2&&p!==playSoundAt){playSoundAt=p;subtleSound(p)}
  }
  $('#exploreButton').innerHTML=isExploring?'<span class="explore-icon">◉</span> EXIT 360°':'<span class="explore-icon">◉</span> EXPLORE 360°';
}
function tick(now){
  if(!prevTime)prevTime=now;
  const dt=Math.min(.09,(now-prevTime)/1000);prevTime=now;
  if(!paused && !isExploring)elapsed=Math.min(duration,elapsed+dt);
  animateFx(elapsed);
  updateCamera(elapsed);
  updateUI(elapsed);
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}
function play(){isExploring=false;controls.enabled=false;container.classList.remove('is-interactive');$('#rotateHint').classList.remove('visible');elapsed=0;previousPhase=-1;paused=false;playSoundAt=-1;window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});}
function wireUI(){
  $('#replayButton').addEventListener('click',play);
  $('#bottomReplay').addEventListener('click',play);
  $('#exploreButton').addEventListener('click',()=>{
    if(!isExploring){
      elapsed=duration;isExploring=true;controls.enabled=true;container.classList.add('is-interactive');
      $('#rotateHint').classList.add('visible');
      if(mobile) setTimeout(()=>$('#rotateHint').classList.remove('visible'),3300);
    }else{
      isExploring=false;controls.enabled=false;container.classList.remove('is-interactive');$('#rotateHint').classList.remove('visible');
    }
  });
  $('#soundToggle').addEventListener('click',()=>{
    audioEnabled=!audioEnabled;$('#soundToggle').setAttribute('aria-pressed',String(audioEnabled));
    $('#soundToggle').setAttribute('aria-label',audioEnabled?'Turn sound off':'Turn sound on');
    $('#soundLabel').textContent=audioEnabled?'SOUND ON':'SOUND OFF';
    if(audioEnabled){try{audioCtx ??= new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();subtleSound(1);}catch(e){console.warn('Audio unavailable',e)}}
  });
  $('#timelineTrack').addEventListener('click',e=>{const box=e.currentTarget.getBoundingClientRect();elapsed=clamp((e.clientX-box.left)/box.width,0,1)*duration;isExploring=false;controls.enabled=false;container.classList.remove('is-interactive');$('#rotateHint').classList.remove('visible')});
  document.addEventListener('visibilitychange',()=>{paused=document.hidden});
}
function subtleSound(phase){
  if(!audioCtx||!audioEnabled)return;
  const now=audioCtx.currentTime;
  const oscillator=audioCtx.createOscillator(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
  oscillator.type='sine';oscillator.frequency.setValueAtTime(55+phase*27,now);
  oscillator.frequency.exponentialRampToValueAtTime(28+phase*13,now+.65);
  filter.type='lowpass';filter.frequency.value=320;
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.09);gain.gain.exponentialRampToValueAtTime(.0001,now+.8);
  oscillator.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);
  oscillator.start(now);oscillator.stop(now+.82);
}