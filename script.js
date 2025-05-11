let editors = {
  html: '<textarea id="html-code" placeholder="Write HTML code here..."></textarea>',
  css: '<textarea id="css-code" placeholder="Write CSS code here..."></textarea>',
  js: '<textarea id="js-code" placeholder="Write JavaScript code here..."></textarea>'
};

function loadTab(tab) {
  document.getElementById("editor-section").innerHTML = editors[tab];
}

function livePreview() {
  const html = document.getElementById("html-code")?.value || "";
  const css = document.getElementById("css-code")?.value || "";
  const js = document.getElementById("js-code")?.value || "";
  const iframe = document.getElementById("preview");
  const code = `
    <html>
      <head><style>${css}</style></head>
      <body>${html}<script>${js}<\/script></body>
    </html>`;
  iframe.srcdoc = code;
}

function downloadCode() {
  const html = document.getElementById("html-code")?.value || "";
  const css = document.getElementById("css-code")?.value || "";
  const js = document.getElementById("js-code")?.value || "";

  const zip = new JSZip();
  zip.file("index.html", html);
  zip.file("style.css", css);
  zip.file("script.js", js);

  zip.generateAsync({ type: "blob" })
    .then(function(content) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "code-editor.zip";
      a.click();
    });
}

window.addEventListener("load", () => {
  loadTab("html");
});