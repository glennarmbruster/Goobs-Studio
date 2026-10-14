import {fairwayAt} from './golf-courses.js';
import {clamp} from './core.js';
export const BALL_HEIGHT=.095;
const lies={green:{roll:1.35,bounce:.1,retain:.48},fairway:{roll:3.5,bounce:.16,retain:.42},rough:{roll:6,bounce:.045,retain:.27},sand:{roll:9,bounce:.02,retain:.16}};
export const courseBunkers=course=>course.bunkers??[[course.x-15,(-147/169)*course.length,6,9,1],[course.x+17,(-166/169)*course.length,5,10,3]];
export function golfSurface(x,z,course){
 const scale=course.length/169;
 for(const [bx,bz,rx,rz,seed]of courseBunkers(course)){const dx=(x-bx)/rx,dz=-(z-bz)/rz,a=Math.atan2(dz,dx),r=1+.13*Math.sin(a*3+seed)+.06*Math.cos(a*5);if(Math.hypot(dx,dz)<r)return 'sand'}
 const gx=x-course.x,gz=-(z+course.length)/1.25,a=Math.atan2(gz,gx);if(Math.hypot(gx,gz)<12+Math.sin(a*3)*.65)return 'green';
 const {center,width}=fairwayAt(z,course);
 if(z<=4&&z>=-180*scale&&Math.abs(x-center)<width)return 'fairway';return 'rough';
}
export function golfLaunch(club,power,dir,lie='fairway'){
 const p=clamp(power,0,1);if(club==='putter'){const speed=.1+p*5.1;return {vx:dir.x*speed,vy:0,vz:dir.z*speed}}
 const [maxSpeed,loft]={driver:[46,28],iron:[33,40],wedge:[23,56]}[club]||[33,40];
 const penalty=lie==='rough'?.83:lie==='sand'?(club==='wedge'?.82:.53):1,speed=(3+p*(maxSpeed-3))*penalty,a=loft*Math.PI/180;
 return {vx:dir.x*speed*Math.cos(a),vy:speed*Math.sin(a),vz:dir.z*speed*Math.cos(a)};
}
function crossesCup(ax,az,bx,bz,cup,radius){const dx=bx-ax,dz=bz-az,u=clamp(((cup.x-ax)*dx+(cup.z-az)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(ax+u*dx-cup.x,az+u*dz-cup.z)<radius}
export function golfStep(input,dt,{surface=()=> 'fairway',cup=null,wind={x:0,z:0},height=()=>0}={}){
 const s={...input,stopped:false,holed:false,bounced:false};const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 for(let i=0;i<n;i++){
  const ax=s.x,az=s.z,floor=height(s.x,s.z)+BALL_HEIGHT,air=s.y>floor+.001||s.vy>0;
  if(air){const speed=Math.hypot(s.vx,s.vy,s.vz),drag=.0018*speed;s.vx+=(wind.x*.15-drag*s.vx)*h;s.vz+=(wind.z*.15-drag*s.vz)*h;s.vy+=(-9.81-drag*s.vy)*h;s.x+=s.vx*h;s.z+=s.vz*h;s.y+=s.vy*h;
   if(s.y<=height(s.x,s.z)+BALL_HEIGHT){const l=lies[surface(s.x,s.z)]||lies.fairway;s.y=height(s.x,s.z)+BALL_HEIGHT;s.bounced=true;s.vy=Math.abs(s.vy)>1.2?-s.vy*l.bounce:0;s.vx*=l.retain;s.vz*=l.retain;if(s.vy<.35)s.vy=0}
  }else{const slopeX=(height(s.x+.25,s.z)-height(s.x-.25,s.z))/.5,slopeZ=(height(s.x,s.z+.25)-height(s.x,s.z-.25))/.5;s.vx-=9.81*slopeX*h;s.vz-=9.81*slopeZ*h;const l=lies[surface(s.x,s.z)]||lies.fairway,speed=Math.hypot(s.vx,s.vz),next=Math.max(0,speed-l.roll*h),ratio=speed?next/speed:0;s.x+=s.vx*(1+ratio)*.5*h;s.z+=s.vz*(1+ratio)*.5*h;s.vx*=ratio;s.vz*=ratio;s.y=height(s.x,s.z)+BALL_HEIGHT;s.vy=0}
  // Swept capture prevents fast frame rates and low frame rates treating the cup differently.
  if(cup&&s.y<=height(s.x,s.z)+BALL_HEIGHT+.025&&Math.abs(s.vy)<.35&&Math.hypot(s.vx,s.vz)<2.15&&crossesCup(ax,az,s.x,s.z,cup,.29)){Object.assign(s,{x:cup.x,z:cup.z,y:height(cup.x,cup.z)+.04,vx:0,vy:0,vz:0,holed:true,stopped:true});break}
  if(s.y<=height(s.x,s.z)+BALL_HEIGHT+.001&&s.vy===0&&Math.hypot(s.vx,s.vz)<.035){s.vx=s.vz=0;s.stopped=true;break}
 }
 return s;
}
