const state={catalog:null,filter:'All products',query:''}
const $=selector=>document.querySelector(selector)
const productsEl=$('#products'),offersEl=$('#offer-grid'),countEl=$('#count'),emptyEl=$('#empty'),searchEl=$('#search')
const dialog=$('#product-dialog'),dialogImage=$('#dialog-image'),dialogCategory=$('#dialog-category'),dialogTitle=$('#dialog-title'),dialogDescription=$('#dialog-description'),dialogFeatures=$('#dialog-features'),galleryTabs=$('#gallery-tabs')

function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
function matches(product){
  const category=state.filter==='All products'||product.category===state.filter
  const q=state.query.trim().toLowerCase()
  const hay=[product.name,product.category,product.tagline,product.description].concat(product.features||[]).join(' ').toLowerCase()
  return category&&(!q||hay.includes(q))
}
function renderProducts(){
  const rows=state.catalog.products.filter(matches)
  countEl.textContent=rows.length+' '+(rows.length===1?'product':'products')
  productsEl.innerHTML=rows.map(function(p){
    const alt=p.name+' '+(p.images.length>1?'front packaging':'cover')
    const label=p.category==='Prompt Kits'?'LUX AI TOOLKIT CLUB':p.category.toUpperCase()
    return '<article class="card"><button class="card-media" data-product="'+esc(p.id)+'" aria-label="View '+esc(p.name)+' details"><img src="./'+esc(p.images[0])+'" alt="'+esc(alt)+'" loading="lazy"><span class="label">'+esc(label)+'</span><span class="arrow">↗</span></button><div class="card-copy"><h3>'+esc(p.name)+'</h3><p>'+esc(p.tagline)+'</p><button class="link-button" data-product="'+esc(p.id)+'">'+esc(p.cta||'Explore')+' →</button></div></article>'
  }).join('')
  emptyEl.hidden=rows.length!==0
}
function renderOffers(){
  offersEl.innerHTML=state.catalog.offers.map(function(o){
    return '<article class="offer"><span class="icon" aria-hidden="true">'+esc(o.icon)+'</span><h3>'+esc(o.name)+'</h3><p>'+esc(o.description)+'</p><small>Explore in the Lux ecosystem</small></article>'
  }).join('')
}function setFilter(filter){
  state.filter=filter;state.query='';searchEl.value=''
  document.querySelectorAll('[data-filter]').forEach(function(button){
    button.classList.toggle('active',button.dataset.filter===filter&&Boolean(button.closest('.filters')))
  })
  renderProducts()
  $('#collection').scrollIntoView({behavior:'smooth',block:'start'})
}
function openProduct(id){
  const p=state.catalog.products.find(item=>item.id===id)
  if(!p)return
  dialogCategory.textContent=p.category
  dialogTitle.textContent=p.name
  dialogDescription.textContent=p.description
  dialogFeatures.innerHTML=(p.features||[]).map(item=>'<li>'+esc(item)+'</li>').join('')
  galleryTabs.innerHTML=p.images.map(function(_,index){return '<button type="button">'+(p.images.length===1?'Cover':index===0?'Front':'Back')+'</button>'}).join('')
  function setImage(index){
    dialogImage.src='./'+p.images[index]
    dialogImage.alt=p.name+' '+(p.images.length===1?'cover':index===0?'front':'back')
    Array.from(galleryTabs.children).forEach(function(button,n){button.classList.toggle('active',n===index)})
  }
  Array.from(galleryTabs.children).forEach(function(button,index){button.addEventListener('click',function(){setImage(index)})})
  setImage(0)
  dialog.showModal()
}document.addEventListener('click',function(event){
  const filter=event.target.closest('[data-filter]')
  if(filter){setFilter(filter.dataset.filter);return}
  const product=event.target.closest('[data-product]')
  if(product)openProduct(product.dataset.product)
})
searchEl.addEventListener('input',function(event){state.query=event.target.value;renderProducts()})
$('.close').addEventListener('click',function(){dialog.close()})
dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close()})

fetch('./data/catalog.json',{cache:'no-store'})
  .then(function(response){if(!response.ok)throw new Error('Catalog '+response.status);return response.json()})
  .then(function(catalog){state.catalog=catalog;renderProducts();renderOffers()})
  .catch(function(error){console.error(error);productsEl.innerHTML='<p>Store catalog could not be loaded.</p>'})
