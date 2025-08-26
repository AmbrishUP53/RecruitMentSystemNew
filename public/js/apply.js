// public/js/apply.js
document.addEventListener("DOMContentLoaded", () => {
  const applyForm = document.getElementById("applyForm");
  const modal = document.getElementById("applyModal");
  const submittedCard = document.getElementById("submittedCard");

  if (!applyForm) return; // agar form nahi hai toh return

  applyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(applyForm);

    try {
      const res = await fetch("/apply", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        modal.classList.add("hidden");
        submittedCard.classList.remove("hidden");

        setTimeout(() => {
          submittedCard.classList.add("hidden");
        }, 3000);

        applyForm.reset();
      } else {
        alert("Failed to apply. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
});
