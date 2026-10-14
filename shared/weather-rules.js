// Wind in metres per second; modifiers are deliberately gentle arcade conditions.
export const weatherNames={clear:'Clear',overcast:'Overcast',rain:'Rain',fog:'Coastal fog',windy:'Windy'};
export const weatherModes=game=>game==='drive'?['clear','overcast','rain','fog']:['clear','overcast','rain','windy'];
export function weatherConfig(game,input={}){return {mode:weatherModes(game).includes(input?.mode)?input.mode:'clear',time:['day','night'].includes(input?.time)?input.time:game==='baseball'?'night':'day'}}
export function weatherEffects(config){const mode=config.mode;return {wet:mode==='rain',grip:mode==='rain'?.68:1,roll:mode==='rain'?1.4:1,retain:mode==='rain'?.76:1,wind:mode==='windy'?{x:7,z:4}:mode==='rain'?{x:2,z:1}:mode==='overcast'?{x:1,z:0}:{x:0,z:0},visibility:mode==='fog'?110:mode==='rain'?230:340}}
export const weatherKey=c=>c.mode+':'+c.time;
export const weatherLabel=c=>weatherNames[c.mode]+' · '+(c.time==='night'?'Night':'Day');
