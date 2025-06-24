import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="row">
          {/* Logo and Description */}
          <div className="col-md-6 mb-4 mb-md-0">
            <h4 className="mb-2">Your Website</h4>
            <p className="text-muted mb-0">
              Your trusted e-commerce platform in Saudi Arabia
            </p>
          </div>

          {/* Navigation Links */}
          <div className="col-md-6">
            <ul className="list-unstyled mb-0 text-md-end">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white text-decoration-none">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white text-decoration-none">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="row mt-4">
          <div className="col-12">
            <p className="text-center text-muted mb-0">
              © 2025 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 