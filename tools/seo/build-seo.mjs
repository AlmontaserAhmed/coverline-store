// Coverline SEO build. Run from the repo root:  node tools/seo/build-seo.mjs
// Reads assets/products.js (the single source of truth) and regenerates:
//   shop/<id>.html  prerendered product pages (title, description, canonical, Open Graph,
//                   Product JSON-LD and readable copy are in the HTML itself, not JS-only)
//   sitemap.xml     clean product URLs, lastmod, product images
//   index.html      head JSON-LD (Organization, WebSite, ItemList) + crawlable product links
// Safe to re-run any time products.js changes.
import fs from 'node:fs';
const SITE = 'https://coverlineshop.com';
globalThis.window = {};
await import('../../assets/products.js');
const P = window.COVERLINE_PRODUCTS;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clean = u => (u||'').split('?')[0];
const abs = u => SITE + clean(u);
const today = new Date().toISOString().slice(0,10);
const shipping = { "@type":"OfferShippingDetails",
  shippingRate:{"@type":"MonetaryAmount",value:"0",currency:"GBP"},
  shippingDestination:{"@type":"DefinedRegion",addressCountry:"GB"},
  deliveryTime:{"@type":"ShippingDeliveryTime",handlingTime:{"@type":"QuantitativeValue",minValue:1,maxValue:3,unitCode:"DAY"},transitTime:{"@type":"QuantitativeValue",minValue:5,maxValue:10,unitCode:"DAY"}} };
const returns = { "@type":"MerchantReturnPolicy",applicableCountry:"GB",returnPolicyCategory:"https://schema.org/MerchantReturnFiniteReturnWindow",merchantReturnDays:14,returnMethod:"https://schema.org/ReturnByMail",returnFees:"https://schema.org/FreeReturn" };
const ld = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g,'\\u003c') + '</script>';

// ---- product pages
let tpl = fs.readFileSync('product.html','utf8').replace(/<meta name="robots" content="noindex,follow">\n?/,'');
for (const p of P) {
  const url = `${SITE}/shop/${p.id}`;
  const title = `${p.name} — Petite Fit, £${p.price} | Coverline`;
  const first = p.desc.split(/(?<=\.)\s/)[0];
  const desc = `${first} ${p.colors.map(c=>c.label).join(' or ')}. £${p.price}, free UK delivery.`.replace(/\s+/g,' ');
  const images = p.colors.flatMap(c => (c.images && c.images.length ? c.images : [c.image])).map(abs);
  const product = { "@context":"https://schema.org","@type":"Product", name:p.name, description:p.desc, sku:'CL-'+p.id.toUpperCase(),
    brand:{"@type":"Brand",name:"Coverline"}, category:"Women's clothing", audience:{"@type":"PeopleAudience",suggestedGender:"female"},
    color:p.colors.map(c=>c.label).join(', '), image:[...new Set(images)], url,
    offers:{ "@type":"Offer", url, priceCurrency:"GBP", price:String(p.price), itemCondition:"https://schema.org/NewCondition",
      availability:p.soldOut?"https://schema.org/OutOfStock":"https://schema.org/InStock", shippingDetails:shipping, hasMerchantReturnPolicy:returns } };
  const crumbs = { "@context":"https://schema.org","@type":"BreadcrumbList", itemListElement:[
    {"@type":"ListItem",position:1,name:"Coverline",item:SITE+'/'},
    {"@type":"ListItem",position:2,name:"The Edit",item:SITE+'/#shop'},
    {"@type":"ListItem",position:3,name:p.name,item:url}] };
  let h = tpl;
  h = h.replace(/<title id="pageTitle">.*?<\/title>/, `<title id="pageTitle">${esc(title)}</title>`);
  h = h.replace(/<meta name="description" id="pageDesc" content="[^"]*">/, `<meta name="description" id="pageDesc" content="${esc(desc)}">`);
  h = h.replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${url}$2`);
  h = h.replace(/(<meta property="og:title" content=")[^"]*(">)/, `$1${esc(title)}$2`);
  h = h.replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${esc(desc)}$2`);
  h = h.replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${url}$2`);
  h = h.replace(/(<meta property="og:image" content=")[^"]*(">)/, `$1${abs(p.image)}$2`);
  h = h.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="product">\n<meta property="product:price:amount" content="'+p.price+'">\n<meta property="product:price:currency" content="GBP">');
  h = h.replace('<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(desc)}">\n<meta name="twitter:image" content="${abs(p.image)}">\n${ld(product)}\n${ld(crumbs)}\n<script>window.COVERLINE_PID=${JSON.stringify(p.id)};</script>`);
  // crawlable copy inside the JS-filled container (script replaces it on load)
  h = h.replace('<!-- filled by script -->', `<h1>${esc(p.name)}</h1><p class="tagline">${esc(p.tagline)}</p><p class="price">${esc(p.priceLabel)}</p><p>${esc(p.longDesc||p.desc)}</p><p>${esc(p.fit||'')}</p><p>Available in ${esc(p.colors.map(c=>c.label).join(' and '))}. Sizes ${esc(p.sizes.join(', '))}. Free tracked UK delivery, 14-day returns.</p>`);
  h = h.replace('<div class="swatch" id="pdpSwatch"></div>', `<div class="swatch" id="pdpSwatch"><img src="${clean(p.image)}" alt="${esc(p.name)} — ${esc(p.colors[0].label)}"></div>`);
  fs.writeFileSync(`shop/${p.id}.html`, h);
}

// ---- sitemap
const urls = [
  { loc:SITE+'/', pri:'1.0', freq:'weekly', images:P.map(p=>({loc:abs(p.image),title:p.name})) },
  ...P.map(p => ({ loc:`${SITE}/shop/${p.id}`, pri:'0.9', freq:'weekly', images:[...new Set(p.colors.flatMap(c=>c.images&&c.images.length?c.images:[c.image]).map(abs))].map(u=>({loc:u,title:p.name})) })),
  { loc:SITE+'/shipping-returns.html', pri:'0.3', freq:'monthly' },
  { loc:SITE+'/terms.html', pri:'0.2', freq:'monthly' },
  { loc:SITE+'/privacy.html', pri:'0.2', freq:'monthly' } ];
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n` +
    (u.images||[]).map(i=>`    <image:image><image:loc>${i.loc}</image:loc><image:title>${esc(i.title)}</image:title></image:image>\n`).join('') + '  </url>').join('\n') + '\n</urlset>\n');

// ---- homepage
let idx = fs.readFileSync('index.html','utf8');
const org = { "@context":"https://schema.org","@graph":[
  { "@type":"Organization","@id":SITE+"/#org",name:"Coverline",url:SITE+"/",logo:SITE+"/assets/product-images/tee-apricot.jpg",
    email:"coverlineshop@agentmail.to",address:{"@type":"PostalAddress",addressLocality:"London",addressCountry:"GB"},
    sameAs:["https://www.instagram.com/wearcoverline","https://www.tiktok.com/@wearcoverline"] },
  { "@type":"WebSite","@id":SITE+"/#site",url:SITE+"/",name:"Coverline",publisher:{"@id":SITE+"/#org"},inLanguage:"en-GB" },
  { "@type":"ItemList",name:"The Edit — petite basics",itemListElement:P.map((p,i)=>({"@type":"ListItem",position:i+1,url:`${SITE}/shop/${p.id}`,name:p.name})) } ] };
const head = `<!--seo:start-->\n${ld(org)}\n<!--seo:end-->`;
idx = idx.includes('<!--seo:start-->') ? idx.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head) : idx.replace('</head>', head + '\n</head>');
const grid = `<!--seo-grid:start--><nav aria-label="Products">${P.map(p=>`<a href="/shop/${p.id}">${esc(p.name)} — £${p.price}</a>`).join(' ')}</nav><!--seo-grid:end-->`;
idx = idx.includes('<!--seo-grid:start-->') ? idx.replace(/<!--seo-grid:start-->[\s\S]*?<!--seo-grid:end-->/, grid) : idx.replace('<div class="shop-grid" id="shopGrid"></div>', `<div class="shop-grid" id="shopGrid">${grid}</div>`);
fs.writeFileSync('index.html', idx);
console.log('built', P.length, 'product pages, sitemap, homepage');
