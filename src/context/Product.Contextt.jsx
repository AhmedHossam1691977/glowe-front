
import axios from "axios";
import { createContext, useEffect, useState } from "react";
export let productContext = createContext();




export default function ProductContextProvider(props){
 
    const basUrl = "https://final-pro-api-j1v7.onrender.com"


    const [product ,setProduct] = useState([])
 

useEffect(()=>{

},[product])

   async function getAllProduct() { 
        return await axios.get(`${basUrl}/api/v1/product`)
    }






    return <productContext.Provider value={{setProduct,product ,getAllProduct}}>
        {props.children}
    </productContext.Provider>

}  