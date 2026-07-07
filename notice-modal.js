/* notice-modal.js v1.10-028 — 共用公告詳情彈窗元件(index與公告頁共用)
   用法:<NoticeDetailModal notice={n} settings={settings} t={t} onClose={()=>...} onMore={()=>...}/>
   依賴 window.MP 的:noticeBody,hasMyKey,markNoticeRead,autoClaimKey,isNoticeRead,getNoticeReadCount,getNoticeReaders,getNoticeShow */
(function(){
  const {useState}=React;
  const MP=window.MP||{};
  function NoticeDetailModal({notice,settings,t,onClose,onMore}){
    const vi=settings&&settings.lang==='vi';
    const[nvLang,setNvLang]=useState({zh:!vi,vi:!!vi});
    const[act,setAct]=useState('');
    const[readCount,setReadCount]=useState(()=>{try{return MP.getNoticeReadCount?MP.getNoticeReadCount(notice.id):null}catch(_e){return null}});
    const[readers,setReaders]=useState(null);
    const show=(MP.getNoticeShow?MP.getNoticeShow():{cat:false,subcat:false,tags:false});
    const code=settings&&settings.code;
    const nb=(n,lang)=>MP.noticeBody?MP.noticeBody(n,lang):(n&&n.body||'');
    const handleAction=async()=>{
      if(MP.hasMyKey&&MP.hasMyKey(code)){
        setAct('...');
        try{const r=await MP.markNoticeRead(code,notice.id);if(r&&r.ok){setAct('read');if(typeof r.count==='number')setReadCount(r.count)}else{setAct('fail')}}catch(_e){setAct('fail')}
        setTimeout(()=>setAct(''),4000);return;
      }
      setAct('...');
      try{const r=await MP.autoClaimKey(code);setAct(r&&r.ok?'ok':'fail')}catch(_e){setAct('fail')}
      setTimeout(()=>setAct(''),4000);
    };
    const showReaders=async()=>{setReaders('loading');const r=await MP.getNoticeReaders(notice.id);setReaders(Array.isArray(r)?r:[])};
    const isRead=MP.isNoticeRead&&MP.isNoticeRead(notice.id);
    return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-start justify-between gap-2 sticky top-0 bg-gray-900"><div className="flex-1"><div className="flex items-center gap-2 mb-1">{show.cat&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{notice.cat}</span>}{show.subcat&&notice.subcat&&<span className="text-[10px] text-gray-500">{notice.subcat}</span>}<span className="text-[10px] text-gray-600">{notice.date}</span></div><h3 className="text-base font-bold text-gray-100">{notice.title}</h3>{notice.author&&<p className="text-[11px] text-gray-500 mt-1">👤 {notice.author}</p>}</div><div className="flex items-center gap-1 flex-shrink-0"><button onClick={()=>setNvLang(p=>{const nz=!p.zh;if(!nz&&!p.vi)return{zh:false,vi:true};return{...p,zh:nz}})} className={`text-xs px-2 py-1 rounded-lg font-semibold ${nvLang.zh?'bg-amber-500 text-white':'bg-white/[0.08] text-gray-500'}`}>中</button><button onClick={()=>setNvLang(p=>{const nv=!p.vi;if(!nv&&!p.zh)return{zh:true,vi:false};return{...p,vi:nv}})} className={`text-xs px-2 py-1 rounded-lg font-semibold ${nvLang.vi?'bg-emerald-500 text-white':'bg-white/[0.08] text-gray-500'}`}>VI</button><button onClick={onClose} className="text-gray-500 text-sm ml-1">✕</button></div></div>
      <div className="p-4">{nvLang.zh&&<p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{notice.body||''}</p>}{nvLang.zh&&nvLang.vi&&(notice.bodyVi||'').trim()&&<div className="my-3 border-t border-white/[0.06]"/>}{nvLang.vi&&((notice.bodyVi||'').trim()?<p className="text-sm text-emerald-600 whitespace-pre-wrap leading-relaxed">{notice.bodyVi}</p>:(!nvLang.zh&&<p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{notice.body||''}</p>))}
      {readCount!==null&&<p className="text-[11px] text-gray-500 mt-3">👁 {readCount} {t.noticeReadCount||'人已閱讀'}</p>}
      <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]"><button onClick={handleAction} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${isRead?'bg-emerald-600 text-white active:bg-emerald-700':'bg-white/[0.08] text-gray-300 active:bg-white/[0.12]'}`}>{isRead?('✓ '+(t.noticeReadDone||'已閱讀')):(t.noticeRead||'我已閱讀')}</button><button onClick={showReaders} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-xs font-semibold active:bg-white/[0.12]">{t.noticeReaders||'閱讀人員'}</button><button onClick={()=>{if(onMore)onMore()}} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-xs font-semibold active:bg-white/[0.12]">{t.noticeMore||'更多公告'}</button></div>
      {readers!==null&&<div className="mt-3 bg-white/[0.03] rounded-lg p-3"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-400">{t.noticeReaders||'閱讀人員'}{readers!=='loading'&&' ('+readers.length+')'}</span><button onClick={()=>setReaders(null)} className="text-[11px] text-gray-500">✕</button></div>{readers==='loading'?<p className="text-[11px] text-gray-500">{t.loading||'載入中…'}</p>:readers.length===0?<p className="text-[11px] text-gray-500">{t.noReaders||'尚無人閱讀'}</p>:<div className="flex flex-wrap gap-1.5">{readers.map((rd,i)=>(<span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300">{rd.code}</span>))}</div>}</div>}
      {act==='...'?<p className="text-[11px] text-sky-400 text-center mt-2">⏳ {t.noticeKeyClaiming||'開通中…'}</p>:act==='ok'?<p className="text-[11px] text-emerald-500 text-center mt-2 font-semibold">✓ {t.noticeKeyGot||'已為你開通！互動功能即將開放'}</p>:act==='read'?<p className="text-[11px] text-emerald-500 text-center mt-2 font-semibold">✓ {t.noticeReadOk||'已記錄閱讀，感謝！'}</p>:act==='fail'?<p className="text-[11px] text-red-500 text-center mt-2 font-semibold">✗ {t.noticeKeyFail||'開通失敗，請稍後再試或聯繫主管'}</p>:(MP.hasMyKey&&!MP.hasMyKey(code)&&<p className="text-[10px] text-gray-500 text-center mt-2">{t.noticeKeyHint||'點上方按鈕即可開通互動功能'}</p>)}
      {show.tags&&notice.tags&&<div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">{String(notice.tags).split(/[,、\s]+/).filter(Boolean).map((tg,i)=>(<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">#{tg}</span>))}</div>}</div>
    </div></div>);
  }
  window.NoticeDetailModal=NoticeDetailModal;
})();
