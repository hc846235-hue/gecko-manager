/* ============================================================
   睫角守宫演示数据生成脚本
   在浏览器控制台执行，或在 index.html 末尾临时引入
============================================================ */
(function seedDemoData() {

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // 检查是否已有数据，避免重复写入
  const existing = JSON.parse(localStorage.getItem('crested_geckos') || '[]');
  if (existing.length >= 3) {
    console.info('[Demo] 已有 ' + existing.length + ' 条个体数据，跳过写入');
    return;
  }

  // ─── 个体 ID ───────────────────────────────────────────
  const idLuna   = uid();
  const idMochi  = uid();
  const idApollo = uid();

  // ─── 个体数据 ──────────────────────────────────────────
  const geckos = [
    {
      id: idApollo,
      createdAt: '2025-08-10',
      name: 'Apollo',
      sex: '♂',
      morph: 'Flame',
      birthdate: '2024-03-15',
      source: '本地繁殖',
      weight: '52',
      healthStatus: '健康',
      feedCycle: 3,
      notes: '活泼好动，喜爱爬行，喂食积极',
      photos: [null, null, null],
    },
    {
      id: idLuna,
      createdAt: '2025-06-01',
      name: 'Luna',
      sex: '♀',
      morph: 'Pinstripe Harlequin',
      birthdate: '2023-09-20',
      source: '爬友转让',
      weight: '68',
      healthStatus: '健康',
      feedCycle: 3,
      notes: '性格温顺，体型较大，已有多次产蛋记录',
      photos: [null, null, null],
    },
    {
      id: idMochi,
      createdAt: '2025-12-01',
      name: 'Mochi',
      sex: '♀',
      morph: 'Super Dalmatian',
      birthdate: '2024-07-08',
      source: '国外进口',
      weight: '41',
      healthStatus: '观察中',
      feedCycle: 4,
      notes: '近期食欲略有下降，注意观察是否进入排卵期',
      photos: [null, null, null],
    },
  ];

  // ─── 喂食记录 ──────────────────────────────────────────
  const feedings = [
    // Apollo
    { id: uid(), geckoId: idApollo, date: '2026-03-15', type: '蟑螂', amount: '3只', status: '全部进食', calcium: true,  notes: '' },
    { id: uid(), geckoId: idApollo, date: '2026-03-12', type: '蟑螂', amount: '2只', status: '全部进食', calcium: false, notes: '' },
    { id: uid(), geckoId: idApollo, date: '2026-03-09', type: '果泥（CGD）', amount: '1份', status: '全部进食', calcium: false, notes: '换了新品牌果泥' },
    { id: uid(), geckoId: idApollo, date: '2026-03-06', type: '蟑螂', amount: '3只', status: '全部进食', calcium: true,  notes: '' },
    { id: uid(), geckoId: idApollo, date: '2026-03-03', type: '蟋蟀', amount: '2只', status: '部分进食', calcium: false, notes: '拒绝了1只' },
    // Luna
    { id: uid(), geckoId: idLuna, date: '2026-03-16', type: '果泥（CGD）', amount: '1份', status: '全部进食', calcium: false, notes: '' },
    { id: uid(), geckoId: idLuna, date: '2026-03-13', type: '蟑螂', amount: '4只', status: '全部进食', calcium: true,  notes: '补充钙质，孵化期后' },
    { id: uid(), geckoId: idLuna, date: '2026-03-10', type: '蟑螂', amount: '3只', status: '全部进食', calcium: true,  notes: '' },
    { id: uid(), geckoId: idLuna, date: '2026-03-07', type: '果泥（CGD）', amount: '1份', status: '全部进食', calcium: false, notes: '' },
    { id: uid(), geckoId: idLuna, date: '2026-03-04', type: '麦皮虫', amount: '5条', status: '全部进食', calcium: false, notes: '偶尔换换口味' },
    // Mochi
    { id: uid(), geckoId: idMochi, date: '2026-03-14', type: '果泥（CGD）', amount: '1份', status: '部分进食', calcium: false, notes: '只吃了一半，食欲不佳' },
    { id: uid(), geckoId: idMochi, date: '2026-03-10', type: '蟑螂', amount: '2只', status: '拒食', calcium: false, notes: '完全拒绝，待观察' },
    { id: uid(), geckoId: idMochi, date: '2026-03-06', type: '果泥（CGD）', amount: '1份', status: '部分进食', calcium: false, notes: '' },
    { id: uid(), geckoId: idMochi, date: '2026-03-02', type: '蟑螂', amount: '2只', status: '全部进食', calcium: true,  notes: '' },
    { id: uid(), geckoId: idMochi, date: '2026-02-27', type: '蟑螂', amount: '3只', status: '全部进食', calcium: false, notes: '' },
  ];

  // ─── 繁殖蛋记录 ────────────────────────────────────────
  const eggs = [
    {
      id: uid(),
      motherId: idLuna,
      fatherId: idApollo,
      date: '2026-01-18',
      count: 2,
      fertility: '受精',
      hatchStatus: '孵化中',
      incubTemp: '25',
      incubMedia: '蛭石',
      expectedDate: '2026-07-18',
      notes: 'Luna × Apollo 第2窝，蛋型饱满',
    },
    {
      id: uid(),
      motherId: idLuna,
      fatherId: idApollo,
      date: '2025-10-05',
      count: 2,
      fertility: '受精',
      hatchStatus: '已孵化',
      incubTemp: '24',
      incubMedia: '蛭石',
      expectedDate: '2026-04-05',
      notes: 'Luna × Apollo 第1窝，两只均孵出',
    },
    {
      id: uid(),
      motherId: idMochi,
      fatherId: '',
      date: '2026-02-10',
      count: 2,
      fertility: '未受精',
      hatchStatus: '废弃',
      incubTemp: '',
      incubMedia: '',
      expectedDate: '',
      notes: 'Mochi 单独产蛋，未配对，已废弃处理',
    },
  ];

  // ─── 健康档案（含体重）─────────────────────────────────
  const health = [
    // Apollo 体重追踪
    { id: uid(), geckoId: idApollo, date: '2026-03-10', type: '体重记录', weight: '52', notes: '状态良好' },
    { id: uid(), geckoId: idApollo, date: '2026-02-10', type: '体重记录', weight: '50', notes: '' },
    { id: uid(), geckoId: idApollo, date: '2026-01-10', type: '体重记录', weight: '48', notes: '' },
    { id: uid(), geckoId: idApollo, date: '2025-12-10', type: '体重记录', weight: '45', notes: '入冬后体重稳步增加' },
    { id: uid(), geckoId: idApollo, date: '2026-02-20', type: '蜕皮', weight: '', notes: '蜕皮顺利，皮完整' },
    // Luna 体重追踪
    { id: uid(), geckoId: idLuna, date: '2026-03-13', type: '体重记录', weight: '68', notes: '产蛋后恢复良好' },
    { id: uid(), geckoId: idLuna, date: '2026-01-20', type: '体重记录', weight: '72', notes: '产蛋前' },
    { id: uid(), geckoId: idLuna, date: '2025-11-15', type: '体重记录', weight: '70', notes: '' },
    { id: uid(), geckoId: idLuna, date: '2025-09-20', type: '体重记录', weight: '67', notes: '初始记录' },
    { id: uid(), geckoId: idLuna, date: '2026-01-18', type: '日常观察', weight: '', notes: '产蛋行为，已在产蛋盒内产下2枚' },
    { id: uid(), geckoId: idLuna, date: '2026-03-01', type: '蜕皮',     weight: '', notes: '蜕皮顺利' },
    // Mochi 体重 + 健康异常
    { id: uid(), geckoId: idMochi, date: '2026-03-12', type: '体重记录', weight: '41', notes: '较上月减轻2g，食欲下降' },
    { id: uid(), geckoId: idMochi, date: '2026-02-12', type: '体重记录', weight: '43', notes: '' },
    { id: uid(), geckoId: idMochi, date: '2026-01-12', type: '体重记录', weight: '44', notes: '' },
    { id: uid(), geckoId: idMochi, date: '2025-12-12', type: '体重记录', weight: '45', notes: '最重记录' },
    { id: uid(), geckoId: idMochi, date: '2026-03-10', type: '疾病/异常', weight: '', notes: '发现左眼有轻微眼皮粘连，滴眼液处理中' },
    { id: uid(), geckoId: idMochi, date: '2026-03-10', type: '治疗记录', weight: '', notes: '使用爬行类专用眼药水，每日2次，连续5天' },
  ];

  // ─── 写入 localStorage ─────────────────────────────────
  const mergeList = (key, newItems) => {
    const old = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...newItems, ...old]));
  };

  mergeList('crested_geckos',   geckos);
  mergeList('crested_feedings', feedings);
  mergeList('crested_eggs',     eggs);
  mergeList('crested_health',   health);

  console.info('[Demo] ✅ 演示数据写入完成！共 3 只个体、' + feedings.length + ' 条喂食、' + eggs.length + ' 窝蛋记录、' + health.length + ' 条健康档案');
  console.info('[Demo] 刷新页面即可看到数据');
})();
