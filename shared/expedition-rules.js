import {clamp} from './core.js';
export const ALPHA_VERSION='0.5';
export const deepMissions=[
 {name:'The Sunken Observatory',color:0x063d50,seed:1,sites:[[-24,9,-38],[22,15,-77],[-17,7,-118],[28,20,-160],[0,12,-202]],current:.35},
 {name:'Sapphire Trench',color:0x092c4c,seed:3,sites:[[30,20,-42],[-30,9,-82],[20,24,-123],[-27,6,-173],[0,18,-213]],current:.8},
 {name:'The Silent Archive',color:0x152a42,seed:6,sites:[[-30,18,-45],[29,7,-83],[0,25,-126],[-32,11,-173],[24,16,-215]],current:1.2}
];
export const seabed=(x,z)=>-2+Math.sin(x*.08)*1.5+Math.cos(z*.06)*1.2;
export const deepRocks=mission=>Array.from({length:18},(_,i)=>({x:Math.sin(i*2.17+mission)*43,y:1.8,z:-26-i*11,r:3+(i%3)}));
export function freshDeep(mission=0){return {mission,x:0,y:12,z:9,vx:0,vy:0,vz:0,hull:100,oxygen:300,collected:[],scan:0,hit:0,time:0,done:false,failed:false}}
export function deepStep(s,dt,input={}){
 s={...s,collected:[...s.collected]};if(s.done||s.failed)return s;
 const m=deepMissions[s.mission],n=Math.ceil(dt*120),h=dt/n;
 for(let i=0;i<n;i++){
  s.time+=h;s.hit=Math.max(0,s.hit-h);s.oxygen=Math.max(0,s.oxygen-h*(input.boost?1.7:1));
  const ix=clamp(input.x??0,-1,1),iz=clamp(input.z??0,-1,1),length=Math.max(1,Math.hypot(ix,iz)),speed=input.boost?13:8;
  s.vx+=(ix/length*speed+Math.sin(s.time*.3)*m.current-s.vx)*(1-Math.exp(-h*3));s.vz+=(iz/length*speed-s.vz)*(1-Math.exp(-h*3));s.vy+=((input.y??0)*5-s.vy)*(1-Math.exp(-h*3));
  s.x=clamp(s.x+s.vx*h,-60,60);s.z=clamp(s.z+s.vz*h,-235,25);s.y=clamp(s.y+s.vy*h,seabed(s.x,s.z)+2,29);
  for(const r of deepRocks(s.mission)){const dx=s.x-r.x,dy=s.y-r.y,dz=s.z-r.z,d=Math.hypot(dx,dy,dz),limit=r.r+1.5;if(d<limit){const scale=(limit-d)/(d||1);s.x+=dx*scale;s.y+=dy*scale;s.z+=dz*scale;if(!s.hit){s.hull-=Math.min(18,4+Math.hypot(s.vx,s.vy,s.vz));s.hit=1.3}s.vx*=.4;s.vz*=.4}}
  const site=m.sites.findIndex((p,j)=>!s.collected.includes(j)&&Math.hypot(s.x-p[0],s.y-p[1],s.z-p[2])<9);
  if(input.scan&&site>=0&&Math.hypot(s.vx,s.vy,s.vz)<4){s.scan+=h;if(s.scan>=1.5){s.collected.push(site);s.scan=0}}else s.scan=0;
  if(Math.hypot(s.x,s.z-9)<9){s.oxygen=Math.min(300,s.oxygen+h*24);s.hull=Math.min(100,s.hull+h*8);if(s.collected.length===m.sites.length)s.done=true}
  s.failed=s.oxygen<=0||s.hull<=0;
 }
 return s;
}

export const pinSegments=[[-9,-17,-9,12],[9,-17,9,18],[-9,-17,9,-17],[-9,12,-4.6,17],[7.4,-13,7.4,14],[7.4,14,4.6,17],[-7,-9,-4,-12],[4,-12,6.6,-8],[-8,8,-6,12],[6,12,7,8]];
export const pinBumpers=[[-3,-7,1.35],[2.7,-8.5,1.35],[0,-3.8,1.2]];
export const freshPin=()=>({balls:[],remaining:3,score:0,combo:1,targets:[false,false,false],locks:0,missions:0,charge:0,serve:true,done:false,time:0,save:0,cooldown:0,nudges:0,tilt:0,left:0,right:0,last:0});
export function launchPin(s,power=.8){if(!s.serve||s.done)return s;return {...s,serve:false,balls:[{x:8.15,z:15,vx:-.3,vz:-27-power*15,hit:0,ramp:0}],save:10,charge:0}}
function segmentHit(b,ax,az,bx,bz,r=.45,restitution=.82){
 const dx=bx-ax,dz=bz-az,t=clamp(((b.x-ax)*dx+(b.z-az)*dz)/(dx*dx+dz*dz||1),0,1),x=ax+t*dx,z=az+t*dz,nx=b.x-x,nz=b.z-z,d=Math.hypot(nx,nz);
 if(d>=r)return false;const ux=d>1e-6?nx/d:1,uz=d>1e-6?nz/d:0;b.x=x+ux*r;b.z=z+uz*r;const dot=b.vx*ux+b.vz*uz;if(dot<0){b.vx-=(1+restitution)*dot*ux;b.vz-=(1+restitution)*dot*uz}return true;
}
export function pinStep(source,dt,input={}){
 const s={...source,balls:source.balls.map(b=>({...b})),targets:[...source.targets]};if(s.done)return s;const n=Math.ceil(dt*240),h=dt/n;
 for(let step=0;step<n;step++){
  s.time+=h;s.save=Math.max(0,s.save-h);s.cooldown=Math.max(0,s.cooldown-h);s.tilt=Math.max(0,s.tilt-h);s.nudges=Math.max(0,s.nudges-h*.22);
  for(const side of ['left','right'])s[side]+=(Number(!!input[side]&&!s.tilt)-s[side])*(1-Math.exp(-h*25));
  const add=[];
  for(const b of s.balls){
   b.hit=Math.max(0,b.hit-h);
   if(b.ramp>0){b.ramp+=h;if(b.ramp>1.6){b.ramp=0;b.x=-5.5;b.z=4;b.vx=1.5;b.vz=10}else continue}
   b.vz+=6.2*h;b.vx*=Math.exp(-.035*h);b.vz*=Math.exp(-.035*h);b.x+=b.vx*h;b.z+=b.vz*h;
   for(const line of pinSegments)segmentHit(b,...line);
   // The plunger's curved lane feeds left into the main playfield.
   if(b.z< -14&&b.x>6.8){b.vx=-17;b.vz=Math.max(b.vz,-9)}
   for(const [x,z,r]of pinBumpers){const dx=b.x-x,dz=b.z-z,d=Math.hypot(dx,dz);if(d<r+.45){const ux=dx/(d||1),uz=dz/(d||1);b.x=x+ux*(r+.46);b.z=z+uz*(r+.46);b.vx=ux*19;b.vz=uz*19;if(!b.hit){s.score+=100*s.combo;b.hit=.12;s.last=s.time}}}
   for(let i=0;i<3;i++){const x=-4+i*4;if(Math.abs(b.x-x)<1.3&&b.z< -15.6){b.z=-15.5;b.vz=Math.abs(b.vz);if(!s.targets[i]){s.targets[i]=true;s.score+=300*s.combo}}}
   if(s.targets.every(Boolean)){s.targets=[false,false,false];s.missions++;s.combo=Math.min(5,s.combo+1);s.score+=2000;s.save=12;add.push({x:-3,z:-10,vx:4,vz:4,hit:0,ramp:0});}
   // Left orbit ramp capture; animation follows the same bounded rail path.
   if(b.x< -6.2&&b.z< -11&&b.vz< -4){b.ramp=.001;s.locks++;s.score+=750*s.combo;if(s.locks%2===0){add.push({x:3,z:-12,vx:-4,vz:3,hit:0,ramp:0});s.save=10}}
   for(const [side,sign]of [['left',-1],['right',1]]){
    const pivotX=sign*4.5,pivotZ=15.3,angle=.4-s[side]*.93,tipX=pivotX-sign*Math.cos(angle)*3.8,tipZ=pivotZ+Math.sin(angle)*3.8;
    if(segmentHit(b,pivotX,pivotZ,tipX,tipZ,.72,.7)&&input[side]&&!s.tilt){b.vz=-22-10*s[side];b.vx=-sign*(4+Math.abs(b.x)*.65);s.last=s.time}
   }
   const speed=Math.hypot(b.vx,b.vz);if(speed>48){b.vx*=48/speed;b.vz*=48/speed}
  }
  s.balls.push(...add.slice(0,Math.max(0,3-s.balls.length)));
  const alive=s.balls.filter(b=>b.z<20);if(alive.length<s.balls.length&&s.save>0&&alive.length===0)alive.push({x:8.15,z:15,vx:0,vz:-36,hit:0,ramp:0});s.balls=alive;
  if(!s.balls.length&&!s.serve){s.remaining--;s.combo=1;if(s.remaining<=0){s.remaining=0;s.done=true;break}else s.serve=true}
 }
 return s;
}
export function nudgePin(s,dx=1){if(s.cooldown||s.serve||s.done)return s;return {...s,cooldown:.5,nudges:s.nudges+1,tilt:s.nudges>=2?4:s.tilt,balls:s.balls.map(b=>({...b,vx:b.vx+dx*3,vz:b.vz-3}))}}

export const harborTypes={road:{name:'Promenade',cost:8,power:0,jobs:0,people:0,income:0},house:{name:'Homes',cost:65,power:1,jobs:0,people:12,income:3},cafe:{name:'Café',cost:100,power:2,jobs:8,people:0,income:13},fish:{name:'Fishing pier',cost:130,power:2,jobs:10,people:0,income:20,coast:true},park:{name:'Gardens',cost:45,power:0,jobs:0,people:0,income:0},solar:{name:'Solar works',cost:110,power:-12,jobs:3,people:0,income:-3},ferry:{name:'Ferry terminal',cost:200,power:4,jobs:12,people:0,income:28,coast:true}};
export const harborLand=(x,z)=>x>=0&&x<12&&z>=0&&z<10&&!(x<2&&z<3)&&!(x>9&&z<2);
export const harborCoast=(x,z)=>harborLand(x,z)&&!harborLand(x,z-1);
export function freshHarbor(){return {cash:650,day:1,clock:0,cells:[{x:5,z:4,type:'hall'},{x:5,z:3,type:'road'},{x:5,z:2,type:'road'},{x:5,z:1,type:'road'},{x:5,z:0,type:'road'}],goal:0,claimed:[],done:false}}
export function harborNetwork(s){
 const connected=new Set(['5,4']),queue=[[5,4]],road=new Set(s.cells.filter(c=>c.type==='road').map(c=>c.x+','+c.z));
 while(queue.length){const [x,z]=queue.shift();for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const key=(x+dx)+','+(z+dz);if(road.has(key)&&!connected.has(key)){connected.add(key);queue.push([x+dx,z+dz])}}}
 const active=s.cells.filter(c=>c.type==='hall'||connected.has(c.x+','+c.z)||[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>connected.has((c.x+dx)+','+(c.z+dz))));
 let capacity=8,demand=0,people=0,jobs=0,income=0,parks=0,ferries=0;for(const c of active){const t=harborTypes[c.type];if(!t)continue;if(t.power<0)capacity-=t.power;else demand+=t.power;if(c.type==='park')parks++;people+=t.people;jobs+=t.jobs;income+=t.income;if(c.type==='ferry')ferries++}
 const powered=demand<=capacity,happiness=clamp(65+parks*8-Math.max(0,people-jobs*2)*.4-(powered?0:30),10,100);
 return {connected,active,capacity,demand,people,jobs,parks,ferries,happiness,powered,income:Math.max(5,Math.round((income+8)*(powered?1:.35)*(.6+happiness/250)))};
}
export function harborBuild(s,x,z,type){
 const t=harborTypes[type];if(!t)return {state:s,error:'Choose a building'};if(!harborLand(x,z))return {state:s,error:'Build on the island'};if(s.cells.some(c=>c.x===x&&c.z===z))return {state:s,error:'This plot is occupied'};if(t.coast&&!harborCoast(x,z))return {state:s,error:'This building needs a waterfront plot'};if(s.cash<t.cost)return {state:s,error:'Not enough funds'};
 return {state:{...s,cash:s.cash-t.cost,cells:[...s.cells,{x,z,type}]},error:null};
}
export function harborDemolish(s,x,z){const c=s.cells.find(c=>c.x===x&&c.z===z);if(!c||c.type==='hall')return s;return {...s,cash:s.cash+Math.floor(harborTypes[c.type].cost*.5),cells:s.cells.filter(p=>p!==c)}}
export const harborGoals=[{text:'Connect 24 residents and a café',reward:180,check:(s,n)=>n.people>=24&&n.active.some(c=>c.type==='cafe')},{text:'Power 48 residents and two gardens',reward:260,check:(s,n)=>n.people>=48&&n.parks>=2&&n.powered},{text:'Open a ferry and reach 72 residents',reward:350,check:(s,n)=>n.people>=72&&n.ferries>0&&n.powered},{text:'Reach 96 residents, 80 happiness and 50 daily income',reward:500,check:(s,n)=>n.people>=96&&n.happiness>=80&&n.income>=50&&n.powered}];
export function harborStep(s,dt){s={...s,clock:s.clock+dt,claimed:[...s.claimed]};while(s.clock>=12){s.clock-=12;s.day++;s.cash+=harborNetwork(s).income}const n=harborNetwork(s);while(s.goal<harborGoals.length&&harborGoals[s.goal].check(s,n)){s.cash+=harborGoals[s.goal].reward;s.claimed.push(s.goal);s.goal++}s.done=s.goal===harborGoals.length;return s}

export const commandMaps=[
 {name:'Breakwater',nodes:[[-24,17,0,60],[-23,-11,2,16],[0,4,2,12],[24,16,1,30],[23,-15,1,22],[0,-25,2,18]],links:[[0,1],[0,2],[1,2],[1,5],[2,3],[2,4],[3,4],[4,5]]},
 {name:'The Causeways',nodes:[[-27,22,0,68],[-28,-5,2,20],[-3,13,2,18],[0,-16,1,25],[28,22,1,28],[28,-10,1,35],[-15,-32,2,15]],links:[[0,1],[0,2],[1,3],[1,6],[2,3],[2,4],[3,5],[3,6],[4,5]]},
 {name:'Citadel Reach',nodes:[[-30,25,0,76],[-30,-5,2,18],[0,20,2,20],[0,-4,1,30],[30,25,1,30],[30,-7,1,38],[0,-32,1,45]],links:[[0,1],[0,2],[1,3],[1,6],[2,3],[2,4],[3,4],[3,5],[3,6],[4,5],[5,6]]}
];
export const freshCommand=(mission=0)=>({mission,nodes:commandMaps[mission].nodes.map(([x,z,owner,troops],id)=>({x,z,owner,troops,id,level:1})),squads:[],clock:0,ai:12,cooldown:0,shots:[],done:false,failed:false});
export function commandSend(s,from,to,fraction=.5){
 const a=s.nodes[from],b=s.nodes[to];if(!a||!b||a.owner!==0||s.done||s.failed||s.squads.length>=36||!commandMaps[s.mission].links.some(([x,y])=>(x===from&&y===to)||(x===to&&y===from)))return s;const count=Math.floor(a.troops*fraction);if(count<2)return s;
 return {...s,nodes:s.nodes.map(n=>n.id===from?{...n,troops:n.troops-count}:n),squads:[...s.squads,{from,to,owner:0,count,progress:0}]};
}
export function commandUpgrade(s,id){const n=s.nodes[id];if(!n||n.owner!==0||n.level>=3||n.troops<20)return s;return {...s,nodes:s.nodes.map(v=>v.id===id?{...v,troops:v.troops-20,level:v.level+1}:v)}}
export function commandArtillery(s,id){if(s.cooldown||s.nodes[id]?.owner!==1||s.done||s.failed)return s;const supply=s.nodes.find(n=>n.owner===0&&n.troops>=15);if(!supply)return s;return {...s,cooldown:22,nodes:s.nodes.map(n=>n.id===supply.id?{...n,troops:n.troops-15}:n.id===id?{...n,troops:Math.max(1,n.troops-18)}:n),shots:[...s.shots,{from:supply.id,to:id,t:0}]}}
export function commandStep(s,dt){
 if(s.done||s.failed)return s;s={...s,nodes:s.nodes.map(n=>({...n})),squads:s.squads.map(q=>({...q})),shots:s.shots.map(q=>({...q})),clock:s.clock+dt,ai:s.ai-dt,cooldown:Math.max(0,s.cooldown-dt)};
 for(const n of s.nodes)if(n.owner!==2)n.troops=Math.min(99,n.troops+dt*(n.owner===0?.9:.26+s.mission*.06)*n.level);
 for(const q of s.squads){const a=s.nodes[q.from],b=s.nodes[q.to];q.progress+=dt*10/Math.hypot(b.x-a.x,b.z-a.z);if(q.progress>=1){if(b.owner===q.owner)b.troops=Math.min(99,b.troops+q.count);else{b.troops-=q.count/(1+(b.level-1)*.15);if(b.troops<0){b.owner=q.owner;b.troops=Math.abs(b.troops);b.level=1}}}}
 s.squads=s.squads.filter(q=>q.progress<1);
 if(s.ai<=0&&s.squads.length<36){s.ai=7.5-s.mission*.5;const candidates=s.nodes.filter(n=>n.owner===1&&n.troops>12).sort((a,b)=>b.troops-a.troops);for(const a of candidates){const neighbors=commandMaps[s.mission].links.filter(l=>l.includes(a.id)).map(l=>s.nodes[l.find(id=>id!==a.id)]).filter(b=>b.owner!==1).sort((a,b)=>a.troops-b.troops);if(neighbors.length){const b=neighbors[0],count=Math.floor(a.troops*.65);a.troops-=count;s.squads.push({from:a.id,to:b.id,owner:1,count,progress:0});break}}}
 for(const q of s.shots)q.t+=dt;s.shots=s.shots.filter(q=>q.t<1.2);
 s.done=s.nodes.every(n=>n.owner!==1)&&!s.squads.some(q=>q.owner===1);s.failed=s.nodes.every(n=>n.owner!==0)&&!s.squads.some(q=>q.owner===0);return s;
}

// Marble levels use axis-aligned platforms and walls so art and collisions share dimensions.
export const marbleLevels=[
 {name:'Clockwork Garden',start:[-13,15],goal:[14,-18],platforms:[[-10,11,14,18],[1,5,12,7],[10,-2,8,20],[13,-16,14,10]],walls:[[-17,11,1,18],[-10,20,14,1],[-7,2,5,1],[6,-2,1,14],[18,-14,1,14]],stars:[[-13,7],[1,5],[10,-6],[13,-15]],checkpoints:[[1,5],[10,-7]],gears:[[10,1,2.2]],magnet:[10,-7],water:[]},
 {name:'The Waterworks',start:[-14,17],goal:[13,-20],platforms:[[-11,14,14,12],[0,9,15,5],[10,0,7,23],[0,-10,19,6],[-7,-17,6,12],[5,-22,24,6]],walls:[[-18,15,1,13],[-11,20,14,1],[14,0,1,23],[-11,-17,1,13],[5,-26,24,1]],stars:[[-12,12],[10,4],[1,-10],[-7,-19],[13,-22]],checkpoints:[[10,8],[-7,-13]],gears:[[0,9,1.6],[4,-10,1.8]],magnet:[-7,-16],water:[[10,0,7,12]]},
 {name:'The Astrarium',start:[-13,19],goal:[12,-25],platforms:[[-11,16,13,12],[0,11,16,6],[10,2,6,22],[0,-7,21,7],[-10,-15,6,20],[1,-24,28,7]],walls:[[-18,16,1,13],[-11,22,13,1],[14,3,1,22],[-14,-15,1,20],[1,-28,28,1]],stars:[[-12,14],[-3,11],[10,-2],[-8,-7],[-10,-19],[12,-24]],checkpoints:[[10,8],[-10,-12]],gears:[[1,11,1.6],[0,-7,1.7],[-10,-17,1.6]],magnet:[10,-3],water:[[0,-7,12,5]]}
];
const inRect=(x,z,[cx,cz,w,d],margin=0)=>Math.abs(x-cx)<=w/2+margin&&Math.abs(z-cz)<=d/2+margin;
export const freshMarble=(level=0)=>({level,x:marbleLevels[level].start[0],z:marbleLevels[level].start[1],vx:0,vz:0,stars:[],checkpoint:-1,falls:0,time:0,fall:0,done:false});
export function marbleStep(s,dt,input={}){
 s={...s,stars:[...s.stars]};if(s.done)return s;const l=marbleLevels[s.level],n=Math.ceil(dt*120),h=dt/n;
 for(let j=0;j<n;j++){
  s.time+=h;if(s.fall>0){s.fall+=h;if(s.fall>=1){const p=s.checkpoint>=0?l.checkpoints[s.checkpoint]:l.start;s.x=p[0];s.z=p[1];s.vx=s.vz=0;s.fall=0}continue}
  const wet=l.water.some(r=>inRect(s.x,s.z,r)),drag=input.brake?7:wet?1.6:.65,ix=clamp(input.x??0,-1,1),iz=clamp(input.z??0,-1,1),length=Math.max(1,Math.hypot(ix,iz));
  s.vx=(s.vx+ix/length*12*h)*Math.exp(-drag*h);s.vz=(s.vz+iz/length*12*h)*Math.exp(-drag*h);
  if(input.magnet&&Math.hypot(s.x-l.magnet[0],s.z-l.magnet[1])<9){s.vx+=(l.magnet[0]-s.x)*h*2;s.vz+=(l.magnet[1]-s.z)*h*2}
  const speed=Math.hypot(s.vx,s.vz);if(speed>9){s.vx*=9/speed;s.vz*=9/speed}s.x+=s.vx*h;s.z+=s.vz*h;
  for(const [x,z,w,d]of l.walls){if(inRect(s.x,s.z,[x,z,w,d],.52)){const dx=(w/2+.52)-Math.abs(s.x-x),dz=(d/2+.52)-Math.abs(s.z-z);if(dx<dz){s.x=x+Math.sign(s.x-x||1)*(w/2+.52);s.vx*=-.45}else{s.z=z+Math.sign(s.z-z||1)*(d/2+.52);s.vz*=-.45}}}
  for(const [x,z,r]of l.gears){const dx=s.x-x,dz=s.z-z,d=Math.hypot(dx,dz);if(d<r+.5){const ux=dx/(d||1),uz=dz/(d||1);s.x=x+ux*(r+.51);s.z=z+uz*(r+.51);s.vx=ux*4-uz*2;s.vz=uz*4+ux*2}}
  if(!l.platforms.some(r=>inRect(s.x,s.z,r,.15))){s.falls++;s.fall=.001;continue}
  l.stars.forEach(([x,z],i)=>{if(!s.stars.includes(i)&&Math.hypot(s.x-x,s.z-z)<1.25)s.stars.push(i)});
  l.checkpoints.forEach(([x,z],i)=>{if(i>s.checkpoint&&Math.hypot(s.x-x,s.z-z)<1.5)s.checkpoint=i});
  if(s.stars.length===l.stars.length&&Math.hypot(s.x-l.goal[0],s.z-l.goal[1])<1.6&&Math.hypot(s.vx,s.vz)<3)s.done=true;
 }
 return s;
}
