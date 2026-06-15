import React from "react";

const LogoBrand = ({ className = "", variant = "default", tone = "dark" }) => {
  const isMinimal = variant === "minimal";
  const heightPx = isMinimal ? "44px" : "60px";
  const textColor = tone === "light" ? "text-white" : "text-text-900";

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
          <span className="opacity-100">Silver Shield</span>
        </span>
      )}
    </div>
  );
};

export default LogoBrand;
