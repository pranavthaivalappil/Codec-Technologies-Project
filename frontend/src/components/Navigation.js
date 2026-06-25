import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ theme, toggleTheme }) => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fs-3" to="/">
          <i className="fas fa-wind me-2 fs-4"></i>
          <span>AuraMarket</span>
        </Link>
        
        <div className="d-flex align-items-center order-lg-last ms-2">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn me-2" 
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun text-warning"></i>
            )}
          </button>

          <button 
            className="navbar-toggler border-0" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto py-2 py-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <i className="fas fa-home me-1"></i>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`} 
                to="/products"
              >
                <i className="fas fa-box me-1"></i>
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname.startsWith('/departments') ? 'active' : ''}`} 
                to="/departments"
              >
                <i className="fas fa-building me-1"></i>
                Departments
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
