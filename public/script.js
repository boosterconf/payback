document.querySelectorAll("form").forEach(function (f) {
  f.addEventListener("submit", function () {
    var b = f.querySelector('button[type="submit"]');
    if (b) {
      b.disabled = true;
      b.textContent = "Submitting\u2026";
    }
  });
});
