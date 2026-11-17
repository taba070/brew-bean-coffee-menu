const API = '/api/menu';
const tableBody = document.getElementById('menuTable');
const dialog = document.getElementById('itemDialog');
const form = document.getElementById('itemForm');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
let menuItems = [];

const el = id => document.getElementById(id);
const money = value => `৳${Number(value).toFixed(2)}`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

function showToast(message) {
  const toast = el('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function updateStats(items) {
  el('totalItems').textContent = items.length;
  el('totalCategories').textContent = new Set(items.map(item => item.category)).size;
  el('totalStock').textContent = items.reduce((sum, item) => sum + Number(item.stock), 0);
}

function updateCategoryFilter(items) {
  const current = categoryFilter.value;
  const categories = [...new Set(items.map(item => item.category))].sort();
  categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  categoryFilter.value = categories.includes(current) ? current : '';
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function renderMenu() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = menuItems.filter(item => {
    const text = `${item.name} ${item.category} ${item.description || ''}`.toLowerCase();
    return text.includes(search) && (!category || item.category === category);
  });
  el('resultCount').textContent = `Showing ${filtered.length} of ${menuItems.length} menu items`;
  if (!filtered.length) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty">${menuItems.length ? 'No matching menu items found.' : 'Your menu is empty. Add your first item to get started.'}</td></tr>`;
    return;
  }
  tableBody.innerHTML = filtered.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.description || '—')}</td>
      <td class="price">${money(item.price)}</td>
      <td>${Number(item.stock)}</td>
      <td><span class="pill ${item.availability === 'Unavailable' ? 'unavailable' : ''}">${escapeHtml(item.availability)}</span></td>
      <td><div class="actions"><button class="action-btn" data-action="edit" data-id="${item.id}">Edit</button><button class="action-btn delete" data-action="delete" data-id="${item.id}">Delete</button></div></td>
    </tr>`).join('');
}

async function loadMenu() {
  try {
    menuItems = await request(API);
    el('statusDot').className = 'dot online';
    el('connectionText').textContent = 'Database connected via API';
    updateStats(menuItems);
    updateCategoryFilter(menuItems);
    renderMenu();
  } catch (error) {
    el('statusDot').className = 'dot offline';
    el('connectionText').textContent = 'Database connection unavailable';
    tableBody.innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(error.message)}</td></tr>`;
    el('resultCount').textContent = 'Could not load database records';
    el('totalItems').textContent = el('totalCategories').textContent = el('totalStock').textContent = '—';
  }
}

function openAddDialog() {
  form.reset();
  el('itemId').value = '';
  el('dialogTitle').textContent = 'Add menu item';
  el('saveButton').textContent = 'Save item';
  el('formError').textContent = '';
  dialog.showModal();
}

function openEditDialog(item) {
  form.reset();
  el('itemId').value = item.id;
  el('name').value = item.name;
  el('category').value = item.category;
  el('description').value = item.description || '';
  el('price').value = item.price;
  el('stock').value = item.stock;
  el('availability').value = item.availability;
  el('dialogTitle').textContent = 'Edit menu item';
  el('saveButton').textContent = 'Update item';
  el('formError').textContent = '';
  dialog.showModal();
}

el('addButton').addEventListener('click', openAddDialog);
el('closeDialog').addEventListener('click', () => dialog.close());
el('cancelButton').addEventListener('click', () => dialog.close());
searchInput.addEventListener('input', renderMenu);
categoryFilter.addEventListener('change', renderMenu);

form.addEventListener('submit', async event => {
  event.preventDefault();
  const id = el('itemId').value;
  const payload = {
    name: el('name').value,
    category: el('category').value,
    description: el('description').value,
    price: el('price').value,
    stock: el('stock').value,
    availability: el('availability').value
  };
  el('saveButton').disabled = true;
  el('formError').textContent = '';
  try {
    await request(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    dialog.close();
    await loadMenu();
    showToast(id ? 'Menu item updated.' : 'Menu item added.');
  } catch (error) {
    el('formError').textContent = error.message;
  } finally {
    el('saveButton').disabled = false;
  }
});

tableBody.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const item = menuItems.find(row => row.id === Number(button.dataset.id));
  if (!item) return;
  if (button.dataset.action === 'edit') return openEditDialog(item);
  if (button.dataset.action === 'delete') {
    if (!confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await request(`${API}/${item.id}`, { method: 'DELETE' });
      await loadMenu();
      showToast('Menu item deleted.');
    } catch (error) {
      showToast(error.message);
    }
  }
});

loadMenu();