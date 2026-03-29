var MAX_FILE_SIZE = 5 * 1024 * 1024;

document.querySelectorAll("form").forEach(function (f) {
  f.addEventListener("submit", function (e) {
    var input = f.querySelector('input[type="file"]');
    if (input && input.files[0] && input.files[0].size > MAX_FILE_SIZE) {
      e.preventDefault();
      alert("File is too large. Maximum size is 5 MB.");
      return;
    }
    var b = f.querySelector('button[type="submit"]');
    if (b) {
      b.disabled = true;
      b.textContent = "Submitting\u2026";
    }
  });
});
