/* =========================================
   PD COACHING - FEES SYSTEM
========================================= */

let students = JSON.parse(
    localStorage.getItem("pdStudents") || "[]"
);

let feeRecords = JSON.parse(
    localStorage.getItem("pdFeeRecords") || "{}"
);

let currentFilter = "all";
let selectedStudentId = null;


/* =========================================
   SAVE FEE DATA
========================================= */

function saveFeeRecords() {

    localStorage.setItem(
        "pdFeeRecords",
        JSON.stringify(feeRecords)
    );

}


/* =========================================
   CURRENT MONTH
========================================= */

function getCurrentMonth() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0")
    );

}


/* =========================================
   GET SELECTED MONTH
========================================= */

function getSelectedMonth() {

    const input =
        document.getElementById("monthSelect");

    return input.value || getCurrentMonth();

}


/* =========================================
   FEE RECORD KEY
========================================= */

function getFeeKey(studentId, month) {

    return studentId + "_" + month;

}


/* =========================================
   GET FEE RECORD
========================================= */

function getFeeRecord(studentId, month) {

    const key =
        getFeeKey(studentId, month);

    if (!feeRecords[key]) {

        feeRecords[key] = {

            studentId: studentId,

            month: month,

            status: "Pending",

            paymentDate: "",

            paidThrough: ""

        };

    }

    return feeRecords[key];

}


/* =========================================
   PREPARE RECORDS
========================================= */

function prepareRecords(month) {

    students.forEach(student => {

        getFeeRecord(
            student.id,
            month
        );

    });

    saveFeeRecords();

}


/* =========================================
   RENDER FEES
========================================= */

function renderFees() {

    students =
        JSON.parse(
            localStorage.getItem("pdStudents") || "[]"
        );

    const month =
        getSelectedMonth();

    prepareRecords(month);


    const table =
        document.getElementById("feesTable");

    const empty =
        document.getElementById("emptyState");


    const searchInput =
        document.getElementById("searchInput");


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let filteredStudents =
        students.filter(student => {

            return (

                String(student.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.className || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.phone || "")
                    .includes(search)

            );

        });


    /* STATUS FILTER */

    if (currentFilter === "paid") {

        filteredStudents =
            filteredStudents.filter(student => {

                const record =
                    getFeeRecord(
                        student.id,
                        month
                    );

                return record.status === "Paid";

            });

    }


    if (currentFilter === "pending") {

        filteredStudents =
            filteredStudents.filter(student => {

                const record =
                    getFeeRecord(
                        student.id,
                        month
                    );

                return record.status === "Pending";

            });

    }


    table.innerHTML = "";


    /* NO STUDENTS */

    if (filteredStudents.length === 0) {

        table.style.display = "none";

        empty.style.display = "block";

    }

    else {

        table.style.display = "table";

        empty.style.display = "none";


        filteredStudents.forEach(student => {

            const record =
                getFeeRecord(
                    student.id,
                    month
                );


            const row =
                document.createElement("tr");


            let actionHTML = "";

            let statusHTML = "";

            let paidThroughHTML = "";


            /* PAID */

            if (record.status === "Paid") {

                statusHTML = `
                    <span class="status paid">
                        ✓ Paid
                    </span>
                `;


                paidThroughHTML = `
                    <span class="payment-method">
                        ${escapeHTML(
                            record.paidThrough || "Other"
                        )}
                    </span>
                `;


                actionHTML = `
                    <button
                        class="undo-btn"
                        onclick="undoPayment('${student.id}')">

                        Undo

                    </button>
                `;

            }


            /* PENDING */

            else {

                statusHTML = `
                    <span class="status pending">
                        ! Pending
                    </span>
                `;


                paidThroughHTML = "—";


                actionHTML = `
                    <button
                        class="pay-btn"
                        onclick="openPaymentModal('${student.id}')">

                        Mark Paid

                    </button>
                `;

            }


            row.innerHTML = `

                <!-- STUDENT -->

                <td>

                    <div class="student-name">
                        ${escapeHTML(student.name || "—")}
                    </div>

                    <div class="student-id">
                        ID: ${String(student.id).slice(-6)}
                    </div>

                </td>


                <!-- PHONE -->

                <td class="phone-number">

                    ${escapeHTML(student.phone || "—")}

                </td>


                <!-- CLASS -->

                <td class="class-name">

                    ${escapeHTML(student.className || "—")}

                </td>


                <!-- FEE -->

                <td class="fee">

                    ₹${Number(student.fee || 0)
                        .toLocaleString("en-IN")}

                </td>


                <!-- STATUS -->

                <td>

                    ${statusHTML}

                </td>


                <!-- PAYMENT DATE -->

                <td class="payment-date">

                    ${
                        record.paymentDate
                        ? formatDate(record.paymentDate)
                        : "—"
                    }

                </td>


                <!-- PAID THROUGH -->

                <td>

                    ${paidThroughHTML}

                </td>


                <!-- ACTION -->

                <td>

                    ${actionHTML}

                </td>

            `;


            table.appendChild(row);

        });

    }


    updateStats(month);

    updateMonthTitle(month);

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats(month) {

    let expected = 0;

    let collected = 0;

    let pending = 0;


    students.forEach(student => {

        const amount =
            Number(student.fee || 0);

        expected += amount;


        const record =
            getFeeRecord(
                student.id,
                month
            );


        if (record.status === "Paid") {

            collected += amount;

        }

        else {

            pending += amount;

        }

    });


    let rate = 0;


    if (expected > 0) {

        rate =
            Math.round(
                (collected / expected) * 100
            );

    }


    document.getElementById(
        "expectedAmount"
    ).textContent =
        "₹" +
        expected.toLocaleString("en-IN");


    document.getElementById(
        "collectedAmount"
    ).textContent =
        "₹" +
        collected.toLocaleString("en-IN");


    document.getElementById(
        "pendingAmount"
    ).textContent =
        "₹" +
        pending.toLocaleString("en-IN");


    document.getElementById(
        "collectionRate"
    ).textContent =
        rate + "%";


    document.getElementById(
        "studentCount"
    ).textContent =
        students.length +
        (
            students.length === 1
                ? " Student"
                : " Students"
        );

}


/* =========================================
   MONTH TITLE
========================================= */

function updateMonthTitle(month) {

    const date =
        new Date(month + "-01");


    const formatted =
        date.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "monthTitle"
    ).textContent =
        "Fee register for " +
        formatted;

}


/* =========================================
   OPEN PAYMENT MODAL
========================================= */

function openPaymentModal(studentId) {

    const student =
        students.find(
            student =>
                student.id === studentId
        );


    if (!student) {
        return;
    }


    selectedStudentId =
        studentId;


    document.getElementById(
        "paymentStudentName"
    ).textContent =
        student.name;


    document.getElementById(
        "paymentAmount"
    ).textContent =
        "₹" +
        Number(student.fee || 0)
            .toLocaleString("en-IN");


    document.getElementById(
        "paymentDate"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    /* RESET PAYMENT METHOD */

    document.getElementById(
        "paidThrough"
    ).value = "";


    document
        .getElementById("paymentModal")
        .classList.add("show");

}


/* =========================================
   CLOSE PAYMENT MODAL
========================================= */

function closePaymentModal() {

    document
        .getElementById("paymentModal")
        .classList.remove("show");


    selectedStudentId = null;

}


/* =========================================
   CONFIRM PAYMENT
========================================= */

function confirmPayment() {

    if (!selectedStudentId) {
        return;
    }


    const month =
        getSelectedMonth();


    const paymentDate =
        document.getElementById(
            "paymentDate"
        ).value;


    const paidThrough =
        document.getElementById(
            "paidThrough"
        ).value;


    /* DATE CHECK */

    if (!paymentDate) {

        showToast(
            "Please select payment date."
        );

        return;

    }


    /* PAYMENT METHOD CHECK */

    if (!paidThrough) {

        showToast(
            "Please select payment method."
        );

        return;

    }


    const record =
        getFeeRecord(
            selectedStudentId,
            month
        );


    record.status = "Paid";

    record.paymentDate =
        paymentDate;

    record.paidThrough =
        paidThrough;


    saveFeeRecords();


    renderFees();


    closePaymentModal();


    showToast(
        "Fee marked as paid successfully."
    );

}


/* =========================================
   UNDO PAYMENT
========================================= */

function undoPayment(studentId) {

    const month =
        getSelectedMonth();


    const record =
        getFeeRecord(
            studentId,
            month
        );


    if (record.status !== "Paid") {
        return;
    }


    const confirmed =
        confirm(
            "Mark this fee as pending again?"
        );


    if (!confirmed) {
        return;
    }


    record.status = "Pending";

    record.paymentDate = "";

    record.paidThrough = "";


    saveFeeRecords();


    renderFees();


    showToast(
        "Payment moved back to pending."
    );

}


/* =========================================
   SEARCH
========================================= */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function () {

            renderFees();

        }
    );


/* =========================================
   MONTH CHANGE
========================================= */

document
    .getElementById("monthSelect")
    .addEventListener(
        "change",
        function () {

            renderFees();

        }
    );


/* =========================================
   FILTER BUTTONS
========================================= */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                this.classList.add("active");


                currentFilter =
                    this.dataset.filter;


                renderFees();

            }
        );

    });


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date) {

    if (!date) {
        return "—";
    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


/* =========================================
   HTML SECURITY
========================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

}


/* =========================================
   CLOSE MODAL ON BACKDROP
========================================= */

document
    .getElementById("paymentModal")
    .addEventListener(
        "click",
        function (event) {

            if (event.target === this) {

                closePaymentModal();

            }

        }
    );


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closePaymentModal();

        }

    }
);


/* =========================================
   SET CURRENT MONTH
========================================= */

document.getElementById(
    "monthSelect"
).value =
    getCurrentMonth();


/* =========================================
   INITIAL LOAD
========================================= */

renderFees();