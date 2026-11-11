// Browser regression check using an isolated in-memory Firebase adapter.
// No test products or images are written to the live shop.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const directory = path.resolve(__dirname, '..');
const fixture = {
  id: 'test-basket', name: 'Basket de test', category: 'Baskets', price: 8900,
  image: '/public/basket-01.jpeg', description:'Basket urbaine à semelle épaisse.', colors: ['Noir'], sizes: ['39','40','41','42','43']
};
const firebaseMock = `
export const auth={},db={};
const data=new Map(window.__photoSeed||[['products/test-basket',${JSON.stringify(fixture)}]]);
window.__photosTest={data,failCommit:false};
const snap=prefix=>({empty:![...data.keys()].some(p=>p.startsWith(prefix+'/')&&p.split('/').length===prefix.split('/').length+1),metadata:{fromCache:false},docs:[...data].filter(([p])=>p.startsWith(prefix+'/')&&p.split('/').length===prefix.split('/').length+1).map(([p,v])=>({id:p.split('/').pop(),ref:{path:p},data:()=>v}))});
export const collection=(_, ...parts)=>({path:parts.join('/')});
export const doc=(_, ...parts)=>({path:parts.join('/')});
export const query=r=>r,orderBy=()=>null,serverTimestamp=()=>null;
export const getDocs=async r=>snap(r.path);
export const getDoc=async r=>({exists:()=>true,data:()=>data.get(r.path)});
const subscriptions=[];
export const onSnapshot=(ref,...args)=>{const cb=args.find(a=>typeof a==='function');subscriptions.push([ref,cb]);queueMicrotask(()=>cb(snap(ref.path)));return ()=>{};};
window.__photosTest.notify=()=>subscriptions.forEach(([ref,cb])=>cb(snap(ref.path)));
export const writeBatch=()=>{const ops=[];return {set:(ref,v,options)=>ops.push(()=>data.set(ref.path,options?.merge?{...data.get(ref.path),...v}:v)),delete:ref=>ops.push(()=>data.delete(ref.path)),commit:async()=>{if(window.__photosTest.failCommit)throw new Error('Test connexion interrompue');ops.forEach(fn=>fn());window.__photosTest.notify();}};};
export const setDoc=async()=>{},deleteDoc=async()=>{},updateDoc=async()=>{},addDoc=async()=>({id:'mock'});
export const onAuthStateChanged=(_,callback)=>queueMicrotask(()=>callback({uid:'test-admin',email:'test@example.invalid'}));
export const signInWithEmailAndPassword=async()=>{},signOut=async()=>{};
`;

(async()=>{
  const server = http.createServer((request,response)=>{
    const url = new URL(request.url,'http://localhost');
    const filename = path.join(directory,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!filename.startsWith(directory+path.sep)){response.writeHead(403).end();return;}
    fs.readFile(filename,(error,body)=>{
      if(error){response.writeHead(404).end();return;}
      const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
      response.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');response.end(body);
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.route('**/firebase-config.js',route=>route.fulfill({contentType:'text/javascript',body:firebaseMock}));
    await page.route('https://www.gstatic.com/firebasejs/**',route=>route.fulfill({contentType:'text/javascript',body:`export * from '${base}/firebase-config.js';`}));
    await page.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
    await page.goto(`${base}/admin.html`);
    await page.getByRole('button',{name:'Produits',exact:true}).click();
    await page.getByRole('button',{name:'Ajouter un nouveau produit'}).click();
    await page.locator('[name=name]').fill('Basket multi photos');
    await page.locator('[name=price]').fill('7200');
    await page.locator('#product-photo-input').setInputFiles([
      path.join(directory,'public/basket-01.jpeg'),path.join(directory,'public/basket-02.jpeg'),path.join(directory,'public/basket-03.jpeg')
    ]);
    await page.locator('.photo-preview').nth(2).waitFor();
    assert.equal(await page.locator('.photo-preview').count(),3);
    await page.getByRole('button',{name:'Mettre en principale'}).last().click();
    await page.getByRole('button',{name:'Supprimer la photo 2',exact:true}).click();
    assert.equal(await page.locator('.photo-preview').count(),2);
    // An incoming order/catalog snapshot must not erase the current form.
    await page.evaluate(()=>window.__photosTest.notify());
    assert.equal(await page.locator('[name=name]').inputValue(),'Basket multi photos');
    const artifacts=path.join(directory,'artifacts');fs.mkdirSync(artifacts,{recursive:true});
    await page.locator('#product-photos').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(artifacts,'admin-photos-desktop.png')});
    await page.setViewportSize({width:390,height:950});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('#product-photos').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(artifacts,'admin-photos-mobile.png')});
    await page.setViewportSize({width:1440,height:1000});
    await page.getByRole('button',{name:'Ajouter le produit',exact:true}).click();
    await page.locator('#product-form').waitFor({state:'detached'});
    let saved=await page.evaluate(()=>[...window.__photosTest.data].find(([key,v])=>key.split('/').length===2&&v.name==='Basket multi photos'));
    assert.equal(saved[1].photoIds.length,2);
    const productId=saved[0].split('/')[1];
    // Reload the saved photos, remove one, add another, then persist the edit.
    await page.locator(`[data-edit="${productId}"]`).click();
    await page.waitForFunction(()=>document.querySelector('#photo-status')?.textContent.startsWith('2 /'));
    await page.getByRole('button',{name:'Supprimer la photo 1',exact:true}).click();
    await page.locator('#product-photo-input').setInputFiles(path.join(directory,'public/basket-04.jpeg'));
    await page.waitForFunction(()=>document.querySelector('#photo-status')?.textContent.startsWith('2 /'));
    await page.getByRole('button',{name:'Enregistrer les modifications'}).click();
    await page.locator('#product-form').waitFor({state:'detached'});
    const state=await page.evaluate(id=>({product:window.__photosTest.data.get('products/'+id),photos:[...window.__photosTest.data.keys()].filter(k=>k.startsWith('products/'+id+'/photos/'))}),productId);
    assert.equal(state.photos.length,2);
    assert.equal(state.product.photoIds.length,2);
    assert.notEqual(state.product.photoIds[0],saved[1].photoIds[0]);
    // Legacy one-photo products remain editable, and failed writes keep the draft.
    await page.locator('[data-edit="test-basket"]').click();
    assert.equal(await page.locator('.photo-preview').count(),1);
    await page.locator('[name=description]').fill('Modification conservée');
    await page.evaluate(()=>{window.__photosTest.failCommit=true;});
    await page.getByRole('button',{name:'Enregistrer les modifications'}).click();
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('interrompue'));
    assert.equal(await page.locator('[name=description]').inputValue(),'Modification conservée');
    assert.equal(await page.getByRole('button',{name:'Enregistrer les modifications'}).isEnabled(),true);
    await page.evaluate(()=>{window.__photosTest.failCommit=false;});
    await page.getByRole('button',{name:'Annuler',exact:true}).click();
    // Product gallery, framing, keyboard and mobile navigation.
    const seed=await page.evaluate(()=>[...window.__photosTest.data]);
    await page.addInitScript(value=>{window.__photoSeed=value;},seed);
    await page.goto(`${base}/produit.html?id=${productId}`);
    await page.waitForSelector('.product-main-image');
    await page.waitForSelector('.product-thumbnails button');
    assert.equal(await page.locator('.product-thumbnails button').count(),2);
    await page.getByRole('button',{name:'Voir la photo 2',exact:true}).click();
    const secondSource=await page.locator('.product-main-image').getAttribute('src');
    assert.match(secondSource,/^data:image\/jpeg;base64,/);
    await page.getByRole('button',{name:'Photo suivante',exact:true}).click();
    assert.equal(await page.locator('.gallery-counter').textContent(),'1 / 2');
    await page.locator('.product-gallery-stage').focus();await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.gallery-counter').textContent(),'2 / 2');
    await page.locator('.product-gallery').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(artifacts,'gallery-desktop.png')});
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:950});
      const frame=await page.locator('.product-main-image').evaluate(el=>({fit:getComputedStyle(el).objectFit,image:el.getBoundingClientRect().toJSON(),stage:el.parentElement.getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}));
      assert.equal(frame.fit,'contain');assert.equal(frame.overflow,false);
      assert.equal(Math.round(frame.image.height),Math.round(frame.stage.height));
      assert.equal(Math.round(frame.image.width),Math.round(frame.stage.width));
    }
    await page.getByRole('button',{name:'Voir la photo 1',exact:true}).click();
    await page.locator('.product-gallery').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(artifacts,'gallery-mobile.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: create/edit, upload multiple photos, delete, cover, legacy product, save failure, preserved draft, gallery controls, desktop/mobile framing.');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
