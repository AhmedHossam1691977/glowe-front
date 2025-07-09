import React, { useState } from 'react';
import '../style/Blog.css';

const blogPosts = [
  {
    id: 1,
    title: "نصائح للتسوق الآمن عبر الإنترنت",
    date: "8 يوليو 2025",
    description: `في العصر الرقمي، التسوق الآمن ضروري. تعرف على أهم النصائح لحماية معلوماتك الشخصية أثناء الشراء عبر الإنترنت. من الضروري التأكد من أن الموقع آمن، وتجنب مشاركة بيانات حساسة مع أي مصدر غير موثوق، وعدم الضغط على الروابط المشبوهة.`,
  },
  {
    id: 2,
    title: "أفضل 5 منتجات مبيعًا في موقعنا",
    date: "5 يوليو 2025",
    description: `جمعنالك قائمة بأكثر المنتجات المحبوبة من عملائنا، شوف إيه اللي الناس بتحبه وليه. المنتجات دي اتقيمت من آلاف المستخدمين وكانت دايمًا من أولى اختيارات العملاء سواء من حيث الجودة أو السعر.`,
  },
  {
    id: 3,
    title: "دليلك لتتبع الشحنات بسهولة",
    date: "3 يوليو 2025",
    description: `دلوقتي تقدر تتبع شحنتك بسهولة باستخدام كود التتبع. المقال ده هنتكلم عن الطرق المختلفة للتتبع، وأهم النصائح لو حصل تأخير، وإزاي تتواصل مع شركة الشحن بسرعة لو في أي مشكلة.`,
  },
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);

  const handleClose = () => setSelectedPost(null);

  return (
    <div className="blog-container">
      <h2 className="blog-title">📚 المدونة</h2>
      <div className="blog-list">
        {blogPosts.map(post => (
          <div className="blog-card" key={post.id}>
            <h3>{post.title}</h3>
            <p className="date">{post.date}</p>
            <p className="description-preview">
              {post.description.slice(0, 100)}...
            </p>
            <button className="read-more" onClick={() => setSelectedPost(post)}>
              اقرأ المزيد
            </button>
          </div>
        ))}
      </div>

      {selectedPost && (
  <div className="modal-overlay" onClick={handleClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>{selectedPost.title}</h3>
      <p className="date">{selectedPost.date}</p>
      <p className="modal-description">{selectedPost.description}</p>
      <button className="close-btn" onClick={handleClose}>إغلاق</button>
    </div>
  </div>
)}

    </div>
  );
}
