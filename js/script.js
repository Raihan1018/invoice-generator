// Set current date in Bangladesh Standard Time (UTC+6)
document.addEventListener("DOMContentLoaded", () => {
  const nowUtc = new Date();
  // Add 6 hours offset for BST
  const nowBST = new Date(nowUtc.getTime() + 6 * 60 * 60 * 1000);
  const yyyy = nowBST.getFullYear();
  const mm = String(nowBST.getMonth() + 1).padStart(2, "0");
  const dd = String(nowBST.getDate()).padStart(2, "0");
  document.getElementById("date").value = `${yyyy}-${mm}-${dd}`;
});

function isFloat(value) {
  return /^\d*\.?\d*$/.test(value.trim());
}

function validateAndCalculate(cell) {
  const row = cell.closest("tr");
  const cells = row.querySelectorAll("td");
  const qtyCell = cells[1];
  const rateCell = cells[2];
  const amountCell = cells[3];

  const qty = parseFloat(qtyCell.innerText.trim()) || 0;
  const rate = parseFloat(rateCell.innerText.trim()) || 0;

  if (
    (!isFloat(qtyCell.innerText.trim()) && qtyCell.innerText) ||
    (!isFloat(rateCell.innerText.trim()) && rateCell.innerText)
  ) {
    alert("Only numbers are allowed.");
    if (!isFloat(qtyCell.innerText.trim())) qtyCell.innerText = "";
    if (!isFloat(rateCell.innerText.trim())) rateCell.innerText = "";
    amountCell.innerText = "";
    updateTotal();
    return;
  }

  const amount = (qty * rate).toFixed(2);
  amountCell.innerText = amount;
  updateTotal();
}

function updateTotal() {
  const rows = document.querySelectorAll("#table-body tr:not(#total-row)");
  let total = 0;
  rows.forEach((row) => {
    const amountCell = row.querySelectorAll("td")[3];
    const amount = parseFloat(amountCell.innerText) || 0;
    total += amount;
  });
  document.getElementById("total-amount").innerText = total.toFixed(2);
  document.getElementById("amount-in-words").innerText =
    toWords(total.toFixed(2)) + " Taka Only";
}

function addRow() {
  const tbody = document.getElementById("table-body");
  const totalRow = document.getElementById("total-row");
  const rowCount = tbody.querySelectorAll("tr").length - 1;
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
        <th>${String(rowCount + 1).padStart(2, "0")}</th>
        <td contenteditable="true">New Item</td>
        <td contenteditable="true" oninput="validateAndCalculate(this)"></td>
        <td contenteditable="true" oninput="validateAndCalculate(this)"></td>
        <td></td>
        <td class="print:hidden">
          <i class="fa-solid fa-trash text-red-600 cursor-pointer" onclick="deleteRow(this)"></i>
        </td>
      `;
  tbody.insertBefore(newRow, totalRow);
}

function deleteRow(icon) {
  icon.closest("tr").remove();
  updateTotal();
}

function toWords(amount) {
  const words = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (amount === "0.00") return "Zero";

  let num = parseInt(amount);
  let result = "";

  function getWord(n) {
    if (n < 20) return words[n];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tens[ten] + (unit ? " " + words[unit] : "");
  }

  if (num >= 100000) {
    result += getWord(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += getWord(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num >= 100) {
    result += getWord(Math.floor(num / 100)) + " Hundred ";
    num %= 100;
  }
  if (num > 0) {
    result += getWord(num);
  }

  return result.trim();
}

// Share PDF Button Handler
document.getElementById("share-btn").addEventListener("click", async () => {
  const invoice = document.getElementById("invoice");
  const noPrintElem = document.querySelector(".no-print-share");

  // Hide BILL NO, Cash Memo No, Date before capture for sharing PDF only
  noPrintElem.classList.add("hide-for-share");

  html2canvas(invoice, { scale: 2, useCORS: true }).then(async (canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("p", "pt", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], "MSS_SHAMMI_CONSTRUCTION.pdf", {
      type: "application/pdf",
    });

    // Show fields back immediately
    noPrintElem.classList.remove("hide-for-share");

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "Invoice PDF",
          text: "Sharing Invoice PDF from Shammi Construction",
          files: [file],
        });
      } catch (err) {
        alert("Error sharing file: " + err);
      }
    } else {
      alert(
        "Your browser does not support file sharing. The PDF will be downloaded."
      );
      pdf.save("invoice.pdf");
    }
  });
});
