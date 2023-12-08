const tbody = $(".tbody");
const btnAdd = $(".btn-add-product");
const productName = $("#product-name");
const productImage = $("#product-image");
const importPrice = $("#import-price");
const salePrice = $("#sale-price");
const size = $("#size");
const ram = $("#ram");
const rom = $("#rom");
const description = $("#description-product");
const category = $("#category");
const deletedModal = $("#delete-modal");
const updateModal = $("#update-product-modal");

let tr;
let barCode;

//call api product
fetchData();
function fetchData() {
  fetch("/api/products/get-all-products")
    .then((res) => res.json())
    .then((res) => {
      displayProduct(res.data);
    });
}

//thêm sản phẩm
function addProduct() {
  if (
    validateData(
      productName.val(),
      productImage.val(),
      importPrice.val(),
      salePrice.val(),
      size.val(),
      ram.val(),
      rom.val(),
      description.val(),
      category.val()
    )
  ) {
    const form = document.getElementById("from-add-product");
    const formData = new FormData(form);

    $.ajax({
      url: "/api/products/add-product",
      type: "POST",
      processData: false, // Prevent jQuery from processing the data
      contentType: false, // Prevent jQuery from setting the content type
      data: formData,
      success: function (data) {
        // Handle success
        if (data.statusCode === 200) {
          //ẩn modal
          $("#addProductModal").modal("hide");
          showToast(data.message, true);
          displayOneProduct(data.data);
        }
      },
      error: function (error) {
        // Handle error
        console.error("Error:", error);
      },
    });
  }
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
      <div class="dropdown">
        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
          <i class="bx bx-dots-vertical-rounded"></i>
        </button>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="javascript:void(0);" onclick="updateProduct(this)"><i class="bx bx-edit-alt me-1"></i> Sửa</a>
          <a class="dropdown-item" href="javascript:void(0);" onclick="deletedProduct(this)"><i class="bx bx-trash me-1"></i> Xoá</a>
        </div>
      </div>
    </td>
  </tr>`;
    tbody.append(html);
  });
}

function displayOneProduct(p) {
  let html = `<tr>
    <td><i class="bar-code fab fa-angular fa-lg text-danger me-3"></i> <strong class= "bar-code">${
      p.barCode
    }</strong></td>
    <td class="name">${p.name}</td>
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
    <td class="config">ROM: ${p.rom} GB, RAM: ${p.ram} GB</td>
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
    <td ><span class="badge bg-label-primary me-1 sale-number">${
      p.saleNumber
    }</span></td>
    <td>
      <div class="dropdown">
        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
          <i class="bx bx-dots-vertical-rounded"></i>
        </button>
        <div class="dropdown-menu">
        <a class="dropdown-item" href="javascript:void(0);" onclick="updateProduct(this)"><i class="bx bx-edit-alt me-1"></i> Sửa</a>
        <a class="dropdown-item" href="javascript:void(0);" onclick="deletedProduct(this)"><i class="bx bx-trash me-1"></i> Xoá</a>
        </div>
      </div>
    </td>
  </tr>`;
  $(html).appendTo(tbody);
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

function validateData(
  productName,
  productImage,
  importPrice,
  salePrice,
  size,
  ram,
  rom,
  descriptions,
  categorys
) {
  console.log(categorys);
  if (
    productName === "" ||
    productImage === "" ||
    importPrice === 0 ||
    salePrice === 0 ||
    size === "" ||
    ram === null ||
    rom === null ||
    descriptions === "" ||
    categorys === ""
  ) {
    showToast("Nhập đủ thông tin sản phẩm để thêm", false);
    return false;
  }
  return true;
}

function deletedProduct(element) {
  $(deletedModal).modal("show");
  tr = $(element).closest("tr");
  barCode = $(tr).find(".bar-code").text();
}

function confirmDeleted() {
  fetch(`/api/products/delete/${barCode}`, {
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

function updateProduct(element) {
  tr = $(element).closest("tr");
  $("#bar-code").val(parseInt($(tr).find(".bar-code").text()));
  $("#product-name-update").val($(tr).find(".name").text());
  const config = extractNumbers($(tr).find(".config").text());
  $("#ram-update").val(parseInt(config[1]));
  $("#rom-update").val(parseInt(config[0]));
  $("#import-price-update").val(
    convertCurrencyStringToNumber($(tr).find(".import-price").text())
  );
  $("#sale-price-update").val(
    convertCurrencyStringToNumber($(tr).find(".sale-price").text())
  );
  $("#sale-number-update").val(parseInt($(tr).find(".sale-number").text()));

  $(updateModal).modal("show");
}

function confirmUpdateProduct() {
  const form = document.getElementById("from-update-product");
  const formData = new FormData(form);

  $.ajax({
    url: "/api/products/update-product",
    type: "PUT",
    processData: false,
    contentType: false,
    data: formData,
    success: function (data) {
      // Handle success
      if (data.statusCode === 200) {
        //ẩn modal
        fetchData();
        $("#update-product-modal").modal("hide");
        showToast(data.message, true);
      } else {
        $("#update-product-modal").modal("hide");
        showToast(data.message, false);
      }
    },
    error: function (error) {
      // Handle error
      console.error("Error:", error);
    },
  });
}

//hàm lấy cắt chuỗi để lấy ram và rom
function extractNumbers(str) {
  const regex = /\b\d+\b/g;
  const matches = str.match(regex);

  return matches ? matches.map(Number) : null;
}

//convert string to number
function convertCurrencyStringToNumber(currencyString) {
  const numericString = currencyString.replace(/[^\d]/g, "");
  const result = parseInt(numericString, 10);

  return isNaN(result) ? null : result;
}
