export const cabinPressure=valves=>valves[0]*30+valves[1]*20-valves[2]*10;
export const pressureReady=s=>!!(s.fuse&&cabinPressure(s.relays)===100&&s.relays[1]>=2&&s.relays[2]>=1);
export const dockCanLaunch=s=>!!(s.power&&s.log);
