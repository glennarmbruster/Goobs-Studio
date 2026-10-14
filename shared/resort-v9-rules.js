export const chapterKeys=['resort','resort:boathouse','resort:lighthouse','resort:ship','resort:terminal'];
export const chapterNames=['The Reception','The Service Launch','North Head Lighthouse','The Relief Ship','Mainland Terminal'];
export const freshVoyage=()=>({wall:0,notes:[],hose:false,crystal:false,valves:[false,false,false],pump:false,radio:false,heading:[],telegraph:'stop',complete:false});
export const freshTerminal=()=>({wall:0,notes:[],battery:false,ticket:false,switches:[false,false,false,false],power:false,punches:[],validated:false,complete:false});
export const pumpReady=s=>!!(s.hose&&s.valves[0]&&!s.valves[1]&&s.valves[2]);
export const shipReady=s=>!!(s.pump&&s.radio&&s.telegraph==='slow'&&s.heading.join(',')==='port,ahead,starboard');
export const terminalPower=s=>!!(s.battery&&s.switches[0]&&s.switches[1]&&s.switches[2]&&!s.switches[3]);
export const ticketReady=s=>!!(s.power&&s.ticket&&s.punches.join(',')==='2,4,1');
export const chapterFinished=(index,s)=>index===0?!!s.escaped:!!s.complete;
export function unlockedChapter(read,remembered=1){let highest=Math.max(1,Math.min(5,remembered));for(let i=0;i<4;i++)if(chapterFinished(i,read(chapterKeys[i])))highest=Math.max(highest,i+2);return highest}
