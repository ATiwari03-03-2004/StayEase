(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

let navbar = document.querySelector(".navbar");
let menu = document.querySelector(".navbar-toggler");
if (window.matchMedia("(max-width: 768px)").matches) {
  menu.addEventListener("click", function () {
    if (!menu.classList.contains("collapsed")) {
      navbar.style.height = "240px";
    } else {
      navbar.style.height = "5rem";
    }
  });
}
