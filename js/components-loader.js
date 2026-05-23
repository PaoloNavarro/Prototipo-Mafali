/**
 * components-loader.js - Cargador modular de componentes comunes para Mafali Bros
 * Carga asíncronamente Navbar y Footer compartidos para reusabilidad en múltiples páginas.
 */

document.addEventListener("DOMContentLoaded", () => {
  loadCommonComponents();
});

async function loadCommonComponents() {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");
  const whatsappPlaceholder = document.getElementById("whatsapp-placeholder");

  const loadPromises = [];

  // Cargar Navbar
  if (navbarPlaceholder) {
    loadPromises.push(
      fetchComponent("components/navbar.html", navbarPlaceholder)
        .then(() => {
          initializeNavbarLogic();
        })
        .catch(err => console.error("Error al cargar la navbar:", err))
    );
  }

  // Cargar Footer
  if (footerPlaceholder) {
    loadPromises.push(
      fetchComponent("components/footer.html", footerPlaceholder)
        .then(() => {
          updateFooterYear();
        })
        .catch(err => console.error("Error al cargar el footer:", err))
    );
  }

  // Cargar Chatbot de WhatsApp
  if (whatsappPlaceholder) {
    loadPromises.push(
      fetchComponent("components/whatsapp.html", whatsappPlaceholder)
        .catch(err => console.error("Error al cargar el chatbot de WhatsApp:", err))
    );
  }

  // Cuando todos los componentes se hayan cargado, notificar al script principal
  try {
    await Promise.all(loadPromises);
    // Despachar evento personalizado para notificar que los componentes están listos en el DOM
    const event = new CustomEvent("componentsLoaded");
    document.dispatchEvent(event);
  } catch (error) {
    console.error("Error en la carga coordinada de componentes:", error);
  }
}

/**
 * Realiza fetch de un fragmento HTML y lo inyecta en el contenedor
 */
async function fetchComponent(url, container) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} en ${url}`);
    }
    const htmlContent = await response.text();
    container.innerHTML = htmlContent;
  } catch (error) {
    container.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error loading component: ${url}</div>`;
    throw error;
  }
}

/**
 * Inicializa el comportamiento de la Navbar (menú hamburguesa y efecto scroll)
 */
function initializeNavbarLogic() {
  const toggleBtn = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  
  if (toggleBtn && navMenu) {
    // Abrir/cerrar menú hamburguesa
    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", !isExpanded);
      toggleBtn.classList.toggle("open");
      navMenu.classList.toggle("open");
    });

    // Cerrar menú al hacer clic en un enlace (ideal para móviles/on-page links)
    const navLinks = navMenu.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        toggleBtn.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("open");
        
        // Actualizar clase activa
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }

  // Efecto Sticky en Header al hacer scroll
  const header = document.querySelector("header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
    
    // Ejecutar una vez al inicio por si ya hay scroll previo
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    }
  }
}

/**
 * Actualiza el año de derechos de autor dinámicamente en el footer
 */
function updateFooterYear() {
  const copyrightText = document.querySelector(".copyright-text");
  if (copyrightText) {
    const currentYear = new Date().getFullYear();
    // Guardamos la plantilla original de traducción para no perder el token {year}
    // El script de traducción se encargará de reemplazarlo, pero aquí ponemos una
    // solución rápida si se requiere inicializar antes de que llegue la traducción.
    copyrightText.innerHTML = copyrightText.innerHTML.replace("{year}", currentYear);
  }
}
