function scrollToSection(sectionId) {
  const targetSection = document.querySelector(sectionId);
  targetSection.scrollIntoView({ behavior: "smooth" });
}

function handleSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (!name.trim() || !email.trim() || !message.trim()) {
    showError("name", !name.trim() ? "Please enter your name." : "");
    showError("email", !email.trim() ? "Please enter your email address." : "");
    showError("message", !message.trim() ? "Please enter a message." : "");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showError("email", "Please enter a valid email address.");
    return;
  }

  hideError("name");
  hideError("email");
  hideError("message");

  showSuccessMessage();
  setTimeout(() => {
    document.getElementById("myForm").reset();
  }, 1000);
}

function showError(fieldId, errorMessage) {
  const inputField = document.getElementById(fieldId);
  const errorField = inputField.nextElementSibling;
  errorField.textContent = errorMessage;
  errorField.style.display = errorMessage ? "block" : "none";
}

function hideError(fieldId) {
  const inputField = document.getElementById(fieldId);
  const errorField = inputField.nextElementSibling;
  errorField.style.display = "none";
}

function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage");
  successMessage.classList.remove("d-none");
  setTimeout(() => {
    successMessage.classList.add("d-none");
  }, 2000);
}
