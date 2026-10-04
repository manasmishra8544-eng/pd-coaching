/* =========================================
   PD COACHING - STUDENTS
========================================= */

let students = JSON.parse(
    localStorage.getItem("pdStudents") || "[]"
);

let editingId = null;


/* =========================================
   SAVE STUDENTS
========================================= */

function saveStudents() {
    localStorage.setItem(
        "pdStudents",
        JSON.stringify(students)
    );
}


/* =========================================
   OPEN ADD STUDENT MODAL
========================================= */

function openStudentModal() {

    const modal = document.getElementById("studentModal");

    modal.classList.add("show");

    document.getElementById("studentForm").reset();

    document.getElementById("editId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Student";

    editingId = null;

    setTimeout(() => {
        document.getElementById("studentName").focus();
    }, 100);
}


/* =========================================
   CLOSE MODAL
========================================= */

function closeStudentModal() {

    document
        .getElementById("studentModal")
        .classList.remove("show");

    document
        .getElementById("studentForm")
        .reset();

    editingId = null;
}


/* =========================================
   ADD / EDIT STUDENT
========================================= */

document
    .getElementById("studentForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

        const name =
            document.getElementById("studentName").value.trim();

        const phone =
            document.getElementById("studentPhone").value.trim();

        const studentClass =
            document.getElementById("studentClass").value.trim();

        const fee =
            Number(document.getElementById("studentFee").value);

        const joiningDate =
            document.getElementById("joiningDate").value;


        /* CHECK DETAILS */

        if (
            !name ||
            !phone ||
            !studentClass ||
            !joiningDate ||
            fee <= 0
        ) {
            showToast("Please fill all details correctly.");
            return;
        }


        /* EDIT */

        if (editingId) {

            const student = students.find(
                student => student.id === editingId
            );

            if (student) {

                student.name = name;
                student.phone = phone;
                student.className = studentClass;
                student.fee = fee;
                student.joiningDate = joiningDate;

            }

            showToast("Student updated successfully.");

        }


        /* ADD */

        else {

            const newStudent = {

                id: Date.now().toString(),

                name: name,

                phone: phone,

                className: studentClass,

                fee: fee,

                joiningDate: joiningDate,

                status: "Active"

            };

            students.push(newStudent);

            showToast("Student added successfully.");
        }


        saveStudents();

        renderStudents();

        closeStudentModal();

    });


/* =========================================
   RENDER STUDENTS
========================================= */

function renderStudents() {

    const table =
        document.getElementById("studentsTable");

    const empty =
        document.getElementById("emptyState");

    const searchInput =
        document.getElementById("searchInput");

    const search =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";


    const filteredStudents =
        students.filter(student => {

            return (
                student.name.toLowerCase().includes(search) ||

                student.phone.includes(search) ||

                student.className
                    .toLowerCase()
                    .includes(search)
            );

        });


    table.innerHTML = "";


    /* NO STUDENTS */

    if (filteredStudents.length === 0) {

        table.style.display = "none";

        empty.style.display = "block";

    }


    /* STUDENTS FOUND */

    else {

        table.style.display = "table";

        empty.style.display = "none";


        filteredStudents.forEach(student => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="student-name">
                        ${escapeHTML(student.name)}
                    </div>

                    <div class="student-id">
                        ID: ${student.id.slice(-6)}
                    </div>

                </td>


                <td class="phone">
                    ${escapeHTML(student.phone)}
                </td>


                <td>
                    ${escapeHTML(student.className)}
                </td>


                <td class="fee">
                    ₹${Number(student.fee)
                        .toLocaleString("en-IN")}
                </td>


                <td>
                    ${formatDate(student.joiningDate)}
                </td>


                <td>

                    <span class="status active">
                        Active
                    </span>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="action-btn"
                            onclick="editStudent('${student.id}')"
                            title="Edit">

                            ✎

                        </button>


                        <button
                            class="action-btn delete"
                            onclick="deleteStudent('${student.id}')"
                            title="Delete">

                            ×

                        </button>

                    </div>

                </td>

            `;

            table.appendChild(row);

        });

    }


    updateStats();

}


/* =========================================
   EDIT STUDENT
========================================= */

function editStudent(id) {

    const student =
        students.find(student => student.id === id);


    if (!student) return;


    editingId = id;


    document.getElementById("editId").value =
        id;


    document.getElementById("studentName").value =
        student.name;


    document.getElementById("studentPhone").value =
        student.phone;


    document.getElementById("studentClass").value =
        student.className;


    document.getElementById("studentFee").value =
        student.fee;


    document.getElementById("joiningDate").value =
        student.joiningDate;


    document.getElementById("modalTitle").textContent =
        "Edit Student";


    document
        .getElementById("studentModal")
        .classList.add("show");

}


/* =========================================
   DELETE STUDENT
========================================= */

function deleteStudent(id) {

    const student =
        students.find(student => student.id === id);


    if (!student) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete ${student.name}?`
        );


    if (!confirmed) return;


    students =
        students.filter(
            student => student.id !== id
        );


    saveStudents();

    renderStudents();

    showToast("Student deleted successfully.");

}


/* =========================================
   UPDATE DASHBOARD STATS
========================================= */

function updateStats() {

    const total =
        students.length;


    const active =
        students.filter(
            student => student.status === "Active"
        ).length;


    const monthlyCollection =
        students.reduce(
            (total, student) => {

                return total +
                    Number(student.fee || 0);

            },
            0
        );


    document.getElementById("totalStudents")
        .textContent = total;


    document.getElementById("activeStudents")
        .textContent = active;


    document.getElementById("monthlyCollection")
        .textContent =
            "₹" +
            monthlyCollection.toLocaleString("en-IN");

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date) {

    if (!date) {
        return "-";
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
   TOAST MESSAGE
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
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================= */

document
    .getElementById("studentModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {

            closeStudentModal();

        }

    });


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeStudentModal();

        }

    }
);


/* =========================================
   LOAD STUDENTS
========================================= */

renderStudents();