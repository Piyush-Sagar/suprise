const steps = [
  ["Try to look surprised.", "Unwrap it"],
  ["Who used this much tape?", "Pull a little harder"],
  ["Yep. More wrapping.", "Lift the lid"],
  ["Happy now?", "Peek inside"],
];
const wrapping = document.querySelector("#wrapping");
const surprise = document.querySelector("#surprise");
const gift = document.querySelector("#gift");
const movie = document.querySelector("#movie");
const note = document.querySelector("#video-note");
const editor = document.querySelector("#editor");
const recipient = document.querySelector("#recipient");
const photo = document.querySelector("#photo");
const save = document.querySelector("#save");
const photoError = document.querySelector("#photo-error");
const storageKey = "birthday-gift.personalization.v1";
let personal = { name: "", photo: "" };
let draftPhoto = "";
let selection = 0;
let stage = 0;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (typeof saved?.name === "string" && typeof saved.photo === "string") {
    personal = { name: saved.name.slice(0, 48), photo: saved.photo };
  }
} catch { /* The gift can also be personalized for just this visit. */ }

function renderGift() {
  const [quip, action] = steps[stage];
  document.querySelector("#quip").textContent = stage === 0 && personal.name
    ? `Try to look surprised, ${personal.name}.`
    : quip;
  document.querySelector("#tag").hidden = !personal.photo;
  const portrait = document.querySelector("#portrait");
  if (personal.photo) portrait.src = personal.photo;
  else portrait.removeAttribute("src");
  document.querySelector("#action").textContent = action;
  drawGiftScene(stage);
}

gift.addEventListener("click", () => {
  if (stage === steps.length) return;
  stage++;
  if (stage < steps.length) {
    renderGift();
    return;
  }
  wrapping.hidden = true;
  surprise.hidden = false;
  movie.focus();
  movie.play().catch(error => {
    if (surprise.hidden || error.name === "AbortError") return;
    note.textContent = error.name === "NotAllowedError"
      ? "Press play for your surprise."
      : "Your browser couldn't play the birthday video.";
    note.hidden = false;
  });
});
movie.addEventListener("playing", () => { note.hidden = true; });
document.querySelector("#restart").addEventListener("click", () => {
  movie.pause();
  movie.currentTime = 0;
  surprise.hidden = true;
  note.hidden = true;
  wrapping.hidden = false;
  stage = 0;
  renderGift();
  gift.focus();
});
renderGift();

function showDraftPhoto(value) {
  draftPhoto = value;
  const thumbnail = document.querySelector("#thumbnail");
  if (value) thumbnail.src = value;
  else thumbnail.removeAttribute("src");
  document.querySelector("#photo-preview").hidden = !value;
}

document.querySelector("#personalize").addEventListener("click", () => {
  recipient.value = personal.name;
  photo.value = "";
  photoError.hidden = true;
  save.disabled = false;
  showDraftPhoto(personal.photo);
  editor.showModal();
  recipient.focus();
});

document.querySelector("#cancel").addEventListener("click", () => editor.close());
editor.addEventListener("close", () => { selection++; });

document.querySelector("#remove-photo").addEventListener("click", () => {
  selection++;
  photo.value = "";
  showDraftPhoto("");
  photoError.hidden = true;
  save.disabled = false;
});

photo.addEventListener("change", async () => {
  const file = photo.files[0];
  if (!file) return;
  const request = ++selection;
  const url = URL.createObjectURL(file);
  save.disabled = true;
  photoError.hidden = true;
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (request !== selection) return;
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(side, 320);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff8f1";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2,
      side, side, 0, 0, canvas.width, canvas.height);
    showDraftPhoto(canvas.toDataURL("image/jpeg", .86));
  } catch {
    if (request !== selection) return;
    photo.value = "";
    photoError.textContent = "That photo couldn't be opened. Try a JPG or PNG.";
    photoError.hidden = false;
  } finally {
    URL.revokeObjectURL(url);
    if (request === selection) save.disabled = false;
  }
});

document.querySelector("#gift-form").addEventListener("submit", event => {
  event.preventDefault();
  if (save.disabled) return;
  personal = { name: recipient.value.trim(), photo: draftPhoto };
  try {
    localStorage.setItem(storageKey, JSON.stringify(personal));
  } catch { /* In-memory changes still apply for this visit. */ }
  renderGift();
  editor.close();
  gift.focus();
});
