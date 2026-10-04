/* =========================================
   PD COACHING - ATTENDANCE SYSTEM
========================================= */

let students = [];
let attendanceData = {};

const STORAGE_KEY = "pdAttendance";

/* =========================================
   LOAD DATA
========================================= */

function loadData() {

    students = JSON.parse(
        localStorage.getItem("pdStudents") || "[]"
    );

    attendanceData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    );
}


/* =========================================
   SAVE DATA
========================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(attendanceData)
    );
}


/* =========================================
   CURRENT DATE
========================================= */

function getToday() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );
}


/* =========================================
   SELECTED DATE
========================================= */

function getSelectedDate() {

    const input =
        document.getElementById("attendanceDate");

    return input.value || getToday();
}


/* =========================================
   DATE KEY
========================================= */

function getDateData(date) {

    if (!attendanceData[date]) {
        attendanceData[date] = {};
    }

    return attendanceData[date];
}


/* =========================================
   GET STUDENT STATUS
========================================= */

function getStudentStatus(studentId, date) {

    const dayData =
        getDateData(date);

    return dayData[String(studentId)] || "";
}


/* =========================================
   SET STUDENT STATUS
========================================= */

function setStudentStatus(studentId, status) {

    const date =
        getSelectedDate();

    const dayData =
        getDateData(date);

    dayData[String(studentId)] = status;

    saveData();

    renderAttendance();

    showToast(
        status === "Present"
            ? "Student marked Present."
            : "Student marked Absent."
    );
}


/* =========================================
   RENDER ATTENDANCE
========================================= */

function renderAttendance() {

    loadData();

    const date =
        getSelectedDate();

    const table =
        document.getElementById("attendanceTable");

    const empty =
        document.getElementById("emptyState");

    const searchInput =
        document.getElementById("searchInput");

    const search =
        searchInput
            ? searchInput.value.toLowerCase().trim()
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


    table.innerHTML = "";


    /* NO STUDENTS */

    if (filteredStudents.length === 0) {

        table.style.display = "none";

        empty.style.display = "block";

    } else {

        table.style.display = "table";

        empty.style.display = "none";


        filteredStudents.forEach(student => {

            const status =
                getStudentStatus(
                    student.id,
                    date
                );


            let statusHTML = `
                <span class="status not-marked">
                    Not Marked
                </span>
            `;


            if (status === "Present") {

                statusHTML = `
                    <span class="status present">
                        ✓ Present
                    </span>
                `;

            }


            if (status === "Absent") {

                statusHTML = `
                    <span class="status absent">
                        × Absent
                    </span>
                `;

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="student-name">
                        ${escapeHTML(
                            student.name || "—"
                        )}
                    </div>

                    <div class="student-id">
                        ID: ${String(student.id).slice(-6)}
                    </div>

                </td>


                <td class="phone-number">

                    ${escapeHTML(
                        student.phone || "—"
                    )}

                </td>


                <td class="class-name">

                    ${escapeHTML(
                        student.className || "—"
                    )}

                </td>


                <td>

                    ${statusHTML}

                </td>


                <td>

                    <div class="attendance-actions">

                        <button
                            class="attendance-btn present ${
                                status === "Present"
                                    ? "active"
                                    : ""
                            }"
                            onclick="setStudentStatus(
                                '${escapeHTML(String(student.id))}',
                                'Present'
                            )"
                        >
                            ✓ Present
                        </button>


                        <button
                            class="attendance-btn absent ${
                                status === "Absent"
                                    ? "active"
                                    : ""
                            }"
                            onclick="setStudentStatus(
                                '${escapeHTML(String(student.id))}',
                                'Absent'
                            )"
                        >
                            × Absent
                        </button>

                    </div>

                </td>

            `;


            table.appendChild(row);

        });

    }


    updateStats(date);

    updateDateTitle(date);

    updateStudentCount();

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats(date) {

    let present = 0;
    let absent = 0;

    students.forEach(student => {

        const status =
            getStudentStatus(
                student.id,
                date
            );

        if (status === "Present") {
            present++;
        }

        if (status === "Absent") {
            absent++;
        }

    });


    const total =
        students.length;


    let rate = 0;

    if (total > 0) {

        rate =
            Math.round(
                (present / total) * 100
            );

    }


    document.getElementById(
        "totalStudents"
    ).textContent = total;


    document.getElementById(
        "presentCount"
    ).textContent = present;


    document.getElementById(
        "absentCount"
    ).textContent = absent;


    document.getElementById(
        "attendanceRate"
    ).textContent = rate + "%";

}


/* =========================================
   DATE TITLE
========================================= */

function updateDateTitle(date) {

    const formatted =
        new Date(date + "T00:00:00")
            .toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


    document.getElementById(
        "dateTitle"
    ).textContent =
        "Attendance for " + formatted;

}


/* =========================================
   STUDENT COUNT
========================================= */

function updateStudentCount() {

    const count =
        students.length;


    document.getElementById(
        "studentCount"
    ).textContent =
        count +
        (
            count === 1
                ? " Student"
                : " Students"
        );

}


/* =========================================
   MARK ALL PRESENT
========================================= */

function markAllPresent() {

    if (students.length === 0) {

        showToast(
            "No students available."
        );

        return;
    }


    const date =
        getSelectedDate();


    const dayData =
        getDateData(date);


    students.forEach(student => {

        dayData[String(student.id)] =
            "Present";

    });


    saveData();

    renderAttendance();

    showToast(
        "All students marked Present."
    );

}


/* =========================================
   SAVE ATTENDANCE
========================================= */

function saveAttendance() {

    saveData();

    renderAttendance();

    showToast(
        "Attendance saved successfully."
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

            renderAttendance();

        }
    );


/* =========================================
   DATE CHANGE
========================================= */

document
    .getElementById("attendanceDate")
    .addEventListener(
        "change",
        function () {

            renderAttendance();

        }
    );


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
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================
   SET TODAY
========================================= */

document.getElementById(
    "attendanceDate"
).value =
    getToday();


/* =========================================
   INITIAL LOAD
========================================= */

loadData();

renderAttendance();