const sendButton = document.getElementById("send-text");

sendButton?.addEventListener("click", async () => {
  const session = sendButton.dataset.session;
  if (!session) {
    alert("Session ID is missing.");
    return;
  }
  const to = prompt("Enter the phone number (with country code):");
  if (!to) {
    alert("Phone number is required.");
    return;
  }

  const message =
    prompt("Enter the message to send:") || "Message from WA Gateway";

  const res = await fetch("/dashboard/messages/send-text-api", {
    method: "POST",
    body: JSON.stringify({
      session: session,
      to: to,
      message: message,
    }),
  });

  if (res.ok) {
    return alert("Message sent successfully.");
  }

  alert("Failed to send message.");
});

/**
 * Copy to Clipboard Functionality
 */

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.stopPropagation();
    const textToCopy = button.getAttribute("data-copy");
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy text: " + err);
    }
  });
});
