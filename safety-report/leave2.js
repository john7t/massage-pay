/* leave2.js — 預排休假 2.0 前端(v1.0-001)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 lv2:  ?lv2=l  預排休假(月曆)
   規則與後端見 gas-leave2.gs.txt:每月 9 日 00:00 ~ 12 日 24:00 可登記「下個月」休假,期間免審批(超休需主管簽字);之後的送出需主管審批;可提前 2 個月暫存。
   早/晚班分開統計:每人每月各 6 天、每店每日各班別最多 6 人。 */
(function(){
const{useState,useEffect}=React;
const C=window.S2Core;
if(!C){window.Leave2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{api,useLoad,Box,Card,Btn,Loading,Msg,NeedUser,barOf,go,CACHEABLE,WRITE_CLEAR}=C;
// 本機暫存:讀過的月份存手機,切換月份不重讀;點上方「🔄 重新整理」才重讀(12 小時後也會自動重讀);任何寫入動作成功後自動清掉
if(CACHEABLE.indexOf('lv2Month')<0)CACHEABLE.push('lv2Month');
['lv2Save','lv2Cancel','lv2Decide','lv2Sign','lv2Notify','lv2SeqSet','lv2SettingsSet','lv2LongSave','lv2LongEnd','lv2LongCancel','lv2LongDecide','lv2Claim'].forEach(x=>{WRITE_CLEAR[x]=['lv2Month'];});
const Chip=C.Chip||(({on,children,onClick})=>(<button onClick={onClick} className={'px-4 py-2 rounded-full border text-sm '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')}>{children}</button>));

const L={
  zh:{title:'預排休假',early:'早班',late:'晚班',shift:'登記班別',tapHint:'點日期登記休假（目前：{s}）；點已登記的日期可取消',
    draft:'暫存',submit:'送出休假單',saved:'已暫存 {n} 天',sent:'已送出：{a} 天生效，{p} 天待主管簽核',fail:'失敗',
    st_tooEarly:'還不能暫存（最早可提前 2 個月暫存）',st_draft:'尚未開放送出，可先排好並暫存；{o} 起可送出，進入公司排休階段',
    st_open:'登記期間中（到 {c} 前）：送出免審批，超休需主管簽字',st_late:'已超過送排休期間：目前送出後需主管審批',st_past:'這個月已過',
    used:'已排',days:'天',over:'超過 {n} 天，超休需主管簽字',full:'當日已滿 {n} 人，需主管簽字',
    cancelAsk:'要取消這天的休假嗎？',submitAsk:'確定送出這些休假嗎？',submitOver:'其中有超休，需主管簽字後才生效。',
    fullWarn:'你申請 {d} 這幾天當天已排休超過 6 人，你的申請可能會被調整。現在調整會比之後通知調整時有更多選擇。\n是否仍要送出申請？',
    pitchHint:'向主管／公司提案用：8 頁，說明排休由紙本改線上與並行試辦方式。',pitchBtn:'分享「排休改線上提案」',promoT:'推廣預排休假',promoHint:'分享「線上預排休」入口卡給同事或群組:可進入預排休,或看中文／越南文／大字版介紹。',promoBtn:'分享給好友／群組',shareNo:'此環境不支援分享，請在 LINE 內開啟',shared:'已分享',modeMgr:'主管模式',modeTeacher:'老師模式',seqToggleOpen:'展開 ▼',seqToggleClose:'收合 ▲',ovAsk:'超額排休，請改休',ovSigned:'超額排休，主管{c}已核假',notOpen:'未開放排休',slotFull:'已滿',slotLeft:'尚有 {n} 名額',legendAnon:'✦ 已有人排休　✧ 尚有名額　紫色＝我',grpTitle:'主管不能同時排休的組別',grpHint:'輸入編號按 Enter 加入，再按「加入此組」。同組的人同一天（不分早晚班）不能同時排休；一個人可在多組，例：13 175 一組、175 79 161 一組 → 175 與 13、79、161 都不能同天，13 與 79、161 無關。',grpPh:'編號 + Enter',grpAdd:'加入此組',grpMin:'一組至少要 2 個編號',paperT:'找到紙本匯入的休假',paperTxt:'系統有 {n} 筆編號 {c} 號、{m} 月的紙本休假（{l}）。若這是你的，請按「綁定到我的帳號」，之後就能在這裡查看與管理。',paperBtn:'這是我的，綁定到我的帳號',paperAsk:'確定把這些紙本匯入的休假綁定到你的帳號嗎？',paperOk:'已綁定 {n} 筆',rosterTitle:'總休表（依申請順序）',rosterHint:'每班別平日名額 {w} 人、週六日 {e} 人（可在設定調整）。白色＝名額內，橘色＝超出名額、需主管協調改假；主管排休不佔名額。已簽核保留的人，號碼下方以紅色小字標註批准主管編號。',mgrTag:'主管',
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
    boardTitle:'長假／固定休名單',boardNone:'本月沒有長假或固定休安排',kLeave:'長假',kSchool:'課業（固定上班日）',pendingEnd:'未定',
    longTitle:'長假／固定休申請',longBtn:'＋ 申請長假／固定休／假日可休',longHint:'長假（例如回越南）、固定休（每週固定幾天）、固定隔日休（單／雙號）、假日可休：需事前提出，主管審核後才生效，不佔每月 6 天與每日名額。',
    kind:'類型',startD:'開始日期',endD:'結束日期',endOpt:'結束日期（未定可留空）',workDays:'上班的星期',reason:'原因（選填）',sendLong:'送出申請',
    weekly:'每週{d}上班',kFixed:'固定休',kAlt:'固定隔日休',kHoliday:'假日可休',kPart:'兼職',kNote:'見人再壓',oddD:'單號日',evenD:'雙號日',holDays:'可休的假日',holQuota:'每週可休天數',shiftL:'班別',forCode:'老師編號（櫃台／主管直接替老師新增，免審核）',needCode:'請輸入老師編號',blockedTxt:'你屬於「{k}」，不排休，請洽櫃台',ruleFixed:'每週{d}休',ruleHoliday:'{d}可休・每週最多 {q} 天',fixedTag:'固',staffOnly:'僅櫃台／主管可見',addedOk:'已新增',delAsk:'確定取消這筆？',since:'起',cancelLong:'取消申請',setEnd:'補結束日',setEndAsk:'輸入結束日期（YYYY-MM-DD）',longSent:'已送出，等主管審核',
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
    pitchHint:'Dùng để đề xuất với quản lý/công ty (8 trang, tiếng Trung).',pitchBtn:'Chia sẻ “Đề xuất chuyển sang online”',promoT:'Giới thiệu Nghỉ phép trước',promoHint:'Chia sẻ thẻ lối vào “Nghỉ phép trước trực tuyến” cho đồng nghiệp hoặc nhóm: có thể vào đăng ký hoặc xem giới thiệu (tiếng Trung / tiếng Việt / chữ lớn).',promoBtn:'Chia sẻ cho bạn bè/nhóm',shareNo:'Môi trường này không hỗ trợ chia sẻ, vui lòng mở trong LINE',shared:'Đã chia sẻ',modeMgr:'Chế độ quản lý',modeTeacher:'Chế độ KTV',seqToggleOpen:'Mở ▼',seqToggleClose:'Thu gọn ▲',ovAsk:'Vượt hạn mức, vui lòng đổi ngày',ovSigned:'Vượt hạn mức, QL {c} đã duyệt',notOpen:'Không mở đăng ký',slotFull:'Đã đủ',slotLeft:'Còn {n} chỗ',legendAnon:'✦ đã có người nghỉ  ✧ còn chỗ  tím = tôi',grpTitle:'Nhóm quản lý không được nghỉ cùng ngày',grpHint:'Nhập mã rồi Enter, sau đó bấm "Thêm nhóm".',grpPh:'Mã + Enter',grpAdd:'Thêm nhóm',grpMin:'Mỗi nhóm cần ít nhất 2 mã',paperT:'Tìm thấy ngày nghỉ nhập từ bản giấy',paperTxt:'Có {n} ngày nghỉ bản giấy của số {c}, tháng {m} ({l}). Nếu là của bạn, bấm "Liên kết".',paperBtn:'Của tôi, liên kết vào tài khoản',paperAsk:'Liên kết các ngày nghỉ này vào tài khoản của bạn?',paperOk:'Đã liên kết {n} ngày',rosterTitle:'Bảng nghỉ tổng hợp (theo thứ tự đăng ký)',rosterHint:'Hạn mức mỗi ca: ngày thường {w} người, T7/CN {e} người (có thể chỉnh trong cài đặt). Màu trắng = trong hạn mức, màu cam = vượt, cần quản lý điều phối; nghỉ của quản lý không tính hạn mức. Người đã được ký giữ lại có mã quản lý chữ đỏ nhỏ dưới số.',mgrTag:'QL',
    flag_late:'Quá thời gian không cần duyệt',flag_person:'Vượt 6 ngày/tháng',flag_day:'Ngày đã đủ 6 người',
    s_approved:'Có hiệu lực',s_pending:'Chờ ký',s_draft:'Lưu tạm',s_rejected:'Bị từ chối',
    pendingTitle:'Chờ ký',noPending:'Không có đơn chờ ký',ok:'Ký đồng ý',rej:'Từ chối',roster:'Danh sách trong ngày (* = chờ ký)',none:'Không có',
    notTeacher:'Chỉ KTV đã đăng ký mới được đăng ký nghỉ (quản lý có thể ký duyệt và xem danh sách bên dưới)',store:'Chi nhánh',back:'Quay lại',
    sum:'Đã xếp tháng này',mineList:'Ngày nghỉ của tôi',empty:'Chưa đăng ký',
    boardTitle:'Bảng nghỉ dài hạn / đi học',boardNone:'Tháng này không có nghỉ dài hạn hoặc lịch đi học',kLeave:'Nghỉ dài hạn',kSchool:'Đi học (ngày làm cố định)',pendingEnd:'chưa định',
    longTitle:'Xin nghỉ dài hạn / ngày làm cố định',longBtn:'+ Xin nghỉ dài hạn / ngày làm cố định',longHint:'Nghỉ dài hạn (ví dụ về Việt Nam) hoặc chỉ đi làm vài ngày cố định vì đi học: cần xin trước, quản lý duyệt mới có hiệu lực, không tính vào 6 ngày/tháng và 6 người/ngày.',
    kind:'Loại',startD:'Ngày bắt đầu',endD:'Ngày kết thúc',endOpt:'Ngày kết thúc (chưa định thì để trống)',workDays:'Các thứ đi làm',reason:'Lý do (không bắt buộc)',sendLong:'Gửi đơn',
    weekly:'Đi làm mỗi {d}',kFixed:'Nghỉ cố định',kAlt:'Nghỉ cách ngày',kHoliday:'Nghỉ cuối tuần',kPart:'Bán thời gian',kNote:'Gặp rồi tính',oddD:'Ngày lẻ',evenD:'Ngày chẵn',holDays:'Ngày cuối tuần được nghỉ',holQuota:'Số ngày/tuần',shiftL:'Ca',forCode:'Mã KTV (quầy/quản lý thêm trực tiếp)',needCode:'Nhập mã KTV',blockedTxt:'Bạn thuộc "{k}", không đăng ký nghỉ, liên hệ quầy',ruleFixed:'Nghỉ mỗi {d}',ruleHoliday:'{d} được nghỉ, tối đa {q} ngày/tuần',fixedTag:'CĐ',staffOnly:'Chỉ quầy/quản lý thấy',addedOk:'Đã thêm',delAsk:'Hủy mục này?',since:'từ',cancelLong:'Hủy đơn',setEnd:'Bổ sung ngày kết thúc',setEndAsk:'Nhập ngày kết thúc (YYYY-MM-DD)',longSent:'Đã gửi, chờ quản lý duyệt',
    s_cancelled:'Đã hủy',wk:['CN','T2','T3','T4','T5','T6','T7']}
};
const fmt=(s,o)=>String(s).replace(/\{(\w+)\}/g,(_m,k)=>o&&o[k]!==undefined?o[k]:'');
const p2=n=>String(n).padStart(2,'0');
const addMonth=(m,n)=>{const y=parseInt(m.slice(0,4),10),mo=parseInt(m.slice(5,7),10)-1+n;return (y+Math.floor(mo/12))+'-'+p2(((mo%12)+12)%12+1);};
const todayStr=()=>{const d=new Date(Date.now()+8*3600e3);return d.getUTCFullYear()+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCDate());};
const SH_COLOR={early:'bg-amber-500',late:'bg-indigo-500'};

const LV2_PROMO=[["🏖️", "#6D5DFC", "#46C2CB", "預排休假上線了", "Lịch nghỉ phép trước đã có", "不用再排隊寫紙本,用手機就能排下個月的休假,誰排了、還剩幾個名額,一目了然。", "Không cần xếp hàng viết giấy nữa, dùng điện thoại là đăng ký được ngày nghỉ tháng sau, ai đã đăng ký và còn mấy suất đều thấy rõ.", ["", ""]], ["📝", "#E8A33D", "#E0674B", "上線階段 1:測試階段", "Giai đoạn 1: Chạy thử", "仍請依公司規定寫休假小白單,於指定時間送櫃台;主管再依小白單順序,排定老師線上申請的順序。", "Vẫn viết phiếu nghỉ nhỏ màu trắng theo quy định công ty và nộp cho quầy vào thời gian chỉ định; quản lý sẽ sắp thứ tự đăng ký trực tuyến của nhân viên theo thứ tự phiếu.", ["・小白單照常填寫、照常送櫃台\n・線上申請的順序,由主管依小白單順序排定\n・這段期間,可以先熟悉線上操作", "・Phiếu nhỏ vẫn viết và nộp cho quầy như bình thường\n・Thứ tự đăng ký trực tuyến do quản lý sắp xếp theo thứ tự phiếu\n・Trong thời gian này, bạn có thể làm quen với thao tác trực tuyến"]], ["🚀", "#E0674B", "#C2417A", "上線階段 2:正式上線", "Giai đoạn 2: Chính thức", "改由線上進行預排休申請。", "Đăng ký nghỉ phép trước hoàn toàn trực tuyến.", ["・不再需要寫小白單、送櫃台\n・每月 10 日 00:00 開放送出,12 日 24:00 前送出\n・誰排了、還剩幾個名額,在系統上一目了然", "・Không cần viết phiếu nhỏ và nộp cho quầy nữa\n・Mở gửi từ 00:00 ngày 10 hàng tháng, gửi trước 24:00 ngày 12\n・Ai đã đăng ký, còn mấy suất, đều xem được trên hệ thống"]], ["📅", "#F6A04D", "#F0627A", "點月曆,一下就排", "Chạm vào lịch là đăng ký xong", "選早班或晚班,點日期就登記,再點一次取消。可先「暫存」慢慢調整,確定了再「送出」。", "Chọn ca sáng hoặc ca tối, chạm vào ngày là đăng ký, chạm lại để hủy. Có thể “Lưu nháp” để chỉnh dần, chắc chắn rồi mới “Gửi”.", ["每人每月可休 6 天", "Mỗi người, mỗi tháng được nghỉ 6 ngày"]], ["⏰", "#3CB7A0", "#3B82C4", "什麼時候排?", "Khi nào đăng ký?", "休假月份的前一個月 10 日開放送出,到 12 日 24:00 前送出,進入預排休假流程;更早也能先暫存。", "Từ ngày 10 của tháng trước tháng nghỉ là bắt đầu gửi được, gửi trước 24:00 ngày 12 sẽ vào quy trình đăng ký nghỉ trước; có thể lưu nháp sớm hơn.", ["例:11 月休假 → 10/10 開放,10/12 24:00 前送出,進入預排休假流程", "Ví dụ: nghỉ tháng 11 → mở 10/10, gửi trước 24:00 ngày 12/10 để vào quy trình"]], ["👥", "#B469E0", "#6D7BF0", "名額一看就懂", "Nhìn là biết còn suất", "日曆小字顯示每日可休剩餘名額。老師只看到自己的編號與空位,不會看到別人。", "Số nhỏ trên lịch là số suất nghỉ còn lại của mỗi ngày. Bạn chỉ thấy số của mình và chỗ trống, không thấy của người khác.", ["✦ 已有人休　✧ 還有空位", "✦ đã có người nghỉ　✧ còn chỗ"]], ["🔢", "#4B8DE0", "#5A6BD8", "依申請順序,公平處理", "Xử lý công bằng theo thứ tự đăng ký", "名額依申請順序排。若超過名額,會標示「超額排休」,請改休或由主管協調核假。", "Suất được xếp theo thứ tự đăng ký. Nếu vượt suất sẽ ghi “Vượt hạn mức”, vui lòng đổi ngày hoặc nhờ quản lý duyệt.", ["超額排休,請改休 / 主管已核假", "Vượt hạn mức, vui lòng đổi ngày / Quản lý đã duyệt"]], ["📌", "#2F9E6F", "#1F7A8C", "長假、固定休也能申請", "Nghỉ dài hạn, nghỉ cố định cũng đăng ký được", "因回國、課業實習,可申請長假或固定休,送出後由主管核准,列在總休表最下方。", "Khi về nước, học hoặc thực tập, có thể đăng ký nghỉ dài hạn hoặc nghỉ cố định — gửi xong chờ quản lý duyệt, hiển thị cuối bảng tổng.", ["現在就打開「休假」試試看", "Hãy mở “Nghỉ phép” và thử ngay"]]];
function buildPromoFlex(){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;const n=LV2_PROMO.length;
  return{type:'carousel',contents:LV2_PROMO.map((p,i)=>{
    const body=[{type:'text',text:p[5],size:'md',color:'#333333',wrap:true},{type:'text',text:p[6],size:'sm',color:'#777777',wrap:true,margin:'sm'},
      {type:'box',layout:'vertical',margin:'lg',backgroundColor:'#E8F7EE',cornerRadius:'8px',paddingAll:'8px',contents:[{type:'text',text:p[7][0]+'\n'+p[7][1],size:'sm',color:'#06803A',wrap:true}]}];
    if(!p[7][0])body.pop(); // 沒有提示文字就不畫綠色小框(第 1 頁不提開啟方式)
    const b={type:'bubble',size:'mega',
      hero:{type:'box',layout:'vertical',paddingAll:'18px',paddingTop:'34px',justifyContent:'center',alignItems:'center',background:{type:'linearGradient',angle:'135deg',startColor:p[1],endColor:p[2]},contents:[{type:'text',text:p[0],size:'4xl',align:'center'},{type:'text',text:p[3],weight:'bold',size:'xl',color:'#FFFFFF',align:'center',wrap:true,margin:'md'},{type:'text',text:p[4],size:'xs',color:'#FFFFFFCC',align:'center',wrap:true,margin:'xs'},{type:'box',layout:'vertical',position:'absolute',offsetTop:'10px',offsetEnd:'12px',backgroundColor:'#00000040',cornerRadius:'10px',paddingTop:'2px',paddingBottom:'2px',paddingStart:'9px',paddingEnd:'9px',contents:[{type:'text',text:(i+1)+'/'+n,size:'xs',color:'#FFFFFF'}]}]},
      body:{type:'box',layout:'vertical',paddingAll:'18px',contents:body}};
    if(i===n-1)b.footer={type:'box',layout:'vertical',paddingAll:'lg',contents:[{type:'button',style:'primary',color:'#6d4aa8',height:'sm',action:{type:'uri',label:'開啟預排休假 / Mở Nghỉ phép',uri:base+'?lv2=l'}}]};
    return b;})};
}
const LV2_PITCH=[["📝", "#4B5563", "#6B7280", "現況:紙本排休的痛點", "每月一張紙,人工抄寫、核對、統計。", "· 同一天誰排了、滿了沒,要翻紙才知道\n· 超過名額要人工數、人工通知改休\n· 主管不能同時休,靠記憶或事後發現\n· 字跡、塗改、補章難辨識,月底還要重抄成總表"], ["📱", "#6D5DFC", "#46C2CB", "提案:排休改線上", "手機直接排,系統自動算。", "員工用 LINE 開啟預排休假,在月曆點選早/晚班;名額、順序、超額由系統即時計算,主管在手機上簽核。"], ["⚙️", "#3CB7A0", "#3B82C4", "線上做到的事", "把紙本上人工做的事自動化。", "· 依申請順序排名額,超額自動標示\n· 主管互斥組別(如 79/161)送出時自動擋下\n· 可新增設定長假、固定休、每週休一天假日等特殊規則\n· 一鍵產生 A4 總休表 PDF,可列印張貼"], ["⚖️", "#B469E0", "#6D7BF0", "公平與透明", "每個人看到的資訊剛好夠用。", "· 老師只看到自己的編號與空位,不會看到別人排誰\n· 超額會明確標示「請改休」或「主管已核假」\n· 每筆申請、簽核留有紀錄,事後可查\n· 提供主管與櫃台完整的休假總表"], ["⏰", "#F6A04D", "#F0627A", "排休流程", "先預填,到期再送出。", "· 老師可先在線上預填後 2 個月的休假日,但無法送出\n· 每月 10 日 00:00 ~ 12 日 23:59 開放送出,進入預排休階段\n· 已申請並核准的固定休排在最前面,不佔 6 位名額\n· 老師查看總休表時,只看到當天剩餘可休名額,可提前選擇可休日期,減少主管事後因超休再協調的工作"], ["🤝", "#3CB7A0", "#3B82C4", "導入方式:紙本與線上並行", "初期不取消紙本,風險最低。", "第 1 階段:紙本照舊,線上同步上線。以紙本為準,主櫃只要把紙本上的順序編號填進系統;老師可在「我的」自行綁定已有的資料。\n第 2 階段:老師習慣後,以線上為主、紙本當備查。\n第 3 階段:全面線上,不再收紙本。"], ["🗓️", "#4B8DE0", "#5A6BD8", "試辦時程", "先看介面,再小範圍試辦。", "· 11 月:先把 11 月紙本資料導入系統,大家先看看介面與資料是否正確\n· 12 月:正式試辦,紙本與線上並行\n· 老師不熟手機操作時,可遞紙本,由主管/櫃台代老師新增排休\n· 試辦期間資料皆有保留,隨時可回到紙本作業"], ["✅", "#2F9E6F", "#1F7A8C", "需要公司支持的事", "請同意試辦,並指定教學窗口。", "1. 同意 12 月起「紙本＋線上」並行試辦\n2. 公告通知同仁\n3. 責成實習副理負責教學老師使用\n4. 技術與系統介面調整,由我提供協助\n5. 試辦後檢討,再決定是否全面線上"]];
function buildPitchFlex(){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;const n=LV2_PITCH.length;
  return{type:'carousel',contents:LV2_PITCH.map((p,i)=>{
    const b={type:'bubble',size:'mega',
      hero:{type:'box',layout:'vertical',height:'110px',justifyContent:'center',alignItems:'center',background:{type:'linearGradient',angle:'135deg',startColor:p[1],endColor:p[2]},contents:[{type:'text',text:p[0],size:'4xl',align:'center'},{type:'box',layout:'vertical',position:'absolute',offsetTop:'10px',offsetEnd:'12px',backgroundColor:'#00000040',cornerRadius:'10px',paddingTop:'2px',paddingBottom:'2px',paddingStart:'9px',paddingEnd:'9px',contents:[{type:'text',text:(i+1)+'/'+n,size:'xs',color:'#FFFFFF'}]}]},
      body:{type:'box',layout:'vertical',paddingAll:'18px',contents:[{type:'text',text:p[3],weight:'bold',size:'lg',color:'#111111',wrap:true},{type:'text',text:p[4],size:'xs',color:'#888888',wrap:true,margin:'xs'},{type:'text',text:p[5],size:'sm',color:'#333333',wrap:true,margin:'lg'}]}};
    return b;})};
}
const periodText=(x,t)=>x.start.slice(5).replace('-','/')+' ~ '+(x.end?x.end.slice(5).replace('-','/'):t.pendingEnd);
const KIND_KEY={leave:'kLeave',fixed:'kFixed',alt:'kAlt',holiday:'kHoliday',part:'kPart',note:'kNote',school:'kSchool'};
const kindName=(k,t)=>String(t[KIND_KEY[k]]||k).split('（')[0].split(' (')[0];
const KIND_CLS={leave:'bg-rose-600',fixed:'bg-sky-700',alt:'bg-sky-700',holiday:'bg-emerald-700',part:'bg-gray-600',note:'bg-gray-600',school:'bg-teal-600'};
const wkNames=(days,t)=>String(days||'').split(',').filter(Boolean).map(i=>t.wk[parseInt(i,10)]).join(lang0(t)?' ':'');
const longText=(x,t)=>{const sh=x.shift?(x.shift==='early'?'（'+t.early+'）':'（'+t.late+'）'):'';
  if(x.kind==='leave')return t.kLeave;
  if(x.kind==='fixed')return fmt(t.ruleFixed,{d:wkNames(x.days,t)})+sh;
  if(x.kind==='alt')return (x.days==='odd'?t.oddD:t.evenD)+(lang0(t)?'休':'')+sh;
  if(x.kind==='holiday')return fmt(t.ruleHoliday,{d:wkNames(x.days,t),q:x.quota||String(x.days||'').split(',').length})+sh;
  if(x.kind==='part'||x.kind==='note')return kindName(x.kind,t);
  return fmt(t.weekly,{d:wkNames(x.days,t)});};
const lang0=(t)=>t.wk[0]==='CN';
// ───────── 預排休入口卡(分享給好友用:按鈕只能開網址)與介紹頁 ─────────
// 機器人回覆的入口卡/介紹 Flex 在 gas-safety2(/預排休、/預排休介紹…),內容與 LV2_PROMO 同步。分享出去的卡片 LINE 規定只能用「開啟網址」按鈕,
// 所以三顆介紹按鈕改開 ?lv2=intro&v=zh|vi|big(網頁版介紹)。
const LV2_ENTRY_INTRO=[['預排休介紹(中文)','zh'],['Giới thiệu nghỉ phép','vi'],['預排休介紹(大字)','big']];
function buildEntryFlex(){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  const bt=(label,uri)=>({type:'button',style:'secondary',height:'sm',action:{type:'uri',label:label,uri:uri}});
  return{type:'bubble',size:'mega',
    hero:{type:'box',layout:'vertical',paddingAll:'18px',paddingTop:'34px',paddingBottom:'30px',alignItems:'center',background:{type:'linearGradient',angle:'135deg',startColor:'#6D5DFC',endColor:'#46C2CB'},
      contents:[{type:'text',text:'🏖️',size:'4xl',align:'center'},{type:'text',text:'線上預排休\n開放測試了',weight:'bold',size:'xl',color:'#FFFFFF',align:'center',wrap:true,margin:'md'}]},
    footer:{type:'box',layout:'vertical',spacing:'sm',paddingAll:'16px',contents:[
      {type:'button',style:'primary',color:'#6d4aa8',height:'sm',action:{type:'uri',label:'進入預排休',uri:base+'?lv2=l'}}]
      .concat(LV2_ENTRY_INTRO.map(x=>bt(x[0],base+'?lv2=intro&v='+x[1])))}};
}
// 網頁版介紹(任何人都能開,不用登記):中文／越南文／大字
function IntroPage(){
  const q=new URLSearchParams(location.search);
  const[v,setV]=useState(['zh','vi','big'].indexOf(q.get('v'))>=0?q.get('v'):'zh');
  const vi=v==='vi',big=v==='big';
  const fs=big?29:16,tfs=big?29:22,tipfs=big?29:14;
  const go2=()=>{location.href='?lv2=l';};
  return(<Box>
    <div className="flex gap-2 flex-wrap">{[['zh','中文'],['vi','Tiếng Việt'],['big','大字']].map(x=>(<button key={x[0]} className={'px-4 py-1 rounded-full text-sm '+(v===x[0]?'bg-violet-600 text-white':'bg-gray-700 text-gray-200')} onClick={()=>setV(x[0])}>{x[1]}</button>))}</div>
    {LV2_PROMO.map((p,i)=>{const title=vi?p[4]:p[3],body=vi?p[6]:p[5],tip=vi?p[7][1]:p[7][0];
      return(<div key={i} className="rounded-2xl overflow-hidden bg-white text-gray-800 shadow">
        <div style={{background:'linear-gradient(135deg,'+p[1]+','+p[2]+')',padding:'34px 18px 18px',textAlign:'center',position:'relative'}}>
          <div style={{fontSize:40}}>{p[0]}</div><div style={{color:'#fff',fontWeight:700,fontSize:tfs,marginTop:8,whiteSpace:'pre-line'}}>{title}</div>
          <span style={{position:'absolute',top:10,right:12,background:'#0004',color:'#fff',fontSize:12,borderRadius:10,padding:'2px 9px'}}>{i+1}/{LV2_PROMO.length}</span></div>
        <div style={{padding:18}}><div style={{fontSize:fs,lineHeight:1.5,whiteSpace:'pre-line',color:'#333'}}>{body}</div>
          {tip&&<div style={{marginTop:16,background:'#E8F7EE',color:'#06803A',fontSize:tipfs,borderRadius:8,padding:8,lineHeight:1.5,whiteSpace:'pre-line'}}>{tip}</div>}
          {i===LV2_PROMO.length-1&&<button className="w-full mt-4 py-3 rounded-lg bg-violet-700 text-white font-bold" onClick={go2}>{vi?'Mở Nghỉ phép':'開啟預排休假'}</button>}</div></div>);})}
  </Box>);
}
// 分享此頁:把入口卡(網址按鈕版)分享給好友
function SharePage(){
  const[res,setRes]=useState('');
  const go2=async()=>{
    try{if(!liff.isApiAvailable('shareTargetPicker')){setRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:'線上預排休開放測試了',contents:buildEntryFlex()}]);setRes(r?'已分享 ✅':'已取消');}catch(e){setRes('錯誤:'+String(e&&e.message||e));}
  };
  return(<Box><Card className="space-y-3"><p className="font-bold text-white">📤 分享「線上預排休」入口</p>
    <p className="text-sm text-gray-400">好友收到的卡片可進入預排休,或看中文／越南文／大字版介紹。</p>
    <Btn onClick={go2}>選擇好友分享</Btn>{res&&<p className="text-center text-sm text-gray-400">{res}</p>}</Card></Box>);
}

function Leave2Routes(){
  const q=new URLSearchParams(location.search);
  if(q.get('lv2')==='intro')return <IntroPage/>;
  if(q.get('lv2')==='share')return <SharePage/>;
  if(q.get('lv2')==='pdf')return(<NeedUser render={(me)=><PdfPage me={me}/>}/>);
  return(<NeedUser render={(me)=><LeavePage me={me}/>}/>);
}

// ───────── 總休表 PDF（?lv2=pdf&month=YYYY-MM）：1~15 日一頁、16~月底一頁，長假／課業核准名單兩頁都列在最下方 ─────────
// 每天兩排：第一排 早班 1~10 位 | 晚班 1~10 位；第二排 11~20 位…（超過 20 人自動加排）
const PDF_W=794,PDF_H=1123; // A4 @96dpi
const loadScript=(src)=>new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=()=>res();s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});
const mdShort=(d)=>String(d).slice(5).replace('-','/').replace(/\/0/,'/').replace(/^0/,'');
const leftTag=(left,c,vi)=>{const d=left&&left[String(c).trim()];return d?mdShort(d)+(vi?' nghỉ':'離'):'';};
function PdfCell({x,left}){
  // 向上對齊:號碼在上、批准人小字在號碼正下方(不用 vertical-align / sup,html2canvas 在 iPhone 上會跑到底部)
  return(<td style={{border:'1px solid #999',padding:0,height:26,textAlign:'center',verticalAlign:'top',whiteSpace:'nowrap',overflow:'visible'}}>{x?<div style={{position:'relative',top:-2}}><div style={{fontSize:12,lineHeight:'13px',height:13,textDecoration:x.o?'underline':'none',fontWeight:x.o?700:400}}>{x.c}{x.p?'*':''}</div>
    <div style={{fontSize:8,lineHeight:'11px',height:11,color:'#d00',fontWeight:400}}>{(()=>{const lt=leftTag(left,x.c);return(x.s||lt)?<React.Fragment>{x.s}{x.s&&lt?' ':''}{lt&&<span style={{color:'#555'}}>{lt}</span>}</React.Fragment>:'\u00a0';})()}</div></div>:null}</td>);
}
function PdfPageSheet({title,sub,days,roster,month,longBoard,left,pageNo,pages,genAt}){
  const wkz=['日','一','二','三','四','五','六'];
  const th={border:'1px solid #999',background:'#eee',fontSize:12,padding:0,height:24,lineHeight:'24px',verticalAlign:'middle',textAlign:'center'};
  const td={border:'1px solid #999',padding:'2px 4px',verticalAlign:'middle'};
  const wkS=(x)=>String(x.days||'').split(',').filter(Boolean).map(i=>wkz[parseInt(i,10)]).join('');
  const shT=(x)=>x.shift==='early'?'（早）':x.shift==='late'?'（晚）':'';
  const wkLine=(x)=>x.kind==='leave'?'長假':x.kind==='fixed'?'固定休　每週'+wkS(x)+shT(x):x.kind==='alt'?'固定隔日休　'+(x.days==='odd'?'單號日':'雙號日')+shT(x):x.kind==='holiday'?'假日可休　'+wkS(x)+'・每週'+(x.quota||String(x.days||'').split(',').length)+'天'+shT(x):x.kind==='part'?'兼職':x.kind==='note'?'見人再壓':'課業　每週'+wkS(x)+'上班';
  const PER=6;const N=Array.from({length:PER});
  const leftArr=Object.keys(left||{}).filter(c=>left[c]>=month+'-01').sort((a,b)=>left[a]<left[b]?-1:left[a]>left[b]?1:(parseFloat(a)-parseFloat(b))||0);
  return(<div className="pdfpage" style={{width:PDF_W,height:PDF_H,background:'#fff',color:'#000',padding:'28px 30px',boxSizing:'border-box',fontFamily:'-apple-system,"PingFang TC","Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",sans-serif',position:'relative',overflow:'hidden'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',borderBottom:'2px solid #000',paddingBottom:4,marginBottom:6}}>
      <span style={{fontSize:18,fontWeight:700}}>{title}</span><span style={{fontSize:12}}>{sub}　第 {pageNo} / {pages} 頁</span></div>
    <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
      <colgroup><col style={{width:46}}/><col style={{width:26}}/>{N.map((_,i)=><col key={'e'+i}/>)}{N.map((_,i)=><col key={'l'+i}/>)}</colgroup>
      <thead><tr><th style={th} rowSpan={1}>日期</th><th style={th}>週</th><th style={th} colSpan={PER}>早班休假</th><th style={th} colSpan={PER}>晚班休假</th></tr></thead>
      <tbody>{days.map(dd=>{
        const date=month+'-'+String(dd).padStart(2,'0');const ro=roster[date]||{early:[],late:[]};
        const dow=new Date(parseInt(month.slice(0,4),10),parseInt(month.slice(5,7),10)-1,dd).getDay();const wk=dow===0||dow===6;
        const rows=Math.max(2,Math.ceil(Math.max(ro.early.length,ro.late.length)/PER));
        const bg=wk?'#f2f2f2':'#fff';
        return Array.from({length:rows}).map((_,r)=>(<tr key={date+r} style={{background:bg}}>
          {/* 不用 rowSpan(iPhone/LINE 內建瀏覽器的 html2canvas 會漏畫合併儲存格內的文字):每排各一格,第一排放字,中間不畫分隔線 */}
          <td style={{...td,textAlign:'center',verticalAlign:'top',lineHeight:'15px',fontWeight:700,fontSize:13,borderTop:r===0?'1px solid #999':'none',borderBottom:r<rows-1?'none':'1px solid #999'}}>{r===0?(parseInt(month.slice(5,7),10)+'/'+dd):'\u00a0'}</td>
          <td style={{...td,textAlign:'center',verticalAlign:'top',lineHeight:'15px',fontSize:12,color:wk?'#c00':'#000',borderTop:r===0?'1px solid #999':'none',borderBottom:r<rows-1?'none':'1px solid #999'}}>{r===0?wkz[dow]:'\u00a0'}</td>
          {N.map((_,i)=><PdfCell key={'e'+i} x={ro.early[r*PER+i]} left={left}/>)}
          {N.map((_,i)=><PdfCell key={'l'+i} x={ro.late[r*PER+i]} left={left}/>)}</tr>));})}
      </tbody></table>
    <div style={{position:'absolute',left:30,right:30,bottom:30}}>
      <div style={{fontSize:13,fontWeight:700,borderBottom:'1px solid #000',marginBottom:3,lineHeight:'18px',paddingBottom:3}}>長假／固定上班日（已核准）</div>
      {longBoard.length===0&&leftArr.length===0?<div style={{fontSize:11,color:'#555'}}>本月無</div>:(()=>{
        const md=(d)=>String(d).slice(5).replace('-','/').replace(/\/0/,'/').replace(/^0/,'');
        const sh=(x)=>x.shift==='early'?'早':x.shift==='late'?'晚':'';
        const item=(x)=>{const e=x.end?'~'+md(x.end):'';
          if(x.kind==='leave')return x.code+'('+md(x.start)+(x.end?'~'+md(x.end):'~')+')';
          if(x.kind==='fixed')return x.code+'('+wkS(x)+e+')';
          if(x.kind==='alt')return x.code+'('+(x.days==='odd'?'單':'雙')+sh(x)+e+')';
          if(x.kind==='holiday')return x.code+'('+wkS(x)+(x.quota||String(x.days||'').split(',').length)+'天'+sh(x)+e+')';
          return x.code;};
        const G=[['leave','長假'],['fixed','固定休'],['alt','隔日休'],['holiday','假日可休'],['part','兼職'],['note','見人再壓']];
        return G.map(([k,nm])=>{const arr=longBoard.filter(x=>x.kind===k);return arr.length?(<div key={k} style={{fontSize:11,lineHeight:'16px'}}><b>{nm}</b>　{arr.map(item).join('　')}</div>):null;}).concat(leftArr.length?[(<div key="lf" style={{fontSize:11,lineHeight:'16px'}}><b>離職</b>　{leftArr.map(c=>c+'('+mdShort(left[c])+'離)').join('　')}</div>)]:[]);
      })()}
      <div style={{fontSize:10,color:'#666',marginTop:4}}>底線＝超出名額（待調整）　<span style={{color:'#d00'}}>紅字</span>＝批准主管編號　*＝待簽核　主管排休已列入　列印時間 {genAt}</div>
    </div>
  </div>);
}
function PdfPage({me}){
  const q=new URLSearchParams(location.search);
  const cur=todayStr().slice(0,7);const month=q.get('month')||addMonth(cur,1);const store=q.get('store')||'';
  const[st,reload]=useLoad('lv2Month',store?{month:month,store:store}:{month:month});
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[cap,setCap]=useState(false);
  const[pdfFile,setPdfFile]=useState(null);const[pdfUrl,setPdfUrl]=useState('');const[pdfImgs,setPdfImgs]=useState([]);
  const[scale,setScale]=useState(()=>Math.min(1,(Math.max(320,window.innerWidth||390)-24)/PDF_W));
  const d=st.data&&st.data.ok&&st.data.month===month?st.data:null;
  if(!d&&st.loading)return(<Loading/>);
  if(!d)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const nd=new Date(parseInt(month.slice(0,4),10),parseInt(month.slice(5,7),10),0).getDate();
  const p1=Array.from({length:15},(_,i)=>i+1),p2=Array.from({length:nd-15},(_,i)=>i+16);
  const title=d.store+'　'+month.slice(0,4)+' 年 '+parseInt(month.slice(5,7),10)+' 月　休假總表';
  const genAt=(()=>{const x=new Date(Date.now()+8*3600e3);return (x.getUTCMonth()+1)+'/'+x.getUTCDate()+' '+p2s(x.getUTCHours())+':'+p2s(x.getUTCMinutes());})();
  function p2s(n){return String(n).padStart(2,'0');}
  const sheetProps={roster:d.roster,month:month,longBoard:d.long.board,left:d.left||{},pages:2,genAt:genAt,title:title};
  const download=async()=>{
    setBusy(true);setErr('');setCap(true);
    try{
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await new Promise(r=>setTimeout(r,80));
      const pages=[].slice.call(document.querySelectorAll('.pdfpage'));
      const pdf=new window.jspdf.jsPDF({unit:'pt',format:'a4',orientation:'portrait'});
      const imgs=[];
      for(let i=0;i<pages.length;i++){
        const cv=await window.html2canvas(pages[i],{scale:2,backgroundColor:'#ffffff',useCORS:true});
        if(i>0)pdf.addPage();
        const du=cv.toDataURL('image/jpeg',0.92);imgs.push(du);
        pdf.addImage(du,'JPEG',0,0,595.28,841.89);
      }
      // 不直接 save(LINE 內建瀏覽器常常不能下載):產生後讓使用者再按一次「分享」(iPhone 原生分享表,可存到檔案/AirDrop/傳 LINE),並附圖片版可長按存相簿
      const fname='休假總表_'+d.store+'_'+month+'.pdf';
      const blob=pdf.output('blob');
      let f=null;try{f=new File([blob],fname,{type:'application/pdf'});}catch(_e){}
      setPdfFile(f);setPdfUrl(URL.createObjectURL(blob));setPdfImgs(imgs);
    }catch(e){setErr('產生 PDF 失敗：'+String(e&&e.message||e).slice(0,120)+'（可改用下方圖片版長按儲存，或按「用瀏覽器開啟」）');}
    setCap(false);setBusy(false);
  };
  const external=()=>{try{if(window.liff&&window.liff.openWindow){window.liff.openWindow({url:location.href,external:true});return;}}catch(_e){}window.open(location.href,'_blank');};
  return(<div className="p-3 space-y-3">
    <style>{'@media print{.nop{display:none!important}.pdfwrap{transform:none!important;height:auto!important}.pdfpage{page-break-after:always}.pdfpage{height:1122px!important;overflow:hidden}.pdfpage:last-child{page-break-after:auto}@page{size:A4 portrait;margin:0}body{background:#fff!important}}'}</style>
    <div className="nop flex items-center justify-between"><button className="text-sm text-violet-300" onClick={()=>go('lv2=l')}>← 返回</button><h1 className="text-base font-bold text-white">📄 休假總表 PDF</h1><span/></div>
    <div className="nop flex gap-2"><Btn loading={busy} onClick={download}>{pdfFile||pdfUrl?'重新產生 PDF':'產生 PDF（2 頁）'}</Btn><Btn color="bg-gray-800 text-gray-200 border border-gray-600" onClick={external}>用瀏覽器開啟</Btn></div>
    {err&&<p className="nop text-sm text-red-400 text-center">{err}</p>}
    {(pdfUrl||pdfImgs.length>0)&&<div className="nop rounded-xl border border-emerald-700 p-3 space-y-2">
      <p className="text-sm text-emerald-300 font-bold">✅ PDF 已產生</p>
      {pdfFile&&navigator.canShare&&navigator.canShare({files:[pdfFile]})&&<Btn color="bg-emerald-600 text-white" onClick={async()=>{setErr('');try{await navigator.share({files:[pdfFile],title:pdfFile.name});}catch(e){if(!e||e.name!=='AbortError')setErr('分享失敗：'+String(e&&e.message||e).slice(0,100));}}}>📤 用手機分享／儲存</Btn>}
      {pdfUrl&&<a href={pdfUrl} download={'休假總表_'+d.store+'_'+month+'.pdf'} className="block text-center rounded-xl bg-gray-800 border border-gray-600 text-gray-200 text-sm py-2.5">下載 PDF 檔</a>}
      <p className="text-[11px] text-gray-400">若「分享」或「下載」沒反應：長按下面的圖片 →「加入照片」或「儲存影像」。</p>
      {pdfImgs.map((u,i)=>(<img key={i} src={u} alt={'第 '+(i+1)+' 頁'} className="w-full rounded border border-gray-700"/>))}
    </div>}
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
  const[rq,setRq]=useState('');const[rPg,setRPg]=useState(null);const[adjOpen,setAdjOpen]=useState({});const[armed,setArmed]=useState('');const[vMode,setVMode]=useState(()=>lsGet('lv2ViewMode','mgr')==='teacher'?'teacher':'mgr');const[seqOpen,setSeqOpen]=useState(false);const[gErr,setGErr]=useState('');const[gDraft,setGDraft]=useState([]);const[gCode,setGCode]=useState('');const[seqSort,setSeqSort]=useState('order');const[seqQ,setSeqQ]=useState('');const[lgOpen,setLgOpen]=useState(false);
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
  const holOk=(date)=>{const dw=new Date(parseInt(date.slice(0,4),10),parseInt(date.slice(5,7),10)-1,parseInt(date.slice(8),10)).getDay();return d.long.mine.some(r=>r.kind==='holiday'&&r.status==='approved'&&String(r.days).split(',').indexOf(String(dw))>=0&&r.start<=date&&(!r.end||r.end>=date));};
  const slotOf0=(date,sh)=>{
    if(d.anon)return (d.slots&&d.slots[date]&&d.slots[date][sh])||{o:0,me:'',over:0,sign:'',h:0};
    const arr=((d.roster&&d.roster[date])||{})[sh]||[];const my=String((d.me&&d.me.code)||'');let o=0,me='',over=0,sign='',h=0;
    arr.forEach(x=>{if(x.m)return;if(my&&String(x.c)===my){me=my;over=x.x?1:0;sign=x.x?(x.s||''):'';h=(x.h||x.f)?1:0;}else if(!x.x&&!x.f&&!x.h)o++;});
    return {o:o,me:me,over:over,sign:sign,h:h};};
  const slotOf=(date,sh)=>{const x=slotOf0(date,sh);if(x.me)return x;const mc=String((d.me&&d.me.code)||'');
    if(mc&&(selHas(date,sh)||d.mine.some(m=>m.date===date&&m.shift===sh&&m.status!=='rejected'&&m.status!=='cancelled')))return Object.assign({},x,{me:mc});return x;};
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
      const fullDays=[];sel.forEach(x=>{if(((d.counts[x.date]||{})[x.shift]||0)>=capOf(x.date)&&!holOk(x.date)){const k=parseInt(x.date.slice(5,7),10)+'/'+parseInt(x.date.slice(8),10);if(fullDays.indexOf(k)<0)fullDays.push(k);}});
      const overP=!d.isMgr&&(used.early>lim.person||used.late>lim.person);
      if(fullDays.length){if(!window.confirm(fmt(t.fullWarn,{d:fullDays.join(' ')})))return;}
      else if(!window.confirm(t.submitAsk+(overP?'\n'+t.submitOver:'')))return;
    }
    const r=await api('lv2Save',{month:month,items:JSON.stringify(sel),submit:!!submit});
    if(r&&r.ok){setMsg(submit?fmt(t.sent,{a:r.approved,p:r.pending}):fmt(t.saved,{n:r.saved}));reload();}
    else setErr((r&&r.error)||t.fail);
  });
  const longSend=()=>run(async()=>{
    const r=await api('lv2LongSave',{kind:lf.kind,start:lf.start,end:lf.end,days:lf.kind==='alt'?lf.alt:lf.days.join(','),shift:lf.shift,quota:lf.quota,code:lf.code,reason:lf.reason.trim()});
    if(r&&r.ok){setMsg(r.status==='approved'?t.addedOk:t.longSent);setLf(null);reload();}else setErr((r&&r.error)||t.fail);
  });
  const longAct=(action,params,ask)=>{if(ask&&!window.confirm(ask))return;run(async()=>{const r=await api(action,params);if(r&&r.ok)reload();else setErr((r&&r.error)||t.fail);});};
  const decide=(id,approve)=>run(async()=>{const r=await api('lv2Decide',{id:id,approve:approve});if(r&&r.ok)reload();else setErr((r&&r.error)||t.fail);});

  // 月曆
  const[y,m]=[parseInt(month.slice(0,4),10),parseInt(month.slice(5,7),10)];
  const first=new Date(y,m-1,1).getDay();const nd=new Date(y,m,0).getDate();
  const cells=[];for(let i=0;i<first;i++)cells.push(null);for(let i=1;i<=nd;i++)cells.push(month+'-'+p2(i));
  const banner={tooEarly:t.st_tooEarly,draft:fmt(t.st_draft,{o:(d.opens||'').slice(5).replace('-','/')}),open:fmt(t.st_open,{c:(d.closes||'').slice(5)}),late:t.st_late,past:t.st_past}[d.state];
  const bannerCls=d.state==='open'?'border-emerald-700 bg-emerald-950/40 text-emerald-300':d.state==='late'?'border-amber-700 bg-amber-950/40 text-amber-300':'border-gray-700 bg-gray-900 text-gray-300';
  const flagText=(f)=>String(f||'').split(',').filter(Boolean).map(x=>t['flag_'+x]).join('、');
  const canEdit=d.canLeave&&(d.state==='draft'||d.state==='open'||d.state==='late');
  const canSubmit=canEdit&&d.state!=='draft'&&sel.length>0;
  const rosterOf=focus&&d.roster[focus];
  const isV=!!(d.isMgr||d.canSeq);
  const seqView=(()=>{let l=d.seqList.slice();if(seqSort==='code')l.sort((a,b)=>(parseInt(a.code,10)||1e9)-(parseInt(b.code,10)||1e9));if(seqQ)l=l.filter(x=>String(x.code).indexOf(seqQ)===0);return l;})();
  const allDays=cells.filter(Boolean);
  const anonView=!!(d.anon||(isV&&vMode==='teacher'));
  const rosterDates=allDays.filter(dt=>!(isV&&vMode==='mgr'&&rMode==='future')||dt>=today);
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
    {d.paper&&(d.paper.n>0||(d.paper.rules||[]).length>0)&&(d.canLeave||d.isTeacher)&&<Card className="space-y-2 border-amber-700">
      <p className="text-sm font-bold text-amber-300">📎 {t.paperT}</p>
      {(d.paper.rules||[]).length>0&&<p className="text-xs text-gray-300">另有規則：{d.paper.rules.join('、')}</p>}
      {d.paper.n>0&&<p className="text-xs text-gray-300">{fmt(t.paperTxt,{n:d.paper.n,c:d.me.code,m:parseInt(month.slice(5,7),10),l:d.paper.items.map(x=>parseInt(x.date.slice(5,7),10)+'/'+parseInt(x.date.slice(8),10)+(x.shift==='early'?(lang==='vi'?' sáng':' 早'):(lang==='vi'?' tối':' 晚'))).join('、')})}</p>}
      <Btn loading={busy} onClick={()=>{if(!window.confirm(t.paperAsk))return;run(async()=>{const r=await api('lv2Claim',{});if(r&&r.ok){setMsg(fmt(t.paperOk,{n:r.n}));reload();}else setErr((r&&r.error)||t.fail);});}}>{t.paperBtn}</Btn></Card>}
    {d.blocked&&<p className="text-sm text-amber-300">{fmt(t.blockedTxt,{k:kindName(d.blocked,t)})}</p>}
    {!d.canLeave&&!d.blocked&&<p className="text-xs text-gray-400">{t.notTeacher}</p>}
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
            {capOf(date)>0&&new Date(parseInt(date.slice(0,4),10),parseInt(date.slice(5,7),10)-1,parseInt(date.slice(8),10)).getDay()%6!==0&&<span className="mt-auto text-[9px] leading-3 text-gray-500">
              <span className={c.early>=capOf(date)?'text-red-400':''}>{c.early}</span>/<span className={c.late>=capOf(date)?'text-red-400':''}>{c.late}</span></span>}
          </button>);})}
      </div>
      <p className="text-[11px] text-gray-500">{lang==='vi'?'Số nhỏ: ca sáng/ca tối của chi nhánh (tối đa '+lim.weekday+')':'小字：本店 早班/晚班 已休人數（平日每班上限 '+lim.weekday+' 人）'}</p>
    </Card>
    {d.canLeave&&<Card className="space-y-1">
      <p className="text-sm font-bold text-white">{t.sum}</p>
      {['early','late'].map(s=>(<p key={s} className={'text-sm '+(used[s]>lim.person?'text-red-400':'text-gray-200')}>{t[s]}：{used[s]} / {lim.person} {t.days}{used[s]>lim.person?'　'+fmt(t.over,{n:lim.person}):''}</p>))}
      {sel.some(x=>((d.counts[x.date]||{})[x.shift]||0)>=capOf(x.date)&&!holOk(x.date))&&<p className="text-xs text-red-400">{fmt(t.full,{n:lim.weekday})}</p>}
    </Card>}
    {canEdit&&<div className="flex gap-2"><Btn color="bg-gray-700 text-white" loading={busy} onClick={()=>save(false)}>{t.draft}</Btn>
      {d.state!=='draft'&&<Btn loading={busy} onClick={()=>canSubmit?save(true):null} color={canSubmit?undefined:'bg-gray-800 text-gray-500'}>{t.submit}</Btn>}</div>}
    {msg&&<p className="text-center text-sm text-emerald-400">✅ {msg}</p>}
    {err&&<p className="text-center text-sm text-red-400">{err}</p>}
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
    <Card className="space-y-2">
      <div className="flex items-center justify-between"><p className="text-sm font-bold text-white">🗓️ {t.rosterTitle}</p>
        {isV&&vMode==='mgr'&&<button onClick={()=>go('lv2=pdf&month='+month+(store?'&store='+encodeURIComponent(store):''))} className="text-xs border border-gray-600 text-gray-200 rounded-xl px-3 py-1.5">📄 PDF</button>}</div>
      <p className="text-[11px] text-gray-500">{anonView?t.legendAnon:fmt(t.rosterHint,{w:lim.weekday,e:lim.weekend})}</p>
      {isV&&<div className="flex gap-2"><Chip on={vMode==='mgr'} onClick={()=>{setVMode('mgr');lsSet('lv2ViewMode','mgr');setRPg(null);}}>{t.modeMgr}</Chip><Chip on={vMode==='teacher'} onClick={()=>{setVMode('teacher');lsSet('lv2ViewMode','teacher');setRPg(null);}}>{t.modeTeacher}</Chip></div>}
      {isV&&vMode==='mgr'&&<div className="space-y-2">
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
      {pageDates.map(date=>{
        if(anonView){
          const sl={early:slotOf(date,'early'),late:slotOf(date,'late')};const cap=capOf(date);const open=cap>0;
          const dw=new Date(parseInt(date.slice(0,4),10),parseInt(date.slice(5,7),10)-1,parseInt(date.slice(8),10)).getDay();const wkd=dw===0||dw===6;
          const aLine=(sh)=>{const x=sl[sh]||{o:0,me:'',over:0,sign:'',h:0};
            const inQ=!!(x.me&&!x.over&&!x.h);const N=open?cap:Math.max(lim.weekday,1);
            const fill=open?Math.min(x.o,cap-(inQ?1:0)):0;const left=open?Math.max(0,cap-fill-(inQ?1:0)):0;
            const cells=[];for(let i=0;i<fill;i++)cells.push(<span key={'f'+i} className={sh==='early'?'text-amber-400':'text-indigo-400'}>✦</span>);
            if(inQ||(x.me&&x.h))cells.push(<span key="me" className="text-[13px] font-bold text-white bg-violet-600 rounded-lg px-2 leading-[22px]">{x.me}</span>);
            for(let i=0;i<(open?left:N);i++)cells.push(<span key={'e'+i} className="text-gray-600">✧</span>);
            if(x.me&&x.over){cells.push(<span key="me2" className="text-[13px] font-bold text-white bg-violet-600 rounded-lg px-2 leading-[22px] ml-0.5">{x.me}</span>);}
            let note=null;
            if(x.me&&x.over)note=<span className={'ml-auto text-[11px] font-bold '+(x.sign?'text-amber-300':'text-orange-400')}>{x.sign?fmt(t.ovSigned,{c:x.sign}):t.ovAsk}</span>;
            else if(!open)note=<span className="ml-auto text-[11px] text-gray-500">{t.notOpen}</span>;
            else if(left===0)note=<span className="ml-auto text-[11px] font-bold text-red-400">{t.slotFull}</span>;
            else note=<span className="ml-auto text-[11px] text-gray-400">{fmt(t.slotLeft,{n:left})}</span>;
            return(<div key={sh} className="flex items-center gap-1 flex-wrap text-[17px] leading-[26px]"><span className={'text-[11px] rounded px-1 text-white leading-[18px] mr-1 '+SH_COLOR[sh]}>{sh==='early'?'早':'晚'}</span>{cells}{note}</div>);};
          return(<div key={date} className={'border-t border-gray-800 pt-1.5 flex gap-3 '+(date<today?'opacity-40':date===today?'rounded-xl ring-1 ring-violet-500 bg-violet-950/30 px-1 ':'')}>
            <div className="w-12 shrink-0 text-center"><div className="text-xs font-bold text-violet-300">{parseInt(date.slice(5,7),10)}/{parseInt(date.slice(8),10)}</div>
              <span className={'inline-block text-[10px] rounded-full px-2 '+(wkd?'bg-red-950 text-red-300':'bg-gray-800 text-gray-400')}>{t.wk[dw]}</span>
              {date===today&&<div className="text-[9px] bg-violet-600 text-white rounded px-1 inline-block mt-0.5">{lang==='vi'?'Nay':'今天'}</div>}</div>
            <div className="flex-1 min-w-0 space-y-1">{aLine('early')}{aLine('late')}</div></div>);
        }
        const ro=d.roster[date]||{early:[],late:[]};
        const dow=new Date(parseInt(date.slice(0,4),10),parseInt(date.slice(5,7),10)-1,parseInt(date.slice(8),10)).getDay();const wkend=dow===0||dow===6;
        const total=ro.early.length+ro.late.length;
        const line=(s)=>{const arr=ro[s];if(!arr.length)return null;
          const rows=[];for(let i=0;i<arr.length;i+=5)rows.push(arr.slice(i,i+5));
          return(<div key={s} className="space-y-0.5">{rows.map((row,ri)=>(<div key={ri} className="grid items-start text-sm leading-5" style={{gridTemplateColumns:'24px repeat(5,minmax(0,1fr))'}}>
            <span>{ri===0?<span className={'text-[11px] rounded px-1 text-white '+SH_COLOR[s]}>{s==='early'?'早':'晚'}</span>:null}</span>
            {row.map((x,i)=>(<span key={x.id||i} className="inline-flex flex-col items-center"><span className={x.o?'text-orange-400 font-bold':x.f?'text-sky-300':'text-gray-200'}>{x.c}{x.p?'*':''}</span>{x.s&&(!isV||showSign)?<span className="text-[7px] leading-[8px] text-red-500 font-bold -mt-0.5">{x.s}</span>:x.f?<span className="text-[7px] leading-[8px] text-sky-400 -mt-0.5">{t.fixedTag}</span>:null}{leftTag(d.left,x.c,lang==='vi')?<span className="text-[7px] leading-[8px] text-gray-400 -mt-0.5">{leftTag(d.left,x.c,lang==='vi')}</span>:null}</span>))}</div>))}</div>);};
        return(<div key={date} className={'border-t border-gray-800 pt-1.5 flex gap-3 '+(date<today?'opacity-40':date===today?'rounded-xl ring-1 ring-violet-500 bg-violet-950/30 px-1 ':'')}>
          <div className="w-12 shrink-0 text-center"><div className="text-xs font-bold text-violet-300">{parseInt(date.slice(5,7),10)}/{parseInt(date.slice(8),10)}</div>
            <span className={'inline-block text-[10px] rounded-full px-2 '+(wkend?'bg-red-950 text-red-300':'bg-gray-800 text-gray-400')}>{t.wk[dow]}</span>
            {date===today&&<div className="text-[9px] bg-violet-600 text-white rounded px-1 inline-block mt-0.5">{lang==='vi'?'Nay':'今天'}</div>}<div className="text-[10px] text-gray-500 mt-0.5"><span>{ro.early.length}/{ro.late.length}</span></div></div>
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
        {(lgOpen?d.long.board:d.long.board.slice(0,1)).map(x=>(<p key={x.id} className="text-sm text-gray-200 border-b border-gray-900 py-0.5"><span className="font-bold text-violet-300">{x.code}</span>{lang==='vi'?'':' 號'}　<span className={'text-xs rounded-full px-2 py-0.5 text-white '+(KIND_CLS[x.kind]||'bg-gray-600')}>{kindName(x.kind,t)}</span>{x.kind!=='leave'&&x.kind!=='part'&&x.kind!=='note'?<span className="text-xs text-gray-300">　{longText(x,t)}</span>:null}{x.kind!=='fixed'&&x.kind!=='alt'&&x.kind!=='holiday'||x.end?<span>　{periodText(x,t)}</span>:null}{x.reason?<span className="text-xs text-gray-500">　{x.reason}</span>:null}{d.staff&&(x.kind==='part'||x.kind==='note')?<span className="text-[10px] text-gray-600">　{t.staffOnly}</span>:null}{d.staff?<button onClick={()=>longAct('lv2LongCancel',{id:x.id},t.delAsk)} className="text-gray-500 text-xs ml-2">✕</button>:null}</p>))}
        {!lgOpen&&d.long.board.length>1&&<button onClick={()=>setLgOpen(true)} className="text-[11px] text-gray-500">{lang==='vi'?'Bấm để xem '+(d.long.board.length-1)+' mục còn lại':'點此展開其餘 '+(d.long.board.length-1)+' 筆'}</button>}</div>
    </Card>
    {(d.isTeacher||d.staff)&&<Card className="space-y-2">
      <p className="text-sm font-bold text-white">{t.longTitle}</p>
      {!lf&&<p className="text-xs text-gray-500">{t.longHint}</p>}
      {!lf&&<Btn color="bg-gray-800 text-gray-200 border border-gray-600" onClick={()=>setLf({kind:'leave',start:'',end:'',days:[],alt:'odd',quota:'',shift:(d.me&&d.me.shift)||'early',code:'',reason:''})}>{t.longBtn}</Btn>}
      {lf&&<div className="space-y-2">
        <div className="flex gap-2 flex-wrap">{(d.staff?['leave','fixed','alt','holiday','part','note']:['leave','fixed','alt','holiday']).map(k=>(<Chip key={k} on={lf.kind===k} onClick={()=>setLf({...lf,kind:k,days:[],quota:''})}>{kindName(k,t)}</Chip>))}</div>
        {d.staff&&<div><p className="text-xs text-gray-400 mb-1">{t.forCode}{lf.kind==='part'||lf.kind==='note'?' *':''}</p><input value={lf.code} inputMode="numeric" onChange={e=>setLf({...lf,code:e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder={d.isTeacher&&lf.kind!=='part'&&lf.kind!=='note'?'（留空＝我自己）':'例：139'} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>}
        {(lf.kind==='fixed'||lf.kind==='alt'||lf.kind==='holiday')&&<div><p className="text-xs text-gray-400 mb-1">{t.shiftL}</p><div className="flex gap-2">{['early','late'].map(sh=><Chip key={sh} on={lf.shift===sh} onClick={()=>setLf({...lf,shift:sh})}>{t[sh]}</Chip>)}</div></div>}
        {lf.kind==='fixed'&&<div><p className="text-xs text-gray-400 mb-1">{t.kFixed}</p><div className="flex gap-1 flex-wrap">{t.wk.map((w,i)=>(<Chip key={i} on={lf.days.indexOf(String(i))>=0} onClick={()=>setLf({...lf,days:lf.days.indexOf(String(i))>=0?lf.days.filter(x=>x!==String(i)):lf.days.concat([String(i)])})}>{w}</Chip>))}</div></div>}
        {lf.kind==='alt'&&<div className="flex gap-2"><Chip on={lf.alt==='odd'} onClick={()=>setLf({...lf,alt:'odd'})}>{t.oddD}</Chip><Chip on={lf.alt==='even'} onClick={()=>setLf({...lf,alt:'even'})}>{t.evenD}</Chip></div>}
        {lf.kind==='holiday'&&<div className="space-y-2"><div><p className="text-xs text-gray-400 mb-1">{t.holDays}</p><div className="flex gap-2">{[['6',t.wk[6]],['0',t.wk[0]]].map(([v,n])=>(<Chip key={v} on={lf.days.indexOf(v)>=0} onClick={()=>{const nd=lf.days.indexOf(v)>=0?lf.days.filter(x=>x!==v):lf.days.concat([v]);setLf({...lf,days:nd,quota:''});}}>{n}</Chip>))}</div></div>
          {lf.days.length>0&&<div><p className="text-xs text-gray-400 mb-1">{t.holQuota}</p><div className="flex gap-2">{Array.from({length:lf.days.length}).map((_,i)=>(<Chip key={i} on={String(lf.quota||lf.days.length)===String(i+1)} onClick={()=>setLf({...lf,quota:String(i+1)})}>{i+1}</Chip>))}</div></div>}</div>}
        <div><p className="text-xs text-gray-400 mb-1">{t.startD}{lf.kind==='part'||lf.kind==='note'||d.staff?'（'+(lang==='vi'?'bỏ trống = hôm nay':'留空＝今天')+'）':''}</p><input type="date" min={d.staff?undefined:today} value={lf.start} onChange={e=>setLf({...lf,start:e.target.value})} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>
        <div><p className="text-xs text-gray-400 mb-1">{lf.kind==='leave'?t.endD:t.endOpt}</p><input type="date" min={lf.start||today} value={lf.end} onChange={e=>setLf({...lf,end:e.target.value})} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>
        <input value={lf.reason} maxLength={100} onChange={e=>setLf({...lf,reason:e.target.value})} placeholder={t.reason} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
        <div className="flex gap-2"><Btn color="bg-gray-700 text-white" onClick={()=>setLf(null)}>{lang==='vi'?'Hủy':'取消'}</Btn><Btn loading={busy} onClick={longSend}>{t.sendLong}</Btn></div></div>}
      {d.long.mine.map(x=>(<div key={x.id} className="rounded-xl border border-gray-700 p-2 space-y-1">
        <p className="text-sm text-white">{x.kind==='leave'?t.kLeave:longText(x,t)}　{periodText(x,t)}</p>
        <p className="text-xs"><span className={x.status==='approved'?'text-emerald-400':'text-amber-300'}>{t['s_'+x.status]||x.status}</span>{x.reason?<span className="text-gray-500">　{x.reason}</span>:null}</p>
        <div className="flex gap-2">{!x.end&&<button onClick={()=>{const v=window.prompt(t.setEndAsk,'');if(v)longAct('lv2LongEnd',{id:x.id,end:v.trim()});}} className="px-3 py-1.5 rounded-xl text-xs border border-gray-600 text-gray-200">{t.setEnd}</button>}
          <button onClick={()=>longAct('lv2LongCancel',{id:x.id},t.cancelLong+'?')} className="px-3 py-1.5 rounded-xl text-xs border border-gray-600 text-gray-300">{t.cancelLong}</button></div>
      </div>))}
    </Card>}
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
      <div className="flex items-center"><p className="text-sm font-bold text-white">🔢 {t.seqTitle}</p><button onClick={()=>setSeqOpen(!seqOpen)} className="ml-auto text-xs text-violet-300">{seqOpen?t.seqToggleClose:t.seqToggleOpen}</button></div>{seqOpen&&<p className="text-[11px] text-gray-500">{t.seqHint}</p>}
      {seqOpen&&<div className="space-y-2">
      <div className="flex gap-2 items-center flex-wrap"><Chip on={seqSort==='order'} onClick={()=>setSeqSort('order')}>{t.seqByOrder}</Chip><Chip on={seqSort==='code'} onClick={()=>setSeqSort('code')}>{t.seqByCode}</Chip>
        <input value={seqQ} onChange={e=>setSeqQ(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder={t.seqSearch} className="flex-1 min-w-[90px] rounded-lg bg-gray-900 border border-gray-700 px-2 py-1.5 text-sm text-white"/>{seqQ&&<button onClick={()=>setSeqQ('')} className="text-gray-400 px-1">✕</button>}</div>
      {d.seqList.length===0&&<p className="text-xs text-gray-500">{t.empty}</p>}
      {seqView.map(x=>(<div key={x.userId} className="flex items-center gap-2"><span className="w-12 font-bold text-gray-200">{x.code}</span><span className="text-xs text-gray-500 flex-1">{fmt(t.seqDays,{n:x.n})}</span>
        <input value={seqIn[x.userId]!==undefined?seqIn[x.userId]:String(x.seq)} inputMode="numeric" onChange={e=>setSeqIn({...seqIn,[x.userId]:e.target.value.replace(/\D/g,'').slice(0,4)})} className="w-20 text-center rounded-lg bg-gray-800 border border-gray-700 py-1.5 text-white"/>
        <button disabled={busy} onClick={()=>longAct('lv2SeqSet',{month:month,userId:x.userId,seq:seqIn[x.userId]!==undefined?seqIn[x.userId]:String(x.seq)})} className="px-3 py-1.5 rounded-lg text-xs bg-gray-700 text-white disabled:opacity-50">{t.seqSave}</button></div>))}
      </div>}
    </Card>}
    {d.isMgr&&(()=>{const cv=cf||{wd:String(lim.weekday),we:String(lim.weekend),mode:d.seqMode,groups:d.groups||[]};const grs=cv.groups||[];const inp="w-20 text-center rounded-lg bg-gray-800 border border-gray-700 py-1.5 text-white";
      return(<Card className="space-y-2"><p className="text-sm font-bold text-white">⚙ {fmt(t.setTitle,{s:d.store})}</p>
        <div className="flex items-center gap-2"><span className="text-sm text-gray-300 flex-1">{t.wdQ}</span><input value={cv.wd} inputMode="numeric" onChange={e=>setCf({...cv,wd:e.target.value.replace(/\D/g,'').slice(0,2)})} className={inp}/></div>
        <div className="flex items-center gap-2"><span className="text-sm text-gray-300 flex-1">{t.weQ}</span><input value={cv.we} inputMode="numeric" onChange={e=>setCf({...cv,we:e.target.value.replace(/\D/g,'').slice(0,2)})} className={inp}/></div>
        <div><p className="text-xs text-gray-400 mb-1">{t.seqModeL}</p><div className="flex gap-2"><Chip on={cv.mode==='paper'} onClick={()=>setCf({...cv,mode:'paper'})}>{t.seqPaper}</Chip><Chip on={cv.mode==='time'} onClick={()=>setCf({...cv,mode:'time'})}>{t.seqTime}</Chip></div></div>
        <div className="space-y-1.5"><p className="text-xs text-gray-400">{t.grpTitle}</p><p className="text-[11px] text-gray-500">{t.grpHint}</p>
          {grs.map((g,gi)=>(<div key={gi} className="flex items-center gap-2 text-sm text-gray-200"><span className="flex-1">{g.join('、')}</span><button onClick={()=>setCf({...cv,groups:grs.filter((_,i)=>i!==gi)})} className="text-gray-500">✕</button></div>))}
          <div className="flex flex-wrap items-center gap-1.5">{gDraft.map((c,i)=>(<span key={i} className="inline-flex items-center gap-1 rounded-full bg-violet-900 text-violet-100 text-xs px-2 py-0.5">{c}<button onClick={()=>setGDraft(gDraft.filter((_,j)=>j!==i))}>✕</button></span>))}
            <form className="inline-flex items-center gap-1.5" onSubmit={e=>{e.preventDefault();if(gCode){if(gDraft.indexOf(gCode)<0)setGDraft(gDraft.concat([gCode]));setGCode('');setGErr('');}}}>
              <input value={gCode} inputMode="numeric" enterKeyHint="done" onChange={e=>{setGCode(e.target.value.replace(/\D/g,'').slice(0,4));setGErr('');}} placeholder={t.grpPh} className="w-28 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-sm text-white"/>
              <button type="submit" className="px-2.5 py-1 rounded-lg text-xs bg-gray-700 text-white">＋</button></form>
            <button onClick={()=>{let a=gDraft.slice();if(gCode&&a.indexOf(gCode)<0)a.push(gCode);if(a.length<2){setGErr(t.grpMin);return;}setGErr('');setCf({...cv,groups:grs.concat([a])});setGDraft([]);setGCode('');}} className="px-3 py-1 rounded-lg text-xs bg-violet-700 text-white">{t.grpAdd}</button></div>
          {gErr&&<p className="text-xs text-red-400">{gErr}</p>}</div>
        <Btn loading={busy} onClick={()=>run(async()=>{const r=await api('lv2SettingsSet',{store:d.store,wd:cv.wd,we:cv.we,seqMode:cv.mode,groups:JSON.stringify(grs)});if(r&&r.ok){setMsg(t.setOk);setCf(null);reload();}else setErr((r&&r.error)||t.fail);})}>{t.setSave}</Btn></Card>);})()}
    {d.isMgr&&<Card className="space-y-2"><p className="text-sm font-bold text-white">📤 {t.promoT}</p><p className="text-xs text-gray-500">{t.promoHint}</p>
      <Btn color="bg-blue-600 text-white" onClick={async()=>{try{if(!liff.isApiAvailable('shareTargetPicker')){setErr(t.shareNo);return;}
        const r=await liff.shareTargetPicker([{type:'flex',altText:'線上預排休開放測試了',contents:buildEntryFlex()}]);if(r)setMsg(t.shared);}catch(e){setErr('錯誤:'+String(e&&e.message||e));}}}>{t.promoBtn}</Btn>
      <p className="text-xs text-gray-500 pt-1">{t.pitchHint}</p>
      <Btn color="bg-gray-700 text-white" onClick={async()=>{try{if(!liff.isApiAvailable('shareTargetPicker')){setErr(t.shareNo);return;}
        const r=await liff.shareTargetPicker([{type:'flex',altText:'📋 排休由紙本改線上提案',contents:buildPitchFlex()}]);if(r)setMsg(t.shared);}catch(e){setErr('錯誤:'+String(e&&e.message||e));}}}>{t.pitchBtn}</Btn></Card>}
  </Box>);
}
window.Leave2Routes=Leave2Routes;
})();
