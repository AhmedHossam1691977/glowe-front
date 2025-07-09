import React from 'react';
import '../style/ShippingGuide.css'; // Assuming you have a CSS file for styling
import { 
  FaShippingFast, 
  FaClock, 
  FaMoneyBillWave, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaExclamationTriangle, 
  FaBoxOpen 
} from 'react-icons/fa';

export default function ShippingGuide() {
  return (
    <div className="shipping-guide-container">
      <div className="shipping-header">
        <h1 className="shipping-title">📦 دليل الشحن والتوصيل</h1>
        <p className="shipping-intro">
          نحرص على توصيل طلباتكم بأسرع وقت ممكن. هنا كل ما تحتاج معرفته عن عملية الشحن والتوصيل.
        </p>
      </div>

      <div className="shipping-grid">
        <div className="shipping-card">
          <div className="shipping-icon"><FaShippingFast /></div>
          <h3 className="shipping-question">1. متى يتم شحن طلبي؟</h3>
          <p className="shipping-answer">نقوم بتجهيز الطلب خلال 24 ساعة من تأكيده، وبعدها يتم تسليمه لشركة الشحن.</p>
        </div>

        <div className="shipping-card">
          <div className="shipping-icon"><FaClock /></div>
          <h3 className="shipping-question">2. مدة التوصيل المتوقعة</h3>
          <p className="shipping-answer">تتراوح مدة التوصيل من 2 إلى 5 أيام عمل، حسب المحافظة والمنطقة.</p>
        </div>

        <div className="shipping-card">
          <div className="shipping-icon"><FaMoneyBillWave /></div>
          <h3 className="shipping-question">3. تكلفة الشحن</h3>
          <p className="shipping-answer">سعر الشحن يختلف حسب المحافظة، وسيظهر لك أثناء إتمام عملية الشراء.</p>
        </div>

        <div className="shipping-card">
          <div className="shipping-icon"><FaGlobe /></div>
          <h3 className="shipping-question">4. هل يتوفر شحن دولي؟</h3>
          <p className="shipping-answer">حاليًا نقدم خدمة الشحن داخل مصر فقط.</p>
        </div>

        <div className="shipping-card">
          <div className="shipping-icon"><FaMapMarkerAlt /></div>
          <h3 className="shipping-question">5. كيفية متابعة طلبي</h3>
          <p className="shipping-answer">بعد الشحن، سنرسل لك رقم تتبع على الواتساب أو البريد الإلكتروني لمتابعة شحنتك.</p>
        </div>

        <div className="shipping-card">
          <div className="shipping-icon"><FaExclamationTriangle /></div>
          <h3 className="shipping-question">6. في حالة تأخير الشحنة</h3>
          <p className="shipping-answer">إذا تأخرت الشحنة عن المدة المتوقعة، يمكنك <a href="/contact" className="contact-link">التواصل معنا</a> فورًا.</p>
        </div>

        <div className="shipping-card">
          <div className="shipping-icon"><FaBoxOpen /></div>
          <h3 className="shipping-question">7. إذا وصل المنتج تالفًا</h3>
          <p className="shipping-answer">لا تقلق، يمكنك طلب استبدال أو استرجاع من خلال خدمة العملاء.</p>
        </div>
      </div>
    </div>
  );
}