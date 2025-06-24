import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import './../style/productDetels.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [count, setCount] = useState(1); // إضافة state للكمية

  // states for review form
  const [reviewText, setReviewText] = useState('');
  const [reviewRate, setReviewRate] = useState(5);
  const [loadingReview, setLoadingReview] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axios.get(`https://final-pro-api-j1v7.onrender.com/api/v1/product/${id}`);
        setProduct(res.data.product);
        console.log("Fetched product details:", res.data.product);

        if (res.data.product && res.data.product.subCategory) {
          const subCategoryId = res.data.product.subCategory;
          
          const similarRes = await axios.get(`https://final-pro-api-j1v7.onrender.com/api/v1/subCategory/${subCategoryId}`);
          console.log("Fetched similar products from subcategory:", similarRes.data);

          if (similarRes.data && Array.isArray(similarRes.data.allProduct)) {
            setSimilarProducts(similarRes.data.allProduct.filter(p => p._id !== id).slice(0, 4));
          } else {
            console.log("No 'allProduct' array found in similar subcategory response or it's not an array.");
            setSimilarProducts([]);
          }
        } else {
          console.log("Product or subCategory ID is missing, skipping similar products fetch.");
          setSimilarProducts([]);
        }

      } catch (err) {
        console.error("Error fetching product details or similar products:", err);
        setProduct(null);
        setSimilarProducts([]);
        toast.error('حدث خطأ أثناء جلب بيانات المنتج.');
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = (productId, selectedImageUrl) => {
    if (!product) return;

    // طباعة البيانات قبل الإضافة
    console.log('بيانات المنتج المراد إضافتها:', {
      productId,
      image: selectedImageUrl,
      quantity: count,
      title: product.title,
      price: product.proceAfterDiscount || product.price
    });

    const payload = {
      productId,
      image: selectedImageUrl,
      quantity: count, // استخدام القيمة من state الكمية
      title: product.title,
      price: product.proceAfterDiscount || product.price
    };

    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = existingCart.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += count;
    } else {
      existingCart.push(payload);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));

    toast.success('تمت إضافة المنتج إلى السلة بنجاح!', {
        position: "top-center",
        className: "border border-success bg-white text-success fw-bolder fs-6",
        duration: 1500,
        icon: "🛒",
    });
  };

  // دالة لزيادة الكمية
  const increaseCount = () => {
    setCount(prev => prev + 1);
  };

  // دالة لتقليل الكمية
  const decreaseCount = () => {
    if (count > 1) {
      setCount(prev => prev - 1);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      toast.error('من فضلك اكتب تعليق للتقييم.', {
        position: "top-center",
        className: "border border-warning bg-white text-warning fw-bolder fs-6",
        duration: 1500,
      });
      return;
    }

    setLoadingReview(true);

    try {
      const payload = {
        text: reviewText,
        rate: reviewRate,
        product: id,
      };

      await axios.post('https://final-pro-api-j1v7.onrender.com/api/v1/review', payload, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      const res = await axios.get(`https://final-pro-api-j1v7.onrender.com/api/v1/product/${id}`);
      setProduct(res.data.product);

      setReviewText('');
      setReviewRate(5);
      toast.success("تم إضافة تقييمك بنجاح!", {
        position: "top-center",
        className: "border border-success bg-white text-success fw-bolder fs-6",
        duration: 1500,
        icon: "✨",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.data?.error === 'You have already created a review before') {
        toast.error("لقد قمت بإضافة تقييم لهذا المنتج من قبل.", {
          position: "top-center",
          className: "border border-info bg-white text-info fw-bolder fs-6",
          duration: 2000,
          icon: "💡",
        });
      } else {
        toast.error('حدث خطأ أثناء إضافة التقييم. حاول مرة أخرى.', {
          position: "top-center",
          className: "border border-danger bg-white text-danger fw-bolder fs-6",
          duration: 2000,
        });
      }
    } finally {
      setLoadingReview(false);
    }
  };

  if (!product) return <div className="text-center mt-5"></div>;

  return (
    <div className="container py-5">
      {/* Main Product Section */}
      <div className="row g-4 align-items-center">
        {/* Image Gallery */}
        <div className="col-md-6">
          <div className="main-image-container mb-3 border rounded shadow-sm">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="img-fluid rounded product-main-image"
              style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
            />
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.title} thumb ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`img-thumbnail p-1 cursor-pointer ${selectedImage === index ? 'border-primary border-3 shadow-sm' : 'border'}`}
                style={{ width: '90px', height: '90px', objectFit: 'cover' }}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-6">
          <h1 className="fw-bold mb-3 text-dark">{product.title}</h1>

          <div className="d-flex align-items-center mb-3">
            {product.proceAfterDiscount && product.proceAfterDiscount < product.price ? (
              <>
                <span className="text-decoration-line-through text-muted fs-5 me-2">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="fs-3 fw-bold text-danger">
                  ${product.proceAfterDiscount?.toFixed(2)}
                </span>
                <span className="badge bg-success ms-3 p-2">خصم!</span>
              </>
            ) : (
              <span className="fs-3 fw-bold text-dark">
                ${product.price?.toFixed(2)}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center mb-4">
            <span className="text-warning fs-5">
              {'★'.repeat(Math.round(product.rateAvg))}{'☆'.repeat(5 - Math.round(product.rateAvg))}
            </span>
            <span className="ms-2 text-muted">({product.rateCount} تقييم)</span>
          </div>

          <p className='lead text-secondary mb-4'>{product.description}</p>

          {/* Counter for quantity */}
          <div className="d-flex align-items-center mb-4">
            <button 
              className="btn btn-outline-secondary px-3 py-1"
              onClick={decreaseCount}
            >
              -
            </button>
            <span className="mx-3 fs-5">{count}</span>
            <button 
              className="btn btn-outline-secondary px-3 py-1"
              onClick={increaseCount}
            >
              +
            </button>
          </div>

          <button
            className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm"
            onClick={() => handleAddToCart(product._id, product.images[selectedImage])}
          >
            <i className="fas fa-cart-plus me-2"></i> إضافة إلى السلة
          </button>
        </div>
      </div>

      <hr className="my-5 border-secondary" />

      {/* Tabs Section */}
      <ul className="nav nav-tabs mt-5 border-bottom-0" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button className="nav-link active" id="desc-tab" data-bs-toggle="tab" data-bs-target="#desc" type="button" role="tab" aria-controls="desc" aria-selected="true">الوصف</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">التقييمات ({product.rateCount})</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" id="add-review-tab" data-bs-toggle="tab" data-bs-target="#add-review" type="button" role="tab" aria-controls="add-review" aria-selected="false">إضافة تقييم</button>
        </li>
      </ul>
      <div className="tab-content p-4 border border-top-0 rounded-bottom shadow-sm" id="myTabContent">
        {/* Description Tab */}
        <div className="tab-pane fade show active" id="desc" role="tabpanel" aria-labelledby="desc-tab">
          <p className="text-muted">{product.description}</p>
        </div>

        {/* Reviews Tab */}
        <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
          {product.AllReview && product.AllReview.length ? product.AllReview.map((review) => (
            <div key={review._id} className="mb-3 pb-3 border-bottom">
              <div className="d-flex align-items-center mb-1">
                <i className="fas fa-user-circle fs-4 me-2 text-primary"></i>
                <strong className="text-dark mx-2">{review.user?.name || 'مستخدم غير معروف'}</strong>
              </div>
              <div className="text-warning mb-1">
                {'★'.repeat(review.rate)}{'☆'.repeat(5 - review.rate)}
              </div>
              <p className="text-secondary ps-4">{review.text}</p>
            </div>
          )) : <p className="text-center text-muted py-3">كن أول من يقيّم هذا المنتج!</p>}
        </div>

        {/* Add Review Tab */}
        <div className="tab-pane fade" id="add-review" role="tabpanel" aria-labelledby="add-review-tab">
          <form onSubmit={handleSubmitReview} className="p-3 border rounded shadow-sm">
            <h5 className="mb-4 text-center text-primary">أضف تقييمك وتعليقك للمنتج</h5>
            <div className="mb-3">
              <label htmlFor="rate" className="form-label fw-bold">التقييم (من 1 إلى 5 نجوم):</label>
              <select
                id="rate"
                className="form-select form-select-lg"
                value={reviewRate}
                onChange={(e) => setReviewRate(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r} نجوم</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="reviewText" className="form-label fw-bold">التعليق:</label>
              <textarea
                id="reviewText"
                className="form-control"
                rows="4"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="شاركنا رأيك حول المنتج..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={loadingReview}>
              {loadingReview ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
            </button>
          </form>
        </div>
      </div>

      <hr className="my-5 border-secondary" />

      {/* Related Products Section */}
      <div className="mt-5">
        <h4 className="mb-4 text-center text-dark fw-bold">منتجات قد تعجبك أيضاً</h4>
        {similarProducts.length > 0 ? (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {similarProducts.map(p => (
              <div className="col" key={p._id}>
                <div className="card h-100 shadow-sm border-0 product-card">
                  <img
                    src={p.images[0]}
                    className="card-img-top product-card-image"
                    alt={p.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate mb-1">{p.title}</h5>
                    <div className="text-warning mb-2">
                        {'★'.repeat(Math.round(p.rateAvg))}{'☆'.repeat(5 - Math.round(p.rateAvg || 0))}
                    </div>
                    <p className="card-text mb-3">
                      {p.proceAfterDiscount && p.proceAfterDiscount < p.price ? (
                        <>
                          <span className="text-decoration-line-through text-muted me-2"> {p.price?.toFixed(2)}ج.م  </span>
                          <span className="fw-bold text-danger">${p.proceAfterDiscount?.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="fw-bold text-dark"> {p.price?.toFixed(2)}  ج.م  </span>
                      )}
                    </p>
                    <button
                      className="btn btn-outline-primary btn-sm mt-auto"
                      onClick={() => navigate(`/productDetel/${p._id}`)} 
                    >
                      <i className="fas fa-info-circle me-1"></i> تفاصيل المنتج
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-3">لا توجد منتجات مشابهة حالياً.</p>
        )}
      </div>

      {/* Toaster Component */}
      <Toaster />
    </div>
  );
}