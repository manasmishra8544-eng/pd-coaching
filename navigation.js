document.addEventListener("DOMContentLoaded", function () {

    const nav = document.querySelector(".navigation");

    if (!nav) return;

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    nav.innerHTML = `

        <a href="home.html"
           class="nav-item ${currentPage === "home.html" ? "active" : ""}">
            <span class="nav-icon">⌂</span>
            <span>Home</span>
        </a>

        <a href="students.html"
           class="nav-item ${currentPage === "students.html" ? "active" : ""}">
            <span class="nav-icon">♙</span>
            <span>Students</span>
        </a>

        <a href="fees.html"
           class="nav-item ${currentPage === "fees.html" ? "active" : ""}">
            <span class="nav-icon">₹</span>
            <span>Fees</span>
        </a>

        <a href="attendance.html"
           class="nav-item ${currentPage === "attendance.html" ? "active" : ""}">
            <span class="nav-icon">✓</span>
            <span>Attendance</span>
        </a>

        <a href="settings.html"
           class="nav-item ${currentPage === "settings.html" ? "active" : ""}">
            <span class="nav-icon">⚙</span>
            <span>Settings</span>
        </a>

    `;

});