import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function ProductOfCatigory() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
 
  const [wishlistItems, setWishlistItems] = useState([]);
  const [activeSlideIndices, setActiveSlideIndices] = useState({});
  const [activeSort, setActiveSort] = useState("title");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [subCatigoryOfCatigory, setSubCatigoryOfCatigory] = useState("");
  
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
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

  async function getSubCatigory() {
    try {
      let { data } = await axios.get(`${baseUrl}/api/v1/categories/${id}`).catch((err) => {
        console.log(err);
      });
      setSubCatigoryOfCatigory(data.category.allSubCatigory);
      console.log(data.category.allSubCatigory);
      setProducts(data.category.allProduct);
      setFilteredProducts(data.category.allProduct);
      
      const initialActiveSlides = {};
      data.allProduct.forEach(p => {
        initialActiveSlides[p._id] = 0;
      });
      setActiveSlideIndices(initialActiveSlides);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);
    }
  }

  useEffect(() => {
    getSubCatigory();
  }, [id]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [activeSort, minPrice, maxPrice, searchTerm, products]);

  // Lazy loading implementation
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
          // Fallback for browsers without IntersectionObserver
          lazyImages.forEach(function(lazyImage) {
            lazyImage.src = lazyImage.dataset.src;
          });
        }
      };

      // Run once on initial load
      lazyLoadImages();

      // Set up mutation observer to watch for new lazy images added to DOM
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

  function filterProducts() {
    let result = [...products];

    // Apply search filter from context
    if (searchTerm) {
      result = result.filter(product =>
        product.title.includes(searchTerm) ||
        product.description.includes(searchTerm)
      );
    }

    // Apply price filter
    if (activeSort === "price") {
      if (minPrice) {
        result = result.filter(product => product.price >= minPrice);
      }
      if (maxPrice) {
        result = result.filter(product => product.price <= maxPrice);
      }
    }

    // Apply sorting
    result = sortProducts(result, activeSort);

    setFilteredProducts(result);
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

  async function toggleWishlist(id) {
    try {
      if (isInWishlist(id)) {
        const { data } = await deletWhichData(id);
        if (data.message === "success") {
          toast.success("تم الإزالة", {
            position: "top-center",
            className: "border border-danger notefection p-3 bg-white text-danger notefection w-100 fw-bolder fs-4",
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

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => item._id === productId);

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
    <div className="container" id="product-of-subcategory">
      <div className="row">

    

        <div className="col-md-12 ">
          <div className="sort-section mb-4 ">
           <div>
    <h2 className="text-center mb-3">الاقسام الفرعية</h2>
    {subCatigoryOfCatigory && subCatigoryOfCatigory.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 justify-content-center container-subCatigory">
           <div className="d-flex flex-wrap gap-2 justify-content-center  container-of-subCatigory">
             {subCatigoryOfCatigory.map((subCat) => (
                <Link
                    key={subCat._id}
                    to={`/productOfSubCarigory/${subCat._id}`}
                    className="fs-4 fw-bold text-decoration-none subCatigory-Of-Catigory"
                >
                    {subCat.name} <spam className="slach">/</spam>
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
            <div className="d-flex flex-wrap align-items-center  sort-options">
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
                   {product.priceAfterDiscount && (
                     <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                       خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                     </span>
                   )}
                 </div>
           
                 <div className="card-body py-2">
                   {/* تصغير حجم الخط للعناوين على الموبايل */}
                   <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">{product.title?.split(" ").slice(0, 2).join(" ")}</h6>
                   <h5 className="card-title fs-6 mb-1">
                     {product.description?.split(" ").slice(0, 2).join(" ")}
                   </h5>
           
                   <div className="product-price mb-1 d-flex align-items-center">
                     <span className="text-danger fs-6 fw-bold">
                       {product.priceAfterDiscount ? `${product.priceAfterDiscount} ج.م` : `${product.price} ج.م`}
                     </span>
                     {product.priceAfterDiscount && (
                       <span className="text-decoration-line-through mx-1 text-muted ms-1 fs-7">
                         {product.price} ج.م
                       </span>
                     )}
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
        </div>
      </div>
    </div>
  );
}