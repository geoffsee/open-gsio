import React, { createContext, useContext, useState, useEffect } from "react";
import { useMediaQuery } from "@chakra-ui/react";

// Create the context to provide mobile state
const MobileContext = createContext(false);

// Create a provider component to wrap your app
export const MobileProvider = ({ children }: { children: React.ReactNode }) => {
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

  // Provide the combined mobile state globally
  const mobileState = isMobile || isFallbackMobile;

  return (
    <MobileContext.Provider value={mobileState}>
      {children}
    </MobileContext.Provider>
  );
};

// Custom hook to use the mobile context in any component
export function useIsMobile() {
  return useContext(MobileContext);
}

export default MobileContext;
