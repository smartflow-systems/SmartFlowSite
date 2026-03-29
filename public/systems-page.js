async function initSystemsPage() {
  var main      = document.getElementById('sys-main');
  var filterBar = document.getElementById('cat-filter');
  if (!main) return;

  var params    = new URLSearchParams(window.location.search);
  var activeCat = params.get('cat') || 'all';
  var activeId  = params.get('id') || null;

  try {
    var [systemsRes, catsRes] = await Promise.all([
      fetch('/data/systems.json', { cache: 'no-store' }),
      fetch('/data/categories.json', { cache: 'no-store' })
    ]);
    var systems    = await systemsRes.json();
    var categories = await catsRes.json();

    var allPill = makePill('all', 'All Systems', activeCat === 'all');
    allPill.addEventListener('click', function () { filterTo('all', systems, categories, main); setActive(filterBar, 'all'); });
    filterBar.appendChild(allPill);

    categories.forEach(function (cat) {
      var count = systems.filter(function (s) { return s.category === cat.id; }).length;
      var pill  = makePill(cat.id, cat.icon + ' ' + cat.name + ' (' + count + ')', activeCat === cat.id);
      pill.addEventListener('click', function () { filterTo(cat.id, systems, categories, main); setActive(filterBar, cat.id); });
      filterBar.appendChild(pill);
    });

    renderAll(activeCat, systems, categories, main);

    if (activeId) {
      setTimeout(function () {
        var el = document.getElementById('sys-' + activeId);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('sys-highlighted'); }
      }, 300);
    }

  } catch (e) {
    main.textContent = 'Could not load systems. Please refresh.';
    console.error(e);
  }
}

function makePill(id, label, active) {
  var btn = document.createElement('button');
  btn.className = 'cat-pill' + (active ? ' active' : '');
  btn.dataset.cat = id;
  btn.textContent = label;
  return btn;
}

function setActive(bar, id) {
  bar.querySelectorAll('.cat-pill').forEach(function (p) {
    p.classList.toggle('active', p.dataset.cat === id);
  });
}

function filterTo(catId, systems, categories, main) {
  var url = new URL(window.location.href);
  if (catId === 'all') { url.searchParams.delete('cat'); } else { url.searchParams.set('cat', catId); }
  url.searchParams.delete('id');
  history.pushState({}, '', url);
  renderAll(catId, systems, categories, main);
}

function renderAll(activeCat, systems, categories, main) {
  main.textContent = '';

  var catsToShow = activeCat === 'all' ? categories : categories.filter(function (c) { return c.id === activeCat; });

  catsToShow.forEach(function (cat) {
    var catSystems = systems.filter(function (s) { return s.category === cat.id; });
    if (!catSystems.length) return;

    var section = document.createElement('section');
    section.className = 'sys-cat-section';

    var catHead = document.createElement('div');
    catHead.className = 'sys-cat-section-head';

    var icon = document.createElement('span');
    icon.className = 'sys-cat-section-icon';
    icon.textContent = cat.icon;

    var textBlock = document.createElement('div');

    var h2 = document.createElement('h2');
    h2.textContent = cat.name;

    var desc = document.createElement('p');
    desc.textContent = cat.description;

    textBlock.appendChild(h2);
    textBlock.appendChild(desc);
    catHead.appendChild(icon);
    catHead.appendChild(textBlock);
    section.appendChild(catHead);

    var grid = document.createElement('div');
    grid.className = 'sys-detail-grid';

    catSystems.forEach(function (sys) {
      var card = document.createElement('div');
      card.className = 'sys-detail-card';
      card.id = 'sys-' + sys.id;

      var cardHead = document.createElement('div');
      cardHead.className = 'sys-detail-head';

      var sysIcon = document.createElement('span');
      sysIcon.className = 'sys-detail-icon';
      sysIcon.textContent = sys.icon;

      var sysInfo = document.createElement('div');

      var sysName = document.createElement('h3');
      sysName.textContent = sys.name;

      var sysTagline = document.createElement('p');
      sysTagline.className = 'sys-detail-tagline';
      sysTagline.textContent = sys.tagline;

      sysInfo.appendChild(sysName);
      sysInfo.appendChild(sysTagline);
      cardHead.appendChild(sysIcon);
      cardHead.appendChild(sysInfo);
      card.appendChild(cardHead);

      var sysDesc = document.createElement('p');
      sysDesc.className = 'sys-detail-desc';
      sysDesc.textContent = sys.description;
      card.appendChild(sysDesc);

      var cols = document.createElement('div');
      cols.className = 'sys-detail-cols';

      var featCol = buildList('✅ Features', sys.features);
      var settCol = buildList('⚙️ Settings', sys.settings);
      cols.appendChild(featCol);
      cols.appendChild(settCol);
      card.appendChild(cols);

      var tags = document.createElement('div');
      tags.className = 'sys-card-tags';
      sys.tags.forEach(function (t) {
        var tag = document.createElement('span');
        tag.className = 'sys-tag';
        tag.textContent = t;
        tags.appendChild(tag);
      });
      card.appendChild(tags);

      var actions = document.createElement('div');
      actions.className = 'sys-detail-actions';

      var demoBtn = document.createElement('a');
      demoBtn.className = 'btn btn-gold';
      demoBtn.href = sys.demoUrl || '#';
      demoBtn.textContent = 'Book a Demo';
      demoBtn.target = '_blank';
      demoBtn.rel = 'noopener';

      var pricingBtn = document.createElement('a');
      pricingBtn.className = 'btn btn-ghost';
      pricingBtn.href = '/pricing.html';
      pricingBtn.textContent = 'See Pricing';

      actions.appendChild(demoBtn);
      actions.appendChild(pricingBtn);
      card.appendChild(actions);

      grid.appendChild(card);
    });

    section.appendChild(grid);
    main.appendChild(section);
  });
}

function buildList(title, items) {
  var col = document.createElement('div');
  col.className = 'sys-list-col';

  var h4 = document.createElement('h4');
  h4.textContent = title;
  col.appendChild(h4);

  var ul = document.createElement('ul');
  items.forEach(function (item) {
    var li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  col.appendChild(ul);
  return col;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSystemsPage);
} else {
  initSystemsPage();
}
