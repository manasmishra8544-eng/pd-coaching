/* =========================================
   PD COACHING MANAGEMENT SYSTEM
========================================= */

let students = JSON.parse(localStorage.getItem("pd_students") || "[]");
let fees = JSON.parse(localStorage.getItem("pd_fees") || "[]");
let attendance = JSON.parse(localStorage.getItem("pd_attendance") || "[]");
let tests = JSON.parse(localStorage.getItem("pd_tests") || "[]");
let settings = JSON.parse(
    localStorage.getItem("pd_settings") ||
    '{"coachingName":"PD Coaching","teacherName":"Pankaj Durvadi"}'
);

let editingStudentId = null;
let attendanceState = {};


/* =========================================
   SAVE DATA
========================================= */

function saveAll() {
    localStorage.setItem("pd_students", JSON.stringify(students));
    localStorage.setItem("pd_fees", JSON.stringify(fees));
    localStorage.setItem("pd_attendance", JSON.stringify(attendance));
    localStorage.setItem("pd_tests", JSON.stringify(tests));
    localStorage.setItem("pd_settings", JSON.stringify(settings));
}


/* =========================================
   NAVIGATION
========================================= */

const titles = {
    dashboard: ["Dashboard", "Your coaching overview"],
    students: ["Students", "Manage every student"],
    fees: ["Monthly Fees", "Track monthly payments"],
    attendance: ["Attendance", "Daily student records"],
    tests: ["Tests & Marks", "Student performance"],
    reports: ["Reports", "Coaching insights"],
    reminders: ["Fee Reminders", "Pending monthly payments"],
    settings: ["Settings", "System preferences"]
};

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {
        showSection(button.dataset.section);
    });

});


function showSection(section) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    const target = document.getElementById(section);

    if (target) {
        target.classList.add("active-page");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.section === section) {
            item.classList.add("active");
        }
    });

    if (titles[section]) {
        document.getElementById("pageTitle").textContent =
            titles[section][0];

        document.getElementById("pageSubtitle").textContent =
            titles[section][1];
    }

    if (section === "students") renderStudents();
    if (section === "fees") renderFees();
    if (section === "attendance") renderAttendance();
    if (section === "tests") renderTests();
    if (section === "reports") renderReports();
    if (section === "reminders") renderReminders();
}


/* =========================================
   DATE
========================================= */

const today = new Date();

document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });


function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}


/* =========================================
   STUDENT MODAL
========================================= */

function openStudentModal(id = null) {

    editingStudentId = id;

    const modal = document.getElementById("studentModal");

    modal.classList.add("show");

    if (id) {

        const student = students.find(s => s.id === id);

        if (!student) return;

        document.getElementById("modalTitle").textContent =
            "Edit Student";

        document.getElementById("studentName").value =
            student.name;

        document.getElementById("studentPhone").value =
            student.phone;

        document.getElementById("studentClass").value =
            student.className;

        document.getElementById("studentFee").value =
            student.fee;

    } else {

        document.getElementById("modalTitle").textContent =
            "Add Student";

        document.getElementById("studentName").value = "";
        document.getElementById("studentPhone").value = "";
        document.getElementById("studentClass").value = "";
        document.getElementById("studentFee").value = "";

    }
}


function closeStudentModal() {

    document
        .getElementById("studentModal")
        .classList.remove("show");

    editingStudentId = null;
}


/* =========================================
   SAVE STUDENT
========================================= */

function saveStudent() {

    const name =
        document.getElementById("studentName").value.trim();

    const phone =
        document.getElementById("studentPhone").value.trim();

    const className =
        document.getElementById("studentClass").value;

    const fee =
        Number(document.getElementById("studentFee").value);


    if (!name || !phone || !className || !fee) {

        toast("Please fill all student details.");

        return;
    }


    if (editingStudentId) {

        const student =
            students.find(s => s.id === editingStudentId);

        student.name = name;
        student.phone = phone;
        student.className = className;
        student.fee = fee;

        toast("Student updated.");

    } else {

        students.push({

            id: Date.now(),

            name,
            phone,
            className,
            fee,

            joined:
                new Date().toISOString()

        });

        toast("Student added successfully.");
    }


    saveAll();

    closeStudentModal();

    refreshEverything();
}


/* =========================================
   STUDENTS
========================================= */

function renderStudents() {

    const search =
        document.getElementById("studentSearch").value
        .toLowerCase();

    const classFilter =
        document.getElementById("classFilter").value;


    const filtered =
        students.filter(student => {

            const matchSearch =
                student.name.toLowerCase().includes(search) ||
                student.phone.includes(search);

            const matchClass =
                !classFilter ||
                student.className === classFilter;

            return matchSearch && matchClass;
        });


    const table =
        document.getElementById("studentTable");

    table.innerHTML = "";


    filtered.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>${escapeHTML(student.name)}</strong>
            </td>

            <td>${escapeHTML(student.phone)}</td>

            <td>${escapeHTML(student.className)}</td>

            <td>₹${student.fee.toLocaleString("en-IN")}</td>

            <td>
                ${new Date(student.joined).toLocaleDateString("en-IN")}
            </td>

            <td>
                <button
                    class="action-btn"
                    onclick="openStudentModal(${student.id})">
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });


    document.getElementById("studentEmpty").style.display =
        filtered.length ? "none" : "block";


    updateStudentSelects();
}


function deleteStudent(id) {

    const student =
        students.find(s => s.id === id);

    if (!student) return;


    if (!confirm(
        `Delete ${student.name}? This will also remove related records.`
    )) return;


    students =
        students.filter(s => s.id !== id);

    fees =
        fees.filter(f => f.studentId !== id);

    attendance =
        attendance.filter(a => a.studentId !== id);

    tests =
        tests.filter(t => t.studentId !== id);


    saveAll();

    refreshEverything();

    toast("Student deleted.");
}


/* =========================================
   SEARCH
========================================= */

document
    .getElementById("studentSearch")
    .addEventListener("input", renderStudents);

document
    .getElementById("classFilter")
    .addEventListener("change", renderStudents);


/* =========================================
   FEE SELECTS
========================================= */

function updateStudentSelects() {

    const feeSelect =
        document.getElementById("feeStudent");

    const testSelect =
        document.getElementById("testStudent");


    feeSelect.innerHTML =
        `<option value="">Select student</option>`;

    testSelect.innerHTML =
        `<option value="">Select student</option>`;


    students.forEach(student => {

        const option1 =
            document.createElement("option");

        option1.value = student.id;

        option1.textContent =
            `${student.name} — ${student.className}`;

        feeSelect.appendChild(option1);


        const option2 =
            option1.cloneNode(true);

        testSelect.appendChild(option2);
    });
}


/* =========================================
   FEES
========================================= */

document.getElementById("feeMonth").value =
    currentMonth();


function markFeePaid() {

    const studentId =
        Number(document.getElementById("feeStudent").value);

    const month =
        document.getElementById("feeMonth").value;

    const amount =
        Number(document.getElementById("feeAmount").value);


    if (!studentId || !month || !amount) {

        toast("Select student, month and amount.");

        return;
    }


    const existing =
        fees.find(
            f =>
                f.studentId === studentId &&
                f.month === month
        );


    if (existing) {

        existing.amount = amount;

        existing.status = "paid";

        existing.paymentDate =
            new Date().toISOString();

    } else {

        fees.push({

            id: Date.now(),

            studentId,

            month,

            amount,

            status: "paid",

            paymentDate:
                new Date().toISOString()

        });
    }


    saveAll();

    renderFees();

    updateDashboard();

    toast("Fee marked as paid.");
}


function renderFees() {

    const table =
        document.getElementById("feeTable");

    table.innerHTML = "";


    if (!students.length) {

        document.getElementById("feeEmpty").style.display =
            "block";

        return;
    }


    const month =
        document.getElementById("feeMonth").value ||
        currentMonth();


    students.forEach(student => {

        const record =
            fees.find(
                f =>
                    f.studentId === student.id &&
                    f.month === month
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${escapeHTML(student.name)}</strong>
            </td>

            <td>${month}</td>

            <td>
                ₹${record
                    ? record.amount.toLocaleString("en-IN")
                    : student.fee.toLocaleString("en-IN")}
            </td>

            <td>
                <span class="status ${record ? "paid" : "pending"}">
                    ${record ? "PAID" : "PENDING"}
                </span>
            </td>

            <td>
                ${
                    record
                    ? new Date(record.paymentDate)
                        .toLocaleDateString("en-IN")
                    : "—"
                }
            </td>

            <td>
                ${
                    record
                    ? `<button class="action-btn delete-btn"
                        onclick="markFeePending(${student.id}, '${month}')">
                        Undo
                       </button>`
                    : `<button class="action-btn"
                        onclick="quickPay(${student.id}, '${month}')">
                        Mark Paid
                       </button>`
                }
            </td>
        `;

        table.appendChild(row);
    });


    document.getElementById("feeEmpty").style.display =
        "none";
}


function quickPay(studentId, month) {

    const student =
        students.find(s => s.id === studentId);

    if (!student) return;


    fees.push({

        id: Date.now(),

        studentId,

        month,

        amount: student.fee,

        status: "paid",

        paymentDate:
            new Date().toISOString()

    });


    saveAll();

    refreshEverything();

    toast("Fee marked as paid.");
}


function markFeePending(studentId, month) {

    fees =
        fees.filter(
            f =>
                !(
                    f.studentId === studentId &&
                    f.month === month
                )
        );


    saveAll();

    refreshEverything();

    toast("Fee moved to pending.");
}


document
    .getElementById("feeMonth")
    .addEventListener("change", renderFees);


/* =========================================
   ATTENDANCE
========================================= */

document.getElementById("attendanceDate").value =
    new Date().toISOString().slice(0,10);


function renderAttendance() {

    const container =
        document.getElementById("attendanceList");

    container.innerHTML = "";


    if (!students.length) {

        container.innerHTML =
            `<div class="empty">Add students first.</div>`;

        return;
    }


    const date =
        document.getElementById("attendanceDate").value;


    students.forEach(student => {

        const existing =
            attendance.find(
                a =>
                    a.studentId === student.id &&
                    a.date === date
            );


        const row =
            document.createElement("div");

        row.className =
            "attendance-row";


        row.innerHTML = `

            <div>
                <strong>${escapeHTML(student.name)}</strong>
                <small>${escapeHTML(student.className)}</small>
            </div>

            <div class="attendance-buttons">

                <button
                    class="${existing?.status === "present"
                        ? "selected-present"
                        : ""}"
                    onclick="setAttendance(
                        ${student.id},
                        '${date}',
                        'present'
                    )">
                    Present
                </button>

                <button
                    class="${existing?.status === "absent"
                        ? "selected-absent"
                        : ""}"
                    onclick="setAttendance(
                        ${student.id},
                        '${date}',
                        'absent'
                    )">
                    Absent
                </button>

            </div>
        `;


        container.appendChild(row);
    });
}


function setAttendance(studentId, date, status) {

    const existing =
        attendance.find(
            a =>
                a.studentId === studentId &&
                a.date === date
        );


    if (existing) {

        existing.status = status;

    } else {

        attendance.push({

            id: Date.now(),

            studentId,

            date,

            status

        });
    }


    saveAll();

    renderAttendance();

    updateDashboard();
}


function saveAttendance() {

    toast("Attendance saved.");

    updateDashboard();
}


document
    .getElementById("attendanceDate")
    .addEventListener("change", renderAttendance);


/* =========================================
   TESTS
========================================= */

function addTest() {

    const name =
        document.getElementById("testName").value.trim();

    const subject =
        document.getElementById("testSubject").value.trim();

    const studentId =
        Number(document.getElementById("testStudent").value);

    const total =
        Number(document.getElementById("testTotal").value);

    const obtained =
        Number(document.getElementById("testObtained").value);


    if (!name || !subject || !studentId || !total || obtained < 0) {

        toast("Fill all test details.");

        return;
    }


    if (obtained > total) {

        toast("Obtained marks cannot exceed total marks.");

        return;
    }


    tests.push({

        id: Date.now(),

        name,

        subject,

        studentId,

        total,

        obtained,

        date:
            new Date().toISOString()

    });


    saveAll();

    renderTests();

    updateDashboard();


    document.getElementById("testName").value = "";
    document.getElementById("testSubject").value = "";
    document.getElementById("testTotal").value = "";
    document.getElementById("testObtained").value = "";

    toast("Test result added.");
}


function renderTests() {

    const table =
        document.getElementById("testTable");

    table.innerHTML = "";


    tests.forEach(test => {

        const student =
            students.find(
                s => s.id === test.studentId
            );


        if (!student) return;


        const percentage =
            ((test.obtained / test.total) * 100)
            .toFixed(1);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(test.name)}</td>

            <td>${escapeHTML(test.subject)}</td>

            <td>${escapeHTML(student.name)}</td>

            <td>
                ${test.obtained}/${test.total}
            </td>

            <td>
                ${percentage}%
            </td>

            <td>
                <button
                    class="action-btn delete-btn"
                    onclick="deleteTest(${test.id})">
                    Delete
                </button>
            </td>
        `;


        table.appendChild(row);
    });


    document.getElementById("testEmpty").style.display =
        tests.length ? "none" : "block";
}


function deleteTest(id) {

    tests =
        tests.filter(t => t.id !== id);

    saveAll();

    refreshEverything();

    toast("Test deleted.");
}


/* =========================================
   REMINDERS
========================================= */

function getPendingFees() {

    const month =
        currentMonth();


    return students.filter(student => {

        const paid =
            fees.some(
                f =>
                    f.studentId === student.id &&
                    f.month === month &&
                    f.status === "paid"
            );

        return !paid;
    });
}


function renderReminders() {

    const container =
        document.getElementById("reminderList");

    container.innerHTML = "";


    const pending =
        getPendingFees();


    if (!pending.length) {

        container.innerHTML =
            `<div class="panel empty">
                No pending fees for this month.
            </div>`;

        return;
    }


    pending.forEach(student => {

        const card =
            document.createElement("div");

        card.className =
            "reminder-card";


        card.innerHTML = `

            <h3>${escapeHTML(student.name)}</h3>

            <p>
                ${escapeHTML(student.className)}
                · ${escapeHTML(student.phone)}
            </p>

            <div class="pending-money">
                ₹${student.fee.toLocaleString("en-IN")}
            </div>

            <small>
                Current month fee pending
            </small>

            <button
                class="primary-btn"
                onclick="quickPay(${student.id}, '${currentMonth()}')">
                Mark Paid
            </button>

        `;


        container.appendChild(card);
    });
}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const month =
        currentMonth();


    const collected =
        fees
            .filter(
                f =>
                    f.month === month &&
                    f.status === "paid"
            )
            .reduce(
                (sum, f) => sum + Number(f.amount),
                0
            );


    const pendingStudents =
        getPendingFees();


    const pendingAmount =
        pendingStudents
            .reduce(
                (sum, s) => sum + Number(s.fee),
                0
            );


    document.getElementById("totalStudents")
        .textContent = students.length;


    document.getElementById("totalCollected")
        .textContent =
        "₹" + collected.toLocaleString("en-IN");


    document.getElementById("totalPending")
        .textContent =
        "₹" + pendingAmount.toLocaleString("en-IN");


    document.getElementById("pendingStudents")
        .textContent =
        `${pendingStudents.length} students`;


    let present = 0;
    let totalAttendance = 0;


    attendance.forEach(record => {

        totalAttendance++;

        if (record.status === "present") {
            present++;
        }
    });


    const attendancePercent =
        totalAttendance
            ? Math.round(
                (present / totalAttendance) * 100
            )
            : 0;


    document.getElementById("attendancePercent")
        .textContent =
        attendancePercent + "%";


    document.getElementById("reportStudents")
        .textContent =
        students.length;


    document.getElementById("reportCollected")
        .textContent =
        "₹" + collected.toLocaleString("en-IN");


    document.getElementById("reportPending")
        .textContent =
        "₹" + pendingAmount.toLocaleString("en-IN");


    document.getElementById("reportTests")
        .textContent =
        tests.length;


    renderRecentStudents();

    renderDashboardReminders();

    renderSummary();
}


function renderRecentStudents() {

    const container =
        document.getElementById("recentStudents");

    container.innerHTML = "";


    const recent =
        [...students]
        .reverse()
        .slice(0, 5);


    if (!recent.length) {

        container.innerHTML =
            `<div class="empty">
                No students added yet.
            </div>`;

        return;
    }


    recent.forEach(student => {

        const div =
            document.createElement("div");

        div.className =
            "attendance-row";


        div.innerHTML = `

            <div>
                <strong>${escapeHTML(student.name)}</strong>
                <small>
                    ${escapeHTML(student.className)}
                    · ₹${student.fee}
                </small>
            </div>

            <small>
                ${student.phone}
            </small>
        `;


        container.appendChild(div);
    });
}


function renderDashboardReminders() {

    const container =
        document.getElementById("dashboardReminders");

    container.innerHTML = "";


    const pending =
        getPendingFees().slice(0, 4);


    if (!pending.length) {

        container.innerHTML =
            `<div class="empty">
                All fees are clear 🎉
            </div>`;

        return;
    }


    pending.forEach(student => {

        const div =
            document.createElement("div");

        div.className =
            "attendance-row";


        div.innerHTML = `

            <div>
                <strong>${escapeHTML(student.name)}</strong>
                <small>Fee pending</small>
            </div>

            <strong style="color:#ff6577">
                ₹${student.fee}
            </strong>
        `;


        container.appendChild(div);
    });
}


/* =========================================
   REPORT
========================================= */

function renderReports() {

    updateDashboard();

    renderSummary();
}


function renderSummary() {

    const summary =
        document.getElementById("summary");

    if (!summary) return;


    const totalFees =
        students.reduce(
            (sum, s) => sum + Number(s.fee),
            0
        );


    const paid =
        fees.filter(
            f =>
                f.month === currentMonth() &&
                f.status === "paid"
        ).length;


    summary.innerHTML = `

        <div class="summary-item">
            <span>Registered Students</span>
            <strong>${students.length}</strong>
        </div>

        <div class="summary-item">
            <span>Expected Monthly Collection</span>
            <strong>
                ₹${totalFees.toLocaleString("en-IN")}
            </strong>
        </div>

        <div class="summary-item">
            <span>Fees Paid This Month</span>
            <strong>${paid}</strong>
        </div>

        <div class="summary-item">
            <span>Total Tests</span>
            <strong>${tests.length}</strong>
        </div>
    `;
}


/* =========================================
   SETTINGS
========================================= */

document.getElementById("coachingName").value =
    settings.coachingName;

document.getElementById("teacherName").value =
    settings.teacherName;


function saveSettings() {

    settings.coachingName =
        document.getElementById("coachingName").value;

    settings.teacherName =
        document.getElementById("teacherName").value;


    saveAll();

    toast("Settings saved.");
}


/* =========================================
   EXPORT
========================================= */

function exportData() {

    const data = {

        students,

        fees,

        attendance,

        tests,

        settings,

        exportedAt:
            new Date().toISOString()

    };


    const blob =
        new Blob(
            [JSON.stringify(data, null, 2)],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        `PD-Coaching-Backup-${currentMonth()}.json`;

    a.click();


    URL.revokeObjectURL(url);

    toast("Backup downloaded.");
}


/* =========================================
   RESET
========================================= */

function resetData() {

    const confirmation =
        prompt(
            'Type RESET to delete all coaching data.'
        );


    if (confirmation !== "RESET") {

        toast("Reset cancelled.");

        return;
    }


    students = [];
    fees = [];
    attendance = [];
    tests = [];


    saveAll();

    refreshEverything();

    toast("All data has been reset.");
}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function toast(message) {

    const element =
        document.getElementById("toast");

    element.textContent =
        message;

    element.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            element.classList.remove("show");

        }, 2500);
}


/* =========================================
   SECURITY
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
   REFRESH EVERYTHING
========================================= */

function refreshEverything() {

    updateDashboard();

    renderStudents();

    renderFees();

    renderAttendance();

    renderTests();

    renderReminders();

    updateStudentSelects();
}


/* =========================================
   INITIAL LOAD
========================================= */

refreshEverything();