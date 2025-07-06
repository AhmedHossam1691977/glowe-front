import axios from "axios";
import { createContext, useEffect, useState } from "react";
export let catigoryContext = createContext();




export default function CatigoryContextProvider(props){

    const baseUrl = "https://final-pro-api-j1v7.onrender.com"
    const [allCatigory , setAllCatigory]=useState([])



    useEffect(()=>{
        allCatigories()
    },[])



    async function allCatigories(){

        const {data} = await axios.get(`${baseUrl}/api/v1/categories`).catch((err)=>{
            console.log(err);
        })

        setAllCatigory(data.categories)
        
    }


    
    async function getSingleCatigories(id){

        return  await axios.get(`${baseUrl}/api/v1/categories/${id}`).catch((err)=>{
            console.log(err);
        })
        
        
    }



    return <catigoryContext.Provider value={{allCatigory ,getSingleCatigories}}>
        {props.children}
    </catigoryContext.Provider>

}  