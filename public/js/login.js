const btnLogin = $(".btn-login");
const username = $("#email");
const password = $("#password");
const errorMessage = $(".message-errors");

//xử lý đăng nhập
btnLogin.on("click", () => {
  if (validateInfoLogin(username.val(), password.val())) {
    const data = {
      username: username.val(),
      password: password.val(),
    };

    fetch("/auth/handleLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.statusCode === 200 || res.statusCode === 304) {
          window.location.href = res.data.urlRedirect;
        } else {
          password.val("");
          displayErrorMessage(res.message);
        }
      })
      .catch((err) => {
        username.val("");
        password.val("");
        displayErrorMessage("Lỗi hệ thống vui lòng thử lại sau ít phút.");
      });
  }
});

function validateInfoLogin(username, password) {
  if (username === "" || password === "") return false;
  return true;
}

function displayErrorMessage(message) {
  errorMessage.text(message).fadeIn("slow");
  setTimeout(function () {
    errorMessage.fadeOut("slow");
  }, 3000);
}
