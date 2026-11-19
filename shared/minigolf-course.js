// Hand-built courses. Coordinates are metres; every visible obstacle uses these same colliders.
export const MINI_WEATHER={
 day:{name:'Day',sky:['#428fc1','#c7e5de','#e4e5c3'],sun:0xffedc8,sunPower:2.9,ambient:2.1,night:0,friction:1.08},
 night:{name:'Night',sky:['#060d2b','#172f57','#47707f'],sun:0xaccfff,sunPower:.7,ambient:1.05,night:1,friction:1.08},
 rain:{name:'Rain',sky:['#283b53','#68838e','#a7bcb5'],sun:0xc8e3ea,sunPower:.65,ambient:1.65,night:.45,friction:1.4},
 dusk:{name:'Dusk',sky:['#26385e','#d68e98','#ffd2a0'],sun:0xffbb86,sunPower:1.8,ambient:1.5,night:.65,friction:1.08},
 dawn:{name:'Dawn',sky:['#697ab1','#eeb8b3','#ffe7b4'],sun:0xffd5b1,sunPower:2.1,ambient:1.7,night:.25,friction:1.08}
};
const outline=[[-6,13],[6,13],[6,-13],[-6,-13]];
const wall=(x1,z1,x2,z2)=>({a:{x:x1,z:z1},b:{x:x2,z:z2}});
const disc=(x,z,r=.8)=>({x,z,r});
const rect=(x,z,w,d,kind)=>({x,z,w,d,kind});
export const MINI_HOLES=[
 {name:'First Light',par:2,tip:'The middle planter splits the fairway. A gentle bank shot goes around it.',start:{x:-3,z:10},cup:{x:2,z:-10},outline,discs:[disc(0,0,1.25)],walls:[],zones:[]},
 {name:'The Ribbon Walk',par:3,tip:'Two staggered walls. Work across the lane, then turn toward the flag.',start:{x:-3,z:10},cup:{x:3,z:-10},outline,walls:[wall(-6,4,1,4),wall(-1,-4,6,-4)],discs:[],zones:[]},
 {name:'Clockwork Garden',par:3,tip:'Watch the brass paddle. Wait for a clear lane—or use a bank.',start:{x:0,z:10},cup:{x:0,z:-10},outline,walls:[],discs:[disc(-4,-5,.6),disc(4,5,.6)],rotors:[{x:0,z:0,length:7,rate:.55,phase:0}],zones:[]},
 {name:'Velvet & Glass',par:3,tip:'Velvet slows the ball; blue glass carries it. Choose your line and weight.',start:{x:-3,z:10},cup:{x:3,z:-10},outline,walls:[wall(-6,0,-1,0)],discs:[disc(2,-6,1)],zones:[rect(1,3,7,4,'sand'),rect(-2,-6,5,6,'ice')]},
 {name:'The Moon Gate',par:3,tip:'Roll gently into a glowing portal. Its twin returns you to the course.',start:{x:0,z:10},cup:{x:2,z:-10},outline,walls:[wall(-6,-2,3,-2)],discs:[],portals:[{x:-3,z:4,to:1},{x:-2,z:-7,to:0}],zones:[]},
 {name:'Pinball Pavilion',par:3,tip:'The glowing bumpers give a little energy back. Leave the last bounce soft.',start:{x:0,z:10},cup:{x:0,z:-10},outline,walls:[],discs:[{...disc(-2,3,.9),bumper:true},{...disc(2,0,.9),bumper:true},{...disc(-2,-4,.9),bumper:true},{...disc(3,-7,.65),bumper:true}],zones:[]},
 {name:'Tidal Window',par:3,tip:'The opening moves from side to side. Time your putt through the gap.',start:{x:0,z:10},cup:{x:0,z:-10},outline,walls:[],discs:[],gates:[{z:0,width:3.6,travel:3,rate:.6,phase:0}],zones:[]},
 {name:'Lotus Lagoon',par:3,tip:'The lily pond is a hazard. Stay dry by taking either side.',start:{x:-3,z:10},cup:{x:3,z:-10},outline,walls:[],discs:[disc(3,5,.6)],hazards:[{x:0,z:-1,rx:2.7,rz:4}],zones:[]},
 {name:'Starstream',par:3,tip:'The arrow lane gives a forward push. The cup needs a softer finish.',start:{x:0,z:10},cup:{x:-3,z:-10},outline,walls:[wall(0,-5,6,-5)],discs:[disc(-3,-1,.8)],zones:[{...rect(1,3,3,7,'boost'),dx:0,dz:-1}]},
 {name:'The Observatory',par:3,tip:'The sloping green pulls toward the central bowl. Read its moving specks.',start:{x:-3,z:10},cup:{x:1,z:-9},outline,walls:[],discs:[disc(0,3,1),disc(-3,-4,.75),disc(3,-3,.75)],slope:true,zones:[]},
 {name:'Twin Pendulums',par:4,tip:'Two paddles turn in opposite directions. Patience is part of the shot.',start:{x:-3,z:10},cup:{x:3,z:-10},outline,walls:[],discs:[],rotors:[{x:-1.8,z:3,length:5.4,rate:.58,phase:.4},{x:1.8,z:-4,length:5.4,rate:-.7,phase:.9}],zones:[rect(-4,-7,3,4,'sand')]},
 {name:'The Last Lantern',par:4,tip:'A moving window, a portal shortcut, and one final bank toward home.',start:{x:-3,z:10},cup:{x:3,z:-10},outline,walls:[wall(-6,-6,0,-6)],discs:[{...disc(2,-3,.8),bumper:true}],gates:[{z:2,width:4.4,travel:2.5,rate:.4,phase:.8}],portals:[{x:-3,z:-1,to:1},{x:-3,z:-10,to:0}],zones:[rect(3,6,3,3,'ice')]}
];
export const MINI_RADIUS=.19;
export function inPolygon(x,z,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function zoneAt(x,z,h){return (h.zones??[]).find(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2)||null;}
export function miniGradient(x,z,h){if(!h.slope)return {x:0,z:0};return {x:.025*Math.sin((x-1)*.4),z:.018*Math.sin((z+4)*.25)};}
export function miniHeight(x,z,h){if(!h.slope)return 0;return -.0625*Math.cos((x-1)*.4)-.072*Math.cos((z+4)*.25)+.135;}
export function movingWalls(h,t){const result=[];for(const r of h.rotors??[]){const a=t*r.rate+r.phase,dx=Math.cos(a)*r.length/2,dz=Math.sin(a)*r.length/2;result.push({a:{x:r.x-dx,z:r.z-dz},b:{x:r.x+dx,z:r.z+dz},rotor:r});}for(const g of h.gates??[]){const mid=Math.sin(t*g.rate+g.phase)*g.travel;result.push({...wall(-6,g.z,mid-g.width/2,g.z),gate:g},{...wall(mid+g.width/2,g.z,6,g.z),gate:g});}return result;}
export function newMiniRound(weather='dusk',count=12,practice=null){const h=practice??0,c=MINI_HOLES[h]??MINI_HOLES[0];return {version:1,hole:h,count:count===6?6:12,practice:practice!==null,weather:MINI_WEATHER[weather]?weather:'dusk',recordWeather:MINI_WEATHER[weather]?weather:'dusk',card:[],strokes:0,penalties:0,x:c.start.x,z:c.start.z,vx:0,vz:0,time:0,moving:false,done:false,complete:false,recorded:false};}
export function normalizeMiniSave(value){if(!value||value.version!==1||!Number.isInteger(value.hole)||value.hole<0||value.hole>=MINI_HOLES.length)return newMiniRound();const s={...newMiniRound(),...value};s.weather=MINI_WEATHER[s.weather]?s.weather:'dusk';s.count=s.count===6?6:12;s.x=Number.isFinite(s.x)?s.x:MINI_HOLES[s.hole].start.x;s.z=Number.isFinite(s.z)?s.z:MINI_HOLES[s.hole].start.z;s.vx=Number.isFinite(s.vx)?s.vx:0;s.vz=Number.isFinite(s.vz)?s.vz:0;s.card=Array.isArray(s.card)?s.card.slice(0,12):[];return s;}
export function nextMiniHole(s){if(s.practice)return newMiniRound(s.weather,12,s.hole);if(s.hole+1>=s.count)return {...s,complete:true,done:true};const h=MINI_HOLES[s.hole+1];return {...s,hole:s.hole+1,x:h.start.x,z:h.start.z,vx:0,vz:0,strokes:0,penalties:0,time:0,moving:false,done:false,card:[...s.card,s.strokes]};}
export const miniScore=(strokes,par)=>strokes===1?'Ace!':strokes<par-1?'Eagle':strokes===par-1?'Birdie':strokes===par?'Par':strokes===par+1?'Bogey':`${strokes-par} over par`;
