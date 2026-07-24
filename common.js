/* ════════════════════════════════════════════════════════════
   common.js — 薪資追蹤系統 共用工具
   v1.12-045 / 忘記密碼流程改用專屬的resetLockPwd(GAS新增,跟setInitialPwd不同,不管原本有沒有密碼都直接覆蓋,不會被「已設定過密碼」擋掉),common加gasResetLockPwd包裝函式 | 前: v1.12-044 / 團購功能改版:(1)登記按鈕加轉圈圈避免連點(2)團購列表加編號徽章+已結束區塊(預設收合,原本已過期的完全不會顯示)(3)我登記的分頁改成可點進詳情看誰一起登記,加已交錢/已到貨兩個狀態按鈕(GAS加setGroupBuyOrderStatus,GroupBuyOrders加paid/arrived欄位)(4)我發起的分頁加金額計算(人數×單價)+底部小計 | 前: v1.12-043 / 主系統與安全回報LINE身分整合第一步:GAS加_findLineUserIdByCode(用老師編號/主管編號去查安全回報SafetyUsers表收集到的LINE userId,只要在任一LIFF專頁登記過就查得到,不用重複登記)+pushNoticeFlexToMe(把公告組成Flex卡片推播給發布人自己,共用gas-safetyreport.gs.txt裡的_linePushFlex,GAS專案裡多檔案共用作用域不用重複定義) | 前: v1.12-042 / 首頁新增自約/公告/圖表/建議/違規5個圖示(跟團購天災回報同排,加文字標籤),點擊沿用既有的sessionStorage導頁機制直接跳到設定頁對應分頁;設定頁分頁列拿掉這5個按鈕(底層頁面邏輯不受影響,還是能從首頁圖示開啟);建議功能從假資料+「功能建置中」改成真正接GAS(新增Suggestions工作表,submitSuggestion/listSuggestions,匿名者不回傳編號) | 前: v1.12-041 / 公告分類系統全面更新為8大分類+AI優先比對子分類機制:(1)Categories工作表改新內容(服務流程與SOP/工作紀律與態度/人事與出勤管理/現場清潔與衛生/公共空間與設備/業績表揚與激勵/安全防治與天災/內部行政與關懷共8個主分類,每個底下2~4個子分類,新增「分類定義與代表性範例說明」欄位給AI判斷用) (2)GAS的analyzeNotice/editNotice prompt加強:優先從既有子分類裡選最相近的,真的完全不符合才新增,新增時AI要一併給越南文譯名+定義說明,GAS收到後自動回存到Categories工作表(_saveNewSubcat,同分類下已存在就不重複寫入) (3)publishNotices發布時一併附上完整的8分類清單(中越文對照)到notices.json,前端分類分頁改讀這份固定清單(不再受「目前有沒有公告用到這個分類」限制),固定顯示「全部」+8個主分類共9顆按鈕 | 前: v1.12-040 / 天災調查管理優化+團購登記流程改版:(1)管理頁天災調查:已結束的可按X刪除(GAS加deleteDisasterSurvey),查詢日期從date輸入框改成「day1: 7/11」這種天數下拉選單(依startDate自動算) (2)首頁安全回報彈窗:主管以上(判斷LS裡supervisor-{code}的approved狀態)最下方會出現「查詢回報情形」按鈕,選day n後列出回報人員+狀況+時間(置右) (3)團購全面改版:「參加」全部改「登記」;點登記後彈出尺寸(手套限定)+數量(預設1)的表單,按「完成」才真的送出;「不需要」點了立即變灰且不可再按,團購卡片上會顯示不需要人數;myGroupBuyOrders改回傳含response欄位的完整記錄(不再只回join),讓灰色狀態重新整理後不會消失;「我的團購」改名「我登記的」,新增「我發起的」分頁,點進去看尺寸分組明細(手套會按尺寸分組列出人員,自訂項目列出登記人+數量)+提前結束按鈕 | 前: v1.12-039 / 修正天災回報日期bug+AI無回應+分類中越對照+多項UX:(1)【重大】Google Sheets會把日期字串自動轉成Date物件,導致「今天有沒有交過」「這天有沒有回報」的字串比對永遠對不上——這是造成「送6次都被當新紀錄」「管理頁查詢顯示0人已回報」的共同根源。GAS加_normDate()正規化,submitDisasterReport/myDisasterReports/disasterDayStatus都套用;submitDisasterReport順便改成每次都新增(不再upsert),搭配前端「新增一筆安全回報」設計 (2)gasAnalyze/gasTranslate原本用GET傳公告內容,太長時送不出去,改用POST(同一類bug第三次抓到,已全面掃過common.js確認沒有其他漏網之魚) (3)公告主/子分類改支援中越對照:Categories工作表新格式(中文主/越南文主/中文子/越南文子[,標籤]選填),notices()會查表附上catVi/subcatVi,notice-modal.js在越南文模式會顯示越南文分類名稱 (4)天災調查加通報範圍(單店/全店,預設不主動通報)+自訂通知內容,複製未回報名單訊息格式比照需求範例(調查名稱+自訂內容+今日尚未回報名單+平台連結) (5)DisasterReportModal改版:已回報過預設顯示「安全回報記錄」(今日回報摘要+歷史記錄),底部「新增一筆安全回報」按鈕才切回填寫表單,狀態顯示改用正確的中文標籤而非英文key | 前: v1.12-036 / 修正發布公告「GAS無回應」:gasAddNotice/gasEditNotice原本用GET(gasCall)傳整份公告內容,AI翻好越南文之後內容變長,GET網址可能超出長度限制送不出去或被擋掉。改用POST(gasCallPost),跟你們專案裡saveStaff/writeStaff同一套已經驗證過的解法(大資料量一律走POST) | 前: v1.12-035 / 修正auth.html重大bug+5項細節:(1)【重大】auth.html最上面錯誤攔截腳本裡有一處未跳脫的雙引號(誤植的span標籤`id="__fbkeep"`,引號沒加反斜線),導致這段JS語法錯誤、整個頁面白畫面——這是auth頁一直空白的真正原因,已修正(移除誤植的span,恢復純文字) (2)團購彈窗標題「手套團購」改「團購列表」(3)GroupBuyModal/DisasterReportModal的GAS查詢失敗時原本會卡在null狀態一直顯示「載入中」,改成失敗也要有明確結果(空陣列+錯誤訊息) (4)主管申請按鈕加busy狀態+轉圈圈圖示,按下後disable,避免GAS回應慢時被連續點擊產生多筆重複申請記錄 (5)debug.html加測試時間顯示(頁面上+複製的Markdown都有) | 前: v1.12-034 / 團購UX修正+匯出方式微調:(1)手套尺寸選擇從列表移除,改成按「參加」時才判斷——基資已有尺寸就直接用,沒有才彈出選擇(2)「參加」按鈕改依查詢結果狀態:已登記過的變灰字disabled顯示「已登記」,未登記才是亮色可按(3)檔尾匯出語法從`global.MP=`改成`window.MP=`(檔案本來就用`(function(global){...})(window)`包起來,global本來就等於window,這個改動語意不變、單純寫法更直覺,不是這次bug的真正原因) | 前: v1.12-033 / 團購與天災回報大擴充:(1)團購:GAS加item(手套/自訂)+amount(必填)+scope(通知範圍)+一般老師24小時截止限制(server端依staff role判斷,不是前端假限制);GroupBuyOrders加response欄位(join/decline),新增declineGroupBuy(正式記錄不需要)+logGroupBuyOpen(記錄點開看過)+closeGroupBuy(發起人提前結束)+groupBuyDetail(查參加/不需要/看過三份名單);手套尺寸選擇後自動同步回staff.gloveSize,下次自動帶出。index.html的GroupBuyModal全面改版:發起表單(項目/金額/截止/範圍)、列表項目由XX發起+倒數計時置右、參加/不需要雙按鈕、點進去看明細(發起人多看到不需要名單+開啟名單+提前結束鈕) (2)天災回報改架構:原本單次回報改成DisasterSurveys(調查)+DisasterReports(每日回報)兩層,不用再選天災類別(調查名稱本身就代表,如"0710強颱"),回報選項增加「其他」自訂文字;auth.html新增DisasterSurveyBlock(管理頁發起/結束調查,查某天回報狀況,複製未回報名單附app網址);index.html的DisasterReportModal改成先查有沒有進行中的調查,沒有就顯示提示,有就直接顯示回報表單(當天已回報過會顯示我的回報紀錄) | 前: v1.12-031 / 離職帳號復職申請+錯誤訊息露出:(1)GAS的loginPwd帳號停用時多回傳reason:'left'區分是不是離職;approveAction加R分支(復職核准:staff狀態改回active+金鑰恢復展延6個月,舊密碼不變不用重設) (2)index.html的忘記密碼送出前先用gasCheckCode檢查狀態,若已離職就導去復職申請流程(新增reinstateAsk/reinstateTicket兩個畫面);密碼登入頁偵測到reason==='left'同樣導去復職申請;登入/忘記密碼的錯誤訊息不再全部蓋成同一句,改成把GAS實際回傳的error內容一起顯示(方便之後排查) (3)auth.html的ActionTicketBlock加R類型支援 | 前: v1.12-029 / 鎖屏時間可調整+首頁每日提醒+團購+天災回報(大量新功能):(1)notice-modal.js/InfoEditModal的密碼鎖屏時間改讀settings.lockAutoTime(預設60分鐘,取代原本寫死5分鐘),settings.js新增「保護密碼」設定區塊(關閉首頁密碼要求開關+自動上鎖時間調整,最小5分鐘) (2)首頁新增每日一次的密碼要求彈窗(可在設定關閉),通過後背景做憑證檢查並記錄log(GAS加logDailyCheck) (3)基資新增手套尺寸欄位(XS/S/M/L/XL,預設M) (4)新增團購系統:GAS加GroupBuys/GroupBuyOrders工作表+createGroupBuy/listGroupBuys/joinGroupBuy/myGroupBuyOrders四個動作,首頁狀態列下方加購物車圖示開團購彈窗(團購/我的團購兩分頁,任何人可發起),每天檢查是否有未參加的進行中團購,有的話跳出加入提示 (5)新增天災安全回報:GAS加DisasterReports工作表+submitDisasterReport動作(送出時同步更新基資通訊縣市/鄉鎮),首頁狀態列下方加回報圖示,彈窗含日期/天災別/狀況多選,沒填通訊地址會先擋著要求填寫 (6)common加對應7個gas包裝函式+大量翻譯鍵 | 前: v1.12-028 / AI標題規則+憑證期限顯示+離職入口調整:(1)GAS analyzeNotice/editNotice的prompt加「標題不要跟主/子分類文字重疊」規則 (2)verifyKey回傳擴充:加expiresAt(到期日)+reason(left離職/expired逾期),供設定頁顯示憑證期限與原因 (3)離職按鈕從設定頁的CredentialCard移到首頁左上角店資彈窗的編輯按鈕左邊(index.html的InfoEditModal type=store專屬) | 前: v1.12-027 / AI分類規則+字詞庫擴充+公告下架:(1)GAS analyzeNotice/editNotice的prompt加主分類封閉清單限制(不可新增主分類,子分類可擴充)+字詞庫新詞偵測(行業敏感度),AI回傳的newGlossaryTerms自動存進GlossarySuggestions工作表待審核 (2)公告加下架/上架:common加gasToggleNoticeStatus包裝函式,GAS加toggleNoticeStatus動作 (3)buildNoticesJson加openers清單(誰開過的號碼,跟readers對稱),供notice-modal.js的開啟人員清單用 (4)發文者存檔格式加"號"字(如5號) | 前: v1.12-025 / 修正重大bug+重新加入離職/展期功能:上一版settings.js的bridge匯入清單`buildReqLink`重複宣告(跟原本申請碼系統的匯入撞名),導致Babel轉譯整個settings.js失敗、index.html白畫面當機。這次common.js加gasLeaveTeacher包裝函式+離職/展期相關翻譯鍵(內容不變,只是這次settings.js那邊改成正確只加缺少的識別字) | 前: v1.12-022 / 開啟次數改分人數/人次雙軌統計+體驗優化:(1)logNoticeOpen改每次都記(人次用),noticeOpens/buildNoticesJson同時算openCount(人數不重複)+openVisits(人次全部) (2)publishNotices加listText(標題/摘要)、countType(人數/人次)參數,存進script屬性NOTICE_DISPLAY_OPTS,publishNoticesJob(每天12點定時)沿用主管上次手動選的設定 (3)auth.html的NoticePublishBlock加「列表文字用標題/摘要」「開啟次數顯示人數/人次」兩組選項 (4)settings.js公告列表照新規格重排第二排:👤發布人→👁開啟次數→👍已讀人數→主/子分類(受顯示開關控制)→時間(置右),第一排文字改用主管選的標題或摘要 (5)已讀圖示全部改回👍(notice-modal.js詳情頁、已閱讀按鈕、index.html首頁列表),✓不再用於已讀狀態,首頁列表未讀狀態改用○ (6)效能優化:notice-modal.js/InfoEditModal(店資)的憑證檢查改成樂觀渲染——內容先顯示,背景查憑證,真的失效才即時擋掉,不再等GAS回應才顯示內容(這才是真正造成"打開變慢"的原因);開啟記錄呼叫延遲1.5秒觸發,不跟畫面顯示搶資源 (7)common加getNoticeListText/getNoticeCountType讀取函式+gasLogNoticeOpen包裝函式+相關翻譯鍵 | 前: v1.12-021 / 公告開啟記錄+體驗優化:(1)GAS加NoticeOpens工作表(logNoticeOpen/noticeOpens),同人同公告只記一次,跟已讀(readNotice)是兩層;publishNotices/buildNoticesJson一併把openCount寫進notices.json (2)notice-modal.js內容真的顯示出來(密碼+金鑰兩關都過)才自動記開啟;已讀圖示從👁改✓(避免跟開啟次數的👁撞圖示),detail header改成"👁開啟次數 ✓已讀人數"並列 (3)憑證有效性檢查改一天一次:加getCachedKeyCheck/setCachedKeyCheck,用localStorage存當日查過的結果,notice-modal.js跟InfoEditModal(店資)都套用,同一組key互通 (4)公告列表(settings.js NoticeManagePage)版面調整:第一排只留摘要+編輯鈕,第二排右側改放主/子分類合併顯示+開啟次數 | 前: v1.12-020 / 一次處理5項:(1)GAS加rejectAction(退回申請附理由),ActionTicketBlock加退回按鈕,老師端ticket畫面偵測rejected狀態→顯示理由+重新編輯按鈕(用changedList重建表單,不怕中途重新整理過) (2)語系選項從基資分頁移到首頁設定主題下方 (3)憑證有效期限:Keys表加expiresAt欄位,claimKey/batchClaim/N票證/A票證領取金鑰的當下才設6個月到期(不是主管核准當下),_keyValid/verifyKey都加到期檢查;notice-modal.js跟InfoEditModal(store)密碼關卡過了之後背景驗證金鑰,失效就擋內容(離職員工密碼還能用但看不到公司資料);InfoEditModal(basic)不擋檢視,只擋送出 (4)GAS加_ensureKeyExpirySet內部函式 (5)common加gasRejectAction/gasVerifyKey包裝函式+相關翻譯鍵 | 前: v1.12-019 / 一次處理多項:(1)票證查詢加申請時間/核准時間/核准人顯示,GAS checkAction回傳加createdAt (2)首頁基資彈窗:縣市/鄉鎮區改用TW_REGIONS連動下拉(桃園/新北/臺北/宜蘭排前面)、詳細地址下加"外籍員工"分隔線、越南姓名移到分隔線下、到期日改名工作證到期日、核發日/到期日改日期選擇器、就讀學校科系移到核發單位之下 (3)核准後同步寫入confirmedProfile/confirmedStore快照,避免底部設定❗提醒抓不到"已確認"而永遠亮著 (4)GAS加revokeSup(主管撤銷GAS化,不再需要revoked.cfg)+common加gasRevokeSup包裝函式 (5)auth.html移除舊的主管審核UI(parseSup/approveSupOnline/approveSupOnlineSup,SupervisorPage跟AdminPage各一份共兩處,已被A票證系統取代) | 前: 核准通知訊息依票證類型分開文案:auth.html的notifyApproved原本N/F/A/B/S五種票證都共用同一句「帳號已啟動」的文案,對F(忘記密碼)/A(主管申請)/B(基資)/S(店資)來說文不對題。改成依actionCode選對應文案(lineApprovedForgotPrefix/lineApprovedSupPrefix/lineApprovedBasicPrefix/lineApprovedStorePrefix),句尾加上點通知按鈕那位主管自己的登入編號,方便老師知道是誰核准的、有問題找誰 | 前: 基資/店資移入首頁彈窗,改可編輯+走票證審核+雙鎖屏:GAS approveAction加B(基資)/S(店資)分支(payload只含變更欄位,直接merge進staff,免像N/A那樣要組完整物件)。index.html新增InfoEditModal元件(取代原本的唯讀彈窗):畫面分三段——view(全部列出,按編輯才能改)/edit(可編輯,gender用按鈕/shift用按鈕/workStart-workEnd用整點半點下拉/storeSel用店家下拉,其餘文字輸入)/ticket(送出後畫面全清空,只留票證代碼+傳LINE給主管+檢查審核情形2顆按鈕+下方列出本次變更欄位,核准後自動merge回本機settings)。ticket狀態存localStorage(info-pending-{type}-{code}),重新整理停在原畫面不會重新申請。兩個彈窗都加密碼鎖屏閘門(沒設密碼先引導設定/設過但超過5分鐘要求解鎖),解鎖時間戳跟公告共用同一個key(解鎖一次兩邊都算),基資用「此頁含個人資訊」文案、店資沿用公司資料文案。App的updateSettings傳給HomePage(onUpdateSettings)供核准/設密碼後同步本機狀態。auth.html的ActionTicketBlock加B/S類型顯示(列出變更欄位清單)。common加ticketTypeB/ticketTypeS/lineTicketBasicPrefix/lineTicketStorePrefix/infoEditBtn/infoSubmitBtn/infoCancelBtn/infoNoChange/infoChangedTitle/infoPwdSetupBasicBody/infoPwdSetupStoreBody/infoPwdLockedBasicBody/infoPwdLockedStoreBody翻譯鍵 | 前: 主管申請GAS化,取消連線碼流程:GAS approveAction加A分支(核准當下把選的等級寫回payload,_staffUpsert設role:supervisor+level+status,順便產金鑰);checkAction對已核准的A票證額外帶回GH_TOKEN/GH_OWNER/GH_REPO(script屬性)+金鑰。common的gasApproveAction加level參數。auth.html的AuthGate的doApply/checkSupOnline全面改走GAS票證(gasSubmitAction/gasCheckAction),不再需要申請人本機先有GitHub Token才能申請(移除hasConn/needConnFirst擋關);checkSupOnline核准後直接呼叫saveGHConfigLocal存token,不再需要「已連線的主管產連線碼→申請人輸入」那段人工作業。ActionTicketBlock加A類型支援(核准前選主管等級,核准後顯示等級)。common加ticketTypeA/lineTicketSupPrefix翻譯鍵 | 前: 票證系統修正:(1)加大LINE相關按鈕(傳LINE/核准/通知)方便點擊(2)透過連結進auth.html時自動捲動到查詢代碼區塊(3)通知申請人已核准的LINE訊息內容改成親切問候語(不列細節)：「{code} 你好：你的帳號已啟動，請點擊網頁中的「檢查核定情形」來登入主頁，進行支數管理…」，取代原本只有編號的空訊息 | 前: 票證UI優化:主管審核頁核准後移除重複的「此申請已處理過」文字(跟「已核准✓」重複),改成核准後顯示「通知申請人 已核准」LINE分享按鈕(中越雙語並陳);查詢按鈕改成查到結果後變「清空」鈕,按下清空輸入框跟結果、鈕再變回查詢。老師端傳給主管、主管端通知老師的LINE訊息都改成同時附中文跟越南文(避免收件人語系跟寄件人不同看不懂)。common加ticketClearBtn/ticketNotifyBtn/lineApprovedPrefix翻譯鍵 | 前: 新老師啟動大修:GAS加syncProfile(快速通道admin.cfg/已核准的老師啟動時直接同步基本資料到Staff,修正原本快速通道完全沒呼叫GAS導致性別/班別/上下班/語系沒同步進staff的問題)+checkCode(查詢編號是否已是Staff裡的已啟動老師,新老師啟動頁"檢查"按鈕用)。approveAction的F(忘記密碼)分支改成核准當下直接套用老師預先設定好的新密碼(payload.lockPwdEnc),不用老師端再多一步呼叫updatePwd。common加gasSyncProfile/gasCheckCode包裝函式+相關翻譯鍵。版次號改回每波統一編號(不再各檔案獨立遞增),這波是v1.12-008 | 前: 公告密碼閘門+全檔版次對齊:notice-modal.js(v1.10-029→併入1.12系列)加密碼閘門——已啟動老師點開公告詳情時,若本機沒設過4位密碼→引導設定(文案:公告內容為公司資料需密碼保護,5分鐘內免重複輸入);若有設過但距上次解鎖超過5分鐘→要求輸入密碼才顯示內容。密碼比對純本機不查GAS(快),首次設定背景同步一份到GAS Staff(呼叫新增的setInitialPwd,已有密碼會被GAS拒絕,要走F忘記密碼流程改)。GAS加setInitialPwd。因是逢重大版次的整理點,index.html/auth.html/settings.js/notice-modal.js版號一併同步對齊至v1.12-004 | 前: 行為代碼+流水正式上線(N=新老師啟動,F=忘記密碼):GAS加Actions工作表(submitAction送出待審核/checkAction查狀態/approveAction主管核准/updatePwd忘記密碼核准後設新密碼/loginPwd密碼登入比對)+Staff單列讀寫輔助(_staffGet/_staffUpsert/_regenerateStaffJson,每次異動後重新編碼整包寫回staff.json維持舊讀取路徑相容)。common加lockPwdCred(密碼用老師編號當key加密,GAS只需字串比對不需解密)+5個GAS包裝函式(gasSubmitAction/gasCheckAction/gasApproveAction/gasUpdatePwd/gasLoginPwd)。新老師啟動不再把資料塞進encReg傳給主管,改成先送GAS存Staff拿流水號,傳給主管的短碼只有「N+流水號」;新老師啟動頁的性別/上下工時間UI改成時間下拉選單(只能選整點或30分)+進頁面預設抓當下時間下一個半小時、下工預設上工+12小時(手動調整後不再自動連動)、加班別(早/晚班)欄位。新增「已有帳號密碼登入」與「忘記密碼」流程(密碼登入換機免找主管要啟動碼;忘記密碼送F票證給主管核准後設新密碼,票證檢查按鈕按過一次若未核准會出現60秒倒數)。auth.html的SupervisorPage/AdminPage都加ActionTicketBlock(貼票證代碼查詢+核准,主管現在也能核准新老師,不再只限admin) | 前: 新老師啟動頁擴充:common加isValidPin(4位數解鎖密碼驗證,不可4碼相同或連續遞增/遞減)+T字典加lockPwd相關中越翻譯鍵;index.html的Onboarding新增性別/上下工時間/4位解鎖密碼欄位(密碼僅存本機,不隨註冊碼傳給主管;性別/上下工時間會編碼進encReg傳給主管審核);auth.html的decodeTeacher同步解析新增欄位,approveTeacherOnline建立staff時一併寫入 | 前: staff存檔搬Sheet(第一階段,只動寫入路徑,讀取不動):GAS加saveStaff(收前端xEnc加密的完整staff陣列→解密驗證→存Staff工作表[B方案,一列一人,code獨立欄+json欄]→容錯寫回GitHub staff.json維持讀取路徑不變,GitHub那步失敗不擋管理端操作只記log)。common的writeStaff()內部改呼叫GAS saveStaff(不再直接打GitHub API),函式簽名不變,auth.html約20處呼叫點都不用改。因staff整包資料量大,GET網址會超長,新增gasCallPost(POST+JSON body版,不設Content-Type避免CORS預檢)專門給大資料量動作用,writeStaff改用這個。因是大改動,版次號另起1.12系列 | 前: 公告線上編輯:GAS加editNotice(依ID找Notices列,先算有效值再找出主分類/子分類/標題/摘要/標籤裡的缺漏欄位,若有缺且內文非空→一次Gemini呼叫同時補缺欄位+把最終標題/摘要/內文翻越南文寫回,失敗自動重試1次,仍失敗仍算存檔成功回viOk:false讓前端顯示提醒;034.2再優化成缺欄位與翻譯合併一次呼叫省額度,已填欄位當context不被覆蓋);common加gasEditNotice(呼叫editNotice,逾時45秒因含AI) | 前: 新增公告完整流程:GAS加addNotice(自動產ID最大+1如L0305→L0306,寫進Notices Sheet新列,記log新增公告);common加gasAddNotice;settings新增公告Modal接功能:打內容→AI產生(gasAnalyze顯示可修改的分類/標題/摘要/標籤/越南文)→發布(gasAddNotice寫Sheet)+提示已發布需等更新才顯示;帶登入者編號 | 前: Gemini詳細log:GAS加_geminiLog每次呼叫記一列到GeminiLog工作表(時間/編號/功能);_gemini收meta(code/feature);translate/analyzeNotice收code+feature參數;common gasTranslate/gasAnalyze加code/feature參數;AITestBlock帶登入者編號(app-settings.code)+功能名(翻譯測試/分析測試).用途:歷史用量供未來收費參考+誰用什麼功能稽核 | 前: Gemini用量計數:GAS _gemini每次成功呼叫記一筆到GEMINI_USAGE屬性(日期:次數,換日歸零);加geminiUsage查詢(回today/used/limit250/remain);common加gasUsage;管理頁AITestBlock顯示今日已用X/250次剩Y次(剩≤20提示快用完).說明:一次analyzeNotice(分類+標題+摘要+翻譯)算1次RPD | 前: Gemini串接(GAS端):GAS加_gemini(呼叫gemini-2.5-flash,GEMINI_API_KEY屬性)+_readCategories(讀分類庫)+_readGlossary(讀行話表)+translateNotice(中文→越南文,用你優化的prompt+行話保一致)+analyzeNotice(內容→選分類/標籤+中文標題摘要+越南文,回JSON);common加gasTranslate/gasAnalyze;管理頁加AITestBlock(翻譯/完整分析測試,申請key後可測) | 前: 公告未閱讀人員清單+編號+複製催讀:GAS加_readStaff(讀staff.json用DECRYPT_KEY屬性XOR解密)+noticeUnread(在職老師-已讀,分早晚班);common加getNoticeUnread;notice-modal詳情主分類前加公告編號(N號),中間鈕改未閱讀人員(展開分早班/晚班/其他+複製鈕格式305號公告 未閱讀人員：早班 122 148/晚班 175),已閱讀人數改可點展開已讀清單 | 前: 公告詳情彈窗抽成共用元件notice-modal.js(index與公告頁共用,未來公告頁獨立不用大改);index改用元件(4827字元→精簡);設定公告頁列表第一排改摘要(越南語系顯示越文摘要空則中文)+點了彈完整詳情(雙語/已讀/閱讀人員);首頁彈窗更多公告→跳設定公告頁(onGotoNotices) | 前: 公告可勾選顯示欄位:公告更新加3勾選框(主分類/子分類/標籤,預設不勾不顯示,因chatgpt分類不準,校正好再勾);json加show:{cat,subcat,tags};老師端index詳情依getNoticeShow顯示分類/子分類/標籤(預設隱藏);設定公告頁(管理用)維持顯示cat方便校正 | 前: 公告更新可輸入筆數:管理頁NoticePublishBlock加兩輸入框(首頁筆數預設2/公告頁筆數預設10,0或空白清空);json結構改{homeCount,notices};GAS publishNotices收homeCount+listCount;fetchNotices相容新舊結構+存homeCount;首頁用getNoticeHomeCount取筆數;設定公告頁讀json顯示公告列表(取代空殼) | 前: 建議頁UI(先純UI假資料):設定建議分頁改SuggestPage,列表兩排(第一排標題+發布人,第二排內容+時間,匿名者發布人顯示隱藏),右上+新建議按鈕→Modal(標題+內容+匿名勾選+送出,先不功能),之後接GAS/Sheet | 前: 新增公告頁UI(先無功能):設定公告分頁改成公告管理(NoticeManagePage),右上+新增公告按鈕→跳Modal彈窗(只打內容框+AI產生鈕+發布鈕,AI依內容自動分類/標題/摘要/翻譯的設計,先留位不功能) | 前: 公告已讀統計靜態化(省GAS配額):GAS新增publishNotices(產最新2筆+每則已讀人數readCount/清單readers→寫notices.json到GitHub,需GAS設GH_TOKEN/GH_OWNER/GH_REPO屬性)+publishNoticesJob(每天12點定時觸發用);前端publishNotices改呼叫GAS action;老師端已讀人數/閱讀人員改從notices.json靜態讀(不查GAS),只點已讀即時寫GAS。人數延遲到下次更新(主管按/12點) | 前: 我已閱讀按鈕未讀改一般色(白底灰字)點後變綠已閱讀;閱讀人員功能:點閱讀人員→GAS查該公告閱讀清單(noticeReads加detail回readers編號+時間)→詳情內展開顯示已讀編號;getNoticeReaders | 前: 已閱讀實際功能(金鑰首次實際驗證用途):點我已閱讀帶金鑰→GAS驗金鑰身分→記NoticeReads工作表(同編號同公告只記一次)→回真實已讀人數;詳情顯示👁人數(取代寫死400);列表已讀顯✓;GAS加readNotice/noticeReads/_keyValid | 前: 金鑰領取診斷:管理頁加KeyDiagBlock(輸入編號模擬領取,顯示內建網址/領取碼有無填、shouldClaim判斷、HTTP狀態、GAS回應、成功或卡點原因);diagClaimKey函式。⚠️common的BUILTIN常數仍空,部署時需填回你的值 | 前: 設定分頁改名首頁設定→系統設定;系統設定連線狀況區加老師專屬憑證排(依hasMyKey顯示本機已領✓綠/未領) | 前: 公告列表精簡成兩排(第一排摘要+單/全店標籤黃/紅底白字圓框,第二排發布人時間+👍已閱讀數暫寫400);單全店用日期寫死(6/27全店其餘單店,展示用);中/VI切換保證至少一個亮(已亮的再點切到另一個) | 前: 公告詳情改三按鈕:我已閱讀(綠,點了自動抓金鑰)/閱讀人員(灰,建置中)/更多公告(灰,建置中);移除我有意見按鈕 | 前: 公告按鈕改掉alert彈窗:點了直接在按鈕下方顯示狀態(開通中⏳/已開通✓綠/失敗✗紅/建置中琥珀),不打斷操作不用按確認 | 前: 公告發布加分步進度+詳細錯誤:publishNotices回報卡在哪步(連GAS/GAS回應/讀GitHub/寫GitHub)及原因;gasCall加逾時參數,公告抓取用30秒(GAS冷啟動+資料量大);管理頁按鈕顯示⏳進度+紅字錯誤,方便回報卡點 | 前: 公告按鈕金鑰判斷:沒金鑰的老師點我已閱讀/我有意見→背景autoClaimKey開通(引導領金鑰,你的誘因設計);有金鑰→顯示功能建置中;沒金鑰時按鈕下方顯示開通提示 | 前: 公告改GitHub json架構:老師端fetchNotices強制讀./notices.json(公開免金鑰免GAS,無則空);管理者NoticePublishBlock按鈕(去GAS抓最新2筆→寫notices.json到GitHub,publishNotices);公告詳情下方加我已閱讀/我有意見按鈕(先UI,點顯示功能建置中);越南文顏色改emerald-600(白粉主題看得清);ghWriteFile支援建新檔 | 前: 公告階段2:首頁最新2則(改);GAS多讀越文標題(17欄)/越文摘要(18欄);列表依語系顯示標題摘要(noticeTitle/noticeSummary,越文空fallback中文)+發布人;詳情彈窗右上中/VI切換鈕(可單選雙選,預設跟隨語系,雙選時中越並陳)+發布人;修009的onGotoNotices未定義崩潰 | 前: 防護:公告函式呼叫加typeof檢查(防common快取舊版時version錯配崩潰)、getNoticesLocal確保回陣列(防舊資料非陣列)、latestNotices防護。舊裝置爆00030000是index新009+common舊快取的版本錯配,務必common也更新+清快取 | 前: 公告階段1:GAS加notices動作讀Notices工作表回JSON(不驗證);common加fetchNotices(讀GAS存本機notices-cache)/noticeBody(中越雙語)/noticeCats/noticeTags;首頁頂部加最新公告區塊(最新3則,點開詳情彈窗,雙語顯示) | 前: 首頁今日排請假(事/病/休)時顯示假別標籤、去掉支數金額(比照前一筆邏輯);GAS密碼UI改稱GAS連線密碼(不用ADMIN_SECRET字眼) | 前: 發碼即產金鑰(管理者手動發碼時,若已存adminSecret+有GAS,背景順便issueKey);老師啟用即領金鑰(輸入啟動碼啟用成功後背景autoClaimKey,靜默,失敗不影響啟用靠首頁banner下次再領) | 前: KeyGenBlock產金鑰元件(管理者用adminSecret產,存本機發過一次就免打);放在手動發碼下方+員工編輯區(編號自動抓當前員工);adminSecret本機存取getAdminSecret/setAdminSecret;GAS時間改台北時區;Log工作表記領取活動 | 前: 更新banner失敗時顯示具體錯誤原因(領取碼不符/尚未產金鑰/金鑰停用/連不到GAS/缺編號),對應GAS回傳的error方便診斷 | 前: 改用做法B專用領取碼(不放adminSecret):內建BUILTIN_GAS_URL(乾淨網址)+BUILTIN_BATCH_CODE(只能領金鑰的碼);autoClaimKey改呼叫batchClaim(GAS驗BATCH_CODE);洩漏危害極小,領完清空兩常數+GAS清BATCH_CODE即停用。GAS需更新含batchClaim版並設BATCH_CODE屬性 | 前: 內建GAS網址批量發放金鑰:common加BUILTIN_GAS_URL常數(空,你填網址+adminSecret)/shouldClaimKey/autoClaimKey;一進系統畫面下方(nav上方)顯示更新banner(已啟動老師+有內建網址+沒金鑰時),點了自動領金鑰存本機;領完或沒填網址則不顯示 | 前: GAS金鑰發放UI:管理者端產金鑰(輸入編號+adminSecret→顯示領取碼);老師端領金鑰(輸入領取碼→claimKey存本機,已有金鑰則不顯示);金鑰函式getMyKey/issueKey/claimMyKey;GAS測試鈕改實心綠底白字;GAS輸入框移除90%(只時間框需要) | 前: 【1.10 GAS整合階段】GAS呼叫層+預熱+設定頁GAS網址設定;時間框90% | 前: (增量重做)客戶編輯刪除鈕;月份明細捲到今日+高亮(綠框加強對比);首頁換頁時間點設定(預設06:30);圖表時間軸6點起(settings+auth都改);含022.1的groups修正 | 前版: 修iPhone Safari新老師輸入編號後00020000錯誤:(1)clipboard.writeText全部加.catch(Safari對剪貼簿權限嚴格會reject promise,同步try/catch抓不到);(2)unhandledrejection不再跳錯誤畫面只記錄(promise rejection多為背景async失敗,不應讓整頁變網站更新中,致命的js error仍會攔) | 前版: 員工完整資料編輯拆成兩區:基資完整資料+店資完整資料(店資含班別/上下班/備註/單價/技術指導/置物櫃+懷孕/油壓接不接切換鈕),各自存回staff | 前版: 【逢十全檔對齊】管理者員工編輯小畫面加完整資料檢視+編輯(解讀staff該員工所有欄位:姓名/電話/email/性別/地址/學校/工作證/班別/備註/置物櫃),改完一鍵存回staff | 前版: 手動發碼新建員工時,店家預設=發碼者所屬店家(原本寫死空白);老師線上核准時若老師沒填店家,fallback用發碼者店家 | 前版: 主管(SupervisorPage)補上線上審核主管申請功能(寫approved.cfg+staff,老師端可線上自動核准,等級限低於自己);之前主管審核只發離線碼、線上檢查不會過的斷點已修 | 前版: #3老點=1且有姓+稱謂自動加#老點標籤;#4連線碼LINE鈕改傳給老師;#6主管申請碼加傳LINE給主管鈕;#5連線碼可傳連結(老師點了自動帶入token啟用,補上原本缺的連線碼接收流程,長碼自動分段) | 前版: JSON完整備份補齊:加入客戶資料庫(custdb)與標籤歷史(tagHistory),還原一併復原(流水本來就含在月份資料);新增CHANGELOG.md | 前版: 備份碼匯入時每日total自動轉一筆流水(數字對得上,流水列表有資料),備份碼下方註明缺點(無法還原每筆明細);月份明細年度鈕改實心綠底白字(閱讀更清楚) | 前版: 客管頁加左右留白;每日進index讀staff同步基資店資(老師沒改的欄位跟staff一致,改過且不一致的保留本機值+欄位下方紅字顯示公司登記值,一致則無紅字) | 前版: 最後同步時間改永久顯示(修upd會被form覆蓋的bug);底部導覽年度薪資改客戶管理(加人物圖示);年度入口移到月份明細切換列首尾(上下半年都易達);年度頁加返回鈕 | 前版: #8修Safari相容(無參catch{}改catch(_e){},iOS舊Safari不支援導致新用戶輸入編號出錯);#10移除引導學習點A(不再強制寫入工作證到期日);#11 S22U主題背景改data-theme純CSS靜態(不靠JS動態改色);#9基資店資確認碼通過後主動讀staff同步+記錄最後同步時間
   純 JS（不經 Babel）：加密、雜湊、GitHub API、i18n、儲存工具
   index.html 與 auth.html 共用，確保加密邏輯單一來源
   ════════════════════════════════════════════════════════════ */
(function(global){
'use strict';

/* ══════════ localStorage ══════════ */
const LS={
  get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(_e){return null}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}},
};
/* LS key map (cache offsets) */
const _m=[['key.cfg',18,3],['admin.cfg',18,3],['revoked.cfg',49,3],['revoked.cfg',10,3],['key.cfg',31,3],['stores.cfg',44,3],['key.cfg',38,3],['key.cfg',58,3],['revoked.cfg',32,2],['admin.cfg',34,2],['revoked.cfg',16,3],['admin.cfg',26,2],['stores.cfg',1,2],['stores.cfg',21,3],['admin.cfg',25,2],['revoked.cfg',8,2],['key.cfg',53,3],['key.cfg',6,3],['stores.cfg',12,3],['revoked.cfg',50,3],['revoked.cfg',11,3],['key.cfg',45,2],['admin.cfg',0,2],['revoked.cfg',0,3]];
const _v='031706';
function _sel(){const o=[];for(let i=0;i<_v.length;i+=2)o.push(parseInt(_v.substr(i,2),10)-3);return o}

/* ══════════ CRYPTO ══════════ */
const CK_DEFAULT="MP2026KEY";
let CK=CK_DEFAULT;
const KC_KEY='key-config';
/* offset map */
const _n=[['revoked.cfg',50,2],['revoked.cfg',27,2],['revoked.cfg',27,3],['stores.cfg',40,3],['admin.cfg',23,3],['revoked.cfg',39,2],['stores.cfg',16,3],['stores.cfg',20,3],['stores.cfg',12,2],['admin.cfg',33,3],['key.cfg',38,2],['revoked.cfg',34,2],['stores.cfg',0,3],['admin.cfg',5,3],['revoked.cfg',0,2],['revoked.cfg',53,3],['stores.cfg',12,3],['stores.cfg',44,2],['stores.cfg',26,2],['stores.cfg',25,2],['key.cfg',38,3],['admin.cfg',28,2],['admin.cfg',56,3],['admin.cfg',29,3]];
const _w='2610220518';
function _sel2(){const o=[];for(let i=0;i<_w.length;i+=2)o.push(parseInt(_w.substr(i,2),10)-3);return o}
async function _bk(){try{const need={};for(const i of _sel()){const f=_m[i][0];if(!need[f])need[f]=null}for(const f in need){const r=await fetch('./'+f,{cache:'no-store'});if(!r.ok)return null;need[f]=(await r.text()).split('\n')[0]||''}const p=[];for(const i of _sel()){const[f,s,l]=_m[i];const ln=need[f];if(ln.length<s+l)return null;p.push(ln.substr(s,l))}const b=p.join('');return b.length>=4?b:null}catch(_e){return null}}
async function _bk2(){try{const need={};for(const i of _sel2()){const f=_n[i][0];if(!need[f])need[f]=null}for(const f in need){const r=await fetch('./'+f,{cache:'no-store'});if(!r.ok)return null;need[f]=(await r.text()).split('\n')[0]||''}const p=[];for(const i of _sel2()){const[f,s,l]=_n[i];const ln=need[f];if(ln.length<s+l)return null;p.push(ln.substr(s,l))}return p.join('')}catch(_e){return null}}
function getKeyConfig(){return LS.get(KC_KEY)||null}
function saveKeyConfig(cfg){LS.set(KC_KEY,cfg)}
async function buildDynamicKey(){
  const cfg=getKeyConfig();
  if(_v.length>_w.length){const k2=await _bk2();if(k2&&k2.length>=4){CK=k2;return}}
  if(!cfg||!cfg.rules||!cfg.rules.length){const k=await _bk();CK=k||CK_DEFAULT;return}
  try{
    const parts=[];
    for(const r of cfg.rules){
      if(!r.file||r.start==null||!r.len)continue;
      const res=await fetch('./'+r.file,{cache:'no-store'});
      if(!res.ok){const k=await _bk();CK=k||CK_DEFAULT;return}
      const text=await res.text();
      const firstLine=text.split('\n')[0]||'';
      if(firstLine.length<r.start+r.len){const k=await _bk();CK=k||CK_DEFAULT;return}
      parts.push(firstLine.substring(r.start,r.start+r.len));
    }
    const built=parts.join('');
    if(built.length>=4)CK=built; else {const k=await _bk();CK=k||CK_DEFAULT}
  }catch(_e){const k=await _bk();CK=k||CK_DEFAULT}
}
function getCK(){return CK}
function xEnc(t){return Array.from(t).map((c,i)=>(c.charCodeAt(0)^CK.charCodeAt(i%CK.length)).toString(16).padStart(2,'0')).join('')}
function xDec(h){try{return h.match(/.{2}/g).map((x,i)=>String.fromCharCode(parseInt(x,16)^CK.charCodeAt(i%CK.length))).join('')}catch(_e){return''}}
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);h=h&0x7fffffff}return h}
function adminHash(code){const S="MassagePay2026!Adm";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function genAdminAct(code,uuid){const b=`ADM:${code}:${uuid}`;return['#DELTA','#ECHO','#FOXTROT'].map(s=>String(fnv(b+s)%10000).padStart(4,'0')).join('-')}
function revokeHash(code){const S="MassagePay2026!Rvk";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function approveHash(code,devId){const S="MassagePay2026!Apr";let h=fnv(S+code+':'+devId+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function supApproveHash(code){const S="MassagePay2026!Sup";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function genSimpleAct(code){const S="MassagePay2026!SimpleAct";let h=fnv(S+code+S);for(let i=0;i<50;i++)h=fnv(String(h)+S+code);const n=h%1000000000;const s=String(n).padStart(9,'0');return s.substring(0,3)+'-'+s.substring(3,6)+'-'+s.substring(6,9)}
// 4位數解鎖密碼驗證:必須4碼數字,不可4碼相同(如1111),不可連續遞增(1234)或連續遞減(4321)
function isValidPin(pin){
  const s=String(pin||'');
  if(!/^\d{4}$/.test(s))return false;
  if(/^(\d)\1{3}$/.test(s))return false;
  const d=s.split('').map(Number);
  let asc=true,desc=true;
  for(let i=1;i<4;i++){if(d[i]!==d[i-1]+1)asc=false;if(d[i]!==d[i-1]-1)desc=false;}
  if(asc||desc)return false;
  return true;
}
function encWithKey(text,key){return Array.from(text).map((c,i)=>(c.charCodeAt(0)^key.charCodeAt(i%key.length)).toString(16).padStart(2,'0')).join('')}
function decWithKey(hex,key){try{return hex.match(/.{2}/g).map((x,i)=>String.fromCharCode(parseInt(x,16)^key.charCodeAt(i%key.length))).join('')}catch(_e){return''}}
function actKey(code,devId){return code+':'+devId+':ACT2026'}
// 4位密碼→傳輸/儲存用憑證(用老師編號當key加密,GAS端只需字串比對,不需能解密回明文)
function lockPwdCred(code,pwd){return encWithKey(String(pwd||''),String(code||'')+':LOCKPWD2026')}
function genActWithToken(code,devId,ghCfg){const payload=JSON.stringify({t:ghCfg.token,o:ghCfg.owner,r:ghCfg.repo});return encWithKey(payload,actKey(code,devId))}
function verifyActToken(actCode,code,devId){try{const json=decWithKey(actCode.trim(),actKey(code,devId));const d=JSON.parse(json);if(d.t&&d.o&&d.r)return{token:d.t,owner:d.o,repo:d.r};return null;}catch(_e){return null}}
/* ── 基資/店資 申請碼 + 確認碼 ──
   申請碼:類別碼(B=基資 S=店資)+ 加密payload(老師端key)
   確認碼:類別碼(小寫 b/s)+ 短碼(payload內容hash) */
const REQ_CAT={basic:'B',store:'S',conn:'C',supapply:'A'};
// 統一識別申請碼類型(看第一字元)→ {cat,bound} 或 null
function identifyReqCode(s){const x=(s||'').trim();if(!x)return null;const c1=x[0];const up=c1.toUpperCase();const map={B:'basic',S:'store',C:'conn',A:'supapply'};const cat=map[up];if(!cat)return null;return{cat,catChar:c1,bound:c1===up,body:x.slice(1)}}
// 把長碼切成多段參數連結:req=...&req2=...&req3=...（每段預設500字，避開LINE單段約600字辨識上限）
function buildReqLink(base,code,seg,prefix){const S=seg||500;const P=prefix||'req';const parts=[];for(let i=0;i<code.length;i+=S)parts.push(code.slice(i,i+S));let url=base+'#'+P+'='+encodeURIComponent(parts[0]);for(let i=1;i<parts.length;i++)url+='&'+P+(i+1)+'='+encodeURIComponent(parts[i]);return url}
// 通用行為代碼Flex分享:導去safety-report.html的LIFF正式網址代發Flex卡片(shareTargetPicker一定要透過liff.line.me網址正式啟動LIFF才能用)
const TICKET_FLEX_LIFF_ID='2010673151-kemVP4Pi';
function sendTicketFlex(title,body,link,viBody){
  const fullBody=viBody?(body+'\n\n'+viBody):body;
  const uri='https://liff.line.me/'+TICKET_FLEX_LIFF_ID+'?flexTitle='+encodeURIComponent(title)+'&flexBody='+encodeURIComponent(fullBody||'')+'&flexLink='+encodeURIComponent(link);
  location.href=uri;
}
// 從 hash 還原完整碼：依序接回 req,req2,req3...
function parseReqHash(hash,prefix){const P=prefix||'req';const h=(hash||'').replace(/^#/,'');if(!h)return null;const params={};h.split('&').forEach(kv=>{const idx=kv.indexOf('=');if(idx>0){const k=kv.slice(0,idx);const v=kv.slice(idx+1);params[k]=v}});if(params[P]===undefined)return null;let code='';try{code=decodeURIComponent(params[P])}catch(_e){code=params[P]}let n=2;while(params[P+n]!==undefined){try{code+=decodeURIComponent(params[P+n])}catch(_e){code+=params[P+n]}n++}return code}
// 連線申請碼:C + code:uuid(老師→主管,主管產生連線碼用)
function genConnReq(code,devId){return 'C'+code+':'+devId}
function parseConnReq(s){const id=identifyReqCode(s);if(!id||id.cat!=='conn')return null;const parts=id.body.split(':');if(parts.length<2)return null;return{code:parts[0],uuid:parts.slice(1).join(':')}}
// 主管申請碼:A + xEnc(code:uuid:devName)
function genSupReq(code,devId,devName){return 'A'+xEnc(code+':'+devId+':'+(devName||'unknown'))}
function parseSupReq(s){const id=identifyReqCode(s);if(!id||id.cat!=='supapply')return null;try{const dec=xDec(id.body);const parts=dec.split(':');if(parts.length<2)return null;return{code:parts[0],uuid:parts[1],devName:parts.slice(2).join(':')||''}}catch(_e){return null}}
function genReqCode(cat,code,devId,fields,bound){const payload=JSON.stringify({cat,code,uuid:devId||'',fields,ts:Date.now()});const enc=xEnc(encodeURIComponent(payload));const c1=(REQ_CAT[cat]||'X');return (bound?c1:c1.toLowerCase())+enc}
function parseReqCode(reqCode){const s=(reqCode||'').trim();if(!s)return null;const c1=s[0];const up=c1.toUpperCase();const cat=up==='B'?'basic':up==='S'?'store':null;if(!cat)return null;const bound=(c1===up);return{cat,catChar:c1,bound,enc:s.slice(1)}}
function decReqCode(reqCode){const p=parseReqCode(reqCode);if(!p)return null;try{const json=decodeURIComponent(xDec(p.enc));const d=JSON.parse(json);if(d.cat&&d.fields)return{cat:d.cat,code:d.code,uuid:d.uuid||'',fields:d.fields,ts:d.ts,boundClaim:p.bound};return null}catch(_e){return null}}
// 確認碼:類別小寫 + 6碼(由 code+cat+欄位值 算hash);老師端用相同算法驗證
function genConfirmCode(cat,code,fields){const S='MPConfirm2026';const f=fields||{};const sortedKeys=Object.keys(f).filter(k=>{const v=f[k];if(v===undefined||v===null||v==='')return false;if(Array.isArray(v)&&v.length===0)return false;return true}).sort();const norm=sortedKeys.map(k=>{let v=f[k];if(Array.isArray(v))v=v.slice().sort().join(',');return k+'='+String(v)}).join('&');const base=S+code+cat+norm+S;let h=fnv(base);for(let i=0;i<30;i++)h=fnv(String(h)+S);const n=h%1000000;const up=(REQ_CAT[cat]||'X');return up+String(n).padStart(6,'0')}
function verifyConfirmCode(confirmCode,cat,code,fields){const s=(confirmCode||'').trim();if(!s)return false;const expect=genConfirmCode(cat,code,fields);return s.toUpperCase()===expect.toUpperCase()}
function confirmCodeIsBound(confirmCode){const s=(confirmCode||'').trim();if(!s)return false;return s[0]===s[0].toUpperCase()}
function genUUID(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16)})}
function getDeviceId(){let id=localStorage.getItem('device-uuid');if(!id){id=genUUID();localStorage.setItem('device-uuid',id)}return id}

/* ══════════ Supervisor levels ══════════ */
const SUP_LEVELS=[{id:1,zh:'實習副理',vi:'Phó QL thực tập'},{id:2,zh:'副理',vi:'Phó quản lý'},{id:3,zh:'經理',vi:'Quản lý'},{id:4,zh:'區經理',vi:'Quản lý khu vực'},{id:5,zh:'執行長',vi:'Giám đốc'}];
function supLevelName(id,lang){const lv=SUP_LEVELS.find(l=>l.id===id);return lv?(lv[lang]||lv.zh):''}
function effSupLevel(level){return level}

/* ══════════ GitHub API ══════════ */
const GH_KEY='github-config';
function getGHConfig(){return LS.get(GH_KEY)||{}}
function saveGHConfigLocal(cfg){LS.set(GH_KEY,cfg)}
async function saveGHConfig(cfg){LS.set(GH_KEY,cfg)}
async function ghReadFile(cfg,path){const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{headers:{'Authorization':`token ${cfg.token}`,'Accept':'application/vnd.github.v3+json'}});if(!res.ok)return null;const data=await res.json();return{content:atob(data.content.replace(/\n/g,'')),sha:data.sha}}
async function ghWriteFile(cfg,path,content,sha,msg){const body={message:msg||'update '+path,content:btoa(unescape(encodeURIComponent(content)))};if(sha)body.sha=sha;const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{method:'PUT',headers:{'Authorization':`token ${cfg.token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return res.ok}
async function ghAppendLine(cfg,path,line,msg){const file=await ghReadFile(cfg,path);if(!file){try{const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{method:'PUT',headers:{'Authorization':'token '+cfg.token,'Content-Type':'application/json'},body:JSON.stringify({message:msg||'create '+path,content:btoa(unescape(encodeURIComponent(line+'\n')))})});if(res.ok)return{ok:true};const err=await res.json().catch(()=>({}));return{ok:false,reason:err.message||'HTTP '+res.status};}catch(e){return{ok:false,reason:e.message||'network error'}}}const newContent=file.content.trim()+'\n'+line+'\n';const ok=await ghWriteFile(cfg,path,newContent,file.sha,msg);return ok?{ok:true}:{ok:false,reason:'write failed'}}
async function ghRemoveLine(cfg,path,line,msg){const file=await ghReadFile(cfg,path);if(!file)return false;const lines=file.content.split('\n').filter(l=>l.trim()!==line.trim());return ghWriteFile(cfg,path,lines.join('\n'),file.sha,msg)}

/* ══════════ Staff / Stores / Approvals ══════════ */
async function readStaff(gh){try{const res=await fetch('./staff.json',{cache:'no-store'});if(!res.ok)return[];const enc=(await res.text()).trim();if(!enc)return[];const raw=xDec(enc);try{return JSON.parse(decodeURIComponent(raw))}catch(_e){try{return JSON.parse(raw)}catch(_e){return[]}}}catch(_e){return[]}}
async function writeStaff(gh,staffList){
  // 改走GAS存Staff Sheet(第一階段:只動寫入,讀取仍是下面readStaff()打staff.json不動)。
  // GAS saveStaff內部會存Sheet(真實來源)+容錯寫回staff.json(維持這個readStaff()讀取路徑不變)。
  try{
    const json=JSON.stringify(staffList);
    const enc=xEnc(encodeURIComponent(json));
    const myCode=((LS.get('app-settings')||{}).code)||'';
    const r=await gasCallPost('saveStaff',{staff:enc,code:myCode},30000);
    return !!(r&&r.ok);
  }catch(_e){return false}
}
async function checkApproved(type,hash){try{const res=await fetch('./approved.cfg',{cache:'no-store'});if(!res.ok)return null;const text=await res.text();const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));for(const line of lines){const parts=line.split(':');if(parts[0]===type&&parts[1]===hash)return{level:parts[2]?parseInt(parts[2]):0}}return null;}catch(_e){return null}}
async function writeApproval(gh,type,hash,level){const line=level?`${type}:${hash}:${level}`:`${type}:${hash}`;return ghAppendLine(gh,'approved.cfg',line,'approve '+type+' '+hash)}
async function loadStores(){try{const res=await fetch('./stores.cfg',{cache:'no-store'});if(!res.ok)return['龍山寺店'];const text=(await res.text()).trim();const stores=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));return stores.length?stores:['龍山寺店'];}catch(_e){return['龍山寺店']}}
async function saveStores(gh,stores){if(!gh.token)return false;const content=stores.join('\n')+'\n';const file=await ghReadFile(gh,'stores.cfg');if(file)return ghWriteFile(gh,'stores.cfg',content,file.sha,'update stores');try{const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/stores.cfg`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create stores.cfg',content:btoa(unescape(encodeURIComponent(content)))})});return res.ok;}catch(_e){return false}}
/* ══════════ 統計快照(stats.json) ══════════ */
// 從 staffList 算統計(班別比/性別比/上工人數),可選店篩選
function computeStats(staffList,storeFilter){const rows=(staffList||[]).filter(s=>s.role!=='admin'&&(!storeFilter||s.store===storeFilter));const shifts={day:0,night:0,other:0};const genders={M:0,F:0,other:0};rows.forEach(s=>{const sh=s.shift;if(sh==='day')shifts.day++;else if(sh==='night')shifts.night++;else shifts.other++;const g=s.gender;if(g==='M')genders.M++;else if(g==='F')genders.F++;else genders.other++});const workHours=Array.from({length:24},()=>0);const workStart=Array.from({length:24},()=>0);rows.forEach(s=>{if(!s.workStart)return;const h0=Number(String(s.workStart).split(':')[0]);if(isNaN(h0))return;workStart[h0]++;let eh=s.workEnd?Number(String(s.workEnd).split(':')[0]):(h0+12)%24;if(isNaN(eh))eh=(h0+12)%24;let h=h0;for(let i=0;i<24;i++){workHours[h]++;if(h===eh)break;h=(h+1)%24;if(h===h0)break}});return{total:rows.length,shifts,genders,workHours,workStart,updatedAt:Date.now()}}
// 主管發布快照到 stats.json
async function publishStats(gh,stats){if(!gh||!gh.token)return false;const content=JSON.stringify(stats);try{const file=await ghReadFile(gh,'stats.json');if(file)return ghWriteFile(gh,'stats.json',content,file.sha,'update stats');const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/stats.json`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create stats.json',content:btoa(unescape(encodeURIComponent(content)))})});return res.ok}catch(_e){return false}}
// 老師端讀公開快照
async function loadStats(){try{const res=await fetch('./stats.json',{cache:'no-store'});if(!res.ok)return null;return await res.json()}catch(_e){return null}}
function getApproved(){return LS.get('approved-supervisors')||[]}
function saveApproved(list){LS.set('approved-supervisors',list)}
function addApproved(code,devName){const list=getApproved();list.push({code,devName,ts:Date.now(),revoked:false});saveApproved(list)}

/* ══════════ Logs ══════════ */
function addLog(msg,level='admin'){const logs=LS.get('admin-log')||[];const s=LS.get('app-settings');const operator=s?.code||'';logs.push({ts:Date.now(),msg,level:level||'admin',op:operator});if(logs.length>200)logs.splice(0,logs.length-200);LS.set('admin-log',logs)}
function getLogs(filterLevel){const logs=(LS.get('admin-log')||[]).reverse();if(!filterLevel)return logs;if(filterLevel==='teacher')return logs.filter(l=>l.level==='teacher');if(filterLevel==='supervisor')return logs.filter(l=>l.level==='teacher'||l.level==='supervisor');return logs}
function fmtLog(s,args){return args.reduce((r,a,i)=>r.replace(`{${i}}`,a),s)}
function fmtDate(ts){const d=new Date(ts);return`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}

/* ══════════ Theme ══════════ */
const THEMES={pink:'#fce4f6',black:'#030712',white:'#f9fafb',gray:'#1f2937'};

/* ══════════ Data helpers (salary tracking) ══════════ */
const SKILL_KEYS=['guasha','baguang','xiujiao'];
const SKILL_SHORT=['gs','bg','xj'];
const SKILL_PRICES=[250,250,300];
const SKILL_COLORS=['text-cyan-400','text-violet-400','text-pink-400'];
const SK=["normal","sick","late","rest","personal","early"];
const SBG=["","bg-red-500/20","bg-yellow-500/20","bg-blue-500/20","bg-purple-500/20","bg-orange-500/20"];
const STC=["","text-red-300","text-yellow-300","text-blue-300","text-purple-300","text-orange-300"];
const canWork=[true,false,true,false,false,true];
const toB36=n=>Math.min(Math.max(Math.round(n),0),35).toString(36);
const fromB36=c=>parseInt(c,36)||0;
const dim=(y,m)=>new Date(y,m,0).getDate();
const dow=(y,m,d)=>new Date(y,m-1,d).getDay();
/* ── 營業日：分界 6:30。凌晨 0:00–6:29 算前一天 ──
   傳入可選的 Date（預設現在），回傳調整後的 Date 物件 */
const BIZ_CUTOFF_MIN=6*60+30;
function getBizCutoff(){try{const s=LS.get("app-settings");if(s&&s.bizCutoff){const p=String(s.bizCutoff).split(":");const mm=parseInt(p[0])*60+parseInt(p[1]||"0");if(!isNaN(mm)&&mm>=0&&mm<1440)return mm}}catch(_e){}return BIZ_CUTOFF_MIN}
function bizDate(now){now=now||new Date();const mins=now.getHours()*60+now.getMinutes();const cut=getBizCutoff();const d=new Date(now);if(mins<cut){d.setDate(d.getDate()-1)}d.setHours(12,0,0,0);return d}
function bizParts(now){const d=bizDate(now);return{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate(),dow:d.getDay()}}
const dk=(c,y,m)=>`data-${c}-${y}-${String(m).padStart(2,'0')}`;
const eDay=()=>({groups:[],total:0,laodian:0,status:0,skills:{guasha:0,baguang:0,xiujiao:0},slips:[],did:'',ts:0});
const stamp=(dd)=>{dd.did=getDeviceId();dd.ts=Date.now();return dd};
/* ══════════ 流水記錄(客管明細,與計薪總數獨立) ══════════ */
// 一筆流水:{id,units,createdAt,startAt(修正開始時間,空=用createdAt),tags[]}
function newSlip(units){const now=Date.now();return{id:'S'+now+Math.floor(Math.random()*1000),units:units||1,laodian:0,createdAt:now,startAt:0,tags:[],custName:'',custTitle:'',custPhone:'',svc:'',extra:0,pressBody:'',pressFoot:'',parts:[],reqs:[],laodianOut:'',shiftOut:''}}
// 客管欄位常數
const PRESS_LEVELS=['light','normal','heavy'];
const BODY_PARTS=['head','shoulder','upperback','lowerback','waist','butt','thigh','calf','arm'];
const CLIENT_REQS=['male','female','tw','vn','cn'];
// 客戶資料庫(存受力/部位等固定屬性,key=電話優先,無電話用 姓+稱謂)
function custKey(name,title,phone){const p=(phone||'').trim();if(p)return 'p:'+p;const n=(name||'').trim();const t=(title||'').trim();if(n)return 'n:'+n+'|'+t;return ''}
// ===== GAS 後端呼叫層(1.10 GAS整合,疊加在現有機制,gasUrl未設定時全部略過不影響原流程) =====
// 內建 GAS 網址 + 批量領取碼(過渡期批量發放用)
// BUILTIN_GAS_URL: 你的 exec 網址(乾淨的,不帶任何密碼)
// BUILTIN_BATCH_CODE: 只能「領金鑰」的專用碼(對應 GAS 的 BATCH_CODE 屬性)
//   洩漏危害極小(最多幫已啟動老師領金鑰,拿不到 adminSecret、不能作廢)。
//   大部分老師領完後,清空這兩個 + 到 GAS 清掉 BATCH_CODE 屬性即停用。
const BUILTIN_GAS_URL='https://script.google.com/macros/s/AKfycbzH6TqbO1-Xe6UkLKqn5OSbsz18rtVQ4Ze-xe9VDmMxlmMum9XZi26FK3hJJfNClOhrIw/exec';
const BUILTIN_BATCH_CODE='%X7KrJx6j?7FNGhG7o}#';
function getGasUrl(){try{const s=LS.get('app-settings');if(s&&s.gasUrl)return s.gasUrl}catch(_e){}try{const u=localStorage.getItem('gas-url');if(u)return u}catch(_e){}return BUILTIN_GAS_URL||''}
function getBuiltinGasUrl(){return BUILTIN_GAS_URL||''}
// 老師是否該看到「更新領金鑰」提示:有內建網址+領取碼+還沒領過金鑰
function shouldClaimKey(code){try{if(!code)return false;if(!BUILTIN_GAS_URL||!BUILTIN_BATCH_CODE)return false;if(hasMyKey(code))return false;return true}catch(_e){return false}}
// 用內建網址+batchCode 領自己金鑰(batchClaim 只能領,不能管理)
async function autoClaimKey(code){
  if(!code)return{ok:false};if(!BUILTIN_GAS_URL||!BUILTIN_BATCH_CODE)return{ok:false};
  try{
    const url=BUILTIN_GAS_URL+(BUILTIN_GAS_URL.indexOf('?')>=0?'&':'?')+'action=batchClaim&code='+encodeURIComponent(code)+'&batch='+encodeURIComponent(BUILTIN_BATCH_CODE);
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),8000);
    const res=await fetch(url,{signal:ctrl.signal});clearTimeout(to);
    if(!res.ok)return{ok:false};
    const r=await res.json();
    if(r&&r.ok&&r.key){setMyKey(code,r.key);return{ok:true,key:r.key}}
    return{ok:false,error:(r&&r.error)||'fail'}
  }catch(_e){return{ok:false,error:'network'}}
}
// 診斷:模擬指定編號領金鑰,回傳完整過程(管理者用)
async function diagClaimKey(code){
  const info={code:code,hasBuiltinUrl:!!BUILTIN_GAS_URL,hasBuiltinBatch:!!BUILTIN_BATCH_CODE,builtinUrlPreview:BUILTIN_GAS_URL?BUILTIN_GAS_URL.slice(0,45)+'…':'(空)',alreadyHasKey:hasMyKey(code),shouldClaim:shouldClaimKey(code)};
  if(!BUILTIN_GAS_URL){info.result='fail';info.reason='common.js的BUILTIN_GAS_URL是空的(沒填或部署未更新)';return info}
  if(!BUILTIN_BATCH_CODE){info.result='fail';info.reason='common.js的BUILTIN_BATCH_CODE是空的';return info}
  try{
    const url=BUILTIN_GAS_URL+(BUILTIN_GAS_URL.indexOf('?')>=0?'&':'?')+'action=batchClaim&code='+encodeURIComponent(code)+'&batch='+encodeURIComponent(BUILTIN_BATCH_CODE);
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),15000);
    const res=await fetch(url,{signal:ctrl.signal});clearTimeout(to);
    info.httpStatus=res.status;
    if(!res.ok){info.result='fail';info.reason='HTTP '+res.status+'(網址錯或GAS未部署)';return info}
    const r=await res.json();
    info.gasResponse=JSON.stringify(r);
    if(r&&r.ok&&r.key){info.result='ok';info.reason='領取成功,金鑰='+String(r.key).slice(0,20)+'…';return info}
    info.result='fail';info.reason='GAS拒絕:'+((r&&r.error)||'unknown')+'(bad batch=領取碼不符/no key yet=尚未產金鑰/revoked=已停用)';return info
  }catch(e){info.result='fail';info.reason='連線例外:'+(e&&e.name||e)+'(逾時或連不到)';return info}
}
function setGasUrl(url){try{localStorage.setItem('gas-url',url||'')}catch(_e){}}
async function gasCall(action,params,timeoutMs){
  const url=getGasUrl();if(!url)return null;
  try{
    const qs=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
    const full=url+(url.indexOf('?')>=0?'&':'?')+'action='+encodeURIComponent(action)+(qs?'&'+qs:'');
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),timeoutMs||8000);
    const res=await fetch(full,{signal:ctrl.signal});clearTimeout(to);
    if(!res.ok)return null;
    return await res.json();
  }catch(_e){return null}
}
function gasWarmup(){try{if(getGasUrl())gasCall('ping',{})}catch(_e){}}
// POST版(JSON body,不塞網址):給資料量大的動作用(如staff整包陣列),GET網址長度會爆
// 刻意不設Content-Type header(讓瀏覽器預設text/plain),避免觸發CORS預檢請求導致GAS網頁應用失敗
async function gasCallPost(action,params,timeoutMs){
  const url=getGasUrl();if(!url)return null;
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),timeoutMs||15000);
    const body=Object.assign({action:action},params||{});
    const res=await fetch(url,{method:'POST',body:JSON.stringify(body),signal:ctrl.signal});
    clearTimeout(to);
    if(!res.ok)return null;
    return await res.json();
  }catch(_e){return null}
}
// 公告:從GAS讀取存本機(這階段不驗證)
function getNoticesLocal(){try{const v=LS.get('notices-cache');return Array.isArray(v)?v:[]}catch(_e){return []}}
function saveNoticesLocal(list){try{LS.set('notices-cache',list||[])}catch(_e){}}
// 老師端:強制讀 GitHub 的 notices.json(公開、免金鑰、免GAS)。有就顯示,無則空
async function fetchNotices(){
  try{
    const res=await fetch('./notices.json?t='+Date.now(),{cache:'no-store'});
    if(res.ok){const txt=(await res.text()).trim();if(txt){const data=JSON.parse(txt);
      if(Array.isArray(data)){saveNoticesLocal(data);return data} // 舊格式:純陣列
      if(data&&Array.isArray(data.notices)){saveNoticesLocal(data.notices);try{localStorage.setItem('notices-homecount',String(data.homeCount!=null?data.homeCount:2))}catch(_e){}try{localStorage.setItem('notices-show',JSON.stringify(data.show||{}))}catch(_e){}try{localStorage.setItem('notices-listtext',data.listText||'summary')}catch(_e){}try{localStorage.setItem('notices-counttype',data.countType||'people')}catch(_e){}try{localStorage.setItem('notices-maincats',JSON.stringify(data.mainCats||[]))}catch(_e){}return data.notices} // 新格式
    }}
  }catch(_e){}
  return getNoticesLocal();
}
// 首頁要顯示幾筆(來自notices.json的homeCount,預設2)
function getNoticeHomeCount(){try{const v=localStorage.getItem('notices-homecount');const n=v!=null?parseInt(v,10):2;return isNaN(n)?2:n}catch(_e){return 2}}
// 公告欄位顯示開關(主分類/子分類/標籤),預設都不顯示
function getNoticeShow(){try{const v=localStorage.getItem('notices-show');const o=v?JSON.parse(v):{};return {cat:!!o.cat,subcat:!!o.subcat,tags:!!o.tags}}catch(_e){return {cat:false,subcat:false,tags:false}}}
// 完整的主分類清單(含中越文對照),不受目前有沒有公告限制,固定顯示全部分類分頁按鈕用
function getNoticeMainCats(){try{const v=localStorage.getItem('notices-maincats');return v?JSON.parse(v):[]}catch(_e){return []}}
// 列表文字用標題還是摘要(主管在公告更新按鈕選的),預設摘要
function getNoticeListText(){try{return localStorage.getItem('notices-listtext')||'summary'}catch(_e){return 'summary'}}
// 開啟次數顯示人數(不重複)還是人次(全部),預設人數
function getNoticeCountType(){try{return localStorage.getItem('notices-counttype')||'people'}catch(_e){return 'people'}}
// 管理者:去GAS抓最新N筆公告,寫成 notices.json 存 GitHub(供老師公開讀取)
async function publishNotices(homeCount,listCount,show,onStep,opts){
  const step=(s)=>{try{if(onStep)onStep(s)}catch(_e){}};
  if(!getGasUrl()){return {ok:false,error:'no gas url',step:'GAS網址'};}
  step('請GAS產生公告靜態檔(含已讀統計)…');
  let r;
  const sh=show||{};const op=opts||{};
  try{r=await gasCall('publishNotices',{homeCount:homeCount,listCount:listCount,showCat:sh.cat?1:'',showSubcat:sh.subcat?1:'',showTags:sh.tags?1:'',listText:op.listText||'summary',countType:op.countType||'people'},40000);}catch(e){return {ok:false,error:'gas exception:'+e,step:'連GAS'};}
  if(!r){return {ok:false,error:'GAS無回應(連不到或逾時40秒)',step:'連GAS'};}
  if(!r.ok){return {ok:false,error:'GAS錯:'+(r.error||'unknown')+'(可能GAS缺GH_TOKEN/GH_OWNER/GH_REPO屬性,或未重新部署)',step:'GAS寫GitHub'};}
  step('完成,共'+(r.count||0)+'筆');
  return {ok:true,count:r.count||0};
}
// 公告顯示文字(依語言選中/越文,越文空則用中文)
function noticeBody(n,lang){if(!n)return '';if(lang==='vi'&&n.bodyVi&&n.bodyVi.trim())return n.bodyVi;return n.body||''}
// 列表用:依語系選標題/摘要,越文空則fallback中文
function noticeTitle(n,lang){if(!n)return '';if(lang==='vi'&&n.titleVi&&n.titleVi.trim())return n.titleVi;return n.title||''}
function noticeSummary(n,lang){if(!n)return '';if(lang==='vi'&&n.summaryVi&&n.summaryVi.trim())return n.summaryVi;return n.summary||''}
// 公告主分類清單(去重)
function noticeCats(list){const s={};(list||[]).forEach(n=>{if(n.cat)s[n.cat]=1});return Object.keys(s)}
// 公告標籤清單(標籤欄可能逗號/空格分隔)
function noticeTags(list){const s={};(list||[]).forEach(n=>{String(n.tags||'').split(/[,、\s]+/).forEach(t=>{const tt=t.trim();if(tt)s[tt]=1})});return Object.keys(s)}
// 金鑰本機存取
function getMyKey(code){try{return localStorage.getItem('gaskey-'+code)||''}catch(_e){return ''}}
// 公告已讀:本機記錄哪些已讀
function getReadNotices(){try{return LS.get('notices-read')||{}}catch(_e){return {}}}
function isNoticeRead(id){try{return !!getReadNotices()[id]}catch(_e){return false}}
function setNoticeReadLocal(id){try{const r=getReadNotices();r[id]=Date.now();LS.set('notices-read',r)}catch(_e){}}
// 帶金鑰記已讀→GAS,回該公告人數
async function markNoticeRead(code,noticeId){
  const key=getMyKey(code);
  if(!key)return {ok:false,error:'no key'};
  const r=await gasCall('readNotice',{code:code,key:key,noticeId:noticeId},12000);
  if(r&&r.ok){setNoticeReadLocal(noticeId);return {ok:true,count:r.count}}
  return {ok:false,error:(r&&r.error)||'fail'}
}
// 查公告已讀人數:優先從靜態公告(notices.json含readCount),省GAS
function getNoticeReadCount(noticeId){
  try{const list=getNoticesLocal();const n=(list||[]).find(x=>String(x.id)===String(noticeId));if(n&&typeof n.readCount==='number')return n.readCount;}catch(_e){}
  return null;
}
// 查公告閱讀人員清單:優先靜態(notices.json含readers);沒有才即時查GAS
async function getNoticeReaders(noticeId){
  try{const list=getNoticesLocal();const n=(list||[]).find(x=>String(x.id)===String(noticeId));if(n&&Array.isArray(n.readers))return n.readers;}catch(_e){}
  const r=await gasCall('noticeReads',{noticeId:noticeId,detail:1},10000);
  if(r&&r.ok&&Array.isArray(r.readers))return r.readers;
  return null;
}
// 未讀清單(GAS即時算:在職老師－已讀,分早晚班)。回 {ok,day[],night[],other[],total}
async function getNoticeUnread(noticeId){
  const r=await gasCall('noticeUnread',{noticeId:noticeId},15000);
  if(r&&r.ok)return r;
  return {ok:false,error:(r&&r.error)||'GAS無回應',day:[],night:[],other:[],total:0};
}
// AI翻譯公告中文→越南文
async function gasTranslate(text,code,feature){
  const r=await gasCallPost('translateNotice',{text:text,code:code||'',feature:feature||'翻譯測試'},40000);
  return r||{ok:false,error:'GAS無回應'};
}
// AI分析公告:內容→分類/標籤/標題/摘要/越南文
async function gasAddNotice(data){
  const r=await gasCallPost('addNotice',data,20000);
  return r||{ok:false,error:'GAS無回應'};
}
// 主管線上編輯既有公告(改中文,GAS背景自動翻越南文)。data需含id,其餘cat/subcat/title/summary/body/tags只帶有改的欄位
async function gasEditNotice(data){
  const r=await gasCallPost('editNotice',data,45000);
  return r||{ok:false,error:'GAS無回應'};
}
// ===== 行為代碼+流水 通用審核架構 =====
// 送出一個待審核動作(如新老師啟動N、忘記密碼F),回{ok,seq}
async function gasSubmitAction(actionCode,code,payload){
  const r=await gasCallPost('submitAction',{actionCode,code,payload:JSON.stringify(payload||{})},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 查詢流水號目前狀態(pending/approved/used/rejected)
async function gasCheckAction(seq){
  const r=await gasCall('checkAction',{seq},10000);
  return r||{ok:false,error:'GAS無回應'};
}
// 拒接黑名單(K代碼)查詢/送出/核准/查詢清單
async function gasBlacklistSubmit(teacherCode,custName,custTitle,custPhone,reason){
  const r=await gasCallPost('blacklistSubmit',{teacherCode,custName,custTitle,custPhone,reason},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasBlacklistCheck(seq){
  const r=await gasCall('blacklistCheck',{seq},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasBlacklistApprove(seq,code,approve){
  const r=await gasCallPost('blacklistApprove',{seq,code,approve},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasBlacklistSearch(q){
  const r=await gasCall('blacklistSearch',{q},10000);
  return r||{ok:false,error:'GAS無回應'};
}
// 待審核登記(G代碼)查詢/核准,用密碼登入的員工編號驗證(auth.html專用,不需要LINE身分)
async function gasSfGetPendingDetail(code,reqId){
  const r=await gasCall('sfGetPendingDetail',{code,reqId},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasSfApprovePendingRegistration(code,reqId,approve){
  const r=await gasCallPost('sfApprovePendingRegistration',{code,reqId,approve},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 主管核准動作(建staff/標記approved)
async function gasApproveAction(seq,code,level){
  const params={seq,code};
  if(level!=null)params.level=level;
  const r=await gasCallPost('approveAction',params,20000);
  return r||{ok:false,error:'GAS無回應'};
}
// 忘記密碼核准後,設定新密碼(需帶已核准的F流水號)
async function gasUpdatePwd(code,seq,lockPwdEnc){
  const r=await gasCallPost('updatePwd',{code,seq,lockPwdEnc},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 密碼登入(換機用):比對GAS Staff裡存的密碼憑證
async function gasLoginPwd(code,lockPwdEnc){
  const r=await gasCall('loginPwd',{code,lockPwdEnc},10000);
  return r||{ok:false,error:'GAS無回應'};
}
// 首次設定密碼(非忘記密碼重設,已有密碼會被GAS拒絕)
async function gasSetInitialPwd(code,lockPwdEnc){
  const r=await gasCallPost('setInitialPwd',{code,lockPwdEnc},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 自助式忘記密碼(鎖屏畫面直接重設,不透過主管審核):跟gasSetInitialPwd不同,不管原本有沒有密碼都直接覆蓋
async function gasResetLockPwd(code,lockPwdEnc){
  const r=await gasCallPost('resetLockPwd',{code,lockPwdEnc},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 已通過本機信任檢查(admin.cfg/已核准)的老師啟動時,直接同步基本資料到Staff(不需要走N票證審核)
async function gasSyncProfile(code,payload){
  const r=await gasCallPost('syncProfile',{code,payload:JSON.stringify(payload||{})},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 查詢編號是否已經是Staff裡的已啟動老師(新老師啟動頁用來判斷該走新啟動還是密碼登入)
async function gasCheckCode(code){
  const r=await gasCall('checkCode',{code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
// 主管直接透過GAS讀取全部員工資料(不依賴GitHub靜態檔或本機Token)
async function gasAuthStaffList(code){
  const r=await gasCall('authStaffList',{code},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 主管自動取得GitHub設定(GAS指令碼屬性已存GH_OWNER/GH_REPO/GH_TOKEN,不用每次換裝置手動貼)
async function gasGetGHConfigForSupervisor(code){
  const r=await gasCall('getGHConfigForSupervisor',{code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
// 撤銷主管權限(GAS化,直接改staff role,不再需要寫revoked.cfg)
async function gasRevokeSup(targetCode,code){
  const r=await gasCallPost('revokeSup',{targetCode,code},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 退回申請(附理由)
async function gasRejectAction(seq,code,reason){
  const r=await gasCallPost('rejectAction',{seq,code,reason},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 查金鑰是否有效(含到期日檢查)。離職員工憑證過期後,靠這個擋公告/店資檢視、基資送出
async function gasVerifyKey(code,key){
  const r=await gasCall('verifyKey',{code,key},10000);
  return r||{ok:false,valid:false,error:'GAS無回應'};
}
// 記公告開啟(被動記錄,同人同公告只記一次,跟markNoticeRead的主動已讀是兩層)
async function gasLogNoticeOpen(noticeId,code){
  const r=await gasCall('logNoticeOpen',{noticeId,code},8000);
  return r||{ok:false,error:'GAS無回應'};
}
// 離職:staff狀態標記+憑證立即過期
async function gasLeaveTeacher(code,by){
  const r=await gasCallPost('leaveTeacher',{code,by:by||code},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 公告下架/上架切換
async function gasToggleNoticeStatus(id,code){
  const r=await gasCallPost('toggleNoticeStatus',{id,code},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasSubmitSuggestion(title,body,author,anon){
  const r=await gasCallPost('submitSuggestion',{title,body,author,anon},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasListSuggestions(){
  const r=await gasCall('listSuggestions',{},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasPushNoticeFlexToMe(noticeId,code){
  const r=await gasCallPost('pushNoticeFlexToMe',{noticeId,code},15000);
  return r||{ok:false,error:'GAS無回應'};
}
// 首頁一天一次的密碼+憑證檢查記錄
async function gasLogDailyCheck(code){
  const r=await gasCall('logDailyCheck',{code},8000);
  return r||{ok:false,error:'GAS無回應'};
}
// 團購(手套)
async function gasCreateGroupBuy(code,title,item,amount,deadline,scope){
  const r=await gasCallPost('createGroupBuy',{code,title,item,amount,deadline,scope},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasListGroupBuys(){
  const r=await gasCall('listGroupBuys',{},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasJoinGroupBuy(buyId,code,size,qty){
  const r=await gasCallPost('joinGroupBuy',{buyId,code,size,qty},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasMyGroupBuyOrders(code){
  const r=await gasCall('myGroupBuyOrders',{code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
// 天災安全回報
async function gasSubmitDisasterReport(params){
  const r=await gasCallPost('submitDisasterReport',params,15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasDeclineGroupBuy(buyId,code){
  const r=await gasCallPost('declineGroupBuy',{buyId,code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasLogGroupBuyOpen(buyId,code){
  const r=await gasCall('logGroupBuyOpen',{buyId,code},8000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasCloseGroupBuy(buyId,code){
  const r=await gasCallPost('closeGroupBuy',{buyId,code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasGroupBuyDetail(buyId){
  const r=await gasCall('groupBuyDetail',{buyId},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasSetGroupBuyOrderStatus(buyId,code,field){
  const r=await gasCallPost('setGroupBuyOrderStatus',{buyId,code,field},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasCreateDisasterSurvey(name,startDate,code,scope,message){
  const r=await gasCallPost('createDisasterSurvey',{name,startDate,code,scope,message},15000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasEndDisasterSurvey(id,code){
  const r=await gasCallPost('endDisasterSurvey',{id,code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasDeleteDisasterSurvey(id,code){
  const r=await gasCallPost('deleteDisasterSurvey',{id,code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasListDisasterSurveys(){
  const r=await gasCall('listDisasterSurveys',{},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasMyDisasterReports(surveyId,code){
  const r=await gasCall('myDisasterReports',{surveyId,code},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasDisasterDayStatus(surveyId,date){
  const r=await gasCall('disasterDayStatus',{surveyId,date},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasUsage(){
  const r=await gasCall('geminiUsage',{},10000);
  return r||{ok:false,error:'GAS無回應'};
}
async function gasAnalyze(content,code,feature){
  const r=await gasCallPost('analyzeNotice',{content:content,code:code||'',feature:feature||'分析測試'},40000);
  return r||{ok:false,error:'GAS無回應'};
}
function setMyKey(code,key){try{localStorage.setItem('gaskey-'+code,key||'')}catch(_e){}}
function hasMyKey(code){return !!getMyKey(code)}
// adminSecret 本機存取(管理者輸入一次後存,之後產金鑰自動用)
function getAdminSecret(){try{return localStorage.getItem('gas-admin-secret')||''}catch(_e){return ''}}
function setAdminSecret(s){try{localStorage.setItem('gas-admin-secret',s||'')}catch(_e){}}
function hasAdminSecret(){return !!getAdminSecret()}
// 主管端產金鑰(需adminSecret),回金鑰+領取碼
async function issueKey(code,adminSecret,role){const r=await gasCall('genKey',{code:code,adminSecret:adminSecret||'',role:role||'teacher'});return r||{ok:false,error:'no gas'}}
// 老師端憑領取碼領金鑰,存本機
async function claimMyKey(code,claim){if(!code||!claim)return{ok:false,error:'missing'};const ex=getMyKey(code);if(ex)return{ok:true,key:ex,already:true};const r=await gasCall('claimKey',{code:code,claim:claim});if(r&&r.ok&&r.key){setMyKey(code,r.key);return{ok:true,key:r.key}}return{ok:false,error:(r&&r.error)||'fail'}}
function loadCustDB(code){try{return LS.get('custdb-'+code)||{}}catch(e){return{}}}
function saveCustDB(code,db){LS.set('custdb-'+code,db)}
function getCust(code,name,title,phone){const k=custKey(name,title,phone);if(!k)return null;const db=loadCustDB(code);return db[k]||null}
function upsertCust(code,cust){const k=custKey(cust.custName,cust.custTitle,cust.custPhone);if(!k)return;const db=loadCustDB(code);const prev=db[k]||{};
  // 有舊資料、且真的有變動內容(壓力/施力部位)時,把舊版本存進history,不直接蓋掉消失
  const history=prev.history||[];
  const prevHasData=prev.pressBody||prev.pressFoot||(prev.parts&&prev.parts.length);
  const changed=prevHasData&&(prev.pressBody!==cust.pressBody||prev.pressFoot!==cust.pressFoot||JSON.stringify(prev.parts||[])!==JSON.stringify(cust.parts||[]));
  if(changed)history.push({pressBody:prev.pressBody||'',pressFoot:prev.pressFoot||'',parts:prev.parts||[],lastAt:prev.lastAt||0});
  db[k]={custName:cust.custName||prev.custName||'',custTitle:cust.custTitle||prev.custTitle||'',custPhone:cust.custPhone||prev.custPhone||'',pressBody:cust.pressBody!==undefined?cust.pressBody:(prev.pressBody||''),pressFoot:cust.pressFoot!==undefined?cust.pressFoot:(prev.pressFoot||''),parts:cust.parts!==undefined?cust.parts:(prev.parts||[]),lastAt:Date.now(),history:history};saveCustDB(code,db)}
function deleteCust(code,name,title,phone){const k=custKey(name,title,phone);if(!k)return false;const db=loadCustDB(code);if(db[k]){delete db[k];saveCustDB(code,db);return true}return false}
// 搜尋客戶DB(姓/稱謂/手機/hashtag)
function searchCustDB(code,q){q=(q||'').trim().toLowerCase();if(!q)return[];const db=loadCustDB(code);const out=[];for(const k in db){const c=db[k];const hay=((c.custName||'')+' '+(c.custTitle||'')+' '+(c.custPhone||'')).toLowerCase();if(hay.includes(q))out.push(c)}return out.sort((a,b)=>(b.lastAt||0)-(a.lastAt||0)).slice(0,8)}
function recentCust(code,n){const db=loadCustDB(code);const arr=[];for(const k in db)arr.push(db[k]);return arr.sort((a,b)=>(b.lastAt||0)-(a.lastAt||0)).slice(0,n||10)}
// 找某客戶最近一筆流水(顯示課程/日期)
function custLastSlip(code,year,name,title,phone){const k=custKey(name,title,phone);if(!k)return null;const all=collectAllSlips(code,year);let best=null;all.forEach(s=>{if(custKey(s.custName,s.custTitle,s.custPhone)===k){if(!best||(s.startTime||0)>(best.startTime||0))best=s}});return best}
// 流水支數/老點加總
function slipUnitsTotal(slips){return (slips||[]).reduce((a,s)=>a+(s.units||0),0)}
function slipLaodianTotal(slips){return (slips||[]).reduce((a,s)=>a+(Math.min(s.laodian||0,s.units||0)),0)}
// 一次性遷移:把舊分組 groups 轉成流水,之後只用流水。回傳是否有變動。
function migrateDayGroups(dd){
  if(!dd)return false;
  if(!dd.slips)dd.slips=[];
  if(dd.groups&&dd.groups.length>0){
    // 若已有流水,且流水支數已達total(表示首頁+N已同時寫過流水),只清groups不重複加
    const slipU=slipUnitsTotal(dd.slips);
    const groupU=dd.groups.reduce((a,b)=>a+(parseInt(b)||0),0);
    if(slipU>=(dd.total||0)&&slipU>0){
      // 流水已足額,舊分組是重複資料 → 直接丟棄
      dd.groups=[];
    }else{
      // 流水不足,把groups補成流水
      dd.groups.forEach(n=>{const v=parseInt(n)||0;if(v>0)dd.slips.push(newSlip(v))});
      dd.groups=[];
    }
    dd._migrated=1;
    // total 重算為流水加總
    dd.total=slipUnitsTotal(dd.slips);
    return true;
  }
  return false;
}
// 遷移整月(每天)
function migrateMonthGroups(md){if(!md||!md.days)return false;let changed=false;for(const d in md.days){if(migrateDayGroups(md.days[d]))changed=true}return changed}
// 流水服務項目顯示:FB3+2 形式(無svc時退回支數+N)
function slipSvcLabel(slip,lang){if(!slip)return '';const addWord=lang==='vi'?'thêm':'加';const parts=[];if(slip.svc)parts.push(slip.svc);if(slip.extra>0)parts.push(addWord+slip.extra);return parts.join(' ')}
// 取流水的有效開始時間(修正過優先)
function slipStartTime(slip){return slip.startAt||slip.createdAt}
// 全店歷史標籤(本機,跨日重用)
function loadTagHistory(code){return LS.get('tag-history-'+code)||[]}
function addTagHistory(code,tag){if(!tag)return;const h=loadTagHistory(code);if(!h.includes(tag)){h.unshift(tag);LS.set('tag-history-'+code,h.slice(0,40))}}
// 客群到訪統計:收集多個月day的流水,按開始時間的小時分0~23桶
// daysList: [{y,m,d,day}], 回傳 {hours:[24], weekdays:[7], total}
function visitStats(slipsWithTime){const hours=Array.from({length:24},()=>0);const weekdays=Array.from({length:7},()=>0);let total=0;slipsWithTime.forEach(({time,units})=>{const dt=new Date(time);hours[dt.getHours()]+=(units||1);weekdays[dt.getDay()]+=(units||1);total+=(units||1)});return{hours,weekdays,total}}
// 從本機讀某老師某年月的所有流水(附帶開始時間)
function collectSlips(code,year,month){const md=LS.get(dk(code,year,month));if(!md||!md.days)return[];const out=[];Object.values(md.days).forEach(dd=>{if(dd&&dd.slips)dd.slips.forEach(s=>out.push({time:slipStartTime(s),units:s.units,tags:s.tags||[]}))});return out}
// 收集某老師「整年」所有流水(附完整資訊),供客管分頁用
function collectAllSlips(code,year){const out=[];for(let m=1;m<=12;m++){const md=LS.get(dk(code,year,m));if(!md||!md.days)continue;Object.entries(md.days).forEach(([d,dd])=>{if(dd&&dd.slips)dd.slips.forEach(s=>out.push({...s,month:Number(m),day:Number(d),startTime:slipStartTime(s)}))})}return out}
// 統計所有 hashtag → [{tag,count}] 依數量降序
function tagStats(slips){const map={};slips.forEach(s=>{(s.tags||[]).forEach(tag=>{map[tag]=(map[tag]||0)+1})});return Object.entries(map).map(([tag,count])=>({tag,count})).sort((a,b)=>b.count-a.count)}
// 依姓名/稱謂/手機搜尋流水
function searchSlips(slips,q){q=(q||'').trim().toLowerCase();if(!q)return[];return slips.filter(s=>{const name=(s.custName||'').toLowerCase();const phone=(s.custPhone||'').toLowerCase();const title=(s.custTitle||'').toLowerCase();return name.includes(q)||phone.includes(q)||title.includes(q)})}
const calcSal=(day,unitPrice,enabledSkills)=>{let sal=day.total*unitPrice;const sk=day.skills||{};SKILL_KEYS.forEach((k,i)=>{if(enabledSkills?.[k])sal+=(sk[k]||0)*SKILL_PRICES[i]});return sal};
const eMon=()=>{const d={};for(let i=1;i<=31;i++)d[i]=eDay();return{days:d}};
// 找某老師某年有資料的頭尾月份 → {first,last} 或 null
function dataMonthRange(code,year){let first=null,last=null;for(let m=1;m<=12;m++){const d=LS.get(dk(code,year,m));if(d&&d.days&&Object.keys(d.days).length>0){if(first===null)first=m;last=m}}return first?{first,last}:null}
// 匯出有資料月份範圍的備份碼(多月,用換行串接)
function encRange(code,year){const r=dataMonthRange(code,year);if(!r)return'';const lines=[];for(let m=r.first;m<=r.last;m++){const d=LS.get(dk(code,year,m));if(d)lines.push(encMonth(code,year,m,d))}return lines.join('\n')}
// 解析多月備份碼(逐行 decBackup)→ [{code,year,month,data}]
function decRange(str){const out=[];(str||'').split(/[\n;]+/).map(s=>s.trim()).filter(Boolean).forEach(line=>{const p=decBackup(line);if(p)out.push(p)});return out}
function encMonth(code,y,m,data){let u="",l="",s="",sg="",sb="",sx="";for(let d=1;d<=31;d++){const day=d<=dim(y,m)&&data.days[d]?data.days[d]:eDay();const sk=day.skills||{};u+=toB36(day.total);l+=toB36(day.laodian);s+=day.status.toString();sg+=toB36(sk.guasha||0);sb+=toB36(sk.baguang||0);sx+=toB36(sk.xiujiao||0)}const hasSkills=sg.replace(/0/g,'')||sb.replace(/0/g,'')||sx.replace(/0/g,'');return`${code}-${y}-${String(m).padStart(2,'0')}:${u}:${l}:${s}${hasSkills?`:${sg}:${sb}:${sx}`:''}`}
// ===== 個人完整備份(加密 JSON 檔)=====
function exportPersonalData(code,year){
  const out={settings:LS.get('app-settings')||null,theme:localStorage.getItem('app-theme')||'pink',months:{}};
  for(let m=1;m<=12;m++){const d=LS.get(dk(code,year,m));if(d)out.months[m]=d}
  const bd=LS.get('booking-'+code);if(bd)out.booking=bd;
  const cdb=LS.get('custdb-'+code);if(cdb)out.custdb=cdb;
  const th=LS.get('tag-history-'+code);if(th)out.tagHistory=th;
  return out;
}
function makePersonalBackup(code,year){
  const data=exportPersonalData(code,year);
  const json=JSON.stringify(data);
  const checksum=fnv(json).toString(16);
  const payload=xEnc(encodeURIComponent(json));
  return{_app:'massage-pay',_type:'personal-backup',_ver:1,_code:code,_year:year,_exportAt:Date.now(),_checksum:checksum,payload};
}
function parsePersonalBackup(obj){
  try{
    if(!obj||obj._app!=='massage-pay'||obj._type!=='personal-backup')return{ok:false,reason:'notBackup'};
    if(!obj.payload)return{ok:false,reason:'broken'};
    const json=decodeURIComponent(xDec(obj.payload));
    if(!json)return{ok:false,reason:'broken'};
    if(obj._checksum&&fnv(json).toString(16)!==obj._checksum)return{ok:false,reason:'modified'};
    const data=JSON.parse(json);
    return{ok:true,code:obj._code,year:obj._year,data};
  }catch(e){return{ok:false,reason:'broken'}}
}
function restorePersonalBackup(parsed){
  const {code,year,data}=parsed;let okN=0,failN=0;
  try{if(data.settings){LS.set('app-settings',data.settings);okN++}}catch(_e){failN++}
  try{if(data.theme){localStorage.setItem('app-theme',data.theme);okN++}}catch(_e){failN++}
  if(data.months){Object.entries(data.months).forEach(([m,d])=>{try{LS.set(dk(code,year,Number(m)),d);okN++}catch(_e){failN++}})}
  try{if(data.booking){LS.set('booking-'+code,data.booking);okN++}}catch(_e){failN++}
  try{if(data.custdb){LS.set('custdb-'+code,data.custdb);okN++}}catch(_e){failN++}
  try{if(data.tagHistory){LS.set('tag-history-'+code,data.tagHistory);okN++}}catch(_e){failN++}
  return{okN,failN};
}
function decBackup(str){try{const c=str.replace(/^#/,'').trim();const parts=c.split(':');const hd=parts[0],units=parts[1],laodian=parts[2],status=parts[3];const sg=parts[4]||'',sb=parts[5]||'',sx=parts[6]||'';const p=hd.split('-');const m=parseInt(p.pop());const y=parseInt(p.pop());const code=p.join('-');if(!y||!m||m<1||m>12||!code)return null;const data=eMon();const dm=dim(y,m);for(let d=1;d<=dm;d++){const tot=fromB36(units?.[d-1]||'0');const lao=fromB36(laodian?.[d-1]||'0');const st=parseInt(status?.[d-1]||'0')||0;const slips=[];if(tot>0){const sp=newSlip(tot);sp.laodian=Math.min(lao,tot);sp.fromBackup=1;slips.push(sp)}data.days[d]={groups:[],total:tot,laodian:lao,status:st,slips:slips,skills:{guasha:fromB36(sg?.[d-1]||'0'),baguang:fromB36(sb?.[d-1]||'0'),xiujiao:fromB36(sx?.[d-1]||'0')}}}return{code,year:y,month:m,data}}catch(_e){return null}}

/* ══════════ 客戶 / 自約（本機，按老師代碼分 key） ══════════ */
const CUST_KEY=c=>`customers-${c}`;
const BOOK_KEY=c=>`bookings-${c}`;
function getCustomers(code){return LS.get(CUST_KEY(code))||[]}
function saveCustomers(code,list){LS.set(CUST_KEY(code),list)}
function getBookings(code){return LS.get(BOOK_KEY(code))||[]}
function saveBookings(code,list){LS.set(BOOK_KEY(code),list)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function upsertCustomer(code,cust){const list=getCustomers(code);const i=cust.id?list.findIndex(x=>x.id===cust.id):-1;const now=Date.now();if(i>=0){list[i]={...list[i],...cust,updatedAt:now}}else{cust.id=uid();cust.createdAt=now;cust.updatedAt=now;list.push(cust)}saveCustomers(code,list);return cust.id}
function normPhone(s){return(s||'').replace(/\D/g,'')}
/* 搜尋本機客戶：手機(部分相符)、姓/名(含)、稱謂(精準) */
function searchCustomers(code,q){const list=getCustomers(code);const raw=(q||'').trim();if(!raw)return list.slice().sort((a,b)=>(b.lastServedAt||b.updatedAt||0)-(a.lastServedAt||a.updatedAt||0));const digits=normPhone(raw);const low=raw.toLowerCase();return list.filter(c=>{const phoneHit=digits.length>=2&&normPhone(c.phone).includes(digits);const nameHit=(c.name||'').toLowerCase().includes(low);const titleHit=(c.title||'').toLowerCase()===low;return phoneHit||nameHit||titleHit}).sort((a,b)=>(b.lastServedAt||b.updatedAt||0)-(a.lastServedAt||a.updatedAt||0))}
function addBooking(code,bk){const list=getBookings(code);bk.id=uid();bk.createdAt=Date.now();bk.confirmed=false;if(!bk.logs)bk.logs=[];bk.logs.push({ts:Date.now(),type:'create',msg:'新增本次自約'});list.push(bk);saveBookings(code,list);if(bk.customerId){const cs=getCustomers(code);const ci=cs.findIndex(x=>x.id===bk.customerId);if(ci>=0){cs[ci].lastServedAt=bk.datetime||Date.now();saveCustomers(code,cs)}}return bk.id}
function updateBooking(code,id,patch,logEntry){const list=getBookings(code);const i=list.findIndex(b=>b.id===id);if(i<0)return false;const merged={...list[i],...patch};if(logEntry){if(!merged.logs)merged.logs=[];merged.logs.push({ts:Date.now(),...logEntry})}list[i]=merged;saveBookings(code,list);return true}
function confirmBooking(code,id){return updateBooking(code,id,{confirmed:true,needReconfirm:false},{type:'confirm',msg:'與櫃台確認該時段'})}
function deleteBooking(code,id){saveBookings(code,getBookings(code).filter(b=>b.id!==id))}
const BOOK_TITLES=[{v:'sir',zh:'先生',vi:'Anh'},{v:'ms',zh:'小姐',vi:'Cô'},{v:'couple',zh:'情侶',vi:'Cặp đôi'},{v:'group',zh:'團客',vi:'Nhóm'}];
function bookTitleName(v,lang){const o=BOOK_TITLES.find(x=>x.v===v);return o?(o[lang]||o.zh):(v||'')}
/* 服務項目：code=顯示, base=基礎支數, min=時長(分) */
const SERVICES=[{code:'F1',base:1,min:40},{code:'B1',base:1,min:35},{code:'F2',base:2,min:70},{code:'B2',base:2,min:70},{code:'FB2',base:2,min:70},{code:'F3',base:3,min:110},{code:'B3',base:3,min:110},{code:'FB3',base:3,min:120}];
function svcByCode(code){return SERVICES.find(s=>s.code===code)||SERVICES[5]}
/* 加鐘 extra：每 +1 = +30分 +1支 */
function bookUnits(svcCode,extra){const s=svcByCode(svcCode);return s.base+(extra||0)}
function bookMinutes(svcCode,extra){const s=svcByCode(svcCode);return s.min+(extra||0)*30}
function bookLabel(svcCode,extra){return svcCode+((extra||0)>0?'+'+extra:'')}
/* 自約的起訖（毫秒） */
function bookRange(bk){const start=bk.datetime||0;const end=start+bookMinutes(bk.svc,bk.extra)*60000;return[start,end]}
/* 衝突偵測：回傳與 bk 時間重疊的其他自約陣列（排除自己 id） */
function findConflicts(code,bk,selfId){const[s1,e1]=bookRange(bk);if(!s1)return[];return getBookings(code).filter(o=>o.id!==selfId).filter(o=>{const[s2,e2]=bookRange(o);return s1<e2&&s2<e1})}
/* 排休檢查：讀薪資 month data 的 status；2=病假? 依現有 SK 索引 sick/rest/personal 視為排休 */
function dayOffStatus(code,ts){try{const d=new Date(ts);const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate();const md=LS.get(dk(code,y,m));if(!md||!md.days||!md.days[day])return 0;const st=md.days[day].status||0;/* SK=[normal,sick,late,rest,personal,early]；休假類:1病假,3休假,4事假 */return[1,3,4].includes(st)?st:0}catch(_e){return 0}}
/* 自約 log */
function bookLog(bk,msg){if(!bk.logs)bk.logs=[];bk.logs.push({ts:Date.now(),msg});return bk}
const SK_NAMES={1:{zh:'病假',vi:'Nghỉ bệnh'},3:{zh:'休假',vi:'Nghỉ phép'},4:{zh:'事假',vi:'Nghỉ việc riêng'}};
function skName(st,lang){const o=SK_NAMES[st];return o?(o[lang]||o.zh):''}

/* ══════════ i18n ══════════ */
// 台灣縣市/鄉鎮區:北北宜桃提供完整鄉鎮,其餘僅縣市(區自填)
const LANG_SCHOOLS=["國立臺灣師範大學","淡江大學","國立政治大學","中國文化大學","國立臺灣大學","中原大學","輔仁大學"];
const TW_REGIONS={
  "臺北市":["中正區","大同區","中山區","松山區","大安區","萬華區","信義區","士林區","北投區","內湖區","南港區","文山區"],
  "新北市":["板橋區","三重區","中和區","永和區","新莊區","新店區","樹林區","鶯歌區","三峽區","淡水區","汐止區","瑞芳區","土城區","蘆洲區","五股區","泰山區","林口區","深坑區","石碇區","坪林區","三芝區","石門區","八里區","平溪區","雙溪區","貢寮區","金山區","萬里區","烏來區"],
  "桃園市":["桃園區","中壢區","平鎮區","八德區","楊梅區","蘆竹區","大溪區","龜山區","龍潭區","大園區","觀音區","新屋區","復興區"],
  "宜蘭縣":["宜蘭市","羅東鎮","蘇澳鎮","頭城鎮","礁溪鄉","壯圍鄉","員山鄉","冬山鄉","五結鄉","三星鄉","大同鄉","南澳鄉"],
  "基隆市":[],"新竹市":[],"新竹縣":[],"苗栗縣":[],"臺中市":[],"彰化縣":[],"南投縣":[],"雲林縣":[],"嘉義市":[],"嘉義縣":[],"臺南市":[],"高雄市":[],"屏東縣":[],"花蓮縣":[],"臺東縣":[],"澎湖縣":[],"金門縣":[],"連江縣":[]
};

const T={
zh:{settings:"設定",yearly:"年度",monthly:"月份明細",custManage:"客戶管理",home:"首頁",unitPrice:"每支單價",teacherCode:"老師代碼",language:"語系",year:"年份",save:"儲存",saved:"已儲存 ✓",units:"支數",salary:"薪水",laodian:"老點",subtotal:"小計",prevPeriod:"上期",nextPeriod:"下期",monthTotal:"月合計",total:"合計",sick:"病假",late:"遲到",rest:"休假",normal:"正常",personal:"事假",early:"早退",dn:["日","一","二","三","四","五","六"],months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],addGroup:"新增客組",directMode:"直接輸入",groupMode:"分組輸入",status:"狀態",done:"完成",cancel:"取消",exportUrl:"匯出備份碼",importUrl:"匯入備份碼",importOk:"匯入成功！",importFail:"格式錯誤",copyDone:"已複製",enterUrl:"貼上備份碼...",noData:"無資料",totalUnits:"總支數",groupLabel:"組",backup:"月薪資備份碼",fullBackup:"完整備份檔（JSON）",fullBackupDesc:"匯出包含基資、店資、流水、客管與全年薪資的完整加密檔案。換手機前請匯出並妥善保存（可傳給自己或存雲端）。",jsonExport:"⬇ 匯出完整備份檔",jsonImport:"⬆ 匯入備份檔（會覆蓋現有資料）",jsonExportDone:"已匯出，請妥善保存檔案",jsonExportFail:"匯出失敗，請重試",jsonImportDone:"匯入成功，即將重新載入…",jsonConfirmOverwrite:"匯入將覆蓋本機現有的所有資料，確定要繼續嗎？",jsonNotBackup:"這不是本系統的備份檔，請選擇正確的檔案",jsonBroken:"檔案不完整或已損毀，請重新匯出一次",jsonModified:"備份檔已被修改，無法匯入",jsonOtherPerson:"這是其他編號的備份檔",exportRangeCode:"匯出薪資備份碼",rangeHint:"備份範圍",jsonAndCodeDone:"已匯出備份檔，並產生薪資備份碼於下方。請兩者都妥善保存：備份檔含完整資料，備份碼可在備份檔遺失時救回薪資支數。",p1:"上半月 (1-15日)",p2:"下半月 (16日-月底)",yesterday:"昨日",lastRecord:"上一筆",todayDone:"今日已完成",startAdd:"開始新增本日的支數？",continueAdd:"繼續新增本日的支數？",addLaodian:"新增老點？",other:"其他",welcome:"歡迎使用薪資追蹤系統",enterCode:"請輸入老師編號",confirm:"確定",showQR:"請將 QR Code 提供給主管索取啟動碼",enterActivation:"輸入啟動碼",activationHint:"貼上管理者提供的啟動碼",activationFail:"啟動碼錯誤，請重新確認",copyToLine:"點此複製，傳 LINE 給管理者",adminWelcome:"管理員身分確認，自動啟動中...",admin:"管理",adminTitle:"管理頁面",genActivation:"產生啟動碼",pasteEncrypted:"貼上加密字串",resultCode:"啟動碼",adminFail:"無管理權限",encryptTool:"加密/解密工具",encryptLabel:"加密",decryptLabel:"解密",inputText:"輸入文字",deviceId:"裝置 ID",adminCheck:"檢查",adminEnter:"進入",adminApply:"申請主管",adminPending:"審核中",adminActivate:"啟動",adminApplyDesc:"申請主管權限",deviceName:"設備名稱（選填）",adminAppCode:"申請碼",adminAppCopy:"點此複製，傳 LINE 給管理者",adminActInput:"輸入管理啟動碼",adminActFail:"啟動碼錯誤",supervisor:"主管頁面",supervisorTitle:"主管頁面",supervisorApprove:"主管申請審核",supervisorApproveHint:"貼上申請碼",supervisorInfo:"申請人資訊",revoke:"取消主管權限",revokeHint:"請將此碼新增到 GitHub revoked.cfg",revokeCode:"撤銷碼",revokeInput:"輸入撤銷碼",revokeSuccess:"主管權限已取消",revokeFail:"撤銷碼錯誤",actionLog:"操作記錄",logGenUser:"生成{0}號啟動碼",logGenSup:"生成{0}號主管啟動碼({1})",logRevoke:"取消{0}號主管權限({1})",supervisorList:"主管名單",logTeacherActivate:"{0}號老師啟用主管權限({1})",revokeToAdmin:"請將此碼傳給管理者新增到 revoked.cfg",revokedList:"已撤銷",expired:"權限已過期",ok:"確認",ghConfig:"GitHub 設定",ghOwner:"帳號",ghRepo:"Repo 名稱",ghToken:"Personal Access Token",ghSave:"儲存",ghSaved:"已儲存 ✓",ghTest:"測試連線",ghOk:"連線成功 ✓",ghFail:"連線失敗",ghWriting:"寫入中...",ghWriteOk:"已寫入 GitHub ✓",ghWriteFail:"寫入失敗",ghAuto:"自動寫入 GitHub",ghEdit:"編輯",ghLocked:"設定已鎖定，按編輯可修改",keyConfig:"密鑰設定",keyFile:"檔案",keyStart:"起始位置",keyLen:"取幾字",keyTest:"測試密鑰",keyResult:"組合結果",keyMatch:"與現行密鑰一致 ✓",keyMismatch:"⚠️ 與現行密鑰不同",keySave:"儲存密鑰設定",keySaved:"密鑰設定已儲存 ✓",keyAddRule:"新增規則",keyDelRule:"刪除",keyFileOk:"{0} 存在",keyFileFail:"{0} 不存在",keyLenOk:"{0} 第1行 {1} 字 ≥ 需要 {2} 字",keyLenFail:"{0} 第1行僅 {1} 字，需至少 {2} 字",keyBuilt:"組合密鑰：{0} 字元",keyAdminOk:"admin.cfg 共 {0} 筆，全部符合",keyAdminPartial:"admin.cfg {0}/{1} 筆符合",keyAdminNone:"admin.cfg {0} 筆皆不符合",keyMigrate:"轉換為新密鑰",keyMigrating:"轉換中...",keyMigrateOk:"已轉換並寫入 GitHub ✓",keyMigrateFail:"轉換失敗",adminList:"管理者名單",adminAdd:"新增管理者",adminDel:"刪除",adminDelConfirm:"確定刪除此管理者？",adminDelLast:"至少需保留一位管理者",adminDelOk:"已從 GitHub 刪除 ✓",adminDelFail:"刪除失敗",adminAddHint:"請將此雜湊碼新增到 GitHub admin.cfg",adminCfg:"目前 admin.cfg",adminLocal:"本機新增",onlineApprove:"線上核准",approveTeacher:"核准老師",approveSupervisor:"核准主管",approveName:"姓名",approveLang:"語系",approveLevel:"主管等級",approveBtn:"核准",approving:"核准中...",approveOk:"已核准 ✓",approveFail:"核准失敗",approveMsg:"你的帳號已可使用了，再看看有沒有使用上的問題 😊",approveCopied:"已複製回覆訊息 ✓",waitApproval:"等待審核中",waitHint:"請將上方申請碼傳給管理者，核准後重開 App 即可使用",checkApproval:"重新檢查",checking:"檢查中...",approved:"已核准！",staffList:"員工名單",staffEmpty:"尚無員工資料",staffRole:"角色",staffStatus:"狀態",staffActive:"在職",staffRevoked:"已停用",logApproveTeacher:"核准老師 {0}({1})",logApproveSupervisor:"核准主管 {0}({1}) {2}",store:"所在店面",storeManage:"店面管理",storeAdd:"新增店面",storeDel:"刪除",storeEmpty:"尚無店面",storeSaved:"已儲存 ✓",teacherActivation:"老師啟動碼",supActivation:"主管啟動碼",sortByStore:"按店面",sortByCode:"按編號",sortByRole:"按職務",theme:"背景主題",themePink:"粉紅",themeBlack:"黑色",themeWhite:"白色",bizCutoffLabel:"首頁換頁時間點",teacherCert:"老師專屬憑證",keyDiagTitle:"金鑰領取診斷",keyDiagPh:"輸入編號(如998)",keyDiagBtn:"測試領取",keyDiagHint:"輸入老師編號模擬領取，看成功或卡在哪。",certGot:"本機已領",certNone:"未領",gasSettingTitle:"GAS 後端網址",keyGenTitle:"產金鑰（管理者）",keyUpdateFound:"發現有新的更新檔，請點更新",latestNotices:"最新公告",noticeAdd:"新增公告",noticeEmpty:"目前沒有公告",suggestAdd:"新建議",suggestAnon:"發布人：隱藏",suggestTitle:"標題",suggestTitlePh:"一句話說明你的建議",suggestContent:"內容",suggestContentPh:"詳細說明你的想法…",suggestAnonOpt:"匿名發布（不顯示我的編號）",suggestSubmit:"送出建議",noticeManageHint:"點右上新增公告，只要打內容，AI 會自動分類、產標題摘要並翻譯越南文。",noticeContentLabel:"公告內容（中文）",noticeContentPh:"直接貼上或輸入公告內容，其他交給 AI…",noticeAIGen:"AI 產生（分類/標題/摘要/越南文）",noticeAIPreview:"AI 產生結果（可修改）",noticePublishBtn:"發布公告",oneStore:"單店公告",allStore:"全店公告",noticeRead:"我已閱讀",noticeReadDone:"已閱讀",noticeReadOk:"已記錄閱讀，感謝！",noticeReadMark:"已讀",noticeReadCount:"人已閱讀",noReaders:"尚無人閱讀",loading:"載入中…",noticeReaders:"閱讀人員",noticeUnread:"未閱讀人員",allRead:"全部已閱讀",noticeMore:"更多公告",noticeFeedback:"我有意見（匿名）",noticeFeatureWip:"功能建置中，敬請期待",noticeKeyGot:"已為你開通！互動功能即將開放",noticeKeyFail:"開通失敗，請稍後再試或聯繫主管",noticeKeyHint:"點上方按鈕即可開通互動功能",noticeKeyClaiming:"開通中…",noticePubTitle:"公告更新",noticeHomeN:"首頁筆數",noticeShowFields:"公開顯示欄位（預設不顯示，分類校正好再勾）：",noticeSubcat:"子分類",noticeTagsLabel:"標籤",noticeListN:"公告頁筆數",noticePubBtn:"從GAS抓最新2筆存GitHub",noticePubbing:"更新中…",noticePubOk:"已更新公告",noticePubFail:"更新失敗",noticePubHint:"按此把GAS最新2筆公告發布到GitHub，所有老師即可看到。",viewAll:"看全部",keyErrBatch:"領取碼不符或GAS未設定BATCH_CODE",keyErrNoKey:"管理者尚未幫你的編號產金鑰",keyErrRevoked:"金鑰已被停用",keyErrNetwork:"連不到GAS(網路或網址問題)",keyErrMissing:"缺編號或領取碼",keyUpdating:"更新中…",keyUpdateOk:"更新完成 ✓",keyUpdateFail:"更新失敗，請稍後再試",keyAdminSecPh:"GAS連線密碼",keyGenCodePh:"要產金鑰的老師編號",keyGenBtn:"產生金鑰",keyGenDone:"金鑰已產生",keyGenExisted:"金鑰已存在（沿用）",keyClaimCode:"領取碼（交給該老師）",keyClaimHint:"老師在自己手機的設定頁輸入此領取碼即可領金鑰。",keyClaimTitle:"領取金鑰",keyClaimPh:"輸入主管給的領取碼",keyClaimBtn:"領取金鑰",keyClaimOk:"領取成功",keyClaimFail:"領取失敗",keyClaimTeacherHint:"向主管索取領取碼後輸入，一次性領取，領到後存在本機。",gasSettingHint:"貼上 Google Apps Script 部署網址（管理者用）。設定後系統寫入將透過 GAS，Token 不再需要放前端。",gasTestBtn:"測試連線",gasTesting:"測試中…",gasTestOk:"連線成功",gasTestFail:"連線失敗",bizCutoffHint:"因應公司凌晨3點結帳，所以不一定是晚上12點就換成次日，可配合自己的習慣進行設定首頁換日的時間點。白班可以設定你下班時間，晚班可以設定3點，3點後做的都算次日，所以3點後系統自動換日，方便你記錄。（目前預設是早上6點半）",themeGray:"灰色",resetAll:"一鍵還原初始設定",resetAllConfirm:"確定還原？將清除所有員工與主管資料（保留管理員122、Token、記錄）",resetAllOk:"已還原初始設定 ✓",resetSup:"一鍵移除所有主管權限",resetSupConfirm:"確定移除所有主管權限？",resetSupOk:"已移除所有主管權限 ✓",resetApp:"重置申請",removeToken:"移除（轉離線）",removeSup:"取消主管權限",removeConfirm:"確定移除 {0}？",connection:"連線作業",connApply:"申請認證",connCode:"連線碼",connInput:"貼上連線碼",connOk:"連線成功 ✓",connFail:"連線碼錯誤",connExpired:"你的連線認證已逾期，請重新申請",connStatus:"連線狀態",connOnline:"已連線 ☁️",connOffline:"離線 📥",editStaff:"人員編輯",editStore:"所在店面",editDel:"刪除此員工",editDelConfirm:"確定刪除 {0}？",editDevices:"連線設備",editRevokeConn:"取消連線",editNoDevices:"無連線設備",genConn:"產生連線碼",genConnHint:"貼上老師的 編號:uuid",needConnFirst:"請先完成連線設定才能申請主管",skills:"老師技能",guasha:"刮痧",baguang:"拔罐",xiujiao:"修腳皮",gs:"刮",bg:"拔",xj:"修",clearAll:"一鍵清除",notice1:"⚠️ 資料只存在本機，不會上傳雲端。",notice2:"LINE 與手機內建瀏覽器的暫存是分開的，啟動碼會不同，請固定使用同一個瀏覽器。",notice3:"資料跟著手機走，換手機前請先到設定頁匯出備份。",authRedirectHint:"點擊後將前往管理頁面，完成後可按返回回到記薪資畫面。",manualGen:"手動發碼",manualGenBtn:"發碼",syncedStaff:"已寫入名單",syncFailStaff:"名單寫入失敗",manualGenHint:"直接輸入老師編號產生啟動碼（離線可用，不寫入雲端名單）",booking:"我的預約",bookingNew:"新增自約",bookingList:"自約清單",bookingEmpty:"目前沒有自約",custSearch:"搜尋客戶（手機/姓/稱謂）",custNew:"新客戶",custName:"姓名",custPhone:"手機",custTitle:"稱謂",custParts:"重點部位",custNote:"備註",custEval:"本次評價",bookDate:"預約日期",bookTime:"預約時間",bookSave:"儲存自約",bookCancel:"取消",bookDelete:"刪除自約",bookDeleteConfirm:"確定刪除這筆自約？",bookDeleteConfirm2:"確定刪除",selectCustomer:"選擇客戶",orNewCustomer:"或新增客戶",noMatch:"查無符合客戶",lastServed:"上次服務",bookStatus:"狀態",bookConfirmed:"已確認",bookDone:"已完成",bookNoShow:"未到",pickCustomerFirst:"請先選擇或新增客戶",needActivate:"請先在記薪資頁完成啟用",backToMain:"回記薪資",svcLabel:"服務項目",addHour:"加鐘",party:"同行人數",workStart:"上工時間",workEnd:"下工時間",workEndNeed:"已填上工，請一併填下工時間",gender:"性別",genderM:"男",genderF:"女",crossNightHint:"晚班跨夜：下工時間早於上工時間時，系統自動視為隔天（例如 17:00 上工、05:00 下工）。",email:"電子郵件",pregClient:"懷孕客人",oilLabel:"油壓",accept:"接",reject:"不接",techMentor:"技術指導老師",techMentorPlaceholder:"填寫技術指導老師號碼",lockerNo:"4樓置物櫃編號",teacherCode:"老師編號",teacherCodePlaceholder:"請輸入老師編號 ex:122",submitActivation:"送出啟動帳號",mustReadFirst:"需先閱讀以下說明",readConfirm:"我已閱讀以下說明",sendViaLine:"傳 LINE 給主管",sendLineToTeacher:"傳 LINE 給老師（碼）",sendLineLinkToTeacher:"傳連結給老師",sendLineToSup:"傳 LINE 給主管",lineConfirmPrefix:"資料已更新，確認碼如下，請於系統內輸入：",reqLinkTitle:"收到一個申請碼",reqLinkDesc:"系統偵測到申請碼。若您具有主管或管理權限，請先完成下方身分驗證，驗證後將自動帶入處理；若您是一般老師，則無需處理此碼。",lineActivatePrefix:"請協助 {code} 號老師帳號啟動",lineConnPrefix:"連線啟動碼如下，請複製使用：",lineActDonePrefix:"您的啟動碼如下，請於系統內輸入完成啟動：",lineReqPrefix:"基資／店資更新申請碼，請主管協助確認：",lineConnReqPrefix:"連線申請碼（請主管協助產生連線碼）：",reqMissing:"請完成必填欄位",addUnitTitle:"新增支數（每筆記為一位客人）",oldGroupData:"舊分組資料",slipUnits:"支數",editMoreInMonthly:"更多明細可到月份明細編輯",pressBody:"身體受力",pressFoot:"腳受力",pressLight:"輕",pressNormal:"普通",pressHeavy:"重",strengthParts:"加強部位",partHead:"頭",partShoulder:"肩膀",partUpperback:"上背",partLowerback:"下背",partWaist:"腰",partButt:"屁股",partThigh:"大腿",partCalf:"小腿",partArm:"手臂",clientReq:"客人要求",reqMale:"指男",reqFemale:"指女",reqTw:"指台",reqVn:"指越",reqCn:"指中",laodianOut:"老點出牌",shiftOut:"輪班出牌",teacherNoPlaceholder:"老師編號",custSearchHint:"搜尋客戶（姓/稱謂/手機/#標籤）",custMatch:"找到客戶",custNewHint:"查無此客戶，將建立新客戶",custNoRecent:"尚無客戶記錄",custEditTitle:"客戶資料編輯",custDelBtn:"刪除此客戶",custDelConfirm:"再按一次確認刪除（不影響流水紀錄）",rangeCodeNote:"此備份碼可快速救回每日支數與老點總數，缺點是無法還原每筆流水的明細（服務項目、客人、受力部位等），還原後每天會合併成一筆。需要完整明細請改用「完整備份檔（JSON）」。",
tabBasic:"基資",tabStore:"店資",tabBook2:"自約",tabCust:"客管",tabNotice:"公告",tabSuggest:"建議",tabManage:"管理",
secBasic:"基本資料",secStore:"在店資訊",nameZh:"中文姓名",nameVi:"越南姓名",address:"通訊地址",school:"就讀學校",major:"科系",permitDate:"工作證核發日期",permitOrg:"核發單位",optional:"選填",
storeName:"店名",shift:"班別",shiftDay:"早班",shiftNight:"晚班",workNote:"特別上下工備註",
skPregnant:"特殊客人（懷孕）",skOil:"油壓",
custMgmt:"客戶管理",noticeCenter:"公司宣達事項",suggestBox:"提供建議",manageCenter:"管理中心",underConstruction:"施工中",
confirmWithSup:"與主管確認",permitNo:"許可文號",permitExpiry:"到期日",permitOrgOpt:"核發單位",orgWDA:"勞動部勞動力發展署",orgNIA:"內政部移民署",orgOther:"其他",permitExpiringSoon:"工作證即將到期",phone2:"手機",city:"縣市",district:"區/鄉鎮市",addrDetail:"地址",selectCity:"選擇縣市",selectDist:"選擇區",myBookingNote:"「我的自約」非店家正式預約資料，僅供老師方便記錄使用。",partyMember:"同行第",assignTeacher:"指定老師",noAssign:"不指定",svcNote:"服務備註",calView:"日曆式",eventView:"事件序",totalPeople:"共",peopleUnit:"人",alsoAssign:"另指定",assignMode:"指定方式",noAssignTeacher:"不指定老師",assignTeacherMode:"指定老師",assignByCode:"指定編號",assignByCond:"指定條件",assignMale:"指男",assignFemale:"指女",assignTW:"指台",assignVN:"指越",assignOil:"油壓",confirmWithCounter:"跟櫃台確認",confirmWithAssigned:"跟指定老師確認",editBtn:"編輯",saveChange:"儲存變更",logConfirmCounter:"與櫃台確認該時段",logConfirmAssigned:"與指定老師{0}確認",logEditChange:"編輯：{0}",foreignSection:"外籍員工",permitNoLabel:"工作證許可文號",langSchool:"目前就讀語言學校",schoolType:"目前就讀",schoolTypeLang:"語言學校",schoolTypeUni:"大學",schoolTypeMaster:"研究所",schoolTypePhd:"博士班",selectLangSchool:"選擇語言學校",closeThis:"關閉此頁",confirmedAssignedToast:"已與{0}老師確認",confirmedCounterToast:"已與櫃台確認",statusUnconfirmed:"未確認",statusConfirmed:"已確認",statusAssignedConfirmed:"已跟指定老師確認",statusReconfirm:"自約變更，請重新確認",statusTeacherProgress:"已與老師確認 ({0}/{1})",confirmedTeacherToast:"已與老師確認 ({0}/{1})",hidePast:"隱藏已過期",workTimeEdit:"上下工時間",workStartH:"上工",workEndH:"下工",saveWorkTime:"儲存工時",internSup:"實習副理",confirmSuccess:"已確認，資料已更新",confirmFail:"確認碼錯誤或不符",scanReqEntry:"刷申請碼",reqBasic:"基資申請",reqStore:"店資申請",agreeWrite:"同意並寫入",disagree:"不同意",writeOk:"已寫入，確認碼：",giveConfirmCode:"請將確認碼給老師",logReqWritten:"寫入{0}申請：{1}",uuidBound:"已綁定裝置",uuidNew:"新裝置(將綁定)",workChartTitle:"上工人數統計",workChartOnline:"在線人數",workChartStart:"上工分布",workChartOnlineDesc:"各時段在線老師人數",workChartStartDesc:"各時間點上工的老師人數",allStores:"全部店家",tabChart:"圖表",chartShiftRatio:"班別比",chartGenderRatio:"性別比",chartAnalysis1:"分析1",chartAnalysis2:"分析2",chartWorkStart:"上工人數",chartOnline:"在線人數",chartWorkStartDesc:"各時間點上工的老師人數",chartOnlineDesc:"各時段在線老師人數（含跨夜）",peopleUnit2:"人",chartDayShift:"早班",chartNightShift:"晚班",chartMale:"男",chartFemale:"女",chartOther:"其他",chartUpdatedAt:"資料更新",chartNoData:"尚無統計資料，請待主管發布",chartSupOnly:"需主管權限",chartPublished:"已發布給成員",statTotal:"總人數",chartUpdate:"更新",slipList:"流水紀錄",slipAuto:"自動",slipStartTime:"開始時間",slipDelete:"刪除此筆",slipTags:"客管標籤（選填）",slipTagsPlaceholder:"空格分隔，按 Enter 或 + 加入",slipTagHistory:"歷史標籤：",slipTagAdd:"加入",custTagStats:"標籤統計",custSearchBtn:"客戶管理",custNoTags:"尚無標籤，請在每日流水裡記錄",custSearchPlaceholder:"搜尋姓名 / 稱謂 / 手機",myBooking2:"我的自約",
tabHome2:"首設",tabBackup:"備份",homeSettings:"系統設定",backupCenter:"備份",
curStore:"目前服務店家",applyChange:"申請更改",genBasicCode:"產生基資申請碼",genStoreCode:"產生店資申請碼",basicApplyCode:"基資申請碼",storeApplyCode:"店資申請碼",confirmCode2:"確認碼",copyBtn:"複製",lastSyncAt:"最後同步時間",fullStaffData:"完整資料",fullBasicData:"基資完整資料",fullStoreData:"店資完整資料",saveToStaff:"存回 staff",saved:"已存回",saveFailStaff:"存檔失敗",staffValueHint:"公司登記",
syncStoreBooking:"同步店家預約資訊",syncBtn:"同步",pasteBtn:"貼上",noFuncYet:"（尚無功能）",tabViolation:"違規",violationTitle:"違規記錄",noViolation:"你目前尚未有違規記錄",violationCode:"違規確認碼",dutyTitle:"值日生記錄",noDuty:"目前無值日生記錄",prevConfirmed:"前次確認值",needConfirm:"請完成資料填寫後，向主管進行確認",serviceStatus:"本服務 本機／連線狀況",
privacyTitle:"資料儲存說明",privacyBody:"本系統所有個人資料與薪資記錄，皆僅儲存於您的裝置本機，不會上傳至任何雲端伺服器，店家與管理者均無法讀取。",browserNote:"LINE 與手機內建瀏覽器的暫存空間各自獨立，若切換不同瀏覽器開啟，系統將要求重新輸入啟動碼。建議您固定使用同一個瀏覽器，以確保資料連續。",
backupReminder:"預約與所有資料均儲存於本機，更換手機後資料將無法復原。更換手機前，請先至「備份」頁匯出備份碼妥善保存。",
basicUpdateCode:"基資更新碼",storeUpdateCode:"店資更新碼",basicConfirmCode:"基資確認碼",storeConfirmCode:"店資確認碼",conflictWarn:"與 {0} {1} 衝突",dayOffWarn:"當天已排{0}",units:"支",partyUnit:"人",noWorkEnd:"尚未設定下工時間",bookEdit:"編輯",bookConfirmDesk:"與櫃台確定",bookConfirmed2:"已與櫃台確認",bookEditWarn:"變更時間後請再與櫃台確認",bookLogTitle:"異動記錄",logCreate:"新增本次自約",logConfirm:"與櫃台確認該時段",logChange:"自約變動",logConflict:"系統偵測到時段衝突仍建立",custEditTitle:"編輯客戶",custSave:"儲存",bookSaveEdit:"儲存變更",timeChanged:"時間 {0} → {1}",svcChanged:"服務 {0} → {1}",lockPwdTitle:"設定4位數解鎖密碼",lockPwdHint:"之後用於鎖屏解鎖，不可4碼相同或連續遞增/遞減",lockPwdConfirm:"再輸入一次確認",lockPwdMismatch:"兩次輸入不一致",lockPwdInvalid:"密碼不可4碼相同或連續數字",flowNew:"新老師啟動",flowLogin:"已有帳號，密碼登入",pwdLoginTitle:"密碼登入",pwdLoginHint:"輸入編號與密碼即可登入，不需再跟主管要啟動碼",pwdInputPh:"4位數密碼",pwdLoginBtn:"登入",pwdLoginFail:"編號或密碼錯誤",backToChoice:"返回選擇",forgotPwdLink:"忘記密碼？",forgotPwdTitle:"忘記密碼",forgotPwdHint:"系統會產生一組代碼，傳給主管確認身分後即可重設密碼",ticketCode:"代碼",ticketSend:"傳 LINE 給主管",ticketCheckBtn:"檢查核定情形",ticketChecking:"檢查中…",ticketPending:"尚未核准，請稍候",ticketApproved:"已核准！",ticketWaitCountdown:"請等待 {0} 秒後再檢查",setNewPwdTitle:"設定新密碼",shiftLabel:"班別",shiftDay:"早班",shiftNight:"晚班",lineTicketNewPrefix:"請協助{code}號老師核准新帳號啟動，代碼：",lineTicketForgotPrefix:"請協助{code}號老師核准忘記密碼申請，代碼：",ticketLookup:"查詢代碼",ticketLookupBtn:"查詢",ticketLookupPh:"貼上老師傳來的代碼",ticketNotFound:"查無此代碼",ticketAlreadyDone:"此申請已處理過",ticketApproveBtn:"核准",ticketApproveOk:"已核准 ✓",ticketApproveFail:"核准失敗",ticketInfoTeacher:"老師編號",ticketInfoStore:"店家",ticketInfoGender:"性別",ticketInfoWork:"上下班",ticketInfoShift:"班別",ticketTypeN:"新老師啟動",ticketTypeF:"忘記密碼",noticePwdSetupTitle:"設定4位數密碼",noticePwdSetupBody:"公告內容屬公司資料，為保障資料安全，請設定專屬4位數密碼。日後開啟公司相關資料時，系統將要求輸入密碼進行驗證（5分鐘內免重複輸入）。",noticePwdSetupBtn:"設定密碼",noticePwdLockedTitle:"請輸入密碼",noticePwdLockedBody:"公告為公司資料，請輸入密碼驗證身分",noticePwdUnlockBtn:"解鎖",noticePwdWrong:"密碼錯誤，請重新輸入",checkCodeBtn:"檢查",checkingCode:"檢查中…",codeExistsHint:"此編號已啟動過，請改用密碼登入",codeCheckFail:"檢查失敗，請重試",codeAvailHint:"編號可用，請繼續填寫",ticketPendingNewTitle:"新老師啟動申請中",ticketPendingForgotTitle:"忘記密碼申請中",newPwdTitle:"新密碼",newPwdHint:"密碼原則同申請時：不可4碼相同或連續遞增/遞減",ticketClearBtn:"清空",ticketNotifyBtn:"通知申請人 已核准",lineApprovedPrefix:"{code} 你好：你的帳號已啟動，請點擊網頁中的「檢查核定情形」來登入主頁，進行支數管理。有任何的建議，歡迎提供給我，祝您使用順心愉快！",ticketTypeA:"主管申請",lineTicketSupPrefix:"請協助{code}號老師核准主管申請，代碼：",ticketTypeB:"基資更新申請",ticketTypeS:"店資更新申請",lineTicketBasicPrefix:"請協助{code}號老師核准基資更新，代碼：",lineTicketStorePrefix:"請協助{code}號老師核准店資更新，代碼：",infoEditBtn:"編輯",infoSubmitBtn:"送出",infoCancelBtn:"取消",infoNoChange:"沒有變更任何欄位",infoChangedTitle:"本次變更的欄位",infoPwdSetupBasicBody:"此頁含有個人資訊，為保障資料安全，請設定專屬4位數密碼。日後開啟個人資料時，系統將要求輸入密碼進行驗證（5分鐘內免重複輸入）。",infoPwdSetupStoreBody:"店家資訊屬公司資料，為保障資料安全，請設定專屬4位數密碼。日後開啟公司相關資料時，系統將要求輸入密碼進行驗證（5分鐘內免重複輸入）。",infoPwdLockedBasicBody:"此頁含有個人資訊，請輸入密碼驗證身分",infoPwdLockedStoreBody:"店家資訊為公司資料，請輸入密碼驗證身分",lineApprovedForgotPrefix:"{code} 你好，你申請自訂密碼重設的申請已核准，請點擊網頁中的「檢查核定情形」來登入主頁，有任何的建議，歡迎提供給我，祝您使用順心愉快。",lineApprovedSupPrefix:"{code} 你好，你申請主管權限的申請已核准，請點擊網頁中的「檢查核定情形」完成啟用，有任何的建議，歡迎提供給我，祝您使用順心愉快。",lineApprovedBasicPrefix:"{code} 你好，你申請的基本資料更新已核准，請點擊網頁中的「檢查核定情形」完成同步，有任何的建議，歡迎提供給我，祝您使用順心愉快。",lineApprovedStorePrefix:"{code} 你好，你申請的店家資料更新已核准，請點擊網頁中的「檢查核定情形」完成同步，有任何的建議，歡迎提供給我，祝您使用順心愉快。",ticketInfoApplyTime:"申請時間",ticketInfoApproveTime:"核准時間",ticketInfoApprover:"核准人",revokeSupBtn:"撤銷主管權限",revokeSupConfirm:"確定要撤銷此人的主管權限嗎？",revokeSupOk:"已撤銷 ✓",revokeSupFail:"撤銷失敗",rejectBtn:"退回",rejectReasonPh:"退回原因(選填,讓老師知道要改什麼)",ticketRejected:"已退回",ticketRejectedReason:"退回原因",reeditBtn:"修改後重新送出",keyExpiredMsg:"憑證已過期，請聯繫主管處理",keyInvalidMsg:"憑證已失效，無法查看",keyInvalidEditMsg:"憑證已失效，無法送出變更，請聯繫主管處理",noticeListTextLabel:"列表文字用：",noticeListTitle:"標題",noticeListSummary:"摘要",noticeCountTypeLabel:"開啟次數顯示：",noticeCountPeople:"人數(不重複)",noticeCountVisits:"人次(全部)",credentialLabel:"憑證狀態",credentialOk:"正常",credentialExpired:"憑證已到期",leaveBtn:"離職",leaveConfirmTitle:"確定要離職嗎？",leaveConfirmMsg:"按下後帳號會走離職流程並留下記錄，公司相關資料(公告、店資)將無法再查看。你自己記錄過的支數資料仍會保留在本機，可自行運用。",leaveConfirmBtn:"確定離職",leaveOk:"已完成離職流程",leaveFail:"處理失敗，請稍後再試",ticketTypeE:"憑證展期申請",lineTicketRenewPrefix:"請協助{code}號老師核准憑證展期，代碼：",lineApprovedRenewPrefix:"{code} 你好，你申請的憑證展期已核准，請點擊網頁中的「檢查核定情形」完成展期，有任何的建議，歡迎提供給我，祝您使用順心愉快。",renewModalTitle:"憑證展期",renewModalBody:"你的憑證已到期，無法查看公司相關資料(公告、店資)。送出展期申請給主管，核准後即可恢復。",noticeOffBtn:"下架",noticeOnBtn:"上架",noticeOffConfirm:"確定要下架這則公告嗎？下架後一般老師看不到，但你仍會在清單看到(灰字)。",noticeOpenersTitle:"開啟人員",catTabAll:"全部",credentialInvalid:"無效",credentialExpiryLabel:"憑證期限",leftDateLabel:"離職日",expiredLabel:"已逾期",noticeLocalBadge:"本機",lockPwdSectionTitle:"保護密碼",disableHomePwdLabel:"關閉首頁的保護密碼要求",lockAutoTimeLabel:"保護密碼自動上鎖時間",lockAutoTimeHint:"分鐘(最小5分鐘)",homePwdPopupTitle:"請輸入保護密碼",homePwdPopupBody:"今天第一次開啟，請輸入密碼驗證身分",gloveSize:"手套尺寸",groupBuyBtn:"團購",groupBuyTitle:"團購列表",groupBuyTabList:"團購",groupBuyTabMine:"我登記的",groupBuyEmpty:"目前沒有進行中的團購",groupBuyMineEmpty:"你還沒參加任何團購",groupBuyJoinBtn:"登記",groupBuyJoinOk:"已登記 ✓",groupBuyCreateBtn:"發起團購",groupBuyCreateTitle:"發起手套團購",groupBuyDeadlineLabel:"截止日期",groupBuyPopupTitle:"手套團購",groupBuyPopupBody:"目前有進行中的手套團購，要加入嗎？",groupBuyPopupJoin:"加入",groupBuyPopupSkip:"暫不參加",groupBuyOrderCount:"人登記",drBtn:"回報",drTitle:"天災安全回報",drDateLabel:"日期",drTypeLabel:"天災別",drTypeEarthquake:"地震",drTypeTyphoon:"颱風",drTypeFlood:"淹水",drTypeLandslide:"土石流",drStatusLabel:"狀況",drSafe:"我很安全",drCantLeave:"無法出門",drVehicleDamaged:"交通工具受損",drSick:"身體不適",drNeedAddrHint:"回報前請先填寫所在通訊縣市、鄉鎮",drSubmitBtn:"送出回報",drSubmitOk:"已送出回報",drSubmitFail:"送出失敗，請重試",ticketTypeR:"復職申請",lineTicketReinstatePrefix:"請協助{code}號老師核准復職申請，代碼：",lineApprovedReinstatePrefix:"{code} 你好，你申請的復職已核准，請回到登入頁用原本密碼登入即可，有任何的建議，歡迎提供給我，祝您使用順心愉快。",accountLeftMsg:"此帳號已離職停用，如需復職請送出復職申請",reinstateBtn:"送出復職申請",reinstateHint:"送出後由主管核准，核准後請用原本密碼回登入頁登入即可，不用重設密碼。",reinstateApprovedMsg:"復職已核准，請用原本密碼登入",groupBuyItemLabel:"團購項目",groupBuyItemGlove:"手套",groupBuyItemCustom:"自訂項目",groupBuyCustomItemPh:"輸入項目名稱",groupBuyAmountLabel:"金額",groupBuyAmountPh:"每份金額",groupBuyScopeLabel:"通知範圍",groupBuyScopeStore:"單店主動通知",groupBuyScopeAll:"全店主動通知",groupBuyDeadline24hHint:"一般老師最多只能設定24小時內截止",groupBuyDeclineBtn:"不需要",groupBuyDeclinedOk:"已標記不需要",groupBuyCloseBtn:"提前結束",groupBuyCloseConfirm:"確定要提前結束這個團購嗎？",groupBuyClosedTag:"已結束",groupBuyViewJoined:"參加名單",groupBuyViewDeclined:"不需要名單",groupBuyViewOpens:"點開看過",drSurveyNameLabel:"天災名稱",drSurveyNamePh:"例如：0710強颱",drSurveyStartLabel:"安全回報開始日",drCreateSurveyBtn:"發起天災安全回報",drEndSurveyBtn:"結束回報調查",drSurveyEndedTag:"已結束",drNoActiveSurvey:"目前沒有進行中的天災回報",drOtherLabel:"其他",drOtherPh:"自行填寫狀況",drMyReportsTitle:"我的回報紀錄",drDayLabel:"第{0}天",drQueryDayTitle:"查詢回報狀況",drDidReport:"已回報",drNotReport:"未回報",drCopyNotReportBtn:"複製未回報名單",drCopiedMsg:"已複製",applying:"送出中…",drMessageLabel:"通知內容(選填,會出現在通報彈窗與複製訊息裡)",drMessagePh:"例如：請老師每日進行安全回報",drScopeLabel:"主動通報範圍(預設不主動通報)",drScopeStore:"單店主動通報",drScopeAll:"全店主動通報",drReportRecordTitle:"安全回報記錄",drTodayReported:"今日你已進行回報：",drAddMoreBtn:"新增一筆安全回報",drDeleteConfirm:"確定要刪除這筆已結束的調查嗎？",drQueryReportsBtn:"查詢回報情形",drSelectDayPh:"選擇天數",groupBuyTabCreated:"我發起的",groupBuyQtyLabel:"數量",groupBuyConfirmBtn:"完成",groupBuyDeclineCountLabel:"不需要的人數",groupBuyCreatedCount:"共有{0}人登記",groupBuySizeGroup:"尺寸{0} 共{1}人 分別是{2}",groupBuyMineCreatedEmpty:"你還沒發起任何團購",groupBuyEndedTitle:"已結束",groupBuyPaidBtn:"已交錢",groupBuyArrivedBtn:"已到貨",groupBuySubtotalLabel:"小計",homeLayoutTitle:"首頁版面顯示",homeLayoutA:"快速加支數（+1+2+3）",homeLayoutB:"今日流水列表",homeLayoutC:"狀態選擇（正常／事假／病假／休假）",homeLayoutHint:"關閉後，仍可以點今日日期那排進入編輯畫面操作，只是首頁不會直接顯示",blacklistTab:"拒接名單",blacklistCheck:"拒接",blacklistReasonHarass:"騷擾",blacklistReasonOther:"其他",blacklistReasonPh:"請輸入原因",blacklistNoCandidate:"目前沒有標記拒接的客人，請先在流水詳情勾選拒接",blacklistSubmitBtn:"送出拒接申請",blacklistReasonLabel:"拒接原因",blacklistSearchPh:"手機／姓名／稱謂／拒接老師編號",ticketTypeK:"拒接申請"},
vi:{settings:"Cài đặt",yearly:"Năm",monthly:"Chi tiết",custManage:"Khách hàng",home:"Trang chủ",unitPrice:"Đơn giá",teacherCode:"Mã NV",language:"Ngôn ngữ",year:"Năm",save:"Lưu",saved:"Đã lưu ✓",units:"SL",salary:"Lương",laodian:"KH quen",subtotal:"Tổng",prevPeriod:"Kỳ trước",nextPeriod:"Kỳ sau",monthTotal:"Tổng tháng",total:"Tổng cộng",sick:"Nghỉ bệnh",late:"Đi trễ",rest:"Nghỉ phép",normal:"BT",personal:"Nghỉ việc riêng",early:"Về sớm",dn:["CN","T2","T3","T4","T5","T6","T7"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],addGroup:"Thêm khách",directMode:"Nhập trực tiếp",groupMode:"Nhập theo nhóm",status:"Trạng thái",done:"Xong",cancel:"Hủy",exportUrl:"Xuất mã",importUrl:"Nhập mã",importOk:"Thành công!",importFail:"Sai định dạng",copyDone:"Đã chép",enterUrl:"Dán mã...",noData:"Không có",totalUnits:"Tổng SL",groupLabel:"Nhóm",backup:"Mã sao lưu lương tháng",fullBackup:"Tệp sao lưu đầy đủ (JSON)",fullBackupDesc:"Xuất tệp mã hóa đầy đủ gồm thông tin cơ bản, cửa hàng, lịch sử, khách hàng và lương cả năm. Trước khi đổi điện thoại hãy xuất và lưu giữ cẩn thận.",jsonExport:"⬇ Xuất tệp sao lưu",jsonImport:"⬆ Nhập tệp (sẽ ghi đè dữ liệu)",jsonExportDone:"Đã xuất, hãy lưu giữ tệp cẩn thận",jsonExportFail:"Xuất thất bại, thử lại",jsonImportDone:"Nhập thành công, đang tải lại…",jsonConfirmOverwrite:"Nhập sẽ ghi đè toàn bộ dữ liệu hiện có, tiếp tục?",jsonNotBackup:"Đây không phải tệp sao lưu của hệ thống",jsonBroken:"Tệp không đầy đủ hoặc hỏng, hãy xuất lại",jsonModified:"Tệp sao lưu đã bị sửa, không thể nhập",jsonOtherPerson:"Đây là tệp của mã khác",exportRangeCode:"Xuất mã sao lưu lương",rangeHint:"Phạm vi",jsonAndCodeDone:"Đã xuất tệp và tạo mã sao lưu bên dưới. Hãy lưu cả hai: tệp chứa dữ liệu đầy đủ, mã giúp khôi phục số lượng lương nếu mất tệp.",p1:"Nửa đầu (1-15)",p2:"Nửa sau (16-cuối)",yesterday:"Hôm qua",lastRecord:"Lần trước",todayDone:"Hôm nay đã xong",startAdd:"Thêm SL hôm nay?",continueAdd:"Tiếp tục thêm?",addLaodian:"Thêm KH quen?",other:"Khác",welcome:"Chào mừng",enterCode:"Nhập mã nhân viên",confirm:"Xác nhận",showQR:"Đưa mã QR cho quản lý để nhận mã kích hoạt",enterActivation:"Nhập mã kích hoạt",activationHint:"Dán mã kích hoạt từ quản lý",activationFail:"Sai mã kích hoạt",copyToLine:"Nhấn để sao chép, gửi LINE cho quản lý",adminWelcome:"Xác nhận quản lý, tự động kích hoạt...",admin:"Quản lý",adminTitle:"Trang quản lý",genActivation:"Tạo mã kích hoạt",pasteEncrypted:"Dán chuỗi mã hóa",resultCode:"Mã kích hoạt",adminFail:"Không có quyền",encryptTool:"Mã hóa/Giải mã",encryptLabel:"Mã hóa",decryptLabel:"Giải mã",inputText:"Nhập văn bản",deviceId:"Mã thiết bị",adminCheck:"Kiểm tra",adminEnter:"Vào",adminApply:"Đăng ký quản lý",adminPending:"Đang xét duyệt",adminActivate:"Kích hoạt",adminApplyDesc:"Đăng ký quyền quản lý",deviceName:"Tên thiết bị (tùy chọn)",adminAppCode:"Mã đăng ký",adminAppCopy:"Nhấn để sao chép, gửi LINE cho quản lý",adminActInput:"Nhập mã kích hoạt quản lý",adminActFail:"Sai mã kích hoạt",adminFail:"Không có quyền",supervisor:"Trang quản lý",supervisorTitle:"Trang quản lý",supervisorApprove:"Duyệt đăng ký quản lý",supervisorApproveHint:"Dán mã đăng ký",supervisorInfo:"Thông tin người đăng ký",revoke:"Hủy quyền quản lý",revokeHint:"Thêm mã này vào GitHub revoked.cfg",revokeCode:"Mã hủy",revokeInput:"Nhập mã hủy",revokeSuccess:"Đã hủy quyền quản lý",revokeFail:"Sai mã hủy",actionLog:"Nhật ký",logGenUser:"Tạo mã kích hoạt #{0}",logGenSup:"Tạo mã quản lý #{0}({1})",logRevoke:"Hủy quyền #{0}({1})",supervisorList:"Danh sách quản lý",logTeacherActivate:"NV #{0} kích hoạt quyền quản lý({1})",revokeToAdmin:"Gửi mã này cho quản trị viên để thêm vào revoked.cfg",revokedList:"Đã hủy",expired:"Quyền đã hết hạn",ok:"OK",ghConfig:"Cài đặt GitHub",ghOwner:"Tài khoản",ghRepo:"Tên Repo",ghToken:"Personal Access Token",ghSave:"Lưu",ghSaved:"Đã lưu ✓",ghTest:"Thử kết nối",ghOk:"Kết nối OK ✓",ghFail:"Kết nối thất bại",ghWriting:"Đang ghi...",ghWriteOk:"Đã ghi GitHub ✓",ghWriteFail:"Ghi thất bại",ghAuto:"Tự động ghi GitHub",ghEdit:"Sửa",ghLocked:"Đã khóa, nhấn Sửa để chỉnh",keyConfig:"Cài đặt khóa",keyFile:"Tệp",keyStart:"Vị trí",keyLen:"Số ký tự",keyTest:"Thử khóa",keyResult:"Kết quả",keyMatch:"Khớp khóa hiện tại ✓",keyMismatch:"⚠️ Khác khóa hiện tại",keySave:"Lưu cài đặt khóa",keySaved:"Đã lưu ✓",keyAddRule:"Thêm quy tắc",keyDelRule:"Xóa",keyFileOk:"{0} tồn tại",keyFileFail:"{0} không tồn tại",keyLenOk:"{0} dòng 1: {1} ký tự ≥ cần {2}",keyLenFail:"{0} dòng 1: chỉ {1} ký tự, cần ≥ {2}",keyBuilt:"Khóa: {0} ký tự",keyAdminOk:"admin.cfg {0} mục, tất cả khớp",keyAdminPartial:"admin.cfg {0}/{1} khớp",keyAdminNone:"admin.cfg {0} mục không khớp",keyMigrate:"Chuyển sang khóa mới",keyMigrating:"Đang chuyển...",keyMigrateOk:"Đã chuyển và ghi GitHub ✓",keyMigrateFail:"Chuyển thất bại",adminList:"Danh sách quản lý",adminAdd:"Thêm quản lý",adminDel:"Xóa",adminDelConfirm:"Xác nhận xóa quản lý?",adminDelLast:"Cần giữ ít nhất một quản lý",adminDelOk:"Đã xóa khỏi GitHub ✓",adminDelFail:"Xóa thất bại",adminAddHint:"Thêm mã hash này vào GitHub admin.cfg",adminCfg:"admin.cfg hiện tại",adminLocal:"Thêm cục bộ",onlineApprove:"Duyệt online",approveTeacher:"Duyệt NV",approveSupervisor:"Duyệt quản lý",approveName:"Họ tên",approveLang:"Ngôn ngữ",approveLevel:"Cấp bậc",approveBtn:"Duyệt",approving:"Đang duyệt...",approveOk:"Đã duyệt ✓",approveFail:"Duyệt thất bại",approveMsg:"Tài khoản của bạn đã sẵn sàng, hãy thử và cho mình biết nếu có vấn đề gì nhé 😊",approveCopied:"Đã copy tin nhắn ✓",waitApproval:"Đang chờ duyệt",waitHint:"Gửi mã trên cho quản lý, mở lại app sau khi được duyệt",checkApproval:"Kiểm tra lại",checking:"Đang kiểm tra...",approved:"Đã duyệt!",staffList:"Danh sách NV",staffEmpty:"Chưa có dữ liệu",staffRole:"Vai trò",staffStatus:"Trạng thái",staffActive:"Đang làm",staffRevoked:"Đã nghỉ",logApproveTeacher:"Duyệt NV {0}({1})",logApproveSupervisor:"Duyệt QL {0}({1}) {2}",store:"Chi nhánh",storeManage:"Quản lý CN",storeAdd:"Thêm CN",storeDel:"Xóa",storeEmpty:"Chưa có CN",storeSaved:"Đã lưu ✓",teacherActivation:"Mã kích hoạt NV",supActivation:"Mã kích hoạt QL",sortByStore:"Theo CN",sortByCode:"Theo mã",sortByRole:"Theo chức vụ",theme:"Giao diện",themePink:"Hồng",themeBlack:"Đen",themeWhite:"Trắng",bizCutoffLabel:"Giờ chuyển ngày",teacherCert:"Chứng chỉ riêng GV",keyDiagTitle:"Chẩn đoán nhận khóa",keyDiagPh:"Nhập mã",keyDiagBtn:"Kiểm tra",keyDiagHint:"Nhập mã GV để mô phỏng nhận khóa.",certGot:"Đã nhận",certNone:"Chưa nhận",gasSettingTitle:"Địa chỉ GAS",keyGenTitle:"Tạo khóa (QL)",keyUpdateFound:"Có bản cập nhật mới, bấm để cập nhật",latestNotices:"Thông báo mới",noticeAdd:"Thêm thông báo",noticeEmpty:"Chưa có thông báo",suggestAdd:"Góp ý mới",suggestAnon:"Người gửi: ẩn",suggestTitle:"Tiêu đề",suggestTitlePh:"Một câu tóm tắt góp ý",suggestContent:"Nội dung",suggestContentPh:"Nói rõ ý kiến của bạn…",suggestAnonOpt:"Gửi ẩn danh (không hiện mã)",suggestSubmit:"Gửi góp ý",noticeManageHint:"Bấm thêm thông báo, chỉ cần nhập nội dung, AI sẽ tự phân loại, tạo tiêu đề tóm tắt và dịch tiếng Việt.",noticeContentLabel:"Nội dung (tiếng Trung)",noticeContentPh:"Dán hoặc nhập nội dung, phần còn lại để AI…",noticeAIGen:"AI tạo (phân loại/tiêu đề/dịch)",noticeAIPreview:"Kết quả AI (có thể sửa)",noticePublishBtn:"Đăng thông báo",oneStore:"TB một cửa hàng",allStore:"TB toàn hệ thống",noticeRead:"Tôi đã đọc",noticeReadDone:"Đã đọc",noticeReadOk:"Đã ghi nhận, cảm ơn!",noticeReadMark:"Đã đọc",noticeReadCount:"người đã đọc",noReaders:"Chưa có ai đọc",loading:"Đang tải…",noticeReaders:"Người đã đọc",noticeUnread:"Người chưa đọc",allRead:"Tất cả đã đọc",noticeMore:"Thêm thông báo",noticeFeedback:"Tôi có ý kiến (ẩn danh)",noticeFeatureWip:"Tính năng đang xây dựng",noticeKeyGot:"Đã kích hoạt cho bạn! Tính năng sắp mở",noticeKeyFail:"Kích hoạt thất bại, thử lại sau",noticeKeyHint:"Bấm nút trên để kích hoạt tính năng tương tác",noticeKeyClaiming:"Đang kích hoạt…",noticePubTitle:"Cập nhật thông báo",noticeHomeN:"Số tin trang chính",noticeShowFields:"Trường hiển thị công khai:",noticeSubcat:"Phân loại phụ",noticeTagsLabel:"Nhãn",noticeListN:"Số tin trang TB",noticePubBtn:"Lấy 2 tin mới nhất từ GAS lưu GitHub",noticePubbing:"Đang cập nhật…",noticePubOk:"Đã cập nhật",noticePubFail:"Thất bại",noticePubHint:"Bấm để đăng thông báo lên GitHub cho mọi người xem.",viewAll:"Xem tất cả",keyErrBatch:"Mã không đúng hoặc GAS chưa đặt BATCH_CODE",keyErrNoKey:"Quản lý chưa tạo khóa cho mã của bạn",keyErrRevoked:"Khóa đã bị vô hiệu",keyErrNetwork:"Không kết nối được GAS",keyErrMissing:"Thiếu mã",keyUpdating:"Đang cập nhật…",keyUpdateOk:"Hoàn tất ✓",keyUpdateFail:"Thất bại, thử lại sau",keyAdminSecPh:"Mật khẩu GAS",keyGenCodePh:"Mã GV cần tạo khóa",keyGenBtn:"Tạo khóa",keyGenDone:"Đã tạo khóa",keyGenExisted:"Khóa đã có (dùng lại)",keyClaimCode:"Mã nhận (đưa cho GV)",keyClaimHint:"GV nhập mã này ở trang cài đặt để nhận khóa.",keyClaimTitle:"Nhận khóa",keyClaimPh:"Nhập mã nhận",keyClaimBtn:"Nhận khóa",keyClaimOk:"Thành công",keyClaimFail:"Thất bại",keyClaimTeacherHint:"Xin mã nhận từ quản lý rồi nhập.",gasSettingHint:"Dán link Google Apps Script (dành cho quản lý).",gasTestBtn:"Kiểm tra kết nối",gasTesting:"Đang kiểm tra…",gasTestOk:"Kết nối OK",gasTestFail:"Kết nối thất bại",bizCutoffHint:"Công ty chốt sổ lúc 3 giờ sáng, nên có thể chỉnh giờ chuyển ngày của trang chủ theo thói quen của bạn. Ca ngày đặt giờ tan làm, ca đêm có thể đặt 3 giờ; sau 3 giờ tính là ngày hôm sau, tiện ghi chép. Mặc định hiện tại là 6 giờ 30, ca đêm tan làm muộn nhất là 6 giờ.",themeGray:"Xám",resetAll:"Khôi phục mặc định",resetAllConfirm:"Xác nhận? Sẽ xóa tất cả NV và QL (giữ admin 122, Token, log)",resetAllOk:"Đã khôi phục ✓",resetSup:"Xóa tất cả quyền QL",resetSupConfirm:"Xác nhận xóa tất cả quyền QL?",resetSupOk:"Đã xóa ✓",resetApp:"Đặt lại đơn",removeToken:"Xóa (offline)",removeSup:"Hủy quyền QL",removeConfirm:"Xác nhận xóa {0}?",connection:"Kết nối",connApply:"Yêu cầu xác thực",connCode:"Mã kết nối",connInput:"Dán mã kết nối",connOk:"Kết nối OK ✓",connFail:"Sai mã kết nối",connExpired:"Xác thực đã hết hạn, vui lòng yêu cầu lại",connStatus:"Trạng thái",connOnline:"Online ☁️",connOffline:"Offline 📥",editStaff:"Chỉnh sửa NV",editStore:"Chi nhánh",editDel:"Xóa NV",editDelConfirm:"Xác nhận xóa {0}?",editDevices:"Thiết bị",editRevokeConn:"Ngắt kết nối",editNoDevices:"Không có thiết bị",genConn:"Tạo mã kết nối",genConnHint:"Dán mã:uuid của NV",needConnFirst:"Cần kết nối trước khi yêu cầu quyền QL",skills:"Kỹ năng",guasha:"Cạo gió",baguang:"Giác hơi",xiujiao:"Sửa da chân",gs:"C",bg:"G",xj:"S",clearAll:"Xóa tất cả",notice1:"⚠️ Dữ liệu chỉ lưu trên máy, không tải lên đám mây.",notice2:"Trình duyệt LINE và trình duyệt mặc định lưu riêng, mã kích hoạt sẽ khác nhau. Hãy dùng cùng một trình duyệt.",notice3:"Dữ liệu gắn với điện thoại. Trước khi đổi máy, hãy xuất sao lưu trong Cài đặt.",authRedirectHint:"Nhấn để vào trang quản lý, xong có thể bấm quay lại màn hình ghi lương.",manualGen:"Tạo mã thủ công",manualGenHint:"Nhập mã nhân viên để tạo mã kích hoạt (dùng offline, không ghi vào danh sách đám mây)",booking:"Lịch hẹn",bookingNew:"Thêm lịch hẹn",bookingList:"Danh sách hẹn",bookingEmpty:"Chưa có lịch hẹn",custSearch:"Tìm khách (SĐT/tên/xưng hô)",custNew:"Khách mới",custName:"Tên",custPhone:"SĐT",custTitle:"Xưng hô",custParts:"Vùng trọng điểm",custNote:"Ghi chú",custEval:"Đánh giá",bookDate:"Ngày hẹn",bookTime:"Giờ hẹn",bookSave:"Lưu lịch hẹn",bookCancel:"Hủy",bookDelete:"Xóa lịch hẹn",bookDeleteConfirm:"Xác nhận xóa lịch hẹn này?",bookDeleteConfirm2:"Xác nhận xóa",selectCustomer:"Chọn khách",orNewCustomer:"Hoặc thêm khách",noMatch:"Không tìm thấy khách",lastServed:"Lần phục vụ trước",bookStatus:"Trạng thái",bookConfirmed:"Đã xác nhận",bookDone:"Hoàn thành",bookNoShow:"Không đến",pickCustomerFirst:"Vui lòng chọn hoặc thêm khách",needActivate:"Vui lòng kích hoạt ở trang ghi lương trước",backToMain:"Về ghi lương",svcLabel:"Dịch vụ",addHour:"Thêm giờ",party:"Số người đi cùng",workStart:"Giờ vào làm",workEnd:"Giờ tan làm",workEndNeed:"Đã điền giờ vào, vui lòng điền giờ tan",gender:"Giới tính",genderM:"Nam",genderF:"Nữ",crossNightHint:"Ca đêm qua ngày: khi giờ tan sớm hơn giờ vào, hệ thống tự tính sang ngày hôm sau.",email:"Email",pregClient:"Khách mang thai",oilLabel:"Dầu nóng",accept:"Nhận",reject:"Không nhận",techMentor:"GV hướng dẫn",techMentorPlaceholder:"Nhập số GV hướng dẫn",lockerNo:"Số tủ đồ tầng 4",teacherCode:"Mã giáo viên",teacherCodePlaceholder:"Nhập mã GV vd:122",submitActivation:"Gửi kích hoạt tài khoản",mustReadFirst:"Vui lòng đọc hướng dẫn bên dưới",readConfirm:"Tôi đã đọc hướng dẫn bên dưới",sendViaLine:"Gửi LINE cho QL",sendLineToTeacher:"Gửi LINE cho GV (mã)",sendLineLinkToTeacher:"Gửi liên kết cho GV",sendLineToSup:"Gửi LINE cho QL",lineConfirmPrefix:"Dữ liệu đã cập nhật, mã xác nhận như sau:",reqLinkTitle:"Đã nhận một mã yêu cầu",reqLinkDesc:"Hệ thống phát hiện mã yêu cầu. Nếu bạn có quyền quản lý, hãy xác minh danh tính bên dưới; nếu là giáo viên thường, không cần xử lý mã này.",lineActivatePrefix:"Vui lòng kích hoạt tài khoản GV số {code}",lineConnPrefix:"Mã kết nối như sau, vui lòng sao chép sử dụng:",lineActDonePrefix:"Mã kích hoạt của bạn như sau, nhập vào hệ thống để hoàn tất:",lineReqPrefix:"Mã cập nhật thông tin, vui lòng QL xác nhận:",lineConnReqPrefix:"Mã xin kết nối (nhờ QL tạo mã kết nối):",reqMissing:"Vui lòng điền đủ mục bắt buộc",addUnitTitle:"Thêm SL (mỗi lần = 1 khách)",oldGroupData:"Dữ liệu nhóm cũ",slipUnits:"SL",editMoreInMonthly:"Chi tiết thêm sửa ở Chi tiết tháng",pressBody:"Lực thân",pressFoot:"Lực chân",pressLight:"Nhẹ",pressNormal:"Vừa",pressHeavy:"Mạnh",strengthParts:"Vùng cần tăng cường",partHead:"Đầu",partShoulder:"Vai",partUpperback:"Lưng trên",partLowerback:"Lưng dưới",partWaist:"Eo",partButt:"Mông",partThigh:"Đùi",partCalf:"Bắp chân",partArm:"Cánh tay",clientReq:"Yêu cầu khách",reqMale:"Chỉ định nam",reqFemale:"Chỉ định nữ",reqTw:"Chỉ định Đài",reqVn:"Chỉ định Việt",reqCn:"Chỉ định Hoa",laodianOut:"KH quen ra bài",shiftOut:"Xoay ca ra bài",teacherNoPlaceholder:"Mã GV",custSearchHint:"Tìm khách (tên/xưng hô/SĐT/#tag)",custMatch:"Tìm thấy khách",custNewHint:"Không tìm thấy, sẽ tạo khách mới",custNoRecent:"Chưa có khách hàng",custEditTitle:"Sửa thông tin khách",custDelBtn:"Xóa khách này",custDelConfirm:"Bấm lần nữa để xóa",rangeCodeNote:"Mã này khôi phục nhanh tổng số chi và khách quen mỗi ngày, nhược điểm là không khôi phục được chi tiết từng lượt (dịch vụ, khách, vùng lực…), mỗi ngày sẽ gộp thành một dòng. Cần chi tiết đầy đủ hãy dùng「Tệp sao lưu đầy đủ (JSON)」.",
tabBasic:"Hồ sơ",tabStore:"Cửa hàng",tabBook2:"Lịch hẹn",tabCust:"Khách",tabNotice:"Thông báo",tabSuggest:"Góp ý",tabManage:"Quản lý",
secBasic:"Thông tin cơ bản",secStore:"Thông tin cửa hàng",nameZh:"Tên tiếng Trung",nameVi:"Tên tiếng Việt",address:"Địa chỉ",school:"Trường học",major:"Ngành học",permitDate:"Ngày cấp giấy phép LĐ",permitOrg:"Đơn vị cấp",optional:"Tùy chọn",
storeName:"Tên cửa hàng",shift:"Ca làm",shiftDay:"Ca sáng",shiftNight:"Ca đêm",workNote:"Ghi chú giờ làm đặc biệt",
skPregnant:"Khách đặc biệt (mang thai)",skOil:"Massage dầu",
custMgmt:"Quản lý khách",noticeCenter:"Thông báo công ty",suggestBox:"Góp ý",manageCenter:"Trung tâm quản lý",underConstruction:"Đang xây dựng",
confirmWithSup:"Xác nhận với quản lý",permitNo:"Số giấy phép",permitExpiry:"Ngày hết hạn",permitOrgOpt:"Đơn vị cấp",orgWDA:"Cục Phát triển Lực lượng LĐ",orgNIA:"Cục Di trú",orgOther:"Khác",permitExpiringSoon:"Giấy phép sắp hết hạn",phone2:"Điện thoại",city:"Tỉnh/Thành",district:"Quận/Huyện",addrDetail:"Địa chỉ",selectCity:"Chọn tỉnh/thành",selectDist:"Chọn quận",myBookingNote:"Lịch hẹn của tôi không phải dữ liệu đặt chỗ chính thức, chỉ để giáo viên ghi chú.",partyMember:"Người đi cùng thứ ",assignTeacher:"Chỉ định GV",noAssign:"Không chỉ định",svcNote:"Ghi chú dịch vụ",calView:"Lịch",eventView:"Sự kiện",totalPeople:"Tổng ",peopleUnit:" người",alsoAssign:"chỉ định thêm",assignMode:"Cách chỉ định",noAssignTeacher:"Không chỉ định GV",assignTeacherMode:"Chỉ định GV",assignByCode:"Theo mã số",assignByCond:"Theo điều kiện",assignMale:"GV nam",assignFemale:"GV nữ",assignTW:"GV Đài",assignVN:"GV Việt",assignOil:"Massage dầu",confirmWithCounter:"Xác nhận với quầy",confirmWithAssigned:"Xác nhận với GV",editBtn:"Sửa",saveChange:"Lưu thay đổi",logConfirmCounter:"Đã xác nhận giờ với quầy",logConfirmAssigned:"Đã xác nhận với GV {0}",logEditChange:"Sửa: {0}",foreignSection:"Nhân viên nước ngoài",permitNoLabel:"Số giấy phép làm việc",langSchool:"Trường ngôn ngữ đang học",schoolType:"Đang học",schoolTypeLang:"Trường ngôn ngữ",schoolTypeUni:"Đại học",schoolTypeMaster:"Thạc sĩ",schoolTypePhd:"Tiến sĩ",selectLangSchool:"Chọn trường",closeThis:"Đóng trang",confirmedAssignedToast:"Đã xác nhận với GV {0}",confirmedCounterToast:"Đã xác nhận với quầy",statusUnconfirmed:"Chưa xác nhận",statusConfirmed:"Đã xác nhận",statusAssignedConfirmed:"Đã xác nhận với GV chỉ định",statusReconfirm:"Lịch hẹn đã đổi, xác nhận lại",statusTeacherProgress:"Đã xác nhận GV ({0}/{1})",confirmedTeacherToast:"Đã xác nhận GV ({0}/{1})",hidePast:"Ẩn đã qua",workTimeEdit:"Giờ làm việc",workStartH:"Vào ca",workEndH:"Tan ca",saveWorkTime:"Lưu giờ",internSup:"Phó QL thực tập",confirmSuccess:"Đã xác nhận, dữ liệu cập nhật",confirmFail:"Mã xác nhận sai",scanReqEntry:"Quét mã yêu cầu",reqBasic:"YC hồ sơ",reqStore:"YC cửa hàng",agreeWrite:"Đồng ý & ghi",disagree:"Không đồng ý",writeOk:"Đã ghi, mã XN: ",giveConfirmCode:"Đưa mã XN cho GV",logReqWritten:"Đã ghi YC {0}: {1}",uuidBound:"Đã gắn thiết bị",uuidNew:"Thiết bị mới",workChartTitle:"Thống kê giờ làm",workChartOnline:"Đang làm",workChartStart:"Giờ vào ca",workChartOnlineDesc:"Số GV đang làm theo giờ",workChartStartDesc:"Số GV vào ca theo giờ",allStores:"Tất cả CH",tabChart:"Biểu đồ",chartShiftRatio:"Tỷ lệ ca",chartGenderRatio:"Tỷ lệ giới",chartAnalysis1:"Phân tích 1",chartAnalysis2:"Phân tích 2",chartWorkStart:"Số vào ca",chartOnline:"Đang làm",chartWorkStartDesc:"Số GV vào ca theo giờ",chartOnlineDesc:"Số GV đang làm theo giờ (gồm qua đêm)",peopleUnit2:"người",chartDayShift:"Ca sáng",chartNightShift:"Ca tối",chartMale:"Nam",chartFemale:"Nữ",chartOther:"Khác",chartUpdatedAt:"Cập nhật",chartNoData:"Chưa có dữ liệu, chờ QL công bố",chartSupOnly:"Cần quyền QL",chartPublished:"Đã công bố",statTotal:"Tổng số",chartUpdate:"Cập nhật",slipList:"Lịch sử",slipAuto:"Tự động",slipStartTime:"Giờ bắt đầu",slipDelete:"Xóa mục này",slipTags:"Nhãn KH (tùy chọn)",slipTagsPlaceholder:"Cách bằng dấu cách, Enter hoặc +",slipTagHistory:"Nhãn cũ:",slipTagAdd:"Thêm",custTagStats:"Thống kê nhãn",custSearchBtn:"Quản lý khách",custNoTags:"Chưa có nhãn, hãy ghi ở lịch sử mỗi ngày",custSearchPlaceholder:"Tìm tên / xưng hô / SĐT",myBooking2:"Lịch hẹn của tôi",
tabHome2:"Trang chính",tabBackup:"Sao lưu",homeSettings:"Cài đặt hệ thống",backupCenter:"Sao lưu",
curStore:"Cửa hàng hiện tại",applyChange:"Xin đổi",genBasicCode:"Tạo mã hồ sơ",genStoreCode:"Tạo mã cửa hàng",basicApplyCode:"Mã hồ sơ",storeApplyCode:"Mã cửa hàng",confirmCode2:"Mã xác nhận",copyBtn:"Sao chép",lastSyncAt:"Đồng bộ lần cuối",fullStaffData:"Dữ liệu đầy đủ",fullBasicData:"Hồ sơ cơ bản",fullStoreData:"Hồ sơ cửa hàng",saveToStaff:"Lưu vào staff",saved:"Đã lưu",saveFailStaff:"Lưu thất bại",staffValueHint:"Công ty ghi",
syncStoreBooking:"Đồng bộ lịch hẹn cửa hàng",syncBtn:"Đồng bộ",pasteBtn:"Dán",noFuncYet:"(Chưa có chức năng)",tabViolation:"Vi phạm",violationTitle:"Hồ sơ vi phạm",noViolation:"Bạn chưa có ghi nhận vi phạm",violationCode:"Mã xác nhận vi phạm",dutyTitle:"Trực nhật",noDuty:"Chưa có ghi nhận trực nhật",prevConfirmed:"Giá trị xác nhận trước",needConfirm:"Vui lòng hoàn tất thông tin rồi xác nhận với quản lý",serviceStatus:"Trạng thái máy/kết nối",
privacyTitle:"Lưu trữ dữ liệu",privacyBody:"Mọi thông tin cá nhân và bảng lương chỉ lưu trên thiết bị của bạn, không tải lên máy chủ, cửa hàng và quản lý đều không đọc được.",browserNote:"Bộ nhớ tạm của LINE và trình duyệt điện thoại là riêng biệt. Nếu mở bằng trình duyệt khác, hệ thống sẽ yêu cầu nhập lại mã kích hoạt. Nên dùng cố định một trình duyệt.",
backupReminder:"Lịch hẹn và mọi dữ liệu chỉ lưu trên máy. Khi đổi điện thoại dữ liệu sẽ mất. Trước khi đổi máy, hãy vào trang Sao lưu để xuất mã sao lưu.",
basicUpdateCode:"Mã cập nhật hồ sơ",storeUpdateCode:"Mã cập nhật cửa hàng",basicConfirmCode:"Mã xác nhận hồ sơ",storeConfirmCode:"Mã xác nhận cửa hàng",conflictWarn:"Trùng với {0} {1}",dayOffWarn:"Hôm đó đã nghỉ {0}",units:"suất",partyUnit:"người",noWorkEnd:"Chưa đặt giờ tan làm",bookEdit:"Sửa",bookConfirmDesk:"Xác nhận quầy",bookConfirmed2:"Đã xác nhận với quầy",bookEditWarn:"Sau khi đổi giờ hãy xác nhận lại với quầy",bookLogTitle:"Lịch sử thay đổi",logCreate:"Tạo lịch hẹn",logConfirm:"Xác nhận với quầy",logChange:"Thay đổi lịch hẹn",logConflict:"Hệ thống phát hiện trùng giờ vẫn tạo",custEditTitle:"Sửa khách",custSave:"Lưu",bookSaveEdit:"Lưu thay đổi",timeChanged:"Giờ {0} → {1}",svcChanged:"DV {0} → {1}",lockPwdTitle:"Đặt mật khẩu mở khóa 4 số",lockPwdHint:"Dùng để mở khóa màn hình sau này, không được 4 số giống nhau hoặc liên tiếp tăng/giảm",lockPwdConfirm:"Nhập lại để xác nhận",lockPwdMismatch:"Hai lần nhập không khớp",lockPwdInvalid:"Mật khẩu không được 4 số giống nhau hoặc liên tiếp",flowNew:"Kích hoạt NV mới",flowLogin:"Đã có tài khoản, đăng nhập mật khẩu",pwdLoginTitle:"Đăng nhập mật khẩu",pwdLoginHint:"Nhập mã và mật khẩu để đăng nhập, không cần xin mã kích hoạt từ quản lý",pwdInputPh:"Mật khẩu 4 số",pwdLoginBtn:"Đăng nhập",pwdLoginFail:"Sai mã hoặc mật khẩu",backToChoice:"Quay lại lựa chọn",forgotPwdLink:"Quên mật khẩu?",forgotPwdTitle:"Quên mật khẩu",forgotPwdHint:"Hệ thống sẽ tạo mã, gửi cho quản lý xác nhận rồi mới đặt lại được mật khẩu",ticketCode:"Mã",ticketSend:"Gửi LINE cho QL",ticketCheckBtn:"Kiểm tra tình trạng duyệt",ticketChecking:"Đang kiểm tra…",ticketPending:"Chưa được duyệt, vui lòng chờ",ticketApproved:"Đã duyệt!",ticketWaitCountdown:"Vui lòng chờ {0} giây rồi kiểm tra lại",setNewPwdTitle:"Đặt mật khẩu mới",shiftLabel:"Ca làm",shiftDay:"Ca ngày",shiftNight:"Ca đêm",lineTicketNewPrefix:"Nhờ duyệt kích hoạt tài khoản mới cho NV #{code}, mã:",lineTicketForgotPrefix:"Nhờ duyệt yêu cầu quên mật khẩu của NV #{code}, mã:",ticketLookup:"Tra cứu mã",ticketLookupBtn:"Tra cứu",ticketLookupPh:"Dán mã NV gửi tới",ticketNotFound:"Không tìm thấy mã",ticketAlreadyDone:"Yêu cầu này đã được xử lý",ticketApproveBtn:"Duyệt",ticketApproveOk:"Đã duyệt ✓",ticketApproveFail:"Duyệt thất bại",ticketInfoTeacher:"Mã NV",ticketInfoStore:"Cửa hàng",ticketInfoGender:"Giới tính",ticketInfoWork:"Giờ làm",ticketInfoShift:"Ca làm",ticketTypeN:"Kích hoạt NV mới",ticketTypeF:"Quên mật khẩu",noticePwdSetupTitle:"Đặt mật khẩu 4 số",noticePwdSetupBody:"Nội dung thông báo là dữ liệu công ty. Để bảo mật, vui lòng đặt mật khẩu riêng 4 số. Sau này khi mở dữ liệu công ty, hệ thống sẽ yêu cầu nhập mật khẩu xác nhận (trong 5 phút không cần nhập lại).",noticePwdSetupBtn:"Đặt mật khẩu",noticePwdLockedTitle:"Nhập mật khẩu",noticePwdLockedBody:"Thông báo là dữ liệu công ty, vui lòng nhập mật khẩu để xác nhận",noticePwdUnlockBtn:"Mở khóa",noticePwdWrong:"Sai mật khẩu, vui lòng nhập lại",checkCodeBtn:"Kiểm tra",checkingCode:"Đang kiểm tra…",codeExistsHint:"Mã này đã kích hoạt, vui lòng đăng nhập bằng mật khẩu",codeCheckFail:"Kiểm tra thất bại, thử lại",codeAvailHint:"Mã hợp lệ, vui lòng điền tiếp",ticketPendingNewTitle:"Đang chờ duyệt kích hoạt NV mới",ticketPendingForgotTitle:"Đang chờ duyệt quên mật khẩu",newPwdTitle:"Mật khẩu mới",newPwdHint:"Nguyên tắc như lúc đăng ký: không được 4 số giống nhau hoặc liên tiếp",ticketClearBtn:"Xóa",ticketNotifyBtn:"Báo cho người đăng ký đã duyệt",lineApprovedPrefix:"{code} Xin chào: Tài khoản của bạn đã được kích hoạt, vui lòng bấm 'Kiểm tra tình trạng duyệt' trên trang web để đăng nhập vào trang chính và quản lý số lượng công việc. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ!",ticketTypeA:"Đăng ký quản lý",lineTicketSupPrefix:"Nhờ duyệt đăng ký quản lý cho NV #{code}, mã:",ticketTypeB:"Đăng ký cập nhật hồ sơ",ticketTypeS:"Đăng ký cập nhật cửa hàng",lineTicketBasicPrefix:"Nhờ duyệt cập nhật hồ sơ cho NV #{code}, mã:",lineTicketStorePrefix:"Nhờ duyệt cập nhật cửa hàng cho NV #{code}, mã:",infoEditBtn:"Sửa",infoSubmitBtn:"Gửi",infoCancelBtn:"Hủy",infoNoChange:"Không có thay đổi nào",infoChangedTitle:"Các mục đã thay đổi",infoPwdSetupBasicBody:"Trang này chứa thông tin cá nhân. Để bảo mật, vui lòng đặt mật khẩu riêng 4 số. Sau này khi mở thông tin cá nhân, hệ thống sẽ yêu cầu nhập mật khẩu xác nhận (trong 5 phút không cần nhập lại).",infoPwdSetupStoreBody:"Thông tin cửa hàng là dữ liệu công ty. Để bảo mật, vui lòng đặt mật khẩu riêng 4 số. Sau này khi mở dữ liệu công ty, hệ thống sẽ yêu cầu nhập mật khẩu xác nhận (trong 5 phút không cần nhập lại).",infoPwdLockedBasicBody:"Trang này chứa thông tin cá nhân, vui lòng nhập mật khẩu để xác nhận",infoPwdLockedStoreBody:"Thông tin cửa hàng là dữ liệu công ty, vui lòng nhập mật khẩu để xác nhận",lineApprovedForgotPrefix:"{code} Xin chào, yêu cầu đặt lại mật khẩu của bạn đã được duyệt, vui lòng bấm 'Kiểm tra tình trạng duyệt' trên trang web để đăng nhập. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ.",lineApprovedSupPrefix:"{code} Xin chào, yêu cầu đăng ký quyền quản lý của bạn đã được duyệt, vui lòng bấm 'Kiểm tra tình trạng duyệt' để hoàn tất kích hoạt. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ.",lineApprovedBasicPrefix:"{code} Xin chào, yêu cầu cập nhật hồ sơ của bạn đã được duyệt, vui lòng bấm 'Kiểm tra tình trạng duyệt' để hoàn tất đồng bộ. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ.",lineApprovedStorePrefix:"{code} Xin chào, yêu cầu cập nhật cửa hàng của bạn đã được duyệt, vui lòng bấm 'Kiểm tra tình trạng duyệt' để hoàn tất đồng bộ. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ.",ticketInfoApplyTime:"Thời gian đăng ký",ticketInfoApproveTime:"Thời gian duyệt",ticketInfoApprover:"Người duyệt",revokeSupBtn:"Thu hồi quyền quản lý",revokeSupConfirm:"Xác nhận thu hồi quyền quản lý của người này?",revokeSupOk:"Đã thu hồi ✓",revokeSupFail:"Thu hồi thất bại",rejectBtn:"Trả lại",rejectReasonPh:"Lý do trả lại (tùy chọn, để NV biết cần sửa gì)",ticketRejected:"Đã trả lại",ticketRejectedReason:"Lý do trả lại",reeditBtn:"Sửa rồi gửi lại",keyExpiredMsg:"Chứng chỉ đã hết hạn, vui lòng liên hệ quản lý",keyInvalidMsg:"Chứng chỉ không hợp lệ, không thể xem",keyInvalidEditMsg:"Chứng chỉ không hợp lệ, không thể gửi thay đổi, vui lòng liên hệ quản lý",noticeListTextLabel:"Văn bản danh sách dùng:",noticeListTitle:"Tiêu đề",noticeListSummary:"Tóm tắt",noticeCountTypeLabel:"Hiển thị số lần mở:",noticeCountPeople:"Số người (không trùng)",noticeCountVisits:"Số lượt (tất cả)",credentialLabel:"Trạng thái chứng chỉ",credentialOk:"Bình thường",credentialExpired:"Chứng chỉ đã hết hạn",leaveBtn:"Nghỉ việc",leaveConfirmTitle:"Xác nhận nghỉ việc?",leaveConfirmMsg:"Sau khi bấm, tài khoản sẽ vào quy trình nghỉ việc và lưu lại hồ sơ. Dữ liệu công ty (thông báo, cửa hàng) sẽ không xem được nữa. Số liệu công việc bạn đã ghi vẫn được giữ trên máy, bạn có thể tự sử dụng.",leaveConfirmBtn:"Xác nhận nghỉ việc",leaveOk:"Đã hoàn tất quy trình nghỉ việc",leaveFail:"Xử lý thất bại, thử lại sau",ticketTypeE:"Đăng ký gia hạn chứng chỉ",lineTicketRenewPrefix:"Nhờ duyệt gia hạn chứng chỉ cho NV #{code}, mã:",lineApprovedRenewPrefix:"{code} Xin chào, yêu cầu gia hạn chứng chỉ của bạn đã được duyệt, vui lòng bấm 'Kiểm tra tình trạng duyệt' để hoàn tất gia hạn. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ.",renewModalTitle:"Gia hạn chứng chỉ",renewModalBody:"Chứng chỉ của bạn đã hết hạn, không thể xem dữ liệu công ty (thông báo, cửa hàng). Gửi yêu cầu gia hạn cho quản lý, sau khi duyệt sẽ khôi phục.",noticeOffBtn:"Gỡ xuống",noticeOnBtn:"Đăng lại",noticeOffConfirm:"Xác nhận gỡ thông báo này? Sau khi gỡ, nhân viên thường sẽ không thấy, nhưng bạn vẫn thấy trong danh sách (chữ xám).",noticeOpenersTitle:"Người đã mở",catTabAll:"Tất cả",credentialInvalid:"Không hợp lệ",credentialExpiryLabel:"Hạn chứng chỉ",leftDateLabel:"Ngày nghỉ việc",expiredLabel:"Đã hết hạn",noticeLocalBadge:"Máy này",lockPwdSectionTitle:"Mật khẩu bảo vệ",disableHomePwdLabel:"Tắt yêu cầu mật khẩu bảo vệ ở trang chủ",lockAutoTimeLabel:"Thời gian tự khóa mật khẩu bảo vệ",lockAutoTimeHint:"phút (tối thiểu 5 phút)",homePwdPopupTitle:"Vui lòng nhập mật khẩu bảo vệ",homePwdPopupBody:"Lần đầu mở hôm nay, vui lòng nhập mật khẩu xác nhận",gloveSize:"Cỡ găng tay",groupBuyBtn:"Mua chung",groupBuyTitle:"Danh sách mua chung",groupBuyTabList:"Mua chung",groupBuyTabMine:"Đăng ký của tôi",groupBuyEmpty:"Hiện không có đợt mua chung nào",groupBuyMineEmpty:"Bạn chưa tham gia đợt mua chung nào",groupBuyJoinBtn:"Đăng ký",groupBuyJoinOk:"Đã đăng ký ✓",groupBuyCreateBtn:"Phát động mua chung",groupBuyCreateTitle:"Phát động mua chung găng tay",groupBuyDeadlineLabel:"Ngày kết thúc",groupBuyPopupTitle:"Mua chung găng tay",groupBuyPopupBody:"Hiện có đợt mua chung găng tay, bạn có muốn tham gia?",groupBuyPopupJoin:"Tham gia",groupBuyPopupSkip:"Chưa tham gia",groupBuyOrderCount:"người đăng ký",drBtn:"Báo cáo",drTitle:"Báo cáo an toàn thiên tai",drDateLabel:"Ngày",drTypeLabel:"Loại thiên tai",drTypeEarthquake:"Động đất",drTypeTyphoon:"Bão",drTypeFlood:"Ngập lụt",drTypeLandslide:"Sạt lở đất",drStatusLabel:"Tình trạng",drSafe:"Tôi an toàn",drCantLeave:"Không thể ra ngoài",drVehicleDamaged:"Phương tiện bị hư hỏng",drSick:"Không khỏe",drNeedAddrHint:"Vui lòng điền tỉnh/thành và quận/huyện liên lạc trước khi báo cáo",drSubmitBtn:"Gửi báo cáo",drSubmitOk:"Đã gửi báo cáo",drSubmitFail:"Gửi thất bại, thử lại",ticketTypeR:"Đăng ký phục chức",lineTicketReinstatePrefix:"Nhờ duyệt phục chức cho NV #{code}, mã:",lineApprovedReinstatePrefix:"{code} Xin chào, yêu cầu phục chức của bạn đã được duyệt, vui lòng quay lại trang đăng nhập dùng mật khẩu cũ để đăng nhập. Nếu có góp ý gì, xin vui lòng cho tôi biết, chúc bạn sử dụng vui vẻ.",accountLeftMsg:"Tài khoản này đã nghỉ việc, nếu cần phục chức vui lòng gửi yêu cầu",reinstateBtn:"Gửi yêu cầu phục chức",reinstateHint:"Sau khi gửi, quản lý sẽ duyệt. Sau khi duyệt, dùng mật khẩu cũ quay lại trang đăng nhập, không cần đặt lại mật khẩu.",reinstateApprovedMsg:"Phục chức đã được duyệt, vui lòng dùng mật khẩu cũ đăng nhập",groupBuyItemLabel:"Mặt hàng mua chung",groupBuyItemGlove:"Găng tay",groupBuyItemCustom:"Mặt hàng tự chọn",groupBuyCustomItemPh:"Nhập tên mặt hàng",groupBuyAmountLabel:"Số tiền",groupBuyAmountPh:"Số tiền mỗi phần",groupBuyScopeLabel:"Phạm vi thông báo",groupBuyScopeStore:"Thông báo 1 cửa hàng",groupBuyScopeAll:"Thông báo toàn hệ thống",groupBuyDeadline24hHint:"Nhân viên thường chỉ đặt được hạn tối đa 24 giờ",groupBuyDeclineBtn:"Không cần",groupBuyDeclinedOk:"Đã đánh dấu không cần",groupBuyCloseBtn:"Kết thúc sớm",groupBuyCloseConfirm:"Xác nhận kết thúc sớm đợt mua chung này?",groupBuyClosedTag:"Đã kết thúc",groupBuyViewJoined:"DS tham gia",groupBuyViewDeclined:"DS không cần",groupBuyViewOpens:"Đã xem",drSurveyNameLabel:"Tên thiên tai",drSurveyNamePh:"VD: Bão 0710",drSurveyStartLabel:"Ngày bắt đầu báo cáo",drCreateSurveyBtn:"Phát động báo cáo an toàn",drEndSurveyBtn:"Kết thúc khảo sát",drSurveyEndedTag:"Đã kết thúc",drNoActiveSurvey:"Hiện không có khảo sát thiên tai nào",drOtherLabel:"Khác",drOtherPh:"Tự điền tình trạng",drMyReportsTitle:"Báo cáo của tôi",drDayLabel:"Ngày thứ {0}",drQueryDayTitle:"Tra cứu tình trạng báo cáo",drDidReport:"Đã báo cáo",drNotReport:"Chưa báo cáo",drCopyNotReportBtn:"Sao chép DS chưa báo cáo",drCopiedMsg:"Đã sao chép",applying:"Đang gửi…",drMessageLabel:"Nội dung thông báo (tùy chọn, hiện trong popup và tin sao chép)",drMessagePh:"VD: Vui lòng báo cáo an toàn mỗi ngày",drScopeLabel:"Phạm vi chủ động thông báo (mặc định không thông báo)",drScopeStore:"Chủ động thông báo 1 cửa hàng",drScopeAll:"Chủ động thông báo toàn hệ thống",drReportRecordTitle:"Nhật ký báo cáo an toàn",drTodayReported:"Hôm nay bạn đã báo cáo:",drAddMoreBtn:"Thêm 1 báo cáo an toàn",drDeleteConfirm:"Xác nhận xóa khảo sát đã kết thúc này?",drQueryReportsBtn:"Tra cứu tình trạng báo cáo",drSelectDayPh:"Chọn ngày thứ mấy",groupBuyTabCreated:"Do tôi phát động",groupBuyQtyLabel:"Số lượng",groupBuyConfirmBtn:"Hoàn tất",groupBuyDeclineCountLabel:"Số người không cần",groupBuyCreatedCount:"Có {0} người đăng ký",groupBuySizeGroup:"Cỡ {0} có {1} người: {2}",groupBuyMineCreatedEmpty:"Bạn chưa phát động đợt mua chung nào",groupBuyEndedTitle:"Đã kết thúc",groupBuyPaidBtn:"Đã trả tiền",groupBuyArrivedBtn:"Đã nhận hàng",groupBuySubtotalLabel:"Tổng cộng",homeLayoutTitle:"Hiển thị bố cục trang chủ",homeLayoutA:"Thêm suất nhanh（+1+2+3）",homeLayoutB:"Danh sách công việc hôm nay",homeLayoutC:"Chọn trạng thái（Bình thường／Việc riêng／Ốm／Nghỉ）",homeLayoutHint:"Sau khi tắt, vẫn có thể bấm vào ngày hôm nay để vào màn hình chỉnh sửa, chỉ là trang chủ sẽ không hiển thị trực tiếp",blacklistTab:"DS từ chối phục vụ",blacklistCheck:"Từ chối",blacklistReasonHarass:"Quấy rối",blacklistReasonOther:"Khác",blacklistReasonPh:"Nhập lý do",blacklistNoCandidate:"Hiện chưa có khách nào được đánh dấu từ chối, vui lòng tick chọn trong chi tiết công việc trước",blacklistSubmitBtn:"Gửi yêu cầu từ chối",blacklistReasonLabel:"Lý do từ chối",blacklistSearchPh:"SĐT／Tên／Xưng hô／Mã NV từ chối",ticketTypeK:"Yêu cầu từ chối khách"}};

/* ══════════ Export to global (window.MP) ══════════ */
window.MP={
  LS,
  // crypto
  getKeyConfig,saveKeyConfig,buildDynamicKey,getCK,xEnc,xDec,fnv,
  adminHash,genAdminAct,revokeHash,approveHash,supApproveHash,genSimpleAct,isValidPin,
  encWithKey,decWithKey,actKey,lockPwdCred,genActWithToken,verifyActToken,genUUID,getDeviceId,
  genReqCode,parseReqCode,decReqCode,genConfirmCode,verifyConfirmCode,confirmCodeIsBound,REQ_CAT,identifyReqCode,buildReqLink,parseReqHash,genConnReq,parseConnReq,genSupReq,parseSupReq,sendTicketFlex,
  // sup levels
  SUP_LEVELS,supLevelName,effSupLevel,
  // github
  getGHConfig,saveGHConfigLocal,saveGHConfig,ghReadFile,ghWriteFile,ghAppendLine,ghRemoveLine,
  // staff/stores/approval
  readStaff,writeStaff,checkApproved,writeApproval,loadStores,saveStores,computeStats,publishStats,loadStats,
  getApproved,saveApproved,addApproved,
  // logs
  addLog,getLogs,fmtLog,fmtDate,
  // theme
  THEMES,
  // data helpers
  SKILL_KEYS,SKILL_SHORT,SKILL_PRICES,SKILL_COLORS,SK,SBG,STC,canWork,
  toB36,fromB36,dim,dow,bizDate,bizParts,BIZ_CUTOFF_MIN,getBizCutoff,dk,eDay,stamp,calcSal,eMon,encMonth,decBackup,dataMonthRange,encRange,decRange,makePersonalBackup,parsePersonalBackup,restorePersonalBackup,
  newSlip,slipUnitsTotal,slipLaodianTotal,PRESS_LEVELS,BODY_PARTS,CLIENT_REQS,custKey,loadCustDB,saveCustDB,getCust,getGasUrl,setGasUrl,getBuiltinGasUrl,shouldClaimKey,autoClaimKey,diagClaimKey,gasCall,gasCallPost,gasWarmup,getNoticesLocal,saveNoticesLocal,fetchNotices,getNoticeHomeCount,getNoticeShow,getNoticeListText,getNoticeCountType,getNoticeMainCats,publishNotices,noticeBody,noticeTitle,noticeSummary,noticeCats,noticeTags,getMyKey,setMyKey,hasMyKey,isNoticeRead,markNoticeRead,getNoticeReadCount,getNoticeReaders,getNoticeUnread,gasTranslate,gasAnalyze,gasUsage,gasAddNotice,gasEditNotice,gasSubmitAction,gasCheckAction,gasApproveAction,gasBlacklistSubmit,gasBlacklistCheck,gasBlacklistApprove,gasBlacklistSearch,gasSfGetPendingDetail,gasSfApprovePendingRegistration,gasUpdatePwd,gasLoginPwd,gasSetInitialPwd,gasResetLockPwd,gasSyncProfile,gasCheckCode,gasAuthStaffList,gasGetGHConfigForSupervisor,gasRevokeSup,gasRejectAction,gasVerifyKey,gasLogNoticeOpen,gasLeaveTeacher,gasToggleNoticeStatus,gasSubmitSuggestion,gasListSuggestions,gasPushNoticeFlexToMe,gasLogDailyCheck,gasCreateGroupBuy,gasListGroupBuys,gasJoinGroupBuy,gasMyGroupBuyOrders,gasSubmitDisasterReport,gasDeclineGroupBuy,gasLogGroupBuyOpen,gasCloseGroupBuy,gasGroupBuyDetail,gasSetGroupBuyOrderStatus,gasCreateDisasterSurvey,gasEndDisasterSurvey,gasDeleteDisasterSurvey,gasListDisasterSurveys,gasMyDisasterReports,gasDisasterDayStatus,getAdminSecret,setAdminSecret,hasAdminSecret,issueKey,claimMyKey,upsertCust,deleteCust,searchCustDB,recentCust,custLastSlip,migrateDayGroups,migrateMonthGroups,slipSvcLabel,slipStartTime,loadTagHistory,addTagHistory,visitStats,collectSlips,collectAllSlips,tagStats,searchSlips,
  getCustomers,saveCustomers,getBookings,saveBookings,uid,upsertCustomer,normPhone,searchCustomers,addBooking,updateBooking,deleteBooking,confirmBooking,BOOK_TITLES,bookTitleName,
  SERVICES,svcByCode,bookUnits,bookMinutes,bookLabel,bookRange,findConflicts,dayOffStatus,bookLog,skName,
  TW_REGIONS,LANG_SCHOOLS,
  // i18n
  T
};

})(window);
