// ------------------------------------------------------------------
// برقتو - نسخه ۲: انیمیشن استگر + مورف کارت‌ها هنگام اسکرول
// ------------------------------------------------------------------

const PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام",
  "بوشهر", "تهران", "چهارمحال و بختیاری", "خراسان جنوبی", "خراسان رضوی",
  "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس",
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد",
  "گلستان", "گیلان", "لرستان", "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

function fillProvinces() {
  const select = document.getElementById("province");
  if (!select) return;
  PROVINCES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });
}

// انیمیشن ورود بلوک‌های ساده (مورف: scale + fade)
function setupMorphIn() {
  const items = document.querySelectorAll(".morph-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
}

// انیمیشن استگر کارت‌ها (مقایسه، آمار، سوالات متداول)
// هر گروه کارت مستقل observe می‌شود تا تاخیر پلکانی --i در همان بلوک اعمال شود
function setupStaggerCards() {
  const groups = [
    document.querySelectorAll("#compare .stagger-card"),
    document.querySelectorAll(".stats-grid .stagger-card"),
    document.querySelectorAll("#faq .stagger-card"),
  ];

  groups.forEach((group) => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        // وقتی اولین کارت گروه دیده شد، کل گروه با تاخیر پلکانی نمایش داده شود
        const anyVisible = entries.some((e) => e.isIntersecting);
        if (anyVisible) {
          group.forEach((card) => card.classList.add("in-view"));
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    group.forEach((card) => observer.observe(card));
  });
}

function setupCounters() {
  const cards = document.querySelectorAll(".stat-value");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  cards.forEach((c) => observer.observe(c));
}

function animateCount(el) {
  const target = Number(el.dataset.count || 0);
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value.toLocaleString("fa-IR");
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target.toLocaleString("fa-IR");
  }
  requestAnimationFrame(frame);
}

function setupFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

// نرخ‌های زیر «نمونه» هستند و صرفاً برای نمایش تخمینی به‌کار می‌روند.
// پیش از استفاده واقعی، باید با نرخ‌های به‌روز بازار برق و خرید تضمینی جایگزین شوند.
const SAMPLE_RATES = {
  guaranteedPricePerKwh: 4500,
  barghtoPricePerKwh: 6200,
  specificYieldPerKw: 1500,
  hybridGridShare: 0.8,
};

function formatToman(value) {
  return Math.round(value).toLocaleString("fa-IR") + " تومان";
}

function setupCalculator() {
  const form = document.getElementById("calc-form");
  if (!form) return;

  form.addEventListener("submit", () => {
    const capacityInput = parseFloat(document.getElementById("capacity").value);
    if (!capacityInput || capacityInput <= 0) return;

    const unit = document.getElementById("capacity-unit").value;
    const capacityKw = unit === "mw" ? capacityInput * 1000 : capacityInput;
    const plantType = document.getElementById("plant-type").value;

    let annualProduction = capacityKw * SAMPLE_RATES.specificYieldPerKw;
    if (plantType === "hybrid") {
      annualProduction *= SAMPLE_RATES.hybridGridShare;
    }

    const guaranteedIncome = annualProduction * SAMPLE_RATES.guaranteedPricePerKwh;
    const barghtoIncome = annualProduction * SAMPLE_RATES.barghtoPricePerKwh;
    const diff = barghtoIncome - guaranteedIncome;

    document.getElementById("res-production").textContent =
      Math.round(annualProduction).toLocaleString("fa-IR") + " kWh";
    document.getElementById("res-guaranteed").textContent = formatToman(guaranteedIncome);
    document.getElementById("res-barghto").textContent = formatToman(barghtoIncome);
    document.getElementById("res-diff").textContent = "+" + formatToman(diff);
  });
}

function setupReviewForm() {
  const form = document.getElementById("review-form");
  const success = document.getElementById("review-success");
  if (!form) return;

  form.addEventListener("submit", () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // TODO: اتصال به بک‌اند/CRM برقتو برای ثبت واقعی درخواست
    success.hidden = false;
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillProvinces();
  setupMorphIn();
  setupStaggerCards();
  setupCounters();
  setupFaq();
  setupCalculator();
  setupReviewForm();
});
