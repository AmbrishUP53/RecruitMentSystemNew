document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("applyModal");
  const closeModal = document.getElementById("closeModal");
  const applyForm = document.getElementById("applyForm");
  const submittedCard = document.getElementById("submittedCard");
  const modalJobTitle = document.getElementById("modalJobTitle");
  const jobIdInput = document.getElementById("jobId");

  // Open modal on apply button click
  document.querySelectorAll(".apply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const jobTitle = btn.getAttribute("data-title");
      const jobId = btn.getAttribute("data-jobid");

      modalJobTitle.textContent = `Apply for ${jobTitle}`;
      jobIdInput.value = jobId;
      modal.classList.remove("hidden");
    });
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Handle form submission (send to backend)
  applyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(applyForm);

    try {
      const res = await fetch("/apply", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        modal.classList.add("hidden");
        submittedCard.classList.remove("hidden");

        setTimeout(() => {
          submittedCard.classList.add("hidden");
        }, 3000);

        console.log("Application Submitted:", data);
      } else {
        alert(data.message || "Error submitting application");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  });
});
