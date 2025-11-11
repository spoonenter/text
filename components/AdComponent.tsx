"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

interface AdComponentProps {
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
  layoutKey?: string;
  style?: React.CSSProperties;
}

const AdComponent: React.FC<AdComponentProps> = ({
  adSlot,
  adFormat = "auto",
  adLayout = "",
  layoutKey = "",
  style,
}) => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (e) {
      console.error("Error loading ads:", e);
    }
  }, [pathname]); // pathname이 바뀔 때마다 광고 새로 push

  if (pathname.startsWith("/test") || pathname.startsWith("/aboutme")) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...(style || {}) }}
      data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_GAPID}`}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-ad-layout={adLayout}
      data-ad-layout-key={layoutKey}
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdComponent;
