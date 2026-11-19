import {clamp,advanceRunners} from './core.js';
import {walkRunners} from './handling.js';
import {newBaseballGame,recordRuns} from './baseball-match.js';

export const DIFFICULTIES={
 relaxed:{label:'Relaxed',pace:1.22,window:.32,cpu:.38},
 club:{label:'Club',pace:1,window:.25,cpu:.52},
 allstar:{label:'All-Star',pace:.85,window:.20,cpu:.65}
};
export const PITCHES={fastball:{name:'Fastball',mph:94,time:1.08},slider:{name:'Slider',mph:85,time:1.21},curve:{name:'Curveball',mph:77,time:1.38},changeup:{name:'Changeup',mph:81,time:1.30}};
const blankStats=()=>({hits:0,atBats:0,walks:0,strikeouts:0,homeRuns:0,pitches:0,strikes:0});
export function prepareMatch(input={},difficulty='club'){
 const s={...newBaseballGame(input.innings),...input};
 s.difficulty=DIFFICULTIES[s.difficulty]?s.difficulty:difficulty;
 s.stats={home:{...blankStats(),...input.stats?.home},away:{...blankStats(),...input.stats?.away}};
 s.recent=Array.isArray(input.recent)?input.recent.slice(-8):[];
 s.seed=(input.seed>>>0)||((Date.now()^Math.floor(Math.random()*0xffffffff))>>>0)||1;
 s.line=Array.isArray(s.line)?s.line:[];
 if(!s.line.length&&(s.runs||s.cpu))s.line[0]={home:s.runs,away:s.cpu};
 return s;
}
export function randomFor(s){let x=s.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;return s.seed/4294967296}
export function makePitch(s,{type='fastball',x=0,y=1.15,quality=1,practice=false}={}){
 const rand=()=>randomFor(s),human=s.half==='pitch'&&!practice;
 if(!human){type=practice?['fastball','fastball','changeup'][Math.floor(rand()*3)]:Object.keys(PITCHES)[Math.floor(rand()*4)];const outside=!practice&&rand()<.30;x=outside?(rand()<.5?-1:1)*(.78+rand()*.35):(rand()-.5)*(practice?.65:1.2);y=.68+rand()*.92;}
 else{const scatter=(1-quality)*.8+.025;x+= (rand()-.5)*scatter*2;y+=(rand()-.5)*scatter;}
 const p=PITCHES[type],mph=p.mph+Math.round(rand()*6-3),pace=DIFFICULTIES[s.difficulty].pace;
 return {type,x:clamp(x,-1.35,1.35),y:clamp(y,.25,2.05),quality,mph,duration:p.time*pace*(p.mph/mph),isStrike:Math.abs(x)<=.68&&y>=.52&&y<=1.78};
}
export function swingContact(delta,aim,pitch,style='contact',difficulty='club'){
 const window=DIFFICULTIES[difficulty].window*(style==='power'?.77:1.12),error=Math.abs(delta)/window;
 const reach=Math.max(0,Math.abs(pitch.x)-.55)*.32;
 if(error>1||Math.abs(pitch.x)>1.18)return {kind:'miss',timing:delta};
 if(error>.79)return {kind:'foul',timing:delta};
 const quality=clamp(1-error*.8-reach,0,1);
 // Direction is an intentional batting choice, with early swings pulling the ball.
 const angle=clamp(aim*.50-delta*1.5,-.75,.75);
 const loft=style==='power'?24+quality*10:delta<-.08?9+quality*7:15+quality*12;
 return {kind:'fair',quality:clamp(quality*(style==='power'?1.06:.92),.08,1),angle,loft,timing:delta,exitMph:Math.round((23+clamp(quality*(style==='power'?1.06:.92),0,1)*28)*2.237)};
}
export function cpuDecision(s,pitch,lastTypes=[]){
 const rand=()=>randomFor(s),skill=DIFFICULTIES[s.difficulty].cpu;
 const repeats=lastTypes.slice(-3).filter(t=>t===pitch.type).length;
 const swing=rand()<(pitch.isStrike?.72:.15+(1-pitch.quality)*.2);
 if(!swing)return {kind:pitch.isStrike?'strike':'ball'};
 const contactChance=clamp(.55+skill*.35-pitch.quality*.28+repeats*.10,.2,.88);
 if(rand()>contactChance)return {kind:'strike'};
 if(rand()<.18)return {kind:'foul'};
 const quality=clamp(.25+rand()*.55+skill*.15-pitch.quality*.18+repeats*.055,.15,.96);
 return {kind:'fair',quality,angle:(rand()-.5)*1.4,loft:rand()<.28?9:18+rand()*16,exitMph:Math.round((23+quality*28)*2.237)};
}
export function fieldOutcome(plan,state,rand=Math.random){
 const distance=Math.hypot(plan.target.x,plan.target.z);
 if(plan.homeRun)return {kind:'hit',bases:4,label:'HOME RUN'};
 if(plan.caught){if(state.outs<2&&state.bases[2]&&distance>48)return {kind:'sacrifice',label:'SACRIFICE FLY'};return {kind:'out',label:'FLY OUT'};}
 // A low ball must reach a defender before the batter reaches first to be an out.
 if(plan.groundOut){if(state.outs<2&&state.bases[0]&&plan.groundTime<2.4&&rand()<.5)return {kind:'doubleplay',label:'DOUBLE PLAY'};return {kind:'groundout',label:'GROUND OUT'};}
 const bases=distance>95&&!plan.wallHit&&rand()<.23?3:distance>65?2:1;
 return {kind:'hit',bases,label:bases===3?'TRIPLE':bases===2?'DOUBLE':'SINGLE'};
}
export function applyResult(s,result){
 const stat=s.stats[s.half==='bat'?'home':'away'],before=[...s.bases];let runs=0,outs=0;
 if(result.kind==='hit'){const next=advanceRunners(s.bases,result.bases);s.bases=next.bases;runs=next.runs;stat.hits++;stat.atBats++;if(result.bases===4)stat.homeRuns++;}
 else if(result.kind==='walk'){const next=walkRunners(s.bases);s.bases=next.bases;runs=next.runs;stat.walks++;}
 else if(result.kind==='sacrifice'){outs=1;s.bases[2]=false;runs=1;}
 else if(result.kind==='doubleplay'){outs=Math.min(2,3-s.outs);s.bases[0]=false;stat.atBats++;}
 else {outs=1;stat.atBats++;if(result.kind==='strikeout')stat.strikeouts++;}
 // Only the winning run counts on a non-homer walk-off.
 if(s.half==='bat'&&s.inning>=s.innings&&result.bases!==4&&s.runs+runs>s.cpu)runs=Math.min(runs,Math.max(0,s.cpu-s.runs+1));
 s.outs+=outs;recordRuns(s,runs);s.balls=0;s.strikes=0;
 s.recent.unshift({label:result.label,runs,inning:s.inning,half:s.half});s.recent=s.recent.slice(0,8);
 return {before,after:[...s.bases],runs,outs};
}
export function runnerRoutes(before,result){
 const routes=[];
 if(result.kind==='hit'){for(let i=0;i<3;i++)if(before[i])routes.push({from:i+1,to:Math.min(4,i+1+result.bases)});routes.push({from:0,to:result.bases});}
 if(result.kind==='walk'){let forced=true;for(let i=0;i<3;i++){if(before[i]&&forced)routes.push({from:i+1,to:i+2});else forced=false;}routes.push({from:0,to:1});}
 if(result.kind==='sacrifice')routes.push({from:3,to:4});
 return routes;
}
export function scoreCells(s,team){return Array.from({length:Math.max(s.innings,s.inning)},(_,i)=>{
 const played=i<s.inning-1||i===s.inning-1&&(team==='away'||s.half==='bat');
 if(s.complete&&team==='home'&&i===s.inning-1&&s.half==='pitch')return '×';
 return played?s.line[i]?.[team]??0:'–';
})}
