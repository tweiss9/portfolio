let recaptchaResponse = '';

function onRecaptchaCompleted(response) {
  recaptchaResponse = response;
  fetch("/verify-recaptcha", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recaptchaResponse }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("myForm").submit();
      } else {
        console.error("reCAPTCHA validation failed");
      }
    })
    .catch((error) => {
      console.error("Error verifying reCAPTCHA:", error);
    });
}

function scrollToSection(sectionId) {
  const targetSection = document.querySelector(sectionId);
  targetSection.scrollIntoView({ behavior: "smooth" });
}

function handleSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");

  let isValid = true;
  isValid =
    toggleValidation(nameInput, !nameInput.value.trim(), "nameError") &&
    isValid;
  isValid =
    toggleValidation(
      emailInput,
      !emailInput.value.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()),
      "emailError"
    ) && isValid;
  isValid =
    toggleValidation(
      messageInput,
      !messageInput.value.trim(),
      "messageError"
    ) && isValid;

  if (!isValid) return;

  if (!recaptchaResponse) {
    // todo Show an error message
    console.error("Please complete the reCAPTCHA challenge.");
    return;
  }

  const formData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    message: messageInput.value.trim(),
    recaptchaResponse: recaptchaResponse,
  };

  showLoadingSpinner();

  fetch("/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      hideLoadingSpinner();
      showSuccessMessage();
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      hideLoadingSpinner();
    });

  setTimeout(() => {
    document.getElementById("myForm").reset();
  }, 2000);
}

function toggleValidation(inputField, condition, errorFieldId) {
  const errorField = document.getElementById(errorFieldId);
  if (condition) {
    inputField.classList.add("is-invalid");
    errorField.style.display = "block";
    return false;
  } else {
    inputField.classList.remove("is-invalid");
    errorField.style.display = "none";
    return true;
  }
}

function showLoadingSpinner() {
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.classList.remove("d-none");
}

function hideLoadingSpinner() {
  const loadingMessage = document.getElementById("loadingMessage");
  loadingMessage.classList.add("d-none");
}

function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage");
  successMessage.classList.remove("d-none");
  setTimeout(() => {
    successMessage.classList.add("d-none");
  }, 2000);
}

document.addEventListener("DOMContentLoaded", function () {
  // todo Add reCAPTCHA
  const recaptchaSiteKey = "site-key-here";
  const recaptchaDiv = document.querySelector(".g-recaptcha");
  recaptchaDiv.setAttribute("data-sitekey", recaptchaSiteKey);

  const recaptchaScript = document.createElement("script");
  recaptchaScript.src = "https://www.google.com/recaptcha/api.js";
  recaptchaScript.async = true;
  recaptchaScript.defer = true;
  document.body.appendChild(recaptchaScript);

  const submitButton = document.getElementById("submitButton");
  submitButton.addEventListener("click", handleSubmit);
});
