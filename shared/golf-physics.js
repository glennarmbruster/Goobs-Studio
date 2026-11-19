import {clamp} from './core.js';
export const BALL_HEIGHT=.095;
const lies={green:{roll:1.35,bounce:.1,retain:.48},fairway:{roll:3.5,bounce:.16,retain:.42},rough:{roll:6,bounce:.045,retain:.27},sand:{roll:9,bounce:.02,retain:.16}};
export {courseBunkers,golfSurface} from './golf-course.js';
export function golfLaunch(club,power,dir,lie='fairway'){
 const p=clamp(power,0,1);if(club==='putter'){const speed=.1+p*5.1;return {vx:dir.x*speed,vy:0,vz:dir.z*speed}}
 const [maxSpeed,loft]={driver:[46,28],iron:[33,40],wedge:[23,56]}[club]||[33,40];
 const penalty=lie==='rough'?.83:lie==='sand'?(club==='wedge'?.82:.53):1,speed=(3+p*(maxSpeed-3))*penalty,a=loft*Math.PI/180;
 return {vx:dir.x*speed*Math.cos(a),vy:speed*Math.sin(a),vz:dir.z*speed*Math.cos(a)};
}
function crossesCup(ax,az,bx,bz,cup,radius){const dx=bx-ax,dz=bz-az,u=clamp(((cup.x-ax)*dx+(cup.z-az)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(ax+u*dx-cup.x,az+u*dz-cup.z)<radius}
export function golfStep(input,dt,{surface=()=> 'fairway',cup=null,wind={x:0,z:0},height=()=>0,slope=()=>({x:0,z:0})}={}){
 const s={...input,stopped:false,holed:false,bounced:false};const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 for(let i=0;i<n;i++){
  const ax=s.x,az=s.z,ground=height(s.x,s.z)+BALL_HEIGHT,air=s.y>ground+.001||s.vy>0;
  if(air){const speed=Math.hypot(s.vx,s.vy,s.vz),drag=.0018*speed;s.vx+=(wind.x*.15-drag*s.vx)*h;s.vz+=(wind.z*.15-drag*s.vz)*h;s.vy+=(-9.81-drag*s.vy)*h;s.x+=s.vx*h;s.z+=s.vz*h;s.y+=s.vy*h;
   if(s.y<=height(s.x,s.z)+BALL_HEIGHT){const l=lies[surface(s.x,s.z)]||lies.fairway;s.y=height(s.x,s.z)+BALL_HEIGHT;s.bounced=true;s.vy=Math.abs(s.vy)>1.2?-s.vy*l.bounce:0;s.vx*=l.retain;s.vz*=l.retain;if(s.vy<.35)s.vy=0}
  }else{const gradient=slope(s.x,s.z);s.vx-=9.81*gradient.x*h;s.vz-=9.81*gradient.z*h;const l=lies[surface(s.x,s.z)]||lies.fairway,speed=Math.hypot(s.vx,s.vz),next=Math.max(0,speed-l.roll*h),ratio=speed?next/speed:0;s.x+=s.vx*(1+ratio)*.5*h;s.z+=s.vz*(1+ratio)*.5*h;s.vx*=ratio;s.vz*=ratio;s.y=height(s.x,s.z)+BALL_HEIGHT;s.vy=0}
  // Swept capture prevents fast frame rates and low frame rates treating the cup differently.
  if(cup&&s.y<=height(s.x,s.z)+BALL_HEIGHT+.025&&Math.abs(s.vy)<.35&&Math.hypot(s.vx,s.vz)<2.15&&crossesCup(ax,az,s.x,s.z,cup,.29)){Object.assign(s,{x:cup.x,z:cup.z,y:height(cup.x,cup.z)+.04,vx:0,vy:0,vz:0,holed:true,stopped:true});break}
  if(s.y<=height(s.x,s.z)+BALL_HEIGHT+.001&&s.vy===0&&Math.hypot(s.vx,s.vz)<.035){s.vx=s.vz=0;s.stopped=true;break}
 }
 return s;
}

// Same model as a live shot; keep previews deterministic and bounded.
export function predictGolfShot(start,launch,options={}){let ball={...start,...launch},carry=null,path=[{x:start.x,y:start.y,z:start.z}];for(let i=0;i<2400;i++){ball=golfStep(ball,1/60,options);if(ball.bounced&&!carry)carry={x:ball.x,y:ball.y,z:ball.z};if(i%12===0)path.push({x:ball.x,y:ball.y,z:ball.z});if(ball.stopped||ball.holed)break;}return {end:{x:ball.x,y:ball.y,z:ball.z},carry:carry??{x:ball.x,y:ball.y,z:ball.z},path};}
