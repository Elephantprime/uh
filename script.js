
document.getElementById("signup-form").addEventListener("submit", function (e) {
  e.preventDefault();
  
  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim();
  const messageEl = document.getElementById("form-message");

  if (!name || !email) {
    messageEl.textContent = "Please fill out all fields.";
    messageEl.style.color = "yellow";
    return;
  }

  // For now, just mock success since backend isn't wired yet
  messageEl.textContent = `Welcome to the chaos, ${name}! We'll email you soon.`;
  messageEl.style.color = "lightgreen";

  e.target.reset();
});
