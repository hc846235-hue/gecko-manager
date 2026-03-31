/* ============================================================
   睫角守宫养殖管理系统 — app.js
   数据存储: localStorage
============================================================ */

// ===== 数据层 =====
const DB = {
  KEYS: {
    geckos:   'crested_geckos',
    feedings: 'crested_feedings',
    eggs:     'crested_eggs',
    health:   'crested_health',
  },

  load(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  },

  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  /* ---- geckos ---- */
  getGeckos()       { return this.load(this.KEYS.geckos); },
  saveGeckos(d)     { this.save(this.KEYS.geckos, d); },

  addGecko(g)       { const d = this.getGeckos(); g.id = this.uid(); g.createdAt = today(); d.unshift(g); this.saveGeckos(d); return g; },

  updateGecko(id, patch) {
    const d = this.getGeckos().map(g => g.id === id ? { ...g, ...patch } : g);
    this.saveGeckos(d);
  },

  deleteGecko(id)   { this.saveGeckos(this.getGeckos().filter(g => g.id !== id)); },

  getGecko(id)      { return this.getGeckos().find(g => g.id === id); },

  /* ---- feedings ---- */
  getFeedings()     { return this.load(this.KEYS.feedings); },
  saveFeedings(d)   { this.save(this.KEYS.feedings, d); },
  addFeeding(f)     { const d = this.getFeedings(); f.id = this.uid(); d.unshift(f); this.saveFeedings(d); return f; },
  deleteFeeding(id) { this.saveFeedings(this.getFeedings().filter(f => f.id !== id)); },

  /* ---- eggs ---- */
  getEggs()         { return this.load(this.KEYS.eggs); },
  saveEggs(d)       { this.save(this.KEYS.eggs, d); },
  addEgg(e)         { const d = this.getEggs(); e.id = this.uid(); d.unshift(e); this.saveEggs(d); return e; },
  updateEgg(id, patch) {
    const d = this.getEggs().map(e => e.id === id ? { ...e, ...patch } : e);
    this.saveEggs(d);
  },
  deleteEgg(id)     { this.saveEggs(this.getEggs().filter(e => e.id !== id)); },

  /* ---- health ---- */
  getHealthRecords()       { return this.load(this.KEYS.health); },
  saveHealthRecords(d)     { this.save(this.KEYS.health, d); },
  addHealthRecord(h)       { const d = this.getHealthRecords(); h.id = this.uid(); d.unshift(h); this.saveHealthRecords(d); return h; },
  deleteHealthRecord(id)   { this.saveHealthRecords(this.getHealthRecords().filter(h => h.id !== id)); },
};

// ===== 工具函数 =====
function today() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}

function daysDiff(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - d) / 86400000);
}

function healthTag(status) {
  const map = {
    '健康':  'tag-healthy',
    '观察中':'tag-warning',
    '治疗中':'tag-danger',
    '隔离':  'tag-purple',
    '已康复':'tag-healthy',
  };
  return `<span class="tag ${map[status] || 'tag-gray'}">${status || '—'}</span>`;
}

function feedStatusTag(status) {
  const map = {
    '正常进食': 'tag-healthy',
    '拒食':     'tag-danger',
    '进食少量': 'tag-warning',
    '大量进食': 'tag-purple',
  };
  return `<span class="tag ${map[status] || 'tag-gray'}">${status || '—'}</span>`;
}

function fertilityTag(status) {
  const map = {
    '受精':     'tag-healthy',
    '未受精':   'tag-danger',
    '部分受精': 'tag-warning',
    '待确认':   'tag-gray',
  };
  return `<span class="tag ${map[status] || 'tag-gray'}">${status || '—'}</span>`;
}

function hatchTag(status) {
  const map = {
    '孵化中':   'tag-purple',
    '已孵化':   'tag-healthy',
    '坏蛋':     'tag-danger',
    '未受精丢弃':'tag-gray',
  };
  return `<span class="tag ${map[status] || 'tag-gray'}">${status || '—'}</span>`;
}

function typeLabel(type) {
  const map = { weight:'体重记录', molt:'蜕皮记录', illness:'疾病记录', treatment:'治疗记录', observation:'日常观察' };
  return map[type] || type;
}

// ===== Toast 通知 =====
function toast(msg, type = 'success') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ===== 弹窗控制 =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ===== Tab 切换 =====
function initTabs() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
      // 切换时刷新对应面板
      if (tab === 'dashboard') renderDashboard();
      if (tab === 'geckos')    renderGeckoGrid();
      if (tab === 'feeding')   renderFeedingTable();
      if (tab === 'breeding')  renderBreedingGrid();
      if (tab === 'health')    renderHealthTable();
    });
  });
}

// ===== 关闭弹窗按钮 =====
function initModalClose() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

// ===================================================================
// ==================== 个体管理 =====================================
// ===================================================================

// ===== 照片相关工具 =====

// 当前编辑弹窗中暂存的3张图（base64 or null）
let pendingPhotos = [null, null, null];

function initPhotoSlots() {
  for (let i = 0; i < 3; i++) {
    const input = document.getElementById(`photo-input-${i}`);
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        pendingPhotos[i] = ev.target.result;
        renderPhotoSlot(i, ev.target.result);
      };
      reader.readAsDataURL(file);
      // 清空 input 让同一文件可重选
      input.value = '';
    });
  }
}

function renderPhotoSlot(idx, src) {
  const slot = document.querySelector(`.photo-slot[data-slot="${idx}"]`);
  if (!slot) return;
  if (src) {
    slot.classList.add('has-image');
    slot.querySelector('.photo-slot-inner').innerHTML = `
      <img src="${src}" alt="照片 ${idx+1}" style="width:100%;height:100%;object-fit:cover;display:block" />
    `;
    // 删除按钮
    let rmBtn = slot.querySelector('.photo-remove-btn');
    if (!rmBtn) {
      rmBtn = document.createElement('button');
      rmBtn.className = 'photo-remove-btn';
      rmBtn.innerHTML = '✕';
      rmBtn.onclick = ev => { ev.stopPropagation(); clearPhotoSlot(idx); };
      slot.appendChild(rmBtn);
    }
  } else {
    clearPhotoSlot(idx);
  }
}

function clearPhotoSlot(idx) {
  pendingPhotos[idx] = null;
  const slot = document.querySelector(`.photo-slot[data-slot="${idx}"]`);
  if (!slot) return;
  slot.classList.remove('has-image');
  const labels = ['首张 / 头像', '第 2 张', '第 3 张'];
  const icons  = ['📷', '＋', '＋'];
  slot.querySelector('.photo-slot-inner').innerHTML = `
    <span class="photo-slot-icon">${icons[idx]}</span>
    <span class="photo-slot-label">${labels[idx]}</span>
  `;
  const rmBtn = slot.querySelector('.photo-remove-btn');
  if (rmBtn) rmBtn.remove();
}

function resetPhotoSlots(photos) {
  for (let i = 0; i < 3; i++) {
    pendingPhotos[i] = (photos && photos[i]) ? photos[i] : null;
    renderPhotoSlot(i, pendingPhotos[i]);
  }
}

// 灯箱
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox-img').src = '';
}

// 渲染个体网格
function renderGeckoGrid(search = '') {
  const grid = document.getElementById('gecko-grid');
  let geckos = DB.getGeckos();
  if (search) geckos = geckos.filter(g =>
    g.name.includes(search) || (g.morph || '').includes(search));

  if (!geckos.length) {
    grid.innerHTML = '<div class="empty-hint">还没有添加任何个体，点击右上角添加吧！</div>';
    return;
  }

  grid.innerHTML = geckos.map(g => {
    const lastFeed = getLastFeed(g.id);
    const overdue  = lastFeed ? daysDiff(lastFeed.date) >= (g.feedCycle || 3) : true;
    const age      = g.birthdate ? calcAge(g.birthdate) : '未知';
    // 头像：有首张照片则显示图片，否则 emoji
    const avatarHtml = (g.photos && g.photos[0])
      ? `<img class="gecko-avatar-img" src="${g.photos[0]}" alt="${escHtml(g.name)}" />`
      : `<div class="gecko-avatar">🦎</div>`;
    return `
    <div class="gecko-card" onclick="showGeckoDetail('${g.id}')">
      <div class="gecko-card-header">
        ${avatarHtml}
        <div class="gecko-name-block">
          <div class="gecko-card-name">${escHtml(g.name)}</div>
          <div class="gecko-card-morph">${escHtml(g.morph || '品系未知')}</div>
        </div>
        <span class="gecko-sex-badge">${g.sex || '?'}</span>
      </div>
      <div class="gecko-card-body">
        <div class="gecko-info-row">
          <span class="gecko-info-label">健康状态</span>
          <span class="gecko-info-value">${healthTag(g.healthStatus)}</span>
        </div>
        <div class="gecko-info-row">
          <span class="gecko-info-label">当前体重</span>
          <span class="gecko-info-value">${g.weight ? g.weight + ' g' : '未记录'}</span>
        </div>
        <div class="gecko-info-row">
          <span class="gecko-info-label">年龄</span>
          <span class="gecko-info-value">${age}</span>
        </div>
        <div class="gecko-info-row">
          <span class="gecko-info-label">上次喂食</span>
          <span class="gecko-info-value ${overdue ? 'tag tag-warning' : ''}">${lastFeed ? formatDate(lastFeed.date) : '从未记录'}</span>
        </div>
      </div>
      <div class="gecko-card-footer">
        <button class="btn-icon" onclick="event.stopPropagation(); quickFeed('${g.id}')">🍽️ 快速喂食</button>
        <button class="btn-icon" onclick="event.stopPropagation(); editGecko('${g.id}')">✏️ 编辑</button>
        <button class="btn-danger" onclick="event.stopPropagation(); deleteGecko('${g.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function calcAge(birthdate) {
  const b = new Date(birthdate + 'T00:00:00');
  const n = new Date();
  const months = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
  if (months < 1) return '< 1 个月';
  if (months < 24) return `${months} 个月`;
  return `${Math.floor(months / 12)} 岁 ${months % 12} 个月`;
}

function getLastFeed(geckoId) {
  const feeds = DB.getFeedings().filter(f => f.geckoId === geckoId);
  return feeds.length ? feeds[0] : null;
}

// 编辑个体
let editingGeckoId = null;
function editGecko(id) {
  const g = DB.getGecko(id);
  if (!g) return;
  editingGeckoId = id;
  document.getElementById('gecko-modal-title').textContent = '编辑个体';
  document.getElementById('gecko-name').value         = g.name || '';
  document.getElementById('gecko-sex').value          = g.sex || '未知';
  document.getElementById('gecko-morph').value        = g.morph || '';
  document.getElementById('gecko-birthdate').value    = g.birthdate || '';
  document.getElementById('gecko-source').value       = g.source || '';
  document.getElementById('gecko-weight').value       = g.weight || '';
  document.getElementById('gecko-health-status').value= g.healthStatus || '健康';
  document.getElementById('gecko-feed-cycle').value   = g.feedCycle || 3;
  document.getElementById('gecko-notes').value        = g.notes || '';
  resetPhotoSlots(g.photos || []);
  openModal('modal-gecko');
}

function deleteGecko(id) {
  if (!confirm('确定要删除这个个体吗？相关喂食、健康记录不会被删除。')) return;
  DB.deleteGecko(id);
  renderGeckoGrid();
  renderDashboard();
  updateGeckoSelects();
  toast('已删除个体');
}

// 快速喂食
function quickFeed(geckoId) {
  const g = DB.getGecko(geckoId);
  if (!g) return;
  populateFeedingModal();
  document.getElementById('feed-date').value = today();
  document.getElementById('feed-gecko').value = geckoId;
  openModal('modal-feeding');
}

// 显示个体详情
function showGeckoDetail(id) {
  const g = DB.getGecko(id);
  if (!g) return;

  const feedings = DB.getFeedings().filter(f => f.geckoId === id).slice(0, 20);
  const health   = DB.getHealthRecords().filter(h => h.geckoId === id);
  const weights  = health.filter(h => h.weight).sort((a, b) => b.date.localeCompare(a.date));
  const eggs     = DB.getEggs().filter(e => e.motherId === id);
  const photos   = (g.photos || []).filter(Boolean);

  document.getElementById('detail-title').textContent = g.name + ' 的档案';

  // 详情头部头像：有图用图，否则 emoji
  const detailAvatarHtml = photos[0]
    ? `<img src="${photos[0]}" alt="${escHtml(g.name)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid var(--primary-l);box-shadow:0 2px 10px rgba(0,0,0,.15)" />`
    : `<div class="detail-avatar">🦎</div>`;

  // 相册内容
  const galleryHtml = photos.length
    ? `<div class="photo-gallery">
        ${photos.map((src, i) => `
          <div class="photo-gallery-item" onclick="openLightbox('${src}')">
            <img src="${src}" alt="照片 ${i+1}" />
            ${i === 0 ? '<span class="photo-badge">头像</span>' : ''}
          </div>`).join('')}
      </div>`
    : '<div class="empty-hint">暂无照片，可在编辑个体时上传</div>';

  document.getElementById('gecko-detail-body').innerHTML = `
    <div class="detail-header">
      ${detailAvatarHtml}
      <div class="detail-name-block">
        <h2>${escHtml(g.name)} <small style="font-weight:400;font-size:.8em;color:var(--text-muted)">${g.sex || ''}</small></h2>
        <p>${escHtml(g.morph || '品系未记录')} · ${g.birthdate ? formatDate(g.birthdate) : '出生日期未知'} · ${healthTag(g.healthStatus)}</p>
      </div>
    </div>

    <div class="detail-tabs">
      <button class="detail-tab active" onclick="switchDetailTab('basic', this)">基本信息</button>
      <button class="detail-tab" onclick="switchDetailTab('photos', this)">📷 相册${photos.length ? ` (${photos.length})` : ''}</button>
      <button class="detail-tab" onclick="switchDetailTab('weight', this)">体重趋势</button>
      <button class="detail-tab" onclick="switchDetailTab('feeds', this)">喂食历史</button>
      <button class="detail-tab" onclick="switchDetailTab('deggs', this)">繁殖记录</button>
    </div>

    <div class="detail-section active" id="detail-basic">
      <div class="gecko-card-body" style="padding:0">
        ${infoRow('来源', g.source || '未记录')}
        ${infoRow('喂食周期', (g.feedCycle || 3) + ' 天')}
        ${infoRow('当前体重', g.weight ? g.weight + ' g' : '未记录')}
        ${infoRow('添加日期', formatDate(g.createdAt))}
        ${g.notes ? infoRow('备注', g.notes) : ''}
      </div>
    </div>

    <div class="detail-section" id="detail-photos">
      ${galleryHtml}
    </div>

    <div class="detail-section" id="detail-weight">
      <div class="weight-list">
        ${weights.length ? weights.map(h => `
          <div class="weight-item">
            <span>${formatDate(h.date)}</span>
            <span class="weight-value">${h.weight} g</span>
          </div>`).join('') : '<div class="empty-hint">暂无体重记录</div>'}
      </div>
    </div>

    <div class="detail-section" id="detail-feeds">
      <div class="feed-list">
        ${feedings.length ? feedings.map(f => `
          <div class="feed-item">
            <span>${formatDate(f.date)}</span>
            <span>${escHtml(f.type)}</span>
            <span>${escHtml(f.amount || '')}</span>
            <span>${feedStatusTag(f.status)}</span>
          </div>`).join('') : '<div class="empty-hint">暂无喂食记录</div>'}
      </div>
    </div>

    <div class="detail-section" id="detail-deggs">
      <div class="feed-list">
        ${eggs.length ? eggs.map(e => `
          <div class="feed-item">
            <span>${formatDate(e.date)}</span>
            <span>产蛋 ${e.count} 枚</span>
            <span>${fertilityTag(e.fertility)}</span>
            <span>${hatchTag(e.hatchStatus)}</span>
          </div>`).join('') : '<div class="empty-hint">暂无繁殖记录</div>'}
      </div>
    </div>
  `;

  openModal('modal-gecko-detail');
}

function infoRow(label, val) {
  return `<div class="gecko-info-row"><span class="gecko-info-label">${label}</span><span class="gecko-info-value">${escHtml(String(val))}</span></div>`;
}

function switchDetailTab(name, btn) {
  document.querySelectorAll('.detail-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.detail-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('detail-' + name).classList.add('active');
  btn.classList.add('active');
}

// ===== 保存个体 =====
function initGeckoModal() {
  document.getElementById('btn-add-gecko').addEventListener('click', () => {
    editingGeckoId = null;
    document.getElementById('gecko-modal-title').textContent = '添加个体';
    document.getElementById('gecko-name').value         = '';
    document.getElementById('gecko-sex').value          = '未知';
    document.getElementById('gecko-morph').value        = '';
    document.getElementById('gecko-birthdate').value    = '';
    document.getElementById('gecko-source').value       = '';
    document.getElementById('gecko-weight').value       = '';
    document.getElementById('gecko-health-status').value= '健康';
    document.getElementById('gecko-feed-cycle').value   = '3';
    document.getElementById('gecko-notes').value        = '';
    resetPhotoSlots([]);
    openModal('modal-gecko');
  });

  document.getElementById('save-gecko').addEventListener('click', () => {
    const name = document.getElementById('gecko-name').value.trim();
    if (!name) { toast('请填写名称或编号', 'error'); return; }

    const data = {
      name,
      sex:          document.getElementById('gecko-sex').value,
      morph:        document.getElementById('gecko-morph').value.trim(),
      birthdate:    document.getElementById('gecko-birthdate').value,
      source:       document.getElementById('gecko-source').value.trim(),
      weight:       document.getElementById('gecko-weight').value,
      healthStatus: document.getElementById('gecko-health-status').value,
      feedCycle:    parseInt(document.getElementById('gecko-feed-cycle').value) || 3,
      notes:        document.getElementById('gecko-notes').value.trim(),
      photos:       pendingPhotos.slice(),  // 保存3张图的base64（null 表示没上传）
    };

    if (editingGeckoId) {
      DB.updateGecko(editingGeckoId, data);
      toast('个体信息已更新');
    } else {
      DB.addGecko(data);
      toast('已添加新个体 ' + name);
    }

    closeModal('modal-gecko');
    renderGeckoGrid();
    renderDashboard();
    updateGeckoSelects();
  });
}

// ===================================================================
// ==================== 喂食记录 =====================================
// ===================================================================

function populateFeedingModal() {
  const sel = document.getElementById('feed-gecko');
  const geckos = DB.getGeckos();
  sel.innerHTML = geckos.length
    ? geckos.map(g => `<option value="${g.id}">${escHtml(g.name)}</option>`).join('')
    : '<option value="">暂无个体</option>';
}

function renderFeedingTable() {
  const tbody = document.getElementById('feeding-tbody');
  const filterGecko = document.getElementById('filter-gecko-feed').value;
  const filterMonth = document.getElementById('filter-month-feed').value;

  let records = DB.getFeedings();
  if (filterGecko) records = records.filter(f => f.geckoId === filterGecko);
  if (filterMonth) records = records.filter(f => f.date && f.date.startsWith(filterMonth));

  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-hint">暂无喂食记录</td></tr>';
    return;
  }

  const geckos = DB.getGeckos();
  const getName = id => { const g = geckos.find(x => x.id === id); return g ? g.name : '已删除'; };

  tbody.innerHTML = records.map(f => `
    <tr>
      <td>${formatDate(f.date)}</td>
      <td><strong>${escHtml(getName(f.geckoId))}</strong></td>
      <td>${escHtml(f.type || '—')}</td>
      <td>${escHtml(f.amount || '—')}</td>
      <td>${feedStatusTag(f.status)}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(f.notes||'')}">${escHtml(f.notes || '—')}</td>
      <td class="action-cell">
        <button class="btn-danger" onclick="deleteFeeding('${f.id}')">删除</button>
      </td>
    </tr>`).join('');
}

function deleteFeeding(id) {
  if (!confirm('确定删除这条喂食记录？')) return;
  DB.deleteFeeding(id);
  renderFeedingTable();
  renderDashboard();
  toast('已删除喂食记录');
}

function initFeedingModal() {
  document.getElementById('btn-add-feeding').addEventListener('click', () => {
    populateFeedingModal();
    document.getElementById('feed-date').value = today();
    openModal('modal-feeding');
  });

  document.getElementById('save-feeding').addEventListener('click', () => {
    const geckoId = document.getElementById('feed-gecko').value;
    const date    = document.getElementById('feed-date').value;
    if (!geckoId || !date) { toast('请选择个体和日期', 'error'); return; }

    const rec = {
      geckoId,
      date,
      type:     document.getElementById('feed-type').value,
      amount:   document.getElementById('feed-amount').value.trim(),
      status:   document.getElementById('feed-status').value,
      calcium:  document.getElementById('feed-calcium').value,
      notes:    document.getElementById('feed-notes').value.trim(),
    };
    DB.addFeeding(rec);
    closeModal('modal-feeding');
    renderFeedingTable();
    renderDashboard();
    toast('喂食记录已保存');
    document.getElementById('feed-amount').value = '';
    document.getElementById('feed-notes').value  = '';
  });

  document.getElementById('filter-gecko-feed').addEventListener('change', renderFeedingTable);
  document.getElementById('filter-month-feed').addEventListener('change', renderFeedingTable);
}

// ===================================================================
// ==================== 繁殖管理 =====================================
// ===================================================================

function populateEggModal() {
  const geckos = DB.getGeckos();
  const mothers = geckos.filter(g => g.sex === '雌' || g.sex === '未知');
  const fathers = geckos.filter(g => g.sex === '雄' || g.sex === '未知');

  document.getElementById('egg-mother').innerHTML = mothers.length
    ? mothers.map(g => `<option value="${g.id}">${escHtml(g.name)}</option>`).join('')
    : '<option value="">暂无雌性个体</option>';

  document.getElementById('egg-father').innerHTML =
    '<option value="">未知/未记录</option>' +
    fathers.map(g => `<option value="${g.id}">${escHtml(g.name)}</option>`).join('');
}

function renderBreedingGrid() {
  const grid = document.getElementById('breeding-grid');
  const eggs = DB.getEggs();

  if (!eggs.length) {
    grid.innerHTML = '<div class="empty-hint">暂无繁殖记录，点击右上角添加产蛋记录</div>';
    return;
  }

  const geckos = DB.getGeckos();
  const getName = id => { const g = geckos.find(x => x.id === id); return g ? g.name : '已删除'; };

  grid.innerHTML = eggs.map(e => {
    let progress = null;
    if (e.hatchStatus === '孵化中' && e.date && e.expectedDate) {
      const total = daysDiff(e.date) + daysDiff(e.expectedDate);
      const passed = daysDiff(e.date);
      if (total > 0) {
        progress = Math.min(100, Math.round(passed / total * 100));
      }
    }

    return `
    <div class="egg-card">
      <div class="egg-card-header">
        <div>
          <div class="egg-card-title">🥚 ${formatDate(e.date)} 产蛋</div>
          <div class="egg-card-date">${escHtml(getName(e.motherId))} ${e.fatherId ? '× ' + escHtml(getName(e.fatherId)) : ''}</div>
        </div>
        ${hatchTag(e.hatchStatus)}
      </div>
      <div class="egg-card-body">
        <div class="egg-info-row"><span class="egg-info-label">产蛋数量</span><span>${e.count} 枚</span></div>
        <div class="egg-info-row"><span class="egg-info-label">受精情况</span><span>${fertilityTag(e.fertility)}</span></div>
        <div class="egg-info-row"><span class="egg-info-label">孵化温度</span><span>${e.temp ? e.temp + ' ℃' : '未记录'}</span></div>
        <div class="egg-info-row"><span class="egg-info-label">孵化介质</span><span>${escHtml(e.medium || '未记录')}</span></div>
        <div class="egg-info-row"><span class="egg-info-label">预计孵化</span><span>${formatDate(e.expectedDate)}</span></div>
        ${e.notes ? `<div class="egg-info-row"><span class="egg-info-label">备注</span><span>${escHtml(e.notes)}</span></div>` : ''}

        ${progress !== null ? `
        <div class="hatch-progress">
          <div class="hatch-progress-label">
            <span>孵化进度</span>
            <span>${progress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${progress}%"></div>
          </div>
        </div>` : ''}
      </div>
      <div class="egg-card-footer">
        <button class="btn-icon" onclick="editEggStatus('${e.id}')">✏️ 更新状态</button>
        <button class="btn-danger" onclick="deleteEgg('${e.id}')">🗑️ 删除</button>
      </div>
    </div>`;
  }).join('');
}

function editEggStatus(id) {
  const e = DB.getEggs().find(x => x.id === id);
  if (!e) return;
  const status = prompt('更新孵化状态:\n孵化中 / 已孵化 / 坏蛋 / 未受精丢弃', e.hatchStatus);
  if (!status) return;
  const fertility = prompt('更新受精情况:\n待确认 / 受精 / 未受精 / 部分受精', e.fertility);
  DB.updateEgg(id, { hatchStatus: status, fertility: fertility || e.fertility });
  renderBreedingGrid();
  renderDashboard();
  toast('蛋的状态已更新');
}

function deleteEgg(id) {
  if (!confirm('确定删除这条产蛋记录？')) return;
  DB.deleteEgg(id);
  renderBreedingGrid();
  renderDashboard();
  toast('已删除产蛋记录');
}

function initEggModal() {
  document.getElementById('btn-add-egg').addEventListener('click', () => {
    populateEggModal();
    document.getElementById('egg-date').value = today();
    document.getElementById('egg-count').value = '2';
    document.getElementById('egg-hatch-status').value = '孵化中';
    document.getElementById('egg-notes').value = '';
    // 预计孵化日期：约60天后
    const exp = new Date();
    exp.setDate(exp.getDate() + 60);
    document.getElementById('egg-expected').value = exp.toISOString().split('T')[0];
    openModal('modal-egg');
  });

  document.getElementById('save-egg').addEventListener('click', () => {
    const motherId = document.getElementById('egg-mother').value;
    const date     = document.getElementById('egg-date').value;
    if (!motherId || !date) { toast('请选择母本个体和产蛋日期', 'error'); return; }

    const rec = {
      date,
      motherId,
      fatherId:    document.getElementById('egg-father').value,
      count:       parseInt(document.getElementById('egg-count').value) || 2,
      fertility:   document.getElementById('egg-fertility').value,
      temp:        document.getElementById('egg-temp').value,
      medium:      document.getElementById('egg-medium').value.trim(),
      hatchStatus: document.getElementById('egg-hatch-status').value,
      expectedDate:document.getElementById('egg-expected').value,
      notes:       document.getElementById('egg-notes').value.trim(),
    };
    DB.addEgg(rec);
    closeModal('modal-egg');
    renderBreedingGrid();
    renderDashboard();
    toast('产蛋记录已保存');
  });
}

// ===================================================================
// ==================== 健康档案 =====================================
// ===================================================================

function populateHealthModal() {
  const sel = document.getElementById('health-gecko');
  const geckos = DB.getGeckos();
  sel.innerHTML = geckos.length
    ? geckos.map(g => `<option value="${g.id}">${escHtml(g.name)}</option>`).join('')
    : '<option value="">暂无个体</option>';
}

function renderHealthTable() {
  const tbody = document.getElementById('health-tbody');
  const filterGecko = document.getElementById('filter-gecko-health').value;
  const filterType  = document.getElementById('filter-type-health').value;

  let records = DB.getHealthRecords();
  if (filterGecko) records = records.filter(h => h.geckoId === filterGecko);
  if (filterType)  records = records.filter(h => h.type === filterType);

  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-hint">暂无健康记录</td></tr>';
    return;
  }

  const geckos = DB.getGeckos();
  const getName = id => { const g = geckos.find(x => x.id === id); return g ? g.name : '已删除'; };

  tbody.innerHTML = records.map(h => `
    <tr>
      <td>${formatDate(h.date)}</td>
      <td><strong>${escHtml(getName(h.geckoId))}</strong></td>
      <td><span class="tag tag-gray">${typeLabel(h.type)}</span></td>
      <td>${h.weight ? h.weight + ' g' : '—'}</td>
      <td>${healthTag(h.status)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(h.desc||'')}">${escHtml(h.desc || '—')}</td>
      <td class="action-cell">
        <button class="btn-danger" onclick="deleteHealth('${h.id}')">删除</button>
      </td>
    </tr>`).join('');
}

function deleteHealth(id) {
  if (!confirm('确定删除这条健康记录？')) return;
  DB.deleteHealthRecord(id);
  renderHealthTable();
  renderDashboard();
  toast('已删除健康记录');
}

function initHealthModal() {
  document.getElementById('btn-add-health').addEventListener('click', () => {
    populateHealthModal();
    document.getElementById('health-date').value = today();
    document.getElementById('health-weight').value = '';
    document.getElementById('health-desc').value = '';
    openModal('modal-health');
  });

  document.getElementById('save-health').addEventListener('click', () => {
    const geckoId = document.getElementById('health-gecko').value;
    const date    = document.getElementById('health-date').value;
    if (!geckoId || !date) { toast('请选择个体和日期', 'error'); return; }

    const weight = document.getElementById('health-weight').value;
    const rec = {
      geckoId,
      date,
      type:   document.getElementById('health-type').value,
      weight: weight || null,
      status: document.getElementById('health-status').value,
      desc:   document.getElementById('health-desc').value.trim(),
    };
    DB.addHealthRecord(rec);

    // 同步更新个体体重
    if (weight) {
      DB.updateGecko(geckoId, { weight, healthStatus: rec.status });
    }

    closeModal('modal-health');
    renderHealthTable();
    renderDashboard();
    renderGeckoGrid();
    toast('健康记录已保存');
  });

  document.getElementById('filter-gecko-health').addEventListener('change', renderHealthTable);
  document.getElementById('filter-type-health').addEventListener('change', renderHealthTable);
}

// ===================================================================
// ==================== 仪表盘 / 总览 ================================
// ===================================================================

function renderDashboard() {
  const geckos   = DB.getGeckos();
  const feedings = DB.getFeedings();
  const eggs     = DB.getEggs();
  const health   = DB.getHealthRecords();

  // 统计
  document.getElementById('stat-total').textContent = geckos.length;

  const todayStr = today();
  const fedToday = feedings.filter(f => f.date === todayStr).length;
  document.getElementById('stat-fed-today').textContent = fedToday;

  const incubating = eggs.filter(e => e.hatchStatus === '孵化中').length;
  document.getElementById('stat-eggs').textContent = incubating;

  // 需关注：健康状态非健康 or 喂食超期
  const alerts = geckos.filter(g => {
    if (g.healthStatus && g.healthStatus !== '健康') return true;
    const lf = getLastFeed(g.id);
    if (!lf) return true;
    return daysDiff(lf.date) >= (g.feedCycle || 3);
  }).length;
  document.getElementById('stat-alert').textContent = alerts;

  // 今日日期显示
  document.getElementById('today-date').textContent = formatDate(todayStr) + '，' + ['日','一','二','三','四','五','六'][new Date().getDay()] + '曜日';

  // 喂食提醒
  const reminderList = document.getElementById('reminder-list');
  const needFeed = geckos.filter(g => {
    const lf = getLastFeed(g.id);
    if (!lf) return true;
    return daysDiff(lf.date) >= (g.feedCycle || 3);
  });
  if (!needFeed.length) {
    reminderList.innerHTML = '<div class="empty-hint">🎉 所有个体都已按时喂食！</div>';
  } else {
    reminderList.innerHTML = needFeed.map(g => {
      const lf = getLastFeed(g.id);
      const days = lf ? daysDiff(lf.date) : null;
      const urgent = days !== null && days > (g.feedCycle || 3) + 1;
      return `
      <div class="reminder-item ${urgent ? 'reminder-urgent' : ''}">
        <span class="ri-icon">${urgent ? '🔴' : '🟡'}</span>
        <span class="ri-gecko">${escHtml(g.name)}</span>
        <span class="ri-info">${lf ? `上次喂食：${formatDate(lf.date)}（${days} 天前）` : '从未记录喂食'}</span>
      </div>`;
    }).join('');
  }

  // 最新动态（合并最近记录）
  const activities = [];
  feedings.slice(0, 5).forEach(f => {
    const g = DB.getGecko(f.geckoId);
    activities.push({ date: f.date, text: `${g ? g.name : '?'} 喂食了 ${f.type}，状态：${f.status}`, icon: '🍽️' });
  });
  eggs.slice(0, 3).forEach(e => {
    const g = DB.getGecko(e.motherId);
    activities.push({ date: e.date, text: `${g ? g.name : '?'} 产蛋 ${e.count} 枚，受精：${e.fertility}`, icon: '🥚' });
  });
  health.slice(0, 5).forEach(h => {
    const g = DB.getGecko(h.geckoId);
    activities.push({ date: h.date, text: `${g ? g.name : '?'} 健康记录：${typeLabel(h.type)}${h.weight ? '，体重 ' + h.weight + 'g' : ''}`, icon: '💊' });
  });
  activities.sort((a, b) => b.date.localeCompare(a.date));

  const actList = document.getElementById('activity-list');
  if (!activities.length) {
    actList.innerHTML = '<div class="empty-hint">暂无记录</div>';
  } else {
    actList.innerHTML = activities.slice(0, 10).map(a => `
      <div class="activity-item">
        <span style="font-size:1.2rem">${a.icon}</span>
        <span class="activity-time">${formatDate(a.date)}</span>
        <span class="activity-text">${escHtml(a.text)}</span>
      </div>`).join('');
  }
}

// ===================================================================
// ==================== 下拉框同步 ===================================
// ===================================================================

function updateGeckoSelects() {
  const geckos = DB.getGeckos();
  const opts = geckos.map(g => `<option value="${g.id}">${escHtml(g.name)}</option>`).join('');

  // 喂食过滤
  const fgf = document.getElementById('filter-gecko-feed');
  const prevFgf = fgf.value;
  fgf.innerHTML = '<option value="">全部个体</option>' + opts;
  fgf.value = prevFgf;

  // 健康过滤
  const fgh = document.getElementById('filter-gecko-health');
  const prevFgh = fgh.value;
  fgh.innerHTML = '<option value="">全部个体</option>' + opts;
  fgh.value = prevFgh;
}

// ===== XSS 防护 =====
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ===================================================================
// ==================== 初始化 =======================================
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModalClose();
  initPhotoSlots();
  initGeckoModal();
  initFeedingModal();
  initEggModal();
  initHealthModal();
  updateGeckoSelects();
  renderDashboard();
});
