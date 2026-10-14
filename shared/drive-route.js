export const ROUTE_LENGTH=8000;
export const tunnels=[{start:1450,end:1850,name:'North Head Tunnel'},{start:4750,end:5220,name:'Cypress Tunnel'}];
export const ramps=[{start:2700,lip:2724,end:2742,offset:2.65,width:4.4,height:2.4},{start:6450,lip:6474,end:6492,offset:2.65,width:4.4,height:2.4}];
export const roadX=d=>Math.sin(d/160)*23+Math.sin(d/410)*38;
export const roadY=d=>9+Math.sin(d/520)*14+Math.sin(d/170)*3+30*Math.exp(-(((d-3600)/750)**2))+22*Math.exp(-(((d-6800)/550)**2));
export const tunnelAt=d=>tunnels.find(t=>d>=t.start&&d<=t.end);
export const rampAt=(d,offset)=>ramps.find(r=>d>=r.start&&d<=r.end&&Math.abs(offset-r.offset)<=r.width/2);
export function roadSurface(d,offset=0){const r=rampAt(d,offset);return roadY(d)+(r?r.height*(d<=r.lip?(d-r.start)/(r.lip-r.start):(r.end-d)/(r.end-r.lip)):0)}
export function jumpStep(input,dt,previousDistance=input.distance){const s={...input},floor=roadSurface(s.distance,s.offset);s.y??=floor;s.vy??=0;s.airborne??=false;s.landed=false;
 if(!s.airborne){const r=ramps.find(r=>previousDistance<r.lip&&s.distance>=r.lip&&Math.abs(s.offset-r.offset)<r.width/2);if(r&&s.speed>12){s.airborne=true;s.y=roadY(r.lip)+r.height;s.vy=s.speed*(roadY(r.lip+1)-roadY(r.lip-1))/2+Math.min(8.5,2+s.speed*.085)}else{s.y=floor;s.vy=0}}
 if(s.airborne){s.vy-=9.81*dt;s.y+=s.vy*dt;if(s.y<=floor){s.y=floor;s.vy=0;s.airborne=false;s.landed=true}}
 return s;
}
export const routeSection=d=>tunnelAt(d)?.name??(d<1450?'Harbor coast':d<3000?'North Head':d<4750?'Skyline climb':d<6100?'Cypress valley':'Summit descent');
