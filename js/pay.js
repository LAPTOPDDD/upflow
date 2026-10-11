(function () {
  'use strict';

  var C = window.PAY_CONFIG || {};
  var tariffs = Array.isArray(C.tariffs) ? C.tariffs : [];
  var cur = -1;

  var formEl = document.getElementById('payForm');
  var tarifsEl = document.getElementById('tarifs');
  var doneView = document.getElementById('doneView');
  var orderCode = document.getElementById('orderCode');
  var orderName = document.getElementById('orderName');
  var orderPrice = document.getElementById('orderPrice');
  var orderPerks = document.getElementById('orderPerks');
  var payBtn = document.getElementById('payBtn');
  var secureNote = document.getElementById('secureNote');
  var errorEl = document.getElementById('payError');
  var toast = document.getElementById('toast');

  function fmt(n) {
    return new Intl.NumberFormat('ru-RU').format(n) + ' ' + (C.currency || '₽');
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function hideError() { errorEl.hidden = true; }

  function toastMsg(html) {
    toast.innerHTML = html;
    toast.hidden = false;
    clearTimeout(toastMsg._t);
    toastMsg._t = setTimeout(function () { toast.hidden = true; }, 8000);
  }

  /* render tariff pickers */
  tariffs.forEach(function (t, i) {
    var label = document.createElement('label');
    label.className = 'tpick' + (t.popular ? ' tpick--pop' : '');
    if (i === 0) { label.className += ' tpick--on'; }
    var flag = t.popular ? '<span class="tpick__flag">Хит</span>' : '';
    label.innerHTML =
      '<input type="radio" name="tariff" value="' + t.id + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="tpick__code">' + t.code + '</span>' +
      '<span class="tpick__price">' + fmt(t.price) + '</span>' +
      '<span class="tpick__note">' + t.tagline + '</span>' +
      flag;
    label.querySelector('input').addEventListener('change', function () { select(i); });
    tarifsEl.appendChild(label);
  });

  function select(i) {
    cur = i;
    var t = tariffs[i];
    var inputs = tarifsEl.querySelectorAll('.tpick');
    inputs.forEach(function (el, k) {
      el.classList.toggle('tpick--on', k === i);
      el.querySelector('input').checked = k === i;
    });
    if (orderCode) orderCode.textContent = t.code;
    if (orderName) orderName.textContent = t.name;
    if (orderPrice) orderPrice.textContent = fmt(t.price);
    if (orderPerks) orderPerks.innerHTML = (t.perks || []).map(function (p) { return '<li>' + p + '</li>'; }).join('');
    if (payBtn) payBtn.textContent = 'Перейти к оплате · ' + fmt(t.price);
  }
  select(0);

  function val(id) { return (document.getElementById(id).value || '').trim(); }
  function cleanPhone(s) { return s.replace(/[^\d+]/g, ''); }

  function buildPayUrl(t, ctx) {
    var url = t.payUrl || '';
    if (!url) return null;
    url = url.replace(/\{(\w+)\}/g, function (m, key) {
      return ctx[key] != null ? ctx[key] : '';
    });
    return url;
  }

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();

    var name = val('payName');
    var email = val('payEmail');
    var phone = val('payPhone');
    var promo = val('payPromo');
    var agreed = document.getElementById('payAgree').checked;
    var t = tariffs[cur];

    if (!name || name.length < 2) { showError('Укажите имя и фамилию.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { showError('Укажите корректный e-mail.'); return; }
    var digits = cleanPhone(phone).replace('+', '');
    if (digits.length < 10 || digits.length > 15) { showError('Укажите корректный номер телефона.'); return; }
    if (!agreed) { showError('Необходимо согласие с условиями оферты.'); return; }

    var ctx = {
      amount: String(t.price),
      tariff: t.id,
      orderId: 'UP-' + Date.now().toString().slice(-8),
      name: encodeURIComponent(name),
      email: encodeURIComponent(email),
      phone: encodeURIComponent(phone)
    };

    var url = buildPayUrl(t, ctx);
    if (url) {
      if (promo) { url += (url.indexOf('?') > -1 ? '&' : '?') + 'promo=' + encodeURIComponent(promo); }
      localStorage.setItem('upflow_order', JSON.stringify({ tariff: t.id, name: name, email: email, at: Date.now() }));
      window.location.href = url;
      return;
    }

    toastMsg(
      'Оплата ещё не подключена. Напишите нам в <a href="' + C.telegram + '" target="_blank" rel="noopener">Telegram</a> — вышлем ссылку на оплату.'
    );
  });

  if (secureNote) {
    secureNote.textContent = (C.provider ? 'Оплата через ' + C.provider + ' · ' : '') + 'карты Visa, Mastercard, Мир, СБП';
  }

  /* success screen (after redirect back) */
  var q = new URLSearchParams(location.search);
  var status = (q.get('status') || q.get('success') || '').toLowerCase();
  if (status === 'success' || status === '1' || status === 'ok' || status === 'successful' || status === 'succeeded') {
    var tid = q.get('tariff');
    if (tid) {
      var tt = tariffs.filter(function (x) { return x.id === tid; })[0];
      if (tt) document.getElementById('doneText').textContent =
        'Оплата тарифа «' + tt.name + '» (' + fmt(tt.price) + ') принята. Мы свяжемся с вами в ближайшее время и откроем доступ к курсу.';
    }
    formEl.hidden = true;
    doneView.hidden = false;
  }
})();