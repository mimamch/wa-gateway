const main = async () => {
  const qr = new QRCode("qr");
  const interval = setInterval(async () => {
    const res = await fetch(`create/qr?id=${id}`);

    if (res.ok) {
      const data = await res.json();
      qr.clear();
      if (data?.qr) {
        qr.makeCode(data.qr);
      }

      if (data?.status) {
        const statusEl = document.getElementById("status");
        if (statusEl) {
          statusEl.innerText = data.status.toUpperCase();
        }

        if (data.status === "connected") {
          clearInterval(interval);

          setTimeout(() => {
            window.location.href = "/dashboard/sessions";
          }, 2000);

          const redirectingEl = document.getElementById("redirecting");
          if (redirectingEl) {
            redirectingEl.classList.remove("hidden");
          }
        }
      }
    }
  }, 1000);
};

main();
