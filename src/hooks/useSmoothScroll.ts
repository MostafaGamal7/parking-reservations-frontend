import { useCallback } from "react";

export const useSmoothScroll = () => {
  const scrollToSection = useCallback(
    // 64px for the Header height
    (sectionId: string, offset: number = 64) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    []
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return {
    scrollToSection,
    scrollToTop,
  };
};
