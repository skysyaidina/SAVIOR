/* ================== PAGE TRANSITIONS ================== */
const FX = { DURATION: 520 }; // harus selaras dgn --fx-dur

function runEnterTransition() {
  // Terapkan state masuk ketika halaman siap
  document.body.classList.add("page-enter");
  // next frame -> aktifkan animasi
  requestAnimationFrame(() => {
    document.body.classList.add("page-enter-active");
    // Bersihkan class setelah animasi selesai
    setTimeout(() => {
      document.body.classList.remove("page-enter");
      document.body.classList.remove("page-enter-active");
    }, FX.DURATION + 120);
  });
}

function navigateWithFade(url) {
  // Progressive enhancement: View Transitions API (lebih halus saat didukung)
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      window.location.href = url;
    });
    return;
  }
  // Fallback: CSS fade-out
  document.body.classList.add("page-exit");
  requestAnimationFrame(() => {
    document.body.classList.add("page-exit-active");
    setTimeout(() => {
      window.location.href = url;
    }, FX.DURATION);
  });
}

// Jalankan enter saat load & saat kembali dari bfcache
window.addEventListener("DOMContentLoaded", runEnterTransition);
window.addEventListener("pageshow", (e) => {
  if (e.persisted) runEnterTransition();
});

// Intersep klik <a> internal (same-origin, bukan hash/mailto/tel/_blank)
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  )
    return;
  if (a.hasAttribute("download")) return;
  if (a.target && a.target !== "_self") return;

  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return; // hanya internal

  e.preventDefault();
  navigateWithFade(url.href);
});

/* =============== NAV MOBILE ================= */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const open = navLinks.style.display === "flex";
    navLinks.style.display = open ? "none" : "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.gap = "12px";
    hamburger.setAttribute("aria-expanded", String(!open));
  });
}

/* =============== KONTAK: preselect layanan via querystring ============== */
(function () {
  const params = new URLSearchParams(location.search);
  const layanan = params.get("layanan");
  const select = document.getElementById("layananSelect");
  if (layanan && select) {
    [...select.options].forEach((o) => {
      if (o.value === layanan) select.value = layanan;
    });
  }
})();

/* =============== FORM + WhatsApp link ================= */
const form = document.getElementById("contactForm");
const message = document.getElementById("formMessage");
const waLink = document.getElementById("waLink");

function setErr(name, text = "") {
  const el = document.querySelector(`.error[data-for="${name}"]`);
  if (el) el.textContent = text;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    ["nama", "email", "layananSelect", "detail", "consent"].forEach((f) =>
      setErr(f, "")
    );

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const layanan = document.getElementById("layananSelect").value.trim();
    const detail = document.getElementById("detail").value.trim();
    const consent = document.getElementById("consent").checked;

    let ok = true;
    if (!nama) {
      setErr("nama", "Wajib diisi.");
      ok = false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr("email", "Email tidak valid.");
      ok = false;
    }
    if (!layanan) {
      setErr("layananSelect", "Pilih layanan.");
      ok = false;
    }
    if (detail.length < 10) {
      setErr("detail", "Jelaskan kebutuhan (≥10 karakter).");
      ok = false;
    }
    if (!consent) {
      setErr("consent", "Harus disetujui.");
      ok = false;
    }

    if (!ok) {
      message.textContent = "Periksa kembali isian formulir.";
      message.style.color = "#B23A3A";
      return;
    }

    try {
      message.textContent = "Mengirim...";
      message.style.color = "#3A3A3A";
      await new Promise((r) => setTimeout(r, 800)); // simulasi kirim
      message.textContent =
        "Terima kasih! Kami akan menghubungi lewat email/WhatsApp.";
      message.style.color = "#1E7F4F";
      form.reset();
    } catch {
      message.textContent = "Terjadi kesalahan. Coba lagi.";
      message.style.color = "#B23A3A";
    }
  });

  // Compose WA deep link saat user mengisi form
  if (waLink) {
    const compose = () => {
      const nama = document.getElementById("nama")?.value.trim() || "";
      const layanan =
        document.getElementById("layananSelect")?.value.trim() || "";
      const detail = document.getElementById("detail")?.value.trim() || "";
      const text = `Halo Edu Savior, saya ${nama}. Ingin konsultasi layanan ${layanan}. Detail: ${detail}`;
      // Ganti nomor di bawah dengan nomor resmi
      waLink.href =
        "https://wa.me/62895365674186?text=" + encodeURIComponent(text);
    };
    ["input", "change"].forEach((ev) => {
      document.getElementById("nama")?.addEventListener(ev, compose);
      document.getElementById("layananSelect")?.addEventListener(ev, compose);
      document.getElementById("detail")?.addEventListener(ev, compose);
    });
    compose();
  }
}

/* =============== FOOTER YEAR ================= */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
