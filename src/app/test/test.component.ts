import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three'
import { Matrix4, TextureLoader } from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit{
  @ViewChild('Three') 
  three! : ElementRef;
  private renderer : any = new THREE.WebGLRenderer({antialias:true});
  private width! : number;
  private height! : number;
  private scene = new THREE.Scene();
  private camera : any;
  texture!: THREE.Texture;
  controls!: OrbitControls;

  floor():void{
    new TextureLoader().load("../assets/large_floor_tiles_02_diff_4k.jpg", 
    (texture) =>{
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      const floorMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
      });
      const floorGeometry = new THREE.PlaneGeometry(500, 500, 5, 5);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = 0;
      floor.rotation.x = Math.PI / 2;
      this.scene.add(floor);
    })
  }
  hdr():void
  {
    new RGBELoader().load("../assets/belfast_sunset_puresky_4k.hdr",(texture: THREE.Texture | null) =>
    {
      if(texture!=null)
      {
        this.scene.background = texture;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.render(this.scene,this.camera);
      }
      
    })
  }
  ngOnInit() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    //创建render
    this.renderer.setSize(this.width,this.height);
    this.renderer.setClearColor(0x000000);
    //绑定DOM

    //创建相机
    this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 10000);
    //设置摄像机的位置，并对准场景中心
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 30;
    this.camera.lookAt(this.scene.position);

    let textureLoader = new THREE.TextureLoader();
    let texture;
    textureLoader.load('assets/images/SimplePeople_Doctor_Brown.png', (texture) => {
      this.texture = texture;
    });

    // let loader = new FBXLoader();
    let loader = new GLTFLoader()
    // loader.setResourcePath('../../assets/fbx/people/');
  
    loader.load('../../assets/fbx/people/model.glb', (object) => {
      
      console.log(object)
      console.log(loader)
      
      let textureLoader = new THREE.TextureLoader();
      textureLoader.load('../../assets/fbx/people/SimplePeople_BeachBabe_White.png', (texture) => {
        object.scene.children[0].traverse( function ( child ) {
					if ( (<any> child).isMesh ){
            console.log(texture);
						(<any> child).material.map = texture;
            (<any> child).material.transparent = false;

					}
				} );
      })
      const a = new Matrix4();
      a.makeScale(1,1,1);
      object.scene.applyMatrix4(a);
      this.scene.add( object.scene );
    })
    this.hdr();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); 
    this.renderer.render(this.scene,this.camera);
    this.floor();
    this.camera.lookAt(0,0,0);
    this.camera.position.z = 400;
    this.camera.position.y = 150;
    this.camera.position.x = 150;

  }
  ngAfterViewInit(  )
  {
    this.three.nativeElement.append(this.renderer.domElement);

  }
  
}
