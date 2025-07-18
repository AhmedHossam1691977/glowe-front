import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [userName, setUserName] = useState({ name: "" });
 

 useEffect(() => {
  const token = localStorage.getItem("token");  
  if (token) {
    const decodedToken = jwtDecode(token);
    setUserName(decodedToken);
  }
  }
 
  , []);




  return (
    <AuthContext.Provider value={{setUserName , userName }}>
      {children}
    </AuthContext.Provider>
  );
};