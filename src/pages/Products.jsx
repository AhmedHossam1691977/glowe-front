import React, { useContext, useEffect, useState } from "react";
import image from "./../assets/silver-crystal-branch-with-plate-makeup-brushes-lipstick-white-background_23-2148129421.avif";
import "./../style/procust.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { whichlistContext } from "../context/WhichListcontext.jsx";
import toast from "react-hot-toast";
import { BsCartCheckFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { CartContext } from "../context/CartContext.jsx";
import { productContext } from "../context/Product.Contextt.jsx";
// استيراد Swiper والمكونات الأساسية
import { Swiper, SwiperSlide } from 'swiper/react';
// استيراد وحدات Swiper المطلوبة (مثل Pagination، Navigation)
import { Pagination, Navigation } from 'swiper/modules';

// استيراد أنماط Swiper الأساسية ووحدات الـ CSS
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Products() {
  const [activeSort, setActiveSort] = useState("title");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [activeSlideIndices, setActiveSlideIndices] = useState({});

  const basUrl = "https://final-pro-api-j1v7.onrender.com";
  const { product: searchTerm } = useContext(productContext);
  const {
    addWishlist,
    deletWhichData,
    getAllWhichlistData,
  } = useContext(whichlistContext);
  const { addCart, setCartCount } = useContext(CartContext);

  const sortOptions = [
    { label: "الاسم", value: "title" },
    { label: "التاريخ", value: "date" },
    { label: "التقييم", value: "-rateAvg" },
    { label: "السعر", value: "price" },
  ];

  useEffect(() => {
    allProducts();
  }, [activeSort, minPrice, maxPrice]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.title.includes(searchTerm) ||
        product.description.includes(searchTerm)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  async function allProducts() {
    try {
      const params = new URLSearchParams();

      if (activeSort && activeSort !== "date") {
        params.append("sort", activeSort);
      }

      if (activeSort === "price") {
        if (minPrice) params.append("price[gte]", minPrice);
        if (maxPrice) params.append("price[lte]", maxPrice);
      }

      const url =
        activeSort === "date"
          ? `${basUrl}/api/v1/product?sort=-createdAt`
          : `${basUrl}/api/v1/product?${params.toString()}`;

      const { data } = await axios.get(url);
      setProducts(data.product);
      setFilteredProducts(data.product);

      const initialActiveSlides = {};
      data.product.forEach(p => {
        initialActiveSlides[p._id] = 0;
      });
      setActiveSlideIndices(initialActiveSlides);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function fetchWishlist() {
    try {
      const { data } = await getAllWhichlistData();
      setWishlistItems(data?.wishlist || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }

  async function toggleWishlist(id) {
    try {
      if (isInWishlist(id)) {
        const { data } = await deletWhichData(id);
        if (data.message === "success") {
          toast.success("تم الإزالة", {
            position: "top-center",
            className: "border border-danger  p-3 bg-white text-danger notefection w-100 fw-bolder fs-4",
            duration: 1000,
            icon: "🗑️",
          });
        }
      } else {
        const { data } = await addWishlist(id);
        if (data.message === "success") {
          toast.success("تم الإضافة", {
            position: "top-center",
            className: "border border-danger notefection p-3 bg-white text-danger w-100 fw-bolder fs-4",
            duration: 1000,
            icon: "❤️",
          });
        }
      }
      fetchWishlist();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("حدث خطأ أثناء تعديل قائمة الرغبات");
    }
  }

  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

  async function addToChart(id, productImages, slideIndex) {
    try {
      const imageToUse = productImages[slideIndex];

      console.log(`جارٍ إضافة المنتج ID: ${id} إلى السلة. الصورة المختارة:`, imageToUse);

      let { data } = await addCart(id, imageToUse);
      if (data.message === "success") {
        setCartCount(data.cartItems);
        toast.success("تم الاضافه", {
          position: 'top-center',
          className: 'border border-danger notefection  p-3 bg-white text-danger  fw-bolder fs- success',
          duration: 1000,
          icon: '👏'
        });
      } else {
        throw new Error("Error adding to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة", {
        position: 'top-center',
        className: 'border border-danger notefection p-3 bg-white text-danger fw-bolder fs-4 error',
        duration: 1000,
        icon: '❌'
      });
    }
  }

  // إعدادات الـ Swiper لكل منتج
  const productSwiperSettings = (productId) => ({
    modules: [Pagination, Navigation], // إضافة الوحدات المطلوبة
    spaceBetween: 0,
    slidesPerView: 1,
    pagination: { clickable: true },
    navigation: false, // يمكنك تفعيل الأسهم إذا أردت
    onSlideChange: (swiper) => {
      setActiveSlideIndices(prev => ({
        ...prev,
        [productId]: swiper.activeIndex // تحديث الفهرس النشط
      }));
    },
    // إزالة autoplay لأننا لا نريده
  });

  return <>
  
    <div className="container" id="products">
      <div className="row">
         <div className="col-md-12">
          <div className="product-image-container position-relative overflow-hidden">
            <img src={image} className="img-fluid w-100 h-100 object-fit-cover" alt="مستحضرات تجميل" />
            <div className="product-text-overlay d-flex flex-column justify-content-center align-items-center text-center p-3">
              <h2 className="header-title mb-3">اكتشفي جمالك الحقيقي مع مستحضرات الميك أب...</h2>
              <div className="breadcrumb-links">
                <Link className="breadcrumb-link" to={"/"}>الرئيسية</Link>
                <span className="breadcrumb-separator">/</span>
                <Link className="breadcrumb-link" to={"/products"}>المنتجات</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 my-4">
          <div className="sort-section mb-4">
            <span className="fs-5 me-2 fw-bold">ترتيب حسب</span>
            <div className="d-flex flex-wrap align-items-center sort-options">
              {sortOptions.map(({ label, value }) => (
                <button
                  key={value}
                  className={`sort-option-btn  ${activeSort === value ? "active" : ""}`}
                  onClick={() => {
                    setActiveSort(value);
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                >
                  {label}
                </button>
              ))}

              {activeSort === "price" && (
                <div className="d-flex align-items-center mx-3 gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="form-control"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="form-control"
                  />
                </div>
              )}
            </div>
          </div>

          {searchTerm && filteredProducts.length === 0 && (
            <div className="alert alert-danger text-center fs-4">
              لا توجد منتجات تطابق بحثك: "{searchTerm}"
            </div>
          )}

          <div className="row">
            {filteredProducts.map((product) => {
              const allProductImages = product.images && product.images.length > 0
                ? [product.imgCover, ...product.images]
                : [product.imgCover];

              const currentSlideIndex = activeSlideIndices[product._id] || 0;

            return (
  <div key={product._id} className="col-6 col-md-6 col-lg-3 mb-4">
      <div className="card product-card h-100 position-relative">
      <div className="position-relative product-image-wrapper">
        {/* استخدام Swiper بدلًا من Slider */}
        <Swiper {...productSwiperSettings(product._id)}>
          {allProductImages.map((imgSrc, index) => (
            <SwiperSlide key={index}>
              {/* تصغير الصورة أكتر على الموبايل */}
              <img src={imgSrc} className="card-img-top product-image img-fluid" alt={`${product.title} - ${index + 1}`}  />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="which-sp w-100 position-absolute top-0 start-0 p-2 d-flex flex-column align-items-start z-3">
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
        {product.priceAfterDiscount ?
        <>
          <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
            خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
          </span>
        </>
        :""}
      </div>

      <div className="card-body py-2">
        {/* تصغير حجم الخط للعناوين على الموبايل */}
        <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">{product.title?.split(" ").slice(0, 3).join(" ")}</h6>
        <h5 className="card-title fs-6 mb-1">
          {/* {product.description?.split(" ").slice(0, 2).join(" ")} */}
        </h5>

        <div className="product-price mb-1 d-flex align-items-center">
          <span className="text-danger fs-6 fw-bold">
            {product.priceAfterDiscount ? `${product.priceAfterDiscount} ج.م` : `${product.price} ج.م`}
          </span>
          {product.priceAfterDiscount ? 
          <>
          <span className="text-decoration-line-through mx-1 text-muted ms-1 fs-7">
              {product.price} ج.م
            </span>
          </>:""}
        </div>

        <div className="product-rating mb-2 fs-6 d-flex align-items-center">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              style={{
                color: i < Math.round(product.rateAvg || 0) ? "#ffc107" : "#e4e5e9",
                fontSize: "16px",
              }}
            >
              ★
            </span>
          ))}
          <span className="ms-1 text-muted fs-7">({product.rateCount || 0})</span>
        </div>

        <button onClick={() => addToChart(product._id, allProductImages, currentSlideIndex)} className="btn  w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart" >
          <BsCartCheckFill className="fs-6" />
          <span className="text">أضف إلى السلة</span>
        </button>
      </div>
    </div>
  </div>
);
            })}
          </div>
        </div>
      </div>
    </div>
  

  </>
}