import React from "react";

const LogoBrand = ({ className = "", variant = "default", tone = "dark" }) => {
  const isMinimal = variant === "minimal";
  const heightPx = isMinimal ? "32px" : "44px";
  const textColor = tone === "light" ? "text-white" : "text-primary-text";

  return (
    <div className={`inline-flex items-center gap-3 md:gap-4 flex-nowrap ${className}`}>
      <img
        src="/logo.png"
        alt="Silver Shield Logo"
        style={{ 
          height: heightPx,
          width: "auto",
          objectFit: "contain", 
          display: "block"
        }}
      />
      {!isMinimal && (
        <span className={`text-sm md:text-base font-black uppercase tracking-[0.12em] whitespace-nowrap leading-none ${textColor}`}>
          Silver Shield <span className="opacity-100">Organisation</span>
        </span>
      )}
    </div>
  );
};

export default LogoBrand;
