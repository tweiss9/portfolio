function scrollToSection(sectionId) {
    const targetSection = document.querySelector(sectionId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }