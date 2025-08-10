import React, { useEffect, useState, useContext, useCallback } from "react";
import image from "./../assets/silver-crystal-branch-with-plate-makeup-brushes-lipstick-white-background_23-2148129421.avif";
import "./../style/procust.css";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { whichlistContext } from "../context/WhichListcontext.jsx";
import toast from "react-hot-toast";
import { BsCartCheckFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { CartContext } from "../context/CartContext.jsx";
import { productContext } from "../context/Product.Contextt.jsx";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Circles } from 'react-loader-spinner'; // افتراضيًا، ستحتاج إلى تثبيت هذه المكتبة

export default function ProductOffer() {
  const [activeSort, setActiveSort] = useState("title");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [activeSlideIndices, setActiveSlideIndices] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const basUrl = "https://final-pro-api-j1v7.onrender.com";
  const { product: searchTerm } = useContext(productContext);
  const { addWishlist, deletWhichData, getAllWhichlistData } = useContext(whichlistContext);
  const { addCart, setCartCount } = useContext(CartContext);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const sortOptions = [
    { label: "الاسم", value: "title" },
    { label: "التاريخ", value: "date" },
    { label: "التقييم", value: "-rateAvg" },
    { label: "السعر", value: "price" },
  ];

  // Reset pagination and fetch new products when sort/filter options change
  useEffect(() => {
    setProducts([]); // Clear existing products
    setFilteredProducts([]); // Clear existing filtered products
    setCurrentPage(1); // Reset to first page
    setHasMore(true); // Assume there's more data to load initially
    allProducts(1); // Fetch products for the first page
  }, [activeSort, minPrice, maxPrice]); // Depend on sort and price filters

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isLoggedIn]);

  // Effect for search term filtering on already loaded products
  useEffect(() => {
    // التحقق من أن searchTerm هو سلسلة نصية قبل استخدام toLowerCase()
    const currentSearchTerm = searchTerm ? String(searchTerm) : ''; 

    if (currentSearchTerm) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products); // If no search term, show all loaded products
    }
  }, [searchTerm, products]);

  const allProducts = useCallback(async (page) => {
    if (loading || !hasMore) return; // Prevent multiple simultaneous fetches or if no more data

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeSort && activeSort !== "date") {
        params.append("sort", activeSort);
      }
      if (activeSort === "price") {
        if (minPrice) params.append("price[gte]", minPrice);
        if (maxPrice) params.append("price[lte]", maxPrice);
      }
      params.append("page", page); // Add page parameter
      params.append("limit", 8); // Limit items per page, adjust as needed

      const url =
        activeSort === "date"
          ? `${basUrl}/api/v1/product?sort=-createdAt&${params.toString()}`
          : `${basUrl}/api/v1/product?${params.toString()}`;

      const { data } = await axios.get(url);

      if (data.product.length > 0) {
        setProducts(prevProducts => {
          const newProducts = [...prevProducts, ...data.product];
          // Ensure no duplicates if API returns them
          const uniqueProducts = Array.from(newProducts.reduce((map, obj) => map.set(obj._id, obj), new Map()).values());
          return uniqueProducts;
        });
        setCurrentPage(page);
        if (data.product.length < 8) { // If fewer than limit, assume no more data
          setHasMore(false);
        }
      } else {
        setHasMore(false); // No more products to load
      }

      const initialActiveSlides = {};
      data.product.forEach(p => {
        initialActiveSlides[p._id] = 0;
      });
      setActiveSlideIndices(prev => ({ ...prev, ...initialActiveSlides }));

    } catch (error) {
      console.error("Error fetching products:", error);
      setHasMore(false); // Stop trying to fetch if there's an error
    } finally {
      setLoading(false);
    }
  }, [activeSort, minPrice, maxPrice, hasMore, loading, basUrl]);

  async function fetchWishlist() {
    try {
      const { data } = await getAllWhichlistData();
      setWishlistItems(data?.wishlist || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }

  async function toggleWishlist(id) {
    if (!isLoggedIn) {
      toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
      return;
    }
    try {
      if (isInWishlist(id)) {
        const { data } = await deletWhichData(id);
        if (data.message === "success") {
          toast.success("تم الإزالة", { duration: 1000 });
        }
      } else {
        const { data } = await addWishlist(id);
        if (data.message === "success") {
          toast.success("تم الإضافة", { duration: 1000,  });
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
    if (!isLoggedIn) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.", { duration: 2000 });
      return;
    }
    try {
      const imageToUse = productImages[slideIndex];
      const { data } = await addCart(id, imageToUse);
      if (data.message === "success") {
        setCartCount(data.cartItems);
        toast.success("تم الاضافه", { duration: 1000, icon: '👏' });
      } else {
        throw new Error("Error adding to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة", { duration: 1000, icon: '❌' });
    }
  }

  const productSwiperSettings = (productId) => ({
    modules: [Pagination, Navigation],
    spaceBetween: 0,
    slidesPerView: 1,
    pagination: { clickable: true },
    navigation: false,
    onSlideChange: (swiper) => {
      setActiveSlideIndices(prev => ({
        ...prev,
        [productId]: swiper.activeIndex
      }));
    },
  });

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = () => {
      // Check if user is at the bottom of the page
      if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight && !loading && hasMore) {
        allProducts(currentPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, loading, hasMore, allProducts]);

  return (
    <div className="container my-3" id="products">
      <div className="row">
        <div className="col-md-12">
          <div className="product-image-container position-relative overflow-hidden">
            <img src={image} className="img-fluid w-100 h-100 object-fit-cover" alt="مستحضرات تجميل" />
            <div className="product-text-overlay d-flex flex-column justify-content-center align-items-center text-center p-3">
              <h2 className="header-title mb-3"> خصومات حصرية على أفضل مستحضرات التجميل والاكسيسوارات !</h2>
              <p className="header-subtitle text-white">استفيدي من العروض المميزة ووفر المال على مشترياتك</p>
              <div className="breadcrumb-links">
                <Link className="breadcrumb-link" to={"/"}>الرئيسية</Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">المنتجات</span>
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
                  className={`sort-option-btn ${activeSort === value ? "active" : ""}`}
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
                  <input type="number" placeholder="من" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="form-control" />
                  <input type="number" placeholder="إلى" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="form-control" />
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
              const allProductImages = product.images && product.images.length > 0 ? [product.imgCover, ...product.images] : [product.imgCover];
              const currentSlideIndex = activeSlideIndices[product._id] || 0;
              return (
                <div key={product._id} className="col-6 col-md-6 col-lg-3 mb-4">
                  <div className="card product-card h-100 position-relative">
                    <div className="position-relative product-image-wrapper">
                      <Swiper {...productSwiperSettings(product._id)}>
                        {allProductImages.map((imgSrc, index) => (
                          <SwiperSlide key={index}>
                            <img src={imgSrc} className="card-img-top product-image img-fluid" alt={`${product.title} - ${index + 1}`} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className="which-sp w-100 position-absolute top-0 start-0 p-2 d-flex flex-column align-items-start z-3">
                        <span className="cursor-pointer mb-1" onClick={() => toggleWishlist(product._id)}>
                          {isInWishlist(product._id) ? <FaHeart className="fs-4 text-danger cursor-pointer" /> : <FaRegHeart className="fs-4 text-white cursor-pointer" />}
                        </span>
                        <Link to={`/productDetel/${product._id}`}>
                          <span className="cursor-pointer">
                            <AiOutlineEye className="fs-4 text-white" />
                          </span>
                        </Link>
                      </div>
                      {product.priceAfterDiscount ? (
                        <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                          خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                        </span>
                      ) : ""}
                    </div>
                    <div className="card-body py-2">
                      <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">
                        {product.title?.split(" ").slice(0, 3).join(" ")}
                      </h6>
                      <div className="product-price mb-1 d-flex align-items-center">
                        <span className="text-danger fs-6 fw-bold">
                          {`${product.priceAfterDiscount || product.price} ج.م`}
                        </span>
                        {product.priceAfterDiscount ? (
                          <span className="text-decoration-line-through mx-1 text-muted ms-1 fs-7">
                            {product.price} ج.م
                          </span>
                        ) : ""}
                      </div>
                      <div className="product-rating mb-2 fs-6 d-flex align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < Math.round(product.rateAvg || 0) ? "#ffc107" : "#e4e5e9", fontSize: "16px" }}>
                            ★
                          </span>
                        ))}
                        <span className="ms-1 text-muted fs-7">({product.rateCount || 0})</span>
                      </div>
                      <button onClick={() => addToChart(product._id, allProductImages, currentSlideIndex)} className="btn w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart">
                        <BsCartCheckFill className="fs-6" />
                        <span className="text">أضف إلى السلة</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
                        <div className="text-center my-3">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted">جاري تحميل المزيد من المنتجات...</p>
                        </div>
                    )}
                    {!hasMore && !loading && filteredProducts.length > 0 && (
                        <div className="text-center my-3 text-muted">
                            لقد وصلت إلى نهاية قائمة المنتجات.
                        </div>
                    )}

          {filteredProducts.length === 0 && !loading && searchTerm === "" && (
            <div className="alert alert-info text-center fs-4">
              لا توجد منتجات متاحة حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
}