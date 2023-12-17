if (localStorage.getItem("access_token")) {
  window.location.href = "/home";
}

const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const sign_in_form = document.querySelector(".sign-in-form");
const sign_up_form = document.querySelector(".sign-up-form");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

sign_in_form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#sign_in_username").value;
  const password = document.querySelector("#sign_in_password").value;
  const data = {
    username,
    password,
  };
  axios
    .post("/api/login", data)
    .then((res) => {
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("userid", res.data.userId);
      window.location.href = "/home";
    })
    .catch((error) => {
      const errorElement = document.querySelector("#sign_in_error");
      errorElement.innerHTML = error.response.data.message;
    });
});

sign_up_form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#sign_up_username").value;
  const email = document.querySelector("#sign_up_email").value;
  const password = document.querySelector("#sign_up_password").value;
  const confirmPassword = document.querySelector(
    "#sign_up_confirm_password"
  ).value;
  const errorElement = document.querySelector("#sign_up_error");

  if (confirmPassword !== password) {
    errorElement.innerHTML = "Password and Confirm Password do not match!";
    return;
  }
  const data = {
    username,
    email,
    password,
  };
  axios
    .post("/api/register", data)
    .then((res) => {
      localStorage.setItem("access_token", res.data.access_token);
      window.location.href = "/home";
    })
    .catch((error) => {
      errorElement.innerHTML = error.response.data.message;
    });
});
