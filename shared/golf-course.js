// Course geometry is shared by rendering, lie detection, physics and the hole map.
export const GOLF_COURSES=[
 {name:'Cypress Point',par:4,length:169,x:-9,wind:{x:1.8,z:.3},bend:10,slope:[.018,-.012],theme:'morning',note:'A generous opening fairway. Favor the left side on your approach.'},
 {name:'Lighthouse Cove',par:3,length:104,x:6,wind:{x:-1.2,z:.6},bend:10,slope:[-.024,.008],theme:'morning',note:'One clean iron to a green guarded by two coastal bunkers.'},
 {name:'The Dunes',par:4,length:192,x:-13,wind:{x:2.4,z:-.6},bend:10,slope:[.022,.015],theme:'morning',note:'A following breeze rewards a confident drive. Leave room for rollout.'},
 {name:'Heron Bay',par:3,length:119,x:10,wind:{x:-1.8,z:-.5},bend:-7,slope:[-.018,-.018],theme:'day',note:'A short hole with a green falling toward the water.'},
 {name:'Saltwind Reach',par:5,length:278,x:-6,wind:{x:2.7,z:1.1},bend:15,slope:[.015,-.016],theme:'day',note:'Three measured shots can beat two ambitious ones into a headwind.'},
 {name:'Smuggler’s Bend',par:4,length:201,x:8,wind:{x:-2.2,z:.3},bend:-12,slope:[.025,.008],theme:'day',note:'Follow the dogleg. The sandy shoulder punishes a shortcut.'},
 {name:'Pelican Bluff',par:3,length:132,x:-11,wind:{x:1.2,z:-1.1},bend:8,slope:[-.028,.012],theme:'sunset',note:'An elevated green and a crosswind make club choice matter.'},
 {name:'Golden Strand',par:5,length:292,x:5,wind:{x:-1.6,z:-.8},bend:-14,slope:[.017,.023],theme:'sunset',note:'The longest hole on the coast. Use the tailwind and find the fairway.'},
 {name:'Homeward Light',par:4,length:216,x:-8,wind:{x:.7,z:.5},bend:12,slope:[-.021,-.012],theme:'sunset',note:'Finish beside the clubhouse, with a final putt under the evening sky.'}
];
export function fairwayProfile(z,c){const scale=c.length/169,i=-z/(4.5*scale);return {center:Math.sin(i*.12)*(c.bend??10),width:12+Math.sin(i*.2)*3};}
export function courseBunkers(c){const base=[[c.x-15,(-147/169)*c.length,6,9,1],[c.x+17,(-166/169)*c.length,5,10,3]];if(c.length>240)base.push([-13,-c.length*.47,6,13,2]);if(c.name==='Smuggler’s Bend')base.push([8,-95,7,12,4]);return base;}
export function golfSurface(x,z,c){for(const [bx,bz,rx,rz,seed]of courseBunkers(c)){const dx=(x-bx)/rx,dz=-(z-bz)/rz,a=Math.atan2(dz,dx),r=1+.13*Math.sin(a*3+seed)+.06*Math.cos(a*5);if(Math.hypot(dx,dz)<r)return 'sand';}const gx=x-c.x,gz=-(z+c.length)/1.25,a=Math.atan2(gz,gx);if(Math.hypot(gx,gz)<12+Math.sin(a*3)*.65)return 'green';const {center,width}=fairwayProfile(z,c);return z<=8&&z>=-c.length-14&&Math.abs(x-center)<width?'fairway':'rough';}
export function terrainHeight(x,z,c){
 const dx=x-c.x,dz=z+c.length,falloff=Math.exp(-(dx*dx/600+dz*dz/900));
 const slope=c.slope??[0,0],rolling=.28*Math.sin(z/36)+.16*Math.sin(x/19+z/70);
 const mound=(c.name==='Pelican Bluff'?1.8:.65)*falloff;
 return rolling+mound+(dx*slope[0]+dz*slope[1])*falloff;
}
export function terrainSlope(x,z,c){const d=.2;return {x:(terrainHeight(x+d,z,c)-terrainHeight(x-d,z,c))/(2*d),z:(terrainHeight(x,z+d,c)-terrainHeight(x,z-d,c))/(2*d)};}
export function isOutOfBounds(x,z,c){return x>39||x<-65||z>55||z<-c.length-55;}
export function autoClub(distance,lie){return lie==='sand'?'wedge':distance<11?'putter':distance<45?'wedge':distance<100?'iron':'driver';}
export function newGolfRound(roundLength=9){return {x:0,z:4,strokes:0,done:false,hole:0,card:[],roundLength:roundLength===3?3:9,putts:0,penalties:0,holeStats:[]};}
export function normalizeGolfSave(input){if(!input)return newGolfRound();const count=input.roundLength===9?9:3;return {...newGolfRound(count),...input,roundLength:count,hole:Math.max(0,Math.min(count-1,Number(input.hole)||0)),card:Array.isArray(input.card)?input.card:[],holeStats:Array.isArray(input.holeStats)?input.holeStats:[]};}
export function nextGolfHole(s){const hole=s.hole+1;if(hole>=s.roundLength)return {...s,done:true,roundComplete:true};return {...newGolfRound(s.roundLength),hole,card:[...s.card,s.strokes],holeStats:[...s.holeStats,{putts:s.putts||0,penalties:s.penalties||0}]};}
export function relativeScore(strokes,par){const n=strokes-par;return n===0?'E':n>0?'+'+n:String(n);}

export function golfScoreLabel(strokes,par){if(strokes===1)return 'Hole in one!';const d=strokes-par;return d<=-3?'Albatross':d===-2?'Eagle':d===-1?'Birdie':d===0?'Par':d===1?'Bogey':d===2?'Double bogey':d===3?'Triple bogey':d+' over par';}
