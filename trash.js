let geometry = new THREE.BoxGeometry(1000,750,30);
const textureLoader = new THREE.TextureLoader();
const front = new THREE.MeshBasicMaterial({
    map: textureLoader.load(`${this.assetsPath}lecture/page 1.png`),
})
const other = new THREE.MeshBasicMaterial( { color: 0xFDFDFD } );
let material_list = [other, other, other, other, front, other];
let cube = new THREE.Mesh( geometry, material_list );
cube.isTv = true;
cube.position.set(3000, 300, -1800);
this.tv = cube;
this.scene.add(this.tv);
this.localColliders.push(this.tv);
this.page = 1; // ppt页数