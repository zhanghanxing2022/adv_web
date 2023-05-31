import { Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  @ViewChild('Three') 
  three! : ElementRef;
  private renderer : any = new THREE.WebGLRenderer();
  private width! : number;
  private height! : number;
  private scene = new THREE.Scene();
  private camera : any;
  texture!: THREE.Texture;

  ngAfterViewInit() {
    this.width = this.three.nativeElement.offsetWidth;
    this.height = this.three.nativeElement.offsetHeight;

    //创建render
    this.renderer.setSize(this.width,this.height);
    this.renderer.setClearColor(0xFFFFFF);
    //绑定DOM
    this.three.nativeElement.append(this.renderer.domElement);

    //创建相机
    this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 1000);
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

    let loader = new FBXLoader();
    loader.setResourcePath('assets/images/');
    loader.load('assets/fbx/people/Doctor.fbx', (object) => {
      // let textureLoader = new THREE.TextureLoader();
      // textureLoader.load('SimplePeople_Doctor_Brown.png', (texture) => {
      //   object.traverse( function ( child ) {
			// 		if ( (<any> child).isMesh ){
			// 			(<any> child).material.map = texture;
			// 		}
			// 	} );
      // })
      this.scene.add( object );
    })
  }
}
