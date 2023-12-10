const tbody = $(".tbody");
const tbodyPayment = $(".table-payment");
const keywords = $(".keywords");
let totalMoney;
let cartItems;
//hiển thị dữ liệu
fetchDataAllProduct();
fetchDataCart();
function fetchDataAllProduct() {
  fetch("/api/products/get-all-products")
    .then((res) => res.json())
    .then((res) => {
      displayProduct(res.data);
    });
}

function fetchDataCart() {
  fetch("/api/products/carts")
    .then((res) => res.json())
    .then((res) => {
      displayPayment(res.data);
    });
}
function displayProduct(arr) {
  tbody.empty();
  arr.map((p) => {
    let html = `<tr>
      <td><i class="bar-code fab fa-angular fa-lg text-danger me-3"></i> <strong class= "bar-code">${
        p.barCode
      }</strong></td>
      <td class= "name">${p.name}</td>
      <td>
        <ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">
          <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
            class="avatar avatar-xs pull-up" title="${p.name}">
            <img
              src="${p.imageLink}"
              alt="Avatar" class="rounded-circle" />
          </li>
          <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
            class="avatar avatar-xs pull-up" title="${p.name}">
            <img
              src="${p.imageLink}"
              alt="Avatar" class="rounded-circle" />
          </li>
          <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
            class="avatar avatar-xs pull-up" title="${p.name}">
            <img
              src="${p.imageLink}"
              alt="Avatar" class="rounded-circle" />
          </li>
        </ul>
      </td>
      <td class="config">ROM: ${p.rom}, RAM: ${p.ram}</td>
      <td>${new Date(p.creationDate).toLocaleDateString("vi-VN")}</td>
      <td class="import-price">${Number(p.importPrice).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      })}</td>
      <td class="sale-price">${Number(p.priceSale).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      })}</td>
      <td class="category">${p.categoryName}</td>
      <td><span class="badge bg-label-primary me-1 sale-number">${
        p.saleNumber
      }</span></td>
      <td>
      <a class="dropdown-item" href="javascript:void(0);" onclick="addProductToCart(this)"><i class='bx bxs-cart-add' ></i> Chọn</a>
      </td>
    </tr>`;
    tbody.append(html);
  });
}

function displayPayment(arr) {
  tbodyPayment.empty();
  arr.map((item, key) => {
    let html = `<tr>
    <td class="id d-none">${item._id}</td>
      <td><i class="bar-code fab fa-angular fa-lg text-danger me-3"></i> <strong class= "bar-code">${
        key + 1
      }</strong></td>
      <td class= "name">${item.name}</td>
      <td>
        <ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">
          <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
            class="avatar avatar-xs pull-up" title="${item.name}">
            <img
              src="${item.imageLink}"
              alt="Avatar" class="rounded-circle" />
          </li>
          <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
            class="avatar avatar-xs pull-up" title="${item.name}">
            <img
              src="${item.imageLink}"
              alt="Avatar" class="rounded-circle" />
          </li>
          <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
            class="avatar avatar-xs pull-up" title="${item.name}">
            <img
              src="${item.imageLink}"
              alt="Avatar" class="rounded-circle" />
          </li>
        </ul>
      </td>
      <td class="quantity"><input style="width:45px" type="number" value="${
        item.quantity
      }" oninput="updateQuantity(this)"></td>
      <td class="sale-price">${Number(item.salePrice).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      })}</td>
      <td class="sale-price">${Number(item.totalMoney).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      })}</td>
      <td>
      <a class="dropdown-item" href="javascript:void(0);" onclick="deletedProduct(this)"><i class="bx bx-trash me-1"></i> Xoá</a>
      </td>
    </tr>`;
    tbodyPayment.append(html);
  });
}

let timer;
function searchProduct() {
  const val = keywords.val() || "all";
  console.log(val);

  clearTimeout(timer);
  timer = setTimeout(() => {
    fetch(`api/products/get-product-by-barcode/${val}`)
      .then((res) => res.json())
      .then((res) => {
        displayProduct(res.data);
      })
      .catch((err) => console.log(err));
  }, 700);
}

function addProductToCart(element) {
  tr = $(element).closest("tr");
  barCode = $(tr).find(".bar-code").text();
  fetch(`/api/products/add-to-cart/${barCode}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.statusCode === 200) {
        fetchDataCart();
        showToast(res.message, true);
      } else showToast(res.message, false);
    });
}

let timer2;
function updateQuantity(element) {
  const value = parseInt($(element).val());
  tr = $(element).closest("tr");
  const id = $(tr).find(".id").text();
  clearTimeout(timer2);
  timer2 = setTimeout(() => {
    fetch(`/api/products/update-quantity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, value }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode === 200) {
          fetchDataCart();
          showToast(res.message, true);
        } else showToast(res.message, false);
      });
  }, 600);
}

function deletedProduct(element) {
  tr = $(element).closest("tr");
  const id = $(tr).find(".id").text();
  fetch(`/api/products/delete-product-in-cart/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.statusCode === 200) {
        showToast(res.message, true);
        tr.remove();
      } else showToast(res.message, false);
    });
}

function checkPayment() {
  $("#offcanvasEnd").addClass("show");
  fetch("/api/carts/get-info-cart")
    .then((res) => res.json())
    .then((res) => {
      totalMoney = res.data.totalAmount;
      $("#quantity").val(res.data.totalQuantity);
      $("#totalmoney").val(
        res.data.totalAmount.toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        })
      );
      cartItems = res.data.cartItems;
    })
    .catch((err) => console.log(err));
}

let timer3;
function getCustomerProfile() {
  console.log($("#phone-number").val());
  const value = $("#phone-number").val();
  clearTimeout(timer3);
  timer3 = setTimeout(() => {
    $.ajax({
      url: "/api/customer/get-profile",
      contentType: "application/json",
      method: "POST",
      data: JSON.stringify({ phoneNumber: value }),
      success: function (data) {
        // Handle success
        if (data.statusCode === 200) {
          $("#basic-default-fullname").val(data.data.fullName);
          $("#address").val(data.data.address);
        }
      },
    });
  }, 250);
}

let timer4;
function calcMoney() {
  const value = $("#money-recevier").val();

  clearTimeout(timer4);
  timer4 = setTimeout(() => {
    if (parseInt(value) < totalMoney) {
      $("#money-back").val("Số tiền nhận không đủ.");
      return;
    }
    $("#money-back").val(
      (parseInt(value) - totalMoney).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      })
    );
  }, 250);
}

function handlePay() {
  const phoneNumber = $("#phone-number").val();
  const nameCustomer = $("#basic-default-fullname").val();
  const address = $("#address").val();
  const quantity = $("#quantity").val();
  const moneyRecevier = $("#money-recevier").val();
  const moneyBack = $("#money-back").val();

  const data = {
    phoneNumber: phoneNumber,
    fullName: nameCustomer,
    address: address,
    quantity: quantity,
    totalMoney: totalMoney,
    receiveMoney: parseInt(moneyRecevier.replace(/\./g, ""), 10),
    moneyBack: parseInt(moneyBack.replace(/\./g, ""), 10),
    items: cartItems,
  };
  fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if (res.statusCode === 200) {
        window.location = res.data.urlRedirect;
      } else {
        $("#offcanvasEnd").addClass("hide");
        showToast(res.message, false);
      }
    })
    .catch((err) => console.log(err));
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
