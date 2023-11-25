const btn_changePassword = $(".btn");
const currentUrl = window.location.href;
const urlParts = currentUrl.split("/");
const id = urlParts[urlParts.length - 1];

btn_changePassword.on("click", () => {
  // lấy mật khẩu từ thẻ input
  const password = $("#new-password").val();
  const confirmPassword = $("#confirm-password").val();
  const message = $(".message");

  if (password.length < 8) {
    showMessage(message, "Mật khẩu phải lớn hơn hoặc bằng 8 ký tự.");
    return;
  }
  if (password === "" || confirmPassword === "") {
    showMessage(message, "Vui lòng nhập đầy đủ thông tin yêu cầu.");
  } else if (password !== confirmPassword) {
    showMessage(message, "Mật khẩu không khớp, vui lòng nhập lại.");
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, password: password }),
  };

  const messageSuccess = $(".message-success");

  //sends the fetch to the server for processing
  fetch("/auth/change_password", options)
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        showMessage(
          messageSuccess,
          "Đổi mật khẩu thành công, bạn sẽ được chuyển đến giao diện đăng nhập ngay bây giờ"
        );
        window.location = "/auth/login";
      }
    })
    .catch((err) => console.log(err));
});

function showMessage(element, messageText) {
  element.text(messageText);
  element.removeClass("d-none");
  setTimeout(() => {
    element.addClass("d-none");
  }, 3000);
}
