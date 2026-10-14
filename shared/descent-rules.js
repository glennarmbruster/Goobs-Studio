export const descentGaps=[[22,26],[52,56],[84,88],[112,116]];
export const descentFloor=x=>descentGaps.some(([a,b])=>x>a&&x<b)?null:Math.abs(x-44)<1.2?1.2:0;
export const coolantTarget=[true,false,true,true];
export const descentReady=s=>s.key&&s.valves?.every((v,i)=>v===coolantTarget[i]);
export const descentLaunch=s=>!!(s.coolant&&s.recorder);
export function turnCoolant(values,i){return values.map((v,j)=>j===i?!v:v)}
