
import { createContext, useEffect, useState } from "react";
export let productContext = createContext();




export default function ProductContextProvider(props){


    const [product ,setProduct] = useState([])
 

useEffect(()=>{

},[product])





    return <productContext.Provider value={{setProduct,product}}>
        {props.children}
    </productContext.Provider>

}  