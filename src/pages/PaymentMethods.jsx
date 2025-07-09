import React from 'react';
import '../style/PaymentMethods.css';

export default function PaymentMethods() {
  return (
    <div className="payment-container">
      <h2>💳 طرق الدفع</h2>

      <p>
        حاليًا، نوفر طريقة واحدة للدفع وهي:
      </p>

      <ul className="payment-list">
        <li>💵 <strong>الدفع عند الاستلام:</strong> يمكنك الدفع نقدًا عند استلام الطلب من مندوب الشحن.</li>
      </ul>

      <p className="coming-soon">
        🔜 جاري العمل على إضافة وسائل دفع إلكترونية قريبًا، مثل البطاقات البنكية والمحافظ الذكية.
      </p>

      <p>
        لو عندك أي استفسار بخصوص الدفع، تقدر تتواصل معنا من خلال صفحة <a href="/contact">تواصل معنا</a>.
      </p>
    </div>
  );
}
