const select = (selector, context = document) =>
  context.querySelector(selector);
const selectAll = (selector, context = document) => [
  ...context.querySelectorAll(selector),
];

const header = select(".header");
const menuToggle = select(".menu-toggle");
const mobileMenu = select(".mobile-menu");

window.addEventListener(
  "scroll",
  () => header.classList.toggle("scrolled", window.scrollY > 18),
  { passive: true },
);

menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
});

selectAll("a", mobileMenu).forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

selectAll(".reveal").forEach((element) => revealObserver.observe(element));

select("#year").textContent = new Date().getFullYear();
