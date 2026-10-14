import {ROUTE_LENGTH} from './drive-route.js';
import {clamp} from './core.js';
export const driveModes=['tour','escape','pursuit'];
export const driveModeName={tour:'Coastal tour',escape:'Outrun the police',pursuit:'Police pursuit'};
export const driveSaveKey=mode=>mode==='tour'?'drive':'drive:'+mode;
export const freshDrive=()=>({distance:0,offset:2.65,time:0,speed:0});
export const freshChase=mode=>({d:mode==='escape'?-65:85,offset:2.65,speed:0,elapsed:0,pressure:0,clear:0,outcome:null});
// The rival drives the same route with bounded acceleration. No position teleporting.
export function stepChase(input,dt,player,mode,traffic=[],grip=1){
 const c={...input};if(c.outcome||mode==='tour')return c;
 const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 for(let i=0;i<n;i++){
  c.elapsed+=h;const gap=player.distance-c.d;
  let target=mode==='escape'?84:63+Math.sin(c.d/140)*5,lane=2.65;
  if(mode==='escape'&&gap<36)target=Math.min(target,Math.max(0,player.speed+(gap-9)*1.5));
  const passing=traffic.find(v=>v.id===c.passId&&v.d>c.d-22);const leader=passing??traffic.filter(v=>v.direction>0&&v.d>c.d&&v.d-c.d<90).sort((a,b)=>a.d-b.d)[0];
  const clear= !traffic.some(v=>v.direction<0&&v.d>c.d-30&&v.d<c.d+230);
  if(leader){if(clear&&leader.d-c.d<75){lane=-2.65;c.passId=leader.id;}else target=Math.min(target,Math.max(0,leader.speed+(leader.d-c.d-18)*.7))}
  if(!leader)c.passId=null;if(mode==='escape'&&gap<40)lane=clamp(player.offset,-3.5,3.5);
  target*=.82+.18*grip;c.offset+=(lane-c.offset)*(1-Math.exp(-h*1.6));
  c.speed=clamp(c.speed+clamp((target-c.speed)*1.8,-24*grip,mode==='escape'?10:7.5)*h,0,84);c.d+=c.speed*h;
  const separation=Math.abs(player.distance-c.d),near=separation<20&&Math.abs(player.offset-c.offset)<2.2;
  if(mode==='escape'){
   c.pressure=clamp(c.pressure+(near?h:-h*1.7),0,6);
   c.clear=player.distance-c.d>120&&player.distance>350?c.clear+h:0;
   if(c.pressure>=6)c.outcome='caught';else if(c.clear>=5)c.outcome='escaped';
   else if(player.distance>=ROUTE_LENGTH)c.outcome=player.distance-c.d>70?'escaped':'caught';
  }else{
   c.pressure=clamp(c.pressure+(near&&player.speed>5?h:-h*2),0,4);
   if(c.pressure>=4)c.outcome='intercepted';else if(c.d>=ROUTE_LENGTH||c.d-player.distance>450)c.outcome='lost';
  }
  if(c.elapsed>=300&&!c.outcome)c.outcome=mode==='escape'?'caught':'lost';
  if(c.outcome)break;
 }return c;
}
export function chaseStatus(c,player,mode,units){const gap=Math.round(Math.abs(player.distance-c.d)*(units==='mph'?3.28084:1)),unit=units==='mph'?'ft':'m';return mode==='escape'?`POLICE ${gap} ${unit} ${c.d<player.distance?'BEHIND':'AHEAD'} · Capture ${Math.round(c.pressure/6*100)}% · Breakaway ${Math.min(5,c.clear).toFixed(1)}/5 s`:`TARGET ${gap} ${unit} ${c.d>player.distance?'AHEAD':'BEHIND'} · Intercept ${Math.round(c.pressure/4*100)}%`}
