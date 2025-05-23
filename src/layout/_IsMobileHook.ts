import { useEffect, useState } from "react";
import { useMediaQuery } from "@chakra-ui/react";

// Only use this when it is necessary to style responsively outside a MobileProvider.
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isFallbackMobile] = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      );
    setIsMobile(mobile);
  }, []);

  return isMobile || isFallbackMobile;
}
