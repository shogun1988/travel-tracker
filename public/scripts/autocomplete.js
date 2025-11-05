(() => {
  const input = document.querySelector('input[name="country"]');
  if (!input) return;

  // Ensure a datalist exists and is linked
  let listId = input.getAttribute('list');
  let dataList = listId ? document.getElementById(listId) : null;
  if (!dataList) {
    dataList = document.createElement('datalist');
    listId = 'country-suggestions';
    dataList.id = listId;
    document.body.appendChild(dataList);
    input.setAttribute('list', listId);
  }

  let lastQ = '';
  let inflight = 0;
  const controllerFor = () => new AbortController();
  let controller = controllerFor();

  async function fetchSuggestions(q) {
    try {
      const url = `/api/countries?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  }

  function renderOptions(items) {
    dataList.innerHTML = '';
    items.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      dataList.appendChild(opt);
    });
  }

  let debounce;
  input.addEventListener('input', () => {
    const q = (input.value || '').trim();
    if (q === lastQ) return;
    lastQ = q;
    if (debounce) clearTimeout(debounce);
    if (!q) {
      renderOptions([]);
      return;
    }
    debounce = setTimeout(async () => {
      // cancel previous request
      try { controller.abort(); } catch (_) {}
      controller = controllerFor();
      inflight++;
      const items = await fetchSuggestions(q);
      inflight--;
      // Only render if this query is still current
      if (q === (input.value || '').trim()) {
        renderOptions(items);
      }
    }, 150);
  });
})();
