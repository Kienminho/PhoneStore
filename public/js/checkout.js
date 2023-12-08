const tbody = $(".tbody");
const customerPhoneNumber = $("#customer-phone-number");
const customerName = $("#customer-name");
const customerAddress = $("#customer-address");

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
    <td><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${
			p.code
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

function validateData(phoneNumber) {
	if (!phoneNumber || phoneNumber === "" || phoneNumber.length !== 10) {
		showToast("Vui lòng nhập số điện thoại hợp lệ", false);
		return false;
	}
	return true;
}
