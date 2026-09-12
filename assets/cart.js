// Coverline — shared cart + checkout. Loaded on every page (after products.js).
// Cart state lives in localStorage so it persists across the homepage and product pages.
(function(){
  var PRODUCTS = window.COVERLINE_PRODUCTS || [];
  var ORDER_EMAIL = "coverlineshop@agentmail.to";
  var PAYPAL_ME_HANDLE = "CoverlineUK";
  var CART_KEY = "coverline_cart_v2";
  var ORDERS_KEY = "coverline_orders";

  function productById(id){
    for(var i=0;i<PRODUCTS.length;i++){ if(PRODUCTS[i].id === id) return PRODUCTS[i]; }
    return null;
  }

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch(e){ return []; }
  }
  function saveCart(items){
    try{ localStorage.setItem(CART_KEY, JSON.stringify(items)); }catch(e){}
  }

  var cart = loadCart();
  var checkoutMode = false;

  function findLine(productId, size, color){
    for(var i=0;i<cart.length;i++){ if(cart[i].productId===productId && cart[i].size===size && (cart[i].color||null)===(color||null)) return i; }
    return -1;
  }

  function defaultColor(productId){
    var p = productById(productId);
    return (p && p.colors && p.colors[0]) ? p.colors[0].key : null;
  }
  function colorLabel(productId, key){
    var p = productById(productId);
    if(!p || !p.colors) return '';
    var c = p.colors.filter(function(x){ return x.key === key; })[0];
    return c ? c.label : '';
  }
  function addToCart(productId, size, qty, color){
    qty = qty || 1;
    color = color || defaultColor(productId);
    var idx = findLine(productId, size, color);
    if(idx > -1){ cart[idx].qty += qty; }
    else { cart.push({ productId: productId, size: size, qty: qty, color: color }); }
    saveCart(cart);
    renderAll();
    openDrawer();
  }
  function setQty(idx, qty){
    if(qty <= 0){ cart.splice(idx,1); }
    else { cart[idx].qty = qty; }
    saveCart(cart);
    renderAll();
  }
  function removeLine(idx){
    cart.splice(idx,1);
    saveCart(cart);
    renderAll();
  }
  function cartTotal(){
    var total = 0;
    cart.forEach(function(line){
      var p = productById(line.productId);
      if(p) total += p.price * line.qty;
    });
    return total;
  }
  function cartCount(){
    var n = 0;
    cart.forEach(function(line){ n += line.qty; });
    return n;
  }

  // ---------- DOM scaffolding: injected once per page ----------
  var scrim, drawer, drawerBody, drawerFoot;

  function ensureScaffold(){
    // Cart toggle button — inject into the header nav if a placeholder exists, else into header itself.
    var navTarget = document.querySelector('[data-cart-slot]');
    if(navTarget && !document.getElementById('cartToggleBtn')){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cart-toggle';
      btn.id = 'cartToggleBtn';
      btn.innerHTML = 'Bag <span class="count" id="cartCount">0</span>';
      btn.addEventListener('click', openDrawer);
      navTarget.appendChild(btn);
    }

    scrim = document.createElement('div');
    scrim.className = 'cart-scrim';
    scrim.addEventListener('click', closeDrawer);
    document.body.appendChild(scrim);

    drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', 'Shopping bag');
    drawer.innerHTML =
      '<div class="cart-head"><h2>Your bag</h2><button type="button" class="cart-close" id="cartCloseBtn" aria-label="Close">&times;</button></div>' +
      '<div class="cart-body" id="cartBody"></div>' +
      '<div class="cart-foot" id="cartFoot"></div>';
    document.body.appendChild(drawer);
    drawerBody = drawer.querySelector('#cartBody');
    drawerFoot = drawer.querySelector('#cartFoot');
    drawer.querySelector('#cartCloseBtn').addEventListener('click', closeDrawer);
  }

  function openDrawer(){
    checkoutMode = false;
    renderDrawer();
    scrim.classList.add('open');
    drawer.classList.add('open');
  }
  function closeDrawer(){
    scrim.classList.remove('open');
    drawer.classList.remove('open');
  }

  function swatchMarkup(p, size){
    return '<div class="swatch-sm"><svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">' + p.swatch() + '</svg></div>';
  }

  function renderDrawer(){
    var countEl = document.getElementById('cartCount');
    if(countEl){
      var n = cartCount();
      countEl.textContent = n;
      countEl.setAttribute('data-zero', n === 0 ? 'true' : 'false');
    }

    if(checkoutMode){ renderCheckout(); return; }

    if(cart.length === 0){
      drawerBody.innerHTML = '<p class="cart-empty">Nothing in here yet. Tap a size on any piece to add it.</p>';
      drawerFoot.innerHTML = '';
      return;
    }

    drawerBody.innerHTML = cart.map(function(line, idx){
      var p = productById(line.productId);
      if(!p) return '';
      return '' +
        '<div class="cart-line">' +
          swatchMarkup(p) +
          '<div class="info">' +
            '<div class="name">' + p.name + '</div>' +
            '<div class="meta">' + (colorLabel(p.id, line.color) ? colorLabel(p.id, line.color) + ' &middot; ' : '') + 'Size ' + line.size + ' &middot; £' + p.price + ' each</div>' +
            '<div class="row">' +
              '<div class="qty-ctrl">' +
                '<button type="button" data-act="dec" data-idx="' + idx + '">&minus;</button>' +
                '<span>' + line.qty + '</span>' +
                '<button type="button" data-act="inc" data-idx="' + idx + '">+</button>' +
              '</div>' +
              '<button type="button" class="cart-remove" data-act="remove" data-idx="' + idx + '">Remove</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    drawerBody.querySelectorAll('[data-act]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var act = btn.getAttribute('data-act');
        if(act === 'inc') setQty(idx, cart[idx].qty + 1);
        else if(act === 'dec') setQty(idx, cart[idx].qty - 1);
        else if(act === 'remove') removeLine(idx);
      });
    });

    drawerFoot.innerHTML =
      '<div class="cart-total"><span>Total</span><span class="amt">£' + cartTotal() + '</span></div>' +
      '<button type="button" class="btn" id="cartCheckoutBtn">Checkout</button>';
    document.getElementById('cartCheckoutBtn').addEventListener('click', function(){
      checkoutMode = true;
      renderDrawer();
    });
  }

  function makeRef(){
    return (Date.now().toString(36) + Math.random().toString(36).slice(2,6)).toUpperCase().slice(-8);
  }

  function renderCheckout(){
    drawerFoot.innerHTML = '';
    var lines = cart.map(function(line){
      var p = productById(line.productId);
      if(!p) return '';
      return '<div class="order-line"><div><div class="ol-name">' + p.name + '</div><div class="ol-meta">Size ' + line.size + ' &times; ' + line.qty + '</div></div><div>£' + (p.price*line.qty) + '</div></div>';
    }).join('');

    drawerBody.innerHTML =
      '<div class="order-lines">' + lines + '</div>' +
      '<div class="order-summary"><div class="name">Total</div><div class="price">£' + cartTotal() + '</div></div>' +
      '<form id="checkoutForm">' +
        '<div class="field"><label for="fName">Full name</label><input id="fName" required></div>' +
        '<div class="field"><label for="fEmail">Email</label><input id="fEmail" type="email" required></div>' +
        '<div class="field"><label for="fAddr">Shipping address</label><textarea id="fAddr" rows="2" required></textarea></div>' +
        '<div class="field-row">' +
          '<div class="field"><label for="fCity">City</label><input id="fCity" required></div>' +
          '<div class="field"><label for="fPost">Postcode</label><input id="fPost" required></div>' +
        '</div>' +
        '<button type="submit" class="btn order-submit">' + (CONFIG.paypalClientId ? 'Continue to payment' : 'Reserve &amp; Pay via PayPal') + '</button>' +
        '<p class="order-note">You pay on PayPal next, so your card details never touch this site. We ship once the payment clears — UK delivery is usually 7&ndash;15 business days.</p>' +
        '<button type="button" class="link-quiet" id="backToBag" style="margin-top:14px;">&larr; Back to bag</button>' +
      '</form>';

    document.getElementById('backToBag').addEventListener('click', function(){
      checkoutMode = false;
      renderDrawer();
    });
    document.getElementById('checkoutForm').addEventListener('submit', function(e){
      e.preventDefault();
      submitOrder();
    });
  }

  // ---------- Embedded PayPal checkout (used when config.js has a client id) ----------
  var CONFIG = window.COVERLINE_CONFIG || {};
  var paypalSdkPromise = null;
  function loadPayPalSdk(){
    if(window.paypal) return Promise.resolve(window.paypal);
    if(paypalSdkPromise) return paypalSdkPromise;
    paypalSdkPromise = new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(CONFIG.paypalClientId) + '&currency=GBP&intent=capture&disable-funding=paylater,venmo';
      s.onload = function(){ resolve(window.paypal); };
      s.onerror = function(){ paypalSdkPromise = null; reject(new Error('PayPal failed to load')); };
      document.head.appendChild(s);
    });
    return paypalSdkPromise;
  }
  function readCustomer(){
    return {
      name: document.getElementById('fName').value,
      email: document.getElementById('fEmail').value,
      address: document.getElementById('fAddr').value,
      city: document.getElementById('fCity').value,
      postcode: document.getElementById('fPost').value
    };
  }
  function postJson(url, payload){
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function(r){ return r.json().then(function(d){ if(!r.ok) throw new Error(d.error || 'Something went wrong'); return d; }); });
  }
  function submitOrderPayPal(){
    var customer = readCustomer();
    var items = cart.map(function(line){ return { productId: line.productId, size: line.size, qty: line.qty, color: line.color || null }; });
    var total = cartTotal();
    var pending = { ref: null };
    var form = document.getElementById('checkoutForm');
    var submitBtn = form.querySelector('.order-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading PayPal…';
    var host = document.createElement('div');
    host.id = 'paypalButtons';
    host.style.marginTop = '14px';
    submitBtn.insertAdjacentElement('afterend', host);

    loadPayPalSdk().then(function(paypal){
      submitBtn.hidden = true;
      return paypal.Buttons({
        style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' },
        createOrder: function(){
          return postJson('/api/create-order', { items: items, customer: customer }).then(function(d){ pending.ref = d.ref; return d.id; });
        },
        onApprove: function(data){
          host.innerHTML = '<p class="order-note">Confirming your payment…</p>';
          return postJson('/api/capture-order', { orderID: data.orderID, ref: pending.ref }).then(function(d){
            showPaidConfirmation(d.ref, total, customer);
          }).catch(function(e){
            host.innerHTML = '<p class="order-error">' + (e.message || 'Payment could not be confirmed') + ' — if PayPal shows the payment went through, email us with reference ' + (pending.ref || '') + ' and we\'ll sort it.</p>';
          });
        },
        onCancel: function(){ /* buttons stay; customer can retry */ },
        onError: function(){
          host.innerHTML = '<p class="order-error">PayPal had a problem. Try again in a moment, or email us and we\'ll take the order by hand.</p>';
          submitBtn.hidden = false; submitBtn.disabled = false; submitBtn.textContent = 'Try again';
        }
      }).render('#paypalButtons');
    }).catch(function(){
      host.remove();
      submitBtn.disabled = false; submitBtn.textContent = 'Reserve & Pay via PayPal';
      submitOrderLegacy();
    });
  }
  function showPaidConfirmation(refCode, total, customer){
    var plainSummary = "Coverline order " + refCode + " — paid £" + total + "\n" +
      cart.map(function(line){ var p = productById(line.productId); return "  - " + (p ? p.name : line.productId) + (colorLabel(line.productId, line.color) ? " — " + colorLabel(line.productId, line.color) : "") + " — size " + line.size + " x" + line.qty; }).join("\n") +
      "\nDeliver to: " + customer.name + ", " + customer.address + ", " + customer.city + ", " + customer.postcode;
    cart = []; saveCart(cart); renderAll();
    drawerFoot.innerHTML = '';
    drawerBody.innerHTML =
      '<div class="confirm">' +
        '<div class="check">&#10003;</div>' +
        '<h3>Paid. That\'s everything.</h3>' +
        '<p>Order <strong>' + refCode + '</strong>, £' + total + ', is confirmed. A confirmation is on its way to <strong>' + customer.email.replace(/</g,'&lt;') + '</strong>, and you\'ll get a tracking link the moment it ships — usually 7&ndash;15 business days to the UK.</p>' +
        '<p class="ref">If the email doesn\'t turn up, this screen is your receipt — copy it if you like.</p>' +
        '<div class="copy-box" id="orderCopyBox">' + plainSummary.replace(/</g,'&lt;') + '</div>' +
        '<button type="button" class="link-quiet copy-hint" id="copyOrderBtn">Copy order details</button>' +
      '</div>';
    var copyBtn = document.getElementById('copyOrderBtn');
    if(copyBtn && navigator.clipboard && navigator.clipboard.writeText){
      copyBtn.addEventListener('click', function(){
        navigator.clipboard.writeText(plainSummary).then(function(){ copyBtn.textContent = 'Copied'; setTimeout(function(){ copyBtn.textContent = 'Copy order details'; }, 1800); });
      });
    }
  }

  function submitOrder(){
    if(CONFIG.paypalClientId && window.fetch){ submitOrderPayPal(); return; }
    submitOrderLegacy();
  }

  function submitOrderLegacy(){
    var refCode = makeRef();
    var total = cartTotal();
    var order = {
      ref: refCode,
      items: cart.map(function(line){
        var p = productById(line.productId);
        return { name: p ? p.name : line.productId, size: line.size, color: colorLabel(line.productId, line.color), qty: line.qty, price: p ? p.price : 0 };
      }),
      total: total,
      name: document.getElementById('fName').value,
      email: document.getElementById('fEmail').value,
      address: document.getElementById('fAddr').value,
      city: document.getElementById('fCity').value,
      postcode: document.getElementById('fPost').value,
      status: 'sent_to_paypal',
      createdAt: new Date().toISOString()
    };

    try{
      var existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      existing.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
    }catch(e){}

    var itemLines = order.items.map(function(it){
      return "  - " + it.name + (it.color ? " — " + it.color : "") + " — size " + it.size + " x" + it.qty + " (£" + (it.price*it.qty) + ")";
    }).join("\n");
    var plainSummary =
      "Coverline order " + refCode + "\n" +
      "Hi — I'd like to order the following:\n" +
      itemLines + "\n" +
      "Total: £" + total + "\n\n" +
      "Name: " + order.name + "\n" +
      "Email: " + order.email + "\n" +
      "Address: " + order.address + "\n" +
      order.city + ", " + order.postcode;

    var subject = "New Coverline order " + refCode + " — £" + total;
    var mailtoUrl = "mailto:" + encodeURIComponent(ORDER_EMAIL) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(plainSummary);

    // Best-effort: try to open the customer's mail client. This can silently fail
    // (no default mail app configured, some mobile browsers, etc.) so the on-screen
    // summary below is the real safety net, not just a courtesy.
    try{ window.location.href = mailtoUrl; }catch(e){}

    var payUrl = "https://www.paypal.me/" + PAYPAL_ME_HANDLE + "/" + total + "GBP";
    try{ window.open(payUrl, "_blank", "noopener"); }catch(e){}

    cart = [];
    saveCart(cart);
    renderAll();

    drawerFoot.innerHTML = '';
    drawerBody.innerHTML =
      '<div class="confirm">' +
        '<div class="check">&#10003;</div>' +
        '<h3>Nearly there</h3>' +
        '<p>Your order is reserved under reference <strong>' + refCode + '</strong>, total £' + total + '. A PayPal tab should have opened — pay there and you\'re done. Your email app may also have opened with the order pre-filled; send that and we have your details.</p>' +
        '<p class="ref">If nothing opened, no stress — copy the summary below into an email to <strong>' + ORDER_EMAIL + '</strong>, and send £' + total + ' to <strong>paypal.me/' + PAYPAL_ME_HANDLE + '</strong>. Same result.</p>' +
        '<div class="copy-box" id="orderCopyBox">' + plainSummary.replace(/</g,'&lt;') + '</div>' +
        '<button type="button" class="link-quiet copy-hint" id="copyOrderBtn">Copy order details</button>' +
        '<p class="pay-btn"><a class="btn" href="' + payUrl + '" target="_blank" rel="noopener">Pay £' + total + ' on PayPal</a></p>' +
      '</div>';

    var copyBtn = document.getElementById('copyOrderBtn');
    if(copyBtn){
      copyBtn.addEventListener('click', function(){
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(plainSummary).then(function(){
            copyBtn.textContent = 'Copied';
            setTimeout(function(){ copyBtn.textContent = 'Copy order details'; }, 1800);
          });
        }
      });
    }
  }

  function renderAll(){
    if(drawer) renderDrawer();
  }

  window.CoverlineCart = {
    add: addToCart,
    total: cartTotal,
    count: cartCount,
    open: openDrawer,
    productById: productById
  };

  document.addEventListener('DOMContentLoaded', function(){
    ensureScaffold();
    renderAll();
  });
})();
