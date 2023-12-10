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
		$("#customer-name").val().trim().length === 0 ||
		$("#customer-phone-number").val().trim().length === 0 ||
		$("#customer-address").val().trim().length === 0
	) {
		$("#move-to-next-2").prop("disabled", true);
	} else {
		$("#move-to-next-2").prop("disabled", false);
		$("#move-to-next-2").click(function () {
			displayChosenItemsForViewOnly(chosenItems);
		});
	}
}

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
	if (validateData($("#customer-phone-number").val().trim())) {
		$.ajax({
			url: "/api/customer/get-profile",
			contentType: "application/json",
			method: "POST",
			data: JSON.stringify({
				phoneNumber: $("#customer-phone-number").val().trim(),
			}),
			success: function (data) {
				// Handle success
				if (data.statusCode === 200) {
					$("#customer-name").val(data.data.fullName);
					$("#customer-address").val(data.data.address);
					$("#customer-name").prop("disabled", true);
					$("#customer-address").prop("disabled", true);
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
	$("#customer-name").val("");
	$("#customer-address").val("");
	$("#customer-name").prop("disabled", false);
	$("#customer-address").prop("disabled", false);
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
	$("tbody#purchase-history-items").empty();
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

		$("tbody#purchase-history-items").append(html);
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
	if ($("#payment-scr").length === 0) {
		$("#main-form")
			.append(`<div class="card card-step need-to-move" id="payment-scr" data-step-3>
	<h5 class="card-title">Thanh toán</h5>
	<form id="form-checkout-view-only">
	</form>

	<div class="review-chosen-items-group">
		<h5 class="review-chosen-items-heading">Sản phẩm đã chọn</h5>
		<input type="hidden" name="" />
		<table class="table" id="products">
			<thead>
				<tr>
					<th>Mã sản phẩm</th>
					<th>Tên sản phẩm</th>
					<th>Hình ảnh</th>
					<th>Cấu hình</th>
					<th>Giá bán</th>
					<th>Số lượng</th>
					<th>Tổng</th>
				</tr>
			</thead>
			<tbody
				class="tbody table-border-bottom-0"
				id="product-items-chosen-view-only"
			>
			</tbody>
		</table>
		<p class="review-total-price">Tổng tiền:
			<span id="total-chosen-price-view-only">0</span></p>
		<div class="review-chosen-items-action">

			<a href="#customer-info" class="confirm-prev" type="button">Trước</a>
			<button type="button" id="confirm-payment" disabled>Thanh toán</button>
		</div>
	</div>
</div>`);
	}
	console.log($("#payment-scr"));
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

	console.log(tbody);
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
			value="${$("#customer-name").val()}"
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
			value="${$("#customer-address").val()}"
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
			name="${$("#customer-phone-number").val()}"
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
						phoneNumber: $("#customer-phone-number").val(),
						fullName: $("#customer-name").val(),
						address: $("#customer-address").val(),
						invoiceItems: chosenItems.map((item) => ({
							productId: item._id,
							quantity: item.quantity,
						})),
						receiveMoney: +receiveMoney,
					}),
					success: function (data) {
						// Handle success
						if (data.statusCode === 200) {
							$("#main-form").empty();
							$("#form-checkout-view-only").empty();
							$(".need-to-move").remove();
							$("#main-form")
								.append(`<div class="card card-step card-step-success" data-step-4><h5 class="card-title">Thành công</h5>
							<p class="review-invoice">Cảm ơn bạn đã sử dụng dịch vụ của chúng
								tôi!<br />Mã hóa đơn:
								<a id="invoice-pdf" target="_blank"></a></p><br/><a id="back-to-checkout" href="/checkout">Tạo giao dịch mới</a></div>`);
							$("#invoice-pdf").text(data.data.invoiceCode);
							$("#invoice-pdf").attr("href", data.data.downloadLink);
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
		  <td class="item-action-wrapper"><button class="item-action-add" type="button" onClick={addProductToChosenList("${
				p._id
			}")}>+</button>${
			p.quantity
		}<button class="item-action-remove" type="button" onClick={removeProductFromChosenList("${
			p._id
		}")}>-</button></td>
		  <td>${Number(p.priceSale * p.quantity).toLocaleString("vi", {
				style: "currency",
				currency: "VND",
			})}</td>
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
		$("#move-to-next").prop("disabled", false);
		if ($("#customer-info").length === 0) {
			$("#main-form")
				.append(`<div class="card card-step" data-step id="customer-info">
		<h5 class="card-title">Thông tin khách hàng</h5>
		<form id="form-checkout">
			<div class="mb-3 customer-data-group">
				<div class="form-group">
					<label
						style="padding-bottom:8px; margin-left: 24px;"
						for="customer-phone-number"
						class="customer-data-label"
					>Số điện thoại khách hàng</label>
					<input
						style="margin-left: auto; margin-right: auto; width: 96%"
						class="form-control"
						type="text"
						placeholder="Số điện thoại"
						id="customer-phone-number"
						name="customer-phone-number"
						onblur="getCustomerProfile()"
						onchange="handlePhoneNumberInputOnchange()"
					/>
				</div>
			</div>
			<div class="mb-3 customer-data-group">
				<div class="form-group">
					<label
						style="padding-bottom:8px; margin-left: 24px;"
						for="customer-name"
						class="customer-data-label"
					>Tên khách hàng</label>
					<input
						style="margin-left: auto; margin-right: auto; width: 96%"
						class="form-control"
						type="text"
						placeholder="Tên khách hàng"
						id="customer-name"
						name="customer-name"
						oninput="handleOnBlur()"
					/>
				</div>
			</div>
			<div class="mb-3 customer-data-group">
				<div class="form-group">
					<label
						style="padding-bottom:8px; margin-left: 24px;"
						for="customer-address"
						class="customer-data-label"
					>Địa chỉ</label>
					<input
						style="margin-left: auto; margin-right: auto; width: 96%"
						class="form-control"
						type="text"
						placeholder="Địa chỉ"
						id="customer-address"
						name="customer-address"
						oninput="handleOnBlur()"
					/>
				</div>
			</div>
		</form>

		<div class="text-nowrap" id="purchase-history">
			<h5 class="card-title">Lịch sử mua hàng</h5>
			<table class="table history-table">
				<thead>
					<tr>
						<th>Mã hóa đơn</th>
						<th>Tên khách hàng</th>
						<th>Tổng số hàng</th>

						<th>Tổng tiền</th>
						<th>Số tiền nhận</th>
						<th>Số tiền thừa</th>
						<th>Nhân viên</th>
						<th>Thời gian</th>
					</tr>
				</thead>
				<tbody
					class="tbody table-border-bottom-0"
					id="purchase-history-items"
				>
				</tbody>
			</table>
		</div>
		<div class="btn-group">
			<a type="button" class="btn-prev" href="#add-product">Trước</a>
			<a
				type="button"
				id="move-to-next-2"
				class="btn-next"
				disabled
			>Tiếp theo</a>
		</div>
	</div>`);
		}
		$("#move-to-next").click(function () {
			if (chosenItems.length === 0) {
				return false;
			}
		});
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
