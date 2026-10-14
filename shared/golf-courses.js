export const golfCourses=[
 {name:'Cypress Point',elevation:2,par:4,length:169,x:-9,wind:{x:1.8,z:.3}},
 {name:'Lighthouse Cove',elevation:-1,par:3,length:104,x:6,wind:{x:-1.2,z:.6}},
 {name:'The Dunes',elevation:3,par:4,length:192,x:-13,wind:{x:2.4,z:-.6}},
 {name:'Smuggler’s Bend',elevation:5,par:5,length:224,x:-18,bend:-13,width:10,wind:{x:-2.2,z:.4},bunkers:[[-6,-112,5,8,2],[-27,-210,5,8,4],[2,-222,5,7,1]]},
 {name:'Heron Bay',elevation:-2,par:3,length:138,x:10,bend:14,width:9,wind:{x:1.1,z:-1.5},bunkers:[[-4,-126,5,9,3],[23,-140,5,8,1]]},
 {name:'North Head',elevation:7,par:5,length:242,x:-8,bend:8,width:10,wind:{x:2.8,z:1.2},bunkers:[[-11,-104,5,7,1],[20,-163,6,10,4],[-23,-229,5,8,2]]}
];
export function fairwayAt(z,course){const scale=course.length/169,i=-z/(4.5*scale),t=Math.max(0,-z/course.length),bend=course.bend??10;return {center:Math.sin(i*.12)*bend+(course.bend===undefined?0:course.x*t*t*.7),width:(course.width??12)+Math.sin(i*.2)*3}}
export const freshGolf=()=>({x:0,z:4,strokes:0,done:false,hole:0,card:[]});
export function advanceGolf(state){const next=(state.hole??0)+1;return {...freshGolf(),...(state.weather?{weather:state.weather}:{}),hole:next<golfCourses.length?next:0,card:next<golfCourses.length?[...(state.card??[]),state.strokes]:[]}}
export const roundRelative=card=>card.reduce((sum,n,i)=>sum+n-golfCourses[i].par,0);
