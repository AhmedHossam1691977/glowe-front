import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import "./../style/product-of-subcategory.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { whichlistContext } from "../context/WhichListcontext.jsx";
import toast from "react-hot-toast";
import { BsCartCheckFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { CartContext } from "../context/CartContext.jsx";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import { productContext } from "../context/Product.Contextt.jsx";
import { Circles } from 'react-loader-spinner'; // استيراد مؤشر التحميل
import Loader from "../components/Loader.jsx"; // استيراد مكون التحميل

export default function ProductOfCatigory() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const { id } = useParams(); // معرف الفئة
    const [products, setProducts] = useState([]); // جميع المنتجات المحملة
    const [filteredProducts, setFilteredProducts] = useState([]); // المنتجات بعد تطبيق الفلاتر والبحث

    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeSlideIndices, setActiveSlideIndices] = useState({});
    const [activeSort, setActiveSort] = useState("title"); // خيار الفرز النشط
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [subCatigoryOfCatigory, setSubCatigoryOfCatigory] = useState([]); // لتخزين الأقسام الفرعية

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // هل توجد صفحات إضافية للتحميل؟
    const [loading, setLoading] = useState(false); // هل يتم التحميل حالياً؟
    // --- End Pagination States ---

    const baseUrl = "https://final-pro-api-j1v7.onrender.com";
    const { product: searchTerm } = useContext(productContext); // مصطلح البحث من الـ Context

    const {
        addWishlist,
        deletWhichData,
        getAllWhichlistData,
    } = useContext(whichlistContext);
    const { addCart, setCartCount } = useContext(CartContext);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // دالة للتحقق من حالة تسجيل الدخول
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    };

    // التحقق من حالة تسجيل الدخول عند تحميل المكون
    useEffect(() => {
        checkLoginStatus();
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

    // دالة جلب المنتجات الرئيسية (تم تعديلها لتشمل Pagination)
    const fetchProducts = useCallback(async (page) => {
        // إذا لم يكن هناك ID للفئة أو كان التحميل جاريًا أو لا يوجد المزيد من البيانات، أوقف التنفيذ
        if (!id || loading || !hasMore) {
            console.log("Stopping fetch: id missing, loading, or no more data.");
            return;
        }

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
            params.append("page", page);
            params.append("limit", 8); // عدد المنتجات لكل صفحة (مهم للتحميل اللانهائي)

            const url = `${baseUrl}/api/v1/categories/${id}?${params.toString()}`;
            console.log("Fetching URL:", url);

            const { data } = await axios.get(url);
            console.log("API Response:", data);

            // تأكد من أن الاستجابة تحتوي على المنتجات
            if (data.products && Array.isArray(data.products) && data.products.length > 0) {
                setProducts(prevProducts => {
                    const newProducts = [...prevProducts, ...data.products];
                    // إزالة التكرارات بناءً على _id لضمان عدم تكرار المنتجات
                    const uniqueProducts = Array.from(new Map(newProducts.map(obj => [obj._id, obj])).values());
                    return uniqueProducts;
                });
                setCurrentPage(page);
                // إذا كان عدد المنتجات التي تم إرجاعها أقل من الحد الأقصى (limit)، فهذا يعني لا يوجد المزيد من الصفحات
                if (data.products.length < 8) {
                    setHasMore(false);
                    console.log("No more products to load.");
                } else {
                    setHasMore(true); // لا يزال هناك المزيد إذا تم إرجاع عدد كامل
                }
            } else {
                setHasMore(false); // لا توجد منتجات أخرى لتحميلها
                console.log("No products returned or end of data.");
                if (page === 1) { // إذا كانت هذه هي الصفحة الأولى ولا توجد منتجات
                    setProducts([]); // تأكد من أن قائمة المنتجات فارغة
                }
            }

            // جلب الأقسام الفرعية مرة واحدة فقط عند تحميل الصفحة الأولى
            if (page === 1 && data.category?.allSubCatigory) {
                setSubCatigoryOfCatigory(data.category.allSubCatigory);
            }

            // تهيئة activeSlideIndices للمنتجات الجديدة أيضًا
            const initialActiveSlides = {};
            (data.products || []).forEach(p => {
                initialActiveSlides[p._id] = 0;
            });
            setActiveSlideIndices(prev => ({ ...prev, ...initialActiveSlides }));

        } catch (error) {
            console.error("Error fetching products:", error);
            setHasMore(false); // إيقاف محاولة الجلب إذا حدث خطأ
            setProducts([]); // مسح المنتجات في حالة وجود خطأ
            if (page === 1) { // إذا حدث خطأ في أول جلب، لا توجد منتجات
                setFilteredProducts([]);
            }
            toast.error("حدث خطأ أثناء جلب المنتجات. يرجى المحاولة لاحقاً.", { duration: 3000 });
        } finally {
            setLoading(false); // انتهاء التحميل
        }
    }, [id, activeSort, minPrice, maxPrice, hasMore, loading, baseUrl]); // dependencies for useCallback

    // هذا الـ useEffect مسؤول عن بدء الجلب الأول أو إعادة الجلب عند تغيير الفئة أو خيارات الفرز/الفلترة
    useEffect(() => {
        // إعادة تعيين جميع حالات Pagination و Products عند تغيير id أو خيارات الفرز/الفلترة
        setProducts([]);
        setFilteredProducts([]);
        setCurrentPage(1);
        setHasMore(true);
        setLoading(false); // تأكد من إعادة تعيين حالة التحميل
        fetchProducts(1); // ابدأ الجلب من الصفحة الأولى
    }, [id, activeSort, minPrice, maxPrice]); // لا تضع fetchProducts هنا، لأنها دالة useCallback وتعتمد على هذه الحالات

    // Effect for search term filtering on already loaded products
    useEffect(() => {
        const currentSearchTerm = searchTerm ? String(searchTerm).toLowerCase() : '';

        let result = [...products]; // ابدأ بجميع المنتجات المحملة

        if (currentSearchTerm) {
            result = result.filter(product =>
                (product.title && product.title.toLowerCase().includes(currentSearchTerm)) ||
                (product.description && product.description.toLowerCase().includes(currentSearchTerm))
            );
        } else {
            // إذا لم يكن هناك مصطلح بحث، طبق الفرز والفلترة العادية على جميع المنتجات المحملة
            result = sortProducts(products, activeSort);
            if (activeSort === "price") {
                if (minPrice) {
                    result = result.filter(product => product.price >= parseFloat(minPrice));
                }
                if (maxPrice) {
                    result = result.filter(product => product.price <= parseFloat(maxPrice));
                }
            }
        }
        setFilteredProducts(result);
    }, [searchTerm, products, activeSort, minPrice, maxPrice]); // إضافة dependencies needed for filtering/sorting

    // جلب قائمة الأمنيات عند تسجيل الدخول/الخروج
    useEffect(() => {
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [isLoggedIn]);

    // Lazy loading for images (keep this as is, but ensure `filteredProducts` is the dependency)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lazyLoadImages = () => {
                const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

                if ("IntersectionObserver" in window) {
                    const lazyImageObserver = new IntersectionObserver(function(entries) {
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                const lazyImage = entry.target;
                                lazyImage.src = lazyImage.dataset.src;
                                lazyImage.classList.remove("lazy");
                                lazyImageObserver.unobserve(lazyImage);
                            }
                        });
                    });

                    lazyImages.forEach(function(lazyImage) {
                        lazyImageObserver.observe(lazyImage);
                    });
                } else {
                    lazyImages.forEach(function(lazyImage) {
                        lazyImage.src = lazyImage.dataset.src;
                    });
                }
            };

            lazyLoadImages();

            const observer = new MutationObserver(lazyLoadImages);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            return () => observer.disconnect();
        }
    }, [filteredProducts]);

    async function fetchWishlist() {
        try {
            const { data } = await getAllWhichlistData();
            setWishlistItems(data?.wishlist || []);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    }

    function sortProducts(productsToSort, sortBy) {
        const sorted = [...productsToSort];
        switch (sortBy) {
            case "title":
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "date":
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "-rateAvg":
                sorted.sort((a, b) => (b.rateAvg || 0) - (a.rateAvg || 0));
                break;
            case "price":
                sorted.sort((a, b) => a.price - b.price);
                break;
            default:
                break;
        }
        return sorted;
    }

    async function toggleWishlist(prodId) { // تغيير اسم المتغير إلى prodId لتجنب التضارب مع id الخاص بـ useParams
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
            return;
        }

        try {
            if (isInWishlist(prodId)) {
                const { data } = await deletWhichData(prodId);
                if (data.message === "success") {
                toast.success("تم الإزالة من المفضلة", { duration: 1000  });
                }
            } else {
                const { data } = await addWishlist(prodId);
                if (data.message === "success") {
                            toast.success("تمت الإضافة إلى السلة", { duration: 1000  });

                }
            }
            fetchWishlist();
        } catch (error) {
            console.error("Error updating wishlist:", error);
            toast.error("حدث خطأ أثناء تعديل قائمة الرغبات");
        }
    }

    const isInWishlist = (productId) =>
        wishlistItems.some((item) => item._id === productId);

    async function addToChart(prodId, productImages, slideIndex) { // تغيير اسم المتغير إلى prodId
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

    // --- Infinite Scroll Effect ---
    useEffect(() => {
        const handleScroll = () => {
            // تحقق مما إذا كان المستخدم في أسفل الصفحة تقريبًا
            if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight && !loading && hasMore) {
                console.log("Fetching next page due to scroll.");
                fetchProducts(currentPage + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [currentPage, loading, hasMore, fetchProducts]);
    // --- End Infinite Scroll Effect ---

    return (
        <div className="container my-3" id="product-of-subcategory">
            <div className="row">
                <div className="col-md-12">
                    <div className="sort-section mb-4">
                        <div>
                            <h2 className="text-center mb-3">الاقسام الفرعية</h2>
                            {subCatigoryOfCatigory && subCatigoryOfCatigory.length > 0 ? (
                                <div className="d-flex flex-wrap gap-2 justify-content-center container-subCatigory">
                                    <div className="d-flex flex-wrap gap-2 justify-content-center container-of-subCatigory">
                                        {subCatigoryOfCatigory.map((subCat) => (
                                            <Link
                                                key={subCat._id}
                                                to={`/productOfSubCarigory/${subCat._id}`}
                                                className="fs-4 fw-bold text-decoration-none subCatigory-Of-Catigory"
                                            >
                                                {subCat.name} <span className="slach">/</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-info text-center">
                                    لا توجد أقسام فرعية متاحة حاليًا
                                </div>
                            )}
                        </div>
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

                    {/* رسائل البحث والفلاتر */}
                    {searchTerm && filteredProducts.length === 0 && !loading && (
                        <div className="alert alert-danger text-center fs-4">
                            لا توجد منتجات تطابق بحثك: "{searchTerm}"
                        </div>
                    )}
                    
                    {/* عرض المنتجات المفلترة */}
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
                                                <>
                                                    <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                                                        خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                                                    </span>
                                                </>
                                                : ""}
                                        </div>

                                        <div className="card-body py-2">
                                            <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">{product.title?.split(" ").slice(0, 2).join(" ")}</h6>
                                            <h5 className="card-title fs-6 mb-1">
                                                {product.description?.split(" ").slice(0, 2).join(" ")}
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
                                                    </> : ""}
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

                                            <button onClick={() => addToChart(product._id, allProductImages, currentSlideIndex)} className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart" >
                                                <BsCartCheckFill className="fs-6" />
                                                <span className="text">أضف إلى السلة</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                    {!hasMore && !loading && filteredProducts.length > 0 && (
                        <div className="text-center my-3 text-muted">
                            لقد وصلت إلى نهاية قائمة المنتجات.
                        </div>
                    )}

                    {/* رسالة عند عدم وجود منتجات على الإطلاق في الفئة الحالية أو بعد تطبيق فلاتر/بحث */}
                    {filteredProducts.length === 0 && !loading && searchTerm === "" && (
                        <div className="alert alert-info text-center fs-4">
                            لا توجد منتجات متاحة حالياً في هذه الفئة.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}