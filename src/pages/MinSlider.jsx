import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import '../style/miinSlider.css'; // Assuming you have a CSS file for styling
import makup from '../assets/makeUp.jpg';
import Accessories from '../assets/elegant-jewelry-set-jewellery-set-with-gemstones-product-still-life-concept-ring-necklace-earrings_785351-3819.jpg';
import { Link } from 'react-router-dom';

export default function MinSlider() {
  const images = [
    { src: makup, id: 1, text: "ألوان وسحر مكياج يبرز أناقتك في كل لحظة" },
    { src: Accessories, id: 2, text: "اكتشفي جمالك الحقيقي مع لمساتنا الاحترافية" },
  ];

  return (
    <div className="container">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
        loop={true}
        pagination={{ clickable: true }}
      >
        {images.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="slider-image-container position-relative">
              <img src={item.src} alt={item.text} className="img-fluid slider-image" />
              <div className="slider-text-overlay ">
                {item.text}
                <div className='text-center w-100'> 
                    <Link to={"/product"} className='btn my-2'>تسوق الان</Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
