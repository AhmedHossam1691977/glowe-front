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
import { Circles } from 'react-loader-spinner'; // استيراد مؤشر التحميل

export default function ProductOffer() {
    const [activeSort, setActiveSort] = useState("title");
    const [products, setProducts] = useState([]); // المنتجات الأصلية التي تم جلبها من الـ API
    const [filteredProducts, setFilteredProducts] = useState([]); // المنتجات بعد تطبيق الفلاتر والبحث
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeSlideIndices, setActiveSlideIndices] = useState({});
    const [loading, setLoading] = useState(true); // حالة التحميل

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const basUrl = "https://final-pro-api-j1v7.onrender.com"; // تأكد من صحة هذا الـ URL
    const { product: searchTerm } = useContext(productContext);
    const {
        addWishlist,
        deletWhichData,
        getAllWhichlistData,
    } = useContext(whichlistContext);
    const { addCart, setCartCount } = useContext(CartContext);

    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // دالة للتحقق من وجود التوكن في localStorage
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkLoginStatus(); // تحقق من حالة تسجيل الدخول عند تحميل المكون
        // الاستماع لتغييرات localStorage (مثل تسجيل الدخول/الخروج في نافذة أخرى)
        window.addEventListener('storage', checkLoginStatus);
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    const sortOptions = [
        { label: "الاسم", value: "title" },
        { label: "التاريخ", value: "date" },
        { label: "التقييم", value: "-rateAvg" },
        { label: "السعر", value: "price" },
    ];

    // دالة جلب جميع المنتجات
    const allProducts = useCallback(async () => {
        setLoading(true); // بدء التحميل
        try {
            const params = new URLSearchParams();

            if (activeSort && activeSort !== "date") {
                params.append("sort", activeSort);
            }

            if (activeSort === "price") {
                if (minPrice) params.append("price[gte]", minPrice);
                if (maxPrice) params.append("price[lte]", maxPrice);
            }

            // جلب المنتجات التي تحتوي على خصم فقط
            params.append("priceAfterDiscount[gt]", 0);

            const url =
                activeSort === "date"
                    ? `${basUrl}/api/v1/product?sort=-createdAt&priceAfterDiscount[gt]=0`
                    : `${basUrl}/api/v1/product?${params.toString()}`;

            console.log("Fetching offers URL:", url);
            const { data } = await axios.get(url);
            console.log("Offers API Response:", data);

            if (data.product && Array.isArray(data.product)) {
                setProducts(data.product); // تخزين المنتجات الأصلية
                // تهيئة activeSlideIndices
                const initialActiveSlides = {};
                data.product.forEach(p => {
                    initialActiveSlides[p._id] = 0;
                });
                setActiveSlideIndices(initialActiveSlides);
            } else {
                setProducts([]);
                toast.error("لم يتم العثور على منتجات عروض.", { duration: 3000 });
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]); // مسح المنتجات في حالة وجود خطأ
            toast.error("حدث خطأ أثناء جلب المنتجات. يرجى المحاولة لاحقاً.", { duration: 3000 });
        } finally {
            setLoading(false); // انتهاء التحميل
        }
    }, [activeSort, minPrice, maxPrice, basUrl]);

    // جلب المنتجات عند تغيير خيارات الفرز أو الفلترة
    useEffect(() => {
        allProducts();
    }, [allProducts]); // يعتمد على allProducts التي هي useCallback

    // جلب قائمة الأمنيات عند تسجيل الدخول/الخروج
    useEffect(() => {
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlistItems([]); // مسح قائمة الأمنيات إذا لم يكن المستخدم مسجلاً للدخول
        }
    }, [isLoggedIn]);

    // تطبيق الفلترة بناءً على مصطلح البحث على المنتجات التي تم جلبها
    useEffect(() => {
        const currentSearchTerm = searchTerm ? String(searchTerm).toLowerCase() : '';

        if (currentSearchTerm) {
            const filtered = products.filter(product =>
                (product.title && product.title.toLowerCase().includes(currentSearchTerm)) ||
                (product.description && product.description.toLowerCase().includes(currentSearchTerm))
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products); // إذا لا يوجد بحث، اعرض جميع المنتجات التي تم جلبها
        }
    }, [searchTerm, products]); // يعتمد على searchTerm و products

    async function fetchWishlist() {
        try {
            const { data } = await getAllWhichlistData();
            console.log("Fetched wishlist data:", data);
            
            setWishlistItems(data?.wishlist || []);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            toast.error("حدث خطأ أثناء جلب قائمة الأمنيات.");
        }
    }

    async function toggleWishlist(prodId) {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
            return;
        }

        try {
            if (isInWishlist(prodId)) {
                const { data } = await deletWhichData(prodId);
                if (data.message === "success") {
                   toast.success("تم الإزالة من المفضلة", { duration: 1000 });
                }
            } else {
                const { data } = await addWishlist(prodId);
                if (data.message === "success") {
                            toast.success("تمت الإضافة إلى السلة", { duration: 1000 });

                }
            }
            fetchWishlist();
        } catch (error) {
            console.error("Error updating wishlist:", error);
            toast.error("حدث خطأ أثناء تعديل قائمة الرغبات");
        }
    }

    const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

    async function addToChart(prodId, productImages, slideIndex) {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.", { duration: 2000 });
            return;
        }

        try {
            const imageToUse = productImages[slideIndex];

            console.log(`جارٍ إضافة المنتج ID: ${prodId} إلى السلة. الصورة المختارة:`, imageToUse);

            let { data } = await addCart(prodId, imageToUse);
            if (data.message === "success") {
                setCartCount(data.cartItems);
                 toast.success("تمت الإضافة إلى السلة", { duration: 1000 });
            } else {
                throw new Error("Error adding to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
                toast.error("حدث خطأ أثناء الإضافة إلى السلة");

        }
    }

    // إعدادات الـ Swiper لكل منتج
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

    return (
        <div className="container my-3" id="products">
            <div className="row">
                <div className="col-md-12">
                    <div className="product-image-container position-relative overflow-hidden">
                        <img src={image} className="img-fluid w-100 h-100 object-fit-cover" alt="مستحضرات تجميل" />
                        <div className="product-text-overlay d-flex flex-column justify-content-center align-items-center text-center p-3">
                            <h2 className="header-title mb-3"> خصومات حصرية على أفضل مستحضرات التجميلو الاكسيسوارات !</h2>
                            <p className="header-subtitle text-white">استفيدي من العروض المميزة ووفر المال على مشترياتك</p>
                            <div className="breadcrumb-links">
                                <Link className="breadcrumb-link" to={"/"}>الرئيسية</Link>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-current">العروض والخصومات</span>
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

                    {/* مؤشر التحميل */}
                    {loading && (
                        <div className="text-center my-3">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted">جاري تحميل المزيد من المنتجات...</p>
                        </div>
                    )}
                    {/* {!hasMore && !loading && filteredProducts.length > 0 && (
                        <div className="text-center my-3 text-muted">
                            لقد وصلت إلى نهاية قائمة المنتجات.
                        </div>
                    )} */}

                    {/* عرض المنتجات المفلترة */}
                    {!loading && filteredProducts.length > 0 ? (
                        <div className="row">
                            {filteredProducts
                                .filter((product) => product.priceAfterDiscount) // تأكد من عرض المنتجات التي بها خصم فقط
                                .map((product) => {
                                    const allProductImages = product.images && product.images.length > 0
                                        ? [product.imgCover, ...product.images]
                                        : [product.imgCover];

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
                                                        <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                                                            خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                                                        </span>
                                                        : ""}
                                                </div>

                                                <div className="card-body py-2">
                                                    <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">
                                                        {product.title?.split(" ").slice(0, 3).join(" ")}
                                                    </h6>

                                                    <div className="product-price mb-1 d-flex align-items-center">
                                                        <span className="text-danger fs-6 fw-bold">
                                                            {`${product.priceAfterDiscount} ج.م`}
                                                        </span>
                                                        <span className="text-decoration-line-through mx-1 text-muted ms-1 fs-7">
                                                            {product.price} ج.م
                                                        </span>
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

                                                    <button
                                                        onClick={() => addToChart(product._id, allProductImages, currentSlideIndex)}
                                                        className="btn w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart"
                                                    >
                                                        <BsCartCheckFill className="fs-6" />
                                                        <span className="text">أضف إلى السلة</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        // رسالة عند عدم وجود منتجات عروض على الإطلاق (بعد التحميل)
                        !loading && filteredProducts.length === 0 && searchTerm === "" && (
                            <div className="alert alert-info text-center fs-4">
                                لا توجد منتجات معروضة للخصم حالياً.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}