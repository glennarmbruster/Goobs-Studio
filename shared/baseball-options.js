export const teams=[
 {id:'coasters',name:'Coasters',short:'CST',color:0x244a71,css:'#244a71'},
 {id:'mariners',name:'Mariners',short:'MAR',color:0x158c99,css:'#158c99'},
 {id:'foxes',name:'Red Foxes',short:'FOX',color:0xba3c38,css:'#ba3c38'},
 {id:'suns',name:'Golden Suns',short:'SUN',color:0xc39428,css:'#c39428'}
];
export const stadiums=[
 {id:'coast',name:'Coasters Field',tag:'Classic night baseball',radius:115,height:4.2,sky:0x182c48,wall:0x143f4b,seats:0x638fa0,light:1.1},
 {id:'harbor',name:'Harbor Park',tag:'Shorter fence · sunset waterfront',radius:105,height:3.3,sky:0x6e6982,wall:0x375f68,seats:0x537e86,light:1.55},
 {id:'foundry',name:'Foundry Grounds',tag:'Deep outfield · tall brick wall',radius:125,height:6.2,sky:0x131d31,wall:0x704b42,seats:0x74574d,light:1.2}
];
export function baseballOptions(raw={}){const home=teams.find(t=>t.id===raw.home)||teams[0];let away=teams.find(t=>t.id===raw.away)||teams[1];if(home.id===away.id)away=teams.find(t=>t.id!==home.id);return {home:home.id,away:away.id,stadium:(stadiums.find(s=>s.id===raw.stadium)||stadiums[0]).id,mode:['derby','batting','pitching'].includes(raw.mode)?raw.mode:'match'}}
export const newDerby=()=>({half:'bat',inning:1,innings:1,outs:0,strikes:0,balls:0,runs:0,cpu:0,bases:[false,false,false],pitches:0,line:[],complete:false,attempts:0,homers:0,longest:0,totalDistance:0});
export function derbyResult(state,{homeRun=false,distance=0}={}){return {...state,attempts:state.attempts+1,homers:state.homers+(homeRun?1:0),longest:Math.max(state.longest,Math.round(distance)),totalDistance:state.totalDistance+Math.round(distance),bases:[false,false,false],strikes:0,balls:0,outs:0,complete:state.attempts+1>=10}}
export const derbyRecordKey=options=>'baseball:derby:best:'+options.home+':'+options.stadium;
export function betterDerby(a,b){return !b||a.homers>b.homers||a.homers===b.homers&&a.longest>b.longest}

export const baseballSaveKey=mode=>mode==='match'?'baseball':'baseball:'+mode;
