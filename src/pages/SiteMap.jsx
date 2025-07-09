import React from 'react';
import '../style/SiteMap.css';

export default function SiteMap() {
  return (
    <div className="sitemap-container">
      <h2>🗺️ خريطة الموقع</h2>

      <div className="sitemap-section">
        <h4>الصفحات الرئيسية</h4>
        <ul>
          <li>الرئيسية</li>
          <li>من نحن</li>
          <li>المدونة</li>
          <li>تواصل معنا</li>
          <li>خريطة الموقع</li>
        </ul>
      </div>

      <div className="sitemap-section">
        <h4>التسوق</h4>
        <ul>
          <li>جميع المنتجات</li>
          <li>الأكثر مبيعًا</li>
          <li>العروض</li>
          <li>التصنيفات</li>
        </ul>
      </div>

      <div className="sitemap-section">
        <h4>حسابي</h4>
        <ul>
          <li>تسجيل الدخول</li>
          <li>إنشاء حساب</li>
          <li>السلة</li>
          <li>الطلبات</li>
          <li>المفضلة</li>
        </ul>
      </div>

      <div className="sitemap-section">
        <h4>معلومات مهمة</h4>
        <ul>
          <li>سياسة الخصوصية</li>
          <li>سياسة الاسترجاع</li>
          <li>الشحن والتوصيل</li>
          <li>الأسئلة الشائعة</li>
        </ul>
      </div>
    </div>
  );
}
