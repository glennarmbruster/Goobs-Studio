import {golfLaunch,golfStep,BALL_HEIGHT} from './golf-physics.js';

export function autoGolfClub(distance){return distance<11?'putter':distance<45?'wedge':distance<100?'iron':'driver'}

// Same launch, wind, terrain, lie and rollout as play; evaluated only when a target changes.
// This estimates a clean, straight strike. It does not compensate the player's aim for wind.
export function recommendGolfPower({pos,target,club,surface=()=> 'fairway',height=()=>0,wind={x:0,z:0},wet=false}){
 const dx=target.x-pos.x,dz=target.z-pos.z,distance=Math.hypot(dx,dz);
 const dir={x:dx/(distance||1),z:dz/(distance||1)},selected=club==='auto'?autoGolfClub(distance):club;
 let best=null,maxAlong=0;
 function sample(power){
  let state={x:pos.x,y:height(pos.x,pos.z)+BALL_HEIGHT,z:pos.z,...golfLaunch(selected,power,dir,surface(pos.x,pos.z))};
  // A bounded 20 seconds includes normal flight and rollout. No cup capture: show resting range.
  for(let i=0;i<400;i++){state=golfStep(state,.05,{surface,height,wind,wet});if(state.stopped)break}
  const along=(state.x-pos.x)*dir.x+(state.z-pos.z)*dir.z;
  const error=Math.hypot(state.x-target.x,state.z-target.z);
  const result={power,error,along,endpoint:{x:state.x,y:state.y,z:state.z},club:selected};
  maxAlong=Math.max(maxAlong,along);
  if(!best||error<best.error)best=result;
  return result;
 }
 // Coarse scan handles non-monotonic landing lies; refine around the best interval.
 for(let i=0;i<=16;i++)sample(i/16);
 for(let step=1/32;step>=1/512;step/=2){const center=best.power;sample(Math.max(0,center-step));sample(Math.min(1,center+step))}
 return {...best,distance,unreachable:distance>maxAlong+Math.max(1,distance*.025)};
}
