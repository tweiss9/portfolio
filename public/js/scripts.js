let recaptchaResponse = "";
let recaptchaSuccess = "";
let recaptchaSiteKey;
let recaptchaInitialized = false;
const prefix = "https://us-central1-tylerhweiss.cloudfunctions.net/api";

window.addEventListener("cspviolation", handleCSPViolation);
window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem("recaptchaRendered");
});

document.addEventListener("DOMContentLoaded", function () {
  const navigationLinks = document.querySelectorAll(".nav-link");
  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const sectionId = link.getAttribute("href");
      scrollToSection(sectionId);
    });
  });

  fetch(prefix + "/get-site-key")
    .then((response) => response.json())
    .then((data) => {
      recaptchaSiteKey = data.recaptchaSiteKey;
      const recaptchaDiv = document.querySelector(".g-recaptcha");
      recaptchaDiv.setAttribute("data-sitekey", recaptchaSiteKey);
      const submitButton = document.getElementById("submitButton");
      submitButton.addEventListener("click", handleSubmit);

      initializeRecaptcha().catch((error) => {
        console.error("Error initializing reCAPTCHA:", error);
      });
    })
    .catch((error) => {
      console.error("Error fetching reCAPTCHA site key:", error);
    });
});

function initializeRecaptcha() {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === "undefined") {
      loadRecaptchaScript()
        .then(() => {
          grecaptcha.ready(() => {
            try {
              grecaptcha.render("recaptchaDiv", {
                sitekey: recaptchaSiteKey,
                callback: onRecaptchaCompleted,
                "error-callback": onRecaptchaError,
              });

              resolve();
            } catch (error) {
              reject(error);
            }
          });
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      grecaptcha.ready(() => {
        try {
          grecaptcha.render("recaptchaDiv", {
            sitekey: recaptchaSiteKey,
            callback: onRecaptchaCompleted,
            "error-callback": onRecaptchaError,
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}

function loadRecaptchaScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
}


function onRecaptchaError(error) {
  console.error("Error during reCAPTCHA verification.", error);
  recaptchaSuccess = false;
}

function onRecaptchaCompleted(response) {
  recaptchaResponse = response;
  fetch(prefix + `/verify-recaptcha?recaptchaResponse=${recaptchaResponse}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        recaptchaSuccess = true;
        console.log("reCAPTCHA validation successful!");
        if (
          !document
            .getElementById("recaptchaError")
            .classList.contains("d-none")
        ) {
          document.getElementById("recaptchaError").classList.add("d-none");
          document.getElementById("recaptchaError").style.display = "block";
        }
      } else {
        recaptchaSuccess = false;
        console.error("reCAPTCHA validation failed:", data.error);
      }
    })
    .catch((error) => {
      onRecaptchaError(error);
    });
}

function scrollToSection(sectionId) {
  const targetSection = document.querySelector(sectionId);
  const navbarHeight = document.querySelector(".navbar").offsetHeight;
  const targetPosition =
    targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
  window.scrollTo({ top: targetPosition, behavior: "smooth" });
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
  isValid =
    toggleValidation(
      document.querySelector(".g-recaptcha"),
      !recaptchaResponse,
      "recaptchaError"
    ) && isValid;

  if (!isValid) return;

  const formData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    message: messageInput.value.trim(),
  };

  showLoadingSpinner();

  fetch(prefix + "/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then(() => {
      hideLoadingSpinner();
      console.log("Email sent successfully!");
      showSuccessMessage();
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      hideLoadingSpinner();
    });

  setTimeout(() => {
    document.getElementById("myForm").reset();
    grecaptcha.reset();
    recaptchaResponse = "";
    recaptchaSuccess = false;
  }, 2000);
}

function toggleValidation(inputField, condition, errorFieldId) {
  const errorField = document.getElementById(errorFieldId);

  if (inputField.classList.contains("g-recaptcha")) {
    const recaptchaErrorElement = document.getElementById("recaptchaError");
    if (!recaptchaResponse && !recaptchaSuccess) {
      recaptchaErrorElement.classList.remove("d-none");
      recaptchaErrorElement.style.display = "block";
      return false;
    } else {
      return true;
    }
  } else if (condition) {
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

function handleCSPViolation(event) {
  console.log("CSP Violation Report:", event);
}
