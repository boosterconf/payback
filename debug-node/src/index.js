import { Hono } from "hono";
import { handleUpload } from "@vercel/blob/client";

const app = new Hono();

app.get("/", (c) => {
  return c.html(`
    <h1>Upload test</h1>
    <form id="form">
      <input id="file" type="file" name="file" accept=".jpg,.jpeg,.png,.pdf" required />
      <p id="status"></p>
      <button type="submit">Upload</button>
    </form>
    <script type="module">
      import { upload } from "https://esm.sh/@vercel/blob/client";

      document.getElementById("form").addEventListener("submit", async function(e) {
        e.preventDefault();
        var input = document.getElementById("file");
        var status = document.getElementById("status");
        var file = input.files[0];
        if (!file) return;

        status.textContent = "Uploading...";

        try {
          var blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/upload/handle",
          });
          status.textContent = "Done: " + blob.url;
        } catch (err) {
          status.textContent = "Error: " + err.message;
        }
      });
    </script>
  `);
});

app.post("/upload/handle", async (c) => {
  const body = await c.req.json();

  const jsonResponse = await handleUpload({
    body,
    request: c.req.raw,
    onBeforeGenerateToken: async () => {
      return {
        allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
        maximumSizeInBytes: 5 * 1024 * 1024,
      };
    },
    onUploadCompleted: async ({ blob }) => {
      console.log("Upload completed:", blob.url);
    },
  });

  return c.json(jsonResponse);
});

export default app;
