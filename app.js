const products = [
  { id:'sneakers-azur', name:'Sneakers Azur 01', category:'Baskets', price:8900, image:'public/sneakers-urbaines.png', colors:['Blanc / Bleu','Blanc / Graphite'], sizes:['40','41','42','43','44'], badge:'NOUVEAU', description:'Une basket basse au profil net, pensée pour la ville. Tige effet cuir, empiècements contrastés et semelle confortable pour un style précis du matin au soir.' },
  { id:'hoodie-noir', name:'Hoodie Essential Noir', category:'Sweats', price:6200, image:'public/hoodie-essentiel.png', colors:['Noir','Graphite'], sizes:['S','M','L','XL','XXL'], badge:'NOUVEAU', description:'Hoodie lourd à coupe oversize, intérieur doux et finitions côtelées. Une pièce essentielle qui garde une silhouette structurée.' },
  { id:'cargo-graphite', name:'Cargo Technique Graphite', category:'Pantalons', price:7400, image:'public/cargo-technique.png', colors:['Graphite','Noir'], sizes:['38','40','42','44','46'], badge:'BEST', description:'Pantalon cargo en toile technique mate, doté de poches fonctionnelles et d’une coupe droite moderne. Facile à associer aux sneakers comme aux vestes.' },
  { id:'varsity-navy', name:'Veste Varsity Navy', category:'Vestes', price:9800, image:'public/veste-varsity.png', colors:['Marine','Noir'], sizes:['M','L','XL','XXL'], badge:'NOUVEAU', description:'Veste varsity premium en bleu nuit, soulignée de finitions blanches. Sa coupe décontractée donne immédiatement du caractère à une tenue simple.' },
  { id:'sneakers-mono', name:'Sneakers Mono 02', category:'Baskets', price:8500, image:'public/sneakers-urbaines.png', colors:['Blanc / Graphite'], sizes:['40','41','42','43','44'], badge:null, description:'Une version monochrome et facile à porter de notre basket urbaine, avec une semelle souple et une construction confortable.' },
  { id:'hoodie-graphite', name:'Hoodie Essential Graphite', category:'Sweats', price:6200, image:'public/hoodie-essentiel.png', colors:['Graphite'], sizes:['S','M','L','XL','XXL'], badge:null, description:'Le hoodie essentiel décliné dans une nuance graphite profonde, avec une coupe généreuse et des finitions robustes.' },
  { id:'cargo-noir', name:'Cargo Technique Noir', category:'Pantalons', price:7400, image:'public/cargo-technique.png', colors:['Noir'], sizes:['38','40','42','44','46'], badge:null, description:'Cargo noir polyvalent, construit pour bouger et garder une ligne nette grâce à son tissu technique et ses poches structurées.' },
  { id:'varsity-black', name:'Veste Varsity Black', category:'Vestes', price:9800, image:'public/veste-varsity.png', colors:['Noir'], sizes:['M','L','XL','XXL'], badge:'LIMITÉ', description:'Une varsity sombre aux contrastes maîtrisés, idéale pour superposer les looks de mi-saison.' }
];

const money = value => `${new Intl.NumberFormat('fr-DZ').format(value)} DA`;
const loadCart = () => JSON.parse(localStorage.getItem('moda-cart') || '[]');
const saveCart = cart => { localStorage.setItem('moda-cart', JSON.stringify(cart)); updateCartCount(); };

function cartQuantity(){ return loadCart().reduce((sum,item)=>sum+item.qty,0); }
function updateCartCount(){ document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartQuantity()); }

function header(){
  return `<header class="header"><div class="container nav">
    <a class="brand" href="index.html" aria-label="Moda Afair — Accueil"><img src="public/logo-moda-afair.png" alt="Moda Afair"></a>
    <nav class="nav-links" aria-label="Navigation principale">
      <a class="active" href="index.html">Accueil</a><a href="index.html#collection">Collection</a><a href="index.html#nouveautes">Nouveautés</a><span class="nav-dropdown">Articles⌄</span><a href="index.html#nouveautes">Baskets</a><a href="index.html#nouveautes">Sweats</a><a href="index.html#nouveautes">Pantalons</a><a href="index.html#nouveautes">Vestes</a>
    </nav>
    <div class="nav-actions"><button class="nav-icon" aria-label="Rechercher"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg></button><a class="nav-icon navbar-cart" href="panier.html" aria-label="Voir le panier"><svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8Z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg><span class="cart-count">0</span></a><span class="nav-icon" aria-label="Compte"><svg viewBox="0 0 24 24"><path d="M6.5 20v-2.5a5.5 5.5 0 0 1 11 0V20"></path><circle cx="12" cy="7" r="3.5"></circle></svg></span><button class="menu-btn" aria-label="Ouvrir le menu" onclick="document.body.classList.toggle('menu-open')"><span></span><span></span><span></span></button></div>
  </div></header>`;
}

function footer(){
  return `<footer class="footer"><div class="container">
    <div class="footer-grid"><div><img class="footer-logo" src="public/logo-moda-afair.png" alt="Moda Afair"><p>Baskets et vêtements homme sélectionnés pour un style urbain, net et actuel.</p></div>
    <div><h3>Navigation</h3><div class="footer-links"><a href="index.html">Accueil</a><a href="index.html#collection">Collection</a><a href="panier.html">Panier</a></div></div>
    <div><h3>Informations</h3><div class="footer-links"><a href="#">Livraison</a><a href="#">Échanges</a><a href="#">Guide des tailles</a></div></div>
    <div><h3>Nous contacter</h3><p>Afair, Algérie<br>Dim–Jeu · 09h–18h<br>Instagram · Facebook</p></div></div>
    <div class="copyright"><span>© 2026 MODA AFAIR — Tous droits réservés.</span><span>Style masculin, sans compromis.</span></div>
  </div></footer><div class="toast" id="toast">Ajouté au panier</div>`;
}

function productCard(p){
  return `<article class="product-card reveal"><div class="product-media" onclick="showProductActions(this)"><a href="produit.html?id=${p.id}" aria-label="Voir ${p.name}"><img src="${p.image}" alt="${p.name}"></a>${p.badge?`<span class="badge">${p.badge}</span>`:''}<div class="product-actions"><a class="product-action product-action-eye" href="produit.html?id=${p.id}" aria-label="Voir le produit"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.7"></circle></svg></a><button class="product-action product-action-dark" onclick="event.stopPropagation();quickAdd('${p.id}')">Ajouter</button></div></div><div class="product-info"><a href="produit.html?id=${p.id}"><h3>${p.name}</h3></a><div class="colors">${p.colors.join(', ')}</div><div class="price">${money(p.price)}</div></div></article>`;
}

function renderHome(){
  document.querySelector('#app').innerHTML = `${header()}
    <main><section class="hero hero--split">
      <div class="hero__text">
        <h1 class="hero__brand hero__brand--thin" aria-label="Moda Afair"><span>M</span><span>O</span><span>D</span><span>A</span><span>&nbsp;</span><span>A</span><span>F</span><span>A</span><span>I</span><span>R</span></h1>
        <a class="btn btn--hero-dark" href="#collection">DÉCOUVRIR</a>
      </div>
      <div class="hero__frame">
        <img class="hero__frame-video" src="public/hero-moda.png" alt="Collection homme Moda Afair">
        <div class="hero__frame-border"></div>
      </div>
    </section>
    <section class="section reveal" id="collection"><div class="container"><div class="section-head"><div><span class="eyebrow">La Maison Moda</span><h2>Notre Collection</h2></div><p>Des pièces pensées pour révéler votre style.</p></div><div class="category-grid"><a class="category sneakers reveal reveal-delay-1" href="#nouveautes"><div class="category-copy"><h3>BASKETS</h3><p>Baskets urbaines pour toutes les occasions</p></div></a><a class="category clothes reveal reveal-delay-2" href="#nouveautes"><div class="category-copy"><h3>VÊTEMENTS</h3><p>Des essentiels modernes et raffinés</p></div></a></div></div></section>
    <section class="section section-soft reveal" id="nouveautes"><div class="container"><div class="section-head"><div><span class="eyebrow">Dernières arrivées</span><h2>Les nouveautés</h2></div><p>Découvrez les dernières pièces de notre collection.</p></div><div class="product-grid">${products.map(productCard).join('')}</div></div></section>
    <section class="editorial-promo reveal"><div class="editorial-promo__media"><img src="public/hero-moda.png" alt="Look masculin Moda Afair"></div><div class="editorial-promo__copy"><span class="eyebrow">Sélection Moda</span><h2>Le look de la semaine</h2><p>Une silhouette urbaine complète, construite autour de pièces sobres, fortes et faciles à porter.</p><a class="editorial-promo__link" href="produit.html?id=varsity-navy">Découvrir la sélection <span>↗</span></a></div></section>
    <section class="service-strip reveal"><div class="service-line"><svg viewBox="0 0 48 48"><path d="M5 14h27v20H5zM32 23h7l5 6v5H32zM12 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm25 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path></svg><h3>Livraison à domicile</h3><p>Recevez vos commandes directement chez vous.</p></div><div class="service-line"><svg viewBox="0 0 48 48"><path d="m7 19 17-10 17 10v22H7zM18 41V29h12v12"></path></svg><h3>Livraison au bureau</h3><p>Faites livrer votre commande à votre lieu de travail.</p></div><div class="service-line"><svg viewBox="0 0 48 48"><rect x="6" y="14" width="36" height="23" rx="4"></rect><circle cx="24" cy="25.5" r="4"></circle></svg><h3>Paiement à la livraison</h3><p>Paiement en espèces à la réception de votre commande.</p></div><div class="service-line"><svg viewBox="0 0 48 48"><path d="M7 10h34v23H19L9 41v-8H7z"></path></svg><h3>Service client</h3><p>Une équipe disponible pour vous accompagner.</p></div></section>
    </main>${footer()}`;
}

function renderProduct(){
  const id = new URLSearchParams(location.search).get('id');
  const p = products.find(item=>item.id===id) || products[0];
  document.title = `${p.name} — Moda Afair`;
  document.querySelector('#app').innerHTML = `${header()}<main><div class="page-title"><div class="container"><div class="breadcrumbs"><a href="index.html">Accueil</a> / ${p.category} / ${p.name}</div><h1>${p.category}</h1></div></div><div class="container product-page"><div class="product-gallery"><img src="${p.image}" alt="${p.name}"></div><section class="product-detail"><span class="eyebrow">${p.badge || 'Collection Moda'}</span><h1>${p.name}</h1><div class="detail-price">${money(p.price)}</div><p class="description">${p.description}</p><div class="option"><span class="option-label">Couleur</span><input id="color" type="hidden" value="${p.colors[0]}"><div class="color-choices" role="radiogroup" aria-label="Couleur">${p.colors.map((c,i)=>`<button class="color-choice${i===0?' selected':''}" type="button" role="radio" aria-checked="${i===0}" aria-label="${c}" title="${c}" data-value="${c}" style="--swatch:${colorHex(c)}" onclick="selectChoice(this,'color')"><span>✓</span></button>`).join('')}</div></div><div class="option"><span class="option-label">Taille</span><input id="size" type="hidden" value="${p.sizes[0]}"><div class="size-choices" role="radiogroup" aria-label="Taille">${p.sizes.map((s,i)=>`<button class="size-choice${i===0?' selected':''}" type="button" role="radio" aria-checked="${i===0}" data-value="${s}" onclick="selectChoice(this,'size')">${s}</button>`).join('')}</div></div><div class="qty-add"><div class="qty"><button onclick="changeQty(-1)" aria-label="Diminuer">−</button><input id="qty" value="1" readonly aria-label="Quantité"><button onclick="changeQty(1)" aria-label="Augmenter">+</button></div><button class="detail-add-btn" onclick="addDetailed('${p.id}')">Ajouter au panier</button></div><div class="detail-notes"><span>✓ Paiement à la livraison</span><span>✓ Livraison partout en Algérie</span><span>✓ Échange de taille sous 7 jours</span></div></section></div><section class="section section-soft"><div class="container"><div class="section-head"><h2>Vous aimerez aussi</h2></div><div class="product-grid">${products.filter(x=>x.id!==p.id).slice(0,4).map(productCard).join('')}</div></div></section></main>${footer()}`;
}

function renderCart(){
  const cart = loadCart();
  const items = cart.map(item=>({...item, product: products.find(p=>p.id===item.id)})).filter(i=>i.product);
  const subtotal = items.reduce((s,i)=>s+i.product.price*i.qty,0);
  document.querySelector('#app').innerHTML = `${header()}<main><div class="page-title"><div class="container"><div class="breadcrumbs"><a href="index.html">Accueil</a> / Panier</div><h1>Votre panier</h1></div></div><div class="container cart-layout"><div>${items.length ? items.map(i=>`<article class="cart-item"><img src="${i.product.image}" alt="${i.product.name}"><div><h3>${i.product.name}</h3><div class="cart-meta">${i.color} · Taille ${i.size} · Qté ${i.qty}</div><button class="remove" onclick="removeItem('${i.key}')">Retirer</button></div><span class="price">${money(i.product.price*i.qty)}</span></article>`).join('') : `<div class="empty"><h2>Votre panier est vide</h2><p>Découvrez les dernières pièces Moda Afair.</p><a class="btn" href="index.html#nouveautes">Voir la collection</a></div>`}</div>${items.length ? `<aside class="summary"><h2>Récapitulatif</h2><div class="summary-line"><span>Sous-total</span><span>${money(subtotal)}</span></div><div class="summary-line"><span>Livraison</span><span>Calculée à la confirmation</span></div><div class="summary-line summary-total"><span>Total</span><span>${money(subtotal)}</span></div><form class="checkout-form" onsubmit="placeOrder(event)"><input required placeholder="Nom et prénom" aria-label="Nom et prénom"><input required type="tel" placeholder="Téléphone" aria-label="Téléphone"><input required placeholder="Wilaya" aria-label="Wilaya"><textarea required placeholder="Adresse de livraison" aria-label="Adresse de livraison"></textarea><button class="btn btn-wide" type="submit">Confirmer la commande</button></form></aside>`:''}</div></main>${footer()}`;
}

function quickAdd(id){ const p=products.find(x=>x.id===id); addToCart(p,p.colors[0],p.sizes[0],1); }
function colorHex(name){ const n=name.toLowerCase(); if(n.includes('marine')||n.includes('bleu')) return '#123554'; if(n.includes('graphite')) return '#50545b'; if(n.includes('noir')) return '#171717'; if(n.includes('blanc')) return '#eeeae3'; return '#6f7053'; }
function selectChoice(button,inputId){ const group=button.parentElement; group.querySelectorAll('button').forEach(item=>{item.classList.remove('selected');item.setAttribute('aria-checked','false')}); button.classList.add('selected');button.setAttribute('aria-checked','true');document.querySelector(`#${inputId}`).value=button.dataset.value; }
function addDetailed(id){ const p=products.find(x=>x.id===id); addToCart(p,document.querySelector('#color').value,document.querySelector('#size').value,Number(document.querySelector('#qty').value)); }
function addToCart(p,color,size,qty){ const cart=loadCart(); const key=`${p.id}-${color}-${size}`; const found=cart.find(i=>i.key===key); if(found) found.qty+=qty; else cart.push({key,id:p.id,color,size,qty}); saveCart(cart); showToast(`${p.name} ajouté au panier`); }
function changeQty(amount){ const input=document.querySelector('#qty'); input.value=Math.max(1,Math.min(10,Number(input.value)+amount)); }
function removeItem(key){ saveCart(loadCart().filter(i=>i.key!==key)); renderCart(); updateCartCount(); }
function placeOrder(event){ event.preventDefault(); alert('Commande enregistrée ! Nous vous contacterons pour la confirmer.'); localStorage.removeItem('moda-cart'); renderCart(); }
function showToast(message){ const toast=document.querySelector('#toast'); toast.textContent=message; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2400); }
function showProductActions(media){ if(matchMedia('(hover: none)').matches) media.classList.toggle('show-actions'); }
function initScrollReveal(){ const items=document.querySelectorAll('.reveal'); if(!('IntersectionObserver' in window)){items.forEach(i=>i.classList.add('visible'));return;} const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px'}); items.forEach(item=>observer.observe(item)); }

const page=document.body.dataset.page;
if(page==='home') renderHome();
if(page==='product') renderProduct();
if(page==='cart') renderCart();
updateCartCount();
initScrollReveal();
