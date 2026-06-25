import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await productsAPI.getProduct(id);
        setProduct(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDepartmentColor = (department) => {
    const departmentName = typeof department === 'string' ? department : department?.name;
    switch (departmentName?.toLowerCase()) {
      case 'women':
        return 'text-pink';
      case 'men':
        return 'text-primary';
      default:
        return 'text-secondary';
    }
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('accessories')) return 'fas fa-hat-cowboy';
    if (categoryLower.includes('tops') || categoryLower.includes('tees')) return 'fas fa-tshirt';
    if (categoryLower.includes('pants') || categoryLower.includes('jeans')) return 'fas fa-vest';
    if (categoryLower.includes('shoes')) return 'fas fa-shoe-prints';
    if (categoryLower.includes('bags')) return 'fas fa-shopping-bag';
    return 'fas fa-box';
  };

  const calculateDiscount = (cost, retailPrice) => {
    if (cost && retailPrice && retailPrice > cost) {
      const discount = ((retailPrice - cost) / retailPrice * 100);
      return Math.round(discount);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner-border loading-spinner text-primary" role="status">
            <span className="visually-hidden">Loading product...</span>
          </div>
          <p className="mt-3 text-muted">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h4>Product Not Found</h4>
          <p className="text-muted">{error}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-primary text-white" onClick={() => navigate('/products')}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to Products
            </button>
            <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>
              <i className="fas fa-redo me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discount = calculateDiscount(product.cost, product.retail_price);

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Products</Link>
          </li>
          <li className="breadcrumb-item">
            <Link 
              to={`/products?category=${encodeURIComponent(product.category)}`} 
              className="text-decoration-none"
            >
              {product.category}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Product #{product.id}
          </li>
        </ol>
      </nav>

      {/* Product Detail Card */}
      <div className="product-detail">
        <div className="row g-5">
          {/* Left Column: Product Image */}
          <div className="col-lg-5">
            <div className="product-detail-image-wrapper position-relative">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="product-detail-image w-100 rounded-4"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center rounded-4" style={{
                  height: '350px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <i className={`${getCategoryIcon(product.category)} fa-6x text-primary opacity-25`}></i>
                </div>
              )}
              
              {/* Discount Badge */}
              {discount > 0 && (
                <span className="badge bg-danger fs-6 px-3 py-2 position-absolute top-0 start-0 m-3 shadow-sm">
                  <i className="fas fa-percentage me-1"></i>
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-lg-7">
            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <span className="badge bg-light text-dark">
                <i className={`${getCategoryIcon(product.category)} me-1 text-muted`}></i>
                {product.category}
              </span>
              <span className={`badge ${getDepartmentColor(product.department)} bg-opacity-10 border`}>
                {typeof product.department === 'string' ? product.department : product.department?.name || 'Unknown'}
              </span>
              <span className="text-muted ms-md-auto font-monospace small">ID: #{product.id}</span>
            </div>

            <h1 className="product-detail-title mb-2">
              {product.name}
            </h1>

            <div className="product-detail-brand mb-4">
              <i className="fas fa-copyright me-2 text-muted"></i>
              <span className="fw-semibold text-main">{product.brand}</span>
            </div>

            <div className="d-flex align-items-baseline gap-3 mb-4">
              <div className="product-detail-price">
                {formatPrice(product.cost)}
              </div>
              {product.cost && product.cost !== product.retail_price && (
                <span className="text-muted text-decoration-line-through fs-5">
                  List Price: {formatPrice(product.retail_price)}
                </span>
              )}
            </div>

            {/* Spec Grid */}
            <div className="product-detail-info">
              <div className="info-card">
                <h6>
                  <i className="fas fa-barcode me-2"></i>
                  Product SKU
                </h6>
                <p className="font-monospace text-truncate text-main" title={product.sku}>
                  {product.sku}
                </p>
              </div>

              <div className="info-card">
                <h6>
                  <i className="fas fa-warehouse me-2"></i>
                  Distribution Center
                </h6>
                <p className="text-main">Center #{product.distribution_center_id}</p>
              </div>

              <div className="info-card">
                <h6>
                  <i className="fas fa-calendar-plus me-2"></i>
                  Added Date
                </h6>
                <p className="text-main">{product.createdAt ? formatDate(product.createdAt) : 'N/A'}</p>
              </div>

              <div className="info-card">
                <h6>
                  <i className="fas fa-edit me-2"></i>
                  Last Updated
                </h6>
                <p className="text-main">{product.updatedAt ? formatDate(product.updatedAt) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-center mt-5 pt-4 border-top flex-wrap">
          <button 
            className="btn btn-outline-primary btn-md"
            onClick={() => navigate('/products')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Products
          </button>
          
          <Link 
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="btn btn-primary btn-md text-white"
          >
            <i className="fas fa-layer-group me-2"></i>
            Similar Products
          </Link>
          
          <Link 
            to={`/products?brand=${encodeURIComponent(product.brand)}`}
            className="btn btn-outline-secondary btn-md"
          >
            <i className="fas fa-copyright me-2"></i>
            More from {product.brand}
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <i className="fas fa-share-alt fa-2x text-primary mb-3"></i>
              <h5>Share Product</h5>
              <p className="text-muted small">Share this product with friends</p>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out this product: ${product.name}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Product link copied to clipboard!');
                  }
                }}
              >
                <i className="fas fa-share me-1"></i>
                Share
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <i className="fas fa-heart fa-2x text-danger mb-3"></i>
              <h5>Add to Favorites</h5>
              <p className="text-muted small">Save for later viewing</p>
              <button className="btn btn-outline-danger btn-sm">
                <i className="fas fa-heart me-1"></i>
                Favorite
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <i className="fas fa-print fa-2x text-secondary mb-3"></i>
              <h5>Print Details</h5>
              <p className="text-muted small">Print product information</p>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => window.print()}
              >
                <i className="fas fa-print me-1"></i>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
