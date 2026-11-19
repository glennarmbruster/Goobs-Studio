import {modal} from './core.js';
export const wallNames=['Main view','East wall','South wall','West wall'];
export const wrapWall=n=>((n%4)+4)%4;
const details={
 'resort.webp':[
 ['The sea watch',55,50,'The telescope points toward North Head. The emergency station broadcasts at 94.6 MHz.'],
 ['The evacuation board',75,46,'The night manager left one room reserved for maintenance: 314. The spare key and fuse remain in reception.'],
 ['The service circuit',38,40,'The reception radio and sea-door lock share one circuit. Restore the radio with the spare ceramic fuse, then listen to the lighthouse.']
 ],
 'resort-lounge.webp':[
 ['The coastal atlas',50,30,'North Head marks the northern light. The radio chart beside the listening desk lists the emergency frequency: 94.6 MHz.'],
 ['The keeper’s portrait',50,22,'The keeper carried his communications spares in a brass-cornered travel case. His journey is recorded at the writing desk.'],
 ['The route journal',73,60,'Storm route: WEST pier → NORTH light → EAST channel. Three bearings, in the order travelled.']
 ],
 'boathouse.webp':[
 ['The mooring station',50,68,'Secure a rope around the winch before opening the gate. The service locker holds the removable winch handle.'],
 ['Harbor orders',80,50,'Check the tide gauge for the locker combination. The signal card inside gives the departure lights. Refuel before casting off.'],
 ['The workshop entrance',75,50,'The launch fuel tank is empty. The engine workshop has a transfer pump, a service manual and a spare can.']
 ],
 'harbor-workshop.webp':[
 ['The parts shelf',60,60,'A worn impeller seal stops fuel transfer. Take the spare seal from the tray by the workbench.'],
 ['Service instructions',50,62,'Tool cabinet code: tide gauge digits + 137. Pump valves: intake OPEN, bypass CLOSED, return OPEN. Fit the seal before priming.'],
 ['The fuel lines',32,48,'The bypass returns fuel to the tank. Close it while filling a can; leave intake and return open. Take the can back to the launch.']
 ]
};
export function createRoomLook(room,state,persist,onTurn){state.views??={};let current=null;const controls=document.createElement('div');controls.className='room-look';const left=document.createElement('button'),right=document.createElement('button'),readout=document.createElement('span');left.textContent='‹';right.textContent='›';left.setAttribute('aria-label','Look left');right.setAttribute('aria-label','Look right');readout.setAttribute('aria-live','polite');controls.append(left);controls.append(readout);controls.append(right);room.append(controls);const spot=document.createElement('button');spot.className='inspect wall-inspect';spot.textContent='+';room.append(spot);function turn(delta){state.views[current]=wrapWall((state.views[current]||0)+delta);persist();onTurn()}left.onclick=()=>turn(-1);right.onclick=()=>turn(1);return {render(image,title){current=image;const wall=wrapWall(state.views[image]||0);state.views[image]=wall;readout.textContent=title+' · '+wallNames[wall]+' · '+(wall+1)+'/4';room.style.backgroundImage=`url(assets/${wall?image.replace('.webp','-walls.webp'):image})`;room.style.backgroundSize=wall?'200% 200%':'cover';room.style.backgroundPosition=wall===1?'100% 0%':wall===2?'0% 100%':wall===3?'100% 100%':'center';spot.style.display=wall?'':'none';if(wall){const [name,x,y,text]=details[image][wall-1];spot.style.left=`calc(${x}% - 22px)`;spot.style.top=`calc(${y}% - 22px)`;spot.setAttribute('aria-label',name);spot.onclick=()=>modal(name,`<p>${text}</p>`)}return wall},reset(image){state.views[image]=0}}}
