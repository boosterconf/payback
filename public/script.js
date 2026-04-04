import { upload } from "/blob-client.js";

var form = document.getElementById("receipt-form");
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var fileInput = form.querySelector('input[type="file"]');
    var file = fileInput && fileInput.files[0];

    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("File is too large. Maximum size is 25 MB.");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Uploading receipt\u2026';

    try {
      var relatedTo = form.querySelector('[name="relatedTo"]').value;
      var expenseType = form.querySelector('[name="expenseType"]').value;
      var d = new Date();
      var date = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
      var path = form.dataset.username + "/" + date + "/" + file.name;

      var blob = await upload(path, file, {
        access: "private",
        handleUploadUrl: "/upload/handle",
      });

      btn.innerHTML = '<span class="spinner"></span> Creating Fiken entry\u2026';

      var res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedTo: relatedTo,
          expenseType: expenseType,
          description: form.querySelector('[name="description"]').value,
          amount: form.querySelector('[name="amount"]').value,
          receiptUrl: blob.url,
        }),
      });

      var data = await res.json();

      if (data.ok) {
        window.location.href = "/success";
      } else {
        window.location.href = "/error";
      }
    } catch (err) {
      window.location.href = "/error";
    }
  });
}
