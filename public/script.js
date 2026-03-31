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
      var { upload } = await import("/blob-client.js");

      var relatedTo = form.querySelector('[name="relatedTo"]').value;
      var expenseType = form.querySelector('[name="expenseType"]').value;
      var path = form.dataset.username + "/" + relatedTo + "/" + expenseType + "/" + file.name;

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
          receiptUrl: blob.url,
        }),
      });

      var data = await res.json();

      if (data.ok) {
        window.location.href = "/success";
      } else {
        window.location.href = "/error?message=" + encodeURIComponent(data.error || "Something went wrong.");
      }
    } catch (err) {
      window.location.href = "/error?message=" + encodeURIComponent(err.message || "Upload failed.");
    }
  });
}
