import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

var origPoint = new THREE.Vector3(0, 0, 0);//原点
//魔方参数
var cubeParams = {
    x: 0,
    y: 0,
    z: 0,
    num: 3,
    len: 50,
    colors:['rgba(0, 255, 0, 1)','rgba(0, 0, 255, 1)',
        'rgba(255, 255, 0, 1)', 'rgba(255, 255, 255, 1)',
        'rgba(255, 0, 0, 1)','rgba(255, 97, 0, 1)']
};

//根据页面宽度和高度创建渲染器，并添加容器中
var width, height;
var renderer;
function initThree() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0xFFFFFF, 1.0);
    document.body.appendChild(renderer.domElement);
}

//创建相机，并设置正方向和中心点
var camera;
var controller;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 600);
    camera.up.set(0, 1, 0);//正方向
    camera.lookAt(origPoint);
    // 控制视角
    controller = new OrbitControls(camera, renderer.domElement);
    controller.target = origPoint;
}

//创建场景，后续元素需要加入到场景中才会显示出来
var scene;
function initScene() {
    scene = new THREE.Scene();
}

//创建光线
var light;
function initLight() {
    light = new THREE.AmbientLight(0xfefefe);
    scene.add(light);
}

//创建展示场景所需的各种元素
var cubes;
function initObject() {
    //生成魔方小正方体
    cubes = GenerateCube(cubeParams.x,cubeParams.y,cubeParams.z,cubeParams.num,cubeParams.len,cubeParams.colors);
    for(var i = 0; i < cubes.length; i++) {
        scene.add(cubes[i]);//并依次加入到场景中
    }
}

//渲染
function render(){
    requestAnimationFrame(render);
    renderer.clear();
    renderer.render(scene, camera);
}

/**
 * 生成一个阶数为num, 中心坐标为(x, y, z)的魔方
 * @param x
 * @param y
 * @param z
 * @param num
 * @param len       小立方体的边长
 * @param colors    六个面的颜色
 * @constructor
 */
function GenerateCube(x, y, z, num, len, colors) {
    // 魔方左上角坐标
    var leftUpX = x - num / 2 * len;
    var leftUpY = y + num / 2 * len;
    var leftUpZ = z + num / 2 * len;

    // 根据各个colors生成材质
    var materialArr = [];
    for (var i = 0; i < colors.length; i++) {
        var texture = new THREE.Texture(faces(colors[i]));
        texture.needsUpdate = true;
        var material = new THREE.MeshLambertMaterial({
            map: texture
        });
        materialArr.push(material);
    }

    // 构建各个小的cube
    var cubes = [];
    for (var i = 0; i < num; i++) {
        for (var j = 0; j < num * num; j++) {
            var cubegeo = new THREE.BoxGeometry(len, len, len);
            var cube = new THREE.Mesh(cubegeo, materialArr);
            // 依次计算各个小方块的中心点坐标
            cube.position.x = (leftUpX + len / 2) + (j % num) * len;
            cube.position.y = (leftUpY - len / 2) - parseInt(j / num) * len;
            cube.position.z = (leftUpZ - len / 2) - i * len;
            cubes.push(cube)
        }
    }
    return cubes;
}

//生成canvas素材
function faces(rgbaColor) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var context = canvas.getContext('2d');
    if (context) {
        //画一个宽高都是256的黑色正方形
        context.fillStyle = 'rgba(0,0,0,1)';
        context.fillRect(0, 0, 256, 256);
        //在内部用某颜色的16px宽的线再画一个宽高为224的圆角正方形并用改颜色填充
        context.rect(16, 16, 224, 224);
        context.lineJoin = 'round';
        context.lineWidth = 16;
        context.fillStyle = rgbaColor;
        context.strokeStyle = rgbaColor;
        context.stroke();
        context.fill();
    } else {
        alert('您的浏览器不支持Canvas无法预览.\n');
    }
    return canvas;
}

//开始
export function threeStart() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
}