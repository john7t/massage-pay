/* leave2.js — 預排休假 2.0 前端(v1.0-001)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 lv2:  ?lv2=l  預排休假(月曆)
   規則與後端見 gas-leave2.gs.txt:每月 9 日 00:00 ~ 12 日 24:00 可登記「下個月」休假,期間免審批(超休需主管簽字);之後的送出需主管審批;可提前 2 個月暫存。
   早/晚班分開統計:每人每月各 6 天、每店每日各班別最多 6 人。 */
(function(){
const{useState,useEffect}=React;
const C=window.S2Core;
if(!C){window.Leave2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{api,useLoad,Box,Card,Btn,Loading,Msg,NeedUser,barOf,go}=C;
const Chip=C.Chip||(({on,children,onClick})=>(<button onClick={onClick} className={'px-4 py-2 rounded-full border text-sm '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')}>{children}</button>));

const L={
  zh:{title:'預排休假',early:'早班',late:'晚班',shift:'登記班別',tapHint:'點日期登記休假（目前：{s}）；點已登記的日期可取消',
    draft:'暫存',submit:'送出休假單',saved:'已暫存 {n} 天',sent:'已送出：{a} 天生效，{p} 天待主管簽核',fail:'失敗',
    st_tooEarly:'還不能暫存（最早可提前 2 個月暫存）',st_draft:'尚未開放送出，可先排好暫存；{o} 起可送出，期間免審批',
    st_open:'登記期間中（到 {c} 前）：送出免審批，超休需主管簽字',st_late:'已超過免審批期間：送出後需主管審批',st_past:'這個月已過',
    used:'已排',days:'天',over:'超過 {n} 天，超休需主管簽字',full:'當日已滿 {n} 人，需主管簽字',
    cancelAsk:'要取消這天的休假嗎？',submitAsk:'確定送出這些休假嗎？',submitOver:'其中有超休，需主管簽字後才生效。',
    fullWarn:'你申請 {d} 這幾天當天已排休超過 6 人，你的申請可能會被調整。現在調整會比之後通知調整時有更多選擇。\n是否仍要送出申請？',
    paperT:'找到紙本匯入的休假',paperTxt:'系統有 {n} 筆編號 {c} 號、{m} 月的紙本休假（{l}）。若這是你的，請按「綁定到我的帳號」，之後就能在這裡查看與管理。',paperBtn:'這是我的，綁定到我的帳號',paperAsk:'確定把這些紙本匯入的休假綁定到你的帳號嗎？',paperOk:'已綁定 {n} 筆',rosterTitle:'總休表（依申請順序）',rosterHint:'每班別平日名額 {w} 人、週六日 {e} 人（可在設定調整）。白色＝名額內，橘色＝超出名額、需主管協調改假；主管排休不佔名額。已簽核保留的人，號碼下方以紅色小字標註批准主管編號。',mgrTag:'主管',
    leaveN:'排休 {n}人',adjTitle:'休假調整表',adjHint:'推播＝通知同仁改休其他天；若口頭確認該天確實需要休假，按「同意簽核」保留，總休表會在號碼下方以紅色小字標註批准主管編號。',
    notifyAll:'全部推播通知',notify:'推播通知',notifyAgain:'再次通知',sign:'同意簽核',unsignSure:'確定撤銷簽核？',adjDone:'已處理',adjTodo:'未處理',adjAll:'全部展開',adjNone2:'全部收合',seqBy:'排序',seqByOrder:'依順序',seqByCode:'依編號',seqSearch:'搜尋編號',unsign:'撤銷簽核',notified:'已通知 {t}',signedBy:'已簽核 {c}',pos:'第 {n} 位（超額 {k}）',adjNone:'沒有需要調整的人',
    notifyAsk:'要推播通知這些人改休其他天嗎？',signAsk:'確定同意這位同仁保留這天休假嗎？',overTag:'超額，待主管協調',
    seqTitle:'紙本順序編號',seqHint:'紙本流程初期：依櫃台收件順序填寫，總休表依此排序；沒填的排在後面（再依送出時間）。',seqSave:'存',seqMine:'我的順序編號',seqWait:'待櫃台填寫',seqDays:'{n} 天',
    setTitle:'名額與順序設定（{s}）',wdQ:'平日每班別名額',weQ:'週六日名額',seqModeL:'申請順序依據',seqPaper:'櫃台紙本編號',seqTime:'系統送出時間',setSave:'儲存設定',setOk:'已儲存',
    flag_late:'超過免審批期間',flag_person:'個人超過每月 6 天',flag_day:'當日已滿 6 人',
    s_approved:'已生效',s_pending:'待簽核',s_draft:'暫存',s_rejected:'已退回',
    pendingTitle:'待簽核',noPending:'目前沒有待簽核',ok:'簽字同意',rej:'退回',roster:'當日名單（* = 待簽核）',none:'無',
    notTeacher:'只有已登記的老師可以登記休假（主管可在下方簽核與查看名單）',store:'店別',back:'返回',
    sum:'本月已排',mineList:'我的休假',empty:'尚未登記',
    boardTitle:'總休表：長假／課業',boardNone:'本月沒有長假或課業安排',kLeave:'長假',kSchool:'課業（固定上班日）',pendingEnd:'未定',
    longTitle:'長假／課業申請',longBtn:'＋ 申請長假／固定上班日',longHint:'長假（例如回越南）或因課業只上班固定幾天：需事前提出，主管審核後才生效，不佔每月 6 天與每日 6 人額度。',
    kind:'類型',startD:'開始日期',endD:'結束日期',endOpt:'結束日期（未定可留空）',workDays:'上班的星期',reason:'原因（選填）',sendLong:'送出申請',
    weekly:'每週{d}上班',since:'起',cancelLong:'取消申請',setEnd:'補結束日',setEndAsk:'輸入結束日期（YYYY-MM-DD）',longSent:'已送出，等主管審核',
    s_cancelled:'已取消',wk:['日','一','二','三','四','五','六']},
  vi:{title:'Đăng ký nghỉ trước',early:'Ca sáng',late:'Ca tối',shift:'Chọn ca',tapHint:'Chạm vào ngày để đăng ký nghỉ (hiện tại: {s}); chạm ngày đã đăng ký để hủy',
    draft:'Lưu tạm',submit:'Gửi đơn nghỉ',saved:'Đã lưu tạm {n} ngày',sent:'Đã gửi: {a} ngày có hiệu lực, {p} ngày chờ quản lý ký',fail:'Thất bại',
    st_tooEarly:'Chưa thể lưu tạm (tối đa trước 2 tháng)',st_draft:'Chưa mở gửi đơn, có thể lưu tạm; từ {o} gửi đơn không cần duyệt',
    st_open:'Đang trong thời gian đăng ký (đến {c}): gửi không cần duyệt, vượt mức cần quản lý ký',st_late:'Đã quá thời gian không cần duyệt: gửi đơn cần quản lý duyệt',st_past:'Tháng này đã qua',
    used:'Đã xếp',days:'ngày',over:'Vượt {n} ngày, cần quản lý ký',full:'Ngày này đã đủ {n} người, cần quản lý ký',
    cancelAsk:'Hủy ngày nghỉ này?',submitAsk:'Xác nhận gửi các ngày nghỉ này?',submitOver:'Có ngày vượt mức, cần quản lý ký mới có hiệu lực.',
    fullWarn:'Các ngày bạn xin: {d} đã có hơn 6 người nghỉ, đơn của bạn có thể bị điều chỉnh. Điều chỉnh ngay bây giờ sẽ có nhiều lựa chọn hơn so với khi được thông báo sau.\nBạn vẫn muốn gửi đơn?',
    leaveN:'{n} người nghỉ',adjTitle:'Bảng điều chỉnh nghỉ phép',adjHint:'Thông báo = báo đồng nghiệp đổi sang ngày khác; nếu đã hỏi trực tiếp và thật sự cần nghỉ ngày đó, bấm "Ký đồng ý" để giữ lại, tổng bảng sẽ ghi mã quản lý phê duyệt bằng chữ đỏ nhỏ dưới số.',
    notifyAll:'Thông báo tất cả',unsignSure:'Chắc chắn hủy ký?',adjDone:'Đã xử lý',adjTodo:'Chưa xử lý',adjAll:'Mở tất cả',adjNone2:'Thu gọn tất cả',seqByOrder:'Theo thứ tự',seqByCode:'Theo mã',seqSearch:'Tìm mã',notify:'Thông báo',notifyAgain:'Thông báo lại',sign:'Ký đồng ý',unsign:'Hủy ký',notified:'Đã báo {t}',signedBy:'Đã ký {c}',pos:'Vị trí {n} (vượt {k})',adjNone:'Không có ai cần điều chỉnh',
    notifyAsk:'Gửi thông báo cho những người này đổi sang ngày khác?',signAsk:'Đồng ý cho giữ ngày nghỉ này?',overTag:'Vượt mức, chờ quản lý điều phối',
    seqTitle:'Số thứ tự đơn giấy',seqHint:'Giai đoạn đầu dùng đơn giấy: nhập theo thứ tự quầy nhận đơn, bảng tổng hợp sắp xếp theo số này; người chưa nhập xếp sau.',seqSave:'Lưu',seqMine:'Số thứ tự của tôi',seqWait:'Chờ quầy nhập',seqDays:'{n} ngày',
    setTitle:'Cài đặt hạn mức & thứ tự ({s})',wdQ:'Hạn mức ngày thường mỗi ca',weQ:'Hạn mức T7/CN',seqModeL:'Căn cứ thứ tự đăng ký',seqPaper:'Số thứ tự đơn giấy',seqTime:'Thời gian gửi trên hệ thống',setSave:'Lưu cài đặt',setOk:'Đã lưu',
    paperT:'Tìm thấy ngày nghỉ nhập từ bản giấy',paperTxt:'Có {n} ngày nghỉ bản giấy của số {c}, tháng {m} ({l}). Nếu là của bạn, bấm "Liên kết".',paperBtn:'Của tôi, liên kết vào tài khoản',paperAsk:'Liên kết các ngày nghỉ này vào tài khoản của bạn?',paperOk:'Đã liên kết {n} ngày',rosterTitle:'Bảng nghỉ tổng hợp (theo thứ tự đăng ký)',rosterHint:'Hạn mức mỗi ca: ngày thường {w} người, T7/CN {e} người (có thể chỉnh trong cài đặt). Màu trắng = trong hạn mức, màu cam = vượt, cần quản lý điều phối; nghỉ của quản lý không tính hạn mức. Người đã được ký giữ lại có mã quản lý chữ đỏ nhỏ dưới số.',mgrTag:'QL',
    flag_late:'Quá thời gian không cần duyệt',flag_person:'Vượt 6 ngày/tháng',flag_day:'Ngày đã đủ 6 người',
    s_approved:'Có hiệu lực',s_pending:'Chờ ký',s_draft:'Lưu tạm',s_rejected:'Bị từ chối',
    pendingTitle:'Chờ ký',noPending:'Không có đơn chờ ký',ok:'Ký đồng ý',rej:'Từ chối',roster:'Danh sách trong ngày (* = chờ ký)',none:'Không có',
    notTeacher:'Chỉ KTV đã đăng ký mới được đăng ký nghỉ (quản lý có thể ký duyệt và xem danh sách bên dưới)',store:'Chi nhánh',back:'Quay lại',
    sum:'Đã xếp tháng này',mineList:'Ngày nghỉ của tôi',empty:'Chưa đăng ký',
    boardTitle:'Bảng nghỉ dài hạn / đi học',boardNone:'Tháng này không có nghỉ dài hạn hoặc lịch đi học',kLeave:'Nghỉ dài hạn',kSchool:'Đi học (ngày làm cố định)',pendingEnd:'chưa định',
    longTitle:'Xin nghỉ dài hạn / ngày làm cố định',longBtn:'+ Xin nghỉ dài hạn / ngày làm cố định',longHint:'Nghỉ dài hạn (ví dụ về Việt Nam) hoặc chỉ đi làm vài ngày cố định vì đi học: cần xin trước, quản lý duyệt mới có hiệu lực, không tính vào 6 ngày/tháng và 6 người/ngày.',
    kind:'Loại',startD:'Ngày bắt đầu',endD:'Ngày kết thúc',endOpt:'Ngày kết thúc (chưa định thì để trống)',workDays:'Các thứ đi làm',reason:'Lý do (không bắt buộc)',sendLong:'Gửi đơn',
    weekly:'Đi làm mỗi {d}',since:'từ',cancelLong:'Hủy đơn',setEnd:'Bổ sung ngày kết thúc',setEndAsk:'Nhập ngày kết thúc (YYYY-MM-DD)',longSent:'Đã gửi, chờ quản lý duyệt',
    s_cancelled:'Đã hủy',wk:['CN','T2','T3','T4','T5','T6','T7']}
};
const fmt=(s,o)=>String(s).replace(/\{(\w+)\}/g,(_m,k)=>o&&o[k]!==undefined?o[k]:'');
const p2=n=>String(n).padStart(2,'0');
const addMonth=(m,n)=>{const y=parseInt(m.slice(0,4),10),mo=parseInt(m.slice(5,7),10)-1+n;return (y+Math.floor(mo/12))+'-'+p2(((mo%12)+12)%12+1);};
const todayStr=()=>{const d=new Date(Date.now()+8*3600e3);return d.getUTCFullYear()+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCDate());};
const SH_COLOR={early:'bg-amber-500',late:'bg-indigo-500'};

const periodText=(x,t)=>x.start.slice(5).replace('-','/')+' ~ '+(x.end?x.end.slice(5).replace('-','/'):t.pendingEnd);
const longText=(x,t)=>x.kind==='leave'?t.kLeave:fmt(t.weekly,{d:String(x.days||'').split(',').filter(Boolean).map(i=>t.wk[parseInt(i,10)]).join(lang0(t)?' ':'')});
const lang0=(t)=>t.wk[0]==='CN';
function Leave2Routes(){
  const q=new URLSearchParams(location.search);
  if(q.get('lv2')==='pdf')return(<NeedUser render={(me)=><PdfPage me={me}/>}/>);
  return(<NeedUser render={(me)=><LeavePage me={me}/>}/>);
}

// ───────── 總休表 PDF（?lv2=pdf&month=YYYY-MM）：1~15 日一頁、16~月底一頁，長假／課業核准名單兩頁都列在最下方 ─────────
// 每天兩排：第一排 早班 1~10 位 | 晚班 1~10 位；第二排 11~20 位…（超過 20 人自動加排）
const PDF_W=794,PDF_H=1123; // A4 @96dpi
const loadScript=(src)=>new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=()=>res();s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});
function PdfCell({x,bl}){
  return(<td style={{border:'1px solid #999',borderLeft:bl?'2px solid #000':'1px solid #999',padding:0,height:24,textAlign:'center',verticalAlign:'middle',whiteSpace:'nowrap',overflow:'hidden',fontSize:12,textDecoration:x&&x.o?'underline':'none',fontWeight:x&&x.o?700:400}}>{x?<span>{x.c}{x.p?'*':''}{x.s?<sup style={{fontSize:7,color:'#d00',marginLeft:1}}>{x.s}</sup>:null}</span>:null}</td>);
}
function PdfPageSheet({title,sub,days,roster,month,longBoard,pageNo,pages,genAt}){
  const wkz=['日','一','二','三','四','五','六'];
  const th={border:'1px solid #333',background:'#eee',fontSize:12,padding:'3px 4px',textAlign:'center'};
  const td={border:'1px solid #999',padding:'2px 4px',verticalAlign:'middle'};
  const wkLine=(x)=>x.kind==='leave'?'長假':'課業　每週'+String(x.days||'').split(',').filter(Boolean).map(i=>wkz[parseInt(i,10)]).join('')+'上班';
  const N=Array.from({length:10});
  return(<div className="pdfpage" style={{width:PDF_W,height:PDF_H,background:'#fff',color:'#000',padding:'28px 30px',boxSizing:'border-box',fontFamily:'-apple-system,"PingFang TC","Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",sans-serif',position:'relative',overflow:'hidden'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',borderBottom:'2px solid #000',paddingBottom:4,marginBottom:6}}>
      <span style={{fontSize:18,fontWeight:700}}>{title}</span><span style={{fontSize:12}}>{sub}　第 {pageNo} / {pages} 頁</span></div>
    <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
      <colgroup><col style={{width:46}}/><col style={{width:26}}/>{N.map((_,i)=><col key={'e'+i}/>)}{N.map((_,i)=><col key={'l'+i}/>)}</colgroup>
      <thead><tr><th style={th} rowSpan={1}>日期</th><th style={th}>週</th><th style={th} colSpan={10}>早班休假（每格 1 人，第一排 1~10、第二排 11~20）</th><th style={{...th,borderLeft:'2px solid #000'}} colSpan={10}>晚班休假（每格 1 人，第一排 1~10、第二排 11~20）</th></tr></thead>
      <tbody>{days.map(dd=>{
        const date=month+'-'+String(dd).padStart(2,'0');const ro=roster[date]||{early:[],late:[]};
        const dow=new Date(parseInt(month.slice(0,4),10),parseInt(month.slice(5,7),10)-1,dd).getDay();const wk=dow===0||dow===6;
        const rows=Math.max(2,Math.ceil(Math.max(ro.early.length,ro.late.length)/10));
        const bg=wk?'#f2f2f2':'#fff';
        return Array.from({length:rows}).map((_,r)=>(<tr key={date+r} style={{background:bg}}>
          {r===0&&<td rowSpan={rows} style={{...td,textAlign:'center',fontWeight:700,fontSize:13,borderTop:'2px solid #333'}}>{parseInt(month.slice(5,7),10)}/{dd}</td>}
          {r===0&&<td rowSpan={rows} style={{...td,textAlign:'center',fontSize:12,color:wk?'#c00':'#000',borderTop:'2px solid #333'}}>{wkz[dow]}</td>}
          {N.map((_,i)=><PdfCell key={'e'+i} x={ro.early[r*10+i]}/>)}
          {N.map((_,i)=><PdfCell key={'l'+i} x={ro.late[r*10+i]} bl={i===0}/>)}</tr>));})}
      </tbody></table>
    <div style={{position:'absolute',left:30,right:30,bottom:30}}>
      <div style={{fontSize:13,fontWeight:700,borderBottom:'1px solid #000',marginBottom:3}}>長假／固定上班日（已核准）</div>
      {longBoard.length===0?<div style={{fontSize:12,color:'#555'}}>本月無</div>:<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px 16px'}}>
        {longBoard.map(x=>(<div key={x.id} style={{fontSize:12,lineHeight:'17px'}}><b>{x.code}</b>{'　'+wkLine(x)+'　'+x.start.slice(5).replace('-','/')+' ~ '+(x.end?x.end.slice(5).replace('-','/'):'未定')}{x.reason?'　'+x.reason:''}</div>))}</div>}
      <div style={{fontSize:10,color:'#666',marginTop:4}}>底線＝超出名額（待調整）　<span style={{color:'#d00'}}>紅字</span>＝批准主管編號　*＝待簽核　主管排休已列入　列印時間 {genAt}</div>
    </div>
  </div>);
}
function PdfPage({me}){
  const q=new URLSearchParams(location.search);
  const cur=todayStr().slice(0,7);const month=q.get('month')||addMonth(cur,1);const store=q.get('store')||'';
  const[st,reload]=useLoad('lv2Month',store?{month:month,store:store}:{month:month});
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[cap,setCap]=useState(false);
  const[scale,setScale]=useState(()=>Math.min(1,(Math.max(320,window.innerWidth||390)-24)/PDF_W));
  const d=st.data&&st.data.ok&&st.data.month===month?st.data:null;
  if(!d&&st.loading)return(<Loading/>);
  if(!d)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const nd=new Date(parseInt(month.slice(0,4),10),parseInt(month.slice(5,7),10),0).getDate();
  const p1=Array.from({length:15},(_,i)=>i+1),p2=Array.from({length:nd-15},(_,i)=>i+16);
  const title=d.store+'　'+month.slice(0,4)+' 年 '+parseInt(month.slice(5,7),10)+' 月　休假總表';
  const genAt=(()=>{const x=new Date(Date.now()+8*3600e3);return (x.getUTCMonth()+1)+'/'+x.getUTCDate()+' '+p2s(x.getUTCHours())+':'+p2s(x.getUTCMinutes());})();
  function p2s(n){return String(n).padStart(2,'0');}
  const sheetProps={roster:d.roster,month:month,longBoard:d.long.board,pages:2,genAt:genAt,title:title};
  const download=async()=>{
    setBusy(true);setErr('');setCap(true);
    try{
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await new Promise(r=>setTimeout(r,80));
      const pages=[].slice.call(document.querySelectorAll('.pdfpage'));
      const pdf=new window.jspdf.jsPDF({unit:'pt',format:'a4',orientation:'portrait'});
      for(let i=0;i<pages.length;i++){
        const cv=await window.html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',useCORS:true});
        if(i>0)pdf.addPage();
        pdf.addImage(cv.toDataURL('image/jpeg',0.92),'JPEG',0,0,595.28,841.89);
      }
      pdf.save('休假總表_'+d.store+'_'+month+'.pdf');
    }catch(e){setErr('產生 PDF 失敗（LINE 內建瀏覽器可能不支援下載，請按「用瀏覽器開啟」再下載）');}
    setCap(false);setBusy(false);
  };
  const external=()=>{try{if(window.liff&&window.liff.openWindow){window.liff.openWindow({url:location.href,external:true});return;}}catch(_e){}window.open(location.href,'_blank');};
  return(<div className="p-3 space-y-3">
    <style>{'@media print{.nop{display:none!important}.pdfwrap{transform:none!important;height:auto!important}.pdfpage{page-break-after:always}.pdfpage{height:1122px!important;overflow:hidden}.pdfpage:last-child{page-break-after:auto}@page{size:A4 portrait;margin:0}body{background:#fff!important}}'}</style>
    <div className="nop flex items-center justify-between"><button className="text-sm text-violet-300" onClick={()=>go('lv2=l')}>← 返回</button><h1 className="text-base font-bold text-white">📄 休假總表 PDF</h1><span/></div>
    <div className="nop flex gap-2"><Btn loading={busy} onClick={download}>下載 PDF（2 頁）</Btn><Btn color="bg-gray-800 text-gray-200 border border-gray-600" onClick={external}>用瀏覽器開啟</Btn></div>
    {err&&<p className="nop text-sm text-red-400 text-center">{err}</p>}
    <p className="nop text-xs text-gray-500">第 1 頁：1~15 日；第 2 頁：16~{nd} 日。每天兩排：每格 1 人（格線等寬），第一排 1~10 位，第二排 11~20 位。長假／固定上班日（已核准）兩頁最下方都有列出。</p>
    <div className="pdfwrap" style={{transform:cap?'none':'scale('+scale+')',transformOrigin:'top left',width:PDF_W,height:cap?'auto':(PDF_H*2+16)*scale/scale,marginBottom:cap?0:-(PDF_H*2+16)*(1-scale)}}>
      <PdfPageSheet {...sheetProps} days={p1} pageNo={1} sub={'1~15 日'}/>
      <div style={{height:16}} className="nop"/>
      <PdfPageSheet {...sheetProps} days={p2} pageNo={2} sub={'16~'+nd+' 日'}/>
    </div>
  </div>);
}

function LeavePage({me}){
  const lang=me.user&&me.user.lang==='vi'?'vi':'zh';const t=L[lang];
  const cur=todayStr().slice(0,7);
  const[month,setMonth]=useState(addMonth(cur,1));
  const[store,setStore]=useState('');
  const[shift,setShift]=useState((me.user&&me.user.shift)||'early');
  const[sel,setSel]=useState([]);const[focus,setFocus]=useState('');
  const lsGet=(k,df)=>{try{const v=localStorage.getItem(k);return v===null?df:v;}catch(e){return df;}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
  const[rMode,setRMode]=useState(()=>lsGet('lv2RosterMode','all'));
  const[showSign,setShowSign]=useState(()=>lsGet('lv2ShowSign','1')!=='0');
  const[rq,setRq]=useState('');const[rPg,setRPg]=useState(null);const[adjOpen,setAdjOpen]=useState({});const[armed,setArmed]=useState('');const[seqSort,setSeqSort]=useState('order');const[seqQ,setSeqQ]=useState('');const[lgOpen,setLgOpen]=useState(false);
  const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');const[err,setErr]=useState('');
  const[lf,setLf]=useState(null); // 長假/課業申請表單
  const[seqIn,setSeqIn]=useState({});const[cf,setCf]=useState(null);const[adjShift,setAdjShift]=useState((me.user&&me.user.shift)==='late'?'late':'early');
  const[st,reload]=useLoad('lv2Month',store?{month:month,store:store}:{month:month});
  const d=st.data&&st.data.ok&&st.data.month===month?st.data:null;
  useEffect(()=>{if(d)setSel(d.mine.filter(x=>x.status==='draft').map(x=>({date:x.date,shift:x.shift})));},[d&&d._at,d&&d.month]);
  useEffect(()=>{if(d&&new URLSearchParams(location.search).get('tab')==='adjust'&&!window.__lv2Scrolled){window.__lv2Scrolled=1;setTimeout(()=>{const el=document.getElementById('lv2-adjust');if(el&&el.scrollIntoView)el.scrollIntoView();},100);}},[d&&d.month]);
  if(!d&&st.loading)return(<Loading/>);
  if(!d&&!(st.data&&st.data.ok))return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  if(!d)return(<Loading/>);
  const today=todayStr();const lim=d.limits;
  const capOf=(date)=>{const dow=new Date(parseInt(date.slice(0,4),10),parseInt(date.slice(5,7),10)-1,parseInt(date.slice(8),10)).getDay();return (dow===0||dow===6)?lim.weekend:lim.weekday;};
  const mineBy={};d.mine.forEach(x=>{if(x.status!=='draft')(mineBy[x.date]=mineBy[x.date]||[]).push(x);});
  const selHas=(date,sh)=>sel.some(x=>x.date===date&&x.shift===sh);
  const used={early:0,late:0};
  d.mine.forEach(x=>{if(x.status==='approved'||x.status==='pending')used[x.shift]++;});
  sel.forEach(x=>{used[x.shift]++;});
  const run=async(fn)=>{setBusy(true);setErr('');setMsg('');try{await fn();}finally{setBusy(false);}};
  const onDay=(date)=>{
    setFocus(date);
    if(!d.canLeave||date<today||d.state==='past'||d.state==='tooEarly')return;
    const m=(mineBy[date]||[]).filter(x=>x.shift===shift)[0];
    if(m){
      if(!window.confirm(t.cancelAsk))return;
      run(async()=>{const r=await api('lv2Cancel',{id:m.id});if(r&&r.ok)reload();else setErr((r&&r.error)||t.fail);});
      return;
    }
    setSel(selHas(date,shift)?sel.filter(x=>!(x.date===date&&x.shift===shift)):sel.concat([{date:date,shift:shift}]));
  };
  const save=(submit)=>run(async()=>{
    if(submit){
      const fullDays=[];sel.forEach(x=>{if(((d.counts[x.date]||{})[x.shift]||0)>=capOf(x.date)){const k=parseInt(x.date.slice(5,7),10)+'/'+parseInt(x.date.slice(8),10);if(fullDays.indexOf(k)<0)fullDays.push(k);}});
      const overP=!d.isMgr&&(used.early>lim.person||used.late>lim.person);
      if(fullDays.length){if(!window.confirm(fmt(t.fullWarn,{d:fullDays.join(' ')})))return;}
      else if(!window.confirm(t.submitAsk+(overP?'\n'+t.submitOver:'')))return;
    }
    const r=await api('lv2Save',{month:month,items:JSON.stringify(sel),submit:!!submit});
    if(r&&r.ok){setMsg(submit?fmt(t.sent,{a:r.approved,p:r.pending}):fmt(t.saved,{n:r.saved}));reload();}
    else setErr((r&&r.error)||t.fail);
  });
  const longSend=()=>run(async()=>{
    const r=await api('lv2LongSave',{kind:lf.kind,start:lf.start,end:lf.end,days:lf.days.join(','),reason:lf.reason.trim()});
    if(r&&r.ok){setMsg(t.longSent);setLf(null);reload();}else setErr((r&&r.error)||t.fail);
  });
  const longAct=(action,params,ask)=>{if(ask&&!window.confirm(ask))return;run(async()=>{const r=await api(action,params);if(r&&r.ok)reload();else setErr((r&&r.error)||t.fail);});};
  const decide=(id,approve)=>run(async()=>{const r=await api('lv2Decide',{id:id,approve:approve});if(r&&r.ok)reload();else setErr((r&&r.error)||t.fail);});

  // 月曆
  const[y,m]=[parseInt(month.slice(0,4),10),parseInt(month.slice(5,7),10)];
  const first=new Date(y,m-1,1).getDay();const nd=new Date(y,m,0).getDate();
  const cells=[];for(let i=0;i<first;i++)cells.push(null);for(let i=1;i<=nd;i++)cells.push(month+'-'+p2(i));
  const banner={tooEarly:t.st_tooEarly,draft:fmt(t.st_draft,{o:(d.opens||'').slice(5)}),open:fmt(t.st_open,{c:(d.closes||'').slice(5)}),late:t.st_late,past:t.st_past}[d.state];
  const bannerCls=d.state==='open'?'border-emerald-700 bg-emerald-950/40 text-emerald-300':d.state==='late'?'border-amber-700 bg-amber-950/40 text-amber-300':'border-gray-700 bg-gray-900 text-gray-300';
  const flagText=(f)=>String(f||'').split(',').filter(Boolean).map(x=>t['flag_'+x]).join('、');
  const canEdit=d.canLeave&&(d.state==='draft'||d.state==='open'||d.state==='late');
  const canSubmit=canEdit&&d.state!=='draft'&&sel.length>0;
  const rosterOf=focus&&d.roster[focus];
  const isV=!!(d.isMgr||d.canSeq);
  const seqView=(()=>{let l=d.seqList.slice();if(seqSort==='code')l.sort((a,b)=>(parseInt(a.code,10)||1e9)-(parseInt(b.code,10)||1e9));if(seqQ)l=l.filter(x=>String(x.code).indexOf(seqQ)===0);return l;})();
  const allDays=cells.filter(Boolean);
  const rosterDates=allDays.filter(dt=>!(isV&&rMode==='future')||dt>=today);
  const PGN=5;const pgCount=Math.max(1,Math.ceil(rosterDates.length/PGN));
  const autoPg=(()=>{const i=rosterDates.indexOf(today);return i<0?0:Math.floor(i/PGN);})();
  const pg=Math.min(pgCount-1,Math.max(0,rPg===null?autoPg:rPg));
  const pageDates=rosterDates.slice(pg*PGN,pg*PGN+PGN);
  const pgLabel=pageDates.length?parseInt(pageDates[0].slice(8),10)+'~'+parseInt(pageDates[pageDates.length-1].slice(8),10)+(lang==='vi'?'':' 日'):'';

  return(<Box {...barOf(st,reload,lang)}>
    <h1 className="text-lg font-bold text-white">🏖️ {t.title}</h1>
    {d.stores&&d.stores.length>0&&<div className="flex gap-2 flex-wrap"><Chip on={!store} onClick={()=>setStore('')}>{d.me.store||t.store}</Chip>{d.stores.filter(x=>x!==d.me.store).map(x=><Chip key={x} on={store===x} onClick={()=>setStore(x)}>{x}</Chip>)}</div>}
    <div className="flex gap-2 flex-wrap">{[cur,addMonth(cur,1),addMonth(cur,2)].map(x=>(<Chip key={x} on={month===x} onClick={()=>{setMonth(x);setMsg('');setErr('');setFocus('');setRPg(null);}}>{parseInt(x.slice(5,7),10)}{lang==='vi'?'/'+x.slice(0,4):' 月'}</Chip>))}</div>
    <div className={'rounded-xl border px-3 py-2 text-xs '+bannerCls}>{banner}</div>
    {d.paper&&d.paper.n>0&&d.canLeave&&<Card className="space-y-2 border-amber-700">
      <p className="text-sm font-bold text-amber-300">📎 {t.paperT}</p>
      <p className="text-xs text-gray-300">{fmt(t.paperTxt,{n:d.paper.n,c:d.me.code,m:parseInt(month.slice(5,7),10),l:d.paper.items.map(x=>parseInt(x.date.slice(5,7),10)+'/'+parseInt(x.date.slice(8),10)+(x.shift==='early'?(lang==='vi'?' sáng':' 早'):(lang==='vi'?' tối':' 晚'))).join('、')})}</p>
      <Btn loading={busy} onClick={()=>{if(!window.confirm(t.paperAsk))return;run(async()=>{const r=await api('lv2Claim',{});if(r&&r.ok){setMsg(fmt(t.paperOk,{n:r.n}));reload();}else setErr((r&&r.error)||t.fail);});}}>{t.paperBtn}</Btn></Card>}
    {!d.canLeave&&<p className="text-xs text-gray-400">{t.notTeacher}</p>}
    {d.canLeave&&<div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-gray-400">{t.shift}</span>
      {['early','late'].map(s=><Chip key={s} on={shift===s} onClick={()=>setShift(s)}>{t[s]}</Chip>)}</div>}
    <Card className="space-y-2">
      <div className="grid grid-cols-7 text-center text-xs text-gray-500">{(lang==='vi'?['CN','T2','T3','T4','T5','T6','T7']:['日','一','二','三','四','五','六']).map(w=><div key={w}>{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date,i)=>{
          if(!date)return <div key={'e'+i}/>;
          const c=d.counts[date]||{early:0,late:0};const past=date<today;const mine=mineBy[date]||[];
          return(<button key={date} onClick={()=>onDay(date)} className={'rounded-lg border min-h-[58px] p-1 text-left flex flex-col '+(focus===date?'border-violet-400 ':'border-gray-800 ')+(past?'opacity-40 ':'bg-gray-900 ')}>
            <span className={'text-xs '+(date===today?'text-violet-300 font-bold':'text-gray-200')}>{parseInt(date.slice(8),10)}</span>
            <span className="flex flex-wrap gap-0.5 mt-0.5">
              {['early','late'].map(s=>{const mm=mine.filter(x=>x.shift===s)[0];const dr=selHas(date,s);
                if(!mm&&!dr)return null;
                const cls=mm?(mm.status==='pending'?'border border-dashed border-white/70 ':'')+SH_COLOR[s]+' text-white':'border border-dashed '+(s==='early'?'border-amber-400 text-amber-300':'border-indigo-400 text-indigo-300');
                return <span key={s} className={'text-[10px] leading-4 px-1 rounded '+cls}>{s==='early'?'早':'晚'}{mm?(mm.status==='pending'?'⏳':'✓'):''}</span>;})}
            </span>
            <span className="mt-auto text-[9px] leading-3 text-gray-500">
              <span className={c.early>=capOf(date)?'text-red-400':''}>{c.early}</span>/<span className={c.late>=capOf(date)?'text-red-400':''}>{c.late}</span></span>
          </button>);})}
      </div>
      <p className="text-[11px] text-gray-500">{lang==='vi'?'Số nhỏ: ca sáng/ca tối của chi nhánh (tối đa '+lim.weekday+')':'小字：本店 早班/晚班 已休人數（平日每班上限 '+lim.weekday+' 人）'}</p>
    </Card>
    {d.canLeave&&<Card className="space-y-1">
      <p className="text-sm font-bold text-white">{t.sum}</p>
      {['early','late'].map(s=>(<p key={s} className={'text-sm '+(used[s]>lim.person?'text-red-400':'text-gray-200')}>{t[s]}：{used[s]} / {lim.person} {t.days}{used[s]>lim.person?'　'+fmt(t.over,{n:lim.person}):''}</p>))}
      {sel.some(x=>((d.counts[x.date]||{})[x.shift]||0)>=capOf(x.date))&&<p className="text-xs text-red-400">{fmt(t.full,{n:lim.weekday})}</p>}
    </Card>}
    {canEdit&&<div className="flex gap-2"><Btn color="bg-gray-700 text-white" loading={busy} onClick={()=>save(false)}>{t.draft}</Btn>
      {d.state!=='draft'&&<Btn loading={busy} onClick={()=>canSubmit?save(true):null} color={canSubmit?undefined:'bg-gray-800 text-gray-500'}>{t.submit}</Btn>}</div>}
    {msg&&<p className="text-center text-sm text-emerald-400">✅ {msg}</p>}
    {err&&<p className="text-center text-sm text-red-400">{err}</p>}
    <Card className="space-y-2">
      <div className="flex items-center justify-between"><p className="text-sm font-bold text-white">🗓️ {t.rosterTitle}</p>
        {(d.isMgr||d.canSeq)&&<button onClick={()=>go('lv2=pdf&month='+month+(store?'&store='+encodeURIComponent(store):''))} className="text-xs border border-gray-600 text-gray-200 rounded-xl px-3 py-1.5">📄 PDF</button>}</div>
      <p className="text-[11px] text-gray-500">{fmt(t.rosterHint,{w:lim.weekday,e:lim.weekend})}</p>
      {isV&&<div className="space-y-2">
        <div className="flex gap-2 flex-wrap items-center">
          <Chip on={rMode==='all'} onClick={()=>{setRPg(null);setRMode('all');lsSet('lv2RosterMode','all');}}>{'全月 1~'+nd+' 號'}</Chip>
          <Chip on={rMode==='future'} onClick={()=>{setRPg(null);setRMode('future');lsSet('lv2RosterMode','future');}}>今天起</Chip>
          <label className="flex items-center gap-1 text-xs text-gray-300 ml-auto"><input type="checkbox" checked={showSign} onChange={e=>{setShowSign(e.target.checked);lsSet('lv2ShowSign',e.target.checked?'1':'0');}}/>顯示批准主管</label></div>
        <div className="flex gap-2 items-center"><input value={rq} onChange={e=>setRq(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder="輸入編號，查這位休哪幾天" className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"/>
          {rq&&<button onClick={()=>setRq('')} className="text-gray-400 text-lg px-2">✕</button>}</div>
        {rq&&(()=>{const hit={early:[],late:[]};Object.keys(d.roster).sort().forEach(dt=>['early','late'].forEach(sh=>{if(d.roster[dt][sh].some(x=>String(x.c)===rq))hit[sh].push(dt);}));
          const all=hit.early.length+hit.late.length;const past=hit.early.concat(hit.late).filter(x=>x<today).length;
          const fm=l=>l.map(x=>parseInt(x.slice(5,7),10)+'/'+parseInt(x.slice(8),10)).join('、')||'—';
          return(<div className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 space-y-0.5">
            <p className="font-bold text-white">編號 {rq}　本月共休 {all} 天{all>0?'（已休 '+past+'、未休 '+(all-past)+'）':''}</p>
            <p><span className="text-[11px] rounded px-1 text-white bg-amber-500">早</span> {hit.early.length} 天：{fm(hit.early)}</p>
            <p><span className="text-[11px] rounded px-1 text-white bg-indigo-500">晚</span> {hit.late.length} 天：{fm(hit.late)}</p></div>);})()}
      </div>}
      {pageDates.map(date=>{const ro=d.roster[date]||{early:[],late:[]};
        const dow=new Date(parseInt(date.slice(0,4),10),parseInt(date.slice(5,7),10)-1,parseInt(date.slice(8),10)).getDay();const wkend=dow===0||dow===6;
        const total=ro.early.length+ro.late.length;
        const line=(s)=>{const arr=ro[s];if(!arr.length)return null;
          const rows=[];for(let i=0;i<arr.length;i+=5)rows.push(arr.slice(i,i+5));
          return(<div key={s} className="space-y-0.5">{rows.map((row,ri)=>(<div key={ri} className="grid items-start text-sm leading-5" style={{gridTemplateColumns:'24px repeat(5,minmax(0,1fr))'}}>
            <span>{ri===0?<span className={'text-[11px] rounded px-1 text-white '+SH_COLOR[s]}>{s==='early'?'早':'晚'}</span>:null}</span>
            {row.map((x,i)=>(<span key={x.id||i} className="inline-flex flex-col items-center"><span className={x.o?'text-orange-400 font-bold':'text-gray-200'}>{x.c}{x.p?'*':''}</span>{x.s&&(!isV||showSign)?<span className="text-[7px] leading-[8px] text-red-500 font-bold -mt-0.5">{x.s}</span>:null}</span>))}</div>))}</div>);};
        return(<div key={date} className={'border-t border-gray-800 pt-1.5 flex gap-3 '+(date<today?'opacity-40':date===today?'rounded-xl ring-1 ring-violet-500 bg-violet-950/30 px-1 ':'')}>
          <div className="w-12 shrink-0 text-center"><div className="text-xs font-bold text-violet-300">{parseInt(date.slice(5,7),10)}/{parseInt(date.slice(8),10)}</div>
            <span className={'inline-block text-[10px] rounded-full px-2 '+(wkend?'bg-red-950 text-red-300':'bg-gray-800 text-gray-400')}>{t.wk[dow]}</span>
            {date===today&&<div className="text-[9px] bg-violet-600 text-white rounded px-1 inline-block mt-0.5">{lang==='vi'?'Nay':'今天'}</div>}<div className="text-[10px] text-gray-500 mt-0.5">{fmt(t.leaveN,{n:total})}</div></div>
          <div className="flex-1 min-w-0 space-y-1">{line('early')}{line('late')}{total===0&&<span className="text-[11px] text-gray-600">—</span>}</div></div>);})}
      {rosterDates.length===0&&<p className="text-xs text-gray-500">{t.empty}</p>}
      {rosterDates.length>0&&<div className="flex items-center justify-center gap-4 pt-1">
        <button disabled={pg<=0} onClick={()=>setRPg(pg-1)} className={'border border-gray-600 rounded-xl px-4 py-1 text-sm '+(pg<=0?'text-gray-700':'text-gray-200')}>‹</button>
        <span className="text-sm font-bold text-white min-w-[72px] text-center">{pgLabel}</span>
        <button disabled={pg>=pgCount-1} onClick={()=>setRPg(pg+1)} className={'border border-gray-600 rounded-xl px-4 py-1 text-sm '+(pg>=pgCount-1?'text-gray-700':'text-gray-200')}>›</button></div>}
      <div className="border-t border-gray-800 pt-2 space-y-1">
        <div className="flex items-center text-sm font-bold text-white">📋 {t.boardTitle}{d.long.board.length>0&&<span className="text-xs font-normal text-gray-400 ml-2">{lang==='vi'?d.long.board.length:'共 '+d.long.board.length+' 人'}</span>}
          {d.long.board.length>1&&<button onClick={()=>setLgOpen(!lgOpen)} className="ml-auto text-xs text-violet-300">{lgOpen?(lang==='vi'?'Thu gọn ▲':'收合 ▲'):(lang==='vi'?'Xem tất cả ▼':'展開全部 ▼')}</button>}</div>
        {d.long.board.length===0&&<p className="text-xs text-gray-500">{t.boardNone}</p>}
        {(lgOpen?d.long.board:d.long.board.slice(0,1)).map(x=>(<p key={x.id} className="text-sm text-gray-200 border-b border-gray-900 py-0.5"><span className="font-bold text-violet-300">{x.code}</span>{lang==='vi'?'':' 號'}　<span className={'text-xs rounded-full px-2 py-0.5 text-white '+(x.kind==='leave'?'bg-rose-600':'bg-teal-600')}>{x.kind==='leave'?t.kLeave:t.kSchool.split('（')[0].split(' (')[0]}</span>　{periodText(x,t)}{x.kind==='school'?<span className="text-xs text-gray-400">　{longText(x,t)}</span>:null}{x.reason?<span className="text-xs text-gray-500">　{x.reason}</span>:null}</p>))}
        {!lgOpen&&d.long.board.length>1&&<button onClick={()=>setLgOpen(true)} className="text-[11px] text-gray-500">{lang==='vi'?'Bấm để xem '+(d.long.board.length-1)+' mục còn lại':'點此展開其餘 '+(d.long.board.length-1)+' 筆'}</button>}</div>
    </Card>
    {d.canLeave&&d.seqMode==='paper'&&<p className="text-xs text-gray-400">{t.seqMine}：{d.mySeq?'#'+d.mySeq:t.seqWait}</p>}
    {d.isMgr&&<Card className="space-y-2" id="lv2-adjust">
      <div className="flex items-center justify-between"><p className="text-sm font-bold text-white">📋 {t.adjTitle}</p>
        {(()=>{const ids=d.adjust[adjShift].filter(x=>!x.signBy).map(x=>x.id);return ids.length>0?<button disabled={busy} onClick={()=>longAct('lv2Notify',{ids:JSON.stringify(ids)},t.notifyAsk)} className="text-xs bg-sky-700 text-white rounded-xl px-3 py-1.5">{t.notifyAll}（{ids.length}）</button>:null;})()}</div>
      <div className="flex gap-2">{['early','late'].map(s=>(<Chip key={s} on={adjShift===s} onClick={()=>setAdjShift(s)}>{t[s]}（{d.adjust[s].length}）</Chip>))}</div>
      <p className="text-[11px] text-gray-500">{t.adjHint}</p>
      {d.adjust[adjShift].length===0&&<p className="text-xs text-gray-500">{t.adjNone}</p>}
      {(()=>{
        const groups=[];d.adjust[adjShift].forEach(x=>{let g=groups[groups.length-1];if(!g||g.date!==x.date){g={date:x.date,cap:x.cap,list:[]};groups.push(g);}g.list.push(x);});
        const allOpen=groups.length>0&&groups.every(g=>adjOpen[adjShift+g.date]);
        return(<div className="space-y-1.5">
          {groups.length>1&&<div className="text-right"><button onClick={()=>{const o={...adjOpen};groups.forEach(g=>{o[adjShift+g.date]=!allOpen;});setAdjOpen(o);}} className="text-[11px] text-violet-300">{allOpen?t.adjNone2:t.adjAll}</button></div>}
          {groups.map(g=>{const k=adjShift+g.date;const open=!!adjOpen[k];const done=g.list.filter(x=>x.signBy||x.notifiedAt).length;const todo=g.list.length-done;
            const dow=new Date(parseInt(g.date.slice(0,4),10),parseInt(g.date.slice(5,7),10)-1,parseInt(g.date.slice(8),10)).getDay();
            return(<div key={k} className="rounded-xl border border-gray-800">
              <button onClick={()=>setAdjOpen({...adjOpen,[k]:!open})} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                <span className="text-sm font-bold text-violet-300">{parseInt(g.date.slice(5,7),10)}/{parseInt(g.date.slice(8),10)}</span>
                <span className="text-[11px] text-gray-400">{t.wk[dow]}　{lang==='vi'?'Hạn mức':'名額'} {g.cap}</span>
                <span className="ml-auto text-[11px]"><span className={todo>0?'text-orange-400 font-bold':'text-gray-500'}>{t.adjTodo} {todo}</span><span className="text-gray-500"> / {t.adjDone} {done}</span></span>
                <span className="text-gray-500 text-xs">{open?'▲':'▼'}</span></button>
              {open&&<div className="px-2 pb-2 space-y-2">{g.list.map(x=>(<div key={x.id} className={'rounded-xl border p-2 space-y-2 '+(x.signBy?'border-emerald-900 bg-emerald-950/30':'border-gray-700')}>
            <div className="flex items-center gap-3"><span className="inline-flex flex-col items-center min-w-[40px]"><span className={'font-bold '+(x.signBy?'text-gray-200':'text-orange-400')}>{x.code}</span>{x.signBy?<span className="text-[7px] leading-[8px] text-red-500 font-bold">{x.signBy}</span>:null}</span>
              <span className="text-[11px] text-gray-400 flex-1">{fmt(t.pos,{n:x.pos,k:x.over})}<br/>{(x.submittedAt||'').slice(5,16)}</span>
              {x.signBy?<span className="text-[11px] rounded-full bg-emerald-700 text-white px-2 py-0.5">{fmt(t.signedBy,{c:x.signBy})}</span>:x.notifiedAt?<span className="text-[11px] rounded-full bg-sky-800 text-white px-2 py-0.5">{fmt(t.notified,{t:x.notifiedAt.slice(5,16)})}</span>:null}</div>
            <div className="flex gap-2">
              {!x.signBy&&<button disabled={busy} onClick={()=>longAct('lv2Notify',{ids:JSON.stringify([x.id])})} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-sky-700 text-white disabled:opacity-50">{x.notifiedAt?t.notifyAgain:t.notify}</button>}
              {!x.signBy&&<button disabled={busy} onClick={()=>longAct('lv2Sign',{id:x.id,on:true},t.signAsk)} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white disabled:opacity-50">{t.sign}</button>}
              {x.signBy&&<button disabled={busy} onClick={()=>{if(armed===x.id){setArmed('');longAct('lv2Sign',{id:x.id,on:false});}else{setArmed(x.id);setTimeout(()=>setArmed(a=>a===x.id?'':a),4000);}}} className={'flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 '+(armed===x.id?'bg-red-600 text-white':'bg-gray-700 text-gray-200')}>{armed===x.id?t.unsignSure:t.unsign}</button>}</div></div>))}</div>}
            </div>);})}
        </div>);})()}
    </Card>}
    {d.canSeq&&d.seqMode==='paper'&&<Card className="space-y-2">
      <p className="text-sm font-bold text-white">🔢 {t.seqTitle}</p><p className="text-[11px] text-gray-500">{t.seqHint}</p>
      <div className="flex gap-2 items-center flex-wrap"><Chip on={seqSort==='order'} onClick={()=>setSeqSort('order')}>{t.seqByOrder}</Chip><Chip on={seqSort==='code'} onClick={()=>setSeqSort('code')}>{t.seqByCode}</Chip>
        <input value={seqQ} onChange={e=>setSeqQ(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder={t.seqSearch} className="flex-1 min-w-[90px] rounded-lg bg-gray-900 border border-gray-700 px-2 py-1.5 text-sm text-white"/>{seqQ&&<button onClick={()=>setSeqQ('')} className="text-gray-400 px-1">✕</button>}</div>
      {d.seqList.length===0&&<p className="text-xs text-gray-500">{t.empty}</p>}
      {seqView.map(x=>(<div key={x.userId} className="flex items-center gap-2"><span className="w-12 font-bold text-gray-200">{x.code}</span><span className="text-xs text-gray-500 flex-1">{fmt(t.seqDays,{n:x.n})}</span>
        <input value={seqIn[x.userId]!==undefined?seqIn[x.userId]:String(x.seq)} inputMode="numeric" onChange={e=>setSeqIn({...seqIn,[x.userId]:e.target.value.replace(/\D/g,'').slice(0,4)})} className="w-20 text-center rounded-lg bg-gray-800 border border-gray-700 py-1.5 text-white"/>
        <button disabled={busy} onClick={()=>longAct('lv2SeqSet',{month:month,userId:x.userId,seq:seqIn[x.userId]!==undefined?seqIn[x.userId]:String(x.seq)})} className="px-3 py-1.5 rounded-lg text-xs bg-gray-700 text-white disabled:opacity-50">{t.seqSave}</button></div>))}
    </Card>}
    {d.isMgr&&(()=>{const cv=cf||{wd:String(lim.weekday),we:String(lim.weekend),mode:d.seqMode};const inp="w-20 text-center rounded-lg bg-gray-800 border border-gray-700 py-1.5 text-white";
      return(<Card className="space-y-2"><p className="text-sm font-bold text-white">⚙ {fmt(t.setTitle,{s:d.store})}</p>
        <div className="flex items-center gap-2"><span className="text-sm text-gray-300 flex-1">{t.wdQ}</span><input value={cv.wd} inputMode="numeric" onChange={e=>setCf({...cv,wd:e.target.value.replace(/\D/g,'').slice(0,2)})} className={inp}/></div>
        <div className="flex items-center gap-2"><span className="text-sm text-gray-300 flex-1">{t.weQ}</span><input value={cv.we} inputMode="numeric" onChange={e=>setCf({...cv,we:e.target.value.replace(/\D/g,'').slice(0,2)})} className={inp}/></div>
        <div><p className="text-xs text-gray-400 mb-1">{t.seqModeL}</p><div className="flex gap-2"><Chip on={cv.mode==='paper'} onClick={()=>setCf({...cv,mode:'paper'})}>{t.seqPaper}</Chip><Chip on={cv.mode==='time'} onClick={()=>setCf({...cv,mode:'time'})}>{t.seqTime}</Chip></div></div>
        <Btn loading={busy} onClick={()=>run(async()=>{const r=await api('lv2SettingsSet',{store:d.store,wd:cv.wd,we:cv.we,seqMode:cv.mode});if(r&&r.ok){setMsg(t.setOk);setCf(null);reload();}else setErr((r&&r.error)||t.fail);})}>{t.setSave}</Btn></Card>);})()}
    {d.isTeacher&&<Card className="space-y-2">
      <p className="text-sm font-bold text-white">{t.longTitle}</p>
      {!lf&&<p className="text-xs text-gray-500">{t.longHint}</p>}
      {!lf&&<Btn color="bg-gray-800 text-gray-200 border border-gray-600" onClick={()=>setLf({kind:'leave',start:'',end:'',days:[],reason:''})}>{t.longBtn}</Btn>}
      {lf&&<div className="space-y-2">
        <div className="flex gap-2 flex-wrap"><Chip on={lf.kind==='leave'} onClick={()=>setLf({...lf,kind:'leave'})}>{t.kLeave}</Chip><Chip on={lf.kind==='school'} onClick={()=>setLf({...lf,kind:'school'})}>{t.kSchool}</Chip></div>
        <div><p className="text-xs text-gray-400 mb-1">{t.startD}</p><input type="date" min={today} value={lf.start} onChange={e=>setLf({...lf,start:e.target.value})} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>
        <div><p className="text-xs text-gray-400 mb-1">{lf.kind==='leave'?t.endD:t.endOpt}</p><input type="date" min={lf.start||today} value={lf.end} onChange={e=>setLf({...lf,end:e.target.value})} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>
        {lf.kind==='school'&&<div><p className="text-xs text-gray-400 mb-1">{t.workDays}</p><div className="flex gap-1 flex-wrap">{t.wk.map((w,i)=>(<Chip key={i} on={lf.days.indexOf(String(i))>=0} onClick={()=>setLf({...lf,days:lf.days.indexOf(String(i))>=0?lf.days.filter(x=>x!==String(i)):lf.days.concat([String(i)])})}>{w}</Chip>))}</div></div>}
        <input value={lf.reason} maxLength={100} onChange={e=>setLf({...lf,reason:e.target.value})} placeholder={t.reason} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
        <div className="flex gap-2"><Btn color="bg-gray-700 text-white" onClick={()=>setLf(null)}>{lang==='vi'?'Hủy':'取消'}</Btn><Btn loading={busy} onClick={longSend}>{t.sendLong}</Btn></div></div>}
      {d.long.mine.map(x=>(<div key={x.id} className="rounded-xl border border-gray-700 p-2 space-y-1">
        <p className="text-sm text-white">{x.kind==='leave'?t.kLeave:longText(x,t)}　{periodText(x,t)}</p>
        <p className="text-xs"><span className={x.status==='approved'?'text-emerald-400':'text-amber-300'}>{t['s_'+x.status]||x.status}</span>{x.reason?<span className="text-gray-500">　{x.reason}</span>:null}</p>
        <div className="flex gap-2">{!x.end&&<button onClick={()=>{const v=window.prompt(t.setEndAsk,'');if(v)longAct('lv2LongEnd',{id:x.id,end:v.trim()});}} className="px-3 py-1.5 rounded-xl text-xs border border-gray-600 text-gray-200">{t.setEnd}</button>}
          <button onClick={()=>longAct('lv2LongCancel',{id:x.id},t.cancelLong+'?')} className="px-3 py-1.5 rounded-xl text-xs border border-gray-600 text-gray-300">{t.cancelLong}</button></div>
      </div>))}
    </Card>}
    {d.mine.length>0&&<Card className="space-y-1">
      <p className="text-sm font-bold text-white">{t.mineList}</p>
      {d.mine.slice().sort((a,b)=>a.date<b.date?-1:1).map(x=>(<p key={x.id} className="text-sm text-gray-300">{x.date.slice(5)}　{t[x.shift]}　<span className={x.status==='approved'?'text-emerald-400':x.status==='pending'?'text-amber-300':'text-gray-400'}>{t['s_'+x.status]||x.status}</span>{x.over?<span className="text-xs text-orange-400">　{t.overTag}</span>:null}{x.signBy?<span className="text-xs text-gray-400">　{fmt(t.signedBy,{c:x.signBy})}</span>:null}{x.flags&&x.status==='pending'?<span className="text-xs text-gray-500">　（{flagText(x.flags)}）</span>:null}</p>))}
    </Card>}
    {d.isMgr&&<Card className="space-y-2">
      <p className="text-sm font-bold text-white">{t.pendingTitle}（{d.pending.length}）</p>
      {d.pending.length===0&&<p className="text-xs text-gray-500">{t.noPending}</p>}
      {d.pending.map(x=>(<div key={x.id} className="rounded-xl border border-gray-700 p-2 space-y-1">
        <p className="text-sm text-white">{x.store}　{x.code} 號　{x.date.slice(5)}　{t[x.shift]}</p>
        <p className="text-xs text-amber-300">{flagText(x.flags)}</p>
        <div className="flex gap-2"><button disabled={busy} onClick={()=>decide(x.id,true)} className="flex-1 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white disabled:opacity-50">{t.ok}</button>
          <button disabled={busy} onClick={()=>decide(x.id,false)} className="flex-1 py-2 rounded-xl text-sm font-bold bg-gray-700 text-gray-200 disabled:opacity-50">{t.rej}</button></div>
      </div>))}
    </Card>}
    {d.isMgr&&d.long.pending.length>0&&<Card className="space-y-2">
      <p className="text-sm font-bold text-white">{t.longTitle} · {t.pendingTitle}（{d.long.pending.length}）</p>
      {d.long.pending.map(x=>(<div key={x.id} className="rounded-xl border border-gray-700 p-2 space-y-1">
        <p className="text-sm text-white">{x.store}　{x.code} 號　{x.kind==='leave'?t.kLeave:longText(x,t)}　{periodText(x,t)}</p>
        {x.reason&&<p className="text-xs text-gray-400">{x.reason}</p>}
        <div className="flex gap-2"><button disabled={busy} onClick={()=>longAct('lv2LongDecide',{id:x.id,approve:true})} className="flex-1 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white disabled:opacity-50">{t.ok}</button>
          <button disabled={busy} onClick={()=>longAct('lv2LongDecide',{id:x.id,approve:false})} className="flex-1 py-2 rounded-xl text-sm font-bold bg-gray-700 text-gray-200 disabled:opacity-50">{t.rej}</button></div>
      </div>))}
    </Card>}
  </Box>);
}
window.Leave2Routes=Leave2Routes;
})();
