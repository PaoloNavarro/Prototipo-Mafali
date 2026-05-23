/**
 * app.js - Lógica principal e interactividad de la Landing Page de Mafali Bros
 * Administra el soporte multiidioma, renderizado de componentes y animaciones.
 */

// Estado global de la aplicación
const AppState = {
  currentLang: "es",
  translations: {},
  servicesTemplate: null,
  servicesContainer: null,
  portfolioTemplate: null,
  portfolioContainer: null,
  portfolioItems: [],
  filteredItems: [],
  activeFilter: "all",
  currentLightboxIndex: 0
};

// Iconos SVG para los servicios dinámicos
const SVGIcons = {
  palette: `<svg class="service-icon-svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03454 19.176 5.28254 19.2312 5.51034 19.145C5.73814 19.0588 5.90328 18.8471 5.94228 18.6083C6.06456 17.8601 6.3986 17.1599 6.90483 16.5911C7.68962 15.7093 8.82424 15.2 10 15.2H12V17.2C12 18.3758 12.5158 19.5038 13.4343 20.2857C14.0028 20.7699 14.703 21.0945 15.4512 21.2057C15.69 21.2407 15.9017 21.0716 15.9879 20.8438C16.0741 20.616 16.0189 20.368 15.8429 20.192C14.0747 18.4238 13 15.9531 13 13.2C13 12.6477 13.4477 12.2 14 12.2H20C20.5523 12.2 21 12.6477 21 13.2C21 13.4209 20.9122 13.6328 20.7561 13.789L12.7561 21.789C12.5609 21.9842 12.2859 22.0526 12.0294 21.9702C12.0196 21.967 12.0098 21.9638 12 22Z"/><circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/></svg>`,
  home: `<svg class="service-icon-svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  brush: `<svg class="service-icon-svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13l-6 6a5 5 0 0 1-7-7l6-6"/><path d="M15 3h6v6"/><path d="M12 12l9-9"/><path d="M14 6l4 4"/></svg>`,
  building: `<svg class="service-icon-svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>`
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar referencias del DOM
  AppState.servicesTemplate = document.getElementById("service-card-template");
  AppState.servicesContainer = document.querySelector(".services-grid");
  AppState.portfolioTemplate = document.getElementById("portfolio-card-template");
  AppState.portfolioContainer = document.getElementById("portfolio-grid");
  
  // Detectar idioma inicial
  detectInitialLanguage();
  
  // Registrar receptor del evento "componentsLoaded"
  document.addEventListener("componentsLoaded", async () => {
    await loadTranslations(AppState.currentLang);
    setupLanguageSelectorEvents();
    setupContactForm();
    setupScrollAnimations();
    setupWhatsAppChatbot();
    setupPortfolioFilters();
    setupLightbox();
    setupBeforeAfterSlider();
    setupPortfolioModeSelector();
    setupTiltEffects();
  });
});

/**
 * Detecta el idioma inicial del usuario basándose en localStorage o el navegador
 */
function detectInitialLanguage() {
  const savedLang = localStorage.getItem("preferred_lang");
  if (savedLang && (savedLang === "es" || savedLang === "en")) {
    AppState.currentLang = savedLang;
  } else {
    const userLang = navigator.language || navigator.userLanguage;
    AppState.currentLang = userLang.startsWith("es") ? "es" : "en";
  }
}

/**
 * Carga el archivo JSON de traducciones correspondiente
 */
async function loadTranslations(lang) {
  try {
    const response = await fetch(`translations/${lang}.json`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la traducción para ${lang}`);
    }
    AppState.translations = await response.json();
    AppState.currentLang = lang;
    
    // Almacenar preferencia
    localStorage.setItem("preferred_lang", lang);
    
    // Aplicar traducciones
    translateDOM();
    renderDynamicServices();
    renderPortfolioGrid();
    
    // Disparar evento de idioma cambiado para que el chatbot se actualice si ya está activo
    document.dispatchEvent(new CustomEvent("languageChanged"));
  } catch (error) {
    console.error("Error al cargar traducción:", error);
  }
}

/**
 * Traduce el DOM basándose en los atributos data-i18n y el archivo JSON cargado
 */
function translateDOM() {
  const t = AppState.translations;
  if (!t) return;

  // Traducir Meta Tags de SEO para calidad premium
  if (t.meta) {
    document.title = t.meta.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.meta.description || "");
    const metaKeys = document.querySelector('meta[name="keywords"]');
    if (metaKeys) metaKeys.setAttribute("content", t.meta.keywords || "");
  }

  // Buscar todos los elementos traducibles
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translationValue = getNestedValue(t, key);
    
    if (translationValue) {
      // Si el elemento es un input o un textarea con placeholder
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", translationValue);
      } else {
        // Preservar la estructura HTML interna si tiene iconos (como el botón llamar)
        const iconSvg = el.querySelector("svg");
        if (iconSvg) {
          // Reemplazar solo el nodo de texto
          // Buscamos el nodo de texto y lo actualizamos o vaciamos el texto y volvemos a añadir el icono y el texto
          el.innerHTML = "";
          el.appendChild(iconSvg);
          el.appendChild(document.createTextNode(" " + translationValue));
        } else {
          // Si tiene formato de copyright con año
          if (key === "footer.copyright") {
            const currentYear = new Date().getFullYear();
            el.innerHTML = translationValue.replace("{year}", currentYear);
          } else {
            el.textContent = translationValue;
          }
        }
      }
    }
  });

  // Traducir placeholders específicos si los hay
  const placeholderElements = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderElements.forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const translationValue = getNestedValue(t, key);
    if (translationValue) {
      el.setAttribute("placeholder", translationValue);
    }
  });

  // Traducir las opciones de elementos Select
  const selectElements = document.querySelectorAll("select[data-i18n-select]");
  selectElements.forEach(select => {
    const keyPrefix = select.getAttribute("data-i18n-select");
    const optionsData = getNestedValue(t, keyPrefix);
    
    if (optionsData) {
      // La primera opción suele ser el placeholder deshabilitado
      const firstOpt = select.options[0];
      if (firstOpt && firstOpt.hasAttribute("data-i18n-opt-placeholder")) {
        const placeholderKey = firstOpt.getAttribute("data-i18n-opt-placeholder");
        firstOpt.textContent = getNestedValue(t, placeholderKey);
      }
      
      // Traducir el resto de opciones mapeando por valor
      Array.from(select.options).forEach(opt => {
        if (opt.value && optionsData[opt.value]) {
          opt.textContent = optionsData[opt.value];
        }
      });
    }
  });
}

/**
 * Obtiene valores anidados de un objeto usando una cadena de ruta tipo "contacto.formulario.nombre"
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Configura los botones del selector de idioma en la Navbar
 */
function setupLanguageSelectorEvents() {
  const langButtons = document.querySelectorAll(".lang-btn");
  
  // Establecer botón activo inicial
  updateActiveLanguageBtn();

  langButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const selectedLang = btn.getAttribute("data-lang");
      if (selectedLang !== AppState.currentLang) {
        await loadTranslations(selectedLang);
        updateActiveLanguageBtn();
      }
    });
  });
}

/**
 * Actualiza la clase activa en los botones selectores de idioma
 */
function updateActiveLanguageBtn() {
  const langButtons = document.querySelectorAll(".lang-btn");
  langButtons.forEach(btn => {
    if (btn.getAttribute("data-lang") === AppState.currentLang) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  });
}

/**
 * Renderiza dinámicamente las tarjetas de servicio utilizando el template HTML
 */
function renderDynamicServices() {
  if (!AppState.servicesTemplate || !AppState.servicesContainer) return;
  
  const servicesList = AppState.translations.services?.items;
  if (!servicesList || !Array.isArray(servicesList)) return;

  // Vaciar contenedor
  AppState.servicesContainer.innerHTML = "";

  servicesList.forEach(service => {
    // Clonar contenido de la plantilla
    const clone = AppState.servicesTemplate.content.cloneNode(true);
    
    // Rellenar datos en la plantilla clonada
    const card = clone.querySelector(".service-card");
    const iconWrapper = clone.querySelector(".service-icon-wrapper");
    const title = clone.querySelector(".service-title");
    const desc = clone.querySelector(".service-desc");

    if (card) card.setAttribute("id", `service-${service.id}`);
    
    // Inyectar icono SVG correspondiente
    if (iconWrapper && SVGIcons[service.icon]) {
      iconWrapper.innerHTML = SVGIcons[service.icon];
    }
    
    if (title) title.textContent = service.title;
    if (desc) desc.textContent = service.description;

    // Agregar clase de animación
    const element = clone.querySelector(".reveal, .reveal-roller");
    if (element && !element.classList.contains("active")) {
      // Nos aseguramos de inicializarlo si no está activo
    }

    // Insertar en el DOM
    AppState.servicesContainer.appendChild(clone);
  });
  
  // Re-inicializar animaciones de scroll para los nuevos elementos
  setupScrollAnimations();
}

/**
 * Inicializa y controla el comportamiento del Formulario de Contacto
 */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const formAlert = document.getElementById("form-alert");
  
  if (!form) return;

  // Remover cualquier listener previo para evitar duplicaciones
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const t = AppState.translations.contact;
    const submitBtn = newForm.querySelector('button[type="submit"]');
    const submitBtnText = submitBtn.querySelector("span") || submitBtn;
    const originalText = submitBtnText.textContent;
    
    // Validaciones básicas
    const nameInput = newForm.querySelector("#name");
    const emailInput = newForm.querySelector("#email");
    const messageInput = newForm.querySelector("#message");
    
    if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
      showFormAlert(formAlert, t.form_error || "Por favor, completa todos los campos obligatorios.", "error");
      return;
    }

    // Efecto visual de envío (Premium Loading State)
    submitBtn.disabled = true;
    submitBtnText.textContent = t.form_sending || "Enviando...";
    
    // Simulamos petición asíncrona a Hostinger/servidor
    // En producción el cliente puede conectar este submit a un endpoint de Formspree, Web3Forms o un script PHP local en Hostinger.
    // Dejaremos el script preparado para que funcione limpiamente y simule un envío asíncrono premium.
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Éxito
      showFormAlert(formAlert, t.form_success || "¡Mensaje enviado con éxito!", "success");
      newForm.reset();
    } catch (err) {
      // Error
      showFormAlert(formAlert, t.form_error || "Error al enviar el formulario.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtnText.textContent = originalText;
    }
  });
}

function showFormAlert(alertEl, message, type) {
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `form-alert ${type}`;
  
  // Auto ocultar después de 6 segundos si es exitoso
  if (type === "success") {
    setTimeout(() => {
      alertEl.style.display = "none";
    }, 6000);
  }
}

/**
 * Configura las animaciones al hacer scroll usando Intersection Observer API
 */
let scrollObserver = null;
function setupScrollAnimations() {
  const revealElements = document.querySelectorAll(".reveal, .reveal-roller, .brush-title");
  if (revealElements.length === 0) return;

  // Desconectar observador existente si hay re-renderizado
  if (scrollObserver) {
    scrollObserver.disconnect();
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.10 // Activación temprana para mayor fluidez
  };

  scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Dejar de observar una vez animado
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    scrollObserver.observe(el);
  });
}

/**
 * Inicializa y controla el comportamiento del Chatbot de WhatsApp flotante interactivo
 */
function setupWhatsAppChatbot() {
  const triggerBtn = document.getElementById("whatsapp-chat-trigger");
  const chatWindow = document.getElementById("whatsapp-chat-window");
  const closeBtn = document.getElementById("whatsapp-chat-close");
  const chatBody = document.getElementById("chat-body");
  const chatOptions = document.getElementById("chat-options");
  const directLink = document.getElementById("whatsapp-direct-link");
  const badge = document.getElementById("chat-notification-badge");

  if (!triggerBtn || !chatWindow || !closeBtn || !chatBody || !chatOptions || !directLink) return;

  // Bandera para saber si el chat ya fue cargado al menos una vez en la sesión
  let isChatStarted = false;

  // Toggle abrir / cerrar ventana de chat
  triggerBtn.addEventListener("click", () => {
    const isOpen = chatWindow.classList.contains("open");
    
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Evitar que el clic en el botón cerrar active el trigger de apertura
    closeChat();
  });

  function openChat() {
    chatWindow.classList.add("open");
    chatWindow.setAttribute("aria-hidden", "false");
    triggerBtn.setAttribute("aria-expanded", "true");
    
    // Ocultar el badge de notificación cuando se abre el chat
    if (badge) {
      badge.style.display = "none";
    }

    // Inicializar chat con mensaje del bot si no se ha iniciado
    if (!isChatStarted) {
      initChatbotConversation();
    }
  }

  function closeChat() {
    chatWindow.classList.remove("open");
    chatWindow.setAttribute("aria-hidden", "true");
    triggerBtn.setAttribute("aria-expanded", "false");
  }

  // Inicializa la conversación con el bot
  function initChatbotConversation() {
    isChatStarted = true;
    chatBody.innerHTML = "";
    
    // Ocultar wrapper de acción final
    const actionWrapper = document.querySelector(".chat-action-wrapper");
    if (actionWrapper) actionWrapper.style.display = "none";

    // Mostrar typing
    showBotTyping();

    // Después de un pequeño retraso, inyectar mensaje de bienvenida
    setTimeout(() => {
      removeBotTyping();
      const t = AppState.translations.whatsapp_chatbot;
      if (t) {
        addChatMessage(t.welcome_msg, "bot");
        renderQuickOptions();
      }
    }, 800);
  }

  function renderQuickOptions() {
    const t = AppState.translations.whatsapp_chatbot;
    chatOptions.innerHTML = "";
    
    if (!t || !t.options) return;

    // Generar botones para cada opción
    Object.keys(t.options).forEach(key => {
      const optText = t.options[key];
      const btn = document.createElement("button");
      btn.className = "chat-option-btn";
      btn.textContent = optText;
      btn.setAttribute("data-opt-key", key);
      
      btn.addEventListener("click", () => {
        handleOptionClick(key, optText);
      });

      chatOptions.appendChild(btn);
    });
  }

  async function handleOptionClick(optionKey, optionText) {
    // 1. Vaciar opciones para que no haga clic de nuevo
    chatOptions.innerHTML = "";

    // 2. Inyectar respuesta del usuario
    addChatMessage(optionText, "user");

    // 3. Mostrar typing del bot
    showBotTyping();
    scrollChatToBottom();

    // 4. Esperar 1.2 segundos para responder
    await new Promise(resolve => setTimeout(resolve, 1200));
    removeBotTyping();

    // 5. Obtener respuesta del bot e inyectar
    const t = AppState.translations.whatsapp_chatbot;
    const responseSuffix = optionKey.replace("opt_", "resp_");
    const botResponse = t.responses[responseSuffix];
    addChatMessage(botResponse, "bot");
    scrollChatToBottom();

    // 6. Preparar enlace de WhatsApp personalizado y mostrar botón final
    const msgSuffix = optionKey.replace("opt_", "msg_");
    const wpMessage = t.wp_messages[msgSuffix];
    
    // Formatear enlace de WhatsApp API
    const phoneNumber = "17737299252"; // Teléfono de Oscar
    const encodedText = encodeURIComponent(wpMessage);
    directLink.setAttribute("href", `https://wa.me/${phoneNumber}?text=${encodedText}`);

    // Mostrar contenedor de acción final de WhatsApp
    const actionWrapper = document.querySelector(".chat-action-wrapper");
    if (actionWrapper) {
      actionWrapper.style.display = "block";
    }
    
    // Permitir reiniciar el flujo
    renderRestartOption();
    scrollChatToBottom();
  }

  function renderRestartOption() {
    const btn = document.createElement("button");
    btn.className = "chat-option-btn";
    btn.style.backgroundColor = "transparent";
    btn.style.color = "var(--text-muted)";
    btn.style.border = "1px dashed var(--border-color)";
    btn.style.marginTop = "8px";
    btn.textContent = AppState.currentLang === "es" ? "↺ Ver otras preguntas" : "↺ See other questions";
    
    btn.addEventListener("click", () => {
      initChatbotConversation();
    });

    chatOptions.appendChild(btn);
  }

  function addChatMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg ${sender}`;
    bubble.textContent = text;
    chatBody.appendChild(bubble);
  }

  // Simular typing
  function showBotTyping() {
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-msg bot typing-msg";
    typingBubble.id = "bot-typing-indicator";
    typingBubble.innerHTML = `
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatBody.appendChild(typingBubble);
  }

  function removeBotTyping() {
    const indicator = document.getElementById("bot-typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  function scrollChatToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Escuchar cambio de idioma
  document.addEventListener("languageChanged", () => {
    if (isChatStarted) {
      initChatbotConversation();
    }
  });
}

/**
 * Renderiza la grilla de proyectos del portafolio a partir del JSON de idioma
 */
function renderPortfolioGrid() {
  if (!AppState.portfolioTemplate || !AppState.portfolioContainer) return;

  const portfolioData = AppState.translations.portfolio;
  if (!portfolioData || !portfolioData.items || !Array.isArray(portfolioData.items)) return;

  // Guardar items en memoria
  AppState.portfolioItems = portfolioData.items;
  AppState.portfolioContainer.innerHTML = "";

  AppState.portfolioItems.forEach((project, idx) => {
    const clone = AppState.portfolioTemplate.content.cloneNode(true);

    const item = clone.querySelector(".portfolio-item");
    const img = clone.querySelector(".portfolio-img");
    const categorySpan = clone.querySelector(".portfolio-item-category");
    const title = clone.querySelector(".portfolio-item-title");

    if (item) {
      item.setAttribute("data-category", project.category);
      item.setAttribute("id", `project-${project.id}`);
      
      // Evento para abrir Lightbox al hacer clic
      item.addEventListener("click", () => {
        openLightbox(project.id);
      });
    }

    if (img) {
      img.src = project.image;
      img.alt = project.title;
    }

    if (categorySpan) {
      // Traducir categoría utilizando el diccionario del JSON
      const catName = portfolioData.categories[project.category] || project.category;
      categorySpan.textContent = catName;
    }

    if (title) {
      title.textContent = project.title;
    }

    AppState.portfolioContainer.appendChild(clone);
  });

  // Re-aplicar el filtro actual para mantener consistencia
  applyPortfolioFilter(AppState.activeFilter);
}

/**
 * Configura los botones de filtrado de categoría del Portafolio
 */
function setupPortfolioFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Quitar clase activa de todos
      filterButtons.forEach(b => b.classList.remove("active"));
      // Añadir al seleccionado
      btn.classList.add("active");
      
      const filter = btn.getAttribute("data-filter");
      applyPortfolioFilter(filter);
    });
  });
}

function applyPortfolioFilter(filter) {
  AppState.activeFilter = filter;
  const items = document.querySelectorAll("#portfolio-grid .portfolio-item");
  
  // Limpiar y poblar los ítems filtrados activos
  AppState.filteredItems = AppState.portfolioItems.filter(item => filter === "all" || item.category === filter);

  if (portfolioViewMode === 'grid') {
    items.forEach(item => {
      const itemCat = item.getAttribute("data-category");
      if (filter === "all" || itemCat === filter) {
        item.classList.remove("fade-out");
        item.classList.add("fade-in");
      } else {
        item.classList.remove("fade-in");
        item.classList.add("fade-out");
      }
    });
    
    // Re-inicializar Intersection Observer y los efectos de inclinación 3D
    setupScrollAnimations();
    setupTiltEffects();
  } else {
    // Si estamos en modo carrusel, re-renderizar el carrusel con el nuevo filtro
    renderPortfolioCarousel3D();
  }
}

/**
 * Inicializa y asocia los eventos del visor de imágenes Lightbox
 */
function setupLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!modal || !closeBtn || !prevBtn || !nextBtn) return;

  // Cerrar Lightbox
  closeBtn.addEventListener("click", closeLightbox);
  
  // Cerrar al hacer clic en el fondo fuera del contenedor principal de la imagen
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  // Navegar
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });

  // Controles de teclado para accesibilidad premium
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      navigateLightbox(-1);
    } else if (e.key === "ArrowRight") {
      navigateLightbox(1);
    }
  });
}

function openLightbox(projectId) {
  const modal = document.getElementById("lightbox-modal");
  if (!modal) return;

  // Encontrar el índice del proyecto dentro de la lista de ítems filtrados actualmente
  const index = AppState.filteredItems.findIndex(item => item.id === projectId);
  if (index === -1) return;

  AppState.currentLightboxIndex = index;
  showLightboxImage(index);

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Desactivar scroll de fondo
}

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // Re-activar scroll
}

function navigateLightbox(direction) {
  const total = AppState.filteredItems.length;
  if (total <= 1) return;

  let newIndex = AppState.currentLightboxIndex + direction;
  
  // Efecto loop circular
  if (newIndex >= total) {
    newIndex = 0;
  } else if (newIndex < 0) {
    newIndex = total - 1;
  }

  showLightboxImage(newIndex);
}

function showLightboxImage(index) {
  const imgEl = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-title");
  const descEl = document.getElementById("lightbox-desc");
  
  const project = AppState.filteredItems[index];
  if (!project || !imgEl) return;

  AppState.currentLightboxIndex = index;

  // Pequeña animación de transición al cambiar de imagen (Premium UX)
  imgEl.style.opacity = "0.2";
  imgEl.style.transform = "scale(0.98)";
  imgEl.style.transition = "opacity 0.2s, transform 0.2s";

  setTimeout(() => {
    imgEl.src = project.image;
    imgEl.alt = project.title;
    if (descEl) descEl.textContent = project.description;
    
    imgEl.style.opacity = "1";
    imgEl.style.transform = "scale(1)";
  }, 180);
}

function setupBeforeAfterSlider() {
  const container = document.getElementById('before-after-container');
  const slider = document.getElementById('before-after-slider');
  const rangeInput = document.getElementById('slider-range-input');
  
  if (!container || !slider || !rangeInput) return;
  
  // Función central para actualizar el deslizamiento de forma consistente
  function updateSlider(val) {
    const clampedVal = Math.max(0, Math.min(100, val));
    slider.style.setProperty('--clip-percent', `${100 - clampedVal}%`);
    slider.style.setProperty('--handle-left', `${clampedVal}%`);
    rangeInput.value = clampedVal;
  }

  // Escuchar el input deslizante para escritorio
  rangeInput.addEventListener('input', (e) => {
    updateSlider(e.target.value);
  });

  // Manejo de eventos táctiles para soporte móvil robusto (táctil directo)
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const rect = container.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const percent = (touchX / rect.width) * 100;
      updateSlider(percent);
      
      // Evitar el scroll vertical de la página mientras se interactúa con el slider
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const rect = container.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const percent = (touchX / rect.width) * 100;
      updateSlider(percent);
    }
  }, { passive: true });
}

/**
 * Selector de Modos del Portafolio: Grilla 3D / Carrusel 3D (Opción 3)
 */
let portfolioViewMode = "grid"; 
let currentCarouselIndex = 0;

function setupPortfolioModeSelector() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  const gridContainer = document.getElementById('portfolio-grid');
  const carouselContainer = document.getElementById('portfolio-carousel-3d');
  
  if (modeButtons.length === 0 || !gridContainer || !carouselContainer) return;
  
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      portfolioViewMode = btn.getAttribute('data-mode');
      
      if (portfolioViewMode === 'grid') {
        gridContainer.style.display = 'grid';
        carouselContainer.classList.remove('active');
        // Renderizar la grilla y re-aplicar filtros
        renderPortfolioGrid();
      } else {
        gridContainer.style.display = 'none';
        carouselContainer.classList.add('active');
        // Renderizar el carrusel 3D
        renderPortfolioCarousel3D();
      }
    });
  });
}

/**
 * Efecto de Tarjetas con Inclinación 3D e Brillo (Opción 2)
 */
function setupTiltEffects() {
  if (portfolioViewMode !== 'grid') return;
  
  const items = document.querySelectorAll('#portfolio-grid .portfolio-item');
  items.forEach(item => {
    let glare = item.querySelector('.glare-overlay');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'glare-overlay';
      item.appendChild(glare);
    }
    
    // Resetear al salir
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)';
    });
    
    // Inclinar en movimiento
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;  
      
      const width = rect.width;
      const height = rect.height;
      
      // Ángulo de rotación máximo de 10 grados
      const rotX = ((height / 2) - y) / (height / 2) * 10;
      const rotY = (x - (width / 2)) / (width / 2) * 10;
      
      // Brillo radial dinámico
      const glareX = (x / width) * 100;
      const glareY = (y / height) * 100;
      
      item.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)`;
    });
  });
}

/**
 * Renderiza el Carrusel 3D Coverflow (Opción 3)
 */
function renderPortfolioCarousel3D() {
  const container = document.getElementById('carousel-inner-3d');
  const template = document.getElementById('portfolio-card-template');
  
  if (!container || !template) return;
  
  container.innerHTML = "";
  currentCarouselIndex = 0;
  
  const activeItems = AppState.filteredItems;
  if (activeItems.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); padding:40px;" data-i18n="portfolio.no_items">No hay proyectos en esta categoría.</p>`;
    return;
  }
  
  activeItems.forEach((project, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-item-3d';
    wrapper.setAttribute('data-index', idx);
    wrapper.setAttribute('data-project-id', project.id);
    
    // Clonar plantilla del portafolio
    const clone = template.content.cloneNode(true);
    const item = clone.querySelector('.portfolio-item');
    const img = clone.querySelector('.portfolio-img');
    const categorySpan = clone.querySelector('.portfolio-item-category');
    const title = clone.querySelector('.portfolio-item-title');
    
    if (img) img.src = project.image;
    if (categorySpan) categorySpan.textContent = AppState.translations.portfolio.categories[project.category] || project.category;
    if (title) title.textContent = project.title;
    
    if (item) {
      item.classList.remove('reveal', 'reveal-roller'); // Evita conflicto de reveal
      
      // Al hacer click, si es el activo abre lightbox, si no, gira
      wrapper.addEventListener('click', () => {
        if (idx === currentCarouselIndex) {
          openLightbox(project.id);
        } else {
          currentCarouselIndex = idx;
          updateCarousel3DPositions();
        }
      });
    }
    
    wrapper.appendChild(clone);
    container.appendChild(wrapper);
  });
  
  // Asignar controladores de navegación
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  
  if (prevBtn && nextBtn) {
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    
    newPrev.addEventListener('click', () => navigateCarousel3D(-1));
    newNext.addEventListener('click', () => navigateCarousel3D(1));
  }
  
  updateCarousel3DPositions();
}

/**
 * Calcula y aplica las coordenadas tridimensionales en base al elemento activo
 */
function updateCarousel3DPositions() {
  const items = document.querySelectorAll('.carousel-item-3d');
  const total = items.length;
  if (total === 0) return;
  
  items.forEach((item) => {
    const idx = parseInt(item.getAttribute('data-index'));
    item.classList.remove('active-item', 'visible');
    
    let offset = idx - currentCarouselIndex;
    
    // Tratamiento circular para rotación infinita
    if (offset < -1 && offset < -(total / 2)) {
      offset += total;
    } else if (offset > 1 && offset > total / 2) {
      offset -= total;
    }
    
    if (offset === 0) {
      // Centro activo (Frontal)
      item.style.transform = 'translateX(0) translateZ(100px) rotateY(0deg)';
      item.style.opacity = '1';
      item.style.zIndex = '5';
      item.classList.add('active-item', 'visible');
    } else if (offset === 1) {
      // Derecha
      item.style.transform = 'translateX(240px) translateZ(10px) rotateY(-35deg)';
      item.style.opacity = '0.75';
      item.style.zIndex = '3';
      item.classList.add('visible');
    } else if (offset === -1) {
      // Izquierda
      item.style.transform = 'translateX(-240px) translateZ(10px) rotateY(35deg)';
      item.style.opacity = '0.75';
      item.style.zIndex = '3';
      item.classList.add('visible');
    } else {
      // Fondo (Ocultos)
      item.style.transform = `translateX(${offset * 120}px) translateZ(-150px) rotateY(0deg)`;
      item.style.opacity = '0';
      item.style.zIndex = '1';
    }
  });
}

/**
 * Rotación del carrusel 3D
 */
function navigateCarousel3D(direction) {
  const items = document.querySelectorAll('.carousel-item-3d');
  const total = items.length;
  if (total <= 1) return;
  
  currentCarouselIndex = (currentCarouselIndex + direction + total) % total;
  updateCarousel3DPositions();
}
