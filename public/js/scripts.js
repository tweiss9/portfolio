function scrollToSection(sectionId) {
  const targetSection = document.querySelector(sectionId);
  targetSection.scrollIntoView({ behavior: "smooth" });
}

function handleSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    showError("name", !name ? "Please enter your name." : "");
    showError("email", !email ? "Please enter your email address." : "");
    showError("message", !message ? "Please enter a message." : "");
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

  showLoadingSpinner();

  fetch('/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, message }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      hideLoadingSpinner();
      showSuccessMessage();
    })
    .catch(error => {
      console.error('Error sending email:', error);
      hideLoadingSpinner();
    });

  setTimeout(() => {
    document.getElementById("myForm").reset();
  }, 2000);
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

function showLoadingSpinner() {
  const loadingMessage = document.getElementById('loadingMessage');
  loadingMessage.classList.remove('d-none');
}


function hideLoadingSpinner() {
  const loadingMessage = document.getElementById('loadingMessage');
  loadingMessage.classList.add('d-none');
}

function showSuccessMessage() {
  const successMessage = document.getElementById('successMessage');
  successMessage.classList.remove('d-none');
  setTimeout(() => {
    successMessage.classList.add('d-none');
  }, 2000);
}
