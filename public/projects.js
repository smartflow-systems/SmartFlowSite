async function loadProjects() {
  var grid = document.getElementById('projects-grid');
  if (!grid) return;

  try {
    var [systemsRes, catsRes] = await Promise.all([
      fetch('/data/systems.json', { cache: 'no-store' }),
      fetch('/data/categories.json', { cache: 'no-store' })
    ]);
    var systems    = await systemsRes.json();
    var categories = await catsRes.json();

    grid.textContent = '';

    categories.forEach(function (cat) {
      var catSystems = systems.filter(function (s) { return s.category === cat.id; });
      if (!catSystems.length) return;

      var section = document.createElement('div');
      section.className = 'sys-category';
      section.id = 'cat-' + cat.id;

      var header = document.createElement('div');
      header.className = 'sys-cat-header';

      var iconSpan = document.createElement('span');
      iconSpan.className = 'sys-cat-icon';
      iconSpan.textContent = cat.icon;

      var info = document.createElement('div');
      info.className = 'sys-cat-info';

      var h3 = document.createElement('h3');
      h3.textContent = cat.name;

      var desc = document.createElement('p');
      desc.textContent = cat.description;

      var viewAll = document.createElement('a');
      viewAll.className = 'sys-cat-link';
      viewAll.href = '/systems.html?cat=' + cat.id;
      viewAll.textContent = 'View all ' + catSystems.length + ' systems →';

      info.appendChild(h3);
      info.appendChild(desc);
      header.appendChild(iconSpan);
      header.appendChild(info);
      header.appendChild(viewAll);
      section.appendChild(header);

      var cardsRow = document.createElement('div');
      cardsRow.className = 'sys-cards-row';

      catSystems.forEach(function (sys) {
        var card = document.createElement('a');
        card.className = 'sys-card';
        card.href = '/systems.html?cat=' + sys.category + '&id=' + sys.id;

        var top = document.createElement('div');
        top.className = 'sys-card-top';

        var icon = document.createElement('span');
        icon.className = 'sys-card-icon';
        icon.textContent = sys.icon;

        var name = document.createElement('span');
        name.className = 'sys-card-name';
        name.textContent = sys.name;

        top.appendChild(icon);
        top.appendChild(name);

        var tagline = document.createElement('p');
        tagline.className = 'sys-card-tagline';
        tagline.textContent = sys.tagline;

        var tags = document.createElement('div');
        tags.className = 'sys-card-tags';
        sys.tags.slice(0, 3).forEach(function (t) {
          var tag = document.createElement('span');
          tag.className = 'sys-tag';
          tag.textContent = t;
          tags.appendChild(tag);
        });

        card.appendChild(top);
        card.appendChild(tagline);
        card.appendChild(tags);
        cardsRow.appendChild(card);
      });

      section.appendChild(cardsRow);
      grid.appendChild(section);
    });
  } catch (err) {
    console.error('Failed to load systems:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProjects);
} else {
  loadProjects();
}
