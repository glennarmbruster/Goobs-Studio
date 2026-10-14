// Node smoke test: exercise real Three.js geometry without a GPU/browser.
export async function load(url,context,next){const r=await next(url,context);if(url.endsWith('/shared/engine.js'))return {...r,source:String(r.source).replace('new T.WebGLRenderer(', 'new globalThis.TestRenderer(')};return r}
