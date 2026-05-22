const menuToggle = document.getElementById("menuToggle");
  const menuDropdown = document.getElementById("menuDropdown");

  menuToggle.addEventListener("click", () => {
    menuDropdown.style.display =
      menuDropdown.style.display === "block" ? "none" : "block";
  });