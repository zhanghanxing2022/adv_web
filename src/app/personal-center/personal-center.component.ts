import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts';


@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.css']
})
export class PersonalCenterComponent {
  @ViewChild('Three') 
  three! : ElementRef;
  private renderer : any = new THREE.WebGLRenderer();
  private width! : number;
  private height! : number;
  private scene = new THREE.Scene();
  private camera : any;

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

    //创建一个长宽高均为4个单位的正方体
    var cubeGeometry = new THREE.BoxGeometry(4,4,4)

    //创建材质
    var cubMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000
    })

    //创建一个Mesh，将材质包裹到立方体上
    var cube = new THREE.Mesh(cubeGeometry,cubMaterial)
    cube.name = '弟弟'
    
    //设置立方体的位置
    cube.position.x = 0
    cube.position.y = 0
    cube.position.z = 0

    this.scene.add(cube)

    //渲染
    this.renderer.render(this.scene,this.camera);
  }
}
