import React from "react";

export default function BrandLogo({ size = "md" }) {
  return (
    <span className={`brand-logo brand-logo-${size}`} aria-hidden="true">
      <img src="/images/logo.png" alt="" />
    </span>
  );
}
