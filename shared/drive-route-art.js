import {T,box,cylinder,label,batchStatic} from './engine.js';
import {tunnels,ramps,roadX,roadY,roadSurface,tunnelAt,ROUTE_LENGTH} from './drive-route.js';
export function routeStructures(scene,point){
 const structures=[];
 for(const tunnel of tunnels){const group=new T.Group();group.name='tunnel-'+tunnel.start;group.userData.dynamic=true;scene.add(group);structures.push({group,start:tunnel.start,end:tunnel.end});
  // Connected vault follows road curvature and elevation, including vertical side walls.
  const profile=[[-6.8,0],[-6.8,2.3],...Array.from({length:17},(_,i)=>{const a=Math.PI-i*Math.PI/16;return [Math.cos(a)*6.8,2.3+Math.sin(a)*6.8]}),[6.8,0]],vertices=[],indices=[],steps=Math.ceil((tunnel.end-tunnel.start)/5),cols=profile.length;
  for(let i=0;i<=steps;i++){const d=tunnel.start+(tunnel.end-tunnel.start)*i/steps;for(const [x,y]of profile)vertices.push(...point(d,x,y).toArray());if(i<steps)for(let j=0;j<cols-1;j++){const a=i*cols+j;indices.push(a,a+cols,a+1,a+1,a+cols,a+cols+1)}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const vault=new T.Mesh(geo,new T.MeshStandardMaterial({color:0x4a5356,roughness:.92,side:T.DoubleSide}));vault.name='tunnel-vault';vault.receiveShadow=true;group.add(vault);
  for(let d=tunnel.start;d<=tunnel.end;d+=20){const a=-Math.atan2(roadX(d+1)-roadX(d-1),2);for(const side of [-1,1]){const p=point(d,side*5.65,3.7),fixture=box(group,p.x,p.y,p.z,.32,.18,3,0xf7d69b);fixture.rotation.y=a;fixture.material.emissive.setHex(0xffc67d);fixture.material.emissiveIntensity=2.8;const marker=point(d,side*6.65,.55),reflector=box(group,marker.x,marker.y,marker.z,.08,.18,.65,0xd4d6bd);reflector.material.emissive.setHex(0xe2aa50);reflector.material.emissiveIntensity=.6}}
  for(const d of [tunnel.start,tunnel.end]){const p=point(d);for(const side of [-1,1]){const v=point(d,side*8,4);box(group,v.x,v.y,v.z,2.3,8,4,0x828b85)}const cap=box(group,p.x,p.y+10,p.z,18,2,4,0x7e8780);cap.rotation.y=-Math.atan2(roadX(d+1)-roadX(d-1),2)}
  const sign=point(tunnel.start-65,-7.6,3.3);label(group,tunnel.name.toUpperCase(),sign.x,sign.y,sign.z,{size:8});
  batchStatic(group);
 }
 for(const ramp of ramps){const group=new T.Group();group.name='ramp-'+ramp.start;group.userData.dynamic=true;scene.add(group);structures.push({group,start:ramp.start-90,end:ramp.end+180});const vertices=[],indices=[];let i=0;for(const d of [ramp.start,ramp.lip,ramp.end]){for(const x of [ramp.offset-ramp.width/2,ramp.offset+ramp.width/2]){const p=point(d,x,roadSurface(d,x)-roadY(d)+.05);vertices.push(...p.toArray())}if(i<2){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}i++}indices.push(0,2,4,1,5,3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const deck=new T.Mesh(geo,new T.MeshStandardMaterial({color:0x6d7777,roughness:.7,side:T.DoubleSide}));deck.name='ramp-deck';deck.receiveShadow=true;group.add(deck);
  for(let d=ramp.start+2;d<ramp.lip;d+=4){const p=point(d,ramp.offset,roadSurface(d,ramp.offset)-roadY(d)+.09),stripe=box(group,p.x,p.y,p.z,ramp.width,.025,.5,0xf0c453);stripe.rotation.y=-Math.atan2(roadX(d+1)-roadX(d-1),2);stripe.rotation.x=Math.atan2(ramp.height,ramp.lip-ramp.start)}const sign=point(ramp.start-65,-7.6,3);label(group,'RAMP AHEAD · LEFT LANE TO BYPASS',sign.x,sign.y,sign.z,{size:9});
 }
 // Only two actual tunnel lights are needed; ceiling fixtures are emissive meshes.
 const lights=[-15,22].map(()=>{const l=new T.PointLight(0xffd3a0,240,65,1.2);l.name='tunnel-fill-light';scene.add(l);return l});
 return {update(d){for(const o of structures)o.group.visible=d>o.start-550&&d<o.end+130;const tunnel=tunnelAt(d);lights.forEach((l,i)=>{l.visible=!!tunnel;l.position.copy(point(Math.max(tunnel?.start??0,Math.min(tunnel?.end??ROUTE_LENGTH,d+(i?22:-15))),0,5.8))})}};
}
// Static meshes are batched per section; distant scenery is hidden, keeping draw calls bounded.
export function streamRoute(scene){const chunks=new Map();for(const o of [...scene.children]){if(o.userData.dynamic||o.isLight||(!o.isMesh&&!o.isGroup&&!o.isSprite))continue;const index=Math.max(0,Math.floor(-o.position.z/400));let g=chunks.get(index);if(!g){g=new T.Group();g.name='route-section-'+index;scene.add(g);chunks.set(index,g)}g.add(o)}for(const g of chunks.values())batchStatic(g);return {update(d){for(const [i,g]of chunks)g.visible=i*400<d+620&&(i+1)*400>d-130}}}
