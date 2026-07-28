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

/*
 * O Instagram não disponibiliza métricas e URLs individuais sem autenticação.
 * Substitua instagramUrl pelos links exatos dos Reels quando eles estiverem
 * disponíveis; o componente mantém o mesmo layout e comportamento.
 */
const reels = [
  {
    title: "Cuidado com a visão em todas as fases",
    thumbnail: "images/instagram-1.jpg",
    instagramUrl: "https://www.instagram.com/glauciaokamoto/reels/",
  },
  {
    title: "Conheça o espaço de atendimento",
    thumbnail: "images/instagram-2.jpg",
    instagramUrl: "https://www.instagram.com/glauciaokamoto/reels/",
  },
  {
    title: "Bastidores da Clínica Bonaldi",
    thumbnail: "images/instagram-3.jpg",
    instagramUrl: "https://www.instagram.com/glauciaokamoto/reels/",
  },
  {
    title: "Quando é hora de consultar o oftalmologista?",
    thumbnail: "images/instagram-1.jpg",
    instagramUrl: "https://www.instagram.com/glauciaokamoto/reels/",
  },
  {
    title: "Saúde ocular começa com prevenção",
    thumbnail: "images/instagram-2.jpg",
    instagramUrl: "https://www.instagram.com/glauciaokamoto/reels/",
  },
  {
    title: "Um olhar atento para cada paciente",
    thumbnail: "images/instagram-3.jpg",
    instagramUrl: "https://www.instagram.com/glauciaokamoto/reels/",
  },
];

const reelsComponent = select("[data-reels-carousel]");

if (reelsComponent) {
  const viewport = select(".reels-viewport", reelsComponent);
  const track = select(".reels-track", reelsComponent);
  const previousButton = select(".reels-prev", reelsComponent);
  const nextButton = select(".reels-next", reelsComponent);
  const pagination = select(".reels-pagination", reelsComponent);
  const status = select(".reels-status", reelsComponent);
  const profileUrl = "https://www.instagram.com/glauciaokamoto/reels/";
  const playIcon =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" fill="currentColor"/></svg>';

  track.innerHTML = reels
    .map(
      (reel, index) => `
        <a class="reel-card" href="${reel.instagramUrl || profileUrl}" target="_blank" rel="noopener" aria-label="${reel.title}. Abrir no Instagram">
          <div class="reel-media"><img src="${reel.thumbnail}" alt="" loading="lazy"></div>
          <div class="reel-shade"></div>
          <div class="reel-top"><span class="reel-label">Em destaque</span><span class="reel-number">${String(index + 1).padStart(2, "0")}</span></div>
          <span class="reel-play">${playIcon}</span>
          <div class="reel-info"><h3>${reel.title}</h3><span class="reel-watch">Assistir no Instagram <span aria-hidden="true">↗</span></span></div>
        </a>`,
    )
    .join("");

  const cards = selectAll(".reel-card", track);
  let activePage = 0;
  let itemsPerPage = 3;
  let pageCount = 1;

  const visibleItems = () => {
    if (window.innerWidth <= 650) return 1;
    if (window.innerWidth <= 1050) return 2;
    return 3;
  };

  const cardStep = () => {
    const card = cards[0];
    if (!card) return 0;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const updateControls = () => {
    previousButton.disabled = activePage === 0;
    nextButton.disabled = activePage >= pageCount - 1;
    selectAll(".reels-dot", pagination).forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === activePage));
    });
    status.textContent = `Página ${activePage + 1} de ${pageCount}`;
  };

  const goToPage = (page) => {
    activePage = Math.max(0, Math.min(page, pageCount - 1));
    viewport.scrollTo({
      left: activePage * cardStep() * itemsPerPage,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    updateControls();
  };

  const renderPagination = () => {
    itemsPerPage = visibleItems();
    pageCount = Math.ceil(cards.length / itemsPerPage);
    activePage = Math.min(activePage, pageCount - 1);
    pagination.innerHTML = Array.from(
      { length: pageCount },
      (_, index) =>
        `<button class="reels-dot" type="button" aria-label="Ir para a página ${index + 1}" aria-current="${index === activePage}"></button>`,
    ).join("");
    selectAll(".reels-dot", pagination).forEach((dot, index) =>
      dot.addEventListener("click", () => goToPage(index)),
    );
    updateControls();
  };

  previousButton.addEventListener("click", () => goToPage(activePage - 1));
  nextButton.addEventListener("click", () => goToPage(activePage + 1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(activePage - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(activePage + 1);
    }
  });

  let scrollTimer;
  viewport.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        activePage = Math.max(
          0,
          Math.min(
            Math.round(viewport.scrollLeft / (cardStep() * itemsPerPage)),
            pageCount - 1,
          ),
        );
        updateControls();
      }, 90);
    },
    { passive: true },
  );

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderPagination, 150);
  });

  renderPagination();
}
