const tbody = $(".tbody");
const deletedModal = $("#delete-modal");
const employeeName = $("#employee-name");
const email = $("#email");
const address = $("#address");
const phoneNumber = $("#phone-number");
let tr;
let id;

// hiển thị dữ liệu
fetchData();

function fetchData() {
  fetch("/api/users/get-all-user")
    .then((res) => res.json())
    .then((res) => {
      console.log(res.data);
      displayData(res.data);
    })
    .catch((err) => {
      showToast("Không tìm thấy dữ liệu", false);
    });
}

function createEmployee() {
  if (
    validateForm(
      employeeName.val(),
      email.val(),
      address.val(),
      phoneNumber.val()
    )
  ) {
    console.log(12);
    //call api to create employee
    const data = {
      fullName: employeeName.val(),
      email: email.val(),
      address: address.val(),
      phoneNumber: phoneNumber.val(),
    };

    fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode === 200) {
          fetchData();
          $("#create-employee-modal").modal("hide");
          showToast("Tạo mới thành công", true);
          $("#form-create-employee")[0].reset();
        } else {
          $("#create-employee-modal").modal("hide");
          showToast(res.message, false);
        }
      })
      .catch((err) => {
        showToast("Vui lòng thử lại sau ít phút", false);
        console.log(err.message);
      });
  }
}

function deletedProduct(element) {
  $(deletedModal).modal("show");
  tr = $(element).closest("tr");
  id = $(tr).find(".id").text();
}

function confirmDeleted() {
  fetch(`/api/users/delete/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.statusCode === 200) {
        $(deletedModal).modal("hide");
        showToast(res.message, true);
        $(tr).remove();
      } else {
        $(deletedModal).modal("hide");
        showToast(res.message, false);
      }
    });
}

function reactivateAccount(element) {
  tr = $(element).closest("tr");
  id = $(tr).find(".id").text();
  fetch("/api/users/reactive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.statusCode === 200) {
        showToast(res.message, true);
      } else {
        showToast(res.message, false);
      }
    });
}

function displayData(arr) {
  tbody.empty();
  arr.map((i, index) => {
    let html = `<tr>
    <td class="id d-none">${i._id}</td>
    <td><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${
      index + 1
    }</strong></td>
    <td class="name">${i.fullName}</td>
    <td class="email">${i.email}</td>
    <td class="address">${i.address}</td>
    <td class="phone">${i.phoneNumber}</td>
    <td>
        <span class="badge ${
          i.activated ? "bg-label-success" : "bg-label-danger"
        } me-1">
            ${i.activated ? "Active" : "Inactive"}
        </span>
    </td>
    <td>
        <div class="dropdown">
            <button type="button" class="btn p-0 dropdown-toggle hide-arrow"
                data-bs-toggle="dropdown">
                <i class="bx bx-dots-vertical-rounded"></i>
            </button>
            <div class="dropdown-menu">
                <a class="dropdown-item" href="javascript:void(0);" onclick="reactivateAccount(this)"><i
                        class="bx bx-edit-alt me-1"></i>Kích hoạt</a>
                <a class="dropdown-item" href="javascript:void(0);" onclick="deletedProduct(this)"><i
                        class="bx bx-trash me-1" ></i> Xoá</a>
            </div>
        </div>
    </td>
</tr>`;
    tbody.append(html);
  });
}

function validateForm(employeeName, email, address, phoneNumber) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    employeeName.trim() === "" ||
    email.trim() === "" ||
    address.trim() === "" ||
    phoneNumber.trim() === ""
  ) {
    showToast("Nhập đầy đủ thông tin để tạo nhân viên mới.", false);
    return false;
  }

  if (!emailRegex.test(email)) {
    showToast("Email không hợp lệ. Vui lòng nhập đúng định dạng email.", false);
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
  }, 2000);
}
