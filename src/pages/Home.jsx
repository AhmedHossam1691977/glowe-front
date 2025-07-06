// import React, { useEffect } from 'react'
import Catigory from './Catigory.jsx';
import MinSlider from './MinSlider.jsx'
import ProductOffer from "./ProductOffer.jsx";
export default function Home() {




  return <>
    
    <div className="container-fluid">
      <div className='row'>
        <div className="col-md-12 p-0 m-0">
        <MinSlider />
      </div>
      </div>
      
      <div className='row'>
        <div className="col-md-12">
          <Catigory />
        </div>
      </div>
      {/* <div className="container">
        <div className="row">
      <div className="col-md-12">
        <ProductOffer/>
      </div>
    </div>
      </div> */}


    </div>
  </>
}
