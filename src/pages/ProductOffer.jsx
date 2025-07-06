import React, { useContext, useEffect, useState } from 'react';
import { productContext } from '../context/Product.Contextt.jsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// أيقونات Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStar } from '@fortawesome/free-solid-svg-icons';
import { FaHeart, FaRegHeart } from "react-icons/fa";
// أيقونات React Icons
import { AiOutlineEye } from 'react-icons/ai';
import { BsCartCheckFill } from 'react-icons/bs';

import { Link } from 'react-router-dom';

import '../style/ProductOffer.css'; // ملف الـ CSS المخصص

export default function ProductOffer() {
  const { getAllProduct, addToChart } = useContext(productContext);
  const [products, setProducts] = useState([]); // جميع المنتجات (التي تم تصفيتها)
  const [showAllProductsView, setShowAllProductsView] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data } = await getAllProduct();
      if (data && data.product) {
        // تصفية المنتجات: عرض فقط التي لديها priceAfterDiscount
        const filteredProducts = data.product.filter(p => p.priceAfterDiscount !== undefined && p.priceAfterDiscount !== null);
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("خطأ أثناء جلب المنتجات:", error);
    }
  }

  const handleViewToggle = () => {
    setShowAllProductsView(!showAllProductsView);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prevWishlist => {
      const newWishlist = new Set(prevWishlist);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const isInWishlist = (productId) => wishlist.has(productId);

  const productSwiperSettings = (productId) => ({
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 0,
    navigation: {
      nextEl: `.swiper-button-next-${productId}`,
      prevEl: `.swiper-button-prev-${productId}`,
    },
    pagination: {
      el: `.swiper-pagination-${productId}`,
      clickable: true,
    },
    loop: true,
  });

  const productsForMainSwiper = products.slice(0, 10);
  const productsForGridView = products; // بما أن المنتجات تم تصفيتها بالفعل

  return (
    <div className="product-offer-container" dir="rtl">
      <div className="section-header">
        <h2 className="section-title">منتجات الخصم</h2> {/* تم تغيير العنوان ليعكس المنتجات المخفضة */}
        {products.length > 0 && (
          <button className="view-toggle-btn" onClick={handleViewToggle}>
            {showAllProductsView ? 'عرض أقل' : 'رؤية المزيد'}
          </button>
        )}
      </div>

      {products.length > 0 ? (
        <>
          {!showAllProductsView ? (
            /* عرض السلايدر الرئيسي للمنتجات المميزة (المخفضة) */
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1200: { slidesPerView: 5, spaceBetween: 20 },
              }}
              className="mySwiper main-swiper"
            >
              {productsForMainSwiper.map((product) => (
                <SwiperSlide key={product._id}>
                  <div className="product-card-featured">
                    <div className="product-image-wrapper">
                      {/* imgCover أو image يجب أن يكون هو الصورة الرئيسية للمنتج */}
                      <img src={product.imgCover || product.image} alt={product.title || product.name} className="product-image-featured" />
                      <div className="overlay-buttons">
                        <button className="add-to-bag-btn" onClick={() => addToChart(product._id, product.images, 0)}>
                          <FontAwesomeIcon icon={faShoppingCart} /> إضافة للعربة
                        </button>
                        <button className="favorite-btn" onClick={() => toggleWishlist(product._id)}>
                          {isInWishlist(product._id) ? (<FaHeart />) : (<FaRegHeart />)}
                        </button>
                      </div>
                      {product.priceAfterDiscount && (
                        <span className="discount-badge">
                          خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="product-details">
                      {/* تأكد من مسار التصنيف، قد يكون category.name أو subCategory.name */}
                      <p className="product-category">{product.subCategory?.name || product.category?.name || 'تصنيف'}</p>
                      <h3 className="product-name-featured">{product.title?.split(" ").slice(0, 3).join(" ") || product.name}</h3>
                      <div className="price-info">
                        <p className="product-price-featured">
                          {product.priceAfterDiscount ? `${product.priceAfterDiscount} ج.م` : `${product.price} ج.م`}
                        </p>
                        <p className="product-original-price">{product.price} ج.م</p>
                      </div>
                      <div className="product-meta">
                        <div className="product-rating">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={i < Math.round(product.ratingsAverage || product.rating || 0) ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                          <span>({product.ratingsQuantity || product.reviewsCount || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            /* عرض شبكة المنتجات الكاملة (المخفضة) عند الضغط على "رؤية المزيد" */
            <div className="container mt-5 all-products-expanded-grid">
              <div className="row">
                {productsForGridView.map((product) => (
                  <div key={product._id} className="col-6 col-md-6 col-lg-3 mb-4">
                    <div className="card product-card h-100 position-relative">
                      <div className="position-relative product-image-wrapper">
                        {/* Swiper لصور المنتج الداخلية */}
                        <Swiper {...productSwiperSettings(product._id)} className="product-inner-swiper">
                          {product.images?.map((imgSrc, index) => (
                            <SwiperSlide key={index}>
                              <img src={imgSrc} className="card-img-top product-image img-fluid" alt={`${product.title || product.name} - ${index + 1}`} />
                            </SwiperSlide>
                          ))}
                          {/* أزرار التنقل الداخلية للسويبر */}
                          <div className={`swiper-button-prev-custom swiper-button-prev-${product._id}`}></div>
                          <div className={`swiper-button-next-custom swiper-button-next-${product._id}`}></div>
                          <div className={`swiper-pagination-custom swiper-pagination-${product._id}`}></div>
                        </Swiper>

                        <div className="which-sp w-100 position-absolute top-0 end-0 p-2 d-flex flex-column align-items-end z-3">
                          <span className="cursor-pointer mb-1" onClick={() => toggleWishlist(product._id)}>
                            {isInWishlist(product._id) ? (
                              <FaHeart className="fs-4 text-danger cursor-pointer" />
                            ) : (
                              <FaRegHeart className="fs-4 text-white cursor-pointer" />
                            )}
                          </span>
                          <Link to={`/productDetel/${product._id}`}>
                            <span className="cursor-pointer">
                              <AiOutlineEye className="fs-4 text-white" />
                            </span>
                          </Link>
                        </div>
                        {product.priceAfterDiscount && (
                          <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                            خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="card-body py-2">
                        <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">{product.title?.split(" ").slice(0, 3).join(" ")}</h6>
                        <h5 className="card-title fs-6 mb-1">
                          {/* {product.description?.split(" ").slice(0, 2).join(" ")} */}
                        </h5>

                        <div className="product-price mb-1 d-flex align-items-center justify-content-end">
                          <span className="text-danger fs-6 fw-bold">
                            {product.priceAfterDiscount ? `${product.priceAfterDiscount} ج.م` : `${product.price} ج.م`}
                          </span>
                          <span className="text-decoration-line-through mx-1 text-muted me-1 fs-7">
                            {product.price} ج.م
                          </span>
                        </div>

                        <div className="product-rating mb-2 fs-6 d-flex align-items-center justify-content-end flex-row-reverse">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              style={{
                                color: i < Math.round(product.ratingsAverage || product.rating || 0) ? "#ffc107" : "#e4e5e9",
                                fontSize: "16px",
                              }}
                            >
                              ★
                            </span>
                          ))}
                          <span className="me-1 text-muted fs-7">({product.ratingsQuantity || product.rateCount || 0})</span>
                        </div>

                        <button onClick={() => addToChart(product._id, product.images, 0)} className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart">
                          <BsCartCheckFill className="fs-6" />
                          <span className="text">أضف إلى السلة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="no-products-message">لا توجد منتجات مخفضة حالياً.</p>
      )}
    </div>
  );
}