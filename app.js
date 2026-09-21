const state={catalog:null,bag:[],shop:{categories:new Set(),availability:new Set(),release:new Set(),query:'',sort:'featured'}}
const $=selector=>document.querySelector(selector)
const $$=selector=>Array.from(document.querySelectorAll(selector))
const page=document.body.dataset.page||'home'
const params=new URLSearchParams(location.search)
const BAG_KEY='lux.store.bag.v1'

function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
function itemById(id){return allItems().find(item=>item.id===id||(item.legacyIds||[]).includes(id))}
function allItems(){
  if(!state.catalog)return[]
  const products=state.catalog.products.map(item=>({...item,kind:'product'}))
  const offers=state.catalog.offers.map(item=>({...item,kind:'offer',features:item.features||[item.description],specs:item.specs||[['Product type',item.category],['Commerce','Prelaunch']],included:item.included||['Lux ecosystem access when commissioned']}))
  return products.concat(offers).filter((item,index,items)=>items.findIndex(candidate=>candidate.id===item.id)===index)
}
function itemHref(item){return './product.html?id='+encodeURIComponent(item.id)}
function loadBag(){
  try{state.bag=JSON.parse(localStorage.getItem(BAG_KEY)||'[]').filter(Boolean)}catch{state.bag=[]}
  if(state.catalog){
    const original=JSON.stringify(state.bag)
    state.bag=[...new Set(state.bag.map(id=>itemById(id)?.id||id))]
    if(JSON.stringify(state.bag)!==original){try{localStorage.setItem(BAG_KEY,JSON.stringify(state.bag))}catch{}}
  }
  updateBagCount()
}
function saveBag(){localStorage.setItem(BAG_KEY,JSON.stringify(state.bag));updateBagCount();renderBag()}
function addToBag(id){
  if(!state.bag.includes(id))state.bag.push(id)
  saveBag();openBag();toast('Saved to your prelaunch bag — no payment collected.')
}
function removeFromBag(id){state.bag=state.bag.filter(item=>item!==id);saveBag()}
function updateBagCount(){const node=$('#bag-count');if(node)node.textContent=String(state.bag.length)}

function renderChrome(){
  const chrome=$('#site-chrome')
  if(chrome)chrome.innerHTML='<div class="announcement"><span>MEET YOUR NEXT POSSIBILITY · THE LUX COLLECTION</span><span>NEW · LUX AGENT VIEWER</span><span>BROWSE NOW · PURCHASING COMING SOON</span></div>'+
  '<a class="skip-link" href="#main-content">Skip to content</a><header class="store-header"><a class="store-brand" href="./index.html"><strong>LUX</strong><span>AUTOMATON<br>STORE</span><i></i></a>'+
  '<nav class="main-nav"><a href="./shop.html">Shop</a><a href="./shop.html?category=Devices">Devices</a><a href="./shop.html?category=Software">Software</a><a href="./shop.html?category=Agent%20Packs">Agent Packs</a><a href="./shop.html?category=Prompt%20Kits">Prompt Kits</a><a href="./shop.html?category=Memberships">Memberships</a><a href="./support.html">Support</a></nav>'+
  '<div class="header-tools"><form action="./shop.html" class="header-search"><input name="q" aria-label="Search Lux Store" placeholder="Search"><button aria-label="Submit search">⌕</button></form><button class="bag-button" id="bag-button" type="button">Bag <b id="bag-count">0</b></button></div></header>'
  const footer=$('#site-footer')
  if(footer)footer.innerHTML='<section class="service-promises"><span><b>VERIFIED RELEASES</b><small>Evidence-gated public kits</small></span><span><b>HUMAN APPROVAL</b><small>Important decisions stay yours</small></span><span><b>LOCAL-FIRST OPTIONS</b><small>Use local tools when configured</small></span><span><b>VERSIONED STORE</b><small>Published from Git history</small></span></section>'+
  '<footer class="store-footer"><div class="footer-brand"><a class="store-brand" href="./index.html"><strong>LUX</strong><span>AUTOMATON</span><i></i></a><p>Your AI. Your ambition. Your next move.</p><small>Lux Store is managed through Lux Codex.</small></div>'+
  '<div><b>Shop</b><a href="./shop.html">All products</a><a href="./shop.html?category=Devices">Devices</a><a href="./shop.html?category=Software">Software</a><a href="./shop.html?category=Prompt%20Kits">Prompt Kits</a></div>'+
  '<div><b>Explore</b><a href="./learn.html">Learn with Lux</a><a href="./support.html">Help Center</a><a href="./shop.html?category=Agent%20Packs">Agent Packs</a><a href="./shop.html?category=Memberships">Memberships</a></div>'+
  '<div><b>Store status</b><span>Public browsing: Live</span><span>Checkout: Prelaunch</span><span>Fulfillment: Not commissioned</span><a href="https://github.com/luxautomaton-ux/lux-store" target="_blank" rel="noreferrer">Version history ↗</a></div></footer>'
  const bag=$('#bag-root')
  if(bag)bag.innerHTML='<div class="bag-backdrop" id="bag-backdrop" hidden></div><aside class="bag-drawer" id="bag-drawer" role="dialog" aria-modal="true" aria-label="Prelaunch bag" aria-hidden="true" inert><div class="bag-head"><div><span>PRELAUNCH BAG</span><h2>Saved Lux items</h2></div><button id="bag-close" aria-label="Close bag">×</button></div><div id="bag-items" class="bag-items"></div><div class="bag-foot"><p>No payment is collected. Checkout activates only after pricing, terms and fulfillment are commissioned.</p><button class="button muted" type="button" disabled>Checkout not active yet</button><a href="./shop.html">Keep shopping →</a></div></aside><div class="toast" id="toast" hidden></div>'
  loadBag()
  $('#bag-button')?.addEventListener('click',openBag)
  $('#bag-close')?.addEventListener('click',closeBag)
  $('#bag-backdrop')?.addEventListener('click',closeBag)
}
let bagReturnFocus=null
function openBag(){bagReturnFocus=document.activeElement;renderBag();$('#bag-drawer').inert=false;document.body.classList.add('bag-open');$('#bag-backdrop').hidden=false;$('#bag-drawer').classList.add('open');$('#bag-drawer').setAttribute('aria-hidden','false');$('#bag-close').focus()}
function closeBag(){document.body.classList.remove('bag-open');if($('#bag-drawer'))$('#bag-drawer').inert=true;bagReturnFocus?.focus();if($('#bag-backdrop'))$('#bag-backdrop').hidden=true;$('#bag-drawer')?.classList.remove('open');$('#bag-drawer')?.setAttribute('aria-hidden','true')}
function renderBag(){
  const root=$('#bag-items');if(!root||!state.catalog)return
  const items=state.bag.map(itemById).filter(Boolean)
  root.innerHTML=items.length?items.map(item=>'<article class="bag-item">'+itemVisual(item,'small')+'<div><b>'+esc(item.name)+'</b><span>'+esc(item.category)+'</span><small>'+esc(item.priceLabel||'Pricing coming soon')+'</small><button data-remove-bag="'+esc(item.id)+'">Remove</button></div></article>').join(''):'<div class="bag-empty"><b>Your bag is empty.</b><p>Save products while you compare the Lux ecosystem.</p></div>'
}
function toast(message){const node=$('#toast');if(!node)return;node.textContent=message;node.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{node.hidden=true},2800)}

function itemVisual(item,size){
  if(item.images&&item.images.length)return '<img loading="lazy" decoding="async" class="item-image '+(size||'')+'" src="./'+esc(item.images[0])+'" alt="'+esc(item.name)+'">'
  return '<div class="offer-art '+(size||'')+'"><span>'+esc(item.icon||'◈')+'</span><small>'+esc(item.category)+'</small></div>'
}
function itemCard(item,compact){
  const verified=item.verify==='PASS'||item.release==='verified'
  return '<article class="retail-card '+(compact?'compact':'')+'"><a class="retail-card-media" href="'+itemHref(item)+'">'+itemVisual(item,'')+
    '<span class="card-badge">'+esc(item.badge||item.category)+'</span>'+(verified?'<span class="verify-pill">VERIFY PASS</span>':'')+'</a>'+
    '<div class="retail-card-copy"><span class="card-family">'+esc(item.family||item.category)+'</span><a href="'+itemHref(item)+'"><h3>'+esc(item.name)+'</h3></a><p>'+esc(item.tagline||item.description)+'</p>'+
    '<div class="card-buy"><div><b>'+esc(item.priceLabel||'Pricing coming soon')+'</b><small>'+availabilityLabel(item)+'</small></div><button data-add-bag="'+esc(item.id)+'" aria-label="Save '+esc(item.name)+' to bag">+ Quick save</button></div></div></article>'
}
function availabilityLabel(item){return item.availability==='browse'?'Browse now · purchase pending':'Prelaunch · no payment yet'}
function renderRail(id,items){const root=$(id);if(root)root.innerHTML=items.map(item=>itemCard(item,true)).join('')}

function renderHome(){
  const categories=[
    ['Devices','Portable AI and companion hardware','▣','devices'],['Software','Workspaces and operating tools','◫','software'],['Agent Packs','Roles, memory and success playbooks','◇','packs'],['Prompt Kits','Creative prompts, skills and scripts','✦','prompts'],['Memberships','Growing Lux collections and access','◎','memberships']
  ]
  const categoryRoot=$('#category-grid')
  if(categoryRoot)categoryRoot.innerHTML=categories.map(c=>'<a class="category-card" href="./shop.html?category='+encodeURIComponent(c[0])+'"><span class="category-icon">'+c[2]+'</span><b>'+c[0]+'</b><small>'+c[1]+'</small><i>Explore →</i><span class="category-art art-'+c[3]+'" aria-hidden="true"><span></span><span></span><span></span></span></a>').join('')
  const items=allItems()
  renderRail('#popular-rail',items.filter(item=>item.popular).slice(0,6))
  const nextIds=['viewer','agent-builder','lux-flow','lux-voice','usb']
  renderRail('#nextgen-rail',nextIds.map(id=>itemById(id)).filter(Boolean))
  const editorial=$('#editorial-grid')
  if(editorial)editorial.innerHTML=state.catalog.guides.slice(0,3).map(guide=>'<a class="editorial-card" href="./learn.html#'+esc(guide.id)+'"><span>'+esc(guide.eyebrow)+'</span><h3>'+esc(guide.title)+'</h3><p>'+esc(guide.summary)+'</p><i>Read guide →</i></a>').join('')
}

function shopCategoryList(){return['Devices','Software','Agent Packs','Prompt Kits','Memberships']}
function initShop(){
  state.shop.query=params.get('q')||''
  const category=params.get('category');if(category)state.shop.categories.add(category)
  state.shop.sort=params.get('sort')||'featured'
  $('#shop-search').value=state.shop.query
  $('#shop-sort').value=state.shop.sort
  $('#category-filters').innerHTML=shopCategoryList().map(cat=>'<label><input type="checkbox" value="'+esc(cat)+'" data-category '+(state.shop.categories.has(cat)?'checked':'')+'> '+esc(cat)+'</label>').join('')
  $('#shop-search').addEventListener('input',event=>{state.shop.query=event.target.value;renderShop()})
  $('#shop-sort').addEventListener('change',event=>{state.shop.sort=event.target.value;renderShop()})
  $$('[data-category]').forEach(input=>input.addEventListener('change',()=>{toggleSet(state.shop.categories,input.value,input.checked);renderShop()}))
  $$('[data-availability]').forEach(input=>input.addEventListener('change',()=>{toggleSet(state.shop.availability,input.value,input.checked);renderShop()}))
  $$('[data-release]').forEach(input=>input.addEventListener('change',()=>{toggleSet(state.shop.release,input.value,input.checked);renderShop()}))
  $('#clear-filters').addEventListener('click',resetShop);$('#shop-reset').addEventListener('click',resetShop)
  renderShop()
}
function toggleSet(set,value,on){on?set.add(value):set.delete(value)}
function resetShop(){state.shop.categories.clear();state.shop.availability.clear();state.shop.release.clear();state.shop.query='';state.shop.sort='featured';$$('.shop-filters input').forEach(input=>input.checked=false);$('#shop-search').value='';$('#shop-sort').value='featured';renderShop()}
function renderShop(){
  const query=state.shop.query.trim().toLowerCase()
  let items=allItems().filter(item=>{
    if(state.shop.categories.size&&!state.shop.categories.has(item.category))return false
    if(state.shop.availability.size&&!state.shop.availability.has(item.availability))return false
    if(state.shop.release.size){
      const flags=[];if(item.verify==='PASS'||item.release==='verified')flags.push('verified');if(item.release==='featured')flags.push('featured')
      if(!flags.some(flag=>state.shop.release.has(flag)))return false
    }
    if(query){const hay=[item.name,item.category,item.family,item.tagline,item.description].concat(item.features||[]).join(' ').toLowerCase();if(!hay.includes(query))return false}
    return true
  })
  items.sort((a,b)=>{
    if(state.shop.sort==='name-asc')return a.name.localeCompare(b.name)
    if(state.shop.sort==='name-desc')return b.name.localeCompare(a.name)
    if(state.shop.sort==='category')return a.category.localeCompare(b.category)||a.name.localeCompare(b.name)
    return Number(Boolean(b.popular))+Number(b.release==='featured')*2-Number(Boolean(a.popular))-Number(a.release==='featured')*2||a.name.localeCompare(b.name)
  })
  $('#shop-grid').innerHTML=items.map(item=>itemCard(item,false)).join('')
  $('#shop-count').textContent=items.length+' '+(items.length===1?'item':'items')
  $('#shop-empty').hidden=items.length!==0
  const chips=[];state.shop.categories.forEach(v=>chips.push(v));state.shop.availability.forEach(v=>chips.push(v));state.shop.release.forEach(v=>chips.push(v));if(query)chips.push('Search: '+state.shop.query)
  $('#active-filters').innerHTML=chips.map(chip=>'<span>'+esc(chip)+'</span>').join('')
}

function renderProduct(){
  const item=itemById(params.get('id')||'desktop')||allItems()[0]
  if(!item)return
  document.title=item.name+' — Lux Store'
  $('#breadcrumb-product').textContent=item.name
  const root=$('#product-page')
  const images=item.images||[]
  const gallery=images.length?'<div class="product-gallery"><div class="product-main-media">'+itemVisual(item,'product')+'</div><div class="thumb-row">'+images.map((img,i)=>'<button aria-label="View product photo '+(i+1)+'" data-gallery-image="'+esc(img)+'" data-gallery-alt="'+esc(item.name)+' view '+(i+1)+'"><img src="./'+esc(img)+'" alt=""></button>').join('')+'</div></div>':'<div class="product-gallery"><div class="product-main-media">'+itemVisual(item,'product')+'</div></div>'
  root.innerHTML=gallery+'<div class="product-info"><span class="product-badge">'+esc(item.badge||item.category)+'</span><span class="product-category">'+esc(item.category)+'</span><h1>'+esc(item.name)+'</h1><p class="product-tagline">'+esc(item.tagline||item.description)+'</p><div class="product-price">'+esc(item.priceLabel||'Pricing coming soon')+'</div><p class="availability-copy">'+esc(availabilityLabel(item))+'</p><ul class="feature-list">'+(item.features||[]).map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul><button class="button primary wide" data-add-bag="'+esc(item.id)+'">Save to prelaunch bag</button><p class="purchase-note">No payment is collected on this Store preview. Final price, terms and fulfillment will appear here when commissioned.</p></div>'
  if(item.detailImage)root.insertAdjacentHTML('afterend','<figure class="product-editorial section-narrow"><img loading="lazy" src="./'+esc(item.detailImage)+'" alt="'+esc(item.name)+' product photography"><figcaption>'+esc(item.name)+' · The Lux collection</figcaption></figure>')
  const specs=item.specs||[['Product type',item.category],['Commerce','Prelaunch']]
  const included=item.included||[item.description]
  $('#product-story').innerHTML='<div class="story-block"><span class="kicker">PRODUCT DETAILS</span><h2>Built for the Lux ecosystem.</h2><p>'+esc(item.description)+'</p></div><div class="spec-table">'+specs.map(row=>'<div><span>'+esc(row[0])+'</span><b>'+esc(row[1])+'</b></div>').join('')+'</div><div class="included"><span class="kicker">WHAT YOU GET</span><h2>Inside this product.</h2><ul>'+included.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul></div><div class="verify-card"><span>RELEASE STATUS</span><b>'+(item.verify==='PASS'?'Lux Verify PASS':item.release==='legacy'?'Legacy approved Store listing':'Public product preview')+'</b><p>'+(item.verify==='PASS'?'This item cleared the current Store publishing gate.':item.release==='legacy'?'This listing predates the newer contract-v2 Store publishing gate and is not being mislabeled as newly verified.':'Public details are available for browsing; commercial activation remains separate.')+'</p></div>'
  renderRail('#related-rail',allItems().filter(v=>v.id!==item.id&&(v.category===item.category||v.popular)).slice(0,4))
  $$('[data-gallery-image]').forEach(button=>button.addEventListener('click',()=>{const img=$('.product-main-media img');if(img){img.src='./'+button.dataset.galleryImage;img.alt=button.dataset.galleryAlt}}))
}

function renderSupport(){
  const root=$('#faq-list')
  const render=()=>{
    const q=($('#faq-search')?.value||'').trim().toLowerCase()
    const rows=state.catalog.faqs.filter(item=>!q||(item.q+' '+item.a).toLowerCase().includes(q))
    root.innerHTML=rows.map(item=>'<details><summary>'+esc(item.q)+'</summary><p>'+esc(item.a)+'</p></details>').join('')
  }
  $('#faq-search').addEventListener('input',render);render()
}
function renderLearn(){
  const root=$('#learn-grid')
  root.innerHTML=state.catalog.guides.map((guide,index)=>'<a class="learn-card" id="'+esc(guide.id)+'" href="#'+esc(guide.id)+'"><span>'+esc(guide.eyebrow)+'</span><b>'+String(index+1).padStart(2,'0')+'</b><h2>'+esc(guide.title)+'</h2><p>'+esc(guide.summary)+'</p><i>Explore →</i></a>').join('')
}

document.addEventListener('click',event=>{
  const add=event.target.closest('[data-add-bag]');if(add){event.preventDefault();addToBag(add.dataset.addBag)}
  const remove=event.target.closest('[data-remove-bag]');if(remove){removeFromBag(remove.dataset.removeBag)}
})
renderChrome()
fetch('./data/catalog.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('Catalog '+response.status);return response.json()}).then(catalog=>{
  state.catalog=catalog;loadBag();renderBag()
  if(page==='home')renderHome()
  if(page==='shop')initShop()
  if(page==='product')renderProduct()
  if(page==='support')renderSupport()
  if(page==='learn')renderLearn()
}).catch(error=>{console.error(error);document.body.insertAdjacentHTML('beforeend','<p class="load-error">Lux Store catalog could not be loaded.</p>')})
// Restrained reveal motion; content remains visible if JavaScript is unavailable.
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)')
let motionPaused=false
try{motionPaused=localStorage.getItem('lux.store.motion')==='paused'}catch{}
function applyMotion(){
  const paused=motionPaused||motionQuery.matches
  document.body.classList.toggle('motion-paused',paused)
  $$('.motion-toggle').forEach(button=>{button.setAttribute('aria-pressed',String(paused));button.disabled=motionQuery.matches;button.textContent=motionQuery.matches?'Reduced motion enabled':paused?'Resume motion ▶':'Pause motion Ⅱ'})
}
$$('.motion-toggle').forEach(button=>button.addEventListener('click',()=>{
  motionPaused=!document.body.classList.contains('motion-paused')
  try{localStorage.setItem('lux.store.motion',motionPaused?'paused':'active')}catch{}
  applyMotion()
}))
motionQuery.addEventListener('change',applyMotion)
applyMotion()
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}
}),{threshold:.08})
$$('.section-head,.campaign,.ecosystem-heading,.kit-feature,.viewer-story').forEach(node=>{
  node.classList.add('reveal');revealObserver.observe(node)
})
document.addEventListener('keydown',event=>{
  if(!$('#bag-drawer')?.classList.contains('open'))return
  if(event.key==='Escape')closeBag()
  if(event.key==='Tab'){
    const nodes=Array.from($('#bag-drawer').querySelectorAll('button:not([disabled]),a[href]'))
    const first=nodes[0],last=nodes[nodes.length-1]
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
})
