import axios from "axios";
import { createContext, useEffect, useState } from "react";

export let CartContext = createContext(); 

export default function CartContextProvider(props) {
    let [cartCount, setCartCount] = useState(0);
    const basUrl = "https://final-pro-api-j1v7.onrender.com"

    useEffect(() => {
        async function gitData() {
            let { data } = await getAllCartData();
            setCartCount(data.cartItems);
            
        }

        // تحقق من وجود token قبل استدعاء gitData
        if (localStorage.getItem("token")) {
            gitData();
        } else {
            setCartCount(0); // إذا لم يكن هناك token، يتم تعيين cartCount إلى 0
        }
    }, []);


    useEffect(() => {
        async function gitData() {
            let { data } = await getAllCartData();
            setCartCount(data.cartItems);
            
        }

        // تحقق من وجود token قبل استدعاء gitData
        if (localStorage.getItem("token")) {
            gitData();
        } else {
            setCartCount(0); // إذا لم يكن هناك token، يتم تعيين cartCount إلى 0
        }
    }, [localStorage.getItem("token")],cartCount);


    async function getAllCartData() { 
        return await axios.get(`${basUrl}/api/v1/cart`, {
            headers: {
                'token': localStorage.getItem("token")
            }
        });
    }

    function deletAllCartData() {
        return axios.delete(`${basUrl}/api/v1/cart`, {
            headers: {
                'token': localStorage.getItem("token")
            }
        });
    }

   function addCart(id, image) {
    console.log(id);
    
    return axios.post(`${basUrl}/api/v1/cart`, { 
        "product": id,
        "image": image
    }, {
        headers: {
            'token': localStorage.getItem("token")
        }
    });
}

    function updateProductQuantany(id, quantity) {

        
        return axios.put(`${basUrl}/api/v1/cart/${id}`, { "quantity": quantity }, {
            headers: {
                'token': localStorage.getItem("token")
            }
        });
    }

    function deletCartData(id) {
        return axios.delete(`${basUrl}/api/v1/cart/${id}`, {
            headers: {
                'token': localStorage.getItem("token")
            }
        });
    }


  function CartCoupon(couponCode) {
  return axios.post(
    `${basUrl}/api/v1/cart/applyCoupon`, // المسار الصحيح
    { coupone: couponCode }, // إرسال الكوبون في body
    {
      headers: {
        'token': localStorage.getItem("token") // إرسال التوكن في ال headers
      }
    }
  );
}

    return (
        <CartContext.Provider value={{ addCart, getAllCartData, cartCount, updateProductQuantany, setCartCount, deletCartData, deletAllCartData ,CartCoupon }}>
            {props.children}
        </CartContext.Provider>
    );
}
