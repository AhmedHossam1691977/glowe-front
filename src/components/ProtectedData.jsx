import React from 'react'
import { Navigate } from 'react-router-dom';

export default function ProtectedRouter(props) {
    if (localStorage.getItem("token")) {
      // path
      return props.children
    } else {
      // login
      return  <Navigate to='/login'/>
    }
}