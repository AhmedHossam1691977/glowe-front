import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const whichlistContext = createContext();

export default function WhichlistContextProvider({ children }) {
 
  const [WhichlistProduct, setWhichlistProduct] = useState([]);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getAllWhichlistData().then(({ data }) => {
        setWhichlistProduct(data.wishlist);
        
      });
    } else {
      setWhichlistProduct([]);
      
    }
  }, []);

  async function getAllWhichlistData() {
    return await axios.get(`${baseUrl}/api/v1/wishlist`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  }

  async function addWishlist(id) {
    return await axios.patch(
      `${baseUrl}/api/v1/wishlist`,
      { product: id },
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
  }

  async function deletWhichData(id) {
    return await axios.delete(`${baseUrl}/api/v1/wishlist/${id}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  }

  return (
    <whichlistContext.Provider
      value={{
        addWishlist,
        getAllWhichlistData,
        deletWhichData,


        WhichlistProduct,
        setWhichlistProduct,
      }}
    >
      {children}
    </whichlistContext.Provider>
  );
}
