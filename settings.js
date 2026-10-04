document.addEventListener("DOMContentLoaded", function () {

    loadProfile();

});


function loadProfile() {

    const profile =
        JSON.parse(
            localStorage.getItem("pdProfile") || "{}"
        );

    document.getElementById("coachingName").value =
        profile.coachingName || "PD Coaching";

    document.getElementById("teacherName").value =
        profile.teacherName || "Pankaj Durvadi";

    document.getElementById("coachingPhone").value =
        profile.phone || "";

    document.getElementById("coachingAddress").value =
        profile.address || "";

}


function saveProfile() {

    const profile = {

        coachingName:
            document.getElementById("coachingName").value.trim(),

        teacherName:
            document.getElementById("teacherName").value.trim(),

        phone:
            document.getElementById("coachingPhone").value.trim(),

        address:
            document.getElementById("coachingAddress").value.trim()

    };


    localStorage.setItem(
        "pdProfile",
        JSON.stringify(profile)
    );


    showToast("Profile saved successfully.");
}


function toggleDarkMode() {

    const enabled =
        document.getElementById("darkMode").checked;

    localStorage.setItem(
        "pdDarkMode",
        enabled ? "on" : "off"
    );

    showToast(
        enabled
            ? "Dark mode enabled."
            : "Dark mode setting saved."
    );

}


function exportData() {

    const data = {

        students:
            JSON.parse(
                localStorage.getItem("pdStudents") || "[]"
            ),

        fees:
            JSON.parse(
                localStorage.getItem("pdFeeRecords") || "{}"
            ),

        attendance:
            JSON.parse(
                localStorage.getItem("pdAttendance") || "{}"
            ),

        profile:
            JSON.parse(
                localStorage.getItem("pdProfile") || "{}"
            ),

        exportedAt:
            new Date().toISOString()

    };


    const file = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );


    const url =
        URL.createObjectURL(file);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "PD-Coaching-Backup.json";

    link.click();


    URL.revokeObjectURL(url);

    showToast("Backup exported successfully.");
}


function clearAllData() {

    const confirmDelete =
        confirm(
            "Are you sure? This will delete all students, fees and attendance data."
        );

    if (!confirmDelete) return;


    localStorage.removeItem("pdStudents");
    localStorage.removeItem("pdFeeRecords");
    localStorage.removeItem("pdAttendance");


    showToast("All coaching data has been cleared.");

}


let toastTimer;

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 2500);

}