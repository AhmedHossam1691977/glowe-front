import React, { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "./../style/WhichList.css"
import { whichlistContext } from '../context/WhichListcontext.jsx';
import toast from 'react-hot-toast';

export default function WhichList() {
  // بيانات وهمية للمنتجات في قائمة الرغبات
  const [wishlistItems, setWishlistItems] = useState([]);
const { getAllWhichlistData , deletWhichData ,setWhichlistProduct} = useContext(whichlistContext);

useEffect(() => {
    fetchWishlistItems();
}, []);

  async function fetchWishlistItems() {
    const {data} = await getAllWhichlistData();
    setWishlistItems(data.wishlist);
    console.log(data.wishlist);
    
  }
  

  async function handleRemoveItem(id) {
   

    let { data } = await deletWhichData(id);
    console.log(data);
    setWishlistItems(data.wishlist)
    setWhichlistProduct(data)
    toast.success("تم حذف المنتج من قائمة الرغبات", {
      position: 'top-center',
      className: 'border border-success p-3 bg-white text-danger w-100 fw-bolder fs-4',
      duration: 1000,
      icon: '👏'
    });
  }


  return (
    <div className="wishlist-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/wishlist">Wishlist</Link>
      </div>


      {/* Wishlist Items */}
      <div className="wishlist-items">
        {wishlistItems.map(item => (
          <div key={item.id} className="wishlist-item">
            <div className="item-image">
              <img src={item.imgCover} alt={item.title} />
              <button className="remove-btn">
                <FaTimes />
              </button>
            </div>
            
            <div className="item-details">
              <h3>{item.title}</h3>
              <p className="item-description">{item.description}</p>
              
              <div className="item-price">
                <span className="current-price">${item.price.toFixed(2)}</span>
                {item.originalPrice && (
                  <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                )}
              </div>
              
              <div className="item-actions">
                <button className="move-to-cart" >
                  <FaShoppingCart /> اضافه الا السله
                </button>
                <button className="move-to-cart" onClick={() => handleRemoveItem(item.id)}>
                  <FaHeart /> ازاله من القائمه
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if wishlist is empty) */}
      {wishlistItems.length === 0 && (
        <div className="empty-wishlist">
          <FaRegHeart className="empty-icon" />
          <h2>قائمة أمنياتك فارغة</h2>
          <p>ليس لديك أي منتجات في قائمة أمنياتك بعد.</p>
          <Link to="/products" className="browse-btn">
            تصفح المنتجات
          </Link>
        </div>
      )}
    </div>
  );
}