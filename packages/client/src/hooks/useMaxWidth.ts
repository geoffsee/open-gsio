import { useState, useEffect } from "react";
import { useIsMobile } from "../components/contexts/MobileContext";

export const useMaxWidth = () => {
  const isMobile = useIsMobile();
  const [maxWidth, setMaxWidth] = useState("600px");

  const calculateMaxWidth = () => {
    if (isMobile) {
      setMaxWidth("800px");
    } else if (window.innerWidth < 1024) {
      setMaxWidth("500px");
    } else {
      setMaxWidth("800px");
    }
  };

  useEffect(() => {
    calculateMaxWidth();

    const handleResize = () => {
      calculateMaxWidth();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  return maxWidth;
};
