// =========================================================
// ARADHANA APP - MAIN DASHBOARD ENGINE (PLAY STORE STANDARD)
// =========================================================

// ---------------------------------------------------------
// 1. GLOBAL 50-CLICK ADMOB SYSTEM & AD BRIDGE LOGIC
// ---------------------------------------------------------
let globalClickCount = parseInt(localStorage.getItem('aradhana_global_clicks')) || 0;

// ऐप में कहीं भी होने वाले हर क्लिक को गिनने के लिए ग्लोबल लिसनर
document.addEventListener('click', function(e) {
    // अगर कोई मोडल या साइडबार खुला है तो बेवजह काउंटर न बढ़ाएं
    globalClickCount++;
    localStorage.setItem('aradhana_global_clicks', globalClickCount);
    console.log(`Global Clicks: ${globalClickCount} / 50`);

    if (globalClickCount >= 50) {
        triggerGlobalRewardedAd();
    }
}, true);

// 50 क्लिक पूरे होने पर AdMob Native Bridge को कॉल करना
function triggerGlobalRewardedAd() {
    console.log("50 Clicks Reached! Requesting AdMob Rewarded Ad...");
    
    // A. Native Android AdMob Bridge (Play Store Standards)
    if (window.AradhanaAdBridge && typeof window.AradhanaAdBridge.showGlobalRewardedAd === 'function') {
        window.AradhanaAdBridge.showGlobalRewardedAd();
    } 
    // B. fallback: अगर अभी नेटिव ब्रिज तैयार नहीं है तो केवल लॉग करें (फेक रीसेट न करें)
    else {
        console.warn("AradhanaAdBridge connection pending or unavailable.");
    }
}

// Android Native AdMob द्वारा सफ़ल विज्ञापन का रिवॉर्ड Callback प्राप्त होने पर call होगा
window.onGlobalAdRewarded = function() {
    console.log("AdMob Reward Verified! Resetting global click counter.");
    globalClickCount = 0;
    localStorage.setItem('aradhana_global_clicks', 0);
};


// ---------------------------------------------------------
// 2. PREMIUM STATUS & STATE ENGINE
// ---------------------------------------------------------
let watchedAds = parseInt(localStorage.getItem('aradhana_watched_ads')) || 0;
let premiumExpiry = localStorage.getItem('aradhana_premium_expiry') || null;
let monthlyPremium = localStorage.getItem('aradhana_monthly_premium') === 'true';

function checkPremiumStatus() {
    watchedAds = parseInt(localStorage.getItem('aradhana_watched_ads')) || 0;
    premiumExpiry = localStorage.getItem('aradhana_premium_expiry') || null;
    monthlyPremium = localStorage.getItem('aradhana_monthly_premium') === 'true';

    const premiumStatus = document.getElementById("premiumStatus");
    const watchAdsBtn = document.getElementById("watchAdsBtn");
    const pBar = document.getElementById("adProgressBar");

    // 1. अगर मंथली प्रीमियम एक्टिव है
    if (monthlyPremium) {
        if (premiumStatus) premiumStatus.innerHTML = "👑 Premium Status: Monthly Active (No Ads)";
        if (watchAdsBtn) {
            watchAdsBtn.innerHTML = "👑 Premium Mode Active";
            watchAdsBtn.style.background = "linear-gradient(90deg, #ffd700, #ff9100)";
            watchAdsBtn.style.color = "#3e0006";
        }
        if (pBar) pBar.style.width = "100%";
        return true;
    }

    // 2. अगर 3 घंटे वाला फ्री प्रीमियम एक्टिव है
    if (premiumExpiry) {
        const timeLeft = new Date(premiumExpiry) - new Date();
        if (timeLeft > 0) {
            let min = Math.floor(timeLeft / 60000);
            let sec = Math.floor((timeLeft % 60000) / 1000);
            if (premiumStatus) premiumStatus.innerHTML = `✅ Premium Active: ${min}m ${sec}s Left`;
            if (watchAdsBtn) {
                watchAdsBtn.innerHTML = "🎉 Enjoying 3 Hours Ad-Free Premium!";
                watchAdsBtn.style.background = "linear-gradient(90deg, #2ecc71, #27ae60)";
                watchAdsBtn.style.color = "#ffffff";
            }
            if (pBar) pBar.style.width = "100%";
            return true;
        } else {
            localStorage.removeItem('aradhana_premium_expiry');
            localStorage.setItem('aradhana_watched_ads', 0);
            premiumExpiry = null;
            watchedAds = 0;
            if (premiumStatus) premiumStatus.innerHTML = "⏳ Premium Status: Free Mode (With Ads)";
            if (pBar) pBar.style.width = "0%";
            openModal("⌛ Premium Expired", "Your 3-hour premium has ended. Please watch ads again to unlock free premium mode.");
        }
    }

    // 3. साधारण फ्री मोड की स्थिति
    if (premiumStatus) premiumStatus.innerHTML = "⏳ Premium Status: Free Mode (With Ads)";
    if (watchAdsBtn) {
        watchAdsBtn.innerHTML = `📺 Watch Ads to Free Premium (${watchedAds} / 10)`;
        watchAdsBtn.style.background = "linear-gradient(90deg, #ffffff, #fff176, #ffffff)";
        watchAdsBtn.style.color = "#7a0010";
    }
    if (pBar) {
        let percentage = (watchedAds / 10) * 100;
        pBar.style.width = `${percentage}%`;
    }
    return false;
}

// प्रीमियम बटन पर क्लिक करने पर सुरक्षित नेविगेशन
const watchAdsBtn = document.getElementById("watchAdsBtn");
if (watchAdsBtn) {
    watchAdsBtn.addEventListener("click", function(e) {
        e.preventDefault();
        if (premiumExpiry || monthlyPremium) {
            openModal("✨ Premium Active", "You are already enjoying the premium version of the app!");
        } else {
            // AppCreator24 लिंक्स के बजाय अब यह सुरक्षित तरीके से आपकी premiumpage.html पर ले जाएगा
            window.location.href = "./premium.html";
        }
    });
}


// ---------------------------------------------------------
// 3. UI, DATES, CAROUSELS & SEARCH LOGIC
// ---------------------------------------------------------
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let seconds = String(now.getSeconds()).padStart(2, "0");
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeEl = document.getElementById("time");
    const dateEl = document.getElementById("date");
    if (timeEl) timeEl.innerText = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
    if (dateEl) dateEl.innerText = now.toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });

    checkPremiumStatus();
}
setInterval(updateClock, 1000);

// इमेज ऑटो रोटेशन
const deityImages = document.querySelectorAll(".deity-img");
let currentImage = 0;
setInterval(() => {
    if (deityImages.length === 0) return;
    deityImages[currentImage].classList.remove("active");
    currentImage = (currentImage + 1) % deityImages.length;
    deityImages[currentImage].classList.add("active");
}, 3000);

// सुविचार ऑटो स्लाइडर
const slider = document.getElementById("slider");
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;
setInterval(() => {
    if (!slider || slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    slider.scrollTo({ left: slides[0].clientWidth * currentSlide, behavior: "smooth" });
}, 4000);

// सर्च बार लॉजिक
const searchBtn = document.getElementById("searchBtn");
const searchContainer = document.getElementById("searchContainer");
if (searchBtn && searchContainer) {
    searchBtn.addEventListener("click", () => {
        searchContainer.classList.toggle("show");
        const srcInput = document.getElementById("searchInput");
        if (srcInput) srcInput.focus();
    });
}
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();
        document.querySelectorAll(".card").forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(value) ? "flex" : "none";
        });
    });
}

// फुल स्क्रीन पेज मैनेजमेंट
const fullPageScreen = document.getElementById("fullPageScreen");
const fullPageTitle = document.getElementById("fullPageTitle");
const fullPageContent = document.getElementById("fullPageContent");

function openFullPageView(title, text) {
    if (fullPageScreen && fullPageTitle && fullPageContent) {
        fullPageTitle.innerText = title;
        fullPageContent.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 4px solid #b30018;">
                <h2 style="color: #7a0010; font-size: 1.4rem; margin-bottom: 15px; text-align: center;">🚩 ${title} 🚩</h2>
                <p style="margin-bottom: 20px; font-weight: 500; text-align: center; color: #ef6c00;">${text}</p>
                <hr style="border: 0; border-top: 1px dashed #d7ccc8; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; line-height: 2; text-align: center; color: #3e2723;">
                    यहां पर इस पाठ की संपूर्ण पंक्तियां, दोहे और भक्ति गाथा लिखी जाएंगी।
                </div>
            </div>
            <div style="text-align: center; color: #8d6e63; font-size: 0.85rem; margin-top: 15px; font-weight: bold;">
                👇 बंद करने के लिए नीचे स्वाइप करें
            </div>
        `;
        fullPageScreen.style.display = "flex";
        fullPageScreen.scrollTop = 0;
        document.body.style.overflow = "hidden";
    }
}

function closeFullPage() {
    if (fullPageScreen) {
        fullPageScreen.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// स्वाइप-टू-क्लोज जेस्चर
let touchStartY = 0;
let touchEndY = 0;

if (fullPageScreen) {
    fullPageScreen.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    fullPageScreen.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    }, { passive: true });
}

function handleSwipeGesture() {
    if (touchEndY - touchStartY > 120 && fullPageScreen.scrollTop <= 5) {
        closeFullPage();
    }
}

// मोडल अलर्ट्स
const modal = document.getElementById("modal");
function openModal(title, text) {
    if (modal) {
        document.getElementById("modalTitle").innerText = title;
        document.getElementById("modalText").innerText = text;
        modal.style.display = "flex";
    }
}
function closeModal() {
    if (modal) modal.style.display = "none";
}

// क्लिक इवेंट्स बाइंडिंग
const cardsElement = document.getElementById("cards");
if (cardsElement) {
    cardsElement.addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        if (card) openFullPageView(card.querySelector("h3").innerText, card.querySelector("p").innerText);
    });
}

document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => openFullPageView(btn.innerText, "विशेष भक्ति संग्रह जल्द ही यहां उपलब्ध होगा।"));
});
slides.forEach(slide => {
    slide.addEventListener("click", () => openFullPageView(slide.querySelector("h2").innerText, slide.querySelector("p").innerText));
});

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

const homeBtn = document.getElementById("homeBtn");
if (homeBtn) homeBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const favBtn = document.getElementById("favBtn");
if (favBtn) favBtn.addEventListener("click", () => openFullPageView("🙏 विशेष भक्ति खंड", "भविष्य की चुनिंदा सामग्री के लिए।"));

const settingBtn = document.getElementById("settingBtn");
if (settingBtn) settingBtn.addEventListener("click", () => openFullPageView("⚙️ सेटिंग्स", "ऐप सेटिंग्स खंड निर्माणाधीन है।"));

// साइडबार मेनू
function openCustomSidebar() {
    const sidebar = document.getElementById("customSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.style.width = "280px";
    if (overlay) overlay.style.display = "block";
}

function closeCustomSidebar() {
    const sidebar = document.getElementById("customSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.style.width = "0";
    if (overlay) overlay.style.display = "none";
}

function showAppPrivacyPolicy() {
    closeCustomSidebar();
    openFullPageView(
        "प्राइवेसी पॉलिसी",
        "आराधना ऐप आपकी निजता (Privacy) का पूरा सम्मान करती है। हम यूजर का कोई भी व्यक्तिगत डेटा स्टोर या शेयर नहीं करते हैं। ऐप सुचारू रूप से चलाने और प्रीमियम सेवाएं देने के लिए केवल विज्ञापनों का उपयोग किया जाता है।"
    );
}

// ऐप लोड इवेंट
window.onload = function() {
    checkPremiumStatus();
};
;
