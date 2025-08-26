// public/js/jobs.js
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("applyModal");
  const closeModal = document.getElementById("closeModal");
  const modalJobTitle = document.getElementById("modalJobTitle");
  const jobIdInput = document.getElementById("jobId");

  // ✅ Open modal on apply button click
  document.querySelectorAll(".apply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const jobTitle = btn.getAttribute("data-title");
      const jobId = btn.getAttribute("data-jobid");

      modalJobTitle.textContent = `Apply for ${jobTitle}`;
      jobIdInput.value = jobId;
      modal.classList.remove("hidden");
    });
  });

  // ✅ Close modal
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});
