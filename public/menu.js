async function initMenu() {
  var menuBtn   = document.getElementById('menu-btn');
  var menuClose = document.getElementById('menu-close');
  var sidebar   = document.getElementById('menu-sidebar');
  if (!menuBtn || !sidebar) return;

  var overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  var openMenu  = function () { sidebar.classList.add('open'); overlay.classList.add('open'); };
  var closeMenu = function () { sidebar.classList.remove('open'); overlay.classList.remove('open'); };

  menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  var nav = sidebar.querySelector('nav.menu-links');
  if (!nav) return;

  nav.textContent = '';

  var staticLinks = [
    { label: '🏠 Home',        href: '/' },
    { label: '💰 Pricing',     href: '/pricing.html' },
    { label: '📰 Updates',     href: '/updates.html' },
    { label: '📞 Contact',     href: 'contact.html' },
    { label: '🐙 GitHub',      href: 'https://github.com/smartflow-systems', external: true },
    { label: '📅 Book a Demo', href: 'https://calendly.com/smartflow-systems', external: true }
  ];

  try {
    var [systemsRes, catsRes] = await Promise.all([
      fetch('/data/systems.json', { cache: 'no-store' }),
      fetch('/data/categories.json', { cache: 'no-store' })
    ]);
    var systems    = await systemsRes.json();
    var categories = await catsRes.json();

    var systemsGroup = document.createElement('div');
    systemsGroup.className = 'menu-group';

    var systemsToggle = document.createElement('button');
    systemsToggle.className = 'menu-group-toggle';
    systemsToggle.setAttribute('aria-expanded', 'false');

    var toggleLabel = document.createElement('span');
    toggleLabel.textContent = '⚙️ Systems';

    var toggleArrow = document.createElement('span');
    toggleArrow.className = 'menu-toggle-arrow';
    toggleArrow.textContent = '▸';

    systemsToggle.appendChild(toggleLabel);
    systemsToggle.appendChild(toggleArrow);

    var systemsTree = document.createElement('div');
    systemsTree.className = 'menu-tree';

    categories.forEach(function (cat) {
      var catSystems = systems.filter(function (s) { return s.category === cat.id; });
      if (!catSystems.length) return;

      var catGroup = document.createElement('div');
      catGroup.className = 'menu-cat-group';

      var catToggle = document.createElement('button');
      catToggle.className = 'menu-cat-toggle';
      catToggle.setAttribute('aria-expanded', 'false');

      var catIcon = document.createElement('span');
      catIcon.textContent = cat.icon + ' ';

      var catName = document.createElement('span');
      catName.textContent = cat.name;

      var catArrow = document.createElement('span');
      catArrow.className = 'menu-toggle-arrow';
      catArrow.textContent = '▸';

      var catCount = document.createElement('span');
      catCount.className = 'menu-cat-count';
      catCount.textContent = catSystems.length;

      catToggle.appendChild(catIcon);
      catToggle.appendChild(catName);
      catToggle.appendChild(catCount);
      catToggle.appendChild(catArrow);

      var catList = document.createElement('div');
      catList.className = 'menu-cat-list';

      var catViewAll = document.createElement('a');
      catViewAll.href = '/systems.html?cat=' + cat.id;
      catViewAll.className = 'menu-cat-viewall';
      catViewAll.textContent = 'View all ' + cat.name + ' →';
      catViewAll.addEventListener('click', closeMenu);
      catList.appendChild(catViewAll);

      catSystems.forEach(function (sys) {
        var sysLink = document.createElement('a');
        sysLink.href = '/systems.html?cat=' + sys.category + '&id=' + sys.id;
        sysLink.className = 'menu-sys-link';

        var sysIcon = document.createElement('span');
        sysIcon.className = 'menu-sys-icon';
        sysIcon.textContent = sys.icon;

        var sysName = document.createElement('span');
        sysName.textContent = sys.name;

        sysLink.appendChild(sysIcon);
        sysLink.appendChild(sysName);
        sysLink.addEventListener('click', closeMenu);
        catList.appendChild(sysLink);
      });

      catToggle.addEventListener('click', function () {
        var open = catToggle.getAttribute('aria-expanded') === 'true';
        catToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        catList.classList.toggle('open', !open);
        catArrow.textContent = open ? '▸' : '▾';
      });

      catGroup.appendChild(catToggle);
      catGroup.appendChild(catList);
      systemsTree.appendChild(catGroup);
    });

    systemsToggle.addEventListener('click', function () {
      var open = systemsToggle.getAttribute('aria-expanded') === 'true';
      systemsToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      systemsTree.classList.toggle('open', !open);
      toggleArrow.textContent = open ? '▸' : '▾';
    });

    systemsGroup.appendChild(systemsToggle);
    systemsGroup.appendChild(systemsTree);
    nav.appendChild(systemsGroup);

  } catch (e) {
    console.warn('Menu: could not load systems tree', e);
  }

  var divider = document.createElement('div');
  divider.className = 'menu-divider';
  nav.appendChild(divider);

  staticLinks.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    a.className = 'menu-static-link';
    if (item.external) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', closeMenu);
    nav.appendChild(a);
  });

  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
