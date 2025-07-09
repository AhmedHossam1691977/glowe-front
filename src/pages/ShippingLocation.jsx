import React from 'react';
import '../style/ShippingLocations.css';
import { FaTruck, FaMapMarkerAlt, FaQuestionCircle } from 'react-icons/fa';

export default function ShippingLocations() {
  const governorates = [
    "القاهرة", "الجيزة", "الإسكندرية", "الشرقية", "الدقهلية",
    "الغربية", "القليوبية", "المنوفية", "المنيا", "الفيوم",
    "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
    "بني سويف", "البحر الأحمر", "مطروح", "السويس", "الإسماعيلية",
    "بورسعيد", "دمياط", "كفر الشيخ", "شمال سيناء", "جنوب سيناء"
  ];

  return (
    <div className="shipping-locations-container">
      <div className="shipping-header">
        <div className="header-icon">
          <FaTruck />
        </div>
        <h1 className="shipping-title">📍 المواقع التي نشحن إليها</h1>
        <p className="shipping-intro">
          نوفر خدمة التوصيل لجميع محافظات جمهورية مصر العربية من خلال شركات شحن موثوقة لضمان وصول طلباتك بأمان وفي الوقت المحدد.
        </p>
      </div>

      <div className="governorates-section">
        <div className="section-header">
          <FaMapMarkerAlt className="section-icon" />
          <h3 className="section-title">المحافظات التي نغطيها</h3>
        </div>
        
        <div className="governorates-grid">
          {governorates.map((gov, index) => (
            <div key={index} className="governorate-card">
              <span className="gov-name">{gov}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="contact-note">
        <FaQuestionCircle className="contact-icon" />
        <p>
          إذا كنت غير متأكد من إمكانية الشحن لمنطقتك، لا تتردد في 
          <a href="/contact" className="contact-link"> التواصل معنا</a>
        </p>
      </div>
    </div>
  );
}