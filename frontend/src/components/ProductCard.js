import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const getDepartmentColor = (department) => {
    const departmentName = typeof department === 'string' ? department : department?.name;
    switch (departmentName?.toLowerCase()) {
      case 'women':
        return 'bg-pink text-white';
      case 'men':
        return 'bg-primary text-white';
      default:
        return 'bg-secondary text-white';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (cost, retailPrice) => {
    if (cost && retailPrice && retailPrice > cost) {
      const discount = ((retailPrice - cost) / retailPrice * 100);
      return Math.round(discount);
    }
    return 0;
  };

  const discount = calculateDiscount(product.cost, product.retail_price);

  return (
    <div className="product-card h-100 position-relative">
      {/* Product Image */}
      <div className="product-image-wrapper position-relative">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(244, 63, 94, 0.06) 100%)'
          }}>
            <i className={`${getCategoryIcon(product.category)} fa-4x text-primary opacity-25`}></i>
          </div>
        )}
        
        {/* Department Badge */}
        <div className={`position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill small fw-bold ${getDepartmentColor(product.department)}`}>
          {typeof product.department === 'string' ? product.department : product.department?.name || 'Unknown'}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="position-absolute top-0 start-0 m-3 bg-danger text-white px-3 py-1 rounded-pill small fw-bold shadow-sm">
            -{discount}% OFF
          </div>
        )}
      </div>

      <div className="product-card-body">
        {/* Category */}
        <div className="d-flex align-items-center mb-2">
          <i className={`${getCategoryIcon(product.category)} text-primary me-2`}></i>
          <span className="product-category m-0">{product.category}</span>
        </div>

        {/* Product Name */}
        <h5 className="product-title mb-2" title={product.name}>
          {product.name}
        </h5>

        {/* Brand */}
        <p className="product-brand mb-3">
          <i className="fas fa-copyright me-1 text-muted"></i>
          {product.brand}
        </p>

        {/* Pricing (in Rupees) */}
        <div className="d-flex align-items-baseline gap-2 mb-3">
          <div className="product-price">
            {formatPrice(product.cost)}
          </div>
          {product.cost && product.cost !== product.retail_price && (
            <span className="product-cost text-muted text-decoration-line-through">
              {formatPrice(product.retail_price)}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="small text-muted mb-4 mt-auto">
          <div className="d-flex justify-content-between mb-1">
            <span>SKU:</span>
            <span className="font-monospace text-truncate ms-2" style={{ maxWidth: '120px' }}>
              {product.sku}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Center ID:</span>
            <span className="fw-semibold">#{product.distribution_center_id}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Link 
          to={`/products/${product.id}`} 
          className="btn btn-primary w-100 mt-auto text-white"
        >
          <i className="fas fa-eye me-2"></i>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
