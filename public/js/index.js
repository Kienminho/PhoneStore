const tbody = $(".tbody");
const tbodyDetails = $(".tbody-detail");
const employee = $(".employee");
const invoice = $(".invoice");
const money = $(".total-money");
const quantity = $(".quantity");
const fromDateDefault = $(".from-date").val();
const toDateDefault = $(".to-date").val();

getData(fromDateDefault, toDateDefault);

fetch("/api/statistical/get-data")
  .then((res) => res.json())
  .then((res) => {
    $(employee).text(res.data.userNumber);
    $(invoice).text(res.data.invoiceNumber);
    $(money).text(res.data.money.toLocaleString("vi-VN"));
    $(quantity).text(res.data.quantity);
  })
  .catch((err) => console.log(err));

function search() {
  const fromDate = $(".from-date").val();
  const toDate = $(".to-date").val();
  getData(fromDate, toDate);
}

function getData(fromDate, toDate) {
  fetch("/api/statistical/get-data-by-date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fromDate: fromDate, toDate: toDate }),
  })
    .then((res) => res.json())
    .then((res) => {
      displayData(res.data);
    })
    .catch((err) => console.log(err));
}

function displayData(arr) {
  tbody.empty();
  arr.map((item) => {
    let html = `<tr>
    <td><i class="fab fa-angular fa-lg text-danger me-3 r"></i> <strong onclick="deatailInvoice(this)" class="cursor-pointe id">${
      item.invoiceCode
    }</strong></td>
    <td>${item.employeeName}</td>
    <td>${item.customerName}</td>
    <td>${item.quantity}</td>
    <td>${item.totalMoney.toLocaleString("vi-VN")}</td>
    <td>${new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>`;
    tbody.append(html);
  });
}

function deatailInvoice(element) {
  $("#detail-invoice-modal").modal("show");
  const id = $(element).text();
  fetch(`/api/invoices/get-detail/${id}`)
    .then((res) => res.json())
    .then((res) => {
      displayDetails(res.data);
    })
    .catch((err) => console.log(err));
}

function displayDetails(arr) {
  tbodyDetails.empty();
  arr.map((item, index) => {
    let html = `<tr>
    <td><i class="fab fa-angular fa-lg text-danger me-3 r"></i> <strong onclick="deatailInvoice(this)" class="cursor-pointe id">${
      index + 1
    }</strong></td>
    <td>${item.invoice}</td>
    <td>${item.productName}</td>
    <td>${item.quantity}</td>
    <td>${item.unitPrice.toLocaleString("vi-VN")}</td>
    <td>${new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>`;
    tbodyDetails.append(html);
  });
}
