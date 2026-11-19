import {MINI_RADIUS as R,MINI_WEATHER,inPolygon,zoneAt,miniGradient,movingWalls} from './minigolf-course.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function miniLaunch(angle,power){const speed=.35+clamp(power,0,1)*12.65;return {vx:Math.sin(angle)*speed,vz:-Math.cos(angle)*speed};}
function segmentCollision(b,w,time,restitution=.79){
 const dx=w.b.x-w.a.x,dz=w.b.z-w.a.z,len=dx*dx+dz*dz;if(len<1e-10)return;
 const u=clamp(((b.x-w.a.x)*dx+(b.z-w.a.z)*dz)/len,0,1),qx=w.a.x+u*dx,qz=w.a.z+u*dz,ex=b.x-qx,ez=b.z-qz,dist=Math.hypot(ex,ez),radius=R+.105;
 if(dist>=radius)return;
 const nx=dist>.00001?ex/dist:dz/Math.sqrt(len),nz=dist>.00001?ez/dist:-dx/Math.sqrt(len);b.x=qx+nx*(radius+.001);b.z=qz+nz*(radius+.001);
 let wx=0,wz=0;if(w.rotor){wx=-(qz-w.rotor.z)*w.rotor.rate;wz=(qx-w.rotor.x)*w.rotor.rate;}if(w.gate)wx=Math.cos(time*w.gate.rate+w.gate.phase)*w.gate.rate*w.gate.travel;
 const approach=(b.vx-wx)*nx+(b.vz-wz)*nz;if(approach<0){b.vx-=(1+restitution)*approach*nx;b.vz-=(1+restitution)*approach*nz;b.collisions++;}
}
function crossed(ax,az,bx,bz,cx,cz,r){const dx=bx-ax,dz=bz-az,u=clamp(((cx-ax)*dx+(cz-az)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(ax+u*dx-cx,az+u*dz-cz)<r;}
export function miniStep(input,dt,hole,weather='dusk'){
 const b={...input,time:input.time??0,portalCooldown:input.portalCooldown??0,collisions:0,teleported:false,holed:false,hazard:false,stopped:false};
 const n=Math.max(1,Math.ceil(Math.max(0,dt)*180)),step=Math.max(0,dt)/n;
 const edges=hole.outline.map((p,i)=>{const q=hole.outline[(i+1)%hole.outline.length];return {a:{x:p[0],z:p[1]},b:{x:q[0],z:q[1]}};});
 for(let i=0;i<n;i++){
  const ax=b.x,az=b.z;b.time+=step;b.portalCooldown=Math.max(0,b.portalCooldown-step);
  const zone=zoneAt(b.x,b.z,hole),friction=(MINI_WEATHER[weather]??MINI_WEATHER.dusk).friction*(zone?.kind==='sand'?3.8:zone?.kind==='ice'?.32:1),g=miniGradient(b.x,b.z,hole);
  b.vx-=9.81*g.x*step;b.vz-=9.81*g.z*step;
  if(zone?.kind==='boost'){b.vx+=zone.dx*3.6*step;b.vz+=zone.dz*3.6*step;}
  const speed=Math.hypot(b.vx,b.vz),next=Math.max(0,speed-friction*step),ratio=speed?next/speed:0;b.x+=b.vx*(1+ratio)*.5*step;b.z+=b.vz*(1+ratio)*.5*step;b.vx*=ratio;b.vz*=ratio;
  // Small substeps keep even maximum-speed shots and moving paddles from tunneling.
  for(let pass=0;pass<2;pass++){for(const w of [...edges,...hole.walls,...movingWalls(hole,b.time)])segmentCollision(b,w,b.time);for(const d of hole.discs??[]){const ex=b.x-d.x,ez=b.z-d.z,dist=Math.hypot(ex,ez),radius=R+d.r;if(dist<radius){const nx=dist>1e-8?ex/dist:1,nz=dist>1e-8?ez/dist:0;b.x=d.x+nx*(radius+.001);b.z=d.z+nz*(radius+.001);const dot=b.vx*nx+b.vz*nz;if(dot<0){const bounce=d.bumper?1.04:.8;b.vx-=(1+bounce)*dot*nx;b.vz-=(1+bounce)*dot*nz;if(d.bumper){b.vx+=nx*.8;b.vz+=nz*.8;}b.collisions++;}}}}
  const v=Math.hypot(b.vx,b.vz);if(v>15){b.vx*=15/v;b.vz*=15/v;}
  if(!inPolygon(b.x,b.z,hole.outline)||(hole.hazards??[]).some(p=>((b.x-p.x)/p.rx)**2+((b.z-p.z)/p.rz)**2<1)){b.hazard=true;b.stopped=true;b.vx=b.vz=0;break;}
  if((hole.portals??[]).every(p=>Math.hypot(b.x-p.x,b.z-p.z)>.85))b.portalLocked=false;
  let teleported=false;if(b.portalCooldown===0&&!b.portalLocked)for(const p of hole.portals??[]){if(Math.hypot(b.x-p.x,b.z-p.z)<.64&&Math.hypot(b.vx,b.vz)<8){const dest=hole.portals[p.to];b.x=dest.x;b.z=dest.z;b.portalCooldown=1.3;b.portalLocked=true;b.vx*=.65;b.vz*=.65;b.teleported=true;teleported=true;break;}}
  // Do not test an imaginary line across the course when a portal changes position.
  if(!teleported&&Math.hypot(b.vx,b.vz)<2.75&&crossed(ax,az,b.x,b.z,hole.cup.x,hole.cup.z,.38)){b.x=hole.cup.x;b.z=hole.cup.z;b.vx=b.vz=0;b.holed=true;b.stopped=true;break;}
  if(Math.hypot(b.vx,b.vz)<.035&&zone?.kind!=='boost'){b.vx=b.vz=0;b.stopped=true;break;}
 }
 return b;
}
export function simulateMiniShot(start,angle,power,hole,weather='dusk',{maxTime=35,path=false}={}){let b={...start,...miniLaunch(angle,power),portalCooldown:start.portalCooldown??0},points=[{x:b.x,z:b.z}],travel=0;for(let i=0;i<maxTime*60;i++){const prev=b;b=miniStep(b,1/60,hole,weather);travel+=Math.hypot(b.x-prev.x,b.z-prev.z);if(path&&i%5===0)points.push({x:b.x,z:b.z,teleport:b.teleported});if(b.stopped)break;}return {...b,path:points,travel};}
export function miniGuide(start,angle,power,hole,weather){let b={...start,...miniLaunch(angle,power)},points=[{x:b.x,z:b.z}],length=0,banks=0;for(let i=0;i<100;i++){const prev=b;b=miniStep(b,1/60,hole,weather);length+=Math.hypot(b.x-prev.x,b.z-prev.z);banks+=b.collisions;if(b.teleported||b.hazard||length>7||banks>1)break;if(i%3===0)points.push({x:b.x,z:b.z});if(b.stopped)break;}return points;}
