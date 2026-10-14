import {T,box,cylinder,line,label} from './engine.js';
// The visible wall and the ball collision model both use this circular boundary.
export const fencePoint=(radius,a)=>({x:Math.cos(a)*radius,z:-9-Math.sin(a)*radius});
export const foulPoleDistance=radius=>(9+Math.sqrt(2*radius*radius-81))/2;
export function stadiumFence(scene,park){const positions=[],indices=[],segments=128;
 for(let i=0;i<=segments;i++){const p=fencePoint(park.radius,i/segments*Math.PI);positions.push(p.x,0,p.z,p.x,park.height,p.z);if(i<segments){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const wall=new T.Mesh(geo,new T.MeshStandardMaterial({color:park.wall,roughness:.82,side:T.DoubleSide}));wall.name='continuous-outfield-fence';wall.userData.dynamic=true;wall.castShadow=true;wall.receiveShadow=true;scene.add(wall);
 // A padded yellow cap follows the whole arc; vertical seams are decoration, never gaps.
 const capPath=Array.from({length:129},(_,i)=>{const p=fencePoint(park.radius,i/128*Math.PI);return new T.Vector3(p.x,park.height+.06,p.z)}),cap=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(capPath),128,.11,6,false),new T.MeshStandardMaterial({color:0xe2bb53,roughness:.65}));cap.name='fence-yellow-cap';cap.userData.dynamic=true;scene.add(cap);
 for(let i=1;i<64;i++){const a=i/64*Math.PI,p=fencePoint(park.radius-.025,a);line(scene,[[p.x,.15,p.z],[p.x,park.height-.15,p.z]],0x172f35)}
 for(const a of [Math.PI*.25,Math.PI*.5,Math.PI*.75]){const p=fencePoint(park.radius-.15,a),distance=Math.round(Math.hypot(p.x,p.z)*3.28084),sign=label(scene,String(distance),p.x,Math.min(park.height-1,2.3),p.z,{size:5});sign.material.depthTest=true;sign.name='fence-distance-marker'}
 const pole=foulPoleDistance(park.radius);for(const side of [-1,1]){cylinder(scene,side*pole,park.height+6,-pole,.11,.11,12,0xf4d354);line(scene,[[0,.11,0],[side*pole,.11,-pole]],0xffedd0);
  // Side walls connect the outfield ends to the backstop without crossing the fair field.
  const a=new T.Vector3(side*park.radius,0,-9),b=new T.Vector3(side*12,0,12),mid=a.clone().add(b).multiplyScalar(.5),length=a.distanceTo(b),panel=box(scene,mid.x,1.4,mid.z,length,2.8,.22,park.wall);panel.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);
 }
 return wall;
}
export function fieldFloodlights(scene,climate){const lights=[];for(const side of [-1,1])for(const z of [5,-83]){const light=new T.SpotLight(0xfff1d7,climate.time==='night'?1450:climate.mode==='rain'?900:150,230,.85,.65,1);light.name='stadium-field-floodlight';light.position.set(side*78,41,z);const target=new T.Object3D();target.position.set(side*16,0,z===5?-17:-65);scene.add(target);light.target=target;scene.add(light);lights.push(light)}return lights}
