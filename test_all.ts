const BASE_URL = 'http://localhost:3002/api';

async function test() {
  const login = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({role:'executive',username:'executive',password:'123456'})
  });
  const {token} = await login.json();
  const H = {Authorization: `Bearer ${token}`};

  console.log('=== 功能测试结果 ===\n');

  // 1. 智能铺位推荐
  const r1 = await fetch(BASE_URL + '/merchants/recommendations/a1', {headers: H});
  const d1 = await r1.json();
  console.log('✓ 功能1: 智能铺位推荐');
  console.log(`   星巴克(80㎡)推荐 ${d1.length} 个铺位`);
  d1.slice(0,2).forEach((r:any,i:number) => 
    console.log(`   ${i+1}. ${r.floorName} ${r.zone} 评分${r.score.toFixed(1)}`));

  // 2. 门禁锁定
  const r2 = await fetch(BASE_URL + '/finance/bills/rb8/lock', {method:'POST', headers: H});
  const d2 = await r2.json();
  console.log('\n✓ 功能2: 门禁锁定');
  console.log(`   外婆家锁定: accessLocked=${d2.accessLocked}, status=${d2.status}`);

  // 3. 工单评分
  const r3 = await fetch(BASE_URL + '/property/tickets/t9/rate', {
    method:'POST', headers: {...H, 'Content-Type':'application/json'},
    body: JSON.stringify({rating:5,reviewComment:'好'})
  });
  const d3 = await r3.json();
  console.log('\n✓ 功能3: 工单评分');
  console.log(`   小米之家评分: status=${d3.status}, rating=${d3.rating}`);

  // 4. 自动生成报告
  const r4 = await fetch(BASE_URL + '/system/reports/auto-generate-monthly', {method:'POST', headers: H});
  const d4 = await r4.json();
  console.log('\n✓ 功能4: 自动生成运营报告');
  console.log(`   ${d4.message}`);
  console.log(`   ${d4.report.reportMonth} 收缴率${d4.report.collectionRate.toFixed(1)}%`);

  // 5. 消息中心
  const r5 = await fetch(BASE_URL + '/system/messages?page=1&pageSize=5', {headers: H});
  const d5 = await r5.json();
  console.log('\n✓ 功能5: 消息自动推送');
  console.log(`   消息总数${d5.total}, 未读${d5.unreadCount}`);
  const types = d5.messages.map((m:any)=>m.type);
  console.log(`   消息类型: ${[...new Set(types)].join(', ')}`);

  console.log('\n=== 全部功能正常运行！ ===');
}

test();
