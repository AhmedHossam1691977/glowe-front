// import React, { useEffect } from 'react'
import Catigory from './Catigory.jsx';
import MinSlider from './MinSlider.jsx'
import OffersMini from './OffersMini.jsx';
import RancMini from './RancMini.jsx';
export default function Home() {




  return <>
    
    <div className="container-fluid">
      <div className='row'>
        <div className="col-md-12 p-0 m-0 my-3">
        <MinSlider />
      </div>
      </div>
      
      <div className='row'>
        <div className="col-md-12">
          <Catigory />
        </div>
      </div>
      <div className="container">
        <div className="row">
      <div className="col-md-12">
        <OffersMini />
      </div>
      <div className="col-md-12 my-5">
                <RancMini />
      </div>
    </div>
      </div>


    </div>
  </>
}
