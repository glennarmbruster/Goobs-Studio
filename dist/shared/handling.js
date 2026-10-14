import {clamp} from './core.js';
export const roadX=d=>Math.sin(d/160)*23+Math.sin(d/410)*38;
export const roadY=d=>3+Math.sin(d/240)*3+Math.sin(d/83)*.7;
export const DRIVE_MAX_SPEED=89.408; // 200 mph, stored internally in metres per second.
export const speedDisplay=(speed,unit='mph')=>Math.round(speed*(unit==='kmh'?3.6:2.2369362920544));
export const distanceDisplay=(meters,unit='mph')=>unit==='kmh'?(meters/1000).toFixed(2)+' km':(meters/1609.344).toFixed(2)+' mi';
export function drivingStep(input,dt,controls){let s={...input};const n=Math.max(1,Math.ceil(dt*120)),h=dt/n;for(let i=0;i<n;i++){
 const steering=(s.steering||0)+(clamp(controls.steer,-1,1)-(s.steering||0))*(1-Math.exp(-h*8));const accel=controls.brake?-32:controls.gas?10.5-s.speed*.025:-4.5;let speed=clamp(s.speed+accel*h,0,DRIVE_MAX_SPEED);
 const bend=(roadX(s.distance+3)-2*roadX(s.distance)+roadX(s.distance-3))/9,target=steering*(2.1+speed*.029)-bend*speed*speed*.04,lateral=(s.lateral||0)+(target-(s.lateral||0))*(1-Math.exp(-h*6));const offset=clamp(s.offset+lateral*h,-7.2,7.2);if(Math.abs(offset)>5.05)speed=Math.max(0,speed-40*h);
 s={...s,steering,lateral,speed,offset,distance:s.distance+(s.speed+speed)*.5*h,time:s.time+(speed>.05?h:0)};
 }return s}
export function contactResult(delta,aim,pitchX=0){const timing=Math.abs(delta);if(timing>.3)return {kind:'miss',quality:0};if(timing>.225)return {kind:'foul',quality:.1};const quality=clamp(1-timing/.3-Math.abs(aim-pitchX)*.18,0,1);return {kind:'fair',quality,angle:clamp(aim*.5+delta*1.6,-.68,.68)}}
export function walkRunners(bases){const next=[...bases];let runs=0;if(next[0]){if(next[1]){if(next[2])runs++;next[2]=true}next[1]=true}next[0]=true;return {bases:next,runs}}
export {planFielding as fieldingResult} from './baseball-physics.js';
