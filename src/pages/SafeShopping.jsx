import React from 'react';
import '../style/SafeShopping.css'

export default function SafeShopping() {
  return (
    <div className="safe-container my-5">
      <h2>🔐 نصائح للتسوق الآمن</h2>
      <ul className="safe-list">
        <li>✅ اطلب فقط من موقعنا الرسمي اللي بيبدأ بـ <strong>https://</strong> وفيه علامة القفل 🔒.</li>
        <li>📦 راجع المنتج قبل ما تدفع (الدفع عند الاستلام).</li>
        <li>🧾 احتفظ بفاتورة أو رسالة تأكيد الطلب.</li>
        <li>🚫 تجاهل أي عروض أو رسائل مش من موقعنا.</li>
        <li>📞 لو في استفسار، اتواصل معنا مباشرة من صفحة <strong>"تواصل معنا"</strong>.</li>
      </ul>
    </div>
  );
}
