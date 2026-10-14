import {clamp} from './core.js';
export function pitchPosition(f,location=0,type='fastball'){
 const p=clamp(f,0,1.35),breakAmount=type==='curve'?.5:type==='slider'?-.35:0;
 return {x:location*p+breakAmount*Math.sin(Math.min(p,1)*Math.PI),y:1.85-.8*p+(type==='curve'?.65:.25)*p*(1-p),z:-18.4*(1-p)};
}
export function battedLaunch(quality,angle){const q=clamp(quality,0,1),speed=23+q*28,loft=(18+q*13)*Math.PI/180,horizontal=speed*Math.cos(loft);return {x:0,y:1.1,z:0,vx:Math.sin(angle)*horizontal,vy:Math.sin(loft)*speed,vz:-Math.cos(angle)*horizontal}}
export function baseballStep(input,dt){const b={...input},n=Math.max(1,Math.ceil(dt*120)),h=dt/n;for(let i=0;i<n;i++){
 const speed=Math.hypot(b.vx,b.vy,b.vz),drag=.003*speed;b.vx*=Math.exp(-drag*h);b.vz*=Math.exp(-drag*h);b.vy=(b.vy-9.81*h)*Math.exp(-drag*h);b.x+=b.vx*h;b.y+=b.vy*h;b.z+=b.vz*h;
 const radius=Math.hypot(b.x,b.z+9);if(!b.homeRun&&radius>=115){if(b.y>4.2){b.homeRun=true}else{const nx=b.x/radius,nz=(b.z+9)/radius,out=b.vx*nx+b.vz*nz;if(out>0){b.vx-=1.35*out*nx;b.vz-=1.35*out*nz;b.x=nx*114.9;b.z=nz*114.9-9;b.wallHit=true}}}
 if(b.y<=.18){b.y=.18;b.landed=true;break}
 }return b}
export function planFielding(quality,angle,fielders){const launch=battedLaunch(quality,angle);let b={...launch},t=0,catchPoint=null,catchTime=0;while(t<10&&!b.landed){b=baseballStep(b,1/120);t+=1/120;if(!catchPoint&&b.vy<0&&b.y<=1.8){catchPoint={x:b.x,z:b.z};catchTime=t}}
 catchPoint??={x:b.x,z:b.z};const reach=Math.max(0,catchTime-.35)*5.2,closest=Math.min(...fielders.map(f=>Math.hypot(f.x-catchPoint.x,f.z-catchPoint.z))),caught=!b.homeRun&&!b.wallHit&&closest<=reach+.7;
 return {launch,target:caught?catchPoint:{x:b.x,z:b.z},catchPoint,catchTime,duration:t,speed:Math.hypot(launch.vx,launch.vz),vy:launch.vy,homeRun:!!b.homeRun,wallHit:!!b.wallHit,caught,bases:b.homeRun?4:caught?0:Math.hypot(b.x,b.z)>75?2:1};
}
