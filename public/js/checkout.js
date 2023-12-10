const tbodyPurchaseHistory = $("tbody#purchase-history-items");
const tbodyInvoiceDetail = $("tbody#invoice-items");
const customerPhoneNumber = $("#customer-phone-number");
const customerName = $("#customer-name");
const customerAddress = $("#customer-address");
const modal = $("#invoiceDetailModal");
let isNewCustomer = true;
let products = [];
const chosenItems = [];
fetchData();
function fetchData() {
	fetch("/api/products/get-all-products")
		.then((res) => res.json())
		.then((res) => {
			products = res.data;
			displayProduct(res.data);
		});
}

function handleOnBlur() {
	if (
		customerName.val().trim().length === 0 ||
		customerPhoneNumber.val().trim().length === 0 ||
		customerAddress.val().trim().length === 0
	) {
		$("#move-to-next-2").prop("disabled", true);
	} else {
		$("#move-to-next-2").prop("disabled", false);
	}
}

$("#move-to-next-2").click(function () {
	displayChosenItemsForViewOnly(chosenItems);
});

function debounce(func, delay) {
	let timeoutId;
	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(context, args);
		}, delay);
	};
}

function handleInput() {
	const inputValue = document.getElementById("search-barcode").value;
	if (inputValue.length === 0) {
		fetchData();
	} else {
		getProductByBarcode(inputValue);
	}
	// Replace this with your actual logic (e.g., making an AJAX request, updating UI, etc.)
}

const debouncedHandleInput = debounce(handleInput, 500);
document
	.getElementById("search-barcode")
	.addEventListener("input", debouncedHandleInput);

function getProductByBarcode(barcode) {
	fetch(`/api/products/get-product-by-barcode/${barcode}`)
		.then((res) => res.json())
		.then((res) => {
			if (res.statusCode === 200) {
				displayProduct([res.data]);
			} else {
				displayProduct([]);
			}
		});
}

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
					handleOnBlur();
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
			// Handle success
			if (data.statusCode === 200) {
				displayInvoiceDetail(data.data);
			}
		},
	});
}

function displayInvoiceDetail(data) {
	$("input#invoice-code").val(data.invoiceCode);
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

	displayInvoiceItems(data.products);
}

function handlePhoneNumberInputOnchange() {
	customerName.val("");
	customerAddress.val("");
	customerName.prop("disabled", false);
	customerAddress.prop("disabled", false);
	displayPurchaseHistory([]);
}

function displayInvoiceItems(invoiceItems) {
	tbodyInvoiceDetail.empty();
	if (!Array.isArray(invoiceItems) || invoiceItems.length === 0) {
		return;
	}

	invoiceItems.map((p, i) => {
		let html = `<tr>
	<td>${i + 1}</td>
	<td>${p.product.name}</td>
	<td>${p.quantity}</td>
	<td>
		${Number(p.unitPrice).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})}
	</td>
	<td>
		${Number(p.unitPrice * p.quantity).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})}
	</td>
  </tr>`;

		tbodyInvoiceDetail.append(html);
	});
}

function displayPurchaseHistory(arr) {
	tbodyPurchaseHistory.empty();
	if (!Array.isArray(arr) || arr.length === 0) {
		if (isNewCustomer) {
			$("#purchase-history").hide();
		}
		return;
	}

	arr.map((p) => {
		let html = `<tr>
    <td class="invoice-code" data-bs-toggle="modal" data-bs-target="#invoiceDetailModal" data-invoice-id="${
			p._id
		}"><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${
			p.invoiceCode
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

		tbodyPurchaseHistory.append(html);
		$("#purchase-history").show();
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
	if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
		showToast("Vui lòng nhập số điện thoại hợp lệ", false);
		return false;
	}
	return true;
}

function isValidPhoneNumber(phoneNumber) {
	// Remove non-numeric characters
	const numericPhoneNumber = phoneNumber.replace(/\D/g, "");

	// Check if the numeric phone number has a length of 10
	return numericPhoneNumber.length === 10;
}

function displayChosenItemsForViewOnly(items) {
	const tbody = $("tbody#product-items-chosen-view-only");
	let totalPrice = 0;
	tbody.empty();
	items.map((p) => {
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
		<td class="sale-price">${Number(p.priceSale).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})}</td>
		  <td>${p.quantity}</td>
		  <td>${Number(p.priceSale * p.quantity).toLocaleString("vi", {
				style: "currency",
				currency: "VND",
			})}</td>
	  </tr>`;
		tbody.append(html);
		totalPrice += p.priceSale * p.quantity;
	});

	$("#form-checkout-view-only").empty();
	$("#form-checkout-view-only").append(`<div class="mb-3">
		<label
			style="padding-bottom:8px; margin-left: 24px;"
			for="customer-name"
		>Tên khách hàng</label>
		<input
			style="margin-left: auto; margin-right: auto; width: 96%"
			class="form-control"
			type="text"
			id="customer-name"
			name="fullName"
			value="${customerName.val()}"
			disabled
		/>
	</div>
	<div class="mb-3">
		<label
			style="padding-bottom:8px; margin-left: 24px;"
			for="customer-address"
		>Địa chỉ</label>
		<input
			style="margin-left: auto; margin-right: auto; width: 96%"
			class="form-control"
			type="text"
			id="customer-address"
			name="address"
			value="${customerAddress.val()}"
			disabled
		/>
	</div>
	<div class="mb-3">
		<label
			style="padding-bottom:8px; margin-left: 24px;"
			for="customer-address"
		>Số điện thoại</label>
		<input
			style="margin-left: auto; margin-right: auto; width: 96%"
			class="form-control"
			type="text"
			value="0898228317"
			id="customer-phone-number"
			name="${customerPhoneNumber.val()}"
			disabled
		/>
	</div>
	<div class="mb-3">
		<label
			style="padding-bottom:8px; margin-left: 24px;"
			for="customer-address"
		>Tổng tiền</label>
		<input
			style="margin-left: auto; margin-right: auto; width: 96%"
			class="form-control"
			type="text"
			value="${totalPrice}"
			id="customer-total-price"
			name="phoneNumber"
			disabled
		/>
	</div>
	<div class="mb-3">
		<label
			style="padding-bottom:8px; margin-left: 24px;"
			for="customer-address"
		>Số tiền nhận</label>
		<input
			style="margin-left: auto; margin-right: auto; width: 96%"
			class="form-control"
			type="text"
			id="customer-receive-money"
			name="receiveMoney"
		/>
	</div>
	<div class="mb-3" style="display: none" id="customer-excess-money">
		<label
			style="padding-bottom:8px; margin-left: 24px;"
			for="customer-address"
		>Số tiền thừa</label>
		<input
			style="margin-left: auto; margin-right: auto; width: 96%"
			class="form-control"
			type="text"
			disabled
		/>
	</div>`);

	$("#customer-receive-money").on("blur", function () {
		const receiveMoney = $(this).val();
		const totalMoney = $("#customer-total-price").val();
		if (+receiveMoney < +totalMoney) {
			showToast("Số tiền không hợp lệ", false);
			$("#confirm-payment").prop("disabled", true);
		} else {
			$("#customer-excess-money").show();
			$("#customer-excess-money>input").val(+receiveMoney - +totalMoney);
			$("#confirm-payment").prop("disabled", false);

			$("#confirm-payment").on("click", function () {
				$.ajax({
					url: "/api/invoices",
					contentType: "application/json",
					method: "POST",
					data: JSON.stringify({
						phoneNumber: customerPhoneNumber.val(),
						fullName: customerName.val(),
						address: customerAddress.val(),
						invoiceItems: chosenItems.map((item) => ({
							productId: item._id,
							quantity: item.quantity,
						})),
						receiveMoney: +receiveMoney,
					}),
					success: function (data) {
						// Handle success
						if (data.statusCode === 200) {
							showToast("Thanh toán thành công", true);
						}
					},
				});
			});
		}
	});

	$("#total-chosen-price-view-only").text(
		Number(totalPrice).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})
	);
}

$(".step").each(function (index, element) {
	// element == this
	$(element).not(".active").addClass("done");
	$(".done").html('<i class="icon-ok"></i>');
	if ($(this).is(".active")) {
		return false;
	}
});

function displayChosenItems(items) {
	const tbody = $("tbody#product-items-chosen");
	let totalPrice = 0;
	tbody.empty();
	items.map((p) => {
		let html = `<tr>
		<td><i class="bar-code fab fa-angular fa-lg text-danger me-3"></i> <strong class= "bar-code">${
			p.barCode
		}</strong></td>
		<td class= "name">${p.name}</td>
		<td class="sale-price">${Number(p.priceSale).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})}</td>
		  <td>${p.quantity}</td>
		  <td>${Number(p.priceSale * p.quantity).toLocaleString("vi", {
				style: "currency",
				currency: "VND",
			})}</td>
			<td>
				<button type="button" onClick={addProductToChosenList("${p._id}")}>+</button>
				<button type="button" onClick={removeProductFromChosenList("${
					p._id
				}")}>-</button>
			</td>
	  </tr>`;
		tbody.append(html);
		totalPrice += p.priceSale * p.quantity;
	});

	$("#total-chosen-price").text(
		Number(totalPrice).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})
	);
	if (chosenItems.length > 0) {
		console.log($("#move-to-next"));
		$("#move-to-next").prop("disabled", false);
	} else {
		$("#move-to-next").prop("disabled", true);
	}
}

function displayProduct(arr) {
	const tbody = $("tbody#product-items");
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
	  <td class="sale-price">${Number(p.priceSale).toLocaleString("vi", {
			style: "currency",
			currency: "VND",
		})}</td>
		<td><button type="button" class="add-to-invoice" data-product-id="${
			p._id
		}">Thêm</button></td>
	</tr>`;
		tbody.append(html);
	});

	$("button.add-to-invoice").click(function () {
		addProductToChosenList($(this).data("product-id"));
	});
}

function addProductToChosenList(id) {
	const item = chosenItems.find((p) => p._id.toString() === id);

	if (item) {
		item.quantity += 1;
	} else {
		const product = products.find((p) => p._id.toString() === id);
		if (product) {
			chosenItems.push({ ...product, quantity: 1 });
		}
	}
	console.log(chosenItems);
	displayChosenItems(chosenItems);
}

function removeProductFromChosenList(id) {
	const item = chosenItems.find((p) => p._id.toString() === id);

	if (item) {
		if (item.quantity > 1) {
			item.quantity -= 1;
		} else {
			const index = chosenItems.findIndex((p) => p._id.toString() === id);
			chosenItems.splice(index, 1);
		}
	}
	displayChosenItems(chosenItems);
}

var current_fs, next_fs, previous_fs;
var left, opacity, scale;
var animating;
$(".next").click(function () {
	if (animating) return false;
	animating = true;

	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	next_fs.show();
	current_fs.animate(
		{ opacity: 0 },
		{
			step: function (now, mx) {
				scale = 1 - (1 - now) * 0.2;
				left = now * 50 + "%";
				opacity = 1 - now;
				current_fs.css({
					transform: "scale(" + scale + ")",
					position: "absolute",
				});
				next_fs.css({ left: left, opacity: opacity });
			},
			duration: 800,
			complete: function () {
				current_fs.hide();
				animating = false;
			},
			easing: "easeInOutBack",
		}
	);
});

$(".previous").click(function () {
	if (animating) return false;
	animating = true;

	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	$("#progressbar li")
		.eq($("fieldset").index(current_fs))
		.removeClass("active");

	previous_fs.show();
	current_fs.animate(
		{ opacity: 0 },
		{
			step: function (now, mx) {
				scale = 0.8 + (1 - now) * 0.2;
				left = (1 - now) * 50 + "%";
				opacity = 1 - now;
				current_fs.css({ left: left });
				previous_fs.css({
					transform: "scale(" + scale + ")",
					opacity: opacity,
				});
			},
			duration: 800,
			complete: function () {
				current_fs.hide();
				animating = false;
			},
			easing: "easeInOutBack",
		}
	);
});

$(".submit").click(function () {
	return false;
});
