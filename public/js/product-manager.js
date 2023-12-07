const tbody = $(".tbody");
const btnAdd = $(".btn-add-product");
const productName = $("#product-name");
const productImage = $("#product-image");
const importPrice = $("#import-price");
const salePrice = $("#sale-price");
const size = $("#size");
const ram = $("#ram");
const rom = $("#rom");
const description = $("#description");
const category = $("#category");
//call api product
fetch("/api/products/get-all-products")
  .then((res) => res.json())
  .then((res) => {
    displayProduct(res.data);
  });

//thêm sản phẩm
function addProduct() {
  if (
    validateData(
      productName.val(),
      productImage.val(),
      importPrice.val(),
      salePrice.val(),
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
    <td><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${
      p.barCode
    }</strong></td>
    <td>${p.name}</td>
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
    <td>ROM: ${p.rom}, RAM: ${p.ram}</td>
    <td>${new Date(p.creationDate).toLocaleDateString("vi-VN")}</td>
    <td>${Number(p.importPrice).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })}</td>
    <td>${Number(p.priceSale).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })}</td>
    <td>${p.categoryName}</td>
    <td><span class="badge bg-label-primary me-1">${p.saleNumber}</span></td>
    <td>
      <div class="dropdown">
        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
          <i class="bx bx-dots-vertical-rounded"></i>
        </button>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-edit-alt me-1"></i> Edit</a>
          <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-trash me-1"></i> Delete</a>
        </div>
      </div>
    </td>
  </tr>`;
    tbody.append(html);
  });
}

function displayOneProduct(p) {
  let html = `<tr>
    <td><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${
      p.barCode
    }</strong></td>
    <td>${p.name}</td>
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
    <td>ROM: ${p.rom}, RAM: ${p.ram}</td>
    <td>${new Date(p.creationDate).toLocaleDateString("vi-VN")}</td>
    <td>${Number(p.importPrice).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })}</td>
    <td>${Number(p.priceSale).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })}</td>
    <td>${p.categoryName}</td>
    <td><span class="badge bg-label-primary me-1">${p.saleNumber}</span></td>
    <td>
      <div class="dropdown">
        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
          <i class="bx bx-dots-vertical-rounded"></i>
        </button>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-edit-alt me-1"></i> Edit</a>
          <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-trash me-1"></i> Delete</a>
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
  description,
  category
) {
  if (
    productName === "" ||
    productImage === "" ||
    importPrice === 0 ||
    salePrice === 0 ||
    size === "" ||
    ram === 0 ||
    rom === 0 ||
    description === "" ||
    category === ""
  ) {
    showToast("Nhập đủ thông tin sản phẩm để thêm", false);
    return false;
  }
  return true;
}
