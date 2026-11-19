/*BUILD leave2.js v1.0-070 編譯版 h=4b1bdc2a t=2026-11-19 11:09*/
(function () {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const C = window.S2Core;
  if (!C) {
    window.Leave2Routes = () => React.createElement('div', {
      className: 'p-6 text-center text-red-400'
    }, '載入失敗:缺少 safety2.js');
    return;
  }
  const {
    api,
    useLoad,
    Box,
    Card,
    Btn,
    Loading,
    Msg,
    NeedUser,
    barOf,
    go,
    CACHEABLE,
    WRITE_CLEAR,
    Spinner
  } = C;
  if (CACHEABLE.indexOf('lv2Month') < 0) CACHEABLE.push('lv2Month');
  ['lv2Save', 'lv2Cancel', 'lv2Decide', 'lv2Sign', 'lv2Notify', 'lv2DecideBatch', 'lv2PaperNotify', 'lv2SeqSet', 'lv2SettingsSet', 'lv2RevNotifySet', 'lv2DelegSet', 'lv2DelegDel', 'lv2LongSave', 'lv2LongEnd', 'lv2LongOccupy', 'lv2LongCancel', 'lv2LongDecide', 'lv2Claim'].forEach(x => {
    WRITE_CLEAR[x] = ['lv2Month'];
  });
  const Chip = C.Chip || (({
    on,
    children,
    onClick
  }) => React.createElement("button", {
    onClick: onClick,
    className: 'px-4 py-2 rounded-full border text-sm ' + (on ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300')
  }, children));
  const L = {
    zh: {
      title: '預排休假',
      early: '早班',
      late: '晚班',
      shift: '登記班別',
      tapHint: '點日期登記休假（目前：{s}）；點已登記的日期可取消',
      draft: '暫存',
      submit: '送出休假單',
      saved: '已暫存 {n} 天',
      sent: '已送出：{a} 天生效，{p} 天待主管簽核',
      fail: '失敗',
      st_tooEarly: '還不能暫存（最早可提前 2 個月暫存）',
      st_draft: '尚未開放送出，可先排好並暫存；{o} 起可送出，進入公司排休階段',
      st_open: '登記期間中（到 {c} 前）：送出免審批，超休需主管簽字',
      st_late: '已超過送排休期間：目前送出後需主管審批',
      st_none: '本店設定：送出即排休（免審批）',
      st_all: '本店設定：所有休假送出後需主管審批',
      st_past: '這個月已過：資料已鎖定，僅供查看',
      used: '已排',
      days: '天',
      over: '超過 {n} 天，超休需主管簽字',
      full: '當日已滿 {n} 人，需主管簽字',
      cancelAsk: '要取消這天的休假嗎？',
      submitAsk: '確定送出這些休假嗎？',
      submitOver: '其中有超休，需主管簽字後才生效。',
      fullWarn: '你申請 {d} 這幾天當天已排休超過 6 人，你的申請可能會被調整。現在調整會比之後通知調整時有更多選擇。\n是否仍要送出申請？',
      pitchHint: '向主管／公司提案用：8 頁，說明排休由紙本改線上與並行試辦方式。',
      pitchBtn: '分享「排休改線上提案」',
      promoT: '推廣預排休假',
      promoHint: '分享「線上預排休」入口卡給同事或群組:可進入預排休,或看中文／越南文／大字版介紹。「可再分享」版的卡片多一顆「分享此頁」,收到的人可以再轉傳；「不可再分享」版沒有這顆按鈕。',
      promoBtn: '分享給好友／群組',
      reshareYes: '可再分享',
      reshareNo: '不可再分享',
      shareNo: '此環境不支援分享，請在 LINE 內開啟',
      shared: '已分享',
      modeMgr: '主管模式',
      modeTeacher: '老師模式',
      seqToggleOpen: '展開 ▼',
      seqToggleClose: '收合 ▲',
      ovAsk: '超額排休，請改休',
      ovSigned: '超額排休，主管{c}已核假',
      notOpen: '未開放排休',
      slotFull: '已滿',
      slotLeft: '尚有 {n} 名額',
      legendAnon: '✦ 已有人排休　✧ 尚有名額　紫色＝我',
      grpTitle: '主管不能同時排休的組別',
      grpHint: '輸入編號按 Enter 加入，再按「加入此組」。同組的人同一天（不分早晚班）不能同時排休；一個人可在多組，例：13 175 一組、175 79 161 一組 → 175 與 13、79、161 都不能同天，13 與 79、161 無關。',
      grpPh: '編號 + Enter',
      grpAdd: '加入此組',
      grpMin: '一組至少要 2 個編號',
      paperT: '找到紙本匯入的休假',
      paperTxt: '系統有 {n} 筆編號 {c} 號、{m} 月的紙本休假（{l}）。若這是你的，請按「綁定到我的帳號」，之後就能在這裡查看與管理。',
      paperBtn: '這是我的，綁定到我的帳號',
      paperAsk: '確定把這些紙本匯入的休假綁定到你的帳號嗎？',
      paperOk: '已綁定 {n} 筆',
      rosterTitle: '總休表（依申請順序）',
      rosterHint: '每班別平日名額 {w} 人、週六日 {e} 人（可在設定調整）。白色＝名額內，橘色＝超出名額、需主管協調改假；主管排休不佔名額。已簽核保留的人，號碼下方以紅色小字標註批准主管編號。',
      mgrTag: '主管',
      leaveN: '排休 {n}人',
      adjTitle: '休假調整表',
      adjHint: '推播＝通知同仁改休其他天；若口頭確認該天確實需要休假，按「同意簽核」保留，總休表會在號碼下方以紅色小字標註批准主管編號。',
      notifyAll: '全部推播通知',
      notify: '推播通知',
      notifyAgain: '再次通知',
      sign: '同意簽核',
      unsignSure: '確定撤銷簽核？',
      adjDone: '已處理',
      adjTodo: '未處理',
      adjAll: '全部展開',
      adjNone2: '全部收合',
      seqBy: '排序',
      seqByOrder: '依順序',
      seqByCode: '依編號',
      seqSearch: '搜尋編號',
      unsign: '撤銷簽核',
      notified: '已通知 {t}',
      signedBy: '已簽核 {c}',
      pos: '第 {n} 位（超額 {k}）',
      adjNone: '沒有需要調整的人',
      notifyAsk: '要推播通知這些人改休其他天嗎？',
      signAsk: '確定同意這位同仁保留這天休假嗎？',
      overTag: '超額，待主管協調',
      seqTitle: '紙本順序編號',
      seqHint: '紙本流程初期：依櫃台收件順序填寫，總休表依此排序；沒填的排在後面（再依送出時間）。',
      seqSave: '存',
      seqMine: '我的順序編號',
      seqWait: '待櫃台填寫',
      seqDays: '{n} 天',
      setTitle: '名額與順序設定（{s}）',
      wdQ: '平日每班別名額',
      weQ: '週六日名額',
      seqModeL: '申請順序依據',
      seqPaper: '櫃台紙本編號',
      seqTime: '系統送出時間',
      setSave: '儲存設定',
      setOk: '已儲存',
      flag_admin: '休假需簽核',
      flag_all: '本店設定全部需審批',
      flag_late: '超過免審批期間',
      flag_person: '個人超過每月 6 天',
      flag_day: '當日已滿 6 人',
      ocDay: '這天已是你的長假／固定休（佔名額），不需要另外登記；要調整請洽主管或櫃台。',
      s_approved: '已生效',
      s_pending: '待簽核',
      s_draft: '暫存',
      s_rejected: '已退回',
      s_cx: '取消審核中',
      changeSubmit: '送出改假申請',
      changeSum: '本次：取消 {c} 天、新增 {n} 天',
      changeAskT: '要送出嗎？\n取消 {c} 天、新增 {n} 天。',
      changeLate: '已過登記期間，需主管審核；核准前原假仍保留。',
      changeOpen: '登記期間內，取消會立即生效。',
      cxSent: '取消：{a} 天已生效、{p} 天待主管審核',
      cxWithdrawAsk: '要撤回這筆改假／取消申請嗎？（維持原假）',
      cxHint: '要改假：先點已核准的假（標成「取消」），再點新日期（虛框），最後按送出。',
      pendChange: '改假',
      pendCancel: '取消休假',
      pendAdd: '新增',
      pendFrom: '取消',
      pendTo: '改為',
      pendingTitle: '待簽核',
      noPending: '目前沒有待簽核',
      ok: '簽字同意',
      rej: '退回',
      roster: '當日名單（* = 待簽核）',
      none: '無',
      notTeacher: '只有已登記的老師可以登記休假（主管可在下方簽核與查看名單）',
      store: '店別',
      back: '返回',
      sum: '本月已排',
      mineList: '我的休假',
      empty: '尚未登記',
      boardTitle: '長假／固定休名單',
      boardNone: '本月沒有長假或固定休安排',
      kLeave: '長假',
      kRest: '長休',
      kSchool: '課業（固定上班日）',
      pendingEnd: '未定',
      longTitle: '長假／固定休申請',
      longBtn: '＋ 申請長假／固定休／假日可休',
      longHint: '長假（例如回越南）、固定休（每週固定幾天）、固定隔日休（單／雙號）、假日可休：需事前提出，主管審核後才生效，不佔每月 6 天與每日名額。',
      kind: '類型',
      startD: '開始日期',
      endD: '結束日期',
      endOpt: '結束日期（未定可留空）',
      workDays: '上班的星期',
      reason: '原因（選填）',
      sendLong: '送出申請',
      weekly: '每週{d}上班',
      kFixed: '固定休',
      kAlt: '固定隔日休',
      kHoliday: '假日可休',
      kPart: '兼職',
      kNote: '見人再壓',
      oddD: '單號日',
      evenD: '雙號日',
      holDays: '可休的假日',
      holQuota: '每週可休天數',
      shiftL: '班別',
      forCode: '老師編號（櫃台／主管直接替老師新增，免審核）',
      needCode: '請輸入老師編號',
      blockedTxt: '你屬於「{k}」，不排休，請洽櫃台',
      ruleFixed: '每週{d}休',
      ruleHoliday: '{d}可休・每週最多 {q} 天',
      fixedTag: '固',
      holTag: '可',
      logTitle: '📜 簽核紀錄',
      logNone: '本月還沒有紀錄',
      logApprove: '核准',
      logReject: '退回',
      logCancel: '取消',
      logBy: '經手',
      logSelf: '本人',
      logDay: '休假',
      logLong: '長休／固定休',
      occTag: '佔',
      occL: '名額',
      occYes: '佔名額',
      occNo: '不佔名額',
      occHint: '佔名額：該期間每日名額會先扣掉這位；不佔：不影響其他人可休人數。',
      occPickShift: '佔名額的長假要選班別',
      staffOnly: '僅櫃台／主管可見',
      addedOk: '已新增',
      delAsk: '確定取消這筆？',
      since: '起',
      cancelLong: '取消申請',
      setEnd: '補結束日',
      setEndAsk: '輸入結束日期（YYYY-MM-DD）',
      longSent: '已送出，等主管審核',
      s_cancelled: '已取消',
      wk: ['日', '一', '二', '三', '四', '五', '六']
    },
    vi: {
      title: 'Đăng ký nghỉ trước',
      early: 'Ca sáng',
      late: 'Ca tối',
      shift: 'Chọn ca',
      tapHint: 'Chạm vào ngày để đăng ký nghỉ (hiện tại: {s}); chạm ngày đã đăng ký để hủy',
      draft: 'Lưu tạm',
      submit: 'Gửi đơn nghỉ',
      saved: 'Đã lưu tạm {n} ngày',
      sent: 'Đã gửi: {a} ngày có hiệu lực, {p} ngày chờ quản lý ký',
      fail: 'Thất bại',
      st_tooEarly: 'Chưa thể lưu tạm (tối đa trước 2 tháng)',
      st_draft: 'Chưa mở gửi đơn, có thể lưu tạm; từ {o} gửi đơn không cần duyệt',
      st_open: 'Đang trong thời gian đăng ký (đến {c}): gửi không cần duyệt, vượt mức cần quản lý ký',
      st_late: 'Đã quá thời gian không cần duyệt: gửi đơn cần quản lý duyệt',
      st_none: 'Cửa hàng cài đặt: gửi là được nghỉ ngay (không cần duyệt)',
      st_all: 'Cửa hàng cài đặt: mọi đơn nghỉ đều cần quản lý duyệt',
      st_past: 'Tháng này đã qua: dữ liệu đã khóa, chỉ để xem',
      used: 'Đã xếp',
      days: 'ngày',
      over: 'Vượt {n} ngày, cần quản lý ký',
      full: 'Ngày này đã đủ {n} người, cần quản lý ký',
      cancelAsk: 'Hủy ngày nghỉ này?',
      submitAsk: 'Xác nhận gửi các ngày nghỉ này?',
      submitOver: 'Có ngày vượt mức, cần quản lý ký mới có hiệu lực.',
      fullWarn: 'Các ngày bạn xin: {d} đã có hơn 6 người nghỉ, đơn của bạn có thể bị điều chỉnh. Điều chỉnh ngay bây giờ sẽ có nhiều lựa chọn hơn so với khi được thông báo sau.\nBạn vẫn muốn gửi đơn?',
      leaveN: '{n} người nghỉ',
      adjTitle: 'Bảng điều chỉnh nghỉ phép',
      adjHint: 'Thông báo = báo đồng nghiệp đổi sang ngày khác; nếu đã hỏi trực tiếp và thật sự cần nghỉ ngày đó, bấm "Ký đồng ý" để giữ lại, tổng bảng sẽ ghi mã quản lý phê duyệt bằng chữ đỏ nhỏ dưới số.',
      notifyAll: 'Thông báo tất cả',
      unsignSure: 'Chắc chắn hủy ký?',
      adjDone: 'Đã xử lý',
      adjTodo: 'Chưa xử lý',
      adjAll: 'Mở tất cả',
      adjNone2: 'Thu gọn tất cả',
      seqByOrder: 'Theo thứ tự',
      seqByCode: 'Theo mã',
      seqSearch: 'Tìm mã',
      notify: 'Thông báo',
      notifyAgain: 'Thông báo lại',
      sign: 'Ký đồng ý',
      unsign: 'Hủy ký',
      notified: 'Đã báo {t}',
      signedBy: 'Đã ký {c}',
      pos: 'Vị trí {n} (vượt {k})',
      adjNone: 'Không có ai cần điều chỉnh',
      notifyAsk: 'Gửi thông báo cho những người này đổi sang ngày khác?',
      signAsk: 'Đồng ý cho giữ ngày nghỉ này?',
      overTag: 'Vượt mức, chờ quản lý điều phối',
      seqTitle: 'Số thứ tự đơn giấy',
      seqHint: 'Giai đoạn đầu dùng đơn giấy: nhập theo thứ tự quầy nhận đơn, bảng tổng hợp sắp xếp theo số này; người chưa nhập xếp sau.',
      seqSave: 'Lưu',
      seqMine: 'Số thứ tự của tôi',
      seqWait: 'Chờ quầy nhập',
      seqDays: '{n} ngày',
      setTitle: 'Cài đặt hạn mức & thứ tự ({s})',
      wdQ: 'Hạn mức ngày thường mỗi ca',
      weQ: 'Hạn mức T7/CN',
      seqModeL: 'Căn cứ thứ tự đăng ký',
      seqPaper: 'Số thứ tự đơn giấy',
      seqTime: 'Thời gian gửi trên hệ thống',
      setSave: 'Lưu cài đặt',
      setOk: 'Đã lưu',
      pitchHint: 'Dùng để đề xuất với quản lý/công ty (8 trang, tiếng Trung).',
      pitchBtn: 'Chia sẻ “Đề xuất chuyển sang online”',
      promoT: 'Giới thiệu Nghỉ phép trước',
      promoHint: 'Chia sẻ thẻ lối vào “Nghỉ phép trước trực tuyến” cho đồng nghiệp hoặc nhóm: có thể vào đăng ký hoặc xem giới thiệu (tiếng Trung / tiếng Việt / chữ lớn).',
      promoBtn: 'Chia sẻ cho bạn bè/nhóm',
      reshareYes: 'cho phép chia sẻ tiếp',
      reshareNo: 'không cho chia sẻ tiếp',
      shareNo: 'Môi trường này không hỗ trợ chia sẻ, vui lòng mở trong LINE',
      shared: 'Đã chia sẻ',
      modeMgr: 'Chế độ quản lý',
      modeTeacher: 'Chế độ Sư phụ',
      seqToggleOpen: 'Mở ▼',
      seqToggleClose: 'Thu gọn ▲',
      ovAsk: 'Vượt hạn mức, vui lòng đổi ngày',
      ovSigned: 'Vượt hạn mức, QL {c} đã duyệt',
      notOpen: 'Không mở đăng ký',
      slotFull: 'Đã đủ',
      slotLeft: 'Còn {n} chỗ',
      legendAnon: '✦ đã có người nghỉ  ✧ còn chỗ  tím = tôi',
      grpTitle: 'Nhóm quản lý không được nghỉ cùng ngày',
      grpHint: 'Nhập mã rồi Enter, sau đó bấm "Thêm nhóm".',
      grpPh: 'Mã + Enter',
      grpAdd: 'Thêm nhóm',
      grpMin: 'Mỗi nhóm cần ít nhất 2 mã',
      paperT: 'Tìm thấy ngày nghỉ nhập từ bản giấy',
      paperTxt: 'Có {n} ngày nghỉ bản giấy của số {c}, tháng {m} ({l}). Nếu là của bạn, bấm "Liên kết".',
      paperBtn: 'Của tôi, liên kết vào tài khoản',
      paperAsk: 'Liên kết các ngày nghỉ này vào tài khoản của bạn?',
      paperOk: 'Đã liên kết {n} ngày',
      rosterTitle: 'Bảng nghỉ tổng hợp (theo thứ tự đăng ký)',
      rosterHint: 'Hạn mức mỗi ca: ngày thường {w} người, T7/CN {e} người (có thể chỉnh trong cài đặt). Màu trắng = trong hạn mức, màu cam = vượt, cần quản lý điều phối; nghỉ của quản lý không tính hạn mức. Người đã được ký giữ lại có mã quản lý chữ đỏ nhỏ dưới số.',
      mgrTag: 'QL',
      flag_admin: 'Cần ký duyệt',
      flag_all: 'Cửa hàng yêu cầu duyệt tất cả',
      flag_late: 'Quá thời gian không cần duyệt',
      flag_person: 'Vượt 6 ngày/tháng',
      flag_day: 'Ngày đã đủ 6 người',
      ocDay: 'Ngày này đã là kỳ nghỉ dài/nghỉ cố định của bạn (chiếm suất), không cần đăng ký thêm; cần đổi vui lòng liên hệ quản lý hoặc quầy.',
      s_approved: 'Có hiệu lực',
      s_pending: 'Chờ ký',
      s_draft: 'Lưu tạm',
      s_rejected: 'Bị từ chối',
      s_cx: 'Đang chờ duyệt hủy',
      changeSubmit: 'Gửi đơn đổi ngày nghỉ',
      changeSum: 'Lần này: hủy {c} ngày, thêm {n} ngày',
      changeAskT: 'Xác nhận gửi?\nHủy {c} ngày, thêm {n} ngày.',
      changeLate: 'Đã quá thời gian đăng ký, cần quản lý duyệt; trước khi duyệt vẫn giữ ngày nghỉ cũ.',
      changeOpen: 'Trong thời gian đăng ký, hủy có hiệu lực ngay.',
      cxSent: 'Hủy: {a} ngày có hiệu lực, {p} ngày chờ quản lý duyệt',
      cxWithdrawAsk: 'Rút lại đơn đổi/hủy ngày nghỉ này? (giữ ngày nghỉ cũ)',
      cxHint: 'Đổi ngày: chạm ngày nghỉ đã duyệt (đánh dấu hủy), chạm ngày mới (nét đứt), rồi bấm gửi.',
      pendChange: 'Đổi ngày',
      pendCancel: 'Hủy nghỉ',
      pendAdd: 'Thêm',
      pendFrom: 'Hủy',
      pendTo: 'Đổi thành',
      pendingTitle: 'Chờ ký',
      noPending: 'Không có đơn chờ ký',
      ok: 'Ký đồng ý',
      rej: 'Từ chối',
      roster: 'Danh sách trong ngày (* = chờ ký)',
      none: 'Không có',
      notTeacher: 'Chỉ Sư phụ đã đăng ký mới được đăng ký nghỉ (quản lý có thể ký duyệt và xem danh sách bên dưới)',
      store: 'Chi nhánh',
      back: 'Quay lại',
      sum: 'Đã xếp tháng này',
      mineList: 'Ngày nghỉ của tôi',
      empty: 'Chưa đăng ký',
      boardTitle: 'Bảng nghỉ dài hạn / đi học',
      boardNone: 'Tháng này không có nghỉ dài hạn hoặc lịch đi học',
      kLeave: 'Nghỉ dài hạn',
      kRest: 'Nghỉ dài (chưa có ngày về)',
      kSchool: 'Đi học (ngày làm cố định)',
      pendingEnd: 'chưa định',
      longTitle: 'Xin nghỉ dài hạn / ngày làm cố định',
      longBtn: '+ Xin nghỉ dài hạn / ngày làm cố định',
      longHint: 'Nghỉ dài hạn (ví dụ về Việt Nam) hoặc chỉ đi làm vài ngày cố định vì đi học: cần xin trước, quản lý duyệt mới có hiệu lực, không tính vào 6 ngày/tháng và 6 người/ngày.',
      kind: 'Loại',
      startD: 'Ngày bắt đầu',
      endD: 'Ngày kết thúc',
      endOpt: 'Ngày kết thúc (chưa định thì để trống)',
      workDays: 'Các thứ đi làm',
      reason: 'Lý do (không bắt buộc)',
      sendLong: 'Gửi đơn',
      weekly: 'Đi làm mỗi {d}',
      kFixed: 'Nghỉ cố định',
      kAlt: 'Nghỉ cách ngày',
      kHoliday: 'Nghỉ cuối tuần',
      kPart: 'Bán thời gian',
      kNote: 'Gặp rồi tính',
      oddD: 'Ngày lẻ',
      evenD: 'Ngày chẵn',
      holDays: 'Ngày cuối tuần được nghỉ',
      holQuota: 'Số ngày/tuần',
      shiftL: 'Ca',
      forCode: 'Mã Sư phụ (quầy/quản lý thêm trực tiếp)',
      needCode: 'Nhập mã Sư phụ',
      blockedTxt: 'Bạn thuộc "{k}", không đăng ký nghỉ, liên hệ quầy',
      ruleFixed: 'Nghỉ mỗi {d}',
      ruleHoliday: '{d} được nghỉ, tối đa {q} ngày/tuần',
      fixedTag: 'CĐ',
      holTag: 'Được',
      logTitle: '📜 Nhật ký duyệt',
      logNone: 'Tháng này chưa có',
      logApprove: 'Duyệt',
      logReject: 'Từ chối',
      logCancel: 'Hủy',
      logBy: 'Bởi',
      logSelf: 'Tự hủy',
      logDay: 'Nghỉ',
      logLong: 'Nghỉ dài/cố định',
      occTag: 'Chiếm',
      occL: 'Suất',
      occYes: 'Chiếm suất',
      occNo: 'Không chiếm suất',
      occHint: 'Chiếm suất: trừ suất nghỉ mỗi ngày trong thời gian này; không chiếm: không ảnh hưởng số người được nghỉ.',
      occPickShift: 'Nghỉ dài hạn chiếm suất cần chọn ca',
      staffOnly: 'Chỉ quầy/quản lý thấy',
      addedOk: 'Đã thêm',
      delAsk: 'Hủy mục này?',
      since: 'từ',
      cancelLong: 'Hủy đơn',
      setEnd: 'Bổ sung ngày kết thúc',
      setEndAsk: 'Nhập ngày kết thúc (YYYY-MM-DD)',
      longSent: 'Đã gửi, chờ quản lý duyệt',
      s_cancelled: 'Đã hủy',
      wk: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    }
  };
  const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_m, k) => o && o[k] !== undefined ? o[k] : '');
  const p2 = n => String(n).padStart(2, '0');
  const addMonth = (m, n) => {
    const y = parseInt(m.slice(0, 4), 10),
      mo = parseInt(m.slice(5, 7), 10) - 1 + n;
    return y + Math.floor(mo / 12) + '-' + p2((mo % 12 + 12) % 12 + 1);
  };
  const todayStr = () => {
    const d = new Date(Date.now() + 8 * 3600e3);
    return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate());
  };
  const SH_COLOR = {
    early: 'bg-amber-500',
    late: 'bg-indigo-500'
  };
  const LV2_PROMO = [["🏖️", "#6D5DFC", "#46C2CB", "預排休假上線了", "Lịch nghỉ phép trước đã có", "不用再排隊寫紙本,用手機就能排下個月的休假,誰排了、還剩幾個名額,一目了然。", "Không cần xếp hàng viết giấy nữa, dùng điện thoại là đăng ký được ngày nghỉ tháng sau, ai đã đăng ký và còn mấy suất đều thấy rõ.", ["", ""]], ["📝", "#E8A33D", "#E0674B", "上線階段 1:測試階段", "Giai đoạn 1: Chạy thử", "仍請依公司規定寫休假小白單,於指定時間送櫃台;主管再依小白單順序,排定老師線上申請的順序。", "Vẫn viết phiếu nghỉ nhỏ màu trắng theo quy định công ty và nộp cho quầy vào thời gian chỉ định; quản lý sẽ sắp thứ tự đăng ký trực tuyến của nhân viên theo thứ tự phiếu.", ["・小白單照常填寫、照常送櫃台\n・線上申請的順序,由主管依小白單順序排定\n・這段期間,可以先熟悉線上操作", "・Phiếu nhỏ vẫn viết và nộp cho quầy như bình thường\n・Thứ tự đăng ký trực tuyến do quản lý sắp xếp theo thứ tự phiếu\n・Trong thời gian này, bạn có thể làm quen với thao tác trực tuyến"]], ["🚀", "#E0674B", "#C2417A", "上線階段 2:正式上線", "Giai đoạn 2: Chính thức", "改由線上進行預排休申請。", "Đăng ký nghỉ phép trước hoàn toàn trực tuyến.", ["・不再需要寫小白單、送櫃台\n・每月 10 日 00:00 開放送出,12 日 24:00 前送出\n・誰排了、還剩幾個名額,在系統上一目了然", "・Không cần viết phiếu nhỏ và nộp cho quầy nữa\n・Mở gửi từ 00:00 ngày 10 hàng tháng, gửi trước 24:00 ngày 12\n・Ai đã đăng ký, còn mấy suất, đều xem được trên hệ thống"]], ["📅", "#F6A04D", "#F0627A", "點月曆,一下就排", "Chạm vào lịch là đăng ký xong", "選早班或晚班,點日期就登記,再點一次取消。可先「暫存」慢慢調整,確定了再「送出」。", "Chọn ca sáng hoặc ca tối, chạm vào ngày là đăng ký, chạm lại để hủy. Có thể “Lưu nháp” để chỉnh dần, chắc chắn rồi mới “Gửi”.", ["每人每月可休 6 天", "Mỗi người, mỗi tháng được nghỉ 6 ngày"]], ["⏰", "#3CB7A0", "#3B82C4", "什麼時候排?", "Khi nào đăng ký?", "休假月份的前一個月 10 日開放送出,到 12 日 24:00 前送出,進入預排休假流程;更早也能先暫存。", "Từ ngày 10 của tháng trước tháng nghỉ là bắt đầu gửi được, gửi trước 24:00 ngày 12 sẽ vào quy trình đăng ký nghỉ trước; có thể lưu nháp sớm hơn.", ["例:11 月休假 → 10/10 開放,10/12 24:00 前送出,進入預排休假流程", "Ví dụ: nghỉ tháng 11 → mở 10/10, gửi trước 24:00 ngày 12/10 để vào quy trình"]], ["👥", "#B469E0", "#6D7BF0", "名額一看就懂", "Nhìn là biết còn suất", "日曆小字顯示每日可休剩餘名額。老師只看到自己的編號與空位,不會看到別人。", "Số nhỏ trên lịch là số suất nghỉ còn lại của mỗi ngày. Bạn chỉ thấy số của mình và chỗ trống, không thấy của người khác.", ["✦ 已有人休　✧ 還有空位", "✦ đã có người nghỉ　✧ còn chỗ"]], ["🔢", "#4B8DE0", "#5A6BD8", "依申請順序,公平處理", "Xử lý công bằng theo thứ tự đăng ký", "名額依申請順序排。若超過名額,會標示「超額排休」,請改休或由主管協調核假。", "Suất được xếp theo thứ tự đăng ký. Nếu vượt suất sẽ ghi “Vượt hạn mức”, vui lòng đổi ngày hoặc nhờ quản lý duyệt.", ["超額排休,請改休 / 主管已核假", "Vượt hạn mức, vui lòng đổi ngày / Quản lý đã duyệt"]], ["📌", "#2F9E6F", "#1F7A8C", "長假、固定休也能申請", "Nghỉ dài hạn, nghỉ cố định cũng đăng ký được", "因回國、課業實習,可申請長假或固定休,送出後由主管核准,列在總休表最下方。", "Khi về nước, học hoặc thực tập, có thể đăng ký nghỉ dài hạn hoặc nghỉ cố định — gửi xong chờ quản lý duyệt, hiển thị cuối bảng tổng.", ["現在就打開「休假」試試看", "Hãy mở “Nghỉ phép” và thử ngay"]]];
  function buildPromoFlex() {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const n = LV2_PROMO.length;
    return {
      type: 'carousel',
      contents: LV2_PROMO.map((p, i) => {
        const body = [{
          type: 'text',
          text: p[5],
          size: 'md',
          color: '#333333',
          wrap: true
        }, {
          type: 'text',
          text: p[6],
          size: 'sm',
          color: '#777777',
          wrap: true,
          margin: 'sm'
        }, {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          backgroundColor: '#E8F7EE',
          cornerRadius: '8px',
          paddingAll: '8px',
          contents: [{
            type: 'text',
            text: p[7][0] + '\n' + p[7][1],
            size: 'sm',
            color: '#06803A',
            wrap: true
          }]
        }];
        if (!p[7][0]) body.pop();
        const b = {
          type: 'bubble',
          size: 'mega',
          hero: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '18px',
            paddingTop: '34px',
            justifyContent: 'center',
            alignItems: 'center',
            background: {
              type: 'linearGradient',
              angle: '135deg',
              startColor: p[1],
              endColor: p[2]
            },
            contents: [{
              type: 'text',
              text: p[0],
              size: '4xl',
              align: 'center'
            }, {
              type: 'text',
              text: p[3],
              weight: 'bold',
              size: 'xl',
              color: '#FFFFFF',
              align: 'center',
              wrap: true,
              margin: 'md'
            }, {
              type: 'text',
              text: p[4],
              size: 'xs',
              color: '#FFFFFFCC',
              align: 'center',
              wrap: true,
              margin: 'xs'
            }, {
              type: 'box',
              layout: 'vertical',
              position: 'absolute',
              offsetTop: '10px',
              offsetEnd: '12px',
              backgroundColor: '#00000040',
              cornerRadius: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingStart: '9px',
              paddingEnd: '9px',
              contents: [{
                type: 'text',
                text: i + 1 + '/' + n,
                size: 'xs',
                color: '#FFFFFF'
              }]
            }]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '18px',
            contents: body
          }
        };
        if (i === n - 1) b.footer = {
          type: 'box',
          layout: 'vertical',
          paddingAll: 'lg',
          contents: [{
            type: 'button',
            style: 'primary',
            color: '#6d4aa8',
            height: 'sm',
            action: {
              type: 'uri',
              label: '開啟預排休假 / Mở Nghỉ phép',
              uri: base + '?lv2=l'
            }
          }]
        };
        return b;
      })
    };
  }
  const LV2_PITCH = [["📝", "#4B5563", "#6B7280", "現況:紙本排休的痛點", "每月一張紙,人工抄寫、核對、統計。", "· 同一天誰排了、滿了沒,要翻紙才知道\n· 超過名額要人工數、人工通知改休\n· 主管不能同時休,靠記憶或事後發現\n· 字跡、塗改、補章難辨識,月底還要重抄成總表"], ["📱", "#6D5DFC", "#46C2CB", "提案:排休改線上", "手機直接排,系統自動算。", "員工用 LINE 開啟預排休假,在月曆點選早/晚班;名額、順序、超額由系統即時計算,主管在手機上簽核。"], ["⚙️", "#3CB7A0", "#3B82C4", "線上做到的事", "把紙本上人工做的事自動化。", "· 依申請順序排名額,超額自動標示\n· 主管互斥組別(如 79/161)送出時自動擋下\n· 可新增設定長假、固定休、每週休一天假日等特殊規則\n· 一鍵產生 A4 總休表 PDF,可列印張貼"], ["⚖️", "#B469E0", "#6D7BF0", "公平與透明", "每個人看到的資訊剛好夠用。", "· 老師只看到自己的編號與空位,不會看到別人排誰\n· 超額會明確標示「請改休」或「主管已核假」\n· 每筆申請、簽核留有紀錄,事後可查\n· 提供主管與櫃台完整的休假總表"], ["⏰", "#F6A04D", "#F0627A", "排休流程", "先預填,到期再送出。", "· 老師可先在線上預填後 2 個月的休假日,但無法送出\n· 每月 10 日 00:00 ~ 12 日 23:59 開放送出,進入預排休階段\n· 已申請並核准的固定休排在最前面,不佔 6 位名額\n· 老師查看總休表時,只看到當天剩餘可休名額,可提前選擇可休日期,減少主管事後因超休再協調的工作"], ["🤝", "#3CB7A0", "#3B82C4", "導入方式:紙本與線上並行", "初期不取消紙本,風險最低。", "第 1 階段:紙本照舊,線上同步上線。以紙本為準,主櫃只要把紙本上的順序編號填進系統;老師可在「我的」自行綁定已有的資料。\n第 2 階段:老師習慣後,以線上為主、紙本當備查。\n第 3 階段:全面線上,不再收紙本。"], ["🗓️", "#4B8DE0", "#5A6BD8", "試辦時程", "先看介面,再小範圍試辦。", "· 11 月:先把 11 月紙本資料導入系統,大家先看看介面與資料是否正確\n· 12 月:正式試辦,紙本與線上並行\n· 老師不熟手機操作時,可遞紙本,由主管/櫃台代老師新增排休\n· 試辦期間資料皆有保留,隨時可回到紙本作業"], ["✅", "#2F9E6F", "#1F7A8C", "需要公司支持的事", "請同意試辦,並指定教學窗口。", "1. 同意 12 月起「紙本＋線上」並行試辦\n2. 公告通知同仁\n3. 責成實習副理負責教學老師使用\n4. 技術與系統介面調整,由我提供協助\n5. 試辦後檢討,再決定是否全面線上"]];
  function buildPitchFlex() {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const n = LV2_PITCH.length;
    return {
      type: 'carousel',
      contents: LV2_PITCH.map((p, i) => {
        const b = {
          type: 'bubble',
          size: 'mega',
          hero: {
            type: 'box',
            layout: 'vertical',
            height: '110px',
            justifyContent: 'center',
            alignItems: 'center',
            background: {
              type: 'linearGradient',
              angle: '135deg',
              startColor: p[1],
              endColor: p[2]
            },
            contents: [{
              type: 'text',
              text: p[0],
              size: '4xl',
              align: 'center'
            }, {
              type: 'box',
              layout: 'vertical',
              position: 'absolute',
              offsetTop: '10px',
              offsetEnd: '12px',
              backgroundColor: '#00000040',
              cornerRadius: '10px',
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingStart: '9px',
              paddingEnd: '9px',
              contents: [{
                type: 'text',
                text: i + 1 + '/' + n,
                size: 'xs',
                color: '#FFFFFF'
              }]
            }]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '18px',
            contents: [{
              type: 'text',
              text: p[3],
              weight: 'bold',
              size: 'lg',
              color: '#111111',
              wrap: true
            }, {
              type: 'text',
              text: p[4],
              size: 'xs',
              color: '#888888',
              wrap: true,
              margin: 'xs'
            }, {
              type: 'text',
              text: p[5],
              size: 'sm',
              color: '#333333',
              wrap: true,
              margin: 'lg'
            }]
          }
        };
        return b;
      })
    };
  }
  const periodText = (x, t) => x.start.slice(5).replace('-', '/') + ' ~ ' + (x.end ? x.end.slice(5).replace('-', '/') : t.pendingEnd);
  const KIND_KEY = {
    leave: 'kLeave',
    rest: 'kRest',
    fixed: 'kFixed',
    alt: 'kAlt',
    holiday: 'kHoliday',
    part: 'kPart',
    note: 'kNote',
    school: 'kSchool'
  };
  const kindName = (k, t) => String(t[KIND_KEY[k]] || k).split('（')[0].split(' (')[0];
  const KIND_CLS = {
    leave: 'bg-rose-600',
    rest: 'bg-orange-600',
    fixed: 'bg-sky-700',
    alt: 'bg-sky-700',
    holiday: 'bg-emerald-700',
    part: 'bg-gray-600',
    note: 'bg-gray-600',
    school: 'bg-teal-600'
  };
  const wkNames = (days, t) => String(days || '').split(',').filter(Boolean).map(i => t.wk[parseInt(i, 10)]).join(lang0(t) ? ' ' : '');
  const KIND_ORD = {
    leave: 0,
    rest: 1,
    fixed: 2,
    alt: 3,
    holiday: 4,
    part: 5,
    note: 6,
    school: 7
  };
  const byCode = (a, b) => {
    const x = parseInt(a.code, 10),
      y = parseInt(b.code, 10);
    return (isNaN(x) ? 1e9 : x) - (isNaN(y) ? 1e9 : y) || String(a.code).localeCompare(String(b.code));
  };
  const sortBoard = arr => (arr || []).slice().sort((a, b) => (KIND_ORD[a.kind] === undefined ? 9 : KIND_ORD[a.kind]) - (KIND_ORD[b.kind] === undefined ? 9 : KIND_ORD[b.kind]) || byCode(a, b));
  const longText = (x, t) => {
    const sh = x.shift ? x.shift === 'early' ? '（' + t.early + '）' : '（' + t.late + '）' : '';
    if (x.kind === 'leave') return t.kLeave;
    if (x.kind === 'rest') return t.kRest;
    if (x.kind === 'fixed') return fmt(t.ruleFixed, {
      d: wkNames(x.days, t)
    }) + sh;
    if (x.kind === 'alt') return (x.days === 'odd' ? t.oddD : t.evenD) + (lang0(t) ? '休' : '') + sh;
    if (x.kind === 'holiday') return fmt(t.ruleHoliday, {
      d: wkNames(x.days, t),
      q: x.quota || String(x.days || '').split(',').length
    }) + sh;
    if (x.kind === 'part' || x.kind === 'note') return kindName(x.kind, t);
    return fmt(t.weekly, {
      d: wkNames(x.days, t)
    });
  };
  const lang0 = t => t.wk[0] === 'CN';
  const LV2_ENTRY_INTRO = [['預排休介紹(中文)', 'zh'], ['Giới thiệu nghỉ phép', 'vi'], ['預排休介紹(大字)', 'big']];
  function buildEntryFlex(reshare) {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const bt = (label, uri) => ({
      type: 'button',
      style: 'secondary',
      height: 'sm',
      action: {
        type: 'uri',
        label: label,
        uri: uri
      }
    });
    return {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '18px',
        paddingTop: '34px',
        paddingBottom: '30px',
        alignItems: 'center',
        background: {
          type: 'linearGradient',
          angle: '135deg',
          startColor: '#6D5DFC',
          endColor: '#46C2CB'
        },
        contents: [{
          type: 'text',
          text: '🏖️',
          size: '4xl',
          align: 'center'
        }, {
          type: 'text',
          text: '線上預排休\n開放測試了',
          weight: 'bold',
          size: 'xl',
          color: '#FFFFFF',
          align: 'center',
          wrap: true,
          margin: 'md'
        }]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [{
          type: 'button',
          style: 'primary',
          color: '#6d4aa8',
          height: 'sm',
          action: {
            type: 'uri',
            label: '進入預排休',
            uri: base + '?lv2=l&src=entry'
          }
        }].concat(LV2_ENTRY_INTRO.map(x => bt(x[0], base + '?lv2=intro&v=' + x[1]))).concat(reshare ? [bt('分享此頁', base + '?lv2=share')] : [])
      }
    };
  }
  function IntroPage() {
    const q = new URLSearchParams(location.search);
    const [v, setV] = useState(['zh', 'vi', 'big'].indexOf(q.get('v')) >= 0 ? q.get('v') : 'zh');
    const vi = v === 'vi',
      big = v === 'big';
    const fs = big ? 38 : 16,
      tfs = big ? 38 : 22,
      tipfs = big ? 36 : 14;
    const go2 = () => {
      location.href = '?lv2=l';
    };
    return React.createElement(Box, null, React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, [['zh', '中文'], ['vi', 'Tiếng Việt'], ['big', '大字']].map(x => React.createElement("button", {
      key: x[0],
      className: 'px-4 py-1 rounded-full text-sm ' + (v === x[0] ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-200'),
      onClick: () => setV(x[0])
    }, x[1]))), LV2_PROMO.map((p, i) => {
      const title = vi ? p[4] : p[3],
        body = vi ? p[6] : p[5],
        tip = vi ? p[7][1] : p[7][0];
      return React.createElement("div", {
        key: i,
        className: "rounded-2xl overflow-hidden bg-white text-gray-800 shadow"
      }, React.createElement("div", {
        style: {
          background: 'linear-gradient(135deg,' + p[1] + ',' + p[2] + ')',
          padding: '34px 18px 18px',
          textAlign: 'center',
          position: 'relative'
        }
      }, React.createElement("div", {
        style: {
          fontSize: 40
        }
      }, p[0]), React.createElement("div", {
        style: {
          color: '#fff',
          fontWeight: 700,
          fontSize: tfs,
          marginTop: 8,
          whiteSpace: 'pre-line'
        }
      }, title), React.createElement("span", {
        style: {
          position: 'absolute',
          top: 10,
          right: 12,
          background: '#0004',
          color: '#fff',
          fontSize: 12,
          borderRadius: 10,
          padding: '2px 9px'
        }
      }, i + 1, "/", LV2_PROMO.length)), React.createElement("div", {
        style: {
          padding: 18
        }
      }, React.createElement("div", {
        style: {
          fontSize: fs,
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
          color: '#333'
        }
      }, body), tip && React.createElement("div", {
        style: {
          marginTop: 16,
          background: '#E8F7EE',
          color: '#06803A',
          fontSize: tipfs,
          borderRadius: 8,
          padding: 8,
          lineHeight: 1.5,
          whiteSpace: 'pre-line'
        }
      }, tip), i === LV2_PROMO.length - 1 && React.createElement("button", {
        className: "w-full mt-4 py-3 rounded-lg bg-violet-700 text-white font-bold",
        onClick: go2
      }, vi ? 'Mở Nghỉ phép' : '開啟預排休假')));
    }));
  }
  function SharePage() {
    const [res, setRes] = useState('');
    const go2 = async () => {
      try {
        if (!liff.isApiAvailable('shareTargetPicker')) {
          setRes('此環境不支援分享,請在 LINE 內開啟');
          return;
        }
        const r = await liff.shareTargetPicker([{
          type: 'flex',
          altText: '線上預排休開放測試了',
          contents: buildEntryFlex(true)
        }]);
        setRes(r ? '已分享 ✅' : '已取消');
      } catch (e) {
        setRes('錯誤:' + String(e && e.message || e));
      }
    };
    return React.createElement(Box, null, React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "📤 分享「線上預排休」入口"), React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "好友收到的卡片可進入預排休,或看中文／越南文／大字版介紹。"), React.createElement(Btn, {
      onClick: go2
    }, "選擇好友分享"), res && React.createElement("p", {
      className: "text-center text-sm text-gray-400"
    }, res)));
  }
  function StatsPage() {
    const cur = todayStr().slice(0, 7);
    const [month, setMonth] = useState(addMonth(cur, 1));
    const [store, setStore] = useState('');
    const [st, reload] = useLoad('lv2Stats', store ? {
      month: month,
      store: store
    } : {
      month: month
    });
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    const Tag = ({
      k
    }) => React.createElement("span", {
      className: 'text-[11px] rounded px-1.5 py-0.5 mr-1.5 text-white ' + (k === 'early' ? 'bg-amber-600' : k === 'late' ? 'bg-indigo-600' : 'bg-gray-500')
    }, k === 'early' ? '早班' : k === 'late' ? '晚班' : '未填班別');
    const Big = ({
      n,
      l,
      c
    }) => React.createElement("div", {
      className: "flex-1 bg-gray-800 rounded-xl p-2 text-center"
    }, React.createElement("div", {
      className: 'text-2xl font-bold ' + (c || 'text-white')
    }, n), React.createElement("div", {
      className: "text-[11px] text-gray-400"
    }, l));
    const Codes = ({
      a,
      fmt
    }) => React.createElement("p", {
      className: "text-[15px] leading-8 text-gray-200 break-words"
    }, a.length ? a.map((x, i) => React.createElement("span", {
      key: i,
      className: "mr-2"
    }, fmt ? fmt(x) : x)) : React.createElement("span", {
      className: "text-gray-500"
    }, "—"));
    const clk = x => x.c + (x.n > 1 ? '×' + x.n : '');
    const dr = x => React.createElement(React.Fragment, null, x.c, React.createElement("span", {
      className: "text-[11px] text-gray-400"
    }, "(", x.d, "天)"));
    const G = ({
      by,
      fmt,
      lab
    }) => ['early', 'late', 'unk'].map(k => by[k] && by[k].length > 0 ? React.createElement("div", {
      key: k,
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, React.createElement(Tag, {
      k: k
    }), lab ? lab(by[k].length) : by[k].length + ' 人'), React.createElement(Codes, {
      a: by[k],
      fmt: fmt
    })) : null);
    return React.createElement(Box, null, d.stores && d.stores.length > 0 && React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, d.stores.map(x => React.createElement(Chip, {
      key: x,
      on: d.store === x,
      onClick: () => setStore(x)
    }, x))), React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, [addMonth(cur, -1), cur, addMonth(cur, 1), addMonth(cur, 2)].map(x => React.createElement(Chip, {
      key: x,
      on: month === x,
      onClick: () => setMonth(x)
    }, parseInt(x.slice(5), 10), "月"))), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "👥 ", d.month, " 總休表名單（分母）"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "該月總休表上列出的人員（不含主管）"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Big, {
      n: d.denom.n,
      l: "名單人數"
    }), React.createElement(Big, {
      n: d.denom.early,
      l: "早班"
    }), React.createElement(Big, {
      n: d.denom.late,
      l: "晚班"
    })), d.denom.unk > 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "另有 ", d.denom.unk, " 人無法判斷班別")), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "🪪 註冊情形"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Big, {
      n: d.reg.reg,
      l: "已註冊"
    }), React.createElement(Big, {
      n: d.reg.pend,
      l: "審核中"
    }), React.createElement(Big, {
      n: d.reg.none,
      l: "未註冊",
      c: "text-red-400"
    })), React.createElement(G, {
      by: d.reg.noneBy,
      lab: n => '未註冊 ' + n + ' 人'
    }), d.reg.pendBy.length > 0 && React.createElement("div", {
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, React.createElement("span", {
      className: "text-[11px] rounded px-1.5 py-0.5 mr-1.5 bg-sky-700 text-white"
    }, "審核中"), d.reg.pendBy.length, " 人"), React.createElement(Codes, {
      a: d.reg.pendBy
    })), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "註冊率 ", d.reg.reg, "/", d.denom.n, "（", d.reg.rate, "%）")), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "🚪 預排休入口 點擊"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "點入口卡「進入預排休」按鈕進入（上線後才開始記錄）"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Big, {
      n: d.entry.total,
      l: "累計人次"
    }), React.createElement(Big, {
      n: d.entry.people,
      l: "人數"
    }), React.createElement(Big, {
      n: d.entry.today,
      l: "今日人次"
    })), React.createElement(G, {
      by: d.entry.by,
      fmt: clk,
      lab: n => '已點 ' + n + ' 人'
    }), d.entry.outside.length > 0 && React.createElement("div", {
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, React.createElement("span", {
      className: "text-[11px] rounded px-1.5 py-0.5 mr-1.5 bg-gray-600 text-white"
    }, "不在名單"), d.entry.outside.length, " 人"), React.createElement(Codes, {
      a: d.entry.outside,
      fmt: clk
    })), React.createElement("div", {
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-amber-300"
    }, "名單內未點 ", ['early', 'late', 'unk'].reduce((a, k) => a + d.entry.notClicked[k].length, 0), " 人"), ['early', 'late', 'unk'].map(k => d.entry.notClicked[k].length > 0 && React.createElement("div", {
      key: k
    }, React.createElement("p", {
      className: "text-xs text-gray-400 mt-1"
    }, React.createElement(Tag, {
      k: k
    })), React.createElement(Codes, {
      a: d.entry.notClicked[k]
    }))))), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "📝 ", d.month, " 已暫存預排休"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "暫存＝尚未送出；已線上送出的不算暫存"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Big, {
      n: d.draft.n,
      l: "已暫存"
    }), React.createElement(Big, {
      n: d.draft.sent,
      l: "已線上送出"
    }), React.createElement(Big, {
      n: d.draft.unfilled,
      l: "未填",
      c: "text-amber-300"
    })), ['early', 'late', 'unk'].map(k => d.draft.by[k].length > 0 && React.createElement("div", {
      key: k,
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, React.createElement(Tag, {
      k: k
    }), "已暫存 ", d.draft.cnt[k], " / ", d.draft.tot[k]), React.createElement(Codes, {
      a: d.draft.by[k],
      fmt: dr
    }))), d.draft.outside.length > 0 && React.createElement("div", {
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, React.createElement("span", {
      className: "text-[11px] rounded px-1.5 py-0.5 mr-1.5 bg-gray-600 text-white"
    }, "名單外暫存"), d.draft.outside.length, " 人"), React.createElement(Codes, {
      a: d.draft.outside,
      fmt: dr
    })), React.createElement("div", {
      className: "mt-2"
    }, React.createElement("p", {
      className: "text-sm text-amber-300"
    }, "未填 ", d.draft.unfilled, " 人"), ['early', 'late', 'unk'].map(k => d.draft.notFilled[k].length > 0 && React.createElement("div", {
      key: k
    }, React.createElement("p", {
      className: "text-xs text-gray-400 mt-1"
    }, React.createElement(Tag, {
      k: k
    })), React.createElement(Codes, {
      a: d.draft.notFilled[k]
    }))), React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, "未填＝名單內，但沒有暫存或線上送出任何該月休假（紙本匯入的不算）"))), React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: reload
    }, "🔄 重新整理"));
  }
  function Leave2Routes() {
    const q = new URLSearchParams(location.search);
    if (q.get('lv2') === 'stats') return React.createElement(NeedUser, {
      render: () => React.createElement(StatsPage, null)
    });
    if (q.get('lv2') === 'intro') return React.createElement(IntroPage, null);
    if (q.get('lv2') === 'share') return React.createElement(SharePage, null);
    if (q.get('lv2') === 'pdf') return React.createElement(NeedUser, {
      render: me => React.createElement(PdfPage, {
        me: me
      })
    });
    return React.createElement(NeedUser, {
      render: me => React.createElement(LeavePage, {
        me: me
      })
    });
  }
  const PDF_W = 794,
    PDF_H = 1123;
  const loadScript = src => new Promise((res, rej) => {
    if (document.querySelector('script[src="' + src + '"]')) return res();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error('load ' + src));
    document.head.appendChild(s);
  });
  const mdShort = d => String(d).slice(5).replace('-', '/').replace(/\/0/, '/').replace(/^0/, '');
  const leftTag = (left, c, vi) => {
    const d = left && left[String(c).trim()];
    return d ? mdShort(d) + (vi ? ' nghỉ' : '離') : '';
  };
  function PdfCell({
    x,
    left
  }) {
    return React.createElement("td", {
      style: {
        border: '1px solid #999',
        padding: 0,
        height: 26,
        textAlign: 'center',
        verticalAlign: 'top',
        whiteSpace: 'nowrap',
        overflow: 'visible'
      }
    }, x ? React.createElement("div", {
      style: {
        position: 'relative',
        top: -2
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        lineHeight: '13px',
        height: 13,
        textDecoration: x.o ? 'underline' : 'none',
        fontWeight: x.o ? 700 : 400,
        color: x.lf ? '#888' : (x.f || x.h) && !x.o ? '#1a6fb5' : '#000'
      }
    }, x.c, x.p ? '*' : ''), React.createElement("div", {
      style: {
        fontSize: 8,
        lineHeight: '11px',
        height: 11,
        color: '#d00',
        fontWeight: 400
      }
    }, (() => {
      const lt = leftTag(left, x.c);
      const ft = x.f ? '固' : x.h ? '可' : '';
      return x.s || lt || ft ? React.createElement(React.Fragment, null, ft && React.createElement("span", {
        style: {
          color: '#1a6fb5'
        }
      }, ft), ft && (x.s || lt) ? ' ' : '', x.s, x.s && lt ? ' ' : '', lt && React.createElement("span", {
        style: {
          color: '#555'
        }
      }, lt)) : '\u00a0';
    })())) : null);
  }
  function PdfPageSheet({
    title,
    sub,
    days,
    roster,
    month,
    longBoard,
    left,
    pageNo,
    pages,
    genAt
  }) {
    const wkz = ['日', '一', '二', '三', '四', '五', '六'];
    const th = {
      border: '1px solid #999',
      background: '#eee',
      fontSize: 12,
      padding: 0,
      height: 24,
      lineHeight: '24px',
      verticalAlign: 'middle',
      textAlign: 'center'
    };
    const td = {
      border: '1px solid #999',
      padding: '2px 4px',
      verticalAlign: 'middle'
    };
    const wkS = x => String(x.days || '').split(',').filter(Boolean).map(i => wkz[parseInt(i, 10)]).join('');
    const shT = x => x.shift === 'early' ? '（早）' : x.shift === 'late' ? '（晚）' : '';
    const wkLine = x => x.kind === 'leave' ? '長假' : x.kind === 'rest' ? '長休' : x.kind === 'fixed' ? '固定休　每週' + wkS(x) + shT(x) : x.kind === 'alt' ? '固定隔日休　' + (x.days === 'odd' ? '單號日' : '雙號日') + shT(x) : x.kind === 'holiday' ? '假日可休　' + wkS(x) + '・每週' + (x.quota || String(x.days || '').split(',').length) + '天' + shT(x) : x.kind === 'part' ? '兼職' : x.kind === 'note' ? '見人再壓' : '課業　每週' + wkS(x) + '上班';
    const PER = 6;
    const N = Array.from({
      length: PER
    });
    const leftArr = Object.keys(left || {}).filter(c => left[c] >= month + '-01').sort((a, b) => left[a] < left[b] ? -1 : left[a] > left[b] ? 1 : parseFloat(a) - parseFloat(b) || 0);
    return React.createElement("div", {
      className: "pdfpage",
      style: {
        width: PDF_W,
        height: PDF_H,
        background: '#fff',
        color: '#000',
        padding: '28px 30px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system,"PingFang TC","Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '2px solid #000',
        paddingBottom: 4,
        marginBottom: 6
      }
    }, React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 700
      }
    }, title), React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, sub, "\u3000第 ", pageNo, " / ", pages, " 頁")), React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed'
      }
    }, React.createElement("colgroup", null, React.createElement("col", {
      style: {
        width: 46
      }
    }), React.createElement("col", {
      style: {
        width: 26
      }
    }), N.map((_, i) => React.createElement("col", {
      key: 'e' + i
    })), N.map((_, i) => React.createElement("col", {
      key: 'l' + i
    }))), React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
      style: th,
      rowSpan: 1
    }, "日期"), React.createElement("th", {
      style: th
    }, "週"), React.createElement("th", {
      style: th,
      colSpan: PER
    }, "早班休假"), React.createElement("th", {
      style: th,
      colSpan: PER
    }, "晚班休假"))), React.createElement("tbody", null, days.map(dd => {
      const date = month + '-' + String(dd).padStart(2, '0');
      const ro = roster[date] || {
        early: [],
        late: []
      };
      const dow = new Date(parseInt(month.slice(0, 4), 10), parseInt(month.slice(5, 7), 10) - 1, dd).getDay();
      const wk = dow === 0 || dow === 6;
      const rows = Math.max(2, Math.ceil(Math.max(ro.early.length, ro.late.length) / PER));
      const bg = wk ? '#f2f2f2' : '#fff';
      return Array.from({
        length: rows
      }).map((_, r) => React.createElement("tr", {
        key: date + r,
        style: {
          background: bg
        }
      }, React.createElement("td", {
        style: {
          ...td,
          textAlign: 'center',
          verticalAlign: 'top',
          lineHeight: '15px',
          fontWeight: 700,
          fontSize: 13,
          borderTop: r === 0 ? '1px solid #999' : 'none',
          borderBottom: r < rows - 1 ? 'none' : '1px solid #999'
        }
      }, r === 0 ? parseInt(month.slice(5, 7), 10) + '/' + dd : '\u00a0'), React.createElement("td", {
        style: {
          ...td,
          textAlign: 'center',
          verticalAlign: 'top',
          lineHeight: '15px',
          fontSize: 12,
          color: wk ? '#c00' : '#000',
          borderTop: r === 0 ? '1px solid #999' : 'none',
          borderBottom: r < rows - 1 ? 'none' : '1px solid #999'
        }
      }, r === 0 ? wkz[dow] : '\u00a0'), N.map((_, i) => React.createElement(PdfCell, {
        key: 'e' + i,
        x: ro.early[r * PER + i],
        left: left
      })), N.map((_, i) => React.createElement(PdfCell, {
        key: 'l' + i,
        x: ro.late[r * PER + i],
        left: left
      }))));
    }))), React.createElement("div", {
      style: {
        position: 'absolute',
        left: 30,
        right: 30,
        bottom: 30
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        borderBottom: '1px solid #000',
        marginBottom: 3,
        lineHeight: '18px',
        paddingBottom: 3
      }
    }, "長假／固定上班日（已核准）"), longBoard.length === 0 && leftArr.length === 0 ? React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#555'
      }
    }, "本月無") : (() => {
      const md = d => String(d).slice(5).replace('-', '/').replace(/\/0/, '/').replace(/^0/, '');
      const sh = x => x.shift === 'early' ? '早' : x.shift === 'late' ? '晚' : '';
      const item = x => {
        const e = x.end ? '~' + md(x.end) : '';
        if (x.kind === 'leave' || x.kind === 'rest') return x.code + '(' + md(x.start) + (x.end ? '~' + md(x.end) : '~') + ')';
        if (x.kind === 'fixed') return x.code + '(' + wkS(x) + e + ')';
        if (x.kind === 'alt') return x.code + '(' + (x.days === 'odd' ? '單' : '雙') + sh(x) + e + ')';
        if (x.kind === 'holiday') return x.code + '(' + wkS(x) + (x.quota || String(x.days || '').split(',').length) + '天' + sh(x) + e + ')';
        return x.code;
      };
      const G = [['leave', '長假'], ['rest', '長休'], ['fixed', '固定休'], ['alt', '隔日休'], ['holiday', '假日可休'], ['part', '兼職'], ['note', '見人再壓']];
      return G.map(([k, nm]) => {
        const arr = longBoard.filter(x => x.kind === k).slice().sort(byCode);
        return arr.length ? React.createElement("div", {
          key: k,
          style: {
            fontSize: 11,
            lineHeight: '16px'
          }
        }, React.createElement("b", null, nm), "\u3000", arr.map(item).join('　')) : null;
      }).concat(leftArr.length ? [React.createElement("div", {
        key: "lf",
        style: {
          fontSize: 11,
          lineHeight: '16px'
        }
      }, React.createElement("b", null, "離職"), "\u3000", leftArr.map(c => c + '(' + mdShort(left[c]) + '離)').join('　'))] : []);
    })(), React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#666',
        marginTop: 4
      }
    }, "底線＝超出名額（待調整）\u3000", React.createElement("span", {
      style: {
        color: '#d00'
      }
    }, "紅字"), "＝批准主管編號\u3000", React.createElement("span", {
      style: {
        color: '#1a6fb5'
      }
    }, "藍字"), "＝固定休(固)／假日可休(可)\u3000*＝待簽核\u3000主管排休已列入\u3000列印時間 ", genAt)));
  }
  function PdfPage({
    me
  }) {
    const q = new URLSearchParams(location.search);
    const cur = todayStr().slice(0, 7);
    const month = q.get('month') || addMonth(cur, 1);
    const store = q.get('store') || '';
    const [st, reload] = useLoad('lv2Month', store ? {
      month: month,
      store: store
    } : {
      month: month
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [cap, setCap] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfImgs, setPdfImgs] = useState([]);
    const [scale, setScale] = useState(() => Math.min(1, (Math.max(320, window.innerWidth || 390) - 24) / PDF_W));
    const d = st.data && st.data.ok && st.data.month === month ? st.data : null;
    if (!d && st.loading) return React.createElement(Loading, null);
    if (!d) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const nd = new Date(parseInt(month.slice(0, 4), 10), parseInt(month.slice(5, 7), 10), 0).getDate();
    const p1 = Array.from({
        length: 15
      }, (_, i) => i + 1),
      p2 = Array.from({
        length: nd - 15
      }, (_, i) => i + 16);
    const title = d.store + '　' + month.slice(0, 4) + ' 年 ' + parseInt(month.slice(5, 7), 10) + ' 月　休假總表';
    const genAt = (() => {
      const x = new Date(Date.now() + 8 * 3600e3);
      return x.getUTCMonth() + 1 + '/' + x.getUTCDate() + ' ' + p2s(x.getUTCHours()) + ':' + p2s(x.getUTCMinutes());
    })();
    function p2s(n) {
      return String(n).padStart(2, '0');
    }
    const sheetProps = {
      roster: d.roster,
      month: month,
      longBoard: d.long.board,
      left: d.left || {},
      pages: 2,
      genAt: genAt,
      title: title
    };
    const download = async () => {
      setBusy(true);
      setErr('');
      setCap(true);
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await new Promise(r => setTimeout(r, 80));
        const pages = [].slice.call(document.querySelectorAll('.pdfpage'));
        const pdf = new window.jspdf.jsPDF({
          unit: 'pt',
          format: 'a4',
          orientation: 'portrait'
        });
        const imgs = [];
        for (let i = 0; i < pages.length; i++) {
          const cv = await window.html2canvas(pages[i], {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true
          });
          if (i > 0) pdf.addPage();
          const du = cv.toDataURL('image/jpeg', 0.92);
          imgs.push(du);
          pdf.addImage(du, 'JPEG', 0, 0, 595.28, 841.89);
        }
        const fname = '休假總表_' + d.store + '_' + month + '.pdf';
        const blob = pdf.output('blob');
        let f = null;
        try {
          f = new File([blob], fname, {
            type: 'application/pdf'
          });
        } catch (_e) {}
        setPdfFile(f);
        setPdfUrl(URL.createObjectURL(blob));
        setPdfImgs(imgs);
      } catch (e) {
        setErr('產生 PDF 失敗：' + String(e && e.message || e).slice(0, 120) + '（可改用下方圖片版長按儲存，或按「用瀏覽器開啟」）');
      }
      setCap(false);
      setBusy(false);
    };
    const external = () => {
      try {
        if (window.liff && window.liff.openWindow) {
          window.liff.openWindow({
            url: location.href,
            external: true
          });
          return;
        }
      } catch (_e) {}
      window.open(location.href, '_blank');
    };
    return React.createElement("div", {
      className: "p-3 space-y-3"
    }, React.createElement("style", null, '@media print{.nop{display:none!important}.pdfwrap{transform:none!important;height:auto!important}.pdfpage{page-break-after:always}.pdfpage{height:1122px!important;overflow:hidden}.pdfpage:last-child{page-break-after:auto}@page{size:A4 portrait;margin:0}body{background:#fff!important}}'), React.createElement("div", {
      className: "nop flex items-center justify-between"
    }, React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => go('lv2=l')
    }, "← 返回"), React.createElement("h1", {
      className: "text-base font-bold text-white"
    }, "📄 休假總表 PDF"), React.createElement("span", null)), React.createElement("div", {
      className: "nop flex gap-2"
    }, React.createElement(Btn, {
      loading: busy,
      onClick: download
    }, pdfFile || pdfUrl ? '重新產生 PDF' : '產生 PDF（2 頁）'), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: external
    }, "用瀏覽器開啟")), err && React.createElement("p", {
      className: "nop text-sm text-red-400 text-center"
    }, err), (pdfUrl || pdfImgs.length > 0) && React.createElement("div", {
      className: "nop rounded-xl border border-emerald-700 p-3 space-y-2"
    }, React.createElement("p", {
      className: "text-sm text-emerald-300 font-bold"
    }, "✅ PDF 已產生"), pdfFile && navigator.canShare && navigator.canShare({
      files: [pdfFile]
    }) && React.createElement(Btn, {
      color: "bg-emerald-600 text-white",
      onClick: async () => {
        setErr('');
        try {
          await navigator.share({
            files: [pdfFile],
            title: pdfFile.name
          });
        } catch (e) {
          if (!e || e.name !== 'AbortError') setErr('分享失敗：' + String(e && e.message || e).slice(0, 100));
        }
      }
    }, "📤 用手機分享／儲存"), pdfUrl && React.createElement("a", {
      href: pdfUrl,
      download: '休假總表_' + d.store + '_' + month + '.pdf',
      className: "block text-center rounded-xl bg-gray-800 border border-gray-600 text-gray-200 text-sm py-2.5"
    }, "下載 PDF 檔"), React.createElement("p", {
      className: "text-[11px] text-gray-400"
    }, "若「分享」或「下載」沒反應：長按下面的圖片 →「加入照片」或「儲存影像」。"), pdfImgs.map((u, i) => React.createElement("img", {
      key: i,
      src: u,
      alt: '第 ' + (i + 1) + ' 頁',
      className: "w-full rounded border border-gray-700"
    }))), React.createElement("p", {
      className: "nop text-xs text-gray-500"
    }, "第 1 頁：1~15 日；第 2 頁：16~", nd, " 日。每天兩排：每格 1 人（格線等寬），第一排 1~10 位，第二排 11~20 位。長假／固定上班日（已核准）兩頁最下方都有列出。"), React.createElement("div", {
      className: "pdfwrap",
      style: {
        transform: cap ? 'none' : 'scale(' + scale + ')',
        transformOrigin: 'top left',
        width: PDF_W,
        height: cap ? 'auto' : (PDF_H * 2 + 16) * scale / scale,
        marginBottom: cap ? 0 : -(PDF_H * 2 + 16) * (1 - scale)
      }
    }, React.createElement(PdfPageSheet, {
      ...sheetProps,
      days: p1,
      pageNo: 1,
      sub: '1~15 日'
    }), React.createElement("div", {
      style: {
        height: 16
      },
      className: "nop"
    }), React.createElement(PdfPageSheet, {
      ...sheetProps,
      days: p2,
      pageNo: 2,
      sub: '16~' + nd + ' 日'
    })));
  }
  function LeavePage({
    me
  }) {
    const lang = me.user && me.user.lang === 'vi' ? 'vi' : 'zh';
    const t = L[lang];
    const dArr = x => Array.isArray(x) ? x : x ? [x] : [];
    const cur = todayStr().slice(0, 7);
    const [month, setMonth] = useState(() => {
      try {
        const m = new URLSearchParams(location.search).get('month') || '';
        if (/^\d{4}-(0[1-9]|1[0-2])$/.test(m) && [addMonth(cur, -2), addMonth(cur, -1), cur, addMonth(cur, 1), addMonth(cur, 2)].indexOf(m) >= 0) return m;
        if (new URLSearchParams(location.search).get('src') === 'entry') return addMonth(cur, 1);
      } catch (_e) {}
      return cur;
    });
    const [store, setStore] = useState('');
    useEffect(() => {
      try {
        if (new URLSearchParams(location.search).get('src') !== 'entry') return;
        const k = 'lv2-entry-tracked';
        if (sessionStorage.getItem(k)) return;
        sessionStorage.setItem(k, '1');
        api('lv2Track', {
          src: 'entry'
        });
      } catch (_e) {}
    }, []);
    const [shift, setShift] = useState(me.user && me.user.shift || 'early');
    const [sel, setSel] = useState([]);
    const [focus, setFocus] = useState('');
    const lsGet = (k, df) => {
      try {
        const v = localStorage.getItem(k);
        return v === null ? df : v;
      } catch (e) {
        return df;
      }
    };
    const lsSet = (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    };
    const [rMode, setRMode] = useState(() => lsGet('lv2RosterMode', 'all'));
    const [showSign, setShowSign] = useState(() => lsGet('lv2ShowSign', '1') !== '0');
    const [rq, setRq] = useState('');
    const [rPg, setRPg] = useState(null);
    const [adjOpen, setAdjOpen] = useState({});
    const [armed, setArmed] = useState('');
    const [vMode, setVMode] = useState(() => lsGet('lv2ViewMode', 'mgr') === 'teacher' ? 'teacher' : 'mgr');
    const [seqOpen, setSeqOpen] = useState(false);
    const [logOpen, setLogOpen] = useState(false);
    const [gErr, setGErr] = useState('');
    const [gDraft, setGDraft] = useState([]);
    const [gCode, setGCode] = useState('');
    const [seqSort, setSeqSort] = useState('order');
    const [seqQ, setSeqQ] = useState('');
    const [lgOpen, setLgOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [lf, setLf] = useState(null);
    const adjSorted = sh => (d.adjust && d.adjust[sh] || []).slice().sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.pos || 0) - (b.pos || 0));
    const [pop, setPop] = useState(null);
    const [dg, setDg] = useState(null);
    const [supOpen, setSupOpen] = useState(false);
    const [supPop, setSupPop] = useState(null);
    const [seqIn, setSeqIn] = useState({});
    const [cf, setCf] = useState(null);
    const [af, setAf] = useState(null);
    const [apSel, setApSel] = useState(null);
    const [rvSure, setRvSure] = useState(false);
    const [hideSg, setHideSg] = useState(() => lsGet('lv2HideSigned', '0') === '1');
    const [pick, setPick] = useState({});
    const [adjShift, setAdjShift] = useState((me.user && me.user.shift) === 'late' ? 'late' : 'early');
    const [st, reload] = useLoad('lv2Month', store ? {
      month: month,
      store: store
    } : {
      month: month
    });
    const rlP = useRef(null);
    const reloadR = () => {
      const p = reload();
      rlP.current = p;
      return p;
    };
    const d = st.data && st.data.ok && st.data.month === month ? st.data : null;
    const adjOk = !d || !d.adjCan || d.adjCan[adjShift] !== false;
    const [cx, setCx] = useState([]);
    const busyR = useRef(false);
    const dirtyR = useRef('');
    const lastMo = useRef('');
    useEffect(() => {
      if (d) {
        const same = lastMo.current === d.month;
        lastMo.current = d.month;
        if (same && dirtyR.current === d.month) return;
        dirtyR.current = '';
        setSel(d.mine.filter(x => x.status === 'draft').map(x => ({
          date: x.date,
          shift: x.shift
        })));
        setCx([]);
      }
    }, [d && d._at, d && d.month]);
    useEffect(() => {
      if (d && new URLSearchParams(location.search).get('tab') === 'adjust' && !window.__lv2Scrolled) {
        window.__lv2Scrolled = 1;
        setTimeout(() => {
          const el = document.getElementById('lv2-adjust');
          if (el && el.scrollIntoView) el.scrollIntoView();
        }, 100);
      }
    }, [d && d.month]);
    if (!d && st.loading) return React.createElement(Loading, null);
    if (!d && !(st.data && st.data.ok)) return React.createElement(Msg, {
      text: st.data && st.data.error || t.fail
    });
    if (!d) return React.createElement(Loading, null);
    const today = todayStr();
    const lim = d.limits;
    const holOk = date => {
      const dw = new Date(parseInt(date.slice(0, 4), 10), parseInt(date.slice(5, 7), 10) - 1, parseInt(date.slice(8), 10)).getDay();
      return d.long.mine.some(r => r.kind === 'holiday' && r.status === 'approved' && String(r.days).split(',').indexOf(String(dw)) >= 0 && r.start <= date && (!r.end || r.end >= date));
    };
    const slotOf0 = (date, sh) => {
      if (d.anon) return d.slots && d.slots[date] && d.slots[date][sh] || {
        o: 0,
        me: '',
        over: 0,
        sign: '',
        h: 0
      };
      const arr = (d.roster && d.roster[date] || {})[sh] || [];
      const my = String(d.me && d.me.code || '');
      let o = 0,
        me = '',
        over = 0,
        sign = '',
        h = 0,
        oc = 0;
      arr.forEach(x => {
        if (x.m) return;
        if (my && String(x.c) === my) {
          me = my;
          over = x.x ? 1 : 0;
          sign = x.x ? x.s || '' : '';
          h = x.h || x.f ? 1 : 0;
          if (x.oc) oc = 1;
        } else if (!x.x && !x.f && !x.h) o++;
      });
      return {
        o: o,
        me: me,
        over: over,
        sign: sign,
        h: h,
        oc: oc
      };
    };
    const slotOf = (date, sh) => {
      const x = slotOf0(date, sh);
      if (x.me) return x;
      const mc = String(d.me && d.me.code || '');
      if (mc && (selHas(date, sh) || d.mine.some(m => m.date === date && m.shift === sh && m.status !== 'rejected' && m.status !== 'cancelled'))) return Object.assign({}, x, {
        me: mc
      });
      return x;
    };
    const capOf = date => {
      const dow = new Date(parseInt(date.slice(0, 4), 10), parseInt(date.slice(5, 7), 10) - 1, parseInt(date.slice(8), 10)).getDay();
      return dow === 0 || dow === 6 ? lim.weekend : lim.weekday;
    };
    const mineBy = {};
    d.mine.forEach(x => {
      if (x.status !== 'draft') (mineBy[x.date] = mineBy[x.date] || []).push(x);
    });
    const selHas = (date, sh) => sel.some(x => x.date === date && x.shift === sh);
    const used = {
      early: 0,
      late: 0
    };
    d.mine.forEach(x => {
      if ((x.status === 'approved' || x.status === 'pending') && !x.cx && cx.indexOf(x.id) < 0) used[x.shift]++;
    });
    sel.forEach(x => {
      used[x.shift]++;
    });
    const run = async fn => {
      if (busyR.current) return;
      busyR.current = true;
      setBusy(true);
      setErr('');
      setMsg('');
      rlP.current = null;
      try {
        await fn();
        try {
          if (rlP.current) await rlP.current;
        } catch (_e) {}
      } finally {
        busyR.current = false;
        setBusy(false);
        dirtyR.current = '';
      }
    };
    const onDay = date => {
      setFocus(date);
      if (!d.canLeave || date < today || d.state === 'past' || d.state === 'tooEarly') return;
      const m = (mineBy[date] || []).filter(x => x.shift === shift)[0];
      if (slotOf0(date, shift).oc && !m) {
        setErr(t.ocDay);
        return;
      }
      if (m) {
        if (m.status === 'approved' && !m.cx) {
          setCx(cx.indexOf(m.id) >= 0 ? cx.filter(i => i !== m.id) : cx.concat([m.id]));
          return;
        }
        if (!window.confirm(m.cx || m.pair ? t.cxWithdrawAsk : t.cancelAsk)) return;
        run(async () => {
          const r = await api('lv2Cancel', {
            id: m.id
          });
          if (r && r.ok) reloadR();else setErr(r && r.error || t.fail);
        });
        return;
      }
      dirtyR.current = month;
      setSel(selHas(date, shift) ? sel.filter(x => !(x.date === date && x.shift === shift)) : sel.concat([{
        date: date,
        shift: shift
      }]));
    };
    const save = submit => run(async () => {
      if (submit) {
        const fullDays = [];
        sel.forEach(x => {
          if (((d.counts[x.date] || {})[x.shift] || 0) >= capOf(x.date) && !holOk(x.date)) {
            const k = parseInt(x.date.slice(5, 7), 10) + '/' + parseInt(x.date.slice(8), 10);
            if (fullDays.indexOf(k) < 0) fullDays.push(k);
          }
        });
        const overP = !d.isMgr && (used.early > lim.person || used.late > lim.person);
        const pp = d.slip || {};
        const dom = new Date(Date.now() + 8 * 3600e3).getUTCDate();
        const vi0 = lang === 'vi';
        const remTxt = (pp.p1 && dom >= 10 && dom <= 12 ? '\n\n' + (vi0 ? 'Giai đoạn thử nghiệm: khi mở đăng ký nghỉ (từ 0:00 ngày 10 đến 23:59 ngày 12), ngoài đăng ký trực tuyến, vẫn phải điền phiếu giấy nhỏ theo quy định công ty và tự tay dán tại nơi chỉ định ở quầy. Trong thời gian thử nghiệm, thứ tự trên phiếu giấy là chuẩn.' : '測試階段提醒:10號00:00~12號23:59 開放排休時,除線上申請外,仍需依公司規定填寫小白單並由本人親自張貼於櫃台指定地點,測試期間,將以小白單上的順序為主。') : '') + (pp.p2 && (cx.length > 0 || d.state === 'late') ? '\n\n' + (vi0 ? 'Giai đoạn thử nghiệm: đổi nghỉ / nghỉ đột xuất / thêm ngày nghỉ / hủy nghỉ — sau khi đăng ký trực tuyến, vẫn phải viết phiếu giấy nhỏ gửi quản lý và nêu lý do theo quy định công ty.' : '測試階段提醒:改休 / 臨時休 / 增加休假 / 取消休假,線上申請後,仍請依公司規定寫小白單給主管說明原因。') : '');
        if (fullDays.length) {
          if (!window.confirm(fmt(t.fullWarn, {
            d: fullDays.join(' ')
          }) + remTxt)) return;
        } else if (!window.confirm((cx.length ? fmt(t.changeAskT, {
          c: cx.length,
          n: sel.length
        }) + '\n' + (d.apprMode === 'all' || d.apprMode !== 'none' && d.state === 'late' ? t.changeLate : t.changeOpen) : t.submitAsk) + (overP ? '\n' + t.submitOver : '') + remTxt)) return;
      }
      const r = await api('lv2Save', {
        month: month,
        items: JSON.stringify(sel),
        submit: !!submit,
        cancel: submit && cx.length ? JSON.stringify(cx) : ''
      });
      if (r && r.ok && r.queued) {
        setMsg(lang === 'vi' ? submit ? 'Đã lưu trên máy, đang gửi nền… (kết quả sẽ hiện ở góc dưới)' : 'Đã lưu nháp trên máy, đang gửi nền…' : submit ? '已存在本機,正在背景送出(結果會顯示在畫面下方)' : '已暫存,背景同步中…');
        setCx([]);
        reloadR();
      } else if (r && r.ok) {
        setMsg(submit ? fmt(t.sent, {
          a: r.approved,
          p: r.pending
        }) + (r.cancelled || r.cxPending ? '；' + fmt(t.cxSent, {
          a: r.cancelled || 0,
          p: r.cxPending || 0
        }) : '') : fmt(t.saved, {
          n: r.saved
        }));
        setCx([]);
        reloadR();
      } else setErr(r && r.error || t.fail);
    });
    const longSend = () => run(async () => {
      const r = await api('lv2LongSave', {
        kind: lf.kind,
        start: lf.start,
        end: lf.kind === 'rest' ? '' : lf.end,
        days: lf.kind === 'alt' ? lf.alt : lf.days.join(','),
        shift: lf.shift,
        quota: lf.quota,
        code: lf.code,
        reason: lf.reason.trim(),
        occupy: lf.occupy || ''
      });
      if (r && r.ok) {
        setMsg(r.status === 'approved' ? t.addedOk : t.longSent);
        setLf(null);
        reloadR();
      } else setErr(r && r.error || t.fail);
    });
    const longAct = (action, params, ask) => {
      if (ask && !window.confirm(ask)) return;
      run(async () => {
        const r = await api(action, params);
        if (r && r.ok) reloadR();else setErr(r && r.error || t.fail);
      });
    };
    const decide = (id, approve) => run(async () => {
      const r = await api('lv2Decide', {
        id: id,
        approve: approve
      });
      if (r && r.ok) reloadR();else setErr(r && r.error || t.fail);
    });
    const [y, m] = [parseInt(month.slice(0, 4), 10), parseInt(month.slice(5, 7), 10)];
    const first = new Date(y, m - 1, 1).getDay();
    const nd = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let i = 1; i <= nd; i++) cells.push(month + '-' + p2(i));
    const apM = d.apprMode || 'window';
    const live = d.state === 'open' || d.state === 'late';
    const banner = live && apM === 'none' ? t.st_none : live && apM === 'all' ? t.st_all : {
      tooEarly: t.st_tooEarly,
      draft: fmt(t.st_draft, {
        o: (d.opens || '').slice(5).replace('-', '/')
      }),
      open: fmt(t.st_open, {
        c: (d.closes || '').slice(5)
      }),
      late: t.st_late,
      past: t.st_past
    }[d.state];
    const bannerCls = live && apM === 'none' || d.state === 'open' && apM !== 'all' ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300' : live ? 'border-amber-700 bg-amber-950/40 text-amber-300' : 'border-gray-700 bg-gray-900 text-gray-300';
    const flagText = f => String(f || '').split(',').filter(Boolean).map(x => t['flag_' + x]).join('、');
    const canEdit = d.canLeave && (d.state === 'draft' || d.state === 'open' || d.state === 'late');
    const canSubmit = canEdit && d.state !== 'draft' && (sel.length > 0 || cx.length > 0);
    const rosterOf = focus && d.roster[focus];
    const isV = !!(d.isMgr || d.canSeq);
    const desk = (() => {
      try {
        return new URLSearchParams(location.search).get('desk') === '1';
      } catch (_e) {
        return false;
      }
    })();
    const seqView = (() => {
      let l = d.seqList.slice();
      if (seqSort === 'code') l.sort((a, b) => (parseInt(a.code, 10) || 1e9) - (parseInt(b.code, 10) || 1e9));
      if (seqQ) l = l.filter(x => String(x.code).indexOf(seqQ) === 0);
      return l;
    })();
    const allDays = cells.filter(Boolean);
    const anonView = !!(d.anon || isV && vMode === 'teacher');
    const rosterDates = allDays.filter(dt => !(isV && vMode === 'mgr' && rMode === 'future') || dt >= today);
    const PGN = 5;
    const pgCount = Math.max(1, Math.ceil(rosterDates.length / PGN));
    const autoPg = (() => {
      const i = rosterDates.indexOf(today);
      return i < 0 ? 0 : Math.floor(i / PGN);
    })();
    const pg = Math.min(pgCount - 1, Math.max(0, rPg === null ? autoPg : rPg));
    const pageDates = rosterDates.slice(pg * PGN, pg * PGN + PGN);
    const pgLabel = pageDates.length ? parseInt(pageDates[0].slice(8), 10) + '~' + parseInt(pageDates[pageDates.length - 1].slice(8), 10) + (lang === 'vi' ? '' : ' 日') : '';
    const pm = new URLSearchParams(location.search).get('lv2') === 'pend';
    const pmShift = (() => {
      const v = new URLSearchParams(location.search).get('shift');
      return v === 'early' || v === 'late' ? v : '';
    })();
    const pendL = pm && pmShift ? d.pending.filter(x => x.kind === 'change' || x.kind === 'cancel' ? (x.cancel || []).concat(x.add || []).some(c => c.shift === pmShift) : x.shift === pmShift) : d.pending;
    const pendCard = d.isMgr && !desk && d.state !== 'past' ? React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, t.pendingTitle, "（", pendL.length, "）"), pendL.length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.noPending), pendL.map(x => React.createElement("div", {
      key: x.id,
      className: "rounded-xl border border-gray-700 p-2 space-y-1"
    }, x.kind === 'change' || x.kind === 'cancel' ? React.createElement("div", {
      className: "space-y-0.5"
    }, React.createElement("p", {
      className: "text-sm text-white"
    }, x.store, "\u3000", x.code, " 號\u3000", React.createElement("span", {
      className: "text-xs rounded-full px-2 py-0.5 bg-rose-700 text-white"
    }, x.kind === 'change' ? t.pendChange : t.pendCancel)), x.cancel.map((c, i) => React.createElement("p", {
      key: 'c' + i,
      className: "text-sm text-red-300"
    }, t.pendFrom, "\u3000", React.createElement("span", {
      className: "line-through"
    }, c.date.slice(5).replace('-', '/'), " ", t[c.shift]))), x.add.map((c, i) => React.createElement("p", {
      key: 'a' + i,
      className: "text-sm text-emerald-300"
    }, t.pendTo, "\u3000", c.date.slice(5).replace('-', '/'), " ", t[c.shift]))) : React.createElement("p", {
      className: "text-sm text-white"
    }, x.store, "\u3000", x.code, " 號\u3000", x.date.slice(5), "\u3000", t[x.shift]), x.flags ? React.createElement("p", {
      className: "text-xs text-amber-300"
    }, flagText(x.flags)) : null, React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("button", {
      disabled: busy,
      onClick: () => setPick({
        ...pick,
        [x.id]: !pick[x.id]
      }),
      className: 'flex-1 py-2 rounded-xl text-sm font-bold disabled:opacity-50 ' + (pick[x.id] ? 'bg-emerald-600 text-white' : 'border border-emerald-600 text-emerald-300')
    }, pick[x.id] ? '✓ ' : '', lang === 'vi' ? 'Đồng ý' : '同意'), React.createElement("button", {
      disabled: busy,
      onClick: () => decide(x.id, false),
      className: "flex-1 py-2 rounded-xl text-sm font-bold bg-gray-700 text-gray-200 disabled:opacity-50"
    }, t.rej)))), pendL.length > 0 && (() => {
      const ids = pendL.filter(x => pick[x.id]).map(x => x.id);
      const allOn = ids.length === pendL.length;
      return React.createElement("div", {
        className: "flex gap-2 pt-1"
      }, React.createElement("button", {
        disabled: busy,
        onClick: () => {
          const o = {};
          if (!allOn) pendL.forEach(x => {
            o[x.id] = true;
          });
          setPick(o);
        },
        className: "px-4 py-2.5 rounded-xl text-sm text-gray-200 border border-gray-600 disabled:opacity-50"
      }, allOn ? lang === 'vi' ? 'Bỏ chọn' : '取消全選' : lang === 'vi' ? 'Chọn tất cả' : '全選'), React.createElement("button", {
        disabled: busy || ids.length === 0,
        onClick: () => {
          if (!window.confirm(lang === 'vi' ? 'Đồng ý ' + ids.length + ' đơn đã chọn?' : '同意勾選的 ' + ids.length + ' 張申請並存檔？')) return;
          run(async () => {
            const r = await api('lv2DecideBatch', {
              ids: JSON.stringify(ids)
            });
            if (r && r.ok) {
              setPick({});
              if (r.failed) setErr((lang === 'vi' ? 'Không xử lý được ' : '有 ') + r.failed + (lang === 'vi' ? ' đơn: ' : ' 張沒處理成功:') + (r.fail[0] && r.fail[0].error || ''));
              reloadR();
            } else setErr(r && r.error || t.fail);
          });
        },
        className: 'flex-1 py-2.5 rounded-xl text-sm font-bold ' + (ids.length ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-500')
      }, lang === 'vi' ? 'Lưu' : '存檔', "（", ids.length, "）"));
    })()) : null;
    if (pm) {
      return React.createElement(Box, barOf(st, reload, lang), React.createElement("div", {
        className: "flex items-center justify-between"
      }, React.createElement("button", {
        className: "text-sm font-bold text-violet-700 px-2 py-1.5 -ml-2 rounded-lg active:bg-violet-100",
        onClick: () => {
          location.href = '?lv2=l&month=' + month;
        }
      }, "← ", t.title), React.createElement("span", {
        className: "text-xs text-gray-500"
      }, month)), React.createElement("h1", {
        className: "text-lg font-bold text-white"
      }, "📩 ", pmShift ? t[pmShift] + ' · ' : '', t.pendingTitle), pendCard || React.createElement(Card, null, React.createElement("p", {
        className: "text-sm text-gray-500"
      }, lang === 'vi' ? 'Bạn không có quyền ký.' : '你不是主管，沒有可簽核的項目。')), msg && React.createElement("p", {
        className: "text-sm text-center text-emerald-600"
      }, msg), err && React.createElement("p", {
        className: "text-sm text-center text-red-600"
      }, err), React.createElement(Btn, {
        onClick: () => {
          location.href = '?lv2=l&month=' + month;
        }
      }, "← ", t.title));
    }
    return React.createElement(Box, barOf(st, reload, lang), busy && React.createElement("div", {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    }, React.createElement("div", {
      className: "rounded-2xl bg-gray-900 border border-gray-700 px-6 py-5 flex flex-col items-center gap-2 text-violet-300"
    }, React.createElement(Spinner, {
      size: 36
    }), React.createElement("p", {
      className: "text-sm text-gray-200"
    }, lang === 'vi' ? 'Đang xử lý…' : '處理中，請稍候…'))), pop && (() => {
      const x = pop.x,
        q = x.q;
      const KN = {
        leave: '長假',
        rest: '長休',
        fixed: '固定休',
        alt: '固定隔日休',
        holiday: '假日可休'
      };
      const dd = new Date(parseInt(pop.date.slice(0, 4), 10), parseInt(pop.date.slice(5, 7), 10) - 1, parseInt(pop.date.slice(8), 10));
      const wk = '日一二三四五六'[dd.getDay()];
      const by = x.p ? '尚未核准（待簽核）' : !x.db ? x.v ? '由規則自動帶入，沒有逐日申請單' : '—' : x.db === '自動(免審批)' || x.db === '主管排休' || x.db === '紙本匯入' || x.db === '代登' ? x.db : x.db + ' 核准';
      const qd = q ? (KN[q.k] || q.k) + '　' + q.s.slice(5).replace('-', '/') + '~' + (q.e ? q.e.slice(5).replace('-', '/') : '未定') + (q.k === 'fixed' || q.k === 'holiday' ? '　每週' + String(q.dy || '').split(',').filter(Boolean).map(i => '日一二三四五六'[parseInt(i, 10)]).join('、') : q.k === 'alt' ? '　' + (q.dy === 'odd' ? '單號日' : '雙號日') : '') + (q.sh ? '（' + (q.sh === 'early' ? '早班' : '晚班') + '）' : '') + (q.k === 'holiday' && q.qt ? '　每週可休 ' + q.qt + ' 天' : q.k === 'leave' || q.k === 'rest' || q.k === 'fixed' || q.k === 'alt' ? '　' + (q.oc ? '佔名額' : '不佔名額') : '') : '';
      const Row = ({
        k,
        v
      }) => React.createElement("div", {
        className: "flex gap-2 text-sm"
      }, React.createElement("span", {
        className: "shrink-0 w-14 text-gray-500"
      }, k), React.createElement("span", {
        className: "flex-1 min-w-0 text-gray-100 break-words"
      }, v));
      return React.createElement("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60",
        onClick: () => setPop(null)
      }, React.createElement("div", {
        className: "w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-700 p-4 space-y-2",
        onClick: e => e.stopPropagation()
      }, React.createElement("p", {
        className: "text-base font-bold text-white"
      }, parseInt(pop.date.slice(5, 7), 10), "/", parseInt(pop.date.slice(8), 10), "（", wk, "）", pop.s === 'early' ? '早班' : '晚班', "\u3000", x.c, " 號"), React.createElement(Row, {
        k: "狀態",
        v: x.p ? '待簽核' : x.v ? '已生效（規則帶入）' : '已生效'
      }), React.createElement(Row, {
        k: "核准",
        v: by + (x.dt && !x.p ? '　' + x.dt.slice(5).replace('-', '/') : '')
      }), x.pos && React.createElement(Row, {
        k: "名額",
        v: '超額（第 ' + x.pos.split('/')[0] + ' 位／名額 ' + x.pos.split('/')[1] + '）　' + (x.s ? '簽核：' + x.s : '尚未簽核')
      }), !!x.f && !q && React.createElement(Row, {
        k: "關聯",
        v: "固定休（已不在清單，請至名單確認）"
      }), q && React.createElement(Row, {
        k: "關聯",
        v: qd
      }), q && q.by && React.createElement(Row, {
        k: "規則核准",
        v: q.by
      }), q && q.rs && React.createElement(Row, {
        k: "原因",
        v: q.rs
      }), !!x.lf && React.createElement(Row, {
        k: "離職",
        v: '已離職（最後上班日 ' + String((d.left || {})[String(x.c).trim()] || '').slice(5).replace('-', '/') + '），這天不佔名額、不算超額'
      }), x.fl && React.createElement(Row, {
        k: "標記",
        v: x.fl
      }), !q && !x.p && !x.pos && !x.lf && React.createElement("p", {
        className: "text-xs text-gray-500"
      }, "沒有關聯的長假或固定休，這是一般單日休假。"), React.createElement("button", {
        onClick: () => setPop(null),
        className: "w-full rounded-xl bg-gray-700 text-white py-2 text-sm mt-1"
      }, "關閉")));
    })(), React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "🏖️ ", t.title), d.stores && d.stores.length > 0 && React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, React.createElement(Chip, {
      on: !store,
      onClick: () => setStore('')
    }, d.me.store || t.store), d.stores.filter(x => x !== d.me.store).map(x => React.createElement(Chip, {
      key: x,
      on: store === x,
      onClick: () => setStore(x)
    }, x))), React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, [addMonth(cur, -2), addMonth(cur, -1), cur, addMonth(cur, 1), addMonth(cur, 2)].map(x => React.createElement(Chip, {
      key: x,
      on: month === x,
      onClick: () => {
        setMonth(x);
        setMsg('');
        setErr('');
        setFocus('');
        setRPg(null);
      }
    }, parseInt(x.slice(5, 7), 10), lang === 'vi' ? '/' + x.slice(0, 4) : ' 月'))), React.createElement("div", {
      className: 'rounded-xl border px-3 py-2 text-xs ' + bannerCls
    }, banner), d.paper && (d.paper.n > 0 || (d.paper.rules || []).length > 0) && (d.canLeave || d.isTeacher) && React.createElement(Card, {
      className: "space-y-2 border-amber-700"
    }, React.createElement("p", {
      className: "text-sm font-bold text-amber-300"
    }, "📎 ", t.paperT), (d.paper.rules || []).length > 0 && React.createElement("p", {
      className: "text-xs text-gray-300"
    }, "另有規則：", d.paper.rules.join('、')), d.paper.n > 0 && React.createElement("p", {
      className: "text-xs text-gray-300"
    }, fmt(t.paperTxt, {
      n: d.paper.n,
      c: d.me.code,
      m: parseInt(month.slice(5, 7), 10),
      l: d.paper.items.map(x => parseInt(x.date.slice(5, 7), 10) + '/' + parseInt(x.date.slice(8), 10) + (x.shift === 'early' ? lang === 'vi' ? ' sáng' : ' 早' : lang === 'vi' ? ' tối' : ' 晚')).join('、')
    })), React.createElement(Btn, {
      loading: busy,
      onClick: () => {
        if (!window.confirm(t.paperAsk)) return;
        run(async () => {
          const r = await api('lv2Claim', {});
          if (r && r.ok) {
            setMsg(fmt(t.paperOk, {
              n: r.n
            }));
            reloadR();
          } else setErr(r && r.error || t.fail);
        });
      }
    }, t.paperBtn)), d.blocked && React.createElement("p", {
      className: "text-sm text-amber-300"
    }, fmt(t.blockedTxt, {
      k: kindName(d.blocked, t)
    })), !d.canLeave && !d.blocked && React.createElement("p", {
      className: "text-xs text-gray-400"
    }, t.notTeacher), d.canLeave && !desk && React.createElement("div", {
      className: "flex items-center gap-2 flex-wrap"
    }, React.createElement("span", {
      className: "text-xs text-gray-400"
    }, t.shift), ['early', 'late'].map(s => React.createElement(Chip, {
      key: s,
      on: shift === s,
      onClick: () => setShift(s)
    }, t[s]))), !desk && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("div", {
      className: "grid grid-cols-7 text-center text-xs text-gray-500"
    }, (lang === 'vi' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['日', '一', '二', '三', '四', '五', '六']).map(w => React.createElement("div", {
      key: w
    }, w))), React.createElement("div", {
      className: "grid grid-cols-7 gap-1"
    }, cells.map((date, i) => {
      if (!date) return React.createElement("div", {
        key: 'e' + i
      });
      const c = d.counts[date] || {
        early: 0,
        late: 0
      };
      const past = date < today && d.state !== 'past';
      const mine = mineBy[date] || [];
      return React.createElement("button", {
        key: date,
        onClick: () => onDay(date),
        className: 'rounded-lg border min-h-[58px] p-1 text-left flex flex-col ' + (focus === date ? 'border-violet-400 ' : 'border-gray-800 ') + (past ? 'opacity-40 ' : 'bg-gray-900 ')
      }, React.createElement("span", {
        className: 'text-xs ' + (date === today ? 'text-violet-300 font-bold' : 'text-gray-200')
      }, parseInt(date.slice(8), 10)), React.createElement("span", {
        className: "flex flex-wrap gap-0.5 mt-0.5"
      }, ['early', 'late'].map(s => {
        const mm = mine.filter(x => x.shift === s)[0];
        const dr = selHas(date, s);
        if (!mm && !dr) {
          const ocx = ((d.roster && d.roster[date] || {})[s] || []).filter(x => String(x.c) === String(d.me && d.me.code || '') && x.oc)[0];
          return ocx ? React.createElement("span", {
            key: s,
            className: "text-[10px] leading-4 px-1 rounded border border-sky-500 text-sky-300"
          }, s === 'early' ? '早' : '晚', ocx.rk || '固') : null;
        }
        const cxm = !!(mm && cx.indexOf(mm.id) >= 0),
          cxr = !!(mm && mm.cx);
        const cls = cxm ? 'border border-red-400 bg-red-900/50 text-red-300 line-through' : cxr ? 'border border-dashed border-red-400 ' + SH_COLOR[s] + ' text-white' : mm ? (mm.status === 'pending' ? 'border border-dashed border-white/70 ' : '') + SH_COLOR[s] + ' text-white' : 'border border-dashed ' + (s === 'early' ? 'border-amber-400 text-amber-300' : 'border-indigo-400 text-indigo-300');
        return React.createElement("span", {
          key: s,
          className: 'text-[10px] leading-4 px-1 rounded ' + cls
        }, s === 'early' ? '早' : '晚', cxm ? '✕' : cxr ? '⏳✕' : mm ? mm.status === 'pending' ? '⏳' : '✓' : '');
      })), capOf(date) > 0 && new Date(parseInt(date.slice(0, 4), 10), parseInt(date.slice(5, 7), 10) - 1, parseInt(date.slice(8), 10)).getDay() % 6 !== 0 && React.createElement("span", {
        className: "mt-auto text-[9px] leading-3 text-gray-500"
      }, React.createElement("span", {
        className: c.early >= capOf(date) ? 'text-red-400' : ''
      }, c.early), "/", React.createElement("span", {
        className: c.late >= capOf(date) ? 'text-red-400' : ''
      }, c.late)));
    })), err === t.ocDay && React.createElement("p", {
      className: "text-xs text-sky-300"
    }, err), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, lang === 'vi' ? 'Số nhỏ: ca sáng/ca tối của chi nhánh (tối đa ' + lim.weekday + ')' : '小字：本店 早班/晚班 已休人數（平日每班上限 ' + lim.weekday + ' 人）')), d.canLeave && !desk && React.createElement(Card, {
      className: "space-y-1"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, t.sum), ['early', 'late'].map(s => React.createElement("p", {
      key: s,
      className: 'text-sm ' + (used[s] > lim.person ? 'text-red-400' : 'text-gray-200')
    }, t[s], "：", used[s], " / ", lim.person, " ", t.days, used[s] > lim.person ? '　' + fmt(t.over, {
      n: lim.person
    }) : '')), sel.some(x => ((d.counts[x.date] || {})[x.shift] || 0) >= capOf(x.date) && !holOk(x.date)) && React.createElement("p", {
      className: "text-xs text-red-400"
    }, fmt(t.full, {
      n: lim.weekday
    })), cx.length > 0 && React.createElement("p", {
      className: "text-xs text-amber-300"
    }, fmt(t.changeSum, {
      c: cx.length,
      n: sel.length
    })), canEdit && cx.length === 0 && d.mine.some(x => x.status === 'approved' && !x.cx && x.date >= today) && React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.cxHint)), canEdit && !desk && React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      loading: busy,
      onClick: () => save(false)
    }, t.draft), d.state !== 'draft' && React.createElement(Btn, {
      loading: busy,
      onClick: () => canSubmit ? save(true) : null,
      color: canSubmit ? undefined : 'bg-gray-800 text-gray-500'
    }, cx.length > 0 ? t.changeSubmit : t.submit)), msg && React.createElement("p", {
      className: "text-center text-sm text-emerald-400"
    }, "✅ ", msg), err && React.createElement("p", {
      className: "text-center text-sm text-red-400"
    }, err), d.mine.length > 0 && !desk && React.createElement(Card, {
      className: "space-y-1"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, t.mineList), d.mine.slice().sort((a, b) => a.date < b.date ? -1 : 1).map(x => React.createElement("p", {
      key: x.id,
      className: "text-sm text-gray-300"
    }, x.date.slice(5), "\u3000", t[x.shift], "\u3000", React.createElement("span", {
      className: x.cx ? 'text-red-300' : x.status === 'approved' ? 'text-emerald-400' : x.status === 'pending' ? 'text-amber-300' : 'text-gray-400'
    }, x.cx ? t.s_cx : t['s_' + x.status] || x.status), x.over ? React.createElement("span", {
      className: "text-xs text-orange-400"
    }, "\u3000", t.overTag) : null, x.signBy ? React.createElement("span", {
      className: "text-xs text-gray-400"
    }, "\u3000", fmt(t.signedBy, {
      c: x.signBy
    })) : null, x.flags && x.status === 'pending' ? React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "\u3000（", flagText(x.flags), "）") : null))), d.isMgr && d.deleg && d.deleg.mine && d.deleg.mine.length > 0 && React.createElement("div", {
      className: "rounded-xl border border-amber-700 bg-amber-950/40 px-3 py-2 text-[13px] text-amber-200 leading-relaxed"
    }, "👤 ", lang === 'vi' ? 'Bạn đang là người đại diện của ' : '你目前是 ', React.createElement("b", null, d.deleg.mine.map(x => x.fromName).join('、')), lang === 'vi' ? '' : ' 的代理人', "（", d.deleg.mine.map(x => parseInt(x.start.slice(5, 7), 10) + '/' + parseInt(x.start.slice(8), 10) + ' ~ ' + parseInt(x.end.slice(5, 7), 10) + '/' + parseInt(x.end.slice(8), 10)).join('、'), "）", React.createElement("br", null), lang === 'vi' ? 'Trong thời gian này bạn có thể ký duyệt đơn nghỉ phép của cửa hàng.' : '期間可簽核本店休假申請、收到調整表推播。'), pendCard, d.isMgr && !desk && d.long.pending.length > 0 && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, t.longTitle, " · ", t.pendingTitle, "（", d.long.pending.length, "）"), d.long.pending.map(x => React.createElement("div", {
      key: x.id,
      className: "rounded-xl border border-gray-700 p-2 space-y-1"
    }, React.createElement("p", {
      className: "text-sm text-white"
    }, x.store, "\u3000", x.code, " 號\u3000", x.kind === 'leave' || x.kind === 'rest' ? longText(x, t) : longText(x, t), "\u3000", periodText(x, t)), x.reason && React.createElement("p", {
      className: "text-xs text-gray-400"
    }, x.reason), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("button", {
      disabled: busy,
      onClick: () => longAct('lv2LongDecide', {
        id: x.id,
        approve: true
      }),
      className: "flex-1 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white disabled:opacity-50"
    }, t.ok), React.createElement("button", {
      disabled: busy,
      onClick: () => longAct('lv2LongDecide', {
        id: x.id,
        approve: false
      }),
      className: "flex-1 py-2 rounded-xl text-sm font-bold bg-gray-700 text-gray-200 disabled:opacity-50"
    }, t.rej))))), !anonView && d.roster && !desk && (() => {
      const SUP_OK = ['實習副理', '櫃台組長', '副理'];
      const zh = lang !== 'vi';
      const byDay = {},
        byCode = {};
      Object.keys(d.roster).forEach(dt => ['early', 'late'].forEach(sh => (d.roster[dt][sh] || []).forEach(x => {
        if (!x.m) return;
        if (x.lv && SUP_OK.indexOf(x.lv) < 0) return;
        const c = String(x.c);
        (byDay[dt] = byDay[dt] || []).push({
          c: c,
          sh: sh,
          p: x.p,
          lv: x.lv || ''
        });
        (byCode[c] = byCode[c] || []).push({
          dt: dt,
          sh: sh
        });
      })));
      const codes = Object.keys(byCode).sort((a, b) => (parseInt(a, 10) || 1e9) - (parseInt(b, 10) || 1e9));
      const dd = x => parseInt(x.slice(8), 10);
      const wdn = dt => (zh ? ['日', '一', '二', '三', '四', '五', '六'] : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'])[new Date(parseInt(dt.slice(0, 4), 10), parseInt(dt.slice(5, 7), 10) - 1, parseInt(dt.slice(8), 10)).getDay()];
      return React.createElement(Card, {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "text-sm font-bold text-white"
      }, "👔 ", zh ? '主管休假表' : 'Bảng nghỉ phép quản lý'), React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, zh ? '本店經理以下主管排休。有排休的日子，號碼在日期上方。' : 'Quản lý dưới cấp Quản lý của cửa hàng; số ở phía trên ngày.'), React.createElement("div", {
        className: "grid grid-cols-7 text-center text-xs text-gray-500"
      }, (zh ? ['日', '一', '二', '三', '四', '五', '六'] : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']).map(w => React.createElement("div", {
        key: w
      }, w))), React.createElement("div", {
        className: "grid grid-cols-7 gap-1"
      }, cells.map((date, i) => {
        if (!date) return React.createElement("div", {
          key: 's' + i
        });
        const L = byDay[date] || [];
        const sorted = L.slice().sort((a, b) => a.sh === b.sh ? (parseInt(a.c, 10) || 0) - (parseInt(b.c, 10) || 0) : a.sh === 'early' ? -1 : 1);
        const show = sorted.slice(0, 3);
        const extra = sorted.length - show.length;
        return React.createElement("button", {
          key: date,
          disabled: !L.length,
          onClick: () => L.length && setSupPop({
            date: date,
            list: sorted
          }),
          className: 'rounded-lg border min-h-[58px] p-1 flex flex-col justify-between ' + (date === today ? 'border-violet-400 ' : L.length ? 'border-gray-700 bg-gray-900 ' : 'border-gray-800 ')
        }, React.createElement("span", {
          className: "flex flex-wrap justify-center gap-x-1 leading-tight"
        }, show.map((x, k) => React.createElement("b", {
          key: k,
          className: 'text-xs ' + (x.sh === 'early' ? 'text-amber-300' : 'text-indigo-300') + (x.p ? ' opacity-60' : '')
        }, x.c)), extra > 0 && React.createElement("span", {
          className: "text-[10px] text-gray-400"
        }, "+", extra)), React.createElement("span", {
          className: 'text-xs self-start ' + (date === today ? 'text-violet-300 font-bold' : 'text-gray-400')
        }, parseInt(date.slice(8), 10)));
      })), React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, React.createElement("span", {
        className: "text-amber-300 font-bold"
      }, "12"), " ", t.early, "\u3000", React.createElement("span", {
        className: "text-indigo-300 font-bold"
      }, "34"), " ", t.late, "\u3000", zh ? '每格最多顯示 3 個，其餘「+N」；半透明＝待簽核' : 'Tối đa 3 số mỗi ô, còn lại “+N”; mờ = chờ duyệt'), React.createElement("button", {
        onClick: () => setSupOpen(!supOpen),
        className: "w-full flex items-center justify-between min-h-[44px] text-sm font-bold text-gray-200 border-t border-gray-800 pt-1"
      }, React.createElement("span", null, zh ? '各主管本月天數' : 'Số ngày nghỉ của từng quản lý'), React.createElement("span", {
        className: "text-gray-400 text-sm"
      }, codes.length, " ", zh ? '人' : '', " ", supOpen ? '▾' : '▸')), supOpen && (codes.length ? codes.map(c => React.createElement("div", {
        key: c,
        className: "flex items-start gap-3 py-1.5 border-t border-gray-900 text-sm"
      }, React.createElement("span", {
        className: "w-12 font-bold text-white"
      }, c), React.createElement("span", {
        className: "flex-1 text-gray-300 text-[13px] leading-relaxed"
      }, byCode[c].slice().sort((a, b) => a.dt < b.dt ? -1 : 1).map(x => dd(x.dt) + '日').join('、')), React.createElement("span", {
        className: "text-xs text-gray-400 whitespace-nowrap"
      }, byCode[c].length, " ", zh ? '天' : ''))) : React.createElement("p", {
        className: "text-xs text-gray-500"
      }, zh ? '本月沒有主管排休' : 'Tháng này chưa có quản lý nghỉ')), supPop && React.createElement("div", {
        className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6",
        onClick: () => setSupPop(null)
      }, React.createElement("div", {
        className: "w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-4 space-y-2",
        onClick: e => e.stopPropagation()
      }, React.createElement("p", {
        className: "text-base font-bold text-white"
      }, parseInt(supPop.date.slice(5, 7), 10), "/", dd(supPop.date), "（", wdn(supPop.date), "）", zh ? '主管排休' : ''), supPop.list.map((x, k) => React.createElement("p", {
        key: k,
        className: "text-sm text-gray-200"
      }, React.createElement("b", {
        className: "text-white"
      }, x.c), " ", zh ? '號' : '', "\u3000", React.createElement("span", {
        className: x.sh === 'early' ? 'text-amber-300' : 'text-indigo-300'
      }, t[x.sh]), "\u3000", React.createElement("span", {
        className: "text-xs text-gray-400"
      }, x.lv || '', x.p ? zh ? '　待簽核' : '  chờ duyệt' : ''))), React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, zh ? '主管排休不佔一般名額' : 'Nghỉ của quản lý không chiếm hạn mức'), React.createElement("button", {
        onClick: () => setSupPop(null),
        className: "w-full rounded-xl bg-gray-700 text-white py-2 text-sm"
      }, zh ? '關閉' : 'Đóng'))));
    })(), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, "🗓️ ", t.rosterTitle), isV && vMode === 'mgr' && React.createElement("button", {
      onClick: () => go('lv2=pdf&month=' + month + (store ? '&store=' + encodeURIComponent(store) : '')),
      className: "text-xs border border-gray-600 text-gray-200 rounded-xl px-3 py-1.5"
    }, "📄 PDF")), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, anonView ? t.legendAnon : fmt(t.rosterHint, {
      w: lim.weekday,
      e: lim.weekend
    })), isV && React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: vMode === 'mgr',
      onClick: () => {
        setVMode('mgr');
        lsSet('lv2ViewMode', 'mgr');
        setRPg(null);
      }
    }, t.modeMgr), React.createElement(Chip, {
      on: vMode === 'teacher',
      onClick: () => {
        setVMode('teacher');
        lsSet('lv2ViewMode', 'teacher');
        setRPg(null);
      }
    }, t.modeTeacher)), isV && vMode === 'mgr' && React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("div", {
      className: "flex gap-2 flex-wrap items-center"
    }, React.createElement(Chip, {
      on: rMode === 'all',
      onClick: () => {
        setRPg(null);
        setRMode('all');
        lsSet('lv2RosterMode', 'all');
      }
    }, '全月 1~' + nd + ' 號'), React.createElement(Chip, {
      on: rMode === 'future',
      onClick: () => {
        setRPg(null);
        setRMode('future');
        lsSet('lv2RosterMode', 'future');
      }
    }, "今天起"), React.createElement("label", {
      className: "flex items-center gap-1 text-xs text-gray-300 ml-auto"
    }, React.createElement("input", {
      type: "checkbox",
      checked: showSign,
      onChange: e => {
        setShowSign(e.target.checked);
        lsSet('lv2ShowSign', e.target.checked ? '1' : '0');
      }
    }), "顯示批准主管")), React.createElement("div", {
      className: "flex gap-2 items-center"
    }, React.createElement("input", {
      value: rq,
      onChange: e => setRq(e.target.value.replace(/\D/g, '').slice(0, 6)),
      inputMode: "numeric",
      placeholder: "輸入編號，查這位休哪幾天",
      className: "flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
    }), rq && React.createElement("button", {
      onClick: () => setRq(''),
      className: "text-gray-400 text-lg px-2"
    }, "✕")), rq && (() => {
      const hit = {
        early: [],
        late: []
      };
      Object.keys(d.roster).sort().forEach(dt => ['early', 'late'].forEach(sh => {
        if (d.roster[dt][sh].some(x => String(x.c) === rq)) hit[sh].push(dt);
      }));
      const all = hit.early.length + hit.late.length;
      const past = hit.early.concat(hit.late).filter(x => x < today).length;
      const fm = l => l.map(x => parseInt(x.slice(5, 7), 10) + '/' + parseInt(x.slice(8), 10)).join('、') || '—';
      return React.createElement("div", {
        className: "rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 space-y-0.5"
      }, React.createElement("p", {
        className: "font-bold text-white"
      }, "編號 ", rq, "\u3000本月共休 ", all, " 天", all > 0 ? '（已休 ' + past + '、未休 ' + (all - past) + '）' : ''), React.createElement("p", null, React.createElement("span", {
        className: "text-[11px] rounded px-1 text-white bg-amber-500"
      }, "早"), " ", hit.early.length, " 天：", fm(hit.early)), React.createElement("p", null, React.createElement("span", {
        className: "text-[11px] rounded px-1 text-white bg-indigo-500"
      }, "晚"), " ", hit.late.length, " 天：", fm(hit.late)));
    })()), pageDates.map(date => {
      if (anonView) {
        const sl = {
          early: slotOf(date, 'early'),
          late: slotOf(date, 'late')
        };
        const cap = capOf(date);
        const open = cap > 0;
        const dw = new Date(parseInt(date.slice(0, 4), 10), parseInt(date.slice(5, 7), 10) - 1, parseInt(date.slice(8), 10)).getDay();
        const wkd = dw === 0 || dw === 6;
        const aLine = sh => {
          const x = sl[sh] || {
            o: 0,
            me: '',
            over: 0,
            sign: '',
            h: 0
          };
          const inQ = !!(x.me && !x.over && !x.h);
          const N = open ? cap : Math.max(lim.weekday, 1);
          const fill = open ? Math.min(x.o, cap - (inQ ? 1 : 0)) : 0;
          const left = open ? Math.max(0, cap - fill - (inQ ? 1 : 0)) : 0;
          const cells = [];
          for (let i = 0; i < fill; i++) cells.push(React.createElement("span", {
            key: 'f' + i,
            className: sh === 'early' ? 'text-amber-400' : 'text-indigo-400'
          }, "✦"));
          if (inQ || x.me && x.h) cells.push(React.createElement("span", {
            key: "me",
            className: "text-[13px] font-bold text-white bg-violet-600 rounded-lg px-2 leading-[22px]"
          }, x.me));
          for (let i = 0; i < (open ? left : N); i++) cells.push(React.createElement("span", {
            key: 'e' + i,
            className: "text-gray-600"
          }, "✧"));
          if (x.me && x.over) {
            cells.push(React.createElement("span", {
              key: "me2",
              className: "text-[13px] font-bold text-white bg-violet-600 rounded-lg px-2 leading-[22px] ml-0.5"
            }, x.me));
          }
          let note = null;
          if (x.me && x.over) note = React.createElement("span", {
            className: 'ml-auto text-[11px] font-bold ' + (x.sign ? 'text-amber-300' : 'text-orange-400')
          }, x.sign ? fmt(t.ovSigned, {
            c: x.sign
          }) : t.ovAsk);else if (!open) note = React.createElement("span", {
            className: "ml-auto text-[11px] text-gray-500"
          }, t.notOpen);else if (left === 0) note = React.createElement("span", {
            className: "ml-auto text-[11px] font-bold text-red-400"
          }, t.slotFull);else note = React.createElement("span", {
            className: "ml-auto text-[11px] text-gray-400"
          }, fmt(t.slotLeft, {
            n: left
          }));
          return React.createElement("div", {
            key: sh,
            className: "flex items-center gap-1 flex-wrap text-[17px] leading-[26px]"
          }, React.createElement("span", {
            className: 'text-[11px] rounded px-1 text-white leading-[18px] mr-1 ' + SH_COLOR[sh]
          }, sh === 'early' ? '早' : '晚'), cells, note);
        };
        return React.createElement("div", {
          key: date,
          className: 'border-t border-gray-800 pt-1.5 flex gap-3 ' + (date < today ? 'opacity-40' : date === today ? 'rounded-xl ring-1 ring-violet-500 bg-violet-950/30 px-1 ' : '')
        }, React.createElement("div", {
          className: "w-12 shrink-0 text-center"
        }, React.createElement("div", {
          className: "text-xs font-bold text-violet-300"
        }, parseInt(date.slice(5, 7), 10), "/", parseInt(date.slice(8), 10)), React.createElement("span", {
          className: 'inline-block text-[10px] rounded-full px-2 ' + (wkd ? 'bg-red-950 text-red-300' : 'bg-gray-800 text-gray-400')
        }, t.wk[dw]), date === today && React.createElement("div", {
          className: "text-[9px] bg-violet-600 text-white rounded px-1 inline-block mt-0.5"
        }, lang === 'vi' ? 'Nay' : '今天')), React.createElement("div", {
          className: "flex-1 min-w-0 space-y-1"
        }, aLine('early'), aLine('late')));
      }
      const ro = d.roster[date] || {
        early: [],
        late: []
      };
      const dow = new Date(parseInt(date.slice(0, 4), 10), parseInt(date.slice(5, 7), 10) - 1, parseInt(date.slice(8), 10)).getDay();
      const wkend = dow === 0 || dow === 6;
      const total = ro.early.length + ro.late.length;
      const line = s => {
        const arr = ro[s];
        if (!arr.length) return null;
        const rows = [];
        for (let i = 0; i < arr.length; i += 5) rows.push(arr.slice(i, i + 5));
        return React.createElement("div", {
          key: s,
          className: "space-y-0.5"
        }, rows.map((row, ri) => React.createElement("div", {
          key: ri,
          className: "grid items-start text-sm leading-5",
          style: {
            gridTemplateColumns: '24px repeat(5,minmax(0,1fr))'
          }
        }, React.createElement("span", null, ri === 0 ? React.createElement("span", {
          className: 'text-[11px] rounded px-1 text-white ' + SH_COLOR[s]
        }, s === 'early' ? '早' : '晚') : null), row.map((x, i) => React.createElement("span", {
          key: x.id || i,
          className: "inline-flex flex-col items-center"
        }, React.createElement("span", {
          onClick: d.isMgr && !x.m ? () => setPop({
            date: date,
            s: s,
            x: x
          }) : undefined,
          className: (x.lf ? 'text-gray-500 line-through' : x.o ? 'text-orange-400 font-bold' : x.f || x.h ? 'text-sky-300' : 'text-gray-200') + (d.isMgr && !x.m ? ' cursor-pointer underline decoration-dotted decoration-gray-600 underline-offset-2' : '')
        }, x.c, x.p ? '*' : ''), x.s && (!isV || showSign) ? React.createElement("span", {
          className: "text-[7px] leading-[8px] text-red-500 font-bold -mt-0.5"
        }, x.s) : x.f ? React.createElement("span", {
          className: "text-[7px] leading-[8px] text-sky-400 -mt-0.5"
        }, t.fixedTag) : x.h ? React.createElement("span", {
          className: "text-[7px] leading-[8px] text-sky-400 -mt-0.5"
        }, t.holTag) : x.oc ? React.createElement("span", {
          className: "text-[7px] leading-[8px] text-amber-400 -mt-0.5"
        }, x.rk || t.occTag) : null, leftTag(d.left, x.c, lang === 'vi') ? React.createElement("span", {
          className: "text-[7px] leading-[8px] text-gray-400 -mt-0.5"
        }, leftTag(d.left, x.c, lang === 'vi')) : null)))));
      };
      return React.createElement("div", {
        key: date,
        className: 'border-t border-gray-800 pt-1.5 flex gap-3 ' + (date < today ? 'opacity-40' : date === today ? 'rounded-xl ring-1 ring-violet-500 bg-violet-950/30 px-1 ' : '')
      }, React.createElement("div", {
        className: "w-12 shrink-0 text-center"
      }, React.createElement("div", {
        className: "text-xs font-bold text-violet-300"
      }, parseInt(date.slice(5, 7), 10), "/", parseInt(date.slice(8), 10)), React.createElement("span", {
        className: 'inline-block text-[10px] rounded-full px-2 ' + (wkend ? 'bg-red-950 text-red-300' : 'bg-gray-800 text-gray-400')
      }, t.wk[dow]), date === today && React.createElement("div", {
        className: "text-[9px] bg-violet-600 text-white rounded px-1 inline-block mt-0.5"
      }, lang === 'vi' ? 'Nay' : '今天'), React.createElement("div", {
        className: "text-[10px] text-gray-500 mt-0.5"
      }, React.createElement("span", null, ro.early.length, "/", ro.late.length))), React.createElement("div", {
        className: "flex-1 min-w-0 space-y-1"
      }, line('early'), line('late'), total === 0 && React.createElement("span", {
        className: "text-[11px] text-gray-600"
      }, "—")));
    }), rosterDates.length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.empty), rosterDates.length > 0 && React.createElement("div", {
      className: "flex items-center justify-center gap-4 pt-1"
    }, React.createElement("button", {
      disabled: pg <= 0,
      onClick: () => setRPg(pg - 1),
      className: 'border border-gray-600 rounded-xl px-4 py-1 text-sm ' + (pg <= 0 ? 'text-gray-700' : 'text-gray-200')
    }, "‹"), React.createElement("span", {
      className: "text-sm font-bold text-white min-w-[72px] text-center"
    }, pgLabel), React.createElement("button", {
      disabled: pg >= pgCount - 1,
      onClick: () => setRPg(pg + 1),
      className: 'border border-gray-600 rounded-xl px-4 py-1 text-sm ' + (pg >= pgCount - 1 ? 'text-gray-700' : 'text-gray-200')
    }, "›")), React.createElement("div", {
      className: "border-t border-gray-800 pt-2 space-y-1"
    }, React.createElement("div", {
      className: "flex items-center text-sm font-bold text-white"
    }, "📋 ", t.boardTitle, d.long.board.length > 0 && React.createElement("span", {
      className: "text-xs font-normal text-gray-400 ml-2"
    }, lang === 'vi' ? d.long.board.length : '共 ' + d.long.board.length + ' 人'), d.long.board.length > 1 && React.createElement("button", {
      onClick: () => setLgOpen(!lgOpen),
      className: "ml-auto text-xs text-violet-300"
    }, lgOpen ? lang === 'vi' ? 'Thu gọn ▲' : '收合 ▲' : lang === 'vi' ? 'Xem tất cả ▼' : '展開全部 ▼')), d.long.board.length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.boardNone), (lgOpen ? sortBoard(d.long.board) : sortBoard(d.long.board).slice(0, 1)).map(x => React.createElement("p", {
      key: x.id,
      className: "text-sm text-gray-200 border-b border-gray-900 py-0.5"
    }, React.createElement("span", {
      className: "font-bold text-violet-300"
    }, x.code), lang === 'vi' ? '' : ' 號', "\u3000", React.createElement("span", {
      className: 'text-xs rounded-full px-2 py-0.5 text-white ' + (KIND_CLS[x.kind] || 'bg-gray-600')
    }, kindName(x.kind, t)), x.kind !== 'leave' && x.kind !== 'rest' && x.kind !== 'part' && x.kind !== 'note' ? React.createElement("span", {
      className: "text-xs text-gray-300"
    }, "\u3000", longText(x, t)) : null, x.kind !== 'fixed' && x.kind !== 'alt' && x.kind !== 'holiday' || x.end ? React.createElement("span", null, "\u3000", periodText(x, t)) : null, x.reason ? React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "\u3000", x.reason) : null, d.staff && (x.kind === 'part' || x.kind === 'note') ? React.createElement("span", {
      className: "text-[10px] text-gray-600"
    }, "\u3000", t.staffOnly) : null, x.occupy === '1' ? React.createElement("span", {
      className: "text-[10px] rounded-full px-1.5 py-0.5 bg-amber-700 text-white ml-1"
    }, t.occYes) : null, d.staff && (x.kind === 'leave' || x.kind === 'fixed' || x.kind === 'alt') ? React.createElement("button", {
      onClick: () => {
        const on = x.occupy === '1' ? '' : '1';
        if (on && x.kind === 'leave' && !x.shift) {
          const v = window.prompt(t.occPickShift + '：early / late', 'early');
          if (v !== 'early' && v !== 'late') return;
          longAct('lv2LongOccupy', {
            id: x.id,
            occupy: '1',
            shift: v
          });
        } else longAct('lv2LongOccupy', {
          id: x.id,
          occupy: on
        });
      },
      className: "text-[11px] text-sky-400 ml-2 underline"
    }, x.occupy === '1' ? t.occNo : t.occYes) : null, d.isMgr ? React.createElement("button", {
      onClick: () => longAct('lv2LongCancel', {
        id: x.id
      }, t.delAsk),
      className: "text-gray-500 text-xs ml-2"
    }, "✕") : null)), !lgOpen && d.long.board.length > 1 && React.createElement("button", {
      onClick: () => setLgOpen(true),
      className: "text-[11px] text-gray-500"
    }, lang === 'vi' ? 'Bấm để xem ' + (d.long.board.length - 1) + ' mục còn lại' : '點此展開其餘 ' + (d.long.board.length - 1) + ' 筆'))), (d.isTeacher || d.staff) && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, t.longTitle), !lf && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.longHint), !lf && React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: () => setLf({
        kind: 'leave',
        start: '',
        end: '',
        days: [],
        alt: 'odd',
        quota: '',
        shift: d.me && d.me.shift || 'early',
        code: '',
        reason: '',
        occupy: ''
      })
    }, t.longBtn), lf && React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, (d.staff ? ['leave', 'rest', 'fixed', 'alt', 'holiday', 'part', 'note'] : ['leave', 'rest', 'fixed', 'alt', 'holiday']).map(k => React.createElement(Chip, {
      key: k,
      on: lf.kind === k,
      onClick: () => setLf({
        ...lf,
        kind: k,
        days: [],
        quota: ''
      })
    }, kindName(k, t)))), d.staff && React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.forCode, lf.kind === 'part' || lf.kind === 'note' ? ' *' : ''), React.createElement("input", {
      value: lf.code,
      inputMode: "numeric",
      onChange: e => setLf({
        ...lf,
        code: e.target.value.replace(/\D/g, '').slice(0, 4)
      }),
      placeholder: d.isTeacher && lf.kind !== 'part' && lf.kind !== 'note' ? '（留空＝我自己）' : '例：139',
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    })), (lf.kind === 'fixed' || lf.kind === 'alt' || lf.kind === 'holiday' || (lf.kind === 'leave' || lf.kind === 'rest') && lf.occupy === '1') && React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.shiftL), React.createElement("div", {
      className: "flex gap-2"
    }, ['early', 'late'].map(sh => React.createElement(Chip, {
      key: sh,
      on: lf.shift === sh,
      onClick: () => setLf({
        ...lf,
        shift: sh
      })
    }, t[sh])))), lf.kind === 'fixed' && React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.kFixed), React.createElement("div", {
      className: "flex gap-1 flex-wrap"
    }, t.wk.map((w, i) => React.createElement(Chip, {
      key: i,
      on: lf.days.indexOf(String(i)) >= 0,
      onClick: () => setLf({
        ...lf,
        days: lf.days.indexOf(String(i)) >= 0 ? lf.days.filter(x => x !== String(i)) : lf.days.concat([String(i)])
      })
    }, w)))), lf.kind === 'alt' && React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: lf.alt === 'odd',
      onClick: () => setLf({
        ...lf,
        alt: 'odd'
      })
    }, t.oddD), React.createElement(Chip, {
      on: lf.alt === 'even',
      onClick: () => setLf({
        ...lf,
        alt: 'even'
      })
    }, t.evenD)), lf.kind === 'holiday' && React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.holDays), React.createElement("div", {
      className: "flex gap-2"
    }, [['6', t.wk[6]], ['0', t.wk[0]]].map(([v, n]) => React.createElement(Chip, {
      key: v,
      on: lf.days.indexOf(v) >= 0,
      onClick: () => {
        const nd = lf.days.indexOf(v) >= 0 ? lf.days.filter(x => x !== v) : lf.days.concat([v]);
        setLf({
          ...lf,
          days: nd,
          quota: ''
        });
      }
    }, n)))), lf.days.length > 0 && React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.holQuota), React.createElement("div", {
      className: "flex gap-2"
    }, Array.from({
      length: lf.days.length
    }).map((_, i) => React.createElement(Chip, {
      key: i,
      on: String(lf.quota || lf.days.length) === String(i + 1),
      onClick: () => setLf({
        ...lf,
        quota: String(i + 1)
      })
    }, i + 1))))), d.staff && (lf.kind === 'leave' || lf.kind === 'rest' || lf.kind === 'fixed' || lf.kind === 'alt') && React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.occL), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: lf.occupy !== '1',
      onClick: () => setLf({
        ...lf,
        occupy: ''
      })
    }, t.occNo), React.createElement(Chip, {
      on: lf.occupy === '1',
      onClick: () => setLf({
        ...lf,
        occupy: '1'
      })
    }, t.occYes)), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, t.occHint)), React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, t.startD, lf.kind === 'part' || lf.kind === 'note' || d.staff ? '（' + (lang === 'vi' ? 'bỏ trống = hôm nay' : '留空＝今天') + '）' : ''), React.createElement("input", {
      type: "date",
      min: d.staff ? undefined : today,
      value: lf.start,
      onChange: e => setLf({
        ...lf,
        start: e.target.value
      }),
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    })), React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, lf.kind === 'leave' ? t.endD : t.endOpt), lf.kind === 'rest' ? React.createElement("p", {
      className: "text-xs text-orange-300"
    }, lang === 'vi' ? 'Không có ngày kết thúc' : '長休＝沒有結束日（回來後再補結束日）') : React.createElement("input", {
      type: "date",
      min: lf.start || today,
      value: lf.end,
      onChange: e => setLf({
        ...lf,
        end: e.target.value
      }),
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    })), React.createElement("input", {
      value: lf.reason,
      maxLength: 100,
      onChange: e => setLf({
        ...lf,
        reason: e.target.value
      }),
      placeholder: t.reason,
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: () => setLf(null)
    }, lang === 'vi' ? 'Hủy' : '取消'), React.createElement(Btn, {
      loading: busy,
      onClick: longSend
    }, t.sendLong))), d.long.mine.map(x => React.createElement("div", {
      key: x.id,
      className: "rounded-xl border border-gray-700 p-2 space-y-1"
    }, React.createElement("p", {
      className: "text-sm text-white"
    }, x.kind === 'leave' || x.kind === 'rest' ? longText(x, t) : longText(x, t), "\u3000", periodText(x, t)), React.createElement("p", {
      className: "text-xs"
    }, React.createElement("span", {
      className: x.status === 'approved' ? 'text-emerald-400' : 'text-amber-300'
    }, t['s_' + x.status] || x.status), x.reason ? React.createElement("span", {
      className: "text-gray-500"
    }, "\u3000", x.reason) : null), (d.isMgr || !d.staff) && React.createElement("div", {
      className: "flex gap-2"
    }, !x.end && React.createElement("button", {
      onClick: () => {
        const v = window.prompt(t.setEndAsk, '');
        if (v) longAct('lv2LongEnd', {
          id: x.id,
          end: v.trim()
        });
      },
      className: "px-3 py-1.5 rounded-xl text-xs border border-gray-600 text-gray-200"
    }, t.setEnd), React.createElement("button", {
      onClick: () => longAct('lv2LongCancel', {
        id: x.id
      }, t.cancelLong + '?'),
      className: "px-3 py-1.5 rounded-xl text-xs border border-gray-600 text-gray-300"
    }, t.cancelLong))))), d.canLeave && d.seqMode === 'paper' && React.createElement("p", {
      className: "text-xs text-gray-400"
    }, t.seqMine, "：", d.mySeq ? '#' + d.mySeq : t.seqWait), d.isMgr && d.state !== 'past' && React.createElement(Card, {
      className: "space-y-2",
      id: "lv2-adjust"
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, "📋 ", t.adjTitle), (() => {
      const ids = adjSorted(adjShift).filter(x => !x.signBy && !x.notifiedAt).map(x => x.id);
      return ids.length > 0 ? React.createElement("button", {
        disabled: busy || !adjOk,
        onClick: () => longAct('lv2Notify', {
          ids: JSON.stringify(ids)
        }, t.notifyAsk),
        className: 'text-xs rounded-xl px-3 py-1.5 ' + (adjOk ? 'bg-sky-700 text-white' : 'bg-gray-800 text-gray-500')
      }, t.notifyAll, "（", ids.length, "）") : null;
    })()), d.slip && d.slip.p1 && (() => {
      const ids = adjSorted(adjShift).filter(x => !x.signBy).map(x => x.id);
      return ids.length > 0 ? React.createElement("div", {
        className: "text-right"
      }, React.createElement("button", {
        disabled: busy || !adjOk,
        onClick: () => longAct('lv2PaperNotify', {
          ids: JSON.stringify(ids)
        }, '推播「請交小白單」給這 ' + ids.length + ' 筆申請的同仁？'),
        className: 'text-xs rounded-xl px-3 py-1.5 ' + (adjOk ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-500')
      }, "全部通知交小白單（", ids.length, "）")) : null;
    })(), React.createElement("div", {
      className: "flex gap-2"
    }, ['early', 'late'].map(s => React.createElement(Chip, {
      key: s,
      on: adjShift === s,
      onClick: () => setAdjShift(s)
    }, t[s], "（", adjSorted(s).filter(x => !x.signBy && !x.notifiedAt).length, "／", d.adjust[s].length, "）"))), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, lang === 'vi' ? 'Số trong ngoặc: chưa xử lý／tổng cần điều chỉnh' : '括號內：未處理／全部應調整筆數（已通知或已簽核算已處理）'), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.adjHint), !adjOk && React.createElement("p", {
      className: "text-[11px] text-amber-300"
    }, lang === 'vi' ? 'Bạn không phải người phụ trách ca này nên chỉ xem được; chỉ khi được chỉ định đại diện mới thao tác được.' : '你不是這個班別的調整表負責人，只能查看；被設為代理人的期間才可通知／簽核。'), React.createElement("label", {
      className: "flex items-center gap-2 text-[12px] text-gray-300"
    }, React.createElement("input", {
      type: "checkbox",
      checked: hideSg,
      onChange: e => {
        setHideSg(e.target.checked);
        lsSet('lv2HideSigned', e.target.checked ? '1' : '0');
      },
      className: "w-4 h-4 accent-violet-600"
    }), React.createElement("span", null, lang === 'vi' ? 'Ẩn đơn đã ký (chỉ áp dụng cho bạn)' : '隱藏已簽核的單（只對我自己有效）')), d.adjust[adjShift].length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.adjNone), (() => {
      const groups = [];
      adjSorted(adjShift).filter(x => !(hideSg && x.signBy)).forEach(x => {
        let g = groups[groups.length - 1];
        if (!g || g.date !== x.date) {
          g = {
            date: x.date,
            cap: x.cap,
            list: []
          };
          groups.push(g);
        }
        g.list.push(x);
      });
      const allOpen = groups.length > 0 && groups.every(g => adjOpen[adjShift + g.date]);
      return React.createElement("div", {
        key: 'adj-' + adjShift,
        className: "space-y-1.5"
      }, groups.length > 1 && React.createElement("div", {
        className: "text-right"
      }, React.createElement("button", {
        onClick: () => {
          const o = {
            ...adjOpen
          };
          groups.forEach(g => {
            o[adjShift + g.date] = !allOpen;
          });
          setAdjOpen(o);
        },
        className: "text-[11px] text-violet-300"
      }, allOpen ? t.adjNone2 : t.adjAll)), groups.map((g, gi) => {
        const k = adjShift + g.date;
        const open = !!adjOpen[k];
        const done = g.list.filter(x => x.signBy || x.notifiedAt).length;
        const todo = g.list.length - done;
        const dow = new Date(parseInt(g.date.slice(0, 4), 10), parseInt(g.date.slice(5, 7), 10) - 1, parseInt(g.date.slice(8), 10)).getDay();
        return React.createElement("div", {
          key: adjShift + '|' + gi + '|' + g.date,
          className: "rounded-xl border border-gray-800"
        }, React.createElement("button", {
          onClick: () => setAdjOpen({
            ...adjOpen,
            [k]: !open
          }),
          className: "w-full flex items-center gap-2 px-3 py-2 text-left"
        }, React.createElement("span", {
          className: "text-sm font-bold text-violet-300"
        }, parseInt(g.date.slice(5, 7), 10), "/", parseInt(g.date.slice(8), 10)), React.createElement("span", {
          className: "text-[11px] text-gray-400"
        }, t.wk[dow], "\u3000", lang === 'vi' ? 'Hạn mức' : '名額', " ", g.cap), React.createElement("span", {
          className: "ml-auto text-[11px]"
        }, React.createElement("span", {
          className: todo > 0 ? 'text-orange-400 font-bold' : 'text-gray-500'
        }, t.adjTodo, " ", todo), React.createElement("span", {
          className: "text-gray-500"
        }, " / ", t.adjDone, " ", done)), React.createElement("span", {
          className: "text-gray-500 text-xs"
        }, open ? '▲' : '▼')), open && React.createElement("div", {
          className: "px-2 pb-2 space-y-2"
        }, g.list.map(x => React.createElement("div", {
          key: x.id,
          className: 'rounded-xl border p-2 space-y-2 ' + (x.signBy ? 'border-emerald-900 bg-emerald-950/30' : 'border-gray-700')
        }, React.createElement("div", {
          className: "flex items-center gap-3"
        }, React.createElement("span", {
          className: "inline-flex flex-col items-center min-w-[40px]"
        }, React.createElement("span", {
          className: 'font-bold ' + (x.signBy ? 'text-gray-200' : 'text-orange-400')
        }, x.code), x.signBy ? React.createElement("span", {
          className: "text-[7px] leading-[8px] text-red-500 font-bold"
        }, x.signBy) : null), React.createElement("span", {
          className: "text-[11px] text-gray-400 flex-1"
        }, fmt(t.pos, {
          n: x.pos,
          k: x.over
        }), React.createElement("br", null), (x.submittedAt || '').slice(5, 16)), x.signBy ? React.createElement("span", {
          className: "text-[11px] rounded-full bg-emerald-700 text-white px-2 py-0.5"
        }, fmt(t.signedBy, {
          c: x.signBy
        })) : x.notifiedAt ? React.createElement("span", {
          className: "text-[11px] rounded-full bg-sky-800 text-white px-2 py-0.5"
        }, fmt(t.notified, {
          t: x.notifiedAt.slice(5, 16)
        })) : null), React.createElement("div", {
          className: "flex gap-2"
        }, !x.signBy && React.createElement("button", {
          disabled: busy || !adjOk,
          onClick: () => longAct('lv2Notify', {
            ids: JSON.stringify([x.id])
          }),
          className: 'flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ' + (adjOk ? 'bg-sky-700 text-white' : 'bg-gray-800 text-gray-500')
        }, x.notifiedAt ? t.notifyAgain : t.notify), !x.signBy && d.slip && d.slip.p1 && React.createElement("button", {
          disabled: busy || !adjOk,
          onClick: () => longAct('lv2PaperNotify', {
            ids: JSON.stringify([x.id])
          }, '推播「請交小白單」給 ' + x.code + ' 號？'),
          className: 'flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ' + (adjOk ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-500')
        }, "通知交小白單"), !x.signBy && React.createElement("button", {
          disabled: busy || !adjOk,
          onClick: () => longAct('lv2Sign', {
            id: x.id,
            on: true
          }, t.signAsk),
          className: 'flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ' + (adjOk ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-500')
        }, t.sign), x.signBy && React.createElement("button", {
          disabled: busy || !adjOk,
          onClick: () => {
            if (armed === x.id) {
              setArmed('');
              longAct('lv2Sign', {
                id: x.id,
                on: false
              });
            } else {
              setArmed(x.id);
              setTimeout(() => setArmed(a => a === x.id ? '' : a), 4000);
            }
          },
          className: 'flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ' + (armed === x.id ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-200')
        }, armed === x.id ? t.unsignSure : t.unsign))))));
      }));
    })()), d.staff && d.log && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("button", {
      onClick: () => setLogOpen(!logOpen),
      className: "w-full flex items-center justify-between"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, t.logTitle, "（", d.log.length, "）"), React.createElement("span", {
      className: "text-xs text-violet-300"
    }, logOpen ? lang === 'vi' ? 'Thu gọn ▲' : '收合 ▲' : lang === 'vi' ? 'Mở ▼' : '展開 ▼')), logOpen && d.log.length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.logNone), logOpen && d.log.map((x, i) => React.createElement("p", {
      key: i,
      className: "text-xs text-gray-300 border-b border-gray-900 py-1"
    }, React.createElement("span", {
      className: "text-gray-500"
    }, String(x.t).slice(5, 16).replace('-', '/')), "\u3000", React.createElement("span", {
      className: "font-bold text-violet-300"
    }, x.c), lang === 'vi' ? '' : ' 號', "\u3000", React.createElement("span", {
      className: 'rounded-full px-1.5 py-0.5 text-white ' + (x.a === 'approve' ? 'bg-emerald-700' : x.a === 'reject' ? 'bg-gray-600' : 'bg-rose-700')
    }, x.a === 'approve' ? t.logApprove : x.a === 'reject' ? t.logReject : t.logCancel), "\u3000", x.k === 'day' ? React.createElement("span", null, x.d.slice(5).replace('-', '/'), " ", t[x.sh]) : React.createElement("span", null, kindName(x.kind, t), x.kind !== 'leave' && x.kind !== 'rest' ? ' ' + longText(x, t) : '', " ", x.start.slice(5).replace('-', '/'), "~", x.end ? x.end.slice(5).replace('-', '/') : t.pendingEnd), React.createElement("span", {
      className: "text-gray-500"
    }, "\u3000", t.logBy, "：", x.by === '本人取消' || x.by === '本人' ? t.logSelf : x.by)))), (d.canSeq || d.isTeacher) && d.state !== 'past' && d.seqMode === 'paper' && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("div", {
      className: "flex items-center"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, "🔢 ", t.seqTitle), React.createElement("button", {
      onClick: () => setSeqOpen(!seqOpen),
      className: "ml-auto text-xs text-violet-300"
    }, seqOpen ? t.seqToggleClose : t.seqToggleOpen)), seqOpen && React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.seqHint), seqOpen && React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("div", {
      className: "flex gap-2 items-center flex-wrap"
    }, React.createElement(Chip, {
      on: seqSort === 'order',
      onClick: () => setSeqSort('order')
    }, t.seqByOrder), React.createElement(Chip, {
      on: seqSort === 'code',
      onClick: () => setSeqSort('code')
    }, t.seqByCode), React.createElement("input", {
      value: seqQ,
      onChange: e => setSeqQ(e.target.value.replace(/\D/g, '').slice(0, 6)),
      inputMode: "numeric",
      placeholder: t.seqSearch,
      className: "flex-1 min-w-[90px] rounded-lg bg-gray-900 border border-gray-700 px-2 py-1.5 text-sm text-white"
    }), seqQ && React.createElement("button", {
      onClick: () => setSeqQ(''),
      className: "text-gray-400 px-1"
    }, "✕")), d.seqList.length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.empty), seqView.map(x => React.createElement("div", {
      key: x.userId,
      className: "flex items-center gap-2"
    }, React.createElement("span", {
      className: "w-12 font-bold text-gray-200"
    }, x.code), React.createElement("span", {
      className: "text-xs text-gray-500 flex-1"
    }, d.canSeq ? fmt(t.seqDays, {
      n: x.n
    }) : ''), React.createElement("input", {
      value: seqIn[x.userId] !== undefined ? seqIn[x.userId] : String(x.seq),
      readOnly: !d.canSeq,
      disabled: !d.canSeq,
      inputMode: "numeric",
      onChange: e => setSeqIn({
        ...seqIn,
        [x.userId]: e.target.value.replace(/\D/g, '').slice(0, 4)
      }),
      className: 'w-20 text-center rounded-lg border py-1.5 ' + (d.canSeq ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-900 border-gray-800 text-gray-600')
    }), d.canSeq && React.createElement("button", {
      disabled: busy,
      onClick: () => longAct('lv2SeqSet', {
        month: month,
        userId: x.userId,
        seq: seqIn[x.userId] !== undefined ? seqIn[x.userId] : String(x.seq)
      }),
      className: "px-3 py-1.5 rounded-lg text-xs bg-gray-700 text-white disabled:opacity-50"
    }, t.seqSave))))), d.isMgr && (() => {
      const cv = cf || {
        wd: String(lim.weekday),
        we: String(lim.weekend),
        mode: d.seqMode,
        groups: d.groups || [],
        paper: d.slip || {
          p1: false,
          p2: false
        },
        duty: {
          early: dArr((d.duty || {}).early),
          late: dArr((d.duty || {}).late)
        }
      };
      const grs = cv.groups || [];
      const pap = cv.paper || {
        p1: false,
        p2: false
      };
      const inp = "w-20 text-center rounded-lg bg-gray-800 border border-gray-700 py-1.5 text-white";
      return React.createElement(Card, {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "text-sm font-bold text-white"
      }, "⚙ ", fmt(t.setTitle, {
        s: d.store
      })), React.createElement("div", {
        className: "flex items-center gap-2"
      }, React.createElement("span", {
        className: "text-sm text-gray-300 flex-1"
      }, t.wdQ), React.createElement("input", {
        value: cv.wd,
        inputMode: "numeric",
        onChange: e => setCf({
          ...cv,
          wd: e.target.value.replace(/\D/g, '').slice(0, 2)
        }),
        className: inp
      })), React.createElement("div", {
        className: "flex items-center gap-2"
      }, React.createElement("span", {
        className: "text-sm text-gray-300 flex-1"
      }, t.weQ), React.createElement("input", {
        value: cv.we,
        inputMode: "numeric",
        onChange: e => setCf({
          ...cv,
          we: e.target.value.replace(/\D/g, '').slice(0, 2)
        }),
        className: inp
      })), React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, t.seqModeL), React.createElement("div", {
        className: "flex gap-2"
      }, React.createElement(Chip, {
        on: cv.mode === 'paper',
        onClick: () => setCf({
          ...cv,
          mode: 'paper'
        })
      }, t.seqPaper), React.createElement(Chip, {
        on: cv.mode === 'time',
        onClick: () => setCf({
          ...cv,
          mode: 'time'
        })
      }, t.seqTime))), React.createElement("div", {
        className: "space-y-1.5"
      }, React.createElement("p", {
        className: "text-xs text-gray-400"
      }, t.grpTitle), React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, t.grpHint), grs.map((g, gi) => React.createElement("div", {
        key: gi,
        className: "flex items-center gap-2 text-sm text-gray-200"
      }, React.createElement("span", {
        className: "flex-1"
      }, g.join('、')), React.createElement("button", {
        onClick: () => setCf({
          ...cv,
          groups: grs.filter((_, i) => i !== gi)
        }),
        className: "text-gray-500"
      }, "✕"))), React.createElement("div", {
        className: "flex flex-wrap items-center gap-1.5"
      }, gDraft.map((c, i) => React.createElement("span", {
        key: i,
        className: "inline-flex items-center gap-1 rounded-full bg-violet-900 text-violet-100 text-xs px-2 py-0.5"
      }, c, React.createElement("button", {
        onClick: () => setGDraft(gDraft.filter((_, j) => j !== i))
      }, "✕"))), React.createElement("form", {
        className: "inline-flex items-center gap-1.5",
        onSubmit: e => {
          e.preventDefault();
          if (gCode) {
            if (gDraft.indexOf(gCode) < 0) setGDraft(gDraft.concat([gCode]));
            setGCode('');
            setGErr('');
          }
        }
      }, React.createElement("input", {
        value: gCode,
        inputMode: "numeric",
        enterKeyHint: "done",
        onChange: e => {
          setGCode(e.target.value.replace(/\D/g, '').slice(0, 4));
          setGErr('');
        },
        placeholder: t.grpPh,
        className: "w-28 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1 text-sm text-white"
      }), React.createElement("button", {
        type: "submit",
        className: "px-2.5 py-1 rounded-lg text-xs bg-gray-700 text-white"
      }, "＋")), React.createElement("button", {
        onClick: () => {
          let a = gDraft.slice();
          if (gCode && a.indexOf(gCode) < 0) a.push(gCode);
          if (a.length < 2) {
            setGErr(t.grpMin);
            return;
          }
          setGErr('');
          setCf({
            ...cv,
            groups: grs.concat([a])
          });
          setGDraft([]);
          setGCode('');
        },
        className: "px-3 py-1 rounded-lg text-xs bg-violet-700 text-white"
      }, t.grpAdd)), gErr && React.createElement("p", {
        className: "text-xs text-red-400"
      }, gErr)), (d.dutyCands || []).length > 0 || d.canDuty ? React.createElement("div", {
        className: "space-y-1.5"
      }, React.createElement("p", {
        className: "text-xs text-gray-400"
      }, lang === 'vi' ? 'Người phụ trách bảng điều chỉnh nghỉ phép (Phó quản lý thực tập)' : '休假調整表負責人（實習副理）'), React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, lang === 'vi' ? 'Mỗi ca có thể chọn nhiều người; ngày 13 hằng tháng bảng cần điều chỉnh sẽ gửi cho tất cả. Chưa chọn thì gửi theo cài đặt cũ/toàn bộ quản lý cửa hàng.' : '早班、晚班各可指定多位；每月 13 日休假調整表會推播給所有負責人。沒指定就依原設定（人事差勤欄位）或發給該店所有主管。'), ['early', 'late'].map(sh => {
        const sel = dArr((cv.duty || {})[sh]);
        const rest = (d.dutyCands || []).filter(c => sel.indexOf(c.id) < 0);
        const nameOf = id => {
          const c = (d.dutyCands || []).filter(x => x.id === id)[0];
          if (!c) return id;
          const m = String(c.label || '').match(/(\d+)\s*號/);
          return m ? m[1] + '號' : c.label;
        };
        return React.createElement("div", {
          key: sh,
          className: "flex items-start gap-2"
        }, React.createElement("span", {
          className: "w-12 text-sm text-gray-300 pt-2"
        }, t[sh]), React.createElement("div", {
          className: "flex-1 flex flex-wrap items-center gap-1.5"
        }, sel.map(id => React.createElement("span", {
          key: id,
          className: "inline-flex items-center gap-1.5 min-h-[36px] rounded-full bg-indigo-900 text-indigo-100 text-[13px] pl-3 pr-2"
        }, nameOf(id), d.canDuty && React.createElement("button", {
          "aria-label": "remove",
          className: "w-6 h-6 text-indigo-300",
          onClick: () => setCf({
            ...cv,
            duty: {
              ...(cv.duty || {}),
              [sh]: sel.filter(x => x !== id)
            }
          })
        }, "✕"))), d.canDuty && rest.length > 0 && React.createElement("select", {
          value: "",
          onChange: e => {
            if (e.target.value) setCf({
              ...cv,
              duty: {
                ...(cv.duty || {}),
                [sh]: sel.concat([e.target.value])
              }
            });
          },
          className: "min-h-[36px] rounded-full bg-gray-800 border border-dashed border-gray-600 px-3 text-[13px] text-gray-300"
        }, React.createElement("option", {
          value: ""
        }, lang === 'vi' ? '＋ Thêm' : '＋ 新增'), rest.map(c => React.createElement("option", {
          key: c.id,
          value: c.id
        }, nameOf(c.id)))), !sel.length && React.createElement("span", {
          className: "text-[13px] text-gray-500 pt-2"
        }, lang === 'vi' ? '(Chưa chỉ định)' : '（未指定）')));
      }), !d.canDuty && React.createElement("p", {
        className: "text-[11px] text-amber-300"
      }, lang === 'vi' ? 'Chỉ quản lý cửa hàng mới được chỉ định.' : '只有該店經理可以指定。')) : null, React.createElement("div", {
        className: "space-y-1.5 pt-1 border-t border-gray-800"
      }, React.createElement("p", {
        className: "text-xs text-gray-400"
      }, lang === 'vi' ? 'Giai đoạn thử nghiệm (nhắc khi gửi đơn nghỉ)' : '測試階段（勾選後，送出休假時會提醒）'), [['p1', '10號00:00~12號23:59 開放排休時，除線上申請外，仍需依公司規定填寫小白單並由本人親自張貼於櫃台指定地點，測試期間，將以小白單上的順序為主。'], ['p2', '改休 / 臨時休 / 增加休假 / 取消休假，線上申請後，仍請依公司規定寫小白單給主管說明原因。']].map(o => React.createElement("label", {
        key: o[0],
        className: "flex items-start gap-2 text-[13px] text-gray-200 leading-snug"
      }, React.createElement("input", {
        type: "checkbox",
        checked: !!pap[o[0]],
        onChange: e => setCf({
          ...cv,
          paper: {
            ...pap,
            [o[0]]: e.target.checked
          }
        }),
        className: "mt-1 w-4 h-4 accent-violet-600"
      }), React.createElement("span", null, o[1])))), React.createElement(Btn, {
        loading: busy,
        onClick: () => run(async () => {
          const r = await api('lv2SettingsSet', Object.assign({
            store: d.store,
            wd: cv.wd,
            we: cv.we,
            seqMode: cv.mode,
            groups: JSON.stringify(grs),
            paper: JSON.stringify({
              p1: !!pap.p1,
              p2: !!pap.p2
            })
          }, d.canDuty ? {
            duty: JSON.stringify({
              early: dArr((cv.duty || {}).early),
              late: dArr((cv.duty || {}).late)
            })
          } : {}));
          if (r && r.ok) {
            setMsg(t.setOk);
            setCf(null);
            reloadR();
          } else setErr(r && r.error || t.fail);
        })
      }, t.setSave));
    })(), d.isMgr && (() => {
      const vi = lang === 'vi';
      const off = !!d.revOff;
      const isAd = !!d.adminFlow;
      return React.createElement(Card, {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "font-bold text-white"
      }, vi ? '🔔 Thông báo LINE duyệt nghỉ' : '🔔 審核LINE通知'), React.createElement("p", {
        className: "text-xs text-gray-400 leading-snug"
      }, off ? vi ? 'Đang TẮT: quản lý sẽ không nhận thông báo LINE khi có người gửi đơn nghỉ cần duyệt.' : '目前已關閉：有人送出休假、需要審核時，不會推播 LINE 通知主管。' : vi ? 'Đang BẬT: khi có người gửi đơn nghỉ cần duyệt, quản lý nhận thông báo LINE.' : '目前開啟：有人送出休假、需要審核時，會推播 LINE 通知主管。'), off && React.createElement(Btn, {
        loading: busy,
        onClick: () => run(async () => {
          const r = await api('lv2RevNotifySet', {
            store: d.store,
            off: '0'
          });
          if (r && r.ok) {
            setMsg(t.setOk);
            reloadR();
          } else setErr(r && r.error || t.fail);
        })
      }, vi ? 'Bật thông báo LINE duyệt nghỉ' : '打開審核LINE通知'), !off && isAd && (rvSure ? React.createElement("div", {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "text-sm text-amber-300"
      }, vi ? 'Sẽ tắt thông báo duyệt nghỉ và nhắn cho các quản lý của cửa hàng. Xác nhận?' : '確定要停用主管的審核通知？會同時推播通知本店主管「已關閉」。'), React.createElement("div", {
        className: "flex gap-2"
      }, React.createElement(Btn, {
        loading: busy,
        color: "bg-red-700 text-white",
        onClick: () => run(async () => {
          const r = await api('lv2RevNotifySet', {
            store: d.store,
            off: '1'
          });
          setRvSure(false);
          if (r && r.ok) {
            setMsg(t.setOk);
            reloadR();
          } else setErr(r && r.error || t.fail);
        })
      }, vi ? 'Xác nhận tắt' : '確定停用'), React.createElement(Btn, {
        color: "bg-gray-700 text-white",
        onClick: () => setRvSure(false)
      }, vi ? 'Hủy' : '取消'))) : React.createElement(Btn, {
        color: "bg-gray-700 text-white",
        onClick: () => setRvSure(true)
      }, vi ? 'Tắt thông báo duyệt nghỉ của quản lý' : '停用主管的審核通知')));
    })(), d.isMgr && d.adminFlow && (() => {
      const vi = lang === 'vi';
      const av = af || d.adminFlow;
      const rows = [['leave', vi ? 'Xin nghỉ' : '請休（新增休假）'], ['change', vi ? 'Đổi ngày nghỉ' : '改休（取消舊的＋改新日期）'], ['cancel', vi ? 'Hủy nghỉ' : '取消休假']];
      return React.createElement(Card, {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "font-bold text-white"
      }, vi ? '🛡️ Quản trị viên' : '🛡️ 管理者'), React.createElement("div", {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "text-xs text-gray-400 leading-snug"
      }, (vi ? 'Cửa hàng ' : '本店（') + d.store + (vi ? ': ' : '）'), vi ? 'Chọn thao tác nghỉ của quản trị viên cần cấp trên ký duyệt (mặc định tự động có hiệu lực).' : '管理者本人的休假變動，勾選的項目會送其他主管簽核（未勾選＝照舊直接生效）。管理者不能簽核自己的假。'), rows.map(o => React.createElement("label", {
        key: o[0],
        className: "flex items-center gap-2 text-[13px] text-gray-200"
      }, React.createElement("input", {
        type: "checkbox",
        checked: !!av[o[0]],
        onChange: e => setAf({
          ...av,
          [o[0]]: e.target.checked
        }),
        className: "w-4 h-4 accent-violet-600"
      }), React.createElement("span", null, o[1]))), React.createElement(Btn, {
        loading: busy,
        onClick: () => run(async () => {
          const r = await api('lv2SettingsSet', {
            store: d.store,
            wd: (cf || {
              wd: String(lim.weekday)
            }).wd,
            we: (cf || {
              we: String(lim.weekend)
            }).we,
            seqMode: d.seqMode,
            adminFlow: JSON.stringify({
              leave: !!av.leave,
              change: !!av.change,
              cancel: !!av.cancel
            })
          });
          if (r && r.ok) {
            setMsg(t.setOk);
            setAf(null);
            reloadR();
          } else setErr(r && r.error || t.fail);
        })
      }, t.setSave)), (() => {
        const cur = apSel || d.apprMode || 'window';
        const OP = [['window', vi ? 'Quá thời gian không cần duyệt thì cần duyệt (mặc định)' : '超過免審批期後需審批（預設）', vi ? 'Trong thời gian đăng ký gửi là được nghỉ; vượt mức hoặc quá hạn cần quản lý duyệt.' : '登記期間內送出直接生效；超休或過了期間要主管審批。'], ['none', vi ? 'Không cần duyệt, gửi là được nghỉ' : '均免審批，送出即可排休', vi ? 'Mọi đơn đều có hiệu lực ngay, kể cả vượt số ngày/tháng; hủy cũng có hiệu lực ngay.' : '所有休假送出就生效，含超過每月天數；取消也立即生效。'], ['all', vi ? 'Tất cả đều cần duyệt' : '均需審批', vi ? 'Mọi đơn nghỉ và hủy nghỉ đều phải chờ quản lý duyệt.' : '所有休假與取消，都要等主管審批後才生效。']];
        return React.createElement("div", {
          className: "space-y-2 pt-3 border-t border-gray-700"
        }, React.createElement("p", {
          className: "font-bold text-white text-[14px]"
        }, vi ? 'Cách duyệt đơn nghỉ của nhân viên' : '員工休假審批方式'), OP.map(o => React.createElement("label", {
          key: o[0],
          className: 'flex items-start gap-2 rounded-xl border px-3 py-2.5 ' + (cur === o[0] ? 'border-violet-500 bg-violet-950/30' : 'border-gray-700')
        }, React.createElement("input", {
          type: "radio",
          name: "lv2ap",
          checked: cur === o[0],
          onChange: () => setApSel(o[0]),
          className: "w-4 h-4 mt-0.5 accent-violet-600"
        }), React.createElement("span", null, React.createElement("span", {
          className: "block text-[13px] font-bold text-gray-100"
        }, o[1]), React.createElement("span", {
          className: "block text-[12px] text-gray-400 leading-snug"
        }, o[2])))), React.createElement("p", {
          className: "text-[11px] text-gray-500"
        }, vi ? 'Chỉ áp dụng cho đơn gửi sau khi lưu; quản lý tự xếp nghỉ không bị ảnh hưởng.' : '只影響儲存後新送出的休假；主管排休與管理者本人的設定不受影響。'), React.createElement(Btn, {
          loading: busy,
          onClick: () => run(async () => {
            const r = await api('lv2SettingsSet', {
              store: d.store,
              wd: (cf || {
                wd: String(lim.weekday)
              }).wd,
              we: (cf || {
                we: String(lim.weekend)
              }).we,
              seqMode: d.seqMode,
              apprMode: cur
            });
            if (r && r.ok) {
              setMsg(t.setOk);
              setApSel(null);
              reloadR();
            } else setErr(r && r.error || t.fail);
          })
        }, t.setSave));
      })());
    })(), d.isMgr && (() => {
      const dl = d.deleg || {
        list: [],
        sups: [],
        mine: []
      };
      const vi = lang === 'vi';
      const can = !!d.canDeleg;
      const sups = dl.sups || [];
      const nm = id => {
        const x = sups.filter(y => y.id === id)[0];
        return x ? x.label : id;
      };
      const stTxt = {
        on: vi ? 'Đang đại diện' : '代理中',
        wait: vi ? 'Chưa bắt đầu' : '未開始',
        ended: vi ? 'Đã kết thúc' : '已結束'
      };
      const stCls = {
        on: 'bg-emerald-900 text-emerald-200',
        wait: 'bg-amber-900 text-amber-200',
        ended: 'bg-gray-700 text-gray-300'
      };
      const md = x => parseInt(x.slice(5, 7), 10) + '/' + parseInt(x.slice(8), 10);
      const F = dg;
      const fromList = d.canDuty ? sups : sups.filter(x => x.id === d.myId);
      const open = () => setDg({
        from: d.myId && fromList.some(x => x.id === d.myId) ? d.myId : fromList[0] ? fromList[0].id : '',
        to: '',
        start: d.today || '',
        end: '',
        note: '',
        nTo: true,
        nFrom: false
      });
      const Sw = ({
        on,
        onClick
      }) => React.createElement("button", {
        type: "button",
        role: "switch",
        "aria-checked": on,
        onClick: onClick,
        className: 'relative w-[46px] h-[28px] rounded-full flex-none ' + (on ? 'bg-violet-600' : 'bg-gray-700')
      }, React.createElement("span", {
        className: 'absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-all ' + (on ? 'left-[21px]' : 'left-[3px]')
      }));
      const inp2 = "w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-white";
      return React.createElement(Card, {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "text-sm font-bold text-white"
      }, "🧳 ", vi ? 'Người đại diện' : '代理人'), React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, vi ? 'Khi quản lý đi vắng dài ngày (ra nước ngoài…), chỉ định người đại diện xử lý đơn nghỉ phép trong thời gian đó.' : '主管因出國或其他事請長假時，指定代理人處理期間的休假申請。期間內待簽核與調整表推播改發給代理人，結束自動恢復。'), dl.list.length ? dl.list.map(x => React.createElement("div", {
        key: x.id,
        className: 'rounded-xl border border-gray-700 px-3 py-2 text-[13px] leading-relaxed ' + (x.st === 'ended' ? 'opacity-60' : '')
      }, React.createElement("div", {
        className: "text-gray-100"
      }, React.createElement("b", null, nm(x.from)), " → ", vi ? 'đại diện: ' : '代理：', React.createElement("b", null, nm(x.to)), React.createElement("span", {
        className: 'ml-1.5 text-[11px] font-bold rounded-full px-2 py-0.5 ' + stCls[x.st]
      }, stTxt[x.st])), React.createElement("div", {
        className: "text-gray-400"
      }, md(x.start), " ~ ", md(x.end), x.note ? '（' + x.note + '）' : ''), React.createElement("div", {
        className: "text-[12px] text-gray-500"
      }, "🔔 ", x.nTo === '1' ? vi ? 'Người đại diện nhận thông báo' : '代理人收通知' : vi ? 'Người đại diện không nhận' : '代理人不收通知', " · ", x.nFrom === '1' ? vi ? 'Quản lý gốc cũng nhận' : '原主管也收' : vi ? 'Quản lý gốc tạm dừng' : '原主管不收'), can && x.st !== 'ended' && (d.canDuty || x.from === d.myId) && React.createElement("button", {
        onClick: () => run(async () => {
          const r = await api('lv2DelegDel', {
            store: d.store,
            id: x.id
          });
          if (r && r.ok) {
            setMsg(vi ? 'Đã hủy' : '已取消代理');
            reloadR();
          } else setErr(r && r.error || t.fail);
        }),
        className: "mt-1 min-h-[36px] text-red-400 text-[13px]"
      }, vi ? 'Hủy đại diện' : '取消代理'))) : React.createElement("p", {
        className: "text-xs text-gray-500"
      }, vi ? 'Chưa có thiết lập đại diện' : '目前沒有代理設定'), F ? React.createElement("div", {
        className: "rounded-xl border border-violet-700 p-3 space-y-2"
      }, d.canDuty ? React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, vi ? 'Quản lý gốc' : '原主管'), React.createElement("select", {
        value: F.from,
        onChange: e => setDg({
          ...F,
          from: e.target.value
        }),
        className: inp2
      }, fromList.map(x => React.createElement("option", {
        key: x.id,
        value: x.id
      }, x.label)))) : React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, vi ? 'Quản lý gốc' : '原主管'), React.createElement("p", {
        className: "text-sm text-white"
      }, vi ? 'Tôi' : '我')), React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, vi ? 'Người đại diện (quản lý cửa hàng)' : '代理人（本店主管）'), React.createElement("select", {
        value: F.to,
        onChange: e => setDg({
          ...F,
          to: e.target.value
        }),
        className: inp2
      }, React.createElement("option", {
        value: ""
      }, vi ? '(Chọn)' : '（請選擇）'), sups.filter(x => x.id !== F.from && (d.canDuty || x.id !== d.myId)).map(x => React.createElement("option", {
        key: x.id,
        value: x.id
      }, x.label)))), React.createElement("div", {
        className: "grid grid-cols-2 gap-2"
      }, React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, vi ? 'Từ ngày' : '開始日'), React.createElement("input", {
        type: "date",
        value: F.start,
        onChange: e => setDg({
          ...F,
          start: e.target.value
        }),
        className: inp2
      })), React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, vi ? 'Đến ngày' : '結束日'), React.createElement("input", {
        type: "date",
        value: F.end,
        min: F.start,
        onChange: e => setDg({
          ...F,
          end: e.target.value
        }),
        className: inp2
      }))), React.createElement("div", null, React.createElement("p", {
        className: "text-xs text-gray-400 mb-1"
      }, vi ? 'Ghi chú (tùy chọn)' : '備註（選填）'), React.createElement("input", {
        value: F.note,
        maxLength: 40,
        onChange: e => setDg({
          ...F,
          note: e.target.value
        }),
        placeholder: vi ? 'Ra nước ngoài' : '出國',
        className: inp2
      })), React.createElement("p", {
        className: "text-xs font-bold text-gray-300 pt-1"
      }, vi ? 'Thông báo trong thời gian đại diện' : '代理期間通知'), React.createElement("div", {
        className: "flex items-center justify-between gap-3 rounded-xl border border-gray-700 px-3 py-2"
      }, React.createElement("div", {
        className: "text-sm text-white"
      }, vi ? 'Người đại diện nhận thông báo' : '代理人收到通知', React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, vi ? 'Đơn chờ ký, bảng cần điều chỉnh' : '待簽核、休假調整表推播')), React.createElement(Sw, {
        on: F.nTo,
        onClick: () => setDg({
          ...F,
          nTo: !F.nTo
        })
      })), React.createElement("div", {
        className: "flex items-center justify-between gap-3 rounded-xl border border-gray-700 px-3 py-2"
      }, React.createElement("div", {
        className: "text-sm text-white"
      }, vi ? 'Quản lý gốc cũng nhận' : '原主管也收到通知', React.createElement("p", {
        className: "text-[11px] text-gray-500"
      }, vi ? 'Tắt: tạm dừng nhận trong thời gian này' : '關閉時，期間內原主管暫停收到')), React.createElement(Sw, {
        on: F.nFrom,
        onClick: () => setDg({
          ...F,
          nFrom: !F.nFrom
        })
      })), React.createElement("div", {
        className: "flex gap-2"
      }, React.createElement("button", {
        onClick: () => setDg(null),
        className: "flex-1 min-h-[44px] rounded-xl bg-gray-700 text-white text-sm"
      }, vi ? 'Hủy' : '取消'), React.createElement("div", {
        className: "flex-[2]"
      }, React.createElement(Btn, {
        loading: busy,
        onClick: () => {
          if (!F.to) {
            setErr(vi ? 'Vui lòng chọn người đại diện' : '請選擇代理人');
            return;
          }
          if (!F.start || !F.end) {
            setErr(vi ? 'Vui lòng chọn ngày' : '請選擇開始日與結束日');
            return;
          }
          run(async () => {
            const r = await api('lv2DelegSet', {
              store: d.store,
              from: F.from,
              to: F.to,
              start: F.start,
              end: F.end,
              note: F.note,
              nTo: F.nTo ? '1' : '0',
              nFrom: F.nFrom ? '1' : '0'
            });
            if (r && r.ok) {
              setMsg(vi ? 'Đã lưu' : '已儲存代理設定');
              setDg(null);
              reloadR();
            } else setErr(r && r.error || t.fail);
          });
        }
      }, t.setSave)))) : React.createElement("div", null, React.createElement("button", {
        disabled: !can,
        onClick: open,
        className: 'w-full min-h-[44px] rounded-xl text-sm font-bold ' + (can ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500')
      }, "＋ ", vi ? 'Chỉ định người đại diện' : '設定代理人'), !can && React.createElement("p", {
        className: "text-[11px] text-gray-500 mt-1"
      }, vi ? 'Chỉ quản lý cửa hàng hoặc người phụ trách mới được thiết lập.' : '只有該店經理或休假調整表負責人可以設定。')));
    })(), (d.isMgr || d.staff) && React.createElement(Card, null, React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: () => go('lv2=stats')
    }, "📊 預排休統計（入口點擊／註冊／暫存）")), d.isMgr && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, "📤 ", t.promoT), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.promoHint), React.createElement(Btn, {
      color: "bg-blue-600 text-white",
      onClick: async () => {
        try {
          if (!liff.isApiAvailable('shareTargetPicker')) {
            setErr(t.shareNo);
            return;
          }
          const r = await liff.shareTargetPicker([{
            type: 'flex',
            altText: '線上預排休開放測試了',
            contents: buildEntryFlex(true)
          }]);
          if (r) setMsg(t.shared);
        } catch (e) {
          setErr('錯誤:' + String(e && e.message || e));
        }
      }
    }, t.promoBtn, "（", t.reshareYes, "）"), React.createElement(Btn, {
      color: "bg-blue-800 text-white",
      onClick: async () => {
        try {
          if (!liff.isApiAvailable('shareTargetPicker')) {
            setErr(t.shareNo);
            return;
          }
          const r = await liff.shareTargetPicker([{
            type: 'flex',
            altText: '線上預排休開放測試了',
            contents: buildEntryFlex(false)
          }]);
          if (r) setMsg(t.shared);
        } catch (e) {
          setErr('錯誤:' + String(e && e.message || e));
        }
      }
    }, t.promoBtn, "（", t.reshareNo, "）"), React.createElement("p", {
      className: "text-xs text-gray-500 pt-1"
    }, t.pitchHint), React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: async () => {
        try {
          if (!liff.isApiAvailable('shareTargetPicker')) {
            setErr(t.shareNo);
            return;
          }
          const r = await liff.shareTargetPicker([{
            type: 'flex',
            altText: '📋 排休由紙本改線上提案',
            contents: buildPitchFlex()
          }]);
          if (r) setMsg(t.shared);
        } catch (e) {
          setErr('錯誤:' + String(e && e.message || e));
        }
      }
    }, t.pitchBtn)));
  }
  window.Leave2Routes = Leave2Routes;
})();