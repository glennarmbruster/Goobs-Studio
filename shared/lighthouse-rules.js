export const fuseOrder=['blue','amber','red'];
export const beaconHeadings=[2,4,1];
export const fuseReady=s=>s.fuses?.every((v,i)=>v===fuseOrder[i]);
export const beaconReady=s=>!!(s.power&&s.crank&&s.wound&&s.dials?.every((v,i)=>v===beaconHeadings[i]));
export const lighthouseFresh=()=>({wall:0,notes:[],crank:false,fuses:['red','red','red'],power:false,wound:false,dials:[0,0,0],complete:false});
