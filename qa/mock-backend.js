/* Synthetic records for isolated UI regression tests. Never loaded by index.html. */
function installClinicMock(){
 const date=(offset=0)=>{let d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const names=['레스틸렌 리도카인','보톡스 100U','주베룩 볼륨','스킨부스터','멸균 거즈','일회용 주사기','국소마취 크림','소독용 에탄올'];
 const profile={id:'qa-admin',hospital_id:'qa-hospital',name:'테스트 관리자',emp_no:'QA001',role:'HOSPITAL_ADMIN',active:true,force_password_change:false,login_id:'qa'};
 const state={session:null,calls:[],ids:new Set(),fetches:[],profiles:[profile,{id:'qa-staff',name:'테스트 직원',emp_no:'QA002',active:true,role:'STAFF'}],locations:[{id:'l1',name:'냉장고 1',active:true},{id:'l2',name:'시술실 1',active:true},{id:'l3',name:'재고 보관실',active:true}],products:names.map((name,i)=>({id:'p'+(i+1),name,category:i<4?'시술 제품':'의료 소모품',subcategory:i<2?'필러 / 보톡스':'기타',base_unit:'개',active:true,low_stock_threshold:10,expiry_sensitivity:'D',default_location_id:'l1',expiry_managed:true,package_qty:10})),purchases:[{id:'pr1',product_id:'p2',requested_qty:20,status:'PENDING_APPROVAL',actor_profile_id:'qa-admin',created_at:new Date().toISOString(),due_date:date(7)},{id:'pr2',product_id:'p3',requested_qty:10,status:'ORDERED',actor_profile_id:'qa-admin',created_at:new Date().toISOString(),due_date:date(-1)}],transactions:Array.from({length:18},(_,i)=>({id:'t'+i,product_id:'p'+(i%8+1),tx_type:i%4===0?'IN':i%7===0?'DISCARD':'USE',quantity:i%4===0?10:-1,actor_profile_id:'qa-admin',created_at:new Date(Date.now()-(i%7)*86400000).toISOString(),expiry_date:date(180),location_id:'l1'})),lotBalances:[{product_id:'p1',quantity:20,location_id:'l1',expiry_date:date(90),lot_no:'LOT-A'},{product_id:'p1',quantity:12,location_id:'l2',expiry_date:date(180),lot_no:'LOT-B'},...names.slice(1).map((_,i)=>({product_id:'p'+(i+2),quantity:[7,21,36,120,48,4,0][i],location_id:i===2?null:'l3',expiry_date:date(i===2?18:180),lot_no:'LOT-'+i})),{product_id:'p2',quantity:2,location_id:'l1',expiry_date:date(-3),lot_no:'EXPIRED'}],codes:[{id:'c1',product_id:'p1',code_value:'TEST-001',code_type:'BARCODE',active:true},{id:'c2',product_id:'p1',code_value:'01234567890128',code_type:'GTIN',active:true}],audits:[{id:'a1',action:'IN',description:'테스트 재고 입고',actor_profile_id:'qa-admin',created_at:new Date().toISOString(),reviewed:false}],counts:[],countItems:[],alerts:[]};
 window.__clinicMock=state;
 function balances(){return state.products.map(p=>({product_id:p.id,quantity:state.lotBalances.filter(l=>l.product_id===p.id).reduce((s,l)=>s+l.quantity,0)}))}
 function dataFor(table){return ({profiles:state.profiles,products:state.products,inventory_product_balances:balances(),inventory_lot_balances:state.lotBalances,product_codes:state.codes,locations:state.locations,inventory_transactions:state.transactions,purchase_requests:state.purchases,hospitals:[{id:'qa-hospital',name:'올리본의원',default_lead_days:7}],inventory_counts:state.counts,inventory_count_items:state.countItems,alert_events:state.alerts,audit_logs:state.audits})[table]||[]}
 class Query{
  constructor(table){this.table=table;this.filters=[];this.orders=[];this.maximum=Infinity;this.one=false;this.operation=null}
  select(){return this}eq(k,v){this.filters.push(x=>x[k]===v);return this}order(k,o={}){this.orders.push([k,o]);return this}limit(n){this.maximum=n;return this}single(){this.one=true;return this}maybeSingle(){this.one=true;return this}in(k,vals){this.filters.push(x=>vals.includes(x[k]));return this}
  update(value){this.operation={type:'update',value};return this}insert(value){this.operation={type:'insert',value};return this}delete(){this.operation={type:'delete'};return this}
  then(resolve,reject){
   let rows=dataFor(this.table).filter(x=>this.filters.every(f=>f(x)));
   if(this.operation?.type==='update')rows.forEach(x=>Object.assign(x,this.operation.value));
   if(this.operation?.type==='insert'){const values=Array.isArray(this.operation.value)?this.operation.value:[this.operation.value];values.forEach(x=>dataFor(this.table).push({...x,id:'new-'+Math.random()}))}
   for(const [k,o]of this.orders)rows.sort((a,b)=>String(a[k]||'').localeCompare(String(b[k]||''))*(o.ascending===false?-1:1));
   rows=rows.slice(0,this.maximum);return Promise.resolve({data:structuredClone(this.one?rows[0]||null:rows),error:null}).then(resolve,reject)
  }
 }
 const client={
  auth:{getSession:async()=>({data:{session:state.session},error:null}),getUser:async()=>({data:{user:state.session?{id:profile.id}:null},error:null}),setSession:async x=>{state.session=x;return {error:null}},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>{state.session=null;return {error:null}},updateUser:async()=>({error:null})},
  from:table=>new Query(table),
  rpc:async(name,args={})=>{
   state.calls.push({name,args:structuredClone(args)});
   if(name==='record_inventory_transaction_v18'){
    if(state.ids.has(args.p_idempotency_key))return {data:null,error:{message:'duplicate'}};
    state.ids.add(args.p_idempotency_key);
    let lot=state.lotBalances.find(l=>l.product_id===args.p_product_id&&l.location_id===args.p_location_id&&l.expiry_date===args.p_expiry_date&&l.lot_no===args.p_lot_no);
    if(args.p_quantity<0&&(!lot||lot.quantity+args.p_quantity<0))return {error:{message:'insufficient inventory'}};
    if(!lot){lot={product_id:args.p_product_id,quantity:0,location_id:args.p_location_id,expiry_date:args.p_expiry_date,lot_no:args.p_lot_no};state.lotBalances.push(lot)}
    lot.quantity+=args.p_quantity;state.transactions.unshift({id:'new-'+state.transactions.length,product_id:args.p_product_id,tx_type:args.p_tx_type,quantity:args.p_quantity,created_at:new Date().toISOString(),actor_profile_id:args.p_actor_profile_id,expiry_date:args.p_expiry_date,location_id:args.p_location_id});
   }
   if(name==='create_purchase_request')state.purchases.unshift({id:'new-pr',product_id:args.p_product_id,requested_qty:args.p_requested_qty,status:'PENDING_APPROVAL',created_at:new Date().toISOString(),due_date:args.p_due_date,actor_profile_id:args.p_actor_profile_id});
   return {data:null,error:null}
  }
 };
 window.supabase={createClient:()=>client};
 const realFetch=window.fetch.bind(window);
 window.fetch=async(url,options={})=>{
  if(String(url).includes('supabase.co')){
   state.fetches.push(String(url));
   if(String(url).includes('/login-with-id')){const p=JSON.parse(options.body||'{}');await new Promise(r=>setTimeout(r,100));return new Response(JSON.stringify(p.login_id==='qa'&&p.password==='test-password'?{session:{access_token:'qa-token',refresh_token:'qa-refresh'}}:{error:'Invalid credentials'}),{status:p.login_id==='qa'&&p.password==='test-password'?200:401,headers:{'Content-Type':'application/json'}})}
   throw new Error('Live Supabase request blocked in QA')
  }
  return realFetch(url,options)
 };
}
