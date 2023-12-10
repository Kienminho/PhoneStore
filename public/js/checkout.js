const tbody = $(".tbody");
const customerPhoneNumber = $("#customer-phone-number");
const customerName = $("#customer-name");
const customerAddress = $("#customer-address");
const modal = $("#invoiceDetailModal");

//thêm sản phẩm
function getCustomerProfile() {
  if (validateData(customerPhoneNumber.val().trim())) {
    $.ajax({
      url: "/api/customer/get-profile",
      contentType: "application/json",
      method: "POST",
      data: JSON.stringify({ phoneNumber: customerPhoneNumber.val().trim() }),
      success: function (data) {
        // Handle success
        if (data.statusCode === 200) {
          customerName.val(data.data.fullName);
          customerAddress.val(data.data.address);
          customerName.prop("disabled", true);
          customerAddress.prop("disabled", true);
          getPurchaseHistory(data.data._id);
        }
      },
    });
  }
}

function getPurchaseHistory(id) {
  $.ajax({
    url: "/api/customer/get-purchase-history",
    contentType: "application/json",
    method: "POST",
    data: JSON.stringify({ customerId: id }),
    success: function (data) {
      // Handle success
      if (data.statusCode === 200) {
        displayPurchaseHistory(data.data);
      }
    },
  });
}

function getInvoiceDetail(id) {
  $.ajax({
    url: "/api/customer/get-invoice-detail",
    contentType: "application/json",
    method: "POST",
    data: JSON.stringify({ invoiceId: id }),
    success: function (data) {
      console.log(data.data);
      // Handle success
      if (data.statusCode === 200) {
        displayInvoiceDetail(data.data);
      }
    },
  });
}

function displayInvoiceDetail(data) {
  $("input#invoice-code").val(data.code);
  $("input#customer-name").val(data.customer.fullName);
  $("input#total-products").val(data.totalProducts);
  $("input#total-price").val(
    Number(data.totalPrice).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })
  );
  $("input#receive-money").val(
    Number(data.receiveMoney).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })
  );
  $("input#excess-money").val(
    Number(data.excessMoney).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    })
  );
  $("input#sales-staff").val(data.salesStaff.fullName);
  $("input#created-at").val(
    new Date(data.createdAt).toLocaleDateString("vi-VN")
  );
}

function handlePhoneNumberInputOnchange() {
  customerName.val("");
  customerAddress.val("");
  customerName.prop("disabled", false);
  customerAddress.prop("disabled", false);
  displayPurchaseHistory([]);
}

function displayPurchaseHistory(arr) {
  tbody.empty();
  if (!Array.isArray(arr) || arr.length === 0) {
    return;
  }
  arr.map((p) => {
    let html = `<tr>
    <td class="invoice-code" data-bs-toggle="modal" data-bs-target="#invoiceDetailModal" data-invoice-id="${
      p._id
    }"><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${
      p._id
    }</strong></td>
    <td>${p.customer.fullName}</td>
    <td>
      ${p.totalProducts}
    </td>
    <td>
        ${Number(p.totalPrice).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        })}
        </td>
    <td>
        ${Number(p.receiveMoney).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        })}
    </td>
    <td>
        ${Number(p.excessMoney).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        })}
    </td>
    <td>${p.salesStaff.fullName}</td>
    <td>${new Date(p.updatedAt).toLocaleDateString("vi-VN")}</td>
  </tr>`;

    tbody.append(html);
    $("td.invoice-code").on("click", function () {
      const invoiceId = $(this).data("invoice-id");
      getInvoiceDetail(invoiceId);
    });
  });
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

function validateData(phoneNumber) {
  if (!phoneNumber || phoneNumber.trim().length !== 10) {
    showToast("Vui lòng nhập số điện thoại hợp lệ", false);
    return false;
  }
  return true;
}
