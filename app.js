const form = document.getElementById("inscription-form");
const errorBox = document.getElementById("form-error");
const fileInput = document.getElementById("piece");
const pieceName = document.getElementById("piece-name");
const btnValider = document.getElementById("btn-valider");

function isSociete() {
  return form.elements.type.value === "societe";
}

function updateType() {
  const societe = isSociete();
  document.getElementById("field-prenom").classList.toggle("hidden", societe);
  document.getElementById("field-date").classList.toggle("hidden", societe);
  document.getElementById("field-lieu").classList.toggle("hidden", societe);
  document.getElementById("field-profession").classList.toggle("hidden", societe);
  document.getElementById("field-rcs").classList.toggle("hidden", !societe);
  document.getElementById("prenom").required = !societe;
  document.getElementById("dateNaissance").required = !societe;
  document.getElementById("lieuNaissance").required = !societe;
  document.getElementById("rcs").required = societe;
  document.getElementById("label-nom").textContent = societe ? "Dénomination sociale *" : "Nom *";
  document.getElementById("label-adresse").textContent = societe ? "Siège social *" : "Adresse *";
}

Array.from(form.elements.type).forEach((el) => el.addEventListener("change", updateType));
updateType();

document.getElementById("next-url").value = new URL("confirmation.html", window.location.href).href;

document.getElementById("btn-joindre").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  pieceName.hidden = !file;
  pieceName.textContent = file ? file.name : "";
});

function showError(message) {
  errorBox.hidden = !message;
  errorBox.textContent = message || "";
}

form.addEventListener("reset", () => {
  showError("");
  pieceName.hidden = true;
  setTimeout(updateType, 0);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showError("");
  if (form.elements._honey && form.elements._honey.value) return;
  if (!form.reportValidity()) {
    showError("Merci de compléter les champs obligatoires.");
    return;
  }
  const file = fileInput.files[0];
  if (!file) {
    showError(isSociete() ? "Joignez un extrait KBis." : "Joignez une copie de pièce d’identité.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError("La pièce jointe ne doit pas dépasser 10 Mo.");
    return;
  }

  document.getElementById("replyto").value = form.email.value.trim();
  btnValider.disabled = true;
  btnValider.textContent = "Envoi en cours…";
  form.submit();
});
