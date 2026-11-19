import {T,box,sphere,cylinder,tree,water,line,label,batchStatic} from './engine.js';
import {worldUV} from './visuals.js';
import {golfScenery} from './golf-scenery.js';
import {terrainHeight,terrainSlope,fairwayProfile,courseBunkers,golfSurface} from './golf-course.js';

export function buildGolfWorld(e,c,hole,visuals){
 const s=e.scene,H=(x,z)=>terrainHeight(x,z,c),sunset=c.theme==='sunset';
 e.sun.color.setHex(sunset?0xffc28c:0xffe6bf);e.sun.intensity=sunset?2.4:2.2;e.renderer.toneMappingExposure=sunset?.93:1.04;
 e.sun.shadow.camera.left=-48;e.sun.shadow.camera.right=48;e.sun.shadow.camera.top=48;e.sun.shadow.camera.bottom=-48;
 for(const obj of s.children)if(obj.material?.side===T.BackSide)obj.material.depthWrite=false;
 s.add(e.sun.target);s.fog.near=140;s.fog.far=430;
 // A continuous, gently rolling surface; the visual layers use this exact height model.
 const terrain=new T.PlaneGeometry(194,c.length+180,90,Math.ceil((c.length+180)/2.5));worldUV(terrain,4);terrain.rotateX(-Math.PI/2);terrain.translate(-58,0,-c.length/2+10);
 const vertices=terrain.attributes.position,colors=[];
 for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),z=vertices.getZ(i),edge=Math.max(0,Math.min(1,(-x-25)/28));vertices.setY(i,H(x,z)-.015+edge*edge*(2+Math.sin(z/16)*1.2));const f=.94+.06*Math.sin(x*.19)*Math.cos(z*.13);colors.push(.42*f,.56*f,.29*f);}
 terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const terrainMat=visuals.materials.turf.clone();terrainMat.color.setHex(0xffffff);terrainMat.vertexColors=true;const land=new T.Mesh(terrain,terrainMat);land.receiveShadow=true;s.add(land);
 function patch(points,kind,tint,offset=.025){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new T.ShapeGeometry(shape,48);worldUV(geo,kind==='sand'?2.5:3);const raw=geo.toNonIndexed(),v=raw.attributes.position,triangles=[];
 function split(a,b,d,depth=0){const edges=[Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(b[0]-d[0],b[1]-d[1]),Math.hypot(d[0]-a[0],d[1]-a[1])],longest=Math.max(...edges);if(longest<1.4||depth>18){for(const q of [a,b,d])triangles.push(q[0],q[1],H(q[0],-q[1])+offset);return;}const k=edges.indexOf(longest);if(k===1){split(b,d,a,depth);return;}if(k===2){split(d,a,b,depth);return;}const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];split(a,mid,d,depth+1);split(mid,b,d,depth+1);}
 for(let i=0;i<v.count;i+=3)split([v.getX(i),v.getY(i)],[v.getX(i+1),v.getY(i+1)],[v.getX(i+2),v.getY(i+2)]);
 geo.dispose();raw.dispose();const fine=new T.BufferGeometry();fine.setAttribute('position',new T.Float32BufferAttribute(triangles,3));fine.computeVertexNormals();const uv=[];for(let i=0;i<triangles.length;i+=3)uv.push(triangles[i]/3,triangles[i+1]/3);fine.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const mat=visuals.materials[kind].clone();mat.color.setHex(tint);mat.polygonOffset=true;mat.polygonOffsetFactor=-1;mat.polygonOffsetUnits=-4;const mesh=new T.Mesh(fine,mat);mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=true;s.add(mesh);return mesh;}
 const count=Math.ceil((c.length+18)/3),left=[],right=[];
 for(let i=0;i<=count;i++){const z=8-i*(c.length+26)/count,p=fairwayProfile(z,c);left.push([p.center-p.width,z]);right.push([p.center+p.width,z]);}
 patch([...left,...[...right].reverse()],'turf',0xa5c77b);
 for(let i=0;i<count;i+=2)patch([left[i],right[i],right[Math.min(i+1,count)],left[Math.min(i+1,count)]],'turf',0x94b969,.032);
 const greenPoints=scale=>Array.from({length:97},(_,i)=>{const a=i/96*Math.PI*2,r=(12+Math.sin(a*3)*.65)*scale;return [c.x+Math.cos(a)*r,-c.length-Math.sin(a)*r*1.25]});
 patch(greenPoints(1.12),'turf',0x8fae60,.04);patch(greenPoints(1),'turf',0xc0d793,.05);
 // Closely spaced green strips provide a readable surface without hiding the slope.
 for(let z=-c.length-14;z<-c.length+14;z+=2){const points=[];for(let x=c.x-13;x<=c.x+13;x+=.6)if(golfSurface(x,z,c)==='green')points.push([x,H(x,z)+.06,z]);if(points.length>1){const stripe=line(s,points,0xd3e2aa);stripe.material.transparent=true;stripe.material.opacity=.13;}}
 for(const [x,z,rx,rz,seed] of courseBunkers(c)){const contour=expand=>Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*2,r=1+.13*Math.sin(a*3+seed)+.06*Math.cos(a*5);return [x+Math.cos(a)*(rx+expand)*r,z-Math.sin(a)*(rz+expand)*r]});patch(contour(.7),'turf',0x637f44,.055);patch(contour(0),'sand',0xf0dfb7,.065);
 for(let n=-3;n<=3;n++){const points=[];for(let j=-8;j<=8;j++){const xx=x+j*.45,zz=z+n*1.3+.12*Math.sin(j*.5);if(golfSurface(xx,zz,c)==='sand')points.push([xx,H(xx,zz)+.072,zz]);}if(points.length>1){const rake=line(s,points,0xb7a37e);rake.material.transparent=true;rake.material.opacity=.24;}}}
 const sea=water(s,115,-c.length/2,155,c.length+600);sea.mesh.position.y=-1.6;sea.mesh.material.color.setHex(sunset?0x3e9295:0x168f9c);sea.mesh.material.roughness=.22;sea.mesh.material.metalness=.38;sea.mesh.material.opacity=.98;
 for(let i=0;i<Math.ceil((c.length+95)/9);i++){const z=35-i*9;visuals.boulder(s,40+Math.sin(i*1.6)*2,-3.3,z,5,4.6,6,i*.8);if(i%3===0)visuals.boulder(s,48+Math.sin(i)*4,-2.5,z,2.8,2.1,4,i);}
 const surf=[];for(let i=0;i<9;i++){const points=[];for(let j=0;j<=55;j++){const z=35-j*(c.length+80)/55;points.push([45+i*1.3+Math.sin(z*.12+i)*1.2,-1.25,z]);}const foam=line(s,points,0xd9f2e7);foam.material.transparent=true;foam.material.opacity=.12;surf.push(foam);}
 for(let i=0;i<Math.ceil(c.length/7)+8;i++){const z=20-i*7,x=i%2?-31-5*Math.sin(i):26+3*Math.cos(i);if(Math.hypot(x-c.x,z+c.length)>18){const p=tree(s,x,z,.75+(i%4)*.17);p.position.y=H(x,z);}}
 const towerZ=-c.length-23,towerX=30,base=H(towerX,towerZ);cylinder(s,towerX,base+6,towerZ,1.5,2.2,12,0xf1e9d6,32);cylinder(s,towerX,base+5,towerZ,1.82,1.92,1.6,sunset?0xa55340:0xb86348,32);cylinder(s,towerX,base+12.5,towerZ,1.8,1.8,1.7,0x3e6269,24);cylinder(s,towerX,base+13.8,towerZ,0,2.4,1.5,0x284a51,24);const lantern=sphere(s,towerX,base+12.5,towerZ,.6,0xffe5b0);lantern.material.emissive.setHex(0xffc56b);lantern.material.emissiveIntensity=sunset?2:.4;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(s,towerX+Math.cos(a)*1.8,base+12.5,towerZ+Math.sin(a)*1.8,.06,.06,1.8,0xe4d8b7,6);}
 const cup=new T.Vector3(c.x,H(c.x,-c.length),-c.length);cylinder(s,cup.x,cup.y+.056,cup.z,.23,.23,.025,0x132d21,32);cylinder(s,cup.x,cup.y+1.7,cup.z,.024,.024,3.4,0xf4e9d2,12);
 const flag=new T.Mesh(new T.PlaneGeometry(1.2,.65,14,4),new T.MeshStandardMaterial({color:[0xe4a15e,0xefd2a0,0xd67851][hole%3],side:T.DoubleSide,roughness:.8}));flag.position.set(cup.x+.6,cup.y+3.05,cup.z);flag.userData.dynamic=true;s.add(flag);
 const flagLabel=label(s,String(hole+1).padStart(2,'0'),cup.x,cup.y+4.4,cup.z,{size:2.3,color:'#fff3d2'});flagLabel.material.depthTest=true;
 for(const side of [-1,1]){const x=side*2;const tee=sphere(s,x,H(x,5)+.16,5,.19,hole%3===0?0xe4c99a:0x326b73);tee.scale.y=.75;}
 const decor=golfScenery(s,c,hole);
 // Bounded instanced rough: 1,400 clumps, two crossed blades, one draw call.
 const blades=new T.BufferGeometry();blades.setAttribute('position',new T.Float32BufferAttribute([-.035,0,0,.035,0,0,.045,.42,.025, 0,0,-.035,0,0,.035,.04,.32,.06, -.09,0,-.04,-.04,0,0,-.12,.28,.02],3));blades.computeVertexNormals();const grass=new T.InstancedMesh(blades,new T.MeshStandardMaterial({color:0x78954e,side:T.DoubleSide,roughness:1}),1400),dummy=new T.Object3D();let index=0;
 for(let i=0;index<1400&&i<12000;i++){const z=20-((i*7.919)%(c.length+55)),p=fairwayProfile(z,c),x=p.center+(i%2?1:-1)*(p.width+2+(i*1.618)%14);if(golfSurface(x,z,c)!=='rough'||x>35)continue;dummy.position.set(x,H(x,z),z);dummy.rotation.y=i*2.4;dummy.scale.setScalar(.7+(i%5)*.18);dummy.updateMatrix();grass.setMatrixAt(index++,dummy.matrix);}grass.count=index;grass.userData.dynamic=true;s.add(grass);
 const grid=new T.Group();grid.visible=false;s.add(grid);for(let axis=0;axis<2;axis++)for(let k=-10;k<=10;k+=2){const points=[];for(let j=-12;j<=12;j+=.5){const x=c.x+(axis?k:j),z=-c.length+(axis?j:k);if(golfSurface(x,z,c)==='green')points.push([x,H(x,z)+.08,z]);}if(points.length>1){const l=line(grid,points,0xf5f1c5);l.material.transparent=true;l.material.opacity=.25;l.userData.dynamic=true;}}
 // Moving dots follow the downhill vector, so putting break is legible.
 const slopeDots=[];for(let x=-8;x<=8;x+=4)for(let z=-8;z<=8;z+=4){const xx=c.x+x,zz=-c.length+z,g=terrainSlope(xx,zz,c);const dot=sphere(grid,xx,H(xx,zz)+.1,zz,.065,0xffe2a1);dot.userData.dynamic=true;slopeDots.push({dot,x:xx,z:zz,g});}
 // Seabirds are tiny local geometry, rather than an external animation asset.
 const birds=new T.Group();birds.userData.dynamic=true;s.add(birds);for(let i=0;i<6;i++){const wing=line(birds,[[-.7,0,0],[0,-.12,0],[.7,0,0]],0xe8e6d5);wing.position.set(65+i*5,17+i%3*2,-55-i*19);wing.userData.dynamic=true;}
 batchStatic(s);
 return {cup,grid,update(dt,t,putting){sea.update(t);grid.visible=putting;for(const {dot,x,z,g} of slopeDots){const phase=(t*.45)%1;dot.position.set(x-g.x*phase*20,H(x-g.x*phase*20,z-g.z*phase*20)+.12,z-g.z*phase*20);}for(let i=0;i<surf.length;i++)surf[i].material.opacity=.08+.08*(.5+.5*Math.sin(t*.7+i*.7));for(let i=0;i<birds.children.length;i++){const b=birds.children[i];b.position.x=62+i*5+Math.sin(t*.12+i)*8;b.position.y=18+i%3*2+Math.sin(t*.6+i);b.rotation.z=Math.sin(t*2+i)*.12;}const cloth=flag.geometry.attributes.position;for(let i=0;i<cloth.count;i++){const x=cloth.getX(i)+.6;cloth.setZ(i,Math.sin(t*3.4-x*5)*x*.13);}cloth.needsUpdate=true;flag.geometry.computeVertexNormals();decor?.update?.(t);}};
}
