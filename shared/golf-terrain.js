import {clamp} from './core.js';
export function terrainHeight(x,z,course){
 const t=clamp(-z/course.length,0,1),rise=(course.elevation??0)*t;
 const hills=Math.sin(t*Math.PI*2)*1.4+Math.sin(x*.065)*Math.sin(t*Math.PI)*.6;
 const toCup=Math.hypot(x-course.x,z+course.length),blend=clamp((toCup-17)/25,0,1);
 return (rise+hills)*blend+(course.elevation??0)*(1-blend);
}
export const golfViews=['follow','broadcast','overhead'];
export function golfView(mode,pos,dir,distance,portrait){
 const add=(v,x,y,z)=>({x:v.x+x,y:v.y+y,z:v.z+z});
 if(mode==='overhead')return {position:add(pos,0,90,25),target:{...pos}};
 if(mode==='broadcast')return {position:add(pos,dir.z*22-dir.x*8,18,-dir.x*22-dir.z*8),target:add(pos,dir.x*10,0,dir.z*10)};
 const back=distance<15?(portrait?-9:-7):(portrait?-19:-16),up=distance<15?(portrait?6:4):(portrait?9:6);
 return {position:add(pos,dir.x*back,up,dir.z*back),target:add(pos,dir.x*Math.min(distance*.5,12),0,dir.z*Math.min(distance*.5,12))};
}
