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
// Keep the pre-v10 field illumination. Bright fixtures should not wash out the grass.
export function fieldFloodlights(scene,climate,park){
 const night=climate.time==='night',lights=[];
 for(const side of [-1,1])for(const z of [5,-83]){
  const light=new T.PointLight(0xfff1d7,night?80:climate.mode==='rain'?45:8,130,1.5);
  light.name='stadium-field-floodlight';light.position.set(side*65,32,z);scene.add(light);lights.push(light);
 }
 // Two banks sit beyond the outfield stands, either side of the scoreboard.
 // Their size/position keeps both banks in the batting view in portrait and landscape.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=224;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#253442';ctx.fillRect(0,0,512,224);
 for(let row=0;row<3;row++)for(let col=0;col<6;col++){
  const x=col*82+16,y=row*69+14;ctx.fillStyle='#61717a';ctx.fillRect(x-3,y-3,73,61);
  ctx.fillStyle=night?'#ffdf9d':'#bec9cb';ctx.fillRect(x,y,67,55);
  ctx.fillStyle=night?'#fff9e7':'#e4e8e3';ctx.fillRect(x+7,y+5,53,43);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 for(const side of [-1,1])for(const outfield of [false,true]){
  const x=side*(outfield?30:78),z=outfield?-park.radius-30:5,y=outfield?32:42;
  cylinder(scene,x,y/2,z,.36,.65,y,0x566674);
  const frame=box(scene,x,y,z,14.7,6.8,.8,0x344754);frame.rotation.x=-.12;
  const bank=new T.Mesh(new T.PlaneGeometry(14,6),new T.MeshBasicMaterial({map:texture,toneMapped:false}));
  bank.name=outfield?'outfield-light-bank':'sideline-light-bank';bank.userData.dynamic=true;
  bank.position.set(x,y,z+.5);bank.rotation.x=-.12;scene.add(bank);
  for(const offset of [-4.8,4.8])line(scene,[[x,y-8,z],[x+offset,y-3,z]],0x71818d);
 }
 return lights;
}
