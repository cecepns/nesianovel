import { useState } from 'react';
import PropTypes from 'prop-types';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import brokenImage from '../assets/broken-image.png';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '',
  loadingClassName = '',
  placeholderSrc = null,
  effect = 'opacity',
  threshold = 100,
  /** Send Referer on image requests so CDN hotlink/scraper protection passes */
  referrerPolicy = 'strict-origin-when-cross-origin',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleBeforeLoad = () => {
    setIsLoading(true);
  };

  const handleAfterLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  // Add retry cache busting query param if retried
  const currentSrc = retryCount > 0 
    ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount}` 
    : src;

  return (
    <div className={`relative ${isLoading ? loadingClassName : ''} ${wrapperClassName}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-950/40 animate-pulse">
          <div className="h-7 w-7 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
        </div>
      )}

      {/* Error State with Reload Button */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-purple-950/40 text-center">
          <img 
            src={brokenImage} 
            alt="Gagal memuat gambar" 
            className="max-h-16 opacity-60 mb-2 object-contain"
            referrerPolicy={referrerPolicy}
          />
          <p className="text-[11px] text-purple-300/80 mb-2 font-medium line-clamp-1">Gagal memuat</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Muat Ulang
          </button>
        </div>
      )}

      {/* Lazy Loaded Image */}
      {!hasError && (
        <LazyLoadImage
          key={`${src}-${retryCount}`}
          src={currentSrc}
          alt={alt}
          className={className}
          wrapperProps={{ className: 'w-full h-full block leading-[0]' }}
          effect={effect}
          threshold={threshold}
          placeholderSrc={placeholderSrc}
          beforeLoad={handleBeforeLoad}
          afterLoad={handleAfterLoad}
          onError={handleError}
          referrerPolicy={referrerPolicy}
          {...props}
        />
      )}
    </div>
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  loadingClassName: PropTypes.string,
  placeholderSrc: PropTypes.string,
  effect: PropTypes.string,
  threshold: PropTypes.number,
  referrerPolicy: PropTypes.string,
};

export default LazyImage;















