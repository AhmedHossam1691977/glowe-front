import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import '../style/miinSlider.css';
import makup from '../assets/makeUp.jpg';
import Accessories from '../assets/elegant-jewelry-set-jewellery-set-with-gemstones-product-still-life-concept-ring-necklace-earrings_785351-3819.jpg';
import { Link } from 'react-router-dom';

export default function MinSlider() {
  const images = [
    { src: makup, id: 1, text: "ألوان وسحر مكياج يبرز أناقتك في كل لحظة" },
    { src: Accessories, id: 2, text: "اكتشفي جمالك الحقيقي مع لمساتنا الاحترافية" },
  ];

  return (
    // Changed to container-fluid with no horizontal padding
    <div className="container-fluid p-0 mx-0 " id='minSlider'>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0} // No space between slides for full width
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        pagination={{ clickable: true }}
      >
        {images.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="slider-image-container position-relative overflow-hidden rounded-0 shadow-sm"> {/* Removed rounded corners to touch edges */}
              <img src={item.src} alt={item.text} className="img-fluid object-fit-cover " />
              <div className="slider-text-overlay d-flex flex-column justify-content-center align-items-center text-center p-3">
                <p className="slider-text mb-3">{item.text}</p>
                <Link to={"/products"} className='btn fw-bold slider-button'>
                  تسوق الان
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}