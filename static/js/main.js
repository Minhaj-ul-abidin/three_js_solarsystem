let ctx, camera, scene, renderer, planets, sun,glows=[], bgStars;

function init() {
	// Init scene
	scene = new THREE.Scene();

	// Init camera (PerspectiveCamera)
	camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.01, 10000);

	// Init renderer
	ctx = document.body.appendChild(document.createElement('canvas')).getContext('2d');
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});


	// Render to canvas element
	document.body.appendChild(renderer.domElement);
	renderer.domElement.style.position =
		ctx.canvas.style.position = 'fixed';
	ctx.canvas.style.background = 'black';

	window.addEventListener('resize', onWindowResize, false);
	onWindowResize()
	// Position camera
	camera.position.set(500, 235, 0);
	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 1;

	// helper grid
	// var gridXZ = new THREE.GridHelper(1000, 100);
	// scene.add(gridXZ);
    let sun_size = 7
	sun = new THREE.Mesh(
        new THREE.IcosahedronGeometry(sun_size, 2), 
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('image/sun.jpg')
        }));
    sun.position.set(0, 0, 0);
    sun.castshadow = false;
	scene.add(sun); // add Sun
    addGlow(sun_size);



	let planetTextures = [
		"image/mercury.jpg", 
		"image/venus.jpg", 
		"image/earth.jpg", 
		"image/mars.jpg", 
		"image/jyupiter.jpg",
		"image/saturn.jpg",
		"image/uranus.jpg",
		"image/neptune.jpg",
		];
	let planetSizes = [
		1.7, 4 , 4, 4, 6, 5, 2.5, 2.3
	];
    planets = addPlanets(planetTextures, planetSizes)
    
    bgStars = creatBackGroundStars();
    setupLights()
}

// Draw the scene every time the screen is refreshed
let t = 0.00

function animate() {

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'  ;
    for (let s in bgStars) {
        let q = bgStars[s],
          oX = q.x * ctx.canvas.width,
          oY = q.y * ctx.canvas.height,
          size = Math.random() < .9998 ? Math.random() : Math.random() * 3;
    
        ctx.beginPath();
        ctx.moveTo(oX, oY - size);
        ctx.lineTo(oX + size, oY);
        ctx.lineTo(oX, oY + size);
        ctx.lineTo(oX - size, oY);
        ctx.closePath();
        ctx.fill();
      }

	for (let p in planets) {
		let planet = planets[p];
		planet.rot += planet.rotSpeed
		planet.rotation.set(0, planet.rot, 0);
		planet.orbit += planet.orbitSpeed;
		planet.position.set(Math.cos(planet.orbit) * planet.orbitRadius, 0, Math.sin(planet.orbit) * planet.orbitRadius);
	  }
	t += 0.01;
    sun.rotation.y += 0.005;
    for (let g in glows) {
        let glow = glows[g];
        glow.scale.set(
          Math.max(glow.origScale.x - .2, Math.min(glow.origScale.x + .2, glow.scale.x + (Math.random() > .5 ? 0.005 : -0.005))),
          Math.max(glow.origScale.y - .2, Math.min(glow.origScale.y + .2, glow.scale.y + (Math.random() > .5 ? 0.005 : -0.005))),
          Math.max(glow.origScale.z - .2, Math.min(glow.origScale.z + .2, glow.scale.z + (Math.random() > .5 ? 0.005 : -0.005)))
        );
        glow.rotation.set(0, t, 0);
      }
 // These to strings make it work
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	renderer.setSize(window.innerWidth, window.innerHeight);
}


function addPlanets(planetTextures, planetSizes) {
	let planets = []

	for (let p = 0, radii = 0; p < 8; p++) {
		let size = planetSizes[p];
		let planetShpere = new THREE.Mesh(
				new THREE.IcosahedronGeometry(size, 2),
				new THREE.MeshBasicMaterial({
					map :  new THREE.TextureLoader().load(planetTextures[p])
					// shading: THREE.FlatShading
				  })
			),
			planet = new THREE.Group();

		planet.add(planetShpere);

		if (p == 5 || p == 7 ) {
			let ring_texture = p == 5 ? "image/saturn_ring.jpg": "image/uranus_ring.jpg"

			const geometry = p ==5 ?new THREE.RingBufferGeometry(size + 0.2 , size+3, 64): new THREE.RingBufferGeometry(size + 0.1 , size+1, 64);
			let pos = geometry.attributes.position;
			let v3 = new THREE.Vector3();
			for (let i = 0; i < pos.count; i++){
				v3.fromBufferAttribute(pos, i);
				geometry.attributes.uv.setXY(i, v3.length() < size + size/3 ? 0 : 1, 1);
			}
			let ring = new THREE.Mesh(
				geometry,
				new THREE.MeshBasicMaterial({
					map:  new THREE.TextureLoader().load(ring_texture),
					color: 0xffffff,
					side: THREE.DoubleSide,
                    transparent: true,
                    opacity:0.8
				  })
			)
            if( p == 5 ){
            	ring.rotation.x = 73 * Math.PI / 180
            }
			planet.add(ring);
			



		}
		planet.orbitRadius =  12 + radii;
		planet.rotSpeed = 0.005 + Math.random() * 0.01;
		planet.rotSpeed *= Math.random() < .10 ? -1 : 1;
		planet.rot = Math.random();
		planet.orbitSpeed = p != 4 ? (0.02 - p * 0.0048) * 0.25: (0.02 - 3.5 * 0.0048) * 0.25
		planet.orbit = Math.random() * Math.PI * 2;
		planet.position.set(planet.orbitRadius, 0, 0);
		console.log(planet.orbitRadius)
		radii = planet.orbitRadius + size;
		scene.add(planet);
		console.log(planet);
		planets.push(planet);
	}
	return planets
}

function creatBackGroundStars(){
    let bgStars = [];

    for (let i = 0; i < 500; i++) {
        let tw = {
            x: Math.random(),
            y: Math.random()
        }

        bgStars.push(tw);
    }
    return bgStars
}


function addGlow(sun_size){
    for (let i = 1, scaleX = 1.1, scaleY = 1.1, scaleZ = 1.1; i < 4; i++) {
        let starGlow = new THREE.Mesh(
          new THREE.IcosahedronGeometry(sun_size, 1),
          new THREE.MeshBasicMaterial({
            color: 0xE25822,
            transparent: true,
            opacity: 0.5
          })
        );
        starGlow.castShadow = false;
        scaleX += 0.001 + Math.random() * .025;
        scaleY += 0.001 + Math.random() * .025;
        scaleZ += 0.001 + Math.random() * .025;
        starGlow.scale.set(scaleX, scaleY, scaleZ);
        starGlow.origScale = {
          x: scaleX,
          y: scaleY,
          z: scaleZ
        };
        glows.push(starGlow);
        scene.add(starGlow);
      }
}


function setupLights(){
    var light1 = new THREE.PointLight(0xE25822, 2, 0, 0); 
    light1.position.set(0, 0, 0);
    scene.add(light1);

    var light2 = new THREE.AmbientLight(0x090909);
    scene.add(light2);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();