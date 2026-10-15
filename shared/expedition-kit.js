import {T,engine,box,cylinder,sphere,line,label,water,tree,batchStatic} from './engine.js';
import {shell,load,save,modal,toast,lifecycle,bindHold,clamp,tone} from './core.js';
import {visualKit} from './visuals.js';
export {T,box,cylinder,sphere,line,label,water,tree,batchStatic,load,save,modal,toast,bindHold,clamp,tone};
export function stage(title,subtitle,{sky=0x80bdcb,fog=220,coast=false}={}){
 shell(title,'0.6 ALPHA · '+subtitle);const e=engine({sky,fog}),s=e.scene,v=visualKit(e,{coast,lighting:true});
 Object.assign(e.sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55});e.sun.shadow.camera.updateProjectionMatrix();e.sun.shadow.normalBias=.025;
 document.querySelector('.stage').classList.add('expedition-stage');document.querySelector('#controls').classList.add('expedition-controls');
 e.camera.position.set(0,70,65);e.camera.lookAt(0,0,0);e.renderer.toneMappingExposure=1.05;
 return {e,s,v};
}
export function lifeFor(key,get,reset,cleanup){const life=lifecycle({pause:()=>save(key,get()),reset});return {paused:life.paused,dispose(){save(key,get());life.dispose();cleanup?.()}}}
export function controls(html){document.querySelector('#controls').innerHTML=html}
export function button(id,fn){document.querySelector('#'+id).onclick=fn}
export function mesh(parent,geometry,color,options={}){const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.5,...options}));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export function glow(parent,x,y,z,color,r=.25){const m=new T.Mesh(new T.SphereGeometry(r,12,8),new T.MeshBasicMaterial({color,toneMapped:false}));m.position.set(x,y,z);parent.add(m);return m}
export function ring(parent,x,y,z,r,color){const m=new T.Mesh(new T.TorusGeometry(r,.09,8,48),new T.MeshBasicMaterial({color,toneMapped:false}));m.position.set(x,y,z);m.rotation.x=-Math.PI/2;parent.add(m);return m}
export function rod(parent,a,b,r,color){const av=new T.Vector3(...a),bv=new T.Vector3(...b),m=cylinder(parent,0,0,0,r,r,av.distanceTo(bv),color,10);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m}
export function seeded(i,seed=1){const v=Math.sin(i*127.1+seed*311.7)*43758.5453;return v-Math.floor(v)}
export function woodTexture(){const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d');a.fillStyle='#785332';a.fillRect(0,0,256,256);for(let i=0;i<320;i++){a.strokeStyle=`rgba(${i%2?'228,184,108':'38,23,16'},${.02+seeded(i)*.12})`;a.lineWidth=seeded(i+1)*2+1;a.beginPath();for(let y=0;y<260;y+=8){const x=(i*7.3)%256+Math.sin(y*.025+i)*3;y?a.lineTo(x,y):a.moveTo(x,y)}a.stroke()}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,4);return t}
export function screenPoint(e,event,planeY=0){const rect=e.renderer.domElement.getBoundingClientRect?.()??{left:0,top:0,width:innerWidth,height:innerHeight};const mouse=new T.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),ray=new T.Raycaster();e.camera.updateMatrixWorld(true);e.scene.updateMatrixWorld(true);ray.setFromCamera(mouse,e.camera);return ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),-planeY),new T.Vector3())}
export function tapWorld(e,fn){let down;const el=e.renderer.domElement;const start=ev=>{if(ev.isPrimary===false)return;down={x:ev.clientX,y:ev.clientY,id:ev.pointerId}};const end=ev=>{if(!down||down.id!==ev.pointerId)return;const d=down;down=null;if(Math.hypot(ev.clientX-d.x,ev.clientY-d.y)<20)fn(ev)};el.addEventListener('pointerdown',start);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',()=>down=null);return ()=>{el.removeEventListener('pointerdown',start);el.removeEventListener('pointerup',end)}}
export function stickInput({extra={}}={}){
 const state={x:0,z:0,...extra},keys=new Set(),stick=document.querySelector('#stick'),knob=document.querySelector('#stick-knob');let pointer=null,origin=null;
 const move=ev=>{if(pointer!==ev.pointerId)return;const dx=(ev.clientX-origin.x)/44,dz=(ev.clientY-origin.y)/44,n=Math.max(1,Math.hypot(dx,dz));state.x=dx/n;state.z=dz/n;knob.style.transform=`translate(${state.x*35}px,${state.z*35}px)`};
 const down=ev=>{if(pointer!==null)return;ev.preventDefault();pointer=ev.pointerId;const r=stick.getBoundingClientRect?.();origin=r?{x:r.left+r.width/2,y:r.top+r.height/2}:{x:ev.clientX,y:ev.clientY};stick.setPointerCapture?.(pointer);move(ev)};
 const up=ev=>{if(ev&&ev.pointerId!==pointer)return;pointer=null;state.x=state.z=0;knob.style.transform='translate(0,0)'};
 stick.addEventListener('pointerdown',down);stick.addEventListener('pointermove',move);for(const ev of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(ev,up);
 const keydown=ev=>{if(['INPUT','SELECT'].includes(ev.target?.tagName))return;keys.add(ev.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(ev.code))ev.preventDefault()};const keyup=ev=>keys.delete(ev.code);const clear=()=>{keys.clear();up();for(const key of Object.keys(extra))state[key]=typeof extra[key]==='boolean'?false:0};addEventListener('keydown',keydown);addEventListener('keyup',keyup);addEventListener('blur',clear);
 return {state,keys,read(){if(pointer===null){state.x=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));state.z=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'))}return state},dispose(){removeEventListener('keydown',keydown);removeEventListener('keyup',keyup);removeEventListener('blur',clear)}};
}
export const stickHTML='<div class="flight-stick" id="stick" role="group" aria-label="Movement pad"><span class="stick-cross"></span><b id="stick-knob"></b><small>MOVE</small></div>';
export function overview(e,{span=70,z=0}={}){const portrait=innerHeight>innerWidth,scale=portrait?1.27:1;const d=Math.max(span*.9,span/(e.camera.aspect||1)*.9)*scale;e.camera.position.set(0,d,d*.63+z);e.camera.lookAt(0,0,z);e.camera.updateMatrixWorld(true)}
export function milestone(key,index){const old=load(key,0);save(key,Math.max(old,index));}
export function chooseLevel(title,items,unlocked,current,onChoose){modal(title,'<p>Choose an expedition. Completing one unlocks the next. Each saves its best result.</p>',items.map((item,i)=>({text:(i===current?'● ':'')+(i+1)+'. '+item.name,disabled:i>unlocked,action:()=>onChoose(i)})).concat([{text:'Keep playing'}]))}
export function starMesh(parent,color=0xffd47f){const points=[];for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.28:.65;points.push(new T.Vector2(Math.cos(a)*r,Math.sin(a)*r))}const m=mesh(parent,new T.ExtrudeGeometry(new T.Shape(points),{depth:.16,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:1,steps:1}),color,{metalness:.7,roughness:.24});return m}
