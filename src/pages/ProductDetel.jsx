import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import './../style/productDetels.css';
import { BsCartCheckFill } from "react-icons/bs";
import { Swiper, SwiperSlide } from 'swiper/react';
import { AiOutlineEye } from "react-icons/ai";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, FreeMode, Thumbs } from 'swiper/modules';
import { CartContext } from '../context/CartContext.jsx';
import { whichlistContext } from '../context/WhichListcontext.jsx';
// import { AuthContext } from '../context/AuthContext.jsx'; // <--- تم إلغاء استيراد AuthContext
// import LoginPopup from './LoginPopup.jsx'; // <--- تم إزالة هذا الاستيراد
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Loader from '../components/Loader.jsx'; // Make sure this import is correct

export default function ProductDetail() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [count, setCount] = useState(1);
  const [wishlistItems, setWishlistItems] = useState([]);
  const { addCart, setCartCount } = useContext(CartContext);
  const { addWishlist, deletWhichData, getAllWhichlistData } = useContext(whichlistContext);
  // const { isLoggedIn } = useContext(AuthContext); // <--- تم إلغاء الحصول على حالة تسجيل الدخول
  // const [showLoginPopup, setShowLoginPopup] = useState(false); // <--- تم إزالة هذه الحالة

  const [reviewText, setReviewText] = useState('');
  const [reviewRate, setReviewRate] = useState(5);
  const [loadingReview, setLoadingReview] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviewPercentages, setReviewPercentages] = useState({});
  const [loadingProduct, setLoadingProduct] = useState(true); // New state for product loading

  useEffect(() => {
    fetchProductDetails();
    fetchWishlist(); // تم تغيير هذه الدالة ليتم جلب قائمة الأمنيات دائمًا
  }, [id]); // تم إزالة isLoggedIn كـ dependency

  const fetchProductDetails = async () => {
    setLoadingProduct(true); // Start loading
    try {
      const res = await axios.get(`https://final-pro-api-j1v7.onrender.com/api/v1/product/${id}`);
      console.log(res.data.product);
      
      setProduct(res.data.product);
      console.log("Initial product details fetched:", res.data.product);

      if (res.data.product && res.data.product.subCategory) {
        const subCategoryId = res.data.product.subCategory;
        const similarRes = await axios.get(`https://final-pro-api-j1v7.onrender.com/api/v1/subCategory/${subCategoryId}`);
        setSimilarProducts(similarRes.data.allProduct.filter(p => p._id !== id).slice(0, 4));
      } else {
        setSimilarProducts([]);
      }

      calculateReviewPercentages(res.data.product.AllReview);
    } catch (err) {
      console.error("Error fetching product details:", err);
      toast.error('حدث خطأ أثناء جلب بيانات المنتج.');
    } finally {
      setLoadingProduct(false); // End loading, whether successful or not
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://final-pro-api-j1v7.onrender.com/api/v1/product/${id}`);
      setProduct(prev => ({ ...prev, AllReview: res.data.product.AllReview, rateAvg: res.data.product.rateAvg, rateCount: res.data.product.rateCount }));
      calculateReviewPercentages(res.data.product.AllReview);
      console.log("Reviews fetched after update/add:", res.data.product.AllReview);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const calculateReviewPercentages = (reviews) => {
    const totalReviews = reviews.length;
    if (totalReviews > 0) {
      const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        starCounts[review.rate]++;
      });
      const percentages = {};
      for (let i = 1; i <= 5; i++) {
        percentages[i] = Math.round((starCounts[i] / totalReviews) * 100);
      }
      setReviewPercentages(percentages);
    } else {
      setReviewPercentages({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    }
  };

  async function fetchWishlist() {
    try {
      const { data } = await getAllWhichlistData();
      setWishlistItems(data?.wishlist || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // يمكنك التعامل مع أخطاء الـ API هنا إذا كانت بسبب عدم المصادقة
      // إذا كان الخطأ بسبب عدم المصادقة، قد تحتاج لعرض LoginPopup هنا
      // setShowLoginPopup(true); // مثال: إذا كان الـ API يعيد 401
    }
  }

  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

  const handleAddToWishlist = async (id) => {
    // تم إزالة التحقق من تسجيل الدخول هنا
    try {
      if (isInWishlist(id)) {
        const { data } = await deletWhichData(id);
        if (data.message === "success") {
          toast.success("تم الإزالة من المفضلة", {
            position: "top-center",
            className: "border border-danger p-3 bg-white text-danger",
            duration: 1000,
            icon: "🗑️",
          });
        }
      } else {
        const { data } = await addWishlist(id);
        if (data.message === "success") {
          toast.success("تم الإضافة إلى المفضلة", {
            position: "top-center",
            className: "border border-success p-3 bg-white text-success",
            duration: 1000,
            icon: "❤️",
          });
        }
      }
      fetchWishlist();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      // إذا كان الخطأ بسبب عدم المصادقة، قد تحتاج لعرض LoginPopup هنا
      if (error.response?.status === 401) { // مثال: التحقق من رمز حالة HTTP
        toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
        // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
      } else {
        toast.error("حدث خطأ أثناء تحديث قائمة المفضلة.");
      }
    }
  };

  const handleAddToCart = async (productId, selectedImageUrl, count) => {
    // تم إزالة التحقق من تسجيل الدخول هنا
    try {
      let { data } = await addCart(productId, selectedImageUrl, count);
      if (data.message === "success") {
        setCartCount(data.cartItems);
        toast.success("تمت الإضافة إلى السلة", {
          position: "top-center",
          className: "border border-success p-3 bg-white text-success",
          duration: 1000,
          icon: "�",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // إذا كان الخطأ بسبب عدم المصادقة، قد تحتاج لعرض LoginPopup هنا
      if (error.response?.status === 401) { // مثال: التحقق من رمز حالة HTTP
        toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.", { duration: 2000 });
        // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
      } else {
        toast.error("حدث خطأ أثناء الإضافة إلى السلة", {
          position: "top-center",
          className: "border border-danger p-3 bg-white text-danger",
          duration: 1000,
          icon: "❌",
        });
      }
    }
  };

  const increaseCount = () => setCount(prev => prev + 1);
  const decreaseCount = () => count > 1 && setCount(prev => prev - 1);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    // تم إزالة التحقق من تسجيل الدخول هنا
    if (!reviewText.trim()) return toast.error('من فضلك اكتب تعليق للتقييم.');
    setLoadingReview(true);
    try {
      const payload = { text: reviewText, rate: reviewRate, product: id };
      await axios.post('https://final-pro-api-j1v7.onrender.com/api/v1/review', payload, {
        headers: { token: localStorage.getItem("token") },
      });
      await fetchReviews();
      setReviewText('');
      setReviewRate(5);
      toast.success("تم إضافة تقييمك بنجاح!");
    } catch (error) {
      if (error.response?.data?.error === 'You have already created a review before') {
        toast.error("لقد قمت بإضافة تقييم لهذا المنتج من قبل.");
      } else if (error.response?.status === 401) { // مثال: التحقق من رمز حالة HTTP
        toast.error("يرجى تسجيل الدخول أولاً لإضافة تقييم.", { duration: 2000 });
        // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
      }
      else {
        toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة التقييم. حاول مرة أخرى.');
      }
      console.error("Error submitting review:", error);
    } finally {
      setLoadingReview(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <>
        {Array.from({ length: fullStars }).map((_, i) => <i key={`full-${i}`} className="fas fa-star filled-star"></i>)}
        {hasHalfStar && <i className="fas fa-star-half-alt filled-star"></i>}
        {Array.from({ length: emptyStars }).map((_, i) => <i key={`empty-${i}`} className="far fa-star empty-star"></i>)}
      </>
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG');
    } catch (e) {
      console.error("Invalid date string:", dateString);
      return dateString;
    }
  };

  // Display Loader component while product data is being fetched
  if (loadingProduct || !product) {
    return <Loader />;
  }

  return (
    <div className="product-detail-page-container" dir="rtl">
      <Toaster />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="breadcrumb-nav">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">الرئيسية</a></li>
          <span className='fw-bolder mx-2'>/</span>
          <li className="breadcrumb-item"><a href="/products">المنتجات</a></li>
          <span className='fw-bolder mx-2'>/</span>
          <li className="breadcrumb-item active" aria-current="page">تفاصيل</li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <div className="product-main-section">
        {/* Product Images - Right Column (for RTL) */}
        <div className="product-images-column">
          <div className="main-product-image-wrapper">
            {/* Main product image using Swiper */}
            <Swiper
              spaceBetween={10}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[FreeMode, Thumbs]}
              className="mySwiper2"
              onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
              initialSlide={activeSlideIndex}
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt={`${product.title} ${index + 1}`}
                    className="main-product-image"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="thumbnail-gallery-wrapper">
            {/* Thumbnail images using Swiper */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={Math.min(4, product.images.length)}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="mySwiper"
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              breakpoints={{
                0: {
                  slidesPerView: Math.min(4, product.images.length),
                  spaceBetween: 5,
                },
                576: {
                  slidesPerView: Math.min(4, product.images.length),
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: Math.min(5, product.images.length),
                  spaceBetween: 10,
                },
              }}
            >
              {product.images.map((img, index) => (
                <SwiperSlide
                  key={index}
                  onClick={() => {
                    if (thumbsSwiper) {
                      thumbsSwiper.slideTo(index);
                    }
                  }}
                  className={index === activeSlideIndex ? 'swiper-slide-thumb-active' : ''}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumb ${index + 1}`}
                    className="thumbnail-image"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Custom navigation buttons for thumbnails - Moved BELOW the Swiper */}
            <div className="swiper-thumbnail-navigation-buttons">
              <div className="swiper-button-prev-custom"></div>
              <div className="swiper-button-next-custom"></div>
            </div>
          </div>
        </div>

        {/* Product Details - Left Column (for RTL) */}
        <div className="product-details-column">
          <span className="product-category">مجموعة جلوويي</span>
          <h1 className="product-title">{product.title}</h1>

          <div className="product-rating-summary">
            <span className="stars-display">
              {renderStars(product.rateAvg)}
            </span>
            <span className="rating-value">{product.rateAvg?.toFixed(1)}/5</span>
            <span className="reviews-count">({product.rateCount} مراجعات)</span>
          </div>

          <div className="price-info">
            {product.priceAfterDiscount && product.priceAfterDiscount < product.price ? (
              <>
                <span className="current-price-display">{product.priceAfterDiscount?.toFixed(2)} جنيه</span>
                <span className="old-price-display">{product.price?.toFixed(2)} جنيه</span>
              </>
            ) : (
              <span className="current-price-display">{product.price?.toFixed(2)} جنيه</span>
            )}
          </div>

          <p className="product-short-description">{product.description}</p>


          <div className="product-meta-details">
            {product.sizes && product.sizes.length > 0 && (
              <div className="meta-item">
                <span className="meta-label">الحجم</span>
                <div className="type-options">
                  {product.sizes.map((size, index) => (
                    <button key={index} className="type-option">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div className="meta-item">
                <span className="meta-label">اللون</span>
                <div className="color-options">
                  {product.colors.map((color, index) => (
                    <span key={index} className="color-option" style={{ backgroundColor: color }}></span>
                  ))}
                </div>
              </div>
            )}
            <div className="meta-item">

            </div>


          </div>

          <div className="action-buttons">
            <div className='d-flex justify-content-between align-items-center'>
              <div className="quantity-control ">
                <button className="quantity-btn" onClick={increaseCount}>+</button>
                <span className="quantity-display">{count}</span>
                <button className="quantity-btn" onClick={decreaseCount}>-</button>
              </div>


              <div className="wishlist-button-container mx-2">
                <span className="cursor-pointer" onClick={() => handleAddToWishlist(product._id)}>
                  {isInWishlist(product._id) ? (
                    <FaHeart className="fs-4 text-danger wishlist-icon" />
                  ) : (
                    <FaRegHeart className="fs-4 text-white wishlist-icon" />
                  )}
                </span>


              </div>
            </div>


            <button className="btn add-to-bag-btn x-2 w-100" onClick={() => handleAddToCart(product._id, product.images[activeSlideIndex], count)}>
              <BsCartCheckFill className='mx-2' />
              أضف إلى السلة
            </button>
          </div>
        </div>
      </div>


      {/* Description & Add Comment Tabs Section */}
      <div className="product-info-tabs-section">
        <ul className="nav product-info-tabs" id="productInfoTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description-content" type="button" role="tab" aria-controls="description-content" aria-selected="true">الوصف</button>
          </li>
          {/* New Comments Tab - only for the form */}
          <li className="nav-item" role="presentation">
            <button className="nav-link" id="add-comment-tab" data-bs-toggle="tab" data-bs-target="#add-comment-content" type="button" role="tab" aria-controls="add-comment-content" aria-selected="false">أضف كومنت</button>
          </li>
        </ul>

        <div className="tab-content product-info-tab-content" id="productInfoTabContent">
          {/* Description Tab Content */}
          <div className="tab-pane fade show active" id="description-content" role="tabpanel" aria-labelledby="description-tab">
            <p className="tab-content-text">{product.description}</p>
          </div>

          {/* Add Comment Tab Content - ONLY the form */}
          <div className="tab-pane fade" id="add-comment-content" role="tabpanel" aria-labelledby="add-comment-tab">
            <div className="add-review-form-wrapper">
              <h5 className="add-review-title">أضف مراجعتك</h5>
              <form onSubmit={handleSubmitReview} className="add-review-form">
                <div className="mb-3">
                  <label htmlFor="reviewRate" className="form-label">قيّم هذا المنتج:</label>
                  <select
                    id="reviewRate"
                    className="form-select"
                    value={reviewRate}
                    onChange={(e) => setReviewRate(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} نجوم</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="reviewText" className="form-label">مراجعتك:</label>
                  <textarea
                    id="reviewText"
                    className="form-control"
                    rows="4"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="شارك أفكارك حول المنتج..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn submit-review-btn" disabled={loadingReview}>
                  {loadingReview ? 'جاري الإرسال...' : 'إرسال المراجعة'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Report Product Link */}
        <div className="report-product-link disabled">
          <i className="fas fa-flag ms-2 "></i> الإبلاغ عن المنتج
        </div>
      </div>



      {/* Reviews Section - Kept separate from tabs, as originally */}
      <div className="reviews-section-container  ">
        <div className="reviews-summary-column ">
          <h2 className="reviews-title">المراجعات</h2>
          <div className="overall-rating">
            <span className="overall-rating-value">{product.rateAvg?.toFixed(1) || 0}/5</span>
            <div className="overall-stars">
              {renderStars(product.rateAvg)}
            </div>
            <span className="overall-reviews-count">{product.rateCount} مراجعات</span>
          </div>

          {/* Star breakdown progress bars */}
          <div className="star-breakdown">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="star-progress-row">
                <span className="star-label">{star}</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${reviewPercentages[star] || 0}%` }}
                    role="progressbar"
                    aria-valuenow={reviewPercentages[star] || 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <span className="star-percentage">{reviewPercentages[star] || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="individual-reviews-column ">
          {/* هنا يتم عرض التعليقات. تأكد أن product.AllReview يتم تحديثه بشكل صحيح */}
          {product.AllReview && product.AllReview.length ? product.AllReview.map((review) => (
            <div key={review._id} className="review-item ">
              <div className="review-header">
                <span className="reviewer-name">{review.user?.userName || 'مستخدم غير معروف'}</span>
                <span className="review-date mx-2">{formatDate(review.createdAt)}</span>
                <div className="review-stars">{renderStars(review.rate)}</div>
              </div>
              <p className="review-text">{review.text}</p>
              <span className="review-likes"><i className="far fa-thumbs-up ms-2"></i> {review.likesCount || 0}</span>
            </div>
          )) : <p className="no-reviews-text">كن أول من يراجع هذا المنتج!</p>}

          {/* "View More" button for reviews */}
          {product.AllReview && product.AllReview.length > 3 && (
            <button className="btn view-more-reviews-btn">عرض المزيد</button>
          )}
        </div>
      </div>


      <div className="related-products-section">
        <h2 className="section-title">منتجات ذات صلة</h2>

        {similarProducts.length > 0 ? (
          <div className="swiper-container">
            <Swiper
              modules={[Navigation]}
              spaceBetween={15}
              slidesPerView={2}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination',
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 25
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 30
                },
              }}
              className="related-products-swiper"
            >
              {similarProducts.map(p => (
                <SwiperSlide key={p._id}>
                  <div
                    className="related-product-card"
                    onClick={() => navigate(`/productDetel/${p._id}`)}
                  >
                    <div className="product-image-container">
                      <AiOutlineEye className="view-icon" />
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="product-image"
                      />
                    </div>

                    <div className="product-info  mx-2">
                      <h3 className="product-brand fs-4">{p.title.split(" ").slice(0, 3).join(" ") || 'VOLUMINA'}</h3>
                      <h4 className="product-title fs-6">{p.description.split(" ").slice(0, 2).join(" ")}</h4>

                      <div className="price-section">
                        {p.proceAfterDiscount && p.proceAfterDiscount < p.price ? (
                          <>
                            <span className="discounted-price text">${p.proceAfterDiscount?.toFixed(2)}</span>
                            <span className="original-price">${p.price?.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="current-price">${p.price?.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="rating-section">
                        <div className="stars">
                          {renderStars(p.rateAvg || 0)}
                        </div>
                        <span className="rating-value">({p.rateCount || 0})</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
          </div>
        ) : (
          <p className="no-products-message">لا توجد منتجات مشابهة متاحة.</p>
        )}
      </div>

      {/* <--- تم إزالة تضمين الـ Login Pop-up هنا ---> */}
      {/* {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />} */}
    </div>
  );
}
