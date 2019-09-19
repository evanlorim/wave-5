

var inputMap = {
	"l_joy_x": "axes[0]",
	"l_joy_y": "axes[1]",
	"r_joy_x": "axes[2]",
	"r_joy_y": "axes[3]",
	"d_pad_x": "axes[4]",
	"d_pad_y": "axes[5]",
	"b": "buttons[0]",
	"a": "buttons[1]",
	"y": "buttons[2]",
	"x": "buttons[3]",
	"l": "buttons[4]",
	"r": "buttons[5]",
	"zl": "buttons[6]",
	"zr": "buttons[7]",
	"select": "buttons[8]",
	"start": "buttons[9]",
	"l_joy": "buttons[10]",
	"r_joy": "buttons[11]",
	"home": "buttons[12]",
	"snap": "buttons[13]"
};

var cfg;
var gamepad;
var canvasSize = _.min([window.innerWidth,window.innerHeight]);
var fragmentShader, vertexShader;
var container, canvas;
var camera, scene, renderer;
var uniforms, material, mesh;
var recorder, recording;

var startTime = Date.now();

run();

function run() {
	loadCfg().then(json => {
		cfg = json;
		console.log();
		return loadGamepad();	
	}).then(gp => {
		gamepad = gp;
		return loadShader('shaders/frag.frag')
	}).then(text => {
		fragmentShader = text;
		return loadShader('shaders/vertex.vertex');
	}).then(text => {
		vertexShader = text;		
		initUniforms();
		initThree();
		initRecorder();
		animate();
	});
}

function loadCfg() {
	return new Promise(resolve => {
		fetch('config/config.json', {method:"GET"}).then(response => {
				return response.json();
			}).then(response => {
				resolve(response);
			});
	});
}

function loadGamepad() {
	return new Promise(resolve => {
		window.addEventListener("gamepadconnected", e => {
			resolve(e.gamepad);
		});
	});
}

function loadShader(loc) {
	return new Promise(resolve => {
		fetch(loc, {method:"GET"}).then(response => {
				return response.text();
			}).then(response => {
				resolve(response);
			});
	});
}

function initUniforms() {
	uniforms = {
		u_time: { type: "f", value: 1.0 },
		u_resolution: { type: "v2", value: new THREE.Vector2(canvasSize,canvasSize) },
	};
	_.forEach(cfg.vars, (v,k) => {
		uniforms[k] = { type: "f", value: v.value};
	});
}

function initThree() {
	container = document.getElementById('container');
	camera = new THREE.Camera();
	camera.position.z = 1;
	scene = new THREE.Scene();

	material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});

	mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer(cfg.renderer);
	renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
	container.appendChild(renderer.domElement);
	renderer.setSize(canvasSize, canvasSize);
}

function initRecorder() {
	var canvas = container.firstElementChild;
	recorder = new CanvasRecorder(canvas);
	recording = false;
}

function getInput(key) {
	return _.get(gamepad, inputMap[key]);
}

function update() {
	uniforms.u_time.value = ((Date.now() - startTime) / 1000.);
	
	uniforms.u_vshift.value += cfg.vars.u_vshift.step * getInput("l_joy_x") * -1;
	uniforms.u_pshift.value += cfg.vars.u_pshift.step * getInput("r_joy_x") * -1;
	uniforms.u_frequency.value += cfg.vars.u_frequency.step * getInput("d_pad_x") * -1;
	uniforms.u_ratio.value += cfg.vars.u_ratio.step * getInput("d_pad_y") * -1;
	uniforms.u_amplitude.value += cfg.vars.u_amplitude.step * getInput("l_joy_y") * -1;

	if (getInput("l").pressed && !recording) {
		recorder.start();
		recording = true;
	}
	if (getInput("r").pressed && recording) {
		recorder.stop();
		recording = false;
		recorder.save();
	}
}

function animate() {
	requestAnimationFrame(animate);
	update();
	renderer.render(scene, camera);
}