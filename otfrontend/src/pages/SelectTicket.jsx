import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import '../Css/SelectTicket.css';

// **** 設定Spring Boot基礎URL ****
const BASE_API_URL = 'http://localhost:8080';
//圖片先寫死
const DEFAULT_IMAGE_URL = "/images/test.jpg";

export default function SelectTicket() {
  const params = new URLSearchParams(window.location.search);
  const eventId = Number(params.get("eventId")) || 0;

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");

  //防止重複點擊
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  //使用ref保存計時器
  const [rollbackTimer, setRollbackTimer] = useState(null);

  const totalAmount = tickets.reduce(
    (acc, t) => acc + (t.selectedQty || 0) * Number(t.finalPrice ?? t.customprice ?? 0),
    0
  );
  const totalTickets = tickets.reduce((acc, t) => acc + (t.selectedQty || 0), 0);
  const selectedTicketsArray = tickets
    .filter((t) => t.selectedQty > 0)
    .map((t) => `${t.ticketType} ${t.selectedQty}張`)

    const MAX_TICKETS_PER_LINE = 2;

    let selectedTicketText = "";
    for (let i = 0; i < selectedTicketsArray.length; i++) {
    selectedTicketText += selectedTicketsArray[i];

    if (i < selectedTicketsArray.length - 1) {
      // 如果不是最後一個項目
      if ((i + 1) % MAX_TICKETS_PER_LINE === 0) {
        // 每隔 N 個項目後換行
        selectedTicketText += " / \n"; // 插入斜線和換行符
      } else {
        // 其他項目間使用斜線分隔
        selectedTicketText += " / ";
      }
    }
  }
  //載入活動資料
  useEffect(() => {
    if (!eventId) return;
    fetch(`${BASE_API_URL}/api/events/${eventId}`)
      .then((r) => {
        if (!r.ok) throw new Error("無法取得活動資料");
        return r.json();
      })
      .then((data) => setEvent(data))
      .catch((err) => {
        console.error(err);
        setMessage("讀取活動資料發生錯誤：" + err.message);
      });
  }, [eventId]);

  //載入票種資料
  const loadTicketTypes = () => {
    if (!eventId) return;

    fetch(`${BASE_API_URL}/api/eventtickettype/event_ticket_type/${eventId}`, {
      credentials: 'include'})
      .then((r) => {
        if (!r.ok) throw new Error(`無法取得票種資料，錯誤碼: ${r.status}`);
        return r.json();
      })
      .then((resp) => {
        let ticketsArray = resp;
        if (resp && typeof resp === "object" && !Array.isArray(resp)) {
          ticketsArray = resp.data ?? resp.items ?? resp.tickets ?? ticketsArray;
        }
        console.log("API raw response for tickets:", resp);

        if (!Array.isArray(ticketsArray)) {
          throw new Error("API 返回資料格式不正確，預期為陣列。");
        }

        // map做多種欄位名稱容錯(依後端DTO可以調整）
        const withQty = ticketsArray.map((t) => {
          // 支援多種 description 來源（避免欄位命名差異）
          const desc =
            t.description ??
            t.desc ??
            t.note ??
            t.ticketDescription ??
            t.ticket_template?.description ??
            "";

          //處裡不限量(is_limited = 0)
            const rawLimited = t.isLimited ?? t.is_limited ?? t.islimited; //1預設為限量
            //如果不限量(isLimited === 0)且customlimit為null
            // if (isLimited === 0 || isLimited === 0){
            //   stockLimit = 4;
            // }
            const isUnlimited =
              rawLimited === false ||
              rawLimited === 0 ||
              rawLimited === "0" ||
              rawLimited === "false";
            //確保讀取到 'islimited' 欄位
            // const isLimitedStatus = t.isLimited ?? t.is_limited ?? t.islimited ?? 1; 
            let stockLimit;
            const UI_MAX_CAP = 4; //前端介面的最大購買張數
            const UNLIMITED_STOCK_FLAG = 999;//不限量票
            // 假設後端傳回 islimited: false 時是 '不限量'
            if (isUnlimited) {
                  // 如果不限量，設置一個極大值，讓 Math.min(4, stockLimit) 保持在 4
                  stockLimit = UNLIMITED_STOCK_FLAG;
              } else {
                  // 如果是限量 (rawLimited=true/1)，則使用後端傳回的 customlimit，若為 null 則設為 0
                  stockLimit = Number(t.customlimit ?? 0);
              }
          // 支援多種 price 欄位命名
          
          const price = t.customprice ?? t.price ?? t.custom_price ?? 0;
  
          // 優先取 id，若沒有 id 就使用 ticket_template_id 當 key（避免 key 為 undefined）
          const id = t.id ?? t.ticket_template_id ?? null;

          // 印出每筆原始物件與解析結果，方便 debug
          // console.log("ticket raw:", t, "=> resolved desc:", desc, "=> id:", id, "=> price:", price);

          //早鳥票
            const earlyBirdEnabled = t.earlyBirdEnabled ?? false;
            const discountRate = t.discountRate ?? 0;
            const finalPrice = t.finalPrice ?? price;

          return {
            id: id,
            ticket_template_id: t.ticket_template_id ?? null,
            ticketType: t.ticketType ?? t.name ?? "未命名票種",
            finalPrice: finalPrice,
            customprice: price,
            description: desc,
            selectedQty: 0,
            customlimit: stockLimit,
            //早鳥票相關欄位
            earlyBirdEnabled: t.earlyBirdEnabled ?? false,
            discountRate: t.discountRate ?? 0,
            
          };
        });

        setTickets(withQty);
      })
      .catch((err) => {
        console.error(err);
        setMessage("讀取票種資料時發生錯誤: " + err.message);
      });
  };
  useEffect(() => {
    loadTicketTypes();
  }, [eventId]);

  //處理票數變更
  function handleQtyChange(ticketId, qty) {
    //取得票種可用庫存
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    //設定最大購買量:取4張，或實際庫存兩者的最小值
    const maxAvailableQty = Math.min(4, Number(ticket.customlimit || 4));

    //確保選中數量不超過最大可用數量(目前設定最大4張)
    // const maxQty = tickets.find(t => t.id === ticketId)?.customlimit ?? 4; // 假設最大購買量是 4
    const finalQty = Math.min(qty, maxAvailableQty);
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, selectedQty: finalQty } : t))
    );
    
  }

  //處理庫存回滾rollback
  // const rollbackStock = async (itemsToRollback) => {
  //   setMessage("已超過2分鐘，訂單未付款，票將退回庫存");
  //   console.log("開始回滾", itemsToRollback);

  //   const increasePromises = itemsToRollback.map(async (item) => {
  //     const url = `${BASE_API_URL}/api/eventtickettype/${item.ticketId}/increaseStock`;
  //     const response = await fetch(url, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ quantity: item.quantity }),
  //     });

  //     if (!response.ok) {
  //       console.error(`票種ID ${item.ticketId} 庫存回滾失敗`, await response.text());
  //     } else {
  //       console.log(`票種ID ${item.ticketId} 庫存回滾 ${item.quantity} 成功`);
  //     }
  //   });

  //   await Promise.all(increasePromises);
  //   setMessage("庫存已回滾，請重新選擇");

    //重新載入票種資料，更新前端的庫存顯示(如果有)
    // loadTicketTypes();
    //清空選中的數量
  //   setTickets(prev => prev.map(t => ({ ...t, selectedQty: 0 })));
  // }




  // 處理結帳流程(鎖庫存 + 建立reservation & order)
  async function handleCheckout(e) {
    e.preventDefault();
    if (isCheckingOut) return; //防止重複提交

    setMessage("");
    setIsCheckingOut(true);

    //1.取得選定的票種
    const selected = tickets.filter((t) => t.selectedQty > 0);
    if (selected.length === 0) {
      alert("請選擇至少一張票。");
      setIsCheckingOut(false);
      return;
    }

    //2.建立結帳項目，使用t.id作為庫存操作的目標 ID
    const checkoutItems = selected.map((t) => ({
      eventTicketTypeId: t.id, //庫存操作的主鍵ID
      quantity: t.selectedQty,
    }));

    try {
      console.log("開始結帳流程...");
      setMessage("請於 2 分鐘內完成付款。");//原本有鎖票前面會加這段文字"已暫時保留票券，"

      //3.針對每一個選定的票種，使用後端API鎖庫存
      // const decreasePromises = checkoutItems.map(async (item) => {
      //   const url = `${BASE_API_URL}/api/eventtickettype/${item.ticketId}/decreaseStock`;
      //   const response = await fetch(url, {
      //     method: 'PUT',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ quantity: item.quantity }),
      //   });

      //   if (!response.ok) {
      //     const errorText = await response.text();
          //拋出票種名稱的錯誤訊息，方便用戶識別
      //     throw new Error(`[${item.ticketType}] 庫存不足: ${errorText}`);
      //   }
      //   console.log(`票種ID: ${item.ticketId} 庫存扣: ${item.quantity} 成功`);
      // });

      //4.等待所有庫存鎖完成
      // await Promise.all(decreasePromises);
      // console.log("庫存已鎖成功，進入支付流程");
      
      //5.成功鎖後，設定回滾時間(2分鐘=120000毫秒)
      // const ROLLBACK_TIME_MS = 120000; //2minutes
      //清除舊計時器
      // if (rollbackTimer) clearTimeout(rollbackTimer);

      // 設定新的計時器
      // const timerId = setTimeout(() => { //3分鐘內仍未結帳，則執行回滾
      //   rollbackStock(checkoutItems);
      //   setRollbackTimer(null); //清除計時器狀態
      // }, ROLLBACK_TIME_MS);
      // setRollbackTimer(timerId); //保存新的計時器ID
      // setMessage(`庫存保留: ${totalTickets} 張票券，請於3分鐘內完成付款`);

      // 6.(此處為模擬) 準備傳送給支付系統的資料
      const createBody = {
        // userId: 3,//暫時寫死
        eventId: eventId,
        items: checkoutItems.map((t) => ({
        eventTicketTypeId: t.eventTicketTypeId,
        quantity: t.quantity,
        })),
      };

      console.log(tickets.map(t => ({id: t.id, name: t.ticketType})));
      console.log("送後端的 createBody：", createBody);

      const res = await fetch(`${BASE_API_URL}/api/reservations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(createBody),
      });

      // 後端建立成功 (201或200 Created都為成功)
      if (res.status === 201 || res.status === 200) {
        const respJson = await res.json();//建立成功，取得回應JSON
        console.log("建立 reservation & order 成功：", respJson);

        // 顯示成功訊息
        setMessage("訂單建立成功，準備前往付款...");

        // 取回 orderId（若後端欄位不同請改名）
        const orderId = respJson.orderId ?? respJson.id ?? respJson.order_id ?? null;
        const reservationId = respJson.reservationId ?? respJson.reservation_id ?? null;

        
        //導到付款頁(目前未完成)
        //  if (orderId) {
        //     //導向：/payment?orderId=xxx
        //     window.location.href = `/payment?orderId=${orderId}&reservationId=${reservationId ?? ""}`;
        //     return;
        //     } else {
        //     // 若沒有 orderId，仍把使用者導到訂單頁或顯示資訊
        //     setMessage("訂單已建立，請前往訂單管理查詢。");
        //     }
        //     } else {
        //       // 失敗：解析錯誤訊息並顯示
        //       const text = await res.text();
        //       console.error("建立訂單失敗：", res.status, text);
        //       setMessage("建立訂單失敗：" + (text || res.status));
        //       // 若你有啟動鎖庫存，這裡可選擇去回滾鎖定的庫存
        //       // rollbackStock(checkoutItems);
        //     }
        //     } catch (err) {
        //       // 處理例外（例如鎖庫存失敗、網路錯誤等）
        //       console.error("結帳錯誤：", err);
        //       setMessage("結帳發生錯誤：" + (err.message || err));
        //       // 若你之前有做 decreaseStock，並且失敗或中斷，建議呼叫 rollbackStock
        //       // rollbackStock(checkoutItems);
        //     } finally {
        //       // 無論成功或失敗，都要解除按鈕鎖定（除非 redirect 已經發生）
        //       setIsCheckingOut(false);
        //     }
        }
      console.log("📝 準備傳送的結帳資料 (JSON):");
      console.log(JSON.stringify(createBody, null, 2));
      console.log(createBody);
      // 實際導向：window.location.href = "/payment.html";
    } catch (err) {
      //鎖庫存失敗，顯示錯誤給用戶
      setMessage("此票種庫存不足");
      console.error("結帳失敗:", err);
      loadTicketTypes(); //重新載入票種以顯示最新庫存
    }
    finally {
      setIsCheckingOut(false);
    }
  }

  //組件卸載時清除計時器，防止內存洩露
  // useEffect(() => {
  //   return () => {
  //     if (rollbackTimer) {
  //       clearTimeout(rollbackTimer);
  //     }
  //   };
  // }, [rollbackTimer]);

  return (
    <div className="ticketpage">
      <Header />
      {/* 麵包屑 */}
      <div className="max-w-7xl mx-auto w-full px-0 py-0">
        <Breadcrumb
          items={[
            { label: "首頁", to: "/" },
            { label: "活動資訊", to: "/events" },
            { label: event?.title || "購票" }
          ]}
        />
      </div>
      
      <div className="event-info-wrapper">
      <div className="event-info">
        <div className="event-left">
          {/* 這是讀自己的圖片，非資料庫 */}
          <img className="event-image" alt="event" src={`${BASE_API_URL}${DEFAULT_IMAGE_URL}`} />
        </div>

        <div className="event-center">
          <h5 id="eventTitle" className="event-title">
            {event?.title || "活動標題載入中..."}
          </h5>
          <p id="eventDate">{event ? `展出期間: ${event.event_start} ~ ${event.event_end}` : ""}</p>
          <p id="eventLocation">{event ? `活動地點: ${event.address}` : ""}</p>
        </div>
      </div>
      </div>
      <div className="main-content-wrapper">
        <div className="ticketzone">
          <h2>票種選擇</h2>

          <div className="ticket-layout">
            <div className="ticket-left">
              <table className="tickets">
                <thead>
                  <tr>
                    <th>票種</th>
                    <th>票價</th>
                    <th>數量</th>
                    <th>備註</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan="4">票種載入中或無票種資料</td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t.id ?? t.ticketType} data-ticket-id={t.id ?? ""}>
                        <td>{t.ticketType}</td>
                        <td>{t.finalPrice}</td>{/*t.customprice*/}
                        <td>
                          <select
                            className="ticketselct"
                            value={t.selectedQty}
                            onChange={(e) => handleQtyChange(t.id, Number(e.target.value))}
                            data-price={t.customprice}
                            disabled={isCheckingOut} //結帳中禁用選擇
                          >
                            <option value={0}>請選擇張數</option>
                          {(() => {
                              // 計算可選的最大數量：Min(4, 實際庫存)
                              const maxSelectable = Math.min(4, Number(t.customlimit || 0));

                              const options = [];

                              for (let i = 1; i <= maxSelectable; i++) {
                                options.push(
                                  <option key={i} value={i}>
                                    {i}
                                  </option>
                                );
                              }
                              return options;
                            })()}
                          </select>
                        </td>
                        <td>{t.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div id="message" style={{ marginTop: 12 }}>{message}</div>
        </div>

        <aside className="totalfee-fixed">
          <div className="ticket-type-summary">
          <span className="ticket-type-label">票種:</span>
          <span id="tickettype">{selectedTicketText}</span>
          </div>
          <div><strong>總張數:</strong> <span id="totaltickets">{`總共 ${totalTickets}張`}</span></div>
          <hr />
          <div>
            <strong>總金額: <span id="total">NT${totalAmount}</span></strong>
          </div>
          <div style={{ marginTop: 10 }}>
            <button 
              className="btn" 
              id="checkoutBtn" 
              onClick={handleCheckout}
              disabled={isCheckingOut || totalTickets === 0} //禁用按鈕直到載入完成或選擇數量 > 0
            >前往結帳</button>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}