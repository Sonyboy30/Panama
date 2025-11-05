// --------------------------------------------
// PANAMA CANAL MUSEUM INTERACTIONS
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Toggle mobile nav
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  // Scroll to top button
  const scrollTop = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      scrollTop.style.display = "block";
    } else {
      scrollTop.style.display = "none";
    }
  });
  scrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Fade-in animations on scroll
  const revealEls = document.querySelectorAll(".timeline-item, .image-gallery img, section p");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach(el => observer.observe(el));
});
