class Game {
	constructor() {
		if (!Detector.webgl) Detector.addGetWebGLMessage();

		this.modes = Object.freeze({
			NONE: Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING: Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAMEOVER: Symbol("gameover")
		});
		this.mode = this.modes.NONE;

		this.container;
		this.player;
		this.cameras;
		this.camera;
		this.scene;
		this.renderer;
		this.animations = {};
		this.assetsPath = 'assets/';

		this.remotePlayers = [];
		this.remoteColliders = [];
		this.initialisingPlayers = [];
		this.remoteData = [];

		this.messages = {
			text: [
				"Welcome to Blockland",
				"GOOD LUCK!"
			],
			index: 0
		}

		this.container = document.createElement('div');
		this.container.style.height = '100%';
		document.body.appendChild(this.container);

		const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';

		const game = this;
		this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];

		this.anims2 = ['Idle', 'Walking', 'Walking Backwards', 'TurnLeft', 'TurnRight', 'Running'];

		const options = {
			assets: [
				`${this.assetsPath}images/nx.jpg`,
				`${this.assetsPath}images/px.jpg`,
				`${this.assetsPath}images/ny.jpg`,
				`${this.assetsPath}images/py.jpg`,
				`${this.assetsPath}images/nz.jpg`,
				`${this.assetsPath}images/pz.jpg`
			],
			oncomplete: function () {
				game.init();
			}
		}

		game.anims2_dict = []
		this.anims.forEach(function (anim) { options.assets.push(`${game.assetsPath}fbx/anims/${anim}.fbx`) });
		this.anims2.forEach(function (anim) {
			let characterList = ['amy', 'jimmy', 'mouse', 'rabbit'];
			characterList.forEach(function (character) {
				options.assets.push(`${game.assetsPath}fbx/character/${character}/${anim}.fbx`)
				game.anims2_dict.push({ "character": character, "anim": anim });
			})
		});
		options.assets.push(`${game.assetsPath}fbx/town.fbx`);
		options.assets.push(`${game.assetsPath}SimSun_Regular.json`);

		this.mode = this.modes.PRELOAD;

		this.clock = new THREE.Clock();

		const preloader = new Preloader(options);

		window.onError = function (error) {
			console.error(JSON.stringify(error));
		}
	}

	initSfx() {
		this.sfx = {};
		this.sfx.context = new (window.AudioContext || window.webkitAudioContext)();
		this.sfx.gliss = new SFX({
			context: this.sfx.context,
			src: { mp3: `${this.assetsPath}sfx/gliss.mp3`, ogg: `${this.assetsPath}sfx/gliss.ogg` },
			loop: false,
			volume: 0.3
		});
	}

	set activeCamera(object) {
		this.cameras.active = object;
	}

	init() {
		this.mode = this.modes.INITIALISING;

		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200000);

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x00a0f0);

		const ambient = new THREE.AmbientLight(0xaaaaaa);
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight(0xaaaaaa);
		light.position.set(30, 100, 40);
		light.target.position.set(0, 0, 0);

		light.castShadow = true;

		const lightSize = 500;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 500;
		light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

		light.shadow.bias = 0.0039;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;

		this.sun = light;
		this.scene.add(light);

		// model
		const loader = new THREE.FBXLoader();
		const game = this;


		this.player = new PlayerLocal(this);

		this.loadEnvironment(loader);	// 默认blockland场景

		this.speechBubble = new SpeechBubble(this, "", 150);
		this.speechBubble.mesh.position.set(0, 350, 0);

		// this.joystick = new JoyStick({
		// 	onMove: this.playerControl,
		// 	game: this
		// });

		this.renderer = new THREE.WebGLRenderer({ antialias: true });

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.loadNPC(loader);

		this.container.appendChild(this.renderer.domElement);

		if ('ontouchstart' in window) {
			window.addEventListener('touchdown', (event) => game.onMouseDown(event), false);
		} else {
			window.addEventListener('mousedown', (event) => game.onMouseDown(event), false);
		}

		window.addEventListener('resize', () => game.onWindowResize(), false);

	}
	loadNPC(loader) {
		//根据配置文件加载npc并设置好逻辑
		dialogueData.Mouse.stages.stage5.options[0].callback.push(this.goToScene1.bind(this));
		dialogueData.Mouse.stages.stage5.options[1].callback.push(this.goToScene2.bind(this));
		dialogueData.Mouse.stages.stage5.options[2].callback.push(this.goToScene3.bind(this));
		dialogueData.Mouse.stages.stage5.options[3].callback.push(this.goToScene4.bind(this));
		for (let a in dialogueData) {
			loader.load(`${this.assetsPath}${dialogueData[a].fbx}`, (obj) => {
				this.scene.add(obj);
				obj.position.set(...dialogueData[a].position);
				obj.scale.set(...dialogueData[a].scale);
				obj.rotation.set(...dialogueData[a].rotation);
				//定义动画
				this.NPCmixer = new THREE.AnimationMixer(obj);
				obj.animations.forEach((clip) => {
					const clips = this.NPCmixer.clipAction(clip)
					clips.play();
				})
				const raycaster = new THREE.Raycaster();
				const mouse = new THREE.Vector2();


				const npcMouse = (event) => {
					// 将鼠标点击位置归一化为屏幕坐标系
					mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
					mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

					// 更新射线的起点和方向

					raycaster.setFromCamera(mouse, game.camera);
					// 执行射线和物体的交互检测

					const intersects = raycaster.intersectObject(obj, true);
					// 处理点击事件
					if (intersects.length > 0) {
						// 点击了物体
						if (NPCcommunicate == false) {
							NPCcommunicate = true
							loadNPCDialogue(a);
						} else {
							console.log("aaa")
						}
					}
				}
				document.addEventListener("click", npcMouse, false);
			})
		}

	}
	loadEnvironment(loader) {
		const game = this;
		loader.load(`${this.assetsPath}fbx/town.fbx`, function (object) {
			game.environment = object;
			game.colliders = [];
			game.scene.add(object);
			object.traverse(function (child) {
				if (child.isMesh) {
					if (child.name.startsWith("proxy")) {
						game.colliders.push(child);
						child.material.visible = false;
					} else {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			});

			const tloader = new THREE.CubeTextureLoader();
			tloader.setPath(`${game.assetsPath}/images/`);

			var textureCube = tloader.load([
				'px.jpg', 'nx.jpg',
				'py.jpg', 'ny.jpg',
				'pz.jpg', 'nz.jpg'
			]);

			game.scene.background = textureCube;

			game.loadScene1();
			game.loadScene2();
			game.loadScene3();

			game.loadNextAnim(loader);
		})
	}

	goToScene(sceneId) {
		switch (sceneId) {
			case "1":
				this.goToScene1();
				break;
			case "2":
				this.goToScene2();
				break;
			case "3":
				this.goToScene3();
				break;
			case "4":
				this.goToScene4();
				break;
		}
	}

	// 在这里注册每个scene自定义的动画
	sceneAnimation(dt) {
		const game = this;
		if (game.scene1 !== undefined && game.scene1.animate !== undefined) {
			game.scene1.animate(dt);
		}
		if (game.scene3 !== undefined && game.scene3.animate !== undefined) {
			game.scene3.animate(dt);
		}

	}

	loadScene1() {
		if (game.scene1 === undefined) {
			console.log('loading scene1');
			// 存储到game.scene1之中
			game.scene1 = {};
			// 一些工具函数
			game.scene1.utils = {};
			game.scene1.utils.getNumCanvas = function (i, bgc, fc) {
				var width = 512, height = 512;
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');
				ctx.fillStyle = bgc;	// 背景颜色
				ctx.fillRect(0, 0, width, height);

				let str = `${i}`;
				ctx.fillStyle = fc;		// 字体颜色
				if (str.length == 1) {
					ctx.font = 512 + 'px " bold';
					ctx.fillText(`${i}`, 110, 450);
				} else if (str.length == 2) {
					ctx.font = 448 + 'px " bold';
					ctx.fillText(`${i}`, 0, 450);
				}

				return canvas;
			}
			game.scene1.utils.getInsCanvas = function (i, bgc, fc) {
				var width = 512, height = 512;
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');
				ctx.fillStyle = bgc;	// 背景颜色
				ctx.fillRect(0, 0, width, height);
				ctx.fillStyle = fc;		// 字体颜色
				ctx.font = 128 + 'px " bold';
				ctx.fillText(`${i}`, 50, 300);
				return canvas;
			}
			game.scene1.utils.getBubbleSortRecord = function () {
				let record = [];
				let list = game.scene1.bubbleSort.valList.concat();

				for (let i = 0; i <= list.length - 2; i++) {
					for (let j = list.length - 1; j >= i + 1; j--) {
						if (list[j] < list[j - 1]) {
							record.push([j, j - 1, list[j], list[j - 1]]);	// 交换第j和第j-1项，他们的值分别是list[j]和list[j-1]
							let temp = list[j];
							list[j] = list[j - 1];
							list[j - 1] = temp;
						}
					}
				}
				return record;
			}
			game.scene1.utils.getCurrentState = function () {
				let list = game.scene1.bubbleSort.valList.concat();
				let k = 0;
				let num;
				if (game.scene1.bubbleSort.cur_ins < game.scene1.bubbleSort.record.length) {
					num = game.scene1.bubbleSort.cur_ins;
				} else {
					num = game.scene1.bubbleSort.record.length
				}
				if (k == num) {
					return list;
				}
				for (let i = 0; i <= list.length - 2; i++) {
					for (let j = list.length - 1; j >= i + 1; j--) {
						if (list[j] < list[j - 1]) {
							let temp = list[j];
							list[j] = list[j - 1];
							list[j - 1] = temp;
							k++;
							if (k == num) {
								return list;
							}
						}
					}
				}
			}

			// 彩色花纹地板
			const vertex = new THREE.Vector3();
			const color = new THREE.Color();
			let ggg = new THREE.PlaneGeometry(10000, 10000, 100, 100);
			let floorGeometry = new THREE.BufferGeometry().fromGeometry(ggg);
			floorGeometry.rotateX(- Math.PI / 2);
			// vertex displacement
			// console.log(floorGeometry);
			let position = floorGeometry.attributes.position;
			for (let i = 0, l = position.count; i < l; i++) {
				vertex.fromBufferAttribute(position, i);
				// vertex.x += Math.random() * 20 - 10;
				vertex.y += 10000;
				// vertex.z += Math.random() * 20 - 10;
				position.setXYZ(i, vertex.x, vertex.y, vertex.z);
			}
			floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
			position = floorGeometry.attributes.position;
			const colorsFloor = [];

			for (let i = 0, l = position.count; i < l; i++) {
				color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace);
				colorsFloor.push(color.r, color.g, color.b);
			}

			floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
			const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			game.scene.add(floor);
			game.colliders.push(floor);
			game.scene1.floor = floor;

			// 木板的相关代码
			game.scene1.info = false; // 当前是否在阅读信息
			game.scene1.boardGeometry = new THREE.BoxGeometry(200, 200, 200);
			// game.scene1.loader = new THREE.TextureLoader();
			game.scene1.boardMaterial = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene1.utils.getInsCanvas("  help", '#884A39', '#21FFB8')) })
			game.scene1.boardMesh = new THREE.Mesh(game.scene1.boardGeometry, game.scene1.boardMaterial);

			console.log(game.scene1.boardMesh);
			game.scene.add(game.scene1.boardMesh);
			game.scene1.boardMesh.position.set(-2110, 10100, 750);
			game.scene1.boardMesh.isBoard1 = true;
			game.colliders.push(game.scene1.boardMesh);

			const EVENT_MOUSEDOWN_onBoard1 = (ev) => {
				if (game.scene1.info === true)
					return;
				const mouse = new THREE.Vector2();
				mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				const intersects = raycaster.intersectObjects(game.colliders);
				console.log(intersects[0]);
				if (intersects.length === 0)
					return;
				if (intersects[0].object.isBoard1) {
					let info = document.getElementById("info");
					let content = document.getElementById("info_content");
					content.textContent = config.readMe[0]
					info.className = "show";
					game.scene1.info = true;
				}

				document.addEventListener('mousedown', EVENT_CLICK_onInfo);
			}

			const EVENT_CLICK_onInfo = (ev) => {
				if (game.scene1.info === false)
					return;
				let info = document.getElementById("info");
				game.scene1.info = false;
				info.className = "hide";

				document.removeEventListener('mousedown', EVENT_CLICK_onInfo);
			}

			document.addEventListener('mousedown', EVENT_MOUSEDOWN_onBoard1, false);


			// [冒泡排序]
			// 8个立方体，对应待排序的8个数字
			let boxList = [];

			let valList = [1, 2, 3, 4, 5, 6, 7, 8];
			valList.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
			game.scene1.bubbleSort = {};
			game.scene1.bubbleSort.valList = valList.concat();

			game.scene1.bubbleSort.record = game.scene1.utils.getBubbleSortRecord();
			game.scene1.bubbleSort.cur_ins = 0;	// 下一条应该执行的指令

			let boxMaterialList = [];
			for (let i = 0; i < 10; i++) {
				boxMaterialList.push(new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(i, '#700BE1', '#FFD795')) }));
			}

			let bbb = new THREE.BoxGeometry(200, 200, 200);
			let boxGeometry = new THREE.BufferGeometry().fromGeometry(bbb).toNonIndexed();

			for (let i = 0; i < 8; i++) {
				const box = new THREE.Mesh(boxGeometry, boxMaterialList[valList[i]]);
				box.position.x = -900 - 400 * i;
				box.position.y = 10000 + 500;
				box.position.z = 0 + 2400;
				game.scene.add(box);
				game.colliders.push(box);

				boxList.push(box);
			}
			game.scene1.bubbleSort.boxList = boxList.concat();

			// 3个立方体，表示3个功能按钮，可以点击
			let boxButtonList = [];
			// let boxButtonXList = [];
			let insList = [' next  ', 'restart', 'shuffle'];

			for (let i = 0; i < 3; i++) {
				const box = new THREE.Mesh(
					boxGeometry,
					new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene1.utils.getInsCanvas(insList[i], '#D2D518', '#21FFB8')) })
				);
				box.position.x = -900 - 1610 - 400 * i; // -2510 -400 * i
				box.position.y = 10000 + 100;	  // 10100		
				box.position.z = 0 + 2400 - 1650; // 750
				game.scene.add(box);
				game.colliders.push(box);

				boxButtonList.push(box);
				// boxButtonXList.push(box.position.x);
			}

			game.scene1.bubbleSort.boxButtonList = boxButtonList.concat();
			// game.scene1.bubbleSort.boxButtonXList = boxButtonXList;
			game.scene1.bubbleSort.insList = insList;

			// 与按钮方块进行交互
			const mouseUpBoxButton = (e) => {
				// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
				const mouse = new THREE.Vector2();
				mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				// 计算物体和射线的焦点
				let bubbleSortButtonList = game.scene1.bubbleSort.boxButtonList;
				const intersects = raycaster.intersectObjects(bubbleSortButtonList);


				if (intersects.length > 0) {
					for (let i = 0; i < 3; i++) {
						if (game.scene1.bubbleSort.boxButtonList[i] == intersects[0].object) {
							let ins = game.scene1.bubbleSort.insList[i];
							console.log(`[scene1] mouseup bubbleSort ${ins}`);
							intersects[0].object.material.map = new THREE.CanvasTexture(game.scene1.utils.getInsCanvas(ins, '#D2D518', '#21FFB8'));

							if (i == 0) {
								if (game.scene1 !== undefined) {
									if (game.scene1.bubbleSort.state != undefined && game.scene1.bubbleSort.state == 'free') {
										// game.scene1.bubbleSort.instruction = 'next';
										// game.scene1.bubbleSort.state = 'busy';
										const socket = game.player.socket;
										let roomId = sessionStorage.getItem("roomId");
										socket.emit('scene1 request', { instruction: "next", roomId: roomId });
									}
								}
							} else if (i == 1) {
								if (game.scene1 !== undefined) {
									if (game.scene1.bubbleSort.state != undefined && game.scene1.bubbleSort.state == 'free') {
										// game.scene1.bubbleSort.instruction = 'restart';
										// game.scene1.bubbleSort.state = 'busy';
										const socket = game.player.socket;
										let roomId = sessionStorage.getItem("roomId");
										socket.emit('scene1 request', { instruction: "restart", roomId: roomId });
									}
								}
							} else if (i == 2) {
								if (game.scene1 !== undefined) {
									if (game.scene1.bubbleSort.state != undefined && game.scene1.bubbleSort.state == 'free') {
										// game.scene1.bubbleSort.instruction = 'shuffle';
										// game.scene1.bubbleSort.state = 'busy';
										const socket = game.player.socket;
										let roomId = sessionStorage.getItem("roomId");
										socket.emit('scene1 request', { instruction: "shuffle", roomId: roomId });
									}
								}
							}
						}
					}
				}
			};

			const mouseDownBoxButton = (e) => {
				// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
				const mouse = new THREE.Vector2();
				mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				// 计算物体和射线的焦点
				let bubbleSortButtonList = game.scene1.bubbleSort.boxButtonList;
				const intersects = raycaster.intersectObjects(bubbleSortButtonList);

				if (intersects.length > 0) {
					for (let i = 0; i < 3; i++) {
						if (game.scene1.bubbleSort.boxButtonList[i] == intersects[0].object) {
							let ins = game.scene1.bubbleSort.insList[i];
							console.log(`[scene1] mousedown bubbleSort ${ins}`);
							intersects[0].object.material.map = new THREE.CanvasTexture(game.scene1.utils.getInsCanvas(ins, '#989A15', '#17C18B'))
						}
					}
				}
			};

			document.addEventListener("mousedown", mouseDownBoxButton, false);
			document.addEventListener("mouseup", mouseUpBoxButton, false);

			game.scene1.bubbleSort.state = "free";	// free表示可以执行指令，busy表示正在执行指令

			const socket = game.player.socket;
			// 获取服务器当前的实际数据
			socket.on('scene1 sendCurrent', function (data) {
				console.log('data', data);
				game.scene1.bubbleSort.cur_ins = data.cur_ins;
				game.scene1.bubbleSort.valList = data.valList;
				game.scene1.bubbleSort.record = game.scene1.utils.getBubbleSortRecord();
				let valList = game.scene1.utils.getCurrentState();
				for (let i = 0; i < 8; i++) {
					game.scene1.bubbleSort.boxList[i].material.map = new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(valList[i], '#700BE1', '#FFD795'));
				}

				game.scene1.bubbleSort.state = data.state;
				game.scene1.bubbleSort.instruction = data.instruction;
			});

			// 排序动画演示
			game.scene1.animate = function (dt) {
				// console.log('[scene1]');
				// console.log('[scene1] state:', game.scene1.bubbleSort.state);
				// console.log('[scene1] instruction:', game.scene1.bubbleSort.instruction);
				// console.log('[scene1] cur_ins:', game.scene1.bubbleSort.cur_ins);

				// 冒泡排序动画逻辑
				if (game.scene1.bubbleSort.state == 'busy') {
					if (game.scene1.bubbleSort.instruction == 'next') {
						// do next
						if (game.scene1.bubbleSort.cur_ins < game.scene1.bubbleSort.record.length) {
							console.log('doing next...');

							// ap的在bp的左侧。左侧是x轴正方向，上侧是y轴正方向。
							let swap_pair = game.scene1.bubbleSort.record[game.scene1.bubbleSort.cur_ins];
							let ap, bp;
							let a, b;
							let av, bv;
							if (swap_pair[0] < swap_pair[1]) {
								ap = game.scene1.bubbleSort.boxList[swap_pair[0]].position;
								bp = game.scene1.bubbleSort.boxList[swap_pair[1]].position;
								a = game.scene1.bubbleSort.boxList[swap_pair[0]];
								b = game.scene1.bubbleSort.boxList[swap_pair[1]];
								av = swap_pair[2];
								bv = swap_pair[3];
							} else {
								bp = game.scene1.bubbleSort.boxList[swap_pair[0]].position;
								ap = game.scene1.bubbleSort.boxList[swap_pair[1]].position;
								b = game.scene1.bubbleSort.boxList[swap_pair[0]];
								a = game.scene1.bubbleSort.boxList[swap_pair[1]];
								bv = swap_pair[2];
								av = swap_pair[3];
							}

							// stage的定义与切换
							if (game.scene1.bubbleSort.swap_state === undefined) {
								game.scene1.bubbleSort.swap_state = 'stage0';
								// // 高亮即将交换的方块
								a.material.map = new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(av, '#21FFB2', '#FF21E7'));
								b.material.map = new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(bv, '#21FFB2', '#FF21E7'));

								// stage0 目标
								game.scene1.bubbleSort.swap_ap = ap.y - 300;
								game.scene1.bubbleSort.swap_bp = bp.y + 300;
							} else if (game.scene1.bubbleSort.swap_state == 'stage0') {
								if (ap.y <= game.scene1.bubbleSort.swap_ap && bp.y >= game.scene1.bubbleSort.swap_bp) {
									game.scene1.bubbleSort.swap_state = 'stage1';
									// stage1 目标
									game.scene1.bubbleSort.swap_ap = bp.x;
									game.scene1.bubbleSort.swap_bp = ap.x;
								}
							} else if (game.scene1.bubbleSort.swap_state == 'stage1') {
								if (ap.x <= game.scene1.bubbleSort.swap_ap && bp.x >= game.scene1.bubbleSort.swap_bp) {
									game.scene1.bubbleSort.swap_state = 'stage2';
									// stage2 目标
									game.scene1.bubbleSort.swap_ap = ap.y + 300;
									game.scene1.bubbleSort.swap_bp = bp.y - 300;
								}
							} else if (game.scene1.bubbleSort.swap_state == 'stage2') {
								if (ap.y >= game.scene1.bubbleSort.swap_ap && bp.y <= game.scene1.bubbleSort.swap_bp) {
									game.scene1.bubbleSort.swap_state = 'finish';
								}
							}

							// 根据stage进行动画
							if (game.scene1.bubbleSort.swap_state == 'stage0') {
								// ap.y = ap.y - 300/30;
								// bp.y = bp.y + 300/30;
								ap.y = ap.y - 10;
								bp.y = bp.y + 10;
							} else if (game.scene1.bubbleSort.swap_state == 'stage1') {
								let ap_obj = game.scene1.bubbleSort.swap_ap;
								let bp_obj = game.scene1.bubbleSort.swap_bp;
								// ap.x = ap.x - (bp_obj - ap_obj)/30;
								// bp.x = bp.x + (bp_obj - ap_obj)/30;
								ap.x = ap.x - 10;
								bp.x = bp.x + 10;
							} else if (game.scene1.bubbleSort.swap_state == 'stage2') {
								// ap.y = ap.y + 300/30;
								// bp.y = bp.y - 300/30;
								ap.y = ap.y + 10;
								bp.y = bp.y - 10;
							} else if (game.scene1.bubbleSort.swap_state == 'finish') {
								// 交换完成，取消高亮
								a.material.map = new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(av, '#700BE1', '#FFD795'));
								b.material.map = new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(bv, '#700BE1', '#FFD795'));

								let temp_box = game.scene1.bubbleSort.boxList[swap_pair[0]];
								game.scene1.bubbleSort.boxList[swap_pair[0]] = game.scene1.bubbleSort.boxList[swap_pair[1]];
								game.scene1.bubbleSort.boxList[swap_pair[1]] = temp_box;
							}
						} else {
							game.scene1.bubbleSort.swap_state = 'finish';
						}

						// once done, become free
						if (game.scene1.bubbleSort.swap_state == 'finish') {
							// game.scene1.bubbleSort.cur_ins += 1;
							// game.scene1.bubbleSort.state = 'free'
							const socket = game.player.socket;
							let roomId = sessionStorage.getItem("roomId");
							socket.emit('scene1 i finish', { "roomId": roomId, "record_length": game.scene1.bubbleSort.record.length });
							game.scene1.bubbleSort.instruction = undefined;
							console.log('next is done');
							delete game.scene1.bubbleSort.swap_state;
						}

					} else if (game.scene1.bubbleSort.instruction == 'restart') {
						// do restart
						console.log('doing restart...');

						let list = game.scene1.bubbleSort.valList;
						for (let i = 0; i < list.length; i++) {
							game.scene1.bubbleSort.boxList[i].material.map = new THREE.CanvasTexture(game.scene1.utils.getNumCanvas(list[i], '#700BE1', '#FFD795'));
						}

						// once done, become free
						const socket = game.player.socket;
						let roomId = sessionStorage.getItem("roomId");
						socket.emit('scene1 i finish', { "roomId": roomId });
						game.scene1.bubbleSort.instruction = undefined;
						console.log('restart is done');

						// game.scene1.bubbleSort.cur_ins = 0;
						// game.scene1.bubbleSort.state = 'free'
					} else if (game.scene1.bubbleSort.instruction == 'shuffle') {
						// do shuffle
						console.log('doing shuffle...');

						// once done, become free
						// game.scene1.bubbleSort.cur_ins = 0;
						// game.scene1.bubbleSort.state = 'free';

						const socket = game.player.socket;
						let roomId = sessionStorage.getItem("roomId");
						game.scene1.bubbleSort.instruction = undefined;
						socket.emit('scene1 i finish', { "roomId": roomId });
						console.log('shuffle is done');
					} else {
						// do nothing
					}
				}
			}
		}
	}

	loadScene2() {

	}

	loadScene3() {

	}

	goToScene1() {
		const theData = {
			"algorithm": "BubbleSort",
			"type": "LEARN"
		}
		const jsonData = JSON.stringify(theData);

		$.ajax({
			type: "POST",
			url: "http://3.208.228.114:8080/user/addAlgorithm",
			data: jsonData,
			headers: {
				"token": sessionStorage.getItem("token"),
				"Content-Type": "Application/json"
			},
			success: function (data) {

				console.log("ajax sucess", data)
			},
			error: function (xhr, status, error) {
				// 请求失败的处理
				console.log(error)
			}
		});

		const game = this;
		const socket = game.player.socket;
		let roomId = sessionStorage.getItem("roomId");
		if (roomId == null) {
			alert("roomId is null!");
			return;
		}

		socket.emit('scene1 getCurrent', { "roomId": roomId });

		game.player.object.position.y = 10000 + 500;
		game.player.object.position.x = -900 - 1210;
		game.player.object.position.z = 2400 - 2450;
		// -2110, 10500, -50
		game.player.object.rotation.x = 0;
		game.player.object.rotation.y = 0;
		game.player.object.rotation.z = 0;

		$("#location_content").text("冒 泡 排 序");
		$("#location").attr("class", "location");
		$("#location").fadeIn(2000);
		$("#location").fadeOut(3000);
	}

	goToScene2() {
		const theData = {
			"algorithm": "BST",
			"type": "LEARN"
		}
		const jsonData = JSON.stringify(theData);

		$.ajax({
			type: "POST",
			url: "http://3.208.228.114:8080/user/addAlgorithm",
			data: jsonData,
			headers: {
				"token": sessionStorage.getItem("token"),
				"Content-Type": "Application/json"
			},
			success: function (data) {

				console.log("ajax sucess", data)
			},
			error: function (xhr, status, error) {
				// 请求失败的处理
				console.log(error)
			}
		});

		const game = this;

		if (game.scene2 === undefined) {
			console.log('loading scene2');

			// 存储到game.scene1之中
			game.scene2 = {};

			// 一些工具函数
			game.scene2.utils = {};
			let F = game.scene2.utils;
			F.getNumCanvas = function (i, bgc, fc) {
				var width = 512, height = 512;
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');
				ctx.fillStyle = bgc;	// 背景颜色
				ctx.fillRect(0, 0, width, height);

				let str = `${i}`;
				ctx.fillStyle = fc;		// 字体颜色
				if (str.length == 1) {
					ctx.font = 512 + 'px " bold';
					ctx.fillText(`${i}`, 110, 450);
				} else if (str.length == 2) {
					ctx.font = 448 + 'px " bold';
					ctx.fillText(`${i}`, 0, 450);
				}

				return canvas;
			}
			F.getInsCanvas = function (i, bgc, fc) {
				var width = 512, height = 512;
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');
				ctx.fillStyle = bgc;	// 背景颜色
				ctx.fillRect(0, 0, width, height);
				ctx.font = 96 + 'px " bold';
				ctx.fillStyle = fc;		// 字体颜色

				ctx.fillText(`${i}`, 35, 300);
				return canvas;
			}
			F.renderTree = function (root) {
				let L = F.calTreeLevel(root);
				let x0 = 0;
				let y0 = (2 * L - 0.5) * 200;
				F.renderNode(root, x0, y0, L);	// 递归绘制节点对应的立方体
			}
			F.renderNode = function (node, x0, y0, L) {
				if (node === undefined) {
					return;
				}
				node.x = x0;
				node.y = y0;
				F.generateNode(node);
				let dx0 = Math.pow(2, L - 2);
				let dy0 = 2;
				// 注意左边是x轴正方向
				let left_x0 = x0 + dx0 * 200;
				let right_x0 = x0 - dx0 * 200;
				let left_y0 = y0 - dy0 * 200;
				let right_y0 = y0 - dy0 * 200;
				F.renderNode(node.left, left_x0, left_y0, L - 1);
				F.renderNode(node.right, right_x0, right_y0, L - 1);
				let cylinderLeft = F.generateEdge(node, node.left, 1);
				let cylinderRight = F.generateEdge(node, node.right, -1);
				if (node.left !== undefined) {
					node.left.cylinder = cylinderLeft;
				}
				if (node.right !== undefined) {
					node.right.cylinder = cylinderRight;
				}
			}
			F.generateNode = function (node) {
				let boxGeometry = new THREE.BoxGeometry(200, 200, 200);
				let boxMaterial = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(F.getNumCanvas(node.val, '#700BE1', '#FFD795')) });
				let box = new THREE.Mesh(boxGeometry, boxMaterial);
				box.position.x = node.x;
				box.position.y = 20000 + node.y;
				box.position.z = 0;
				game.scene.add(box);
				game.colliders.push(box);
				node.box = box;
			}
			F.generateEdge = function (node_p, node_c, sign) {
				if (node_c === undefined) {
					return;
				}
				let x1 = node_p.x + sign * 0.5 * 200;
				let y1 = node_p.y - 0.5 * 200;
				let x2 = node_c.x;
				let y2 = node_c.y + 0.5 * 200;

				let length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
				let angle = Math.atan((x1 - x2) / (y1 - y2));	// 顺时针角度
				let cylinderGeometry = new THREE.CylinderGeometry(10, 10, length, 16);
				let cylinderMaterial = F.cylinderMaterial;
				let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
				cylinder.rotation.z = -angle;	// 逆时针旋转
				cylinder.position.x = (x1 + x2) / 2;
				cylinder.position.y = 20000 + (y1 + y2) / 2;
				cylinder.position.z = 0;
				game.scene.add(cylinder);
				game.colliders.push(cylinder);
				return cylinder;
			}
			F.calTreeLevel = function (root) {
				if (root === undefined) {
					return 0;
				}
				let leftLevel = F.calTreeLevel(root.left);
				let rightLevel = F.calTreeLevel(root.right);
				if (leftLevel > rightLevel) {
					return 1 + leftLevel;
				} else {
					return 1 + rightLevel;
				}
			}
			F.setLeftChild = function (node, val) {
				node.left = {};
				node.left.val = val;
			}
			F.setRightChild = function (node, val) {
				node.right = {};
				node.right.val = val;
			}
			F.cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
			F.generateBST = function (valList) {
				let root = {};
				root.val = valList[0];
				for (let i = 1; i < valList.length; i++) {
					F.insertBST(root, valList[i]);
				}
				return root;
			}
			F.generateAVL = function (valList) {
				let root = {};
				root.val = valList[0];
				root.bf = 0;	// AVL树的平衡因子
				for (let i = 1; i < valList.length; i++) {
					root = F.insertAVL(root, valList[i]);
				}
				return root;
			}
			F.insertBST = function (root, val) {
				let parent = root;
				let node = root;
				while (node !== undefined) {
					if (val <= node.val) {
						parent = node;
						node = node.left;
					} else {
						parent = node;
						node = node.right;
					}
				}

				if (val <= parent.val) {
					parent.left = {};
					parent.left.val = val;
				} else {
					parent.right = {};
					parent.right.val = val;
				}
			}
			F.insertAVL = function (root, val) {
				let parent = root;
				let node = root;
				while (node !== undefined) {
					if (val <= node.val) {
						parent = node;
						node = node.left;
					} else {
						parent = node;
						node = node.right;
					}
				}

				if (val <= parent.val) {
					parent.left = {};
					node = parent.left;
					node.val = val;
					node.bf = 0;
					node.parent = parent;
				} else {
					parent.right = {};
					node = parent.right;
					node.val = val;
					node.bf = 0;
					node.parent = parent;
				}

				// 向上回溯，修改bf
				while (parent != undefined) {
					if (node == parent.left) {
						parent.bf--;
					} else if (node == parent.right) {
						parent.bf++;
					}

					if (parent.bf == 0) {
						// console.log('new root', root);
						return root;
					} else if (parent.bf == 1 || parent.bf == -1) {
						node = parent;
						parent = node.parent;
					} else if (parent.bf == 2) {
						let newRoot;
						if (node.bf == 1) {
							newRoot = F.rotateL_AVL(parent);	// 左单旋
						} else if (node.bf == -1) {
							newRoot = F.rotateRL_AVL(parent);	// 右左双旋
						}
						if (newRoot !== undefined) {
							// console.log('new root', newRoot);
							return newRoot;
						} else {
							// console.log('new root', root);
							return root;
						}
					} else if (parent.bf == -2) {
						let newRoot;
						if (node.bf == -1) {
							newRoot = F.rotateR_AVL(parent);	// 右单旋
						} else if (node.bf == 1) {
							newRoot = F.rotateLR_AVL(parent);	// 左右双旋
						}
						if (newRoot !== undefined) {
							// console.log('new root', newRoot);
							return newRoot;
						} else {
							// console.log('new root', root);
							return root;
						}
					}
				}
				// console.log('new root', root);
				return root;
			}
			F.rotateL_AVL = function (node) {
				let a = node;
				let b = a.right;
				let t = a.parent;

				if (t != undefined) {
					if (a == t.left) {
						t.left = b;
					} else if (a == t.right) {
						t.right = b;
					}
					b.parent = t;
				}

				a.right = b.left;
				if (b.left != undefined) {
					b.left.parent = a;
				}

				b.left = a;
				a.parent = b;

				a.bf = 0;
				b.bf = 0;

				if (t != undefined) {	// 根不变
					return undefined;
				} else {	// 根改变
					b.parent = undefined;
					return b;
				}
			}
			F.rotateR_AVL = function (node) {
				let a = node;
				let b = a.left;
				let t = a.parent;

				if (t != undefined) {
					if (a == t.right) {
						t.right = b;
					} else if (a == t.left) {
						t.left = b;
					}
					b.parent = t;
				}

				a.left = b.right;
				if (b.right != undefined) {
					b.right.parent = a;
				}

				b.right = a;
				a.parent = b;

				a.bf = 0;
				b.bf = 0;

				if (t != undefined) {	// 根不变
					return undefined;
				} else {	// 根改变
					b.parent = undefined;
					return b;
				}
			}
			F.rotateRL_AVL = function (node) {
				let a = node;
				let b = a.right;
				let c = b.left;
				let t = a.parent;

				if (t != undefined) {
					if (a == t.left) {
						t.left = c;
					} else if (a == t.right) {
						t.right = c;
					}
					c.parent = t;
				}

				a.right = c.left;
				if (c.left != undefined) {
					c.left.parent = a;
				}

				b.left = c.right;
				if (c.right != undefined) {
					c.right.parent = b;
				}

				c.left = a;
				a.parent = c;

				c.right = b;
				b.parent = c;

				if (c.bf == 1) {
					a.bf = -1;
					b.bf = 0;
				} else if (c.bf == -1) {
					a.bf = 0;
					b.bf = 1;
				} else if (c.bf == 0) {
					a.bf = 0;
					b.bf = 0;
				}
				c.bf = 0;

				if (t != undefined) {	// 根不变
					return undefined;
				} else {	// 根改变
					c.parent = undefined;
					return c;
				}
			}
			F.rotateLR_AVL = function (node) {
				let a = node;
				let b = a.left;
				let c = b.right;
				let t = a.parent;

				if (t != undefined) {
					if (a == t.right) {
						t.right = c;
					} else if (a == t.left) {
						t.left = c;
					}
					c.parent = t;
				}

				a.left = c.right;
				if (c.right != undefined) {
					c.right.parent = a;
				}

				b.right = c.left;
				if (c.left != undefined) {
					c.left.parent = b;
				}

				c.right = a;
				a.parent = c;

				c.left = b;
				b.parent = c;

				if (c.bf == -1) {
					a.bf = 1;
					b.bf = 0;
				} else if (c.bf == 1) {
					a.bf = 0;
					b.bf = -1;
				} else if (c.bf == 0) {
					a.bf = 0;
					b.bf = 0;
				}
				c.bf = 0;

				if (t != undefined) {	// 根不变
					return undefined;
				} else {	// 根改变
					c.parent = undefined;
					return c;
				}
			}
			F.next = function () {
				let orderList = game.scene2.BSTtraverse.orderList;
				let cur_ins = game.scene2.BSTtraverse.cur_ins;
				if (cur_ins == orderList.length - 1) {
					return;
				}
				// 当前高亮结点 取消高亮
				orderList[cur_ins].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[cur_ins].val, '#700BE1', '#FFD795'));
				// 下一个结点高亮
				orderList[cur_ins + 1].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[cur_ins + 1].val, '#21FFB2', '#FF21E7'));
				game.scene2.BSTtraverse.cur_ins++;
			}
			F.shuffle = function () {
				let valList = [];
				for (let i = 1; i <= 20; i++) {
					valList.push(i);
				}
				valList.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
				console.log('valList', valList);
				game.scene2.BSTtraverse.valList = valList;
				game.scene2.BSTtraverse.BST = F.generateAVL(valList);
				console.log(game.scene2.BSTtraverse.BST);
				F.freeTree(game.scene2.BSTtraverse.orderList);
				F.renderTree(game.scene2.BSTtraverse.BST);

				if (game.scene2.BSTtraverse.type == 'midOrder') {
					F.midOrder();
				} else if (game.scene2.BSTtraverse.type == 'preOrder') {
					F.preOrder();
				} else if (game.scene2.BSTtraverse.type == 'postOrder') {
					F.postOrder();
				}
			}
			F.midOrder = function () {
				// 当前高亮结点 取消高亮
				let cur_ins = game.scene2.BSTtraverse.cur_ins;
				let orderList = game.scene2.BSTtraverse.orderList;
				if (orderList !== undefined && cur_ins !== undefined) {
					orderList[cur_ins].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[cur_ins].val, '#700BE1', '#FFD795'));
				}
				game.scene2.BSTtraverse.type = 'midOrder';
				orderList = [];
				let root = game.scene2.BSTtraverse.BST;
				F.getMidOrderList(root, orderList);
				console.log(orderList);
				game.scene2.BSTtraverse.orderList = orderList;
				// 首个结点高亮
				game.scene2.BSTtraverse.cur_ins = 0;
				orderList[0].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[0].val, '#21FFB2', '#FF21E7'));
			}
			F.preOrder = function () {
				// 当前高亮结点 取消高亮
				let orderList = game.scene2.BSTtraverse.orderList;
				let cur_ins = game.scene2.BSTtraverse.cur_ins;
				orderList[cur_ins].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[cur_ins].val, '#700BE1', '#FFD795'));

				game.scene2.BSTtraverse.type = 'preOrder';
				orderList = [];
				let root = game.scene2.BSTtraverse.BST;
				F.getPreOrderList(root, orderList);
				game.scene2.BSTtraverse.orderList = orderList;
				// 首个结点高亮
				game.scene2.BSTtraverse.cur_ins = 0;
				orderList[0].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[0].val, '#21FFB2', '#FF21E7'));
			}
			F.postOrder = function () {
				// 当前高亮结点 取消高亮
				let orderList = game.scene2.BSTtraverse.orderList;
				let cur_ins = game.scene2.BSTtraverse.cur_ins;
				orderList[cur_ins].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[cur_ins].val, '#700BE1', '#FFD795'));

				game.scene2.BSTtraverse.type = 'postOrder';
				orderList = [];
				let root = game.scene2.BSTtraverse.BST;
				F.getPostOrderList(root, orderList);
				game.scene2.BSTtraverse.orderList = orderList;
				// 首个结点高亮
				game.scene2.BSTtraverse.cur_ins = 0;
				orderList[0].box.material.map = new THREE.CanvasTexture(game.scene2.utils.getNumCanvas(orderList[0].val, '#21FFB2', '#FF21E7'));
			}
			F.getMidOrderList = function (root, orderList) {
				if (root == undefined) {
					return;
				}
				F.getMidOrderList(root.left, orderList);
				orderList.push(root);
				F.getMidOrderList(root.right, orderList);
			}
			F.getPreOrderList = function (root, orderList) {
				if (root == undefined) {
					return;
				}
				orderList.push(root);
				F.getPreOrderList(root.left, orderList);
				F.getPreOrderList(root.right, orderList);
			}
			F.getPostOrderList = function (root, orderList) {
				if (root == undefined) {
					return;
				}
				F.getPostOrderList(root.left, orderList);
				F.getPostOrderList(root.right, orderList);
				orderList.push(root);
			}
			F.freeTree = function (orderList) {
				for (let i = 0; i < orderList.length; i++) {
					game.scene.remove(orderList[i].box);
					if (orderList[i].parent !== undefined) {
						game.scene.remove(orderList[i].cylinder);
					}
				}
			}

			const vertex = new THREE.Vector3();
			const color = new THREE.Color();
			let ggg = new THREE.PlaneGeometry(10000, 10000, 100, 100);
			let floorGeometry = new THREE.BufferGeometry().fromGeometry(ggg);
			floorGeometry.rotateX(- Math.PI / 2);
			// vertex displacement
			// console.log(floorGeometry);
			let position = floorGeometry.attributes.position;
			for (let i = 0, l = position.count; i < l; i++) {
				vertex.fromBufferAttribute(position, i);
				// vertex.x += Math.random() * 20 - 10;
				vertex.y += 20000;
				// vertex.z += Math.random() * 20 - 10;
				position.setXYZ(i, vertex.x, vertex.y, vertex.z);
			}
			floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
			position = floorGeometry.attributes.position;
			const colorsFloor = [];

			for (let i = 0, l = position.count; i < l; i++) {
				color.setHSL(Math.random() * 0.3 + 0.6, 0.25, Math.random() * 0.25 + 0.25, THREE.SRGBColorSpace);
				colorsFloor.push(color.r, color.g, color.b);
			}

			floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
			const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			game.scene.add(floor);
			game.colliders.push(floor);
			game.scene2.floor = floor;

			// board
			// 木板的相关代码
			game.scene2.info = false; // 当前是否在阅读信息
			game.scene2.boardGeometry = new THREE.BoxGeometry(200, 200, 200);
			// game.scene2.loader = new THREE.TextureLoader();
			game.scene2.boardMaterial = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene2.utils.getInsCanvas("  help", '#884A39', '#21FFB8')) })
			game.scene2.boardMesh = new THREE.Mesh(game.scene2.boardGeometry, game.scene2.boardMaterial);

			console.log(game.scene2.boardMesh);
			game.scene.add(game.scene2.boardMesh);
			game.scene2.boardMesh.position.set(0, 20100, -4000);
			game.scene2.boardMesh.isBoard2 = true;
			game.colliders.push(game.scene2.boardMesh);

			const EVENT_MOUSEDOWN_onBoard2 = (ev) => {
				if (game.scene2.info === true)
					return;
				const mouse = new THREE.Vector2();
				mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				const intersects = raycaster.intersectObjects(game.colliders);
				console.log(intersects[0]);
				if (intersects.length === 0)
					return;
				if (intersects[0].object.isBoard2) {
					let info = document.getElementById("info");
					let content = document.getElementById("info_content");
					content.textContent = config.readMe[1];
					info.className = "show";
					game.scene2.info = true;
				}

				document.addEventListener('mousedown', EVENT_CLICK_onInfo);
			}

			const EVENT_CLICK_onInfo = (ev) => {
				if (game.scene2.info === false)
					return;
				let info = document.getElementById("info");
				game.scene2.info = false;
				info.className = "hide";

				document.removeEventListener('mousedown', EVENT_CLICK_onInfo);
			}


			document.addEventListener('mousedown', EVENT_MOUSEDOWN_onBoard2, false);





			// [二叉树遍历场景]
			let valList = [];
			for (let i = 1; i <= 20; i++) {
				valList.push(i);
			}
			valList.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
			console.log('valList', valList);
			game.scene2.BSTtraverse = {};
			game.scene2.BSTtraverse.valList = valList;
			game.scene2.BSTtraverse.BST = F.generateAVL(valList);
			console.log(game.scene2.BSTtraverse.BST);
			F.renderTree(game.scene2.BSTtraverse.BST);

			// 默认按照中序遍历生成结点序列
			game.scene2.BSTtraverse.type = 'midOrder';
			game.scene2.BSTtraverse.cur_ins = 0;
			F.midOrder();

			// 5个立方体，表示5个功能按钮，可以点击
			let boxButtonList = [];

			let boxButtonMaterialList = [];
			let boxButtonXList = [];
			let insList = ['  next   ', ' shuffle ', 'midOrder ', 'preOrder ', 'postOrder'];

			let boxGeometry = new THREE.BoxGeometry(200, 200, 200);
			for (let i = 0; i < 5; i++) {
				const box = new THREE.Mesh(
					boxGeometry,
					new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene2.utils.getInsCanvas(insList[i], '#D2D518', '#21FFB8')) })
				);
				if (i <= 1) {
					box.position.x = 800 - 400 * i;
				} else {
					box.position.x = 400 - 400 * i;
				}
				box.position.y = 20000 + 100;  // 0, 20100, -4000
				box.position.z = -4000;
				game.scene.add(box);
				game.colliders.push(box);

				boxButtonList.push(box);
				boxButtonXList.push(box.position.x);
			}

			game.scene2.BSTtraverse.boxButtonList = boxButtonList;
			game.scene2.BSTtraverse.boxButtonXList = boxButtonXList;
			game.scene2.BSTtraverse.insList = insList;

			// 与按钮方块进行交互
			const mouseUpBoxButton = (e) => {
				// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
				const mouse = new THREE.Vector2();
				mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				// 计算物体和射线的焦点
				const intersects = raycaster.intersectObjects(game.scene2.BSTtraverse.boxButtonList);

				if (intersects.length > 0) {
					for (let i = 0; i < 5; i++) {
						if (game.scene2.BSTtraverse.boxButtonXList[i] == intersects[0].object.position.x) {
							let ins = game.scene2.BSTtraverse.insList[i];
							console.log(`[scene2] mouseup ${ins}`);
							intersects[0].object.material.map = new THREE.CanvasTexture(game.scene2.utils.getInsCanvas(ins, '#D2D518', '#21FFB8'));

							if (i == 0) {
								if (game.scene2 !== undefined) {
									F.next();
								}
							} else if (i == 1) {
								if (game.scene2 !== undefined) {
									F.shuffle();
								}
							} else if (i == 2) {
								if (game.scene2 !== undefined) {
									F.midOrder();
								}
							} else if (i == 3) {	// preOrder
								if (game.scene2 !== undefined) {
									F.preOrder();
								}
							} else if (i == 4) {	// postOrder
								if (game.scene2 !== undefined) {
									F.postOrder();
								}
							}
						}
					}
				}
			};

			const mouseDownBoxButton = (e) => {
				// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
				const mouse = new THREE.Vector2();
				mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				// 计算物体和射线的焦点
				const intersects = raycaster.intersectObjects(game.scene2.BSTtraverse.boxButtonList);

				if (intersects.length > 0) {
					for (let i = 0; i < 5; i++) {
						if (game.scene2.BSTtraverse.boxButtonXList[i] == intersects[0].object.position.x) {
							let ins = game.scene2.BSTtraverse.insList[i];
							console.log(`[scene2] mousedown ${ins}`);
							intersects[0].object.material.map = new THREE.CanvasTexture(game.scene2.utils.getInsCanvas(ins, '#989A15', '#17C18B'))
						}
					}
				}
			};

			document.addEventListener("mousedown", mouseDownBoxButton, false);
			document.addEventListener("mouseup", mouseUpBoxButton, false);
		}

		game.player.object.position.y = 20000 + 500;
		game.player.object.position.x = 0;
		game.player.object.position.z = -5000 + 50;
		game.player.object.rotation.x = 0;
		game.player.object.rotation.y = 0;
		game.player.object.rotation.z = 0;

		$("#location_content").text("二  叉  树");
		$("#location").attr("class", "location");
		$("#location").fadeIn(2000);
		$("#location").fadeOut(3000);
	}



	goToScene3() {
		const theData = {
			"algorithm": "SelectSort",
			"type": "LEARN"
		}
		const jsonData = JSON.stringify(theData);

		$.ajax({
			type: "POST",
			url: "http://3.208.228.114:8080/user/addAlgorithm",
			data: jsonData,
			headers: {
				"token": sessionStorage.getItem("token"),
				"Content-Type": "Application/json"
			},
			success: function (data) {

				console.log("ajax sucess", data)
			},
			error: function (xhr, status, error) {
				// 请求失败的处理
				console.log(error)
			}
		});

		const game = this;

		if (game.scene3 === undefined) {
			console.log('loading scene3');

			// 存储到game.scene3之中
			game.scene3 = {};

			// 一些工具函数
			game.scene3.utils = {};
			game.scene3.utils.getNumCanvas = function (i, bgc, fc) {
				var width = 512, height = 512;
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');
				ctx.fillStyle = bgc;	// 背景颜色
				ctx.fillRect(0, 0, width, height);

				let str = `${i}`;
				ctx.fillStyle = fc;		// 字体颜色
				if (str.length == 1) {
					ctx.font = 512 + 'px " bold';
					ctx.fillText(`${i}`, 110, 450);
				} else if (str.length == 2) {
					ctx.font = 448 + 'px " bold';
					ctx.fillText(`${i}`, 0, 450);
				}

				return canvas;
			}
			game.scene3.utils.getInsCanvas = function (i, bgc, fc) {
				var width = 512, height = 512;
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext('2d');
				ctx.fillStyle = bgc;	// 背景颜色
				ctx.fillRect(0, 0, width, height);
				ctx.fillStyle = fc;		// 字体颜色
				ctx.font = 128 + 'px " bold';
				ctx.fillText(`${i}`, 50, 300);
				return canvas;
			}
			game.scene3.utils.getSelectSortRecord = function () {
				let record = [];
				let list = game.scene3.selectSort.valList.concat();

				for (let i = 0; i <= list.length - 1; i++) {
					let min_val = undefined;
					let min_i = undefined;
					for (let j = i; j <= list.length - 1; j++) {
						if (min_val === undefined || min_i === undefined) {
							min_val = list[j];
							min_i = j;
						} else {
							if (list[j] < min_val) {
								min_val = list[j];
								min_i = j;
							}
						}
					}
					let action = { "light_min": [min_i, list[min_i]] };

					if (min_i != i) {
						action["swap"] = [i, min_i, list[i], list[min_i]];
					}

					record.push(action);

					let temp = list[i];
					list[i] = list[min_i];
					list[min_i] = temp;
				}
				console.log('selectSort record', record);
				return record;
			}

			const vertex = new THREE.Vector3();
			const color = new THREE.Color();
			let ggg = new THREE.PlaneGeometry(10000, 10000, 100, 100);
			let floorGeometry = new THREE.BufferGeometry().fromGeometry(ggg);
			floorGeometry.rotateX(- Math.PI / 2);
			// vertex displacement
			// console.log(floorGeometry);
			let position = floorGeometry.attributes.position;
			for (let i = 0, l = position.count; i < l; i++) {
				vertex.fromBufferAttribute(position, i);
				// vertex.x += Math.random() * 20 - 10;
				vertex.y += 30000;
				// vertex.z += Math.random() * 20 - 10;
				position.setXYZ(i, vertex.x, vertex.y, vertex.z);
			}
			floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
			position = floorGeometry.attributes.position;
			const colorsFloor = [];

			for (let i = 0, l = position.count; i < l; i++) {
				color.setHSL(Math.random() * 0.3 + 0.1, 0.25, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace);
				colorsFloor.push(color.r, color.g, color.b);
			}

			floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
			const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			game.scene.add(floor);
			game.colliders.push(floor);
			game.scene3.floor = floor;


			let valList = [1, 2, 3, 4, 5, 6, 7, 8];
			valList.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
			game.scene3.selectSort = {};
			game.scene3.selectSort.valList = valList.concat();

			game.scene3.selectSort.record = game.scene3.utils.getSelectSortRecord();
			game.scene3.selectSort.cur_ins = 0;	// 下一条应该执行的指令

			// board
			// 木板的相关代码
			game.scene3.info = false; // 当前是否在阅读信息
			game.scene3.boardGeometry = new THREE.BoxGeometry(200, 200, 200);
			// game.scene3.loader = new THREE.TextureLoader();
			game.scene3.boardMaterial = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene3.utils.getInsCanvas("  help", '#884A39', '#21FFB8')) })
			game.scene3.boardMesh = new THREE.Mesh(game.scene3.boardGeometry, game.scene3.boardMaterial);

			console.log(game.scene3.boardMesh);
			game.scene.add(game.scene3.boardMesh);
			game.scene3.boardMesh.position.set(-2500, 30100, -850);
			game.scene3.boardMesh.isBoard3 = true;
			game.colliders.push(game.scene3.boardMesh);

			const EVENT_MOUSEDOWN_onBoard3 = (ev) => {
				if (game.scene3.info === true)
					return;
				const mouse = new THREE.Vector2();
				mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				const intersects = raycaster.intersectObjects(game.colliders);
				console.log(intersects[0]);
				if (intersects.length === 0)
					return;
				if (intersects[0].object.isBoard3) {
					let info = document.getElementById("info");
					let content = document.getElementById("info_content");
					content.textContent = config.readMe[2];
					info.className = "show";
					game.scene3.info = true;
				}

				document.addEventListener('mousedown', EVENT_CLICK_onInfo, false);
			}

			const EVENT_CLICK_onInfo = (ev) => {
				if (game.scene3.info === false)
					return;
				let info = document.getElementById("info");
				game.scene3.info = false;
				info.className = "hide";

				document.removeEventListener('mousedown', EVENT_CLICK_onInfo, false);
			}


			document.addEventListener('mousedown', EVENT_MOUSEDOWN_onBoard3, false);


			// [选择排序]
			// 8个立方体，对应待排序的8个数字
			let bbb = new THREE.BoxGeometry(200, 200, 200);
			let boxGeometry = new THREE.BufferGeometry().fromGeometry(bbb).toNonIndexed();
			let boxMaterialList2 = [];
			for (let i = 0; i < 10; i++) {
				boxMaterialList2.push(new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene3.utils.getNumCanvas(i, '#700BE1', '#FFD795')) }));
			}
			let boxList2 = [];
			for (let i = 0; i < 8; i++) {
				const box = new THREE.Mesh(boxGeometry, boxMaterialList2[valList[i]]);
				box.position.x = -3700 + 400 * i;
				box.position.y = 30000 + 500;
				box.position.z = 0 - 2400;
				game.scene.add(box);
				game.colliders.push(box);

				boxList2.push(box);
			}
			game.scene3.selectSort.boxList = boxList2.concat();

			// 3个立方体，表示3个功能按钮，可以点击
			let boxButtonList2 = [];
			// let boxButtonXList2 = [];
			let insList = [' next  ', 'restart', 'shuffle'];
			for (let i = 0; i < 3; i++) {
				const box = new THREE.Mesh(
					boxGeometry,
					new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(game.scene3.utils.getInsCanvas(insList[i], '#D2D518', '#21FFB8')) })
				);
				box.position.x = -1710 + 400 * i;
				box.position.y = 30000 + 100;
				box.position.z = 0 - 2400 + 1650;
				game.scene.add(box);
				game.colliders.push(box);
				// -2500, 30100, -850

				boxButtonList2.push(box);
				// boxButtonXList2.push(box.position.x);
			}

			game.scene3.selectSort.boxButtonList = boxButtonList2.concat();
			// game.scene3.selectSort.boxButtonXList = boxButtonXList2;
			game.scene3.selectSort.insList = insList;

			// 与按钮方块进行交互
			const mouseUpBoxButton = (e) => {
				// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
				const mouse = new THREE.Vector2();
				mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				// 计算物体和射线的焦点
				let selectSortButtonList = game.scene3.selectSort.boxButtonList
				const intersects = raycaster.intersectObjects(selectSortButtonList);

				if (intersects.length > 0) {
					for (let i = 0; i < 3; i++) {
						if (game.scene3.selectSort.boxButtonList[i] == intersects[0].object) {
							let ins = game.scene3.selectSort.insList[i];
							console.log(`[scene3] mouseup selectSort ${ins}`);
							intersects[0].object.material.map = new THREE.CanvasTexture(game.scene3.utils.getInsCanvas(ins, '#D2D518', '#21FFB8'));

							if (i == 0) {
								if (game.scene3 !== undefined) {
									if (game.scene3.selectSort.state != undefined && game.scene3.selectSort.state == 'free') {
										game.scene3.selectSort.instruction = 'next';
										game.scene3.selectSort.state = 'busy';
									}
								}
							} else if (i == 1) {
								if (game.scene3 !== undefined) {
									if (game.scene3.selectSort.state != undefined && game.scene3.selectSort.state == 'free') {
										game.scene3.selectSort.instruction = 'restart';
										game.scene3.selectSort.state = 'busy';
									}
								}
							} else if (i == 2) {
								if (game.scene3 !== undefined) {
									if (game.scene3.selectSort.state != undefined && game.scene3.selectSort.state == 'free') {
										game.scene3.selectSort.instruction = 'shuffle';
										game.scene3.selectSort.state = 'busy';
									}
								}
							}
						}
					}
				}
			};

			const mouseDownBoxButton = (e) => {
				// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
				const mouse = new THREE.Vector2();
				mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, game.camera);
				// 计算物体和射线的焦点
				let selectSortButtonList = game.scene3.selectSort.boxButtonList
				const intersects = raycaster.intersectObjects(selectSortButtonList);

				if (intersects.length > 0) {
					for (let i = 0; i < 3; i++) {
						if (game.scene3.selectSort.boxButtonList[i] == intersects[0].object) {
							let ins = game.scene3.selectSort.insList[i];
							console.log(`[scene3] mousedown selectSort ${ins}`);
							intersects[0].object.material.map = new THREE.CanvasTexture(game.scene3.utils.getInsCanvas(ins, '#989A15', '#17C18B'))
						}
					}
				}
			};

			document.addEventListener("mousedown", mouseDownBoxButton, false);
			document.addEventListener("mouseup", mouseUpBoxButton, false);

			game.scene3.selectSort.state = "free";	// free表示可以执行指令，busy表示正在执行指令

			// 排序动画演示
			game.scene3.animate = function (dt) {
				// console.log('[scene3]');
				// console.log('[scene3] state:', game.scene3.bubbleSort.state);
				// console.log('[scene3] instruction:', game.scene3.bubbleSort.instruction);
				// console.log('[scene3] cur_ins:', game.scene3.bubbleSort.cur_ins);

				// 选择排序动画逻辑
				if (game.scene3.selectSort.state == 'busy') {
					if (game.scene3.selectSort.instruction == 'next') {
						// do next
						if (game.scene3.selectSort.cur_ins < game.scene3.selectSort.record.length) {
							console.log('doing next...');

							// ap在bp的右侧。左侧是x轴负方向，上侧是y轴正方向。
							let action = game.scene3.selectSort.record[game.scene3.selectSort.cur_ins];

							let swap_pair;
							let ap, bp;
							let a, b;
							let av, bv;

							if (action["swap"] != undefined) {
								swap_pair = action["swap"];
								if (swap_pair[0] > swap_pair[1]) {
									ap = game.scene3.selectSort.boxList[swap_pair[0]].position;
									bp = game.scene3.selectSort.boxList[swap_pair[1]].position;
									a = game.scene3.selectSort.boxList[swap_pair[0]];
									b = game.scene3.selectSort.boxList[swap_pair[1]];
									av = swap_pair[2];
									bv = swap_pair[3];
								} else {
									bp = game.scene3.selectSort.boxList[swap_pair[0]].position;
									ap = game.scene3.selectSort.boxList[swap_pair[1]].position;
									b = game.scene3.selectSort.boxList[swap_pair[0]];
									a = game.scene3.selectSort.boxList[swap_pair[1]];
									bv = swap_pair[2];
									av = swap_pair[3];
								}
							}

							// stage的定义与切换
							if (game.scene3.selectSort.swap_state === undefined) {
								game.scene3.selectSort.swap_state = 'stage0';
								// 高亮当前轮取值最小的方块，红色
								game.scene3.selectSort.boxList[action["light_min"][0]].material.map = new THREE.CanvasTexture(game.scene3.utils.getNumCanvas(action["light_min"][1], '#FF4B4B', '#4B76FF'));
								game.scene3.selectSort.stage0counter = 0;
								game.scene3.selectSort.stage0counterObj = 50;
							} else if (game.scene3.selectSort.swap_state == 'stage0') {
								if (game.scene3.selectSort.stage0counter == game.scene3.selectSort.stage0counterObj) {
									delete game.scene3.selectSort.stage0counter;
									delete game.scene3.selectSort.stage0counterObj;
									if (action["swap"] === undefined) {
										game.scene3.selectSort.swap_state = 'finish';
										// 高亮被交换至正确位置的红色方块，绿色
										game.scene3.selectSort.boxList[action["light_min"][0]].material.map = new THREE.CanvasTexture(game.scene3.utils.getNumCanvas(action["light_min"][1], '#8FFF4B', '#FFD94B'));
									} else {
										game.scene3.selectSort.swap_state = 'stage1';
										// stage1 目标

										game.scene3.selectSort.swap_ap = ap.y - 300;
										game.scene3.selectSort.swap_bp = bp.y + 300;
									}
								}
							} else if (game.scene3.selectSort.swap_state == 'stage1') {
								if (ap.y <= game.scene3.selectSort.swap_ap && bp.y >= game.scene3.selectSort.swap_bp) {
									game.scene3.selectSort.swap_state = 'stage2';
									// stage2 目标
									game.scene3.selectSort.swap_ap = bp.x;
									game.scene3.selectSort.swap_bp = ap.x;
								}
							} else if (game.scene3.selectSort.swap_state == 'stage2') {
								if (ap.x <= game.scene3.selectSort.swap_ap && bp.x >= game.scene3.selectSort.swap_bp) {
									game.scene3.selectSort.swap_state = 'stage3';
									// stage3 目标
									game.scene3.selectSort.swap_ap = ap.y + 300;
									game.scene3.selectSort.swap_bp = bp.y - 300;
								}
							} else if (game.scene3.selectSort.swap_state == 'stage3') {
								if (ap.y >= game.scene3.selectSort.swap_ap && bp.y <= game.scene3.selectSort.swap_bp) {
									game.scene3.selectSort.swap_state = 'finish';
									// 高亮被交换至正确位置的红色方块，绿色
									game.scene3.selectSort.boxList[action["light_min"][0]].material.map = new THREE.CanvasTexture(game.scene3.utils.getNumCanvas(action["light_min"][1], '#8FFF4B', '#FFD94B'));
								}
							}

							// 根据stage进行动画
							if (game.scene3.selectSort.swap_state == 'stage0') {
								game.scene3.selectSort.stage0counter++;
							} else if (game.scene3.selectSort.swap_state == 'stage1') {
								// ap.y = ap.y - 300/30;
								// bp.y = bp.y + 300/30;
								ap.y = ap.y - 10;
								bp.y = bp.y + 10;
							} else if (game.scene3.selectSort.swap_state == 'stage2') {
								let ap_obj = game.scene3.selectSort.swap_ap;
								let bp_obj = game.scene3.selectSort.swap_bp;
								// ap.x = ap.x - (bp_obj - ap_obj)/30;
								// bp.x = bp.x + (bp_obj - ap_obj)/30;
								ap.x = ap.x - 10;
								bp.x = bp.x + 10;
							} else if (game.scene3.selectSort.swap_state == 'stage3') {
								// ap.y = ap.y + 300/30;
								// bp.y = bp.y - 300/30;
								ap.y = ap.y + 10;
								bp.y = bp.y - 10;
							} else if (game.scene3.selectSort.swap_state == 'finish') {
								// 交换完成，无需取消高亮
								if (action["swap"] != undefined) {
									let temp_box = game.scene3.selectSort.boxList[swap_pair[0]];
									game.scene3.selectSort.boxList[swap_pair[0]] = game.scene3.selectSort.boxList[swap_pair[1]];
									game.scene3.selectSort.boxList[swap_pair[1]] = temp_box;
								}
							}
						} else {
							game.scene3.selectSort.swap_state = 'finish';
						}

						// once done, become free
						if (game.scene3.selectSort.swap_state == 'finish') {
							console.log('next is done');
							game.scene3.selectSort.cur_ins += 1;
							game.scene3.selectSort.state = 'free'
							delete game.scene3.selectSort.swap_state;
						}

					} else if (game.scene3.selectSort.instruction == 'restart') {
						// do restart
						console.log('doing restart...');

						let list = game.scene3.selectSort.valList;
						for (let i = 0; i < list.length; i++) {
							game.scene3.selectSort.boxList[i].material.map = new THREE.CanvasTexture(game.scene3.utils.getNumCanvas(list[i], '#700BE1', '#FFD795'));
						}

						// once done, become free
						console.log('restart is done');
						game.scene3.selectSort.cur_ins = 0;
						game.scene3.selectSort.state = 'free'
					} else if (game.scene3.selectSort.instruction == 'shuffle') {
						// do shuffle
						console.log('doing shuffle...');

						let valList = [1, 2, 3, 4, 5, 6, 7, 8];
						valList.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
						game.scene3.selectSort.valList = valList.concat();
						game.scene3.selectSort.record = game.scene3.utils.getSelectSortRecord();

						let list = game.scene3.selectSort.valList;
						for (let i = 0; i < list.length; i++) {
							game.scene3.selectSort.boxList[i].material.map = new THREE.CanvasTexture(game.scene3.utils.getNumCanvas(list[i], '#700BE1', '#FFD795'));
						}

						// once done, become free
						console.log('shuffle is done');
						game.scene3.selectSort.cur_ins = 0;
						game.scene3.selectSort.state = 'free';
					}
				}
			}


		}

		game.player.object.position.y = 30000 + 500;
		game.player.object.position.x = -900 - 1210;
		game.player.object.position.z = 2400 - 2450;
		game.player.object.rotation.x = 0;
		game.player.object.rotation.y = Math.PI;
		game.player.object.rotation.z = 0;

		$("#location_content").text("选 择 排 序");
		$("#location").attr("class", "location");
		$("#location").fadeIn(2000);
		$("#location").fadeOut(3000);
	}

	goToScene4() {
		const game = this;

		if (game.scene4 === undefined) {
			console.log('loading scene4');

			const vertex = new THREE.Vector3();
			const color = new THREE.Color();
			let ggg = new THREE.PlaneGeometry(10000, 10000, 100, 100);
			let floorGeometry = new THREE.BufferGeometry().fromGeometry(ggg);
			floorGeometry.rotateX(- Math.PI / 2);
			// vertex displacement
			// console.log(floorGeometry);
			let position = floorGeometry.attributes.position;
			for (let i = 0, l = position.count; i < l; i++) {
				vertex.fromBufferAttribute(position, i);
				// vertex.x += Math.random() * 20 - 10;
				vertex.y += 40000;
				// vertex.z += Math.random() * 20 - 10;
				position.setXYZ(i, vertex.x, vertex.y, vertex.z);
			}
			floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
			position = floorGeometry.attributes.position;
			const colorsFloor = [];

			for (let i = 0, l = position.count; i < l; i++) {
				color.setHSL(Math.random() * 0.3 + 0.2, 0.65, Math.random() * 0.25 + 0.65, THREE.SRGBColorSpace);
				colorsFloor.push(color.r, color.g, color.b);
			}

			floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
			const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			game.scene.add(floor);
			game.colliders.push(floor);
			game.scene4 = {};
			game.scene4.floor = floor;



			let bbb = new THREE.BoxGeometry(200, 200, 200);
			let boxGeometry = new THREE.BufferGeometry().fromGeometry(bbb);
			boxGeometry = boxGeometry.toNonIndexed();
			position = boxGeometry.attributes.position;
			const colorsBox = [];
			for (let i = 0, l = position.count; i < l; i++) {
				color.setHSL(Math.random() * 0.3 + 0.2, 0.65, Math.random() * 0.25 + 0.65, THREE.SRGBColorSpace);
				colorsBox.push(color.r, color.g, color.b);
			}
			boxGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colorsBox, 3));
			for (let i = 0; i < 500; i++) {
				const boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: true });
				boxMaterial.color.setHSL(Math.random() * 0.3 + 0.2, 0.65, Math.random() * 0.25 + 0.65, THREE.SRGBColorSpace);
				const box = new THREE.Mesh(boxGeometry, boxMaterial);
				box.position.x = Math.floor(Math.random() * 20 - 10) * 300;
				box.position.y = 40000 + Math.floor(Math.random() * 20) * 200 + 100;
				box.position.z = Math.floor(Math.random() * 20 - 10) * 300;
				game.scene.add(box);
				game.colliders.push(box);
			}
		}

		game.player.object.position.y = 40500;
		game.player.object.position.x = 0;
		game.player.object.position.z = 0;

	}

	loadNextAnim(loader) {
		let anim = this.anims.pop();
		const game = this;
		loader.load(`${this.assetsPath}fbx/anims/${anim}.fbx`, function (object) {
			game.player.animations[anim] = object.animations[0];
			if (game.anims.length > 0) {
				game.loadNextAnim(loader);
			} else {
				delete game.anims;

				console.log('begin loadMyAnim');
				game.loadMyAnim(loader);
			}
		});
	}

	loadMyAnim(loader) {
		const game = this;
		let dict = game.anims2_dict.pop();
		let character = dict["character"];
		let anim = dict["anim"];
		// console.log(`loadMyAnim [${character}][${anim}]`);
		loader.load(`${game.assetsPath}fbx/character/${character}/${anim}.fbx`, function (object) {
			if (game.animations2 === undefined) {
				game.animations2 = {};
			}
			if (game.animations2[character] === undefined) {
				game.animations2[character] = {};
			}
			if (character != game.player.selected_character || anim != "Idle") {
				game.animations2[character][anim] = object.animations[0];
			}
			if (game.anims2_dict.length > 0) {
				game.loadMyAnim(loader);
			} else {
				delete game.anims2_dict;

				console.log('end loadMyAnim');

				console.log('game.animations2', game.animations2);

				game.action = "Idle";
				game.mode = game.modes.ACTIVE;

				game.setKeyboardEvent();
				game.animate();
			}
		});
	}

	setKeyboardEvent() {
		const game = this;
		game.ischatting = false;
		game.player.goFront = false;
		game.player.goBack = false;
		game.player.goLeft = false;
		game.player.goRight = false;
		game.player.turnLeft = false;
		game.player.turnRight = false;
		const onKeyDown = function (event) {
			if (event.keyCode === 27) {
				console.log(event);
				event.preventDefault(); // 阻止默认行为
				window.parent.postMessage('keydown:esc', '*');
			}
			if (game.ischatting == false) {
				switch (event.code) {
					case 'ArrowUp':
						// console.log('[ArrowUp] go front');
						game.player.goFront = true;
						break;
					case 'ArrowLeft':
						// console.log('[ArrowLeft] turn left');
						game.player.turnLeft = true;
						break;
					case 'ArrowDown':
						// console.log('[ArrowDown] go back');
						game.player.goBack = true;
						break;
					case 'ArrowRight':
						// console.log('[ArrowRight] turn right');
						game.player.turnRight = true;
						break;
					// case 'KeyW':
					// 	console.log('[W] go up');
					// 	game.player.object.position.y += 10000;
					// 	break;
					case 'KeyA':
						// console.log('[A] turn left')
						game.player.turnLeft = true;
						break;
					// case 'KeyS':
					// 	console.log('[S] go down');
					// 	game.player.object.position.y -= 10000;
					// 	break;
					case 'KeyD':
						// console.log('[D] turn right');
						game.player.turnRight = true;
						break;
					case 'Space':
						game.player.velocityY = -25;
						break;
				}
			}
		};

		const onKeyUp = function (event) {
			if (game.ischatting == false) {
				switch (event.code) {
					case 'ArrowUp':
						// console.log('[ArrowUp] go front');
						game.player.goFront = false;
						break;
					case 'ArrowLeft':
						// console.log('[ArrowLeft] turn left');
						game.player.turnLeft = false;
						break;
					case 'ArrowDown':
						// console.log('[ArrowDown] go back');
						game.player.goBack = false;
						break;
					case 'ArrowRight':
						// console.log('[ArrowRight] turn right');
						game.player.turnRight = false;
						break;
					case 'KeyO':
						// console.log('[O] go up');
						game.player.object.position.y += 10500;
						break;
					case 'KeyA':
						// console.log('[A] turn left')
						game.player.turnLeft = false;
						break;
					case 'KeyP':
						// console.log('[P] go down');
						game.player.object.position.y -= 9500;
						break;
					case 'KeyD':
						// console.log('[D] turn right')
						game.player.turnRight = false;
						break;
					// case 'Space':
					// 	game.player.velocityY = -25;
					// 	break;
					case 'KeyQ':
						let info = "请输入场景编号(1-4):\n"
							+ "1: 冒泡排序算法演示\n"
							+ "2: 二叉树遍历演示\n"
							+ "3: 选择排序算法演示\n"
							+ "4: 未知方块世界\n";
						let sceneId = prompt(info);
						game.goToScene(sceneId);
						break;
				}
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);

	}

	playerControl(forward, turn) {
		turn = -turn;

		if (forward > 0.3) {
			if (this.player.action != 'Walking' && this.player.action != 'Running') this.player.action = 'Walking';
		} else if (forward < -0.3) {
			if (this.player.action != 'Walking Backwards') this.player.action = 'Walking Backwards';
		} else {
			forward = 0;
			if (Math.abs(turn) > 0.1) {
				if (this.player.action != 'Turn') this.player.action = 'Turn';
			} else if (this.player.action != "Idle") {
				this.player.action = 'Idle';
			}
		}

		// if (forward==0 && turn==0){
		// 	delete this.player.motion;
		// }else{
		// 	this.player.motion = { forward, turn }; 
		// }

		this.player.motion = { forward, turn };


		this.player.updateSocket();
	}

	createCameras() {
		const offset = new THREE.Vector3(0, 80, 0);
		const front = new THREE.Object3D();
		front.position.set(112, 100, 600);
		front.parent = this.player.object;
		const back = new THREE.Object3D();
		back.position.set(0, 300, -1050);
		back.parent = this.player.object;
		const chat = new THREE.Object3D();
		chat.position.set(0, 200, -450);
		chat.parent = this.player.object;
		const wide = new THREE.Object3D();
		wide.position.set(178, 139, 1665);
		wide.parent = this.player.object;
		const overhead = new THREE.Object3D();
		overhead.position.set(0, 400, 0);
		overhead.parent = this.player.object;
		const collect = new THREE.Object3D();
		collect.position.set(40, 82, 94);
		collect.parent = this.player.object;
		this.cameras = { front, back, wide, overhead, collect, chat };
		this.activeCamera = this.cameras.back;
	}

	showMessage(msg, fontSize = 20, onOK = null) {
		const txt = document.getElementById('message_text');
		txt.innerHTML = msg;
		txt.style.fontSize = fontSize + 'px';
		const btn = document.getElementById('message_ok');
		const panel = document.getElementById('message');
		const game = this;
		if (onOK != null) {
			btn.onclick = function () {
				panel.style.display = 'none';
				onOK.call(game);
			}
		} else {
			btn.onclick = function () {
				panel.style.display = 'none';
			}
		}
		panel.style.display = 'flex';
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);

	}

	updateRemotePlayers(dt) {
		// 先更新this.remotePlayers，然后对其中的每个remotePlayer执行update
		if (this.remoteData === undefined || this.remoteData.length == 0 || this.player === undefined || this.player.id === undefined) return;

		const newPlayers = [];
		const game = this;
		//Get all remotePlayers from remoteData array
		const remotePlayers = [];
		const remoteColliders = [];

		this.remoteData.forEach(function (data) {
			if (game.player.id != data.id) {
				//Is this player being initialised?
				let iplayer;
				game.initialisingPlayers.forEach(function (player) {
					if (player.id == data.id) iplayer = player;
				});
				//If not being initialised check the remotePlayers array
				if (iplayer === undefined) {
					let rplayer;
					game.remotePlayers.forEach(function (player) {
						if (player.id == data.id) rplayer = player;
					});
					if (rplayer === undefined) {
						//Initialise player
						game.initialisingPlayers.push(new Player(game, data));
					} else {
						//Player exists
						remotePlayers.push(rplayer);
						remoteColliders.push(rplayer.collider);
					}
				}
			}
		});

		this.scene.children.forEach(function (object) {
			if (object.userData.remotePlayer && game.getRemotePlayerById(object.userData.id) == undefined) {
				game.scene.remove(object);
			}
		});

		this.remotePlayers = remotePlayers;
		// console.log(this.remotePlayers)
		this.remoteColliders = remoteColliders;
		this.remotePlayers.forEach(function (player) { player.update(dt); });
	}

	onMouseDown(event) {
		return
		if (this.remoteColliders === undefined || this.remoteColliders.length == 0 || this.speechBubble === undefined || this.speechBubble.mesh === undefined) return;

		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components

		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		const intersects = raycaster.intersectObjects(this.remoteColliders);
		const chat = document.getElementById('chat');

		if (intersects.length > 0) {
			const object = intersects[0].object;
			const players = this.remotePlayers.filter(function (player) {
				if (player.collider !== undefined && player.collider == object) {
					return true;
				}
			});
			if (players.length > 0) {
				const player = players[0];
				console.log(`onMouseDown: player ${player.id}`);
				this.speechBubble.player = player;
				this.speechBubble.update('');
				this.scene.add(this.speechBubble.mesh);
				this.chatSocketId = player.id;
				chat.style.bottom = '0px';
				this.activeCamera = this.cameras.chat;

				// 显示出消息输入框，此时键盘仅用于打字
				this.ischatting = true;
			}
		} else {
			//Is the chat panel visible?
			if (chat.style.bottom == '0px' && (window.innerHeight - event.clientY) > 40) {
				console.log("onMouseDown: No player found");
				if (this.speechBubble.mesh.parent !== null) this.speechBubble.mesh.parent.remove(this.speechBubble.mesh);
				delete this.speechBubble.player;
				delete this.chatSocketId;
				chat.style.bottom = '-50px';
				this.activeCamera = this.cameras.back;

				// 消息输入框不再显示，此时键盘用于控制。
				this.ischatting = false;
			} else {
				console.log("onMouseDown: typing");
			}
		}
	}

	getRemotePlayerById(id) {
		if (this.remotePlayers === undefined || this.remotePlayers.length == 0) return;

		const players = this.remotePlayers.filter(function (player) {
			if (player.id == id) return true;
		});

		if (players.length == 0) return;

		return players[0];
	}

	animate() {
		const game = this;
		const dt = this.clock.getDelta();

		requestAnimationFrame(function () { game.animate(); });

		//更新NPC动画
		if (this.NPCmixer) {
			this.NPCmixer.update(0.02);
		}
		// 场景中自定义的动画
		this.sceneAnimation(dt);

		// 远程玩家位置的移动
		this.updateRemotePlayers(dt);

		// 本地玩家动作的变化
		if (this.player.mixer != undefined && this.mode == this.modes.ACTIVE) this.player.mixer.update(0.02);
		if (this.player.action == 'Walking') {
			const elapsedTime = Date.now() - this.player.actionTime;
			if (elapsedTime > 1000 && this.player.motion.forward > 0) {
				this.player.action = 'Running';
			}
		}

		// 本地玩家位置的移动
		if (this.player.motion !== undefined) this.player.move(dt);

		// 设置相机相对位置
		if (this.cameras != undefined && this.cameras.active != undefined && this.player !== undefined && this.player.object !== undefined) {
			this.camera.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
			const pos = this.player.object.position.clone();
			if (this.cameras.active == this.cameras.chat) {
				pos.y += 200;
			} else {
				pos.y += 300;
			}
			this.camera.lookAt(pos);
		}

		// 太阳的位置（点光源）
		if (this.sun !== undefined) {
			this.sun.position.copy(this.camera.position);
			this.sun.position.y += 10;
		}

		// 对话框
		if (this.speechBubble !== undefined) this.speechBubble.show(this.camera.position);

		this.renderer.render(this.scene, this.camera);
	}
}
// 创建文字精灵的函数
function createTextSprite(text, backgroundColor, textColor) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	// 测量文字的宽度
	context.font = 'Bold 20px Arial';
	const textWidth = context.measureText(text).width;

	// 设置矩形的宽度为文字宽度加上一定的边距
	const padding = 10;
	const rectWidth = textWidth + padding * 2;
	const rectHeight = 50;
	const borderRadius = 10;
	const shadowBlur = 5;
	const shadowColor = 'rgba(0, 0, 0, 0.5)';

	// 绘制背景矩形
	context.fillStyle = backgroundColor;
	context.shadowBlur = shadowBlur;
	context.shadowColor = shadowColor;
	context.beginPath();
	context.moveTo(borderRadius, 0);
	context.lineTo(rectWidth - borderRadius, 0);
	context.quadraticCurveTo(rectWidth, 0, rectWidth, borderRadius);
	context.lineTo(rectWidth, rectHeight - borderRadius);
	context.quadraticCurveTo(rectWidth, rectHeight, rectWidth - borderRadius, rectHeight);
	context.lineTo(borderRadius, rectHeight);
	context.quadraticCurveTo(0, rectHeight, 0, rectHeight - borderRadius);
	context.lineTo(0, borderRadius);
	context.quadraticCurveTo(0, 0, borderRadius, 0);
	context.closePath();
	context.fill();

	// 绘制文字
	context.font = 'Bold 20px Arial';
	context.fillStyle = textColor;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(text, rectWidth / 2, rectHeight / 2);

	const texture = new THREE.CanvasTexture(canvas);
	const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
	const sprite = new THREE.Sprite(spriteMaterial);


	return sprite;
}


class Player {
	constructor(game, options) {
		this.local = true;
		this.motion = { forward: 0, turn: 0 };
		const player = this;

		let model, colour;

		if (options === undefined) {
			// 此处通过填写表单自选皮肤（颜色、角色）
			let skin = sessionStorage.getItem("color");
			let character = sessionStorage.getItem("model");
			player.selected_skin = skin;
			player.selected_character = character;
			if (skin === null || character === null) {
				player.selected_skin = "黑旋风";
				player.selected_character = "rabbit";
			}
			player.name_text = sessionStorage.getItem("username")
		} else if (typeof options == 'object') {
			this.local = false;
			this.options = options;
			this.id = options.id;
			player.selected_character = options.model;
			player.selected_skin = options.colour;
			player.name_text = options.name
		} else {
			model = options;
		}

		this.model = model;
		this.colour = colour;
		this.game = game;
		this.animations = this.game.animations;

		const loader = new THREE.FBXLoader();

		// loader.load( `${game.assetsPath}fbx/people/${model}.fbx`, function ( object ) {
		loader.load(`${game.assetsPath}fbx/character/${player.selected_character}/Idle.fbx`, function (object) {

			object.scale.set(16, 16, 16);
			object.mixer = new THREE.AnimationMixer(object);
			player.root = object;
			player.mixer = object.mixer;

			object.name = "Person";

			object.traverse((child) => {
				if (child.isMesh && config.optionsMap.has(player.selected_skin)) {
					for (const option of config.optionsMap.get(player.selected_skin)) {
						console.log('option', option);
						child.material[option['material']].color.set(option['color']);
					}
				}
				//变换
				let scale = config.transformMap.get(player.selected_character)['scale'];
				object.scale.x = scale;
				object.scale.y = scale;
				object.scale.z = scale;
				object.position.y = config.transformMap.get(player.selected_character)['y'];
			})

			player.object = new THREE.Object3D();
			player.object.position.set(3122, 0, -173);
			player.object.rotation.set(0, 2.6, 0);

			player.object.add(object);

			player.name = createTextSprite(player.name_text, 'rgba(0, 255, 0, 0.5)', 'white');

			player.name.position.y = 300
			player.name.rotation.y = -Math.PI / 2
			player.name.scale.set(150, 150, 150)
			player.object.add(player.name)

			if (player.deleted === undefined) game.scene.add(player.object);

			if (player.local) {
				game.createCameras();
				game.sun.target = game.player.object;
				game.animations.Idle = object.animations[0];
				if (game.animations2 === undefined) {
					game.animations2 = {};
				}
				if (game.animations2[player.selected_character] === undefined) {
					game.animations2[player.selected_character] = {};
				}
				game.animations2[player.selected_character]["Idle"] = object.animations[0];

				console.log('create PlayerLocal Object');
				console.log('game.animations', game.animations);
				console.log('player.animations', player.animations);

				if (player.initSocket !== undefined) player.initSocket();
			} else {
				const geometry = new THREE.BoxGeometry(100, 300, 100);
				const material = new THREE.MeshBasicMaterial({ visible: false });
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
				box.position.set(0, 150, 0);
				player.object.add(box);
				player.collider = box;
				player.object.userData.id = player.id;
				player.object.userData.remotePlayer = true;
				const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
				game.remotePlayers.push(players[0]);
			}

			if (game.animations.Idle !== undefined) {
				player.action = "Idle";
			}
		});
	}

	set action(name) {
		//Make a copy of the clip if this is a remote player
		const player = this;
		const game = player.game;
		if (this.actionName == name) return;
		const clip = (this.local) ? game.animations2[player.selected_character][name] : THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(game.animations2[player.selected_character][name]));

		const action = this.mixer.clipAction(clip);
		action.time = 0;
		this.mixer.stopAllAction();
		this.actionName = name;
		this.actionTime = Date.now();

		action.fadeIn(0.5);
		action.play();
	}

	get action() {
		return this.actionName;
	}

	update(dt) {
		this.mixer.update(dt);

		if (this.game.remoteData.length > 0) {
			let found = false;
			for (let data of this.game.remoteData) {
				if (data.id != this.id) continue;
				//Found the player
				this.object.position.set(data.x, data.y, data.z);
				const euler = new THREE.Euler(data.pb, data.heading, data.pb);
				this.object.quaternion.setFromEuler(euler);
				this.action = data.action;
				found = true;
			}
			if (!found) this.game.removePlayer(this);
		}

	}
}

class PlayerLocal extends Player {
	constructor(game, model) {
		super(game, model);

		const player = this;
		const socket = io.connect("http://localhost:2002/");
		this.velocityY = 0;

		socket.on('setId', function (data) {
			player.id = data.id;

			const roomId = sessionStorage.getItem("roomId");
			socket.emit('join room', { roomId: roomId });
		});
		socket.on('remoteData', function (data) {
			game.remoteData = data;
			// console.log(data)
		});
		socket.on('deletePlayer', function (data) {
			const players = game.remotePlayers.filter(function (player) {
				if (player.id == data.id) {
					return player;
				}
			});
			if (players.length > 0) {
				let index = game.remotePlayers.indexOf(players[0]);
				if (index != -1) {
					game.remotePlayers.splice(index, 1);
					game.scene.remove(players[0].object);
				}
			} else {
				index = game.initialisingPlayers.indexOf(data.id);
				if (index != -1) {
					const player = game.initialisingPlayers[index];
					player.deleted = true;
					game.initialisingPlayers.splice(index, 1);
				}
			}
		});

		// 接受别人发来的消息
		socket.on('chat message', function (data) {
			document.getElementById('chat').style.bottom = '0px';
			const player = game.getRemotePlayerById(data.id);
			game.speechBubble.player = player;
			game.chatSocketId = player.id;
			game.activeCamera = game.cameras.chat;
			game.speechBubble.update(data.message);
		});

		// 向别人发消息
		$('#msg-form').submit(function (e) {
			socket.emit('chat message', { id: game.chatSocketId, message: $('#m').val() });
			$('#m').val('');
			return false;
		});

		this.socket = socket;

		socket.on('scene1 getCurrent', function (data) {

		});
		socket.on('scene1 next', function (data) {

		});
		socket.on('scene1 restart', function (data) {

		});
		socket.on('scene1 shuffle', function (data) {

		});
	}

	initSocket() {
		//console.log("PlayerLocal.initSocket");
		this.socket.emit('init', {
			model: this.selected_character,
			colour: this.selected_skin,
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
			h: this.object.rotation.y,
			pb: this.object.rotation.x,
			name: this.name_text
		});
	}

	updateSocket() {
		if (this.socket !== undefined) {
			//console.log(`PlayerLocal.updateSocket - rotation(${this.object.rotation.x.toFixed(1)},${this.object.rotation.y.toFixed(1)},${this.object.rotation.z.toFixed(1)})`);
			this.socket.emit('update', {
				x: this.object.position.x,
				y: this.object.position.y,
				z: this.object.position.z,
				h: this.object.rotation.y,
				pb: this.object.rotation.x,
				action: this.action
			})

			// console.log(`(${this.object.position.x},${this.object.position.y},${this.object.position.z})`);
		}
	}

	move(dt) {
		// const ppp = this.object.position;
		// console.log(`(${ppp.x},${ppp.y},${ppp.z})`);
		// const rrr = this.object.rotation;
		// console.log(`(${rrr.x},${rrr.y},${rrr.z})`);
		// console.log(this.object);

		// 尝试实现通过键盘移动人物
		// 这一段代码将使得joystick失去作用
		if (this.goFront) {
			this.motion.forward = 1;
			if (this.action != 'Walking' && this.action != 'Running') {
				this.action = 'Walking';
			}
		} else if (this.goBack) {
			this.motion.forward = -1;
			if (this.action != 'Walking Backwards') {
				this.action = 'Walking Backwards';
			}
		} else {
			this.motion.forward = 0;
		}

		if (this.turnLeft || this.turnRight) {
			// if (this.motion.forward == 0) {
			// 	if (this.action != 'Turn') {
			// 		this.action = 'Turn';
			// 	}
			// }
			if (this.turnLeft) {
				this.motion.turn = 1;
				if (this.motion.forward == 0) {
					this.action = "TurnLeft";
				}
			} else {
				this.motion.turn = -1;
				if (this.motion.forward == 0) {
					this.action = "TurnRight";
				}
			}
		} else {
			this.motion.turn = 0;
			if (this.motion.forward == 0) {
				this.action = 'Idle';
			}
		}



		const pos = this.object.position.clone();
		pos.y += 60;
		let dir = new THREE.Vector3();
		this.object.getWorldDirection(dir);
		if (this.motion.forward < 0) dir.negate();
		let raycaster = new THREE.Raycaster(pos, dir);
		let blocked = false;
		const colliders = this.game.colliders;

		if (colliders !== undefined) {
			const intersect = raycaster.intersectObjects(colliders);
			if (intersect.length > 0) {
				if (intersect[0].distance < 50) blocked = true;
			}
		}

		if (!blocked) {
			if (this.motion.forward > 0) {
				const speed = (this.action == 'Running') ? 500 * 3 : 150 * 3;
				this.object.translateZ(dt * speed);
			} else if (this.action != "Idle") {
				this.object.translateZ(-dt * 120 * 3);
			}
		}

		if (colliders !== undefined) {
			//cast left
			dir.set(-1, 0, 0);
			dir.applyMatrix4(this.object.matrix);
			dir.normalize();
			raycaster = new THREE.Raycaster(pos, dir);

			let intersect = raycaster.intersectObjects(colliders);
			if (intersect.length > 0) {
				if (intersect[0].distance < 50) this.object.translateX(100 - intersect[0].distance);
			}

			//cast right
			dir.set(1, 0, 0);
			dir.applyMatrix4(this.object.matrix);
			dir.normalize();
			raycaster = new THREE.Raycaster(pos, dir);

			intersect = raycaster.intersectObjects(colliders);
			if (intersect.length > 0) {
				if (intersect[0].distance < 50) this.object.translateX(intersect[0].distance - 100);
			}

			//cast down
			dir.set(0, -1, 0);
			pos.y += 200;
			raycaster = new THREE.Raycaster(pos, dir);
			const gravity = 30;

			intersect = raycaster.intersectObjects(colliders);
			if (intersect.length > 0) {
				const targetY = pos.y - intersect[0].distance;

				// console.log("targetY", targetY);
				// console.log("y", this.object.position.y);
				if (targetY <= this.object.position.y || this.velocityY < 0) {
					//Falling
					// console.log("pos.y", this.object.position.y);

					if (this.velocityY == undefined) this.velocityY = 0;
					this.velocityY += dt * gravity;
					this.object.position.y -= this.velocityY;
					if (this.object.position.y < targetY) {
						this.velocityY = 0;
						this.object.position.y = targetY;
					}
				} else if (targetY > this.object.position.y) {
					//Going up
					this.object.position.y = 0.8 * this.object.position.y + 0.2 * targetY;
					// this.object.position.y = targetY;
					this.velocityY = 0;
				}
			}

			this.object.rotateY(this.motion.turn * dt);

			this.updateSocket();
		}
	}
}

class SpeechBubble {
	constructor(game, msg, size = 1) {
		this.config = { font: 'Calibri', size: 24, padding: 10, colour: '#222', width: 256, height: 256 };

		const planeGeometry = new THREE.PlaneGeometry(size, size);
		const planeMaterial = new THREE.MeshBasicMaterial()
		this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
		game.scene.add(this.mesh);

		const self = this;
		const loader = new THREE.TextureLoader();
		loader.load(
			// resource URL
			`${game.assetsPath}images/speech.png`,

			// onLoad callback
			function (texture) {
				// in this example we create the material when the texture is loaded
				self.img = texture.image;
				self.mesh.material.map = texture;
				self.mesh.material.transparent = true;
				self.mesh.material.needsUpdate = true;
				if (msg !== undefined) self.update(msg);
			},

			// onProgress callback currently not supported
			undefined,

			// onError callback
			function (err) {
				console.error('An error happened.');
			}
		);
	}

	update(msg) {
		if (this.mesh === undefined) return;

		let context = this.context;

		if (this.mesh.userData.context === undefined) {
			const canvas = this.createOffscreenCanvas(this.config.width, this.config.height);
			this.context = canvas.getContext('2d');
			context = this.context;
			context.font = `${this.config.size}pt ${this.config.font}`;
			context.fillStyle = this.config.colour;
			context.textAlign = 'center';
			this.mesh.material.map = new THREE.CanvasTexture(canvas);
		}

		const bg = this.img;
		context.clearRect(0, 0, this.config.width, this.config.height);
		context.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, this.config.width, this.config.height);
		this.wrapText(msg, context);

		this.mesh.material.map.needsUpdate = true;
	}

	createOffscreenCanvas(w, h) {
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas;
	}

	wrapText(text, context) {
		const words = text.split(' ');
		let line = '';
		const lines = [];
		const maxWidth = this.config.width - 2 * this.config.padding;
		const lineHeight = this.config.size + 8;

		// line对应的是当前行
		// lines对应的是最终实际显示的行。
		// 尝试将词写到当前行的末尾。
		// 如果超过了一行的最大长度，就把不带有该词的上一行作为确定的一行，记录在lines中。
		words.forEach(function (word) {
			const testLine = `${line}${word} `;
			const metrics = context.measureText(testLine);
			const testWidth = metrics.width;
			if (testWidth > maxWidth) {
				lines.push(line);
				line = `${word} `;
			} else {
				line = testLine;
			}
		});

		if (line != '') lines.push(line);

		let y = (this.config.height - lines.length * lineHeight) / 2;

		lines.forEach(function (line) {
			context.fillText(line, 128, y);
			y += lineHeight;
		});
	}

	show(pos) {
		if (this.mesh !== undefined && this.player !== undefined) {
			this.mesh.position.set(this.player.object.position.x, this.player.object.position.y + 380, this.player.object.position.z);
			this.mesh.lookAt(pos);
		}
	}
}