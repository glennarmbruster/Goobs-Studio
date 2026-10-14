export const bagPosition=base=>base===2?{x:0,z:-36}:{x:18,z:-18};
// Resolve timing from contact, including travel to pickup and the receiver reaching the bag.
export function planGroundBall(fielder,ball,flightTime,bases,outs=0,wet=false,receivers=[]){
 const pickup=Math.hypot(fielder.x-ball.x,fielder.z-ball.z)/(wet?4.7:5.2)+(wet?.4:.25),speed=wet?26:30;
 const travel=base=>{const p=bagPosition(base);const cover=receivers.length?Math.min(...receivers.map(r=>Math.hypot(r.x-p.x,r.z-p.z)))/6:0;return Math.max(Math.hypot(ball.x-p.x,ball.z-p.z)/speed,cover-pickup)};
 const secondTime=flightTime+pickup+travel(2),targetBase=bases[0]&&secondTime<4.25?2:1,throwTime=travel(targetBase),arrival=flightTime+pickup+throwTime,forceOut=arrival<4.25;
 const relayTime=.22+Math.hypot(18,18)/speed,doublePlay=targetBase===2&&forceOut&&outs<2&&arrival+relayTime<4.25;
 return {pickup,throwTime,targetBase,target:bagPosition(targetBase),forceOut,doublePlay,relayTime,hitBases:Math.hypot(ball.x,ball.z)>75?2:1};
}
export function groundBallResult(bases,outs,play){
 if(!play.forceOut)return null;
 const added=play.doublePlay?2:1,next=[false,false,false];let runs=0;
 // All runners advance on this ground play; the runner forced at second is removed.
 for(let i=0;i<3;i++)if(bases[i]&&!(play.targetBase===2&&i===0)){if(i===2)runs++;else next[i+1]=true}
 if(play.targetBase===2&&!play.doublePlay)next[0]=true;
 // No run scores when a force play supplies the third out.
 if(outs+added>=3)runs=0;
 return {bases:next,outs:Math.min(3,outs+added),runs};
}
