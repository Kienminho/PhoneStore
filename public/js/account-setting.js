const modal = $("#change-password-modal");
const oldPassword = $("#old-password");
const newPassword = $("#new-password");
const confirmPassword = $("#confirm-password");
let id;
const defaultAvatar = "../assets/img/avatars/1.png";
$(document).ready(function () {
  //get info mine
  getInfo();
});

function getInfo() {
  fetch("/api/users/info-mine")
    .then((res) => res.json())
    .then((res) => {
      $("#full-name").val(res.data.fullName);
      $("#email").val(res.data.email);
      $("#address").val(res.data.address);
      $("#phone-number").val(res.data.phoneNumber);
      $("#uploadedAvatar").attr("src", res.data.avatar ?? defaultAvatar);
      $("#avatar-user").attr(
        "src",
        res.data.avatar ?? "../assets/img/avatars/1.png"
      );
      $("#sub-avatar").attr(
        "src",
        res.data.avatar ?? "../assets/img/avatars/1.png"
      );
      id = res.data._id;
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleFileChange() {
  const input = document.getElementById("upload");
  const file = input.files[0];

  if (file) {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("id", id);
    // Use fetch to send the file to the server
    fetch("/api/users/uploadAvatar", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode === 200) {
          showToast(data.message, true);
          getInfo();
        } else showToast(data.message, false);
      })
      .catch((error) => {
        console.error("Error uploading avatar:", error);
      });
  }
}

function changePassword() {
  $(modal).modal("show");
}

function confirmChange() {
  if (
    validatePassword(
      oldPassword.val(),
      newPassword.val(),
      confirmPassword.val()
    )
  ) {
    fetch("/api/users/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        oldPassword: oldPassword.val(),
        password: newPassword.val(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode === 200) {
          $(modal).modal("hide");
          showToast(res.message, true);
        } else {
          showToast(res.message, false);
          oldPassword.val("");
        }
      })
      .catch((err) => console.error(err));
  }
}

function validatePassword(oldPassword, newPassword, confirmPassword) {
  if (
    oldPassword.trim() === "" ||
    newPassword.trim() === "" ||
    confirmPassword.trim() === ""
  ) {
    showToast("Vui lòng nhập đầy đủ thông tin.", false);
    return false;
  } else if (newPassword.length < 8) {
    showToast("Mật khẩu phải từ 8 ký tự trở lên.", false);
    return false;
  } else if (newPassword !== confirmPassword) {
    showToast("Mật khẩu mới và xác nhận mật khẩu không khớp.", false);
    return false;
  }

  return true;
}

function showToast(message, isSuccess) {
  const toastElement = $("#liveToast");
  const toastMessageElement = $(".toast-body");

  // Set background color based on success or failure
  if (isSuccess) {
    toastElement.removeClass("bg-danger");
    toastElement.addClass("bg-success");
  } else {
    toastElement.removeClass("bg-success");
    toastElement.addClass("bg-danger");
  }

  // Set the message
  toastMessageElement.text(message);
  toastElement.show();

  setTimeout(function () {
    toastElement.hide();
  }, 1500);
}
