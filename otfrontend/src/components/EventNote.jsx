import React from "react";

export default function EventNote({ eventId }) {
  // TODO: 之後可根據 eventId fetch 注意事項
  // 目前先用公版內容ㄌ
  return (
    <div className="pt-4">
      <div className="font-bold mb-2">【購票前請詳閱注意事項】</div>
      <ol className="list-decimal pl-6 space-y-2 text-base">
        <li className="text-red-600 font-semibold">每人/每帳號限購1張門票</li>
        <li className="text-red-600 font-semibold">每筆訂單票券，系統會自動帶入購票會員的姓名及證件字號，且不得修改。確認購票後，恕不提供修改票券姓名及證件字號。</li>
        <li className="text-red-600 font-semibold">進場需持有效之節目票券，及本人有照片之有效證件正本（兩者姓名&證件號碼一致)，以便現場驗證。</li>
        <li className="text-red-600 font-semibold">現場驗票將核對票券姓名及證件字號與本人身份，若不符主辦單位有權拒絕入場，並拒絕任何退換票要求。</li>
        <li className="text-red-600 font-semibold">若發現票券姓名及證件字號與本人身份不符，請於退票期間內辦理退票後重新購票，但退票後系統將自動釋出票券，無法保證一定買得到。</li>
        <li className="text-red-600 font-semibold">請確實核對訂購內容，本票劵一經售出，表示同意支付本次交易的內容與價格，不得以任何理由拒付。</li>
        <li>請務必於會員登記時間內完成官方會員預購登記，才能參加官方會員預購。</li>
        <li>本演出部分區域為視線不良區，視線將可能受舞台設計及設備影響，請留意公告。</li>
        <li>入場券請小心保管，如遺失、損毀、破損等情形，一律不予重新開票。</li>
        <li>遲到觀眾須遵循工作人員指示入場。</li>
        <li>一人一票，憑票入場，孩童亦需購票。12歲以下孩童不建議入場。</li>
        <li>現場禁止飲食、吸菸、攜帶寵物、危險物品等，請遵守現場規範。</li>
        <li>如遇活動延期或取消，主辦單位不負交通及住宿費補償。</li>
        <li>其他購票相關問題請洽客服。</li>
      </ol>
    </div>
  );
}
