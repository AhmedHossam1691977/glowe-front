import React from 'react';
import '../style/MarketingPrograms.css';

export default function MarketingPrograms() {
  return (
    <div className="marketing-container my-5 mx-auto" dir="rtl">
      <h2>🎯 البرامج التسويقية</h2>

      <p>
        نحن نعمل حاليًا على تطوير مجموعة من البرامج التسويقية التي ستسمح لعملائنا وشركائنا بالمساهمة في الترويج لمنتجاتنا والاستفادة من مزايا خاصة.
      </p>

      <p>من البرامج التي نخطط لإطلاقها قريبًا:</p>

      <ul className="marketing-list">
        <li>🤝 نظام العمولة (Affiliate Program)</li>
        <li>🎁 نظام نقاط المكافآت</li>
        <li>👥 دعوة الأصدقاء</li>
        <li>💼 التعاون مع الإنفلونسرز</li>
      </ul>

      <div className="coming-soon-box">
        🚧 البرامج التسويقية غير متاحة حاليًا، ولكن سيتم إطلاقها قريبًا إن شاء الله.
      </div>

      <p style={{ marginTop: '20px' }}>
        تابعنا على وسائل التواصل الاجتماعي أو اشترك في النشرة البريدية ليصلك كل جديد أول بأول 💌
      </p>
    </div>
  );
}
