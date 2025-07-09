import React from 'react';
import '../style/DeliveryTime.css';
import { FaClock, FaShippingFast, FaMapMarkerAlt, FaBox, FaPhoneAlt } from 'react-icons/fa';

export default function DeliveryTime() {
  return (
    <div className="delivery-time-container">
      <div className="delivery-header">
        <div className="header-icon">
          <FaClock />
        </div>
        <h1 className="delivery-title">⏱️ وقت التسليم المتوقع</h1>
        <p className="delivery-intro">
          نحن نعمل على توصيل طلباتكم في أسرع وقت ممكن مع الحفاظ على جودة التغليف والدقة في التسليم.
        </p>
      </div>

      <div className="delivery-card">
        <div className="delivery-section">
          <div className="section-title">
            <FaShippingFast className="section-icon" />
            <h3>المدة المتوقعة للتوصيل</h3>
          </div>
          <ul className="delivery-list">
            <li>
              <strong>2 إلى 5 أيام عمل</strong> من تاريخ تأكيد الطلب
            </li>
            <li>
              <FaMapMarkerAlt className="list-icon" />
              تختلف المدة حسب المحافظة وموقع العميل
            </li>
            <li>
              <FaBox className="list-icon" />
              تجهيز الطلبات خلال <strong>24 ساعة</strong> كحد أقصى قبل الشحن
            </li>
          </ul>
        </div>

        <div className="delivery-notes">
          <div className="note">
            <p>
              في حال وجود أي تأخير غير متوقع، سيتم التواصل معك فورًا لإبلاغك بالتفاصيل.
            </p>
          </div>
          <div className="note">
            <p>
              يمكنك متابعة حالة الطلب برقم التتبع الذي نرسله لك بمجرد خروج الشحنة.
            </p>
          </div>
        </div>
      </div>

      <div className="contact-section">
        <FaPhoneAlt className="contact-icon" />
        <p>
          لأي استفسار بخصوص وقت التسليم، <a href="/contact" className="contact-link">تواصل معنا</a>
        </p>
      </div>
    </div>
  );
}