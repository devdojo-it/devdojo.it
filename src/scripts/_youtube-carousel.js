document.addEventListener("focusin", (e) => {
  // focus not working with tabindex=0 element
  if (e.target.matches("figure")) {
    const container = e.target.closest("stage");
    const slide = e.target.parentElement;
    const slides = container.querySelectorAll("slide");

    const slideIndex = Array.prototype.indexOf.call(slides, slide);
    const slideWidth = slide.offsetWidth;

    if (slideIndex > 0) {
      requestAnimationFrame(() => {
        container.scroll({ top: 0, left: slideWidth * slideIndex, behavior: "smooth" });
      });
    }
  }
});
