const steps = [
  ["Try to look surprised.", "Unwrap it"],
  ["Who used this much tape?", "Pull a little harder"],
  ["Yep. More wrapping.", "Lift the lid"],
  ["Happy now?", "Peek inside"],
];
const giftFrames = ["gift1.png", "gift2.png", "gift3.png", "gift4.png"];
giftFrames.slice(1).forEach(src => { new Image().src = src; });

const byId = id => document.getElementById(id);
const gift = byId("gift");
const movie = byId("movie");
const editor = byId("editor");
const form = byId("gift-form");
const recipient = byId("recipient");
const photo = byId("photo");
const save = byId("save");
const storageKey = "birthday-gift.personalization.v1";
let draftPhoto = "";
let selection = 0;
let stage = 0;

// The fragment travels with the link. Static hosts never receive the name or photo.
function readSharedGift() {
  const fields = new URLSearchParams(location.hash.slice(1));
  const name = fields.get("name")?.trim();
  if (fields.get("gift") !== "1" || !name || name.length > 48) return null;
  const data = fields.get("photo") || "";
  let picture = "";
  if (/^[wj][A-Za-z0-9_-]{1,2100}$/.test(data)) {
    const mime = data[0] === "w" ? "image/webp" : "image/jpeg";
    const base64 = data.slice(1).replace(/-/g, "+").replace(/_/g, "/");
    picture = "data:" + mime + ";base64," + base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  }
  return { name, photo: picture };
}

let shared;
function loadGift() {
  shared = readSharedGift();
  byId("personalize").hidden = Boolean(shared);
  byId("greeting").hidden = !shared;
  byId("birthday-wish").textContent = shared ? `Happy birthday, ${shared.name}!` : "";
  const portrait = byId("birthday-photo");
  if (shared?.photo) portrait.src = shared.photo;
  else portrait.removeAttribute("src");
  portrait.hidden = !shared?.photo;
}
loadGift();

function renderGift() {
  const [quip, action] = steps[stage];
  byId("quip").textContent = quip;
  byId("action").textContent = action;
  byId("gift-box").src = giftFrames[stage];
}

gift.addEventListener("click", () => {
  if (stage === steps.length) return;
  if (++stage < steps.length) {
    renderGift();
    return;
  }
  byId("wrapping").hidden = true;
  byId("surprise").hidden = false;
  (shared ? byId("birthday-wish") : movie).focus();
  movie.play().catch(error => {
    if (byId("surprise").hidden || error.name === "AbortError") return;
    byId("video-note").textContent = error.name === "NotAllowedError"
      ? "Press play for your surprise."
      : "Your browser couldn't play the birthday video.";
    byId("video-note").hidden = false;
  });
});
movie.addEventListener("playing", () => { byId("video-note").hidden = true; });
function restartGift() {
  movie.pause();
  movie.currentTime = 0;
  byId("surprise").hidden = true;
  byId("video-note").hidden = true;
  byId("wrapping").hidden = false;
  stage = 0;
  renderGift();
  gift.focus();
}
byId("restart").addEventListener("click", restartGift);
window.addEventListener("hashchange", () => {
  if (editor.open) editor.close();
  loadGift();
  restartGift();
});
renderGift();

function showDraftPhoto(value) {
  draftPhoto = value;
  if (value) byId("thumbnail").src = value;
  else byId("thumbnail").removeAttribute("src");
  byId("photo-preview").hidden = !value;
}

byId("personalize").addEventListener("click", () => {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Drafts are optional. */ }
  recipient.value = typeof saved?.name === "string" ? saved.name.slice(0, 48) : "";
  showDraftPhoto(typeof saved?.photo === "string" && /^data:image\/(jpeg|webp);base64,/.test(saved.photo)
    ? saved.photo : "");
  photo.value = "";
  recipient.setCustomValidity("");
  byId("photo-error").hidden = true;
  byId("share").hidden = true;
  form.hidden = false;
  save.disabled = false;
  editor.setAttribute("aria-labelledby", "editor-title");
  editor.showModal();
  recipient.focus();
});
byId("cancel").addEventListener("click", () => editor.close());
byId("done").addEventListener("click", () => editor.close());
editor.addEventListener("close", () => { selection++; });
recipient.addEventListener("input", () => recipient.setCustomValidity(""));

function squarePhoto(image, size) {
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(side, size);
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff8f1";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2,
    side, side, 0, 0, canvas.width, canvas.height);
  return canvas;
}

byId("remove-photo").addEventListener("click", () => {
  selection++;
  photo.value = "";
  showDraftPhoto("");
  byId("photo-error").hidden = true;
  save.disabled = false;
});

photo.addEventListener("change", async () => {
  const file = photo.files[0];
  if (!file) return;
  const request = ++selection;
  const url = URL.createObjectURL(file);
  save.disabled = true;
  byId("photo-error").hidden = true;
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (request === selection) showDraftPhoto(squarePhoto(image, 320).toDataURL("image/jpeg", .9));
  } catch {
    if (request !== selection) return;
    photo.value = "";
    byId("photo-error").textContent = "That photo couldn't be opened. Try a JPG or PNG.";
    byId("photo-error").hidden = false;
  } finally {
    URL.revokeObjectURL(url);
    if (request === selection) save.disabled = false;
  }
});

async function createGiftLink(name, picture) {
  const url = new URL(location.pathname, location.href);
  const fields = new URLSearchParams({ gift: "1", name });
  url.hash = fields.toString();
  if (!picture) return url.href;

  const image = new Image();
  image.src = picture;
  await image.decode();
  // Scale the portrait to fit in a normal, copyable message link.
  for (const size of [160, 128, 96, 72, 48, 32, 24]) {
    const canvas = squarePhoto(image, size);
    for (const quality of [.78, .5, .3]) {
      let data = canvas.toDataURL("image/webp", quality);
      if (!data.startsWith("data:image/webp;")) data = canvas.toDataURL("image/jpeg", quality);
      const format = data.startsWith("data:image/webp;") ? "w" : "j";
      const encoded = data.split(",")[1].replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      fields.set("photo", format + encoded);
      url.hash = fields.toString();
      if (url.href.length <= 2000) return url.href;
    }
  }
  throw new Error("Photo is too large for a gift link.");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (save.disabled) return;
  const name = recipient.value.trim();
  if (!name) {
    recipient.setCustomValidity("Enter the birthday person's name.");
    recipient.reportValidity();
    return;
  }
  const picture = draftPhoto;
  const request = ++selection;
  save.disabled = true;
  try {
    const link = await createGiftLink(name, picture);
    if (request !== selection || !editor.open) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ name, photo: picture }));
    } catch { /* The link works even when the sender's browser cannot save a draft. */ }
    byId("gift-link").value = link;
    byId("open-gift").href = link;
    byId("copy-status").textContent = "";
    form.hidden = true;
    byId("share").hidden = false;
    editor.setAttribute("aria-labelledby", "share-title");
    byId("share-title").focus();
  } catch {
    byId("photo-error").textContent = "Couldn't create the link with this photo. Try another image.";
    byId("photo-error").hidden = false;
  } finally {
    if (request === selection) save.disabled = false;
  }
});

byId("copy-link").addEventListener("click", async () => {
  const field = byId("gift-link");
  try {
    await navigator.clipboard.writeText(field.value);
    byId("copy-status").textContent = "Link copied.";
  } catch {
    field.focus();
    field.select();
    byId("copy-status").textContent = "Copy the selected link to send your gift.";
  }
});
