document.addEventListener("DOMContentLoaded", function () {

    /* DATE */
    const dateElement = document.getElementById("todayDate");

    if (dateElement) {
        const today = new Date();

        dateElement.textContent = today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    /* STUDENTS */
    const students =
        JSON.parse(localStorage.getItem("pdStudents") || "[]");

    const totalStudents =
        document.getElementById("totalStudents");

    if (totalStudents) {
        totalStudents.textContent = students.length;
    }


    /* FEES */
    const feeRecords =
        JSON.parse(localStorage.getItem("pdFeeRecords") || "[]");

    let collected = 0;
    let pending = 0;

    feeRecords.forEach(record => {

        const amount = Number(record.amount || record.fee || 0);

        if (
            record.status === "Paid" ||
            record.paid === true
        ) {
            collected += amount;
        } else {
            pending += amount;
        }

    });


    const collectedAmount =
        document.getElementById("collectedAmount");

    const pendingAmount =
        document.getElementById("pendingAmount");

    const overviewCollected =
        document.getElementById("overviewCollected");

    const overviewPending =
        document.getElementById("overviewPending");


    if (collectedAmount) {
        collectedAmount.textContent = "₹" + collected.toLocaleString("en-IN");
    }

    if (pendingAmount) {
        pendingAmount.textContent = "₹" + pending.toLocaleString("en-IN");
    }

    if (overviewCollected) {
        overviewCollected.textContent =
            "₹" + collected.toLocaleString("en-IN");
    }

    if (overviewPending) {
        overviewPending.textContent =
            "₹" + pending.toLocaleString("en-IN");
    }


    /* EXPECTED */
    const expected = collected + pending;

    const expectedAmount =
        document.getElementById("expectedAmount");

    if (expectedAmount) {
        expectedAmount.textContent =
            "₹" + expected.toLocaleString("en-IN");
    }


    /* COLLECTION RATE */
    let rate = 0;

    if (expected > 0) {
        rate = Math.round((collected / expected) * 100);
    }

    const collectionRate =
        document.getElementById("collectionRate");

    const progressFill =
        document.getElementById("progressFill");

    if (collectionRate) {
        collectionRate.textContent = rate + "%";
    }

    if (progressFill) {
        progressFill.style.width = rate + "%";
    }


    /* ATTENDANCE */
    const attendance =
        JSON.parse(localStorage.getItem("pdAttendance") || "[]");

    let present = 0;
    let total = 0;

    attendance.forEach(day => {

        if (Array.isArray(day.records)) {

            day.records.forEach(record => {

                total++;

                if (
                    record.status === "Present" ||
                    record.present === true
                ) {
                    present++;
                }

            });

        }

    });

    const attendanceRate =
        document.getElementById("attendanceRate");

    if (attendanceRate) {

        const percentage =
            total > 0
                ? Math.round((present / total) * 100)
                : 0;

        attendanceRate.textContent = percentage + "%";
    }


    /* RECENT STUDENTS */
    const recentContainer =
        document.getElementById("recentStudents");

    if (recentContainer && students.length > 0) {

        const recent =
            students.slice(-5).reverse();

        recentContainer.innerHTML = recent.map(student => {

            return `
                <div class="empty-state">

                    <div class="empty-icon">
                        ♙
                    </div>

                    <div>
                        <strong>
                            ${student.name || "Student"}
                        </strong>

                        <span>
                            Class ${student.class || "—"}
                        </span>
                    </div>

                    <a href="students.html">
                        View
                    </a>

                </div>
            `;

        }).join("");

    }

});
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("PD Coaching app ready");
            })
            .catch(error => {
                console.error("Service Worker error:", error);
            });
    });
}
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    deferredInstallPrompt = event;

    const installBtn = document.getElementById("installAppBtn");

    if (installBtn) {
        installBtn.style.display = "inline-flex";
    }
});

document.addEventListener("click", async event => {

    if (event.target.id !== "installAppBtn") return;

    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();

    const result = await deferredInstallPrompt.userChoice;

    if (result.outcome === "accepted") {
        event.target.style.display = "none";
    }

    deferredInstallPrompt = null;
});