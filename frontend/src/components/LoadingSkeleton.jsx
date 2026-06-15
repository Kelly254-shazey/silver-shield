function LoadingSkeleton({ className = "" }) {
  return (
    <div className={`skeleton ${className}`} style={{ minHeight: '1rem' }}>
      <div className="skeleton-shimmer" />
    </div>
  );
}

export default LoadingSkeleton;
