export const arrayTarget=[2,1,3];
export const arrayGaps=[[24,28],[56,60],[86,90]];
export function turnArray(values,index){return values.map((v,i)=>(v+(i===index||i===(index+1)%3?1:0))%4)}
export const arrayAligned=s=>s.cells?.every(Boolean)&&s.dials?.every((v,i)=>v===arrayTarget[i]);
export const arrayCanLaunch=s=>!!s.aligned;
export function arrayFloor(x){return arrayGaps.some(([a,b])=>x>a&&x<b)?null:Math.abs(x-18)<1.25||Math.abs(x-72)<1.25?1.35:0}
