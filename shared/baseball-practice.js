import {newDerby} from './baseball-options.js';
export const practiceModes=['batting','pitching'];
export const practiceTarget=attempt=>[-.5,0,.5,0][attempt%4];
export const freshPractice=mode=>({...newDerby(),half:mode==='pitching'?'pitch':'bat',contacts:0,targetHits:0,qualityTotal:0});
export function practiceResult(state,shot){return {...state,attempts:state.attempts+1,contacts:state.contacts+(shot.contact?1:0),targetHits:state.targetHits+(shot.targetHit?1:0),homers:state.homers+(shot.homeRun?1:0),longest:Math.max(state.longest,Math.round(shot.distance||0)),qualityTotal:state.qualityTotal+(shot.quality||0),strikes:0,balls:0,outs:0,complete:state.attempts+1>=20}}
export function groundThrow(fielder,ball,flightTime){const pickup=Math.hypot(fielder.x-ball.x,fielder.z-ball.z)/5.2+.25,throwTime=Math.hypot(ball.x-18,ball.z+18)/30;return {pickup,throwTime,forceOut:flightTime+pickup+throwTime<4.25,target:{x:18,z:-18}}}
export function runnerPosition(start,advance,elapsed){const bags=[[0,0],[18,-18],[0,-36],[-18,-18],[0,0]],end=Math.min(4,start+advance),progress=Math.min(end,start+elapsed/4.25),i=Math.min(3,Math.floor(progress)),f=progress-i;return {x:bags[i][0]+(bags[i+1][0]-bags[i][0])*f,z:bags[i][1]+(bags[i+1][1]-bags[i][1])*f,done:progress>=end}}
