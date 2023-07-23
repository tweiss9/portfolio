function scrollToSection(sectionId) {
  const targetSection = document.querySelector(sectionId);
  targetSection.scrollIntoView({ behavior: "smooth" });
}

function handleSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (!name || !email || !message) {
    alert("Please fill in all the required fields.");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showError("email", "Please enter a valid email address.");
    return;
  }

  hideError("email");

  // Code to send the email or perform other actions on valid form submission
  // For this example, we'll display a success message for 5 seconds
  showSuccessMessage();
}

function showError(fieldId, errorMessage) {
  const inputField = document.getElementById(fieldId);
  const errorField = inputField.nextElementSibling;
  errorField.textContent = errorMessage;
  errorField.style.display = "block";
}

function hideError(fieldId) {
  const inputField = document.getElementById(fieldId);
  const errorField = inputField.nextElementSibling;
  errorField.style.display = "none";
}

function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage");
  successMessage.style.display = "block";
  setTimeout(() => {
    successMessage.style.display = "none";
    document.getElementById("myForm").reset();
  }, 5000);
}