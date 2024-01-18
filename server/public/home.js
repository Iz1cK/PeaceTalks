const logout = document.querySelector("#logoutNav");
if (localStorage.getItem("access_token")) {
  window.location.href = "/login-home";
  logout.style.display = "block";
  logout.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "/home";
  });
} else {
  logout.style.display = "none";
}

let userTexts = document.getElementsByClassName("user-text");
let userPics = document.getElementsByClassName("user-pic");

function showReview() {
  for (let userPic of userPics) {
    userPic.classList.remove("active-pic");
  }
  for (let userText of userTexts) {
    userText.classList.remove("active-text");
  }

  let i = Array.from(userPics).indexOf(event.target);

  userPics[i].classList.add("active-pic");
  userTexts[i].classList.add("active-text");
}

$(".main").tiltedpage_scroll({
  sectionContainer: "> section",
  angle: 50,
  opacity: true,
  scale: true,
  outAnimation: true,
});
