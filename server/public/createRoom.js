const logout = document.querySelector("#logoutNav");
if (localStorage.getItem("access_token")) {
  logout.style.display = "block";
  logout.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "/home";
  });
} else {
  logout.style.display = "none";
  window.location.href = "/index";
}

let generateLinkBtn = document.getElementById("generateLinkBtn");
let generatedLinkInput = document.getElementById("generatedLink");

let linkDiv = document.getElementById("linkDiv");
let clipboard = document.getElementById("linkClipboard");
let tooltip = document.querySelector(".tooltip");

generateLinkBtn.addEventListener("click", (e) => {
  axios.get("http://localhost:2312/create-link").then((res) => {
    generatedLinkInput.value = res.data.link;
  });
});

linkDiv.addEventListener("click", (event) => {
  if (event.target.closest("#linkClipboard")) {
    generatedLinkInput.select();
    generatedLinkInput.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(generatedLinkInput.value);

    new jBox("Notice", {
      content: "Copied link to clipboard!",
      color: "black",
      position: {
        x: "center",
        y: "end",
      },
      autoClose: 2000,
    });
  }
});

new jBox("Tooltip", {
  attach: ".fa-clipboard",
  theme: "TooltipDark",
});
