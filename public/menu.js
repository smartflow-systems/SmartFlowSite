async function initMenu() {
  var menuBtn   = document.getElementById('menu-btn');
  var menuClose = document.getElementById('menu-close');
  var sidebar   = document.getElementById('menu-sidebar');
  if (!menuBtn || !sidebar) return;

  var desktopQuery = window.matchMedia('(min-width: 1024px)');

  var syncLayoutState = function (expanded) {
    document.body.classList.toggle('sfs-sidebar-open', expanded);
    document.body.classList.toggle('sfs-sidebar-collapsed', !expanded);
  };

  var overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  var setExpanded = function (expanded) {
    menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  var openMenu = function () {
    sidebar.classList.add('open');
    overlay.classList.toggle('open', !desktopQuery.matches);
    setExpanded(true);
    syncLayoutState(true);
  };

  var closeMenu = function () {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    setExpanded(false);
    syncLayoutState(false);
  };

  var toggleMenu = function () {
    if (sidebar.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (desktopQuery.matches) {
    openMenu();
  } else {
    closeMenu();
  }

  var handleViewportChange = function (event) {
    if (event.matches) {
      openMenu();
    } else {
      closeMenu();
    }
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', handleViewportChange);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(handleViewportChange);
  }

  menuBtn.addEventListener('click', toggleMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  var nav = sidebar.querySelector('nav.menu-links');
  if (!nav) return;

  nav.textContent = '';

  var lockup = document.createElement('div');
  lockup.className = 'menu-lockup';

  var logo = document.createElement('img');
  logo.className = 'menu-lockup-logo';
  logo.src = '/assets/brand/SmartFlo-Logo-200w.png';
  logo.alt = 'SmartFlow Systems';
  logo.loading = 'eager';

  var lockupKicker = document.createElement('span');
  lockupKicker.className = 'menu-lockup-kicker';
  lockupKicker.textContent = 'SMARTFLOW SYSTEMS';

  var lockupTitle = document.createElement('span');
  lockupTitle.className = 'menu-lockup-title';
  lockupTitle.textContent = 'Public HQ';

  var lockupCopy = document.createElement('p');
  lockupCopy.className = 'menu-lockup-copy';
  lockupCopy.textContent = 'AI Creator OS flagship direction, demo-safe status, and parked ecosystem lanes.';

  lockup.appendChild(logo);
  lockup.appendChild(lockupKicker);
  lockup.appendChild(lockupTitle);
  lockup.appendChild(lockupCopy);
  nav.appendChild(lockup);

  var staticLinks = [
    { label: 'Home', href: '/' },
    { label: 'AI Creator OS', href: '/#direction' },
    { label: 'Ecosystem Map', href: '/systems.html' },
    { label: 'Current Direction', href: '/landing.html' },
    { label: 'Updates', href: '/updates.html' },
    { label: 'Contact', href: '/contact.html' },
    { label: 'GitHub', href: 'https://github.com/smartflow-systems', external: true, subdued: true }
  ];

  staticLinks.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    a.className = 'menu-static-link' + (item.subdued ? ' menu-static-link-subdued' : '');
    if (item.external) { a.target = '_blank'; a.rel = 'noopener'; }
    if (isCurrentNavItem(item)) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    a.addEventListener('click', closeMenu);
    nav.appendChild(a);
  });

  var divider = document.createElement('div');
  divider.className = 'menu-divider';
  nav.appendChild(divider);

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
      toggleLabel.textContent = 'Lane Index';

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

  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
}

function isCurrentNavItem(item) {
  if (item.external) return false;

  var currentPath = window.location.pathname;
  var itemUrl = new URL(item.href, window.location.origin);
  var itemPath = itemUrl.pathname;

  if (itemPath === '/') {
    return currentPath === '/' || currentPath === '/index.html';
  }

  if (itemPath === '/systems.html') {
    return currentPath === '/systems.html';
  }

  return currentPath === itemPath;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
