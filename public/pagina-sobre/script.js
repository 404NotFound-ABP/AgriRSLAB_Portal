const translations = {
  pt: {
    "hero.title":"O AgrIRS Lab é um laboratório vinculado a Divisão de Observação da Terra e Geoinformática (DIOTG) do Instituto Nacional de Pesquisas Espaciais (INPE).",
    "hero.subtitle": "Somos um laboratório de sensoriamento remoto com foco na agricultura, estudando e monitorando cultivos agrícolas com o apoio de imagens de satélite e dados geoespaciais.Também desenvolvemos pesquisas em áreas ambientais e sociais, como detecção do desmatamento e mudanças no uso e cobertura da terra.Buscamos conectar tecnologia, ciência e responsabilidade socioambiental para gerar conhecimento e apoiar a tomada de decisões.",
  },
  en: {
    "hero.title": "Welcome to our websiteThe AgrIRS Lab is a laboratory linked to the Earth Observation and Geoinformatics Division (DIOTG) of the National Institute for Space Research (INPE).",
    "hero.subtitle": "We are a remote sensing laboratory focused on agriculture, studying and monitoring agricultural crops with the support of satellite imagery and geospatial data. We also conduct research in environmental and social areas, such as deforestation detection and changes in land use and land cover. We seek to connect technology, science, and socio-environmental responsibility to generate knowledge and support decision-making.Simple solutions for your business",
  }
};
 
let currentLang = "pt";
 
function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang; // <html lang="pt">
  document
    .querySelectorAll("[data-i18n]")
    .forEach(el => {
      const key = el.getAttribute("data-i18n");
      const text = translations[lang][key];
      if (text) el.textContent = text;
    });
  localStorage.setItem("lang", lang);
}
 
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("lang");
  setLanguage(saved || "pt");
});
 