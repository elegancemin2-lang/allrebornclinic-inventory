/* Presentation helpers only. Inventory writes continue through the existing RPCs. */
'use strict';
const clinicIconPaths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
 box:'<path d="m3 7 9-4 9 4v11l-9 4-9-4z"/><path d="m3 7 9 4 9-4M12 11v11M7.5 5l9 4"/>',
 scan:'<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M3 12h18M7 7v2m4-2v2m6-2v2M7 15v2m4-2v2m6-2v2"/>',
 chart:'<path d="M4 3v18h17M9 16v-4m5 4V7m5 9v-6"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 purchase:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 4h6m-6 4h3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 check:'<path d="m6 12 4 4 8-9"/><rect x="3" y="3" width="18" height="18" rx="4"/>',
 upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
 count:'<path d="M9 5h12M9 12h12M9 19h12M3 4v3m0 4v3m0 4v3M2 5h2m-2 7h2m-2 7h2"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--surface,#fff)"/><circle cx="15" cy="17" r="3" fill="var(--surface,#fff)"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 use:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 in:'<path d="M12 15V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0"/><circle cx="12" cy="10" r="2"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 14-2l1 2M4 16l1 2a8 8 0 0 0 14-2"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
 more:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="m8 12 3 3 5-6"/>'
};
function clinicIcon(name){return `<svg class="clinic-icon" viewBox="0 0 24 24" aria-hidden="true">${clinicIconPaths[name]||clinicIconPaths.box}</svg>`}
const clinicDescriptions={dashboard:'오늘의 재고와 처리할 일을 한눈에 확인하세요.',inventory:'품목·위치·유통기한별 재고를 확인하고 바로 작업하세요.',scan:'바코드와 QR로 품목을 찾아 빠르게 처리하세요.',purchase:'요청부터 승인, 발주, 입고까지 진행 상황을 확인하세요.',history:'입고·사용·폐기 작업의 기록을 확인하세요.',usage:'실제 사용 이력을 바탕으로 발주량을 살펴보세요.',alerts:'저재고와 유통기한, 구매 진행 상황을 확인하세요.',count:'시스템 재고와 실제 재고를 비교하세요.',import:'Excel 재고를 검토한 뒤 반영하세요.',audit:'재고 변경 기록과 관리자 확인 내역을 살펴보세요.',admin:'직원 권한과 품목·보관위치를 관리하세요.'};
let clinicPreviousFocus=null;
function initClinicUI(){
 document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=clinicIcon(e.dataset.icon));
 document.querySelectorAll('input,select,textarea').forEach(e=>{
  if(e.type==='hidden'||e.getAttribute('aria-label'))return;
  const label=e.closest('.field')?.querySelector('label');
  if(label){if(e.id){label.htmlFor=e.id;}else e.setAttribute('aria-label',label.textContent.trim())}
  else if(e.id)e.setAttribute('aria-label',e.placeholder||({invCategory:'품목 분류',invLocation:'보관 위치',invExpiryFilter:'유통기한 필터',invStockFilter:'재고 상태',invSort:'재고 정렬'}[e.id])||e.options?.[0]?.textContent||e.id);
 });
 document.querySelectorAll('.table-wrap').forEach(e=>{e.tabIndex=0;e.setAttribute('aria-label','표 · 가로로 스크롤할 수 있습니다')});
 document.querySelectorAll('.notice[id]').forEach(e=>e.setAttribute('aria-live','polite'));
 document.getElementById('modal')?.addEventListener('input',e=>{if(e.target.id==='txQty')renderTransactionPreview()});
 document.getElementById('modal')?.addEventListener('change',e=>{if(['txProduct','txLotSelect'].includes(e.target.id))renderTransactionPreview()});
 document.addEventListener('keydown',e=>{
  const modal=document.getElementById('modal');if(e.key!=='Tab'||!modal||modal.classList.contains('hide'))return;
  const items=[...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);
  if(!items.length)return;
  const first=items[0],last=items.at(-1);
  if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus()}
 });
 clinicPageChanged('dashboard');
 const date=document.getElementById('clinicDate');if(date)date.textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
}
function clinicPageChanged(page){
 const description=document.getElementById('pageDescription');if(description)description.textContent=clinicDescriptions[page]||'';
 document.querySelectorAll('.nav button[data-page],.mobile-nav button[data-page]').forEach(b=>{const active=b.dataset.page===page;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 const more=document.querySelector('.mobile-nav [data-more]');if(more)more.classList.toggle('active',!['dashboard','inventory','purchase'].includes(page));
}
function clinicModalOpened(){
 const modal=document.getElementById('modal');if(!modal.contains(document.activeElement))clinicPreviousFocus=document.activeElement;
 document.body.classList.add('modal-open');
 modal.querySelectorAll('.field').forEach(f=>{const label=f.querySelector('label'),input=f.querySelector('input:not([type="hidden"]),select,textarea');if(label&&input?.id)label.htmlFor=input.id});
 modal.querySelectorAll('button').forEach(b=>{if(!b.type)b.type='button'});
 modal.querySelector('.sheet').focus({preventScroll:true});
}
function clinicModalClosed(){document.body.classList.remove('modal-open');if(clinicPreviousFocus?.isConnected)clinicPreviousFocus.focus({preventScroll:true});clinicPreviousFocus=null}
function toggleClinicPassword(){const input=document.getElementById('loginPw'),button=document.getElementById('clinicPasswordToggle'),shown=input.type==='password';input.type=shown?'text':'password';button.setAttribute('aria-label',shown?'비밀번호 숨기기':'비밀번호 보기');button.setAttribute('aria-pressed',String(shown))}
function toggleInventoryFilters(){const box=document.getElementById('inventoryFilters'),expanded=box.classList.toggle('filters-open');document.getElementById('inventoryFilterToggle').setAttribute('aria-expanded',String(expanded))}
function resetClinicInventoryFilters(){['invCategory','invLocation','invExpiryFilter','invStockFilter'].forEach(id=>document.getElementById(id).value='all');document.getElementById('invSort').value='name';document.getElementById('invQ').value='';renderInventory()}
function clearClinicFilter(id){document.getElementById(id).value=id==='invQ'?'':'all';renderInventory()}
function renderClinicInventory(rows){
 document.getElementById('inventoryCount').textContent=`전체 ${products.length}품목 · 표시 ${rows.length}품목`;
 const chips=['invQ','invCategory','invLocation','invExpiryFilter','invStockFilter'].map(id=>{const el=document.getElementById(id);if(!el.value||el.value==='all')return '';const text=id==='invQ'?`검색: ${el.value}`:el.selectedOptions[0]?.textContent||el.value;return `<button class="filter-chip" onclick="clearClinicFilter('${id}')" aria-label="${esc(text)} 필터 해제">${esc(text)} ×</button>`}).join('');
 document.getElementById('inventoryFilterChips').innerHTML=chips;
 document.getElementById('mobileInventory').innerHTML=rows.map(p=>{
  const qty=productQty(p.id),low=qty<gradeStockThreshold(p),category=[p.category,p.subcategory].filter(Boolean).join(' · ')||'미분류';
  const locationsText=productLocations(p.id).map(x=>`<span class="loc-chip">${esc(x.id?byId(locations,x.id)?.name||'미등록':'위치 미지정')} <b>${fmt(x.qty)}</b></span>`).join('')||'<span class="tiny muted">보관 중인 재고가 없습니다.</span>';
  return `<article class="inventory-card"><div class="inventory-card-top"><div><button class="inventory-card-title" onclick="openProductDetail('${p.id}')">${esc(p.name)}</button><div class="inventory-card-category">${esc(category)}</div></div><div class="inventory-card-quantity">${fmt(qty)}<small>${esc(p.base_unit||'개')}</small></div></div><div class="inventory-card-meta"><span>${esc(expiryText(productNearestExpiry(p.id)))}</span><span class="badge ${low?'b-low':'b-ok'}">${low?'저재고':'정상'}</span></div><div>${locationsText}</div><div class="inventory-card-actions"><button class="primary" onclick="openTransaction('USE','${p.id}')">사용</button><button class="secondary" onclick="openTransaction('IN','${p.id}')">입고</button><button class="secondary" onclick="openProductDetail('${p.id}')">상세</button></div></article>`
 }).join('')||`<div class="empty-state">${clinicIcon('search')}<b>조건에 맞는 품목이 없습니다.</b><small>검색어나 필터를 변경해보세요.</small><button class="ghost" style="margin-top:12px" onclick="resetClinicInventoryFilters()">필터 초기화</button></div>`;
}
function renderClinicDashboard(){
 const name=document.getElementById('clinicGreeting');if(name)name.textContent=me?.name?`${me.name}님, 오늘도 편안한 하루 보내세요.`:'오늘 필요한 재고와 처리할 일을 확인하세요.';
 const avatar=document.getElementById('clinicAvatar');if(avatar)avatar.textContent=(me?.name||'AR').slice(0,1);
 const role=document.getElementById('sideRole');if(role)role.textContent={SUPER_ADMIN:'최고관리자',HOSPITAL_ADMIN:'병원 관리자',STAFF:'직원'}[me?.role]||me?.role||'';
 const badge=document.getElementById('navAlertCount');if(badge){const count=Number(document.getElementById('kLow').textContent)+Number(document.getElementById('kExp3').textContent)+Number(document.getElementById('kPurchase').textContent)+Number(document.getElementById('kExp6').textContent);badge.textContent=count;badge.classList.toggle('hide',count===0)}
 const colors={IN:'#899d80',USE:'#bd8e75',DISCARD:'#d3b85d'},types=['IN','USE','DISCARD'];
 const days=Array.from({length:7},(_,i)=>{const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-6+i);return {key:localTodayForClinic(date),label:`${date.getMonth()+1}/${date.getDate()}`,IN:0,USE:0,DISCARD:0}});
 const bucket=new Map(days.map(d=>[d.key,d]));transactions.forEach(t=>{const date=dateObj(t.created_at),day=date&&bucket.get(localTodayForClinic(date));if(day&&types.includes(t.tx_type))day[t.tx_type]++});
 const total=days.reduce((s,d)=>s+types.reduce((n,t)=>n+d[t],0),0);document.getElementById('activityTotal').innerHTML=`${fmt(total)}<small>최근 7일 작업 건수</small>`;
 const max=Math.max(1,...days.map(d=>types.reduce((s,t)=>s+d[t],0))),scale=Math.max(2,Math.ceil(max/2)*2),width=440,height=178,left=30,right=12,top=12,bottom=32,plot=height-top-bottom;
 let svg=`<svg class="activity-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="최근 7일 입고·사용·폐기 작업 ${total}건">`;
 [0,.5,1].forEach(r=>{const y=top+plot*(1-r);svg+=`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#e8ece2" ${r?'stroke-dasharray="3 5"':''}/><text x="${left-8}" y="${y+3}" text-anchor="end" fill="#98a08f" font-size="9">${scale*r}</text>`});
 const slot=(width-left-right)/7;
 days.forEach((d,i)=>{let y=top+plot;types.forEach(t=>{const h=d[t]/scale*plot;if(h){y-=h;svg+=`<rect x="${left+slot*i+(slot-22)/2}" y="${y}" width="22" height="${h}" rx="2" fill="${colors[t]}"><title>${d.label} ${({IN:'입고',USE:'사용',DISCARD:'폐기'})[t]} ${d[t]}건</title></rect>`}});svg+=`<text x="${left+slot*i+slot/2}" y="${height-9}" text-anchor="middle" fill="#89917f" font-size="10">${d.label}</text>`});
 svg+='</svg>';document.getElementById('activityChart').innerHTML=svg;
 document.getElementById('activityNote').textContent=total?'입고·사용·폐기 건수 기준 · 불러온 이력 범위 내 집계':'최근 7일 입고·사용·폐기 이력이 없습니다.';
}
function localTodayForClinic(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function renderTransactionPreview(){
 const qtyField=document.getElementById('txQty'),type=document.getElementById('txType')?.value;if(!qtyField||!['USE','DISCARD'].includes(type))return;
 let preview=document.getElementById('transactionPreview');if(!preview){preview=document.createElement('div');preview.id='transactionPreview';preview.className='transaction-preview';preview.setAttribute('aria-live','polite');qtyField.closest('.field').appendChild(preview)}
 const lots=txLots(document.getElementById('txProduct').value,type),lot=lots[Number(document.getElementById('txLotSelect')?.value||0)],qty=Number(qtyField.value),valid=Boolean(lot)&&Number.isInteger(qty)&&qty>0&&qty<=Number(lot.quantity);
 preview.classList.toggle('bad',!valid);
 if(!lot){preview.textContent='선택할 수 있는 재고가 없습니다.';return}
 const stock=Number(lot.quantity);preview.innerHTML=valid?`<span>${type==='USE'?'사용':'폐기'} 후 선택 재고<small>저장 전 예상 수량</small></span><strong>${fmt(stock)} → ${fmt(stock-qty)}<small>${esc(byId(locations,lot.location_id)?.name||'위치 미지정')}</small></strong>`:`<span>1~${fmt(stock)}개 범위의 정수를 입력하세요.</span>`;
}
