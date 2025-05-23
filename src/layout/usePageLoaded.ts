import { useEffect, useState } from "react";

const usePageLoaded = (callback: () => void) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handlePageLoad = () => {
      setIsLoaded(true);
      callback();
    };

    if (document.readyState === "complete") {
      // Page is already fully loaded
      handlePageLoad();
    } else {
      // Wait for the page to load
      window.addEventListener("load", handlePageLoad);
    }

    return () => window.removeEventListener("load", handlePageLoad);
  }, [callback]);

  return isLoaded;
};

export default usePageLoaded;
