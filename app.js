const EMAIL = "stephane.chicouri@gmail.com";
const form = document.getElementById("inscription-form");
const errorBox = document.getElementById("form-error");
const recap = document.getElementById("recap");
const recapCard = document.getElementById("recap-card");
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");
  if (form.elements.website.value) return;
  if (!form.reportValidity()) {
    showError("Merci de compléter les champs obligatoires.");
    return;
  }
  const file = fileInput.files[0];
  if (!file) {
    showError(isSociete() ? "Joignez un extrait KBis." : "Joignez une copie de pièce d’identité.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showError("La pièce jointe ne doit pas dépasser 8 Mo.");
    return;
  }

  const societe = isSociete();
  const data = {
    type: societe ? "Société" : "Personne physique",
    nom: form.nom.value.trim(),
    prenom: societe ? "" : form.prenom.value.trim(),
    dateNaissance: societe ? "" : form.dateNaissance.value,
    lieuNaissance: societe ? "" : form.lieuNaissance.value.trim(),
    nationalite: form.nationalite.value.trim(),
    profession: societe ? "" : form.profession.value.trim(),
    adresse: form.adresse.value.trim(),
    rcs: societe ? form.rcs.value.trim() : "",
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim(),
    piece: file.name,
  };

  const payload = new FormData();
  payload.append("_subject", "Inscription action collective — 78 avenue des Champs-Élysées");
  payload.append("_template", "table");
  payload.append("_captcha", "false");
  payload.append("_replyto", data.email);
  Object.entries(data).forEach(([key, value]) => payload.append(key, value));
  payload.append(
    "message",
    Object.entries(data)
      .map(([k, v]) => `${k} : ${v}`)
      .join("\n"),
  );
  payload.append("attachment", file, file.name);

  btnValider.disabled = true;
  btnValider.textContent = "Envoi en cours…";
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
    });
    if (!response.ok) throw new Error("send");
    recapCard.innerHTML = Object.entries(data)
      .filter(([, v]) => v)
      .map(([k, v]) => `<p><strong>${k}</strong> — ${v}</p>`)
      .join("");
    recap.classList.remove("hidden");
    recap.scrollIntoView({ behavior: "smooth" });
  } catch {
    showError("L’envoi de l’e-mail a échoué. Réessayez dans un instant.");
  } finally {
    btnValider.disabled = false;
    btnValider.textContent = "VALIDER";
  }
});
