import { render } from '@angular-three/core';
import { Component, ElementRef, ViewChild, OnChanges, SimpleChanges, Input } from '@angular/core';
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { characters, optionsMap, skinMap, transformMap } from './model-config';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnChanges{
  @ViewChild('Three') 
  three! : ElementRef;
  private renderer : any = new THREE.WebGLRenderer();
  private width! : number;
  private height! : number;
  private scene = new THREE.Scene();
  private camera : any;
  texture!: THREE.Texture;
  mixer! : THREE.AnimationMixer;
  meshMap = new Map();

  @Input()
  selected_character = "rabbit";
  selected_skin = "rabbit";
  selected_action = "Idle";

  ngOnChanges(changes: SimpleChanges): void {
    console.log("hello");
    if (changes['_selected_character']) {
      this.handleCharacterChange();
    }
  }


  characterList = characters;
  skinList = skinMap.get('rabbit');



  ngAfterViewInit() {
    console.log(this.skinList);

    this.width = this.three.nativeElement.offsetWidth;
    this.height = this.three.nativeElement.offsetHeight;
    console.log('width and height', [this.width, this.height]);

    //创建render
    this.renderer.setSize(this.width,this.height);
    this.renderer.setClearColor(0xFFFFFF);
    this.renderer.shadowMap.enabled = true;
    //绑定DOM
    this.three.nativeElement.append(this.renderer.domElement);

    //创建相机
    this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 1000);
    //设置摄像机的位置，并对准场景中心
    this.camera.position.x = 0;
    this.camera.position.y = 100;
    this.camera.position.z = 200;
    this.camera.lookAt(0, 100, 0);


    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 200, 0 );
    this.scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffff00, 1 );
    dirLight.position.set( 0, 20, 0 );
    dirLight.castShadow = true;
    this.scene.add( dirLight );

    const ambientlLight = new THREE.AmbientLight(0xffffff,1);
    this.scene.add(ambientlLight);

    // let textureLoader = new THREE.TextureLoader();
    // textureLoader.load('assets/images/background.jpeg', (texture) => {
    //   this.scene.background = texture;
    // });
    this.scene.background = new THREE.Color(0x526D82);

    // const cubeTextureLoader = new THREE.CubeTextureLoader();
    // const texture = cubeTextureLoader.load([
    //   'assets/images/skybox/px.png', 'assets/images/skybox/nx.png', // 右侧、左侧
    //   'assets/images/skybox/py.png', 'assets/images/skybox/ny.png', // 顶部、底部
    //   'assets/images/skybox/pz.png', 'assets/images/skybox/nz.png'  // 正面、背面
    // ]);
    // this.scene.background = texture;

    let floor = new THREE.PlaneGeometry(500, 500);
    const ground = new THREE.Mesh(floor, new THREE.MeshBasicMaterial({ color: 0xEEEEEE }));
    ground.position.y = 50;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    let loader = new FBXLoader();
    loader.load(`assets/fbx/character/${this.selected_character}/${this.selected_action}.fbx`, (object : any) => {
      // let textureLoader = new THREE.TextureLoader();
      // textureLoader.load('assets/images/SimplePeople_Doctor_Brown.png', (texture) => {

      //   object.traverse( function ( child : any) {
			// 		if ( (<any> child).isMesh ){
      //       let material = new THREE.MeshBasicMaterial({map : texture});
      //       console.log('mesh' , child);
      //       console.log('texture', texture);
			// 			//(<any> child).material.map = texture;
      //       child.material = material;
      //       child.material.needsUpdate = true;
			// 		}
			// 	});
      // })
      object.name = "displayModel";
      object.traverse( (child : any) => {
        if (child.isMesh) {
          // child.material.forEach((element : any) => {
          //   element.color.set(0xff0000)
          // });
          //child.material[0].color.set(0xE893CF); //skirt
          //child.material[1].color.set(0xF6FFA6); 
          //child.material[2].color.set(0xF6FFA6); //skin
          //child.material[3].color.set(0xF6FFA6); inner-ear
        }
      } )

      const matrix = new THREE.Matrix4().makeScale(5, 5, 5);
      object.applyMatrix4(matrix);
      object.position.y = 50;
      object.castShadow = true;
      object.receiveShadow = true;

      console.log("object", object);
      this.mixer = new THREE.AnimationMixer(object);
      const clip =  this.mixer.clipAction(object.animations[0]);
      clip.play();
      this.scene.add( object );
      animate();
    })
    let animate = () => {
      requestAnimationFrame(animate);
      if (this.mixer) {
        this.mixer.update(0.008);
      }
      this.renderer.render(this.scene, this.camera);
    }

    for (let character of characters) {
      let path = `assets/fbx/character/${character}/Walking.fbx`;
      loader.load(path, (object) => {
        object.traverse((child : any) => {
          if (child.isMesh) {
            this.meshMap.set(character, child);
            console.log('rabbit', this.meshMap.get('rabbit'));
          }
        })
      })
    }
    
  }
  
  
  handleCharacterChange() {
    this.skinList = skinMap.get(this.selected_character);
    this.selected_skin = this.skinList![0];
    // this.changeObject(object_ref);
    this.loadObject();
    console.log(this.selected_character);
  }

  handleSkinChange() {
    console.log(this.selected_character);
    let object_ref = this.scene.getObjectByName("displayModel");
    this.loadObject();
  }

  changeObject(object_ref : any) {
    let loader = new FBXLoader();
    this.scene.remove(object_ref);
    let path = `assets/fbx/character/${this.selected_character}/${this.selected_action}.fbx`;
    loader.load(path, (object) => {
      console.log(object);
      object.name = "displayModel";
      const matrix = new THREE.Matrix4().makeScale(5, 5, 5);
      object.applyMatrix4(matrix);
      object.position.y = 50;
      object.castShadow = true;
      object.receiveShadow = true;
      this.scene.add(object);

    })
    // console.log('options', optionsMap.get(this.selected_skin)![0]);
    // let mesh :any;
    // object_ref.traverse((child : any) => {
    //   if (child.isMesh) {
    //     if (optionsMap.has(this.selected_skin)){
    //       for (const option of optionsMap.get(this.selected_skin)!) {
    //         console.log('option', option);
    //         child.material[option['material']].color.set(option['color']);
    //       }
    //     }
    //   }
    // })
    // console.log(object_ref);
  }

  loadObject() {
    let loader = new FBXLoader();
    let path = `assets/fbx/character/${this.selected_character}/${this.selected_action}.fbx`;

    loader.load(path ,(object) => {
      let before = this.scene.getObjectByName("displayModel")!;
      object.name = "displayModel";
      // 替换材质
      object.traverse((child : any) => {
        if (child.isMesh && optionsMap.has(this.selected_skin)) {
          for (const option of optionsMap.get(this.selected_skin)!) {
            console.log('option', option);
            child.material[option['material']].color.set(option['color']);
          }
        }
        //变换
        let scale = transformMap.get(this.selected_character)!['scale'];
        object.scale.x = scale;
        object.scale.y = scale;
        object.scale.z = scale;
        object.position.y = transformMap.get(this.selected_character)!['y'];

        //播放动画
        this.mixer = new THREE.AnimationMixer(object);
        const clip =  this.mixer.clipAction(object.animations[0]);
        clip.play();

        // 加入场景
        object.castShadow = true;
        object.receiveShadow = true;
        this.scene.remove(before);
        this.scene.add(object);
      })
    })
  }

  Idle() {
    this.selected_action = "Idle";
    this.loadObject();
  }
  Walking() {
    this.selected_action = "Walking";
    this.loadObject();
  }
  Running() {
    this.selected_action = "Running";
    this.loadObject();
  }
}
