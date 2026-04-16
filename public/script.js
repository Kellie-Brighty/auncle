/* ═══════════════════════════════════════════════
   $ANC AIRDROP — SCRIPTS
   Live value animation & interactive elements
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── ANIMATE HERO VALUE (subtle fluctuation) ───
  const heroValueEl = document.getElementById('hero-value');
  const baseValue = 7826449;
  let currentValue = baseValue;

  function formatCurrency(num) {
    return '$' + num.toLocaleString('en-US');
  }

  function animateValue() {
    // Simulate small fluctuations ±0.1%
    const delta = Math.round((Math.random() - 0.5) * baseValue * 0.002);
    currentValue = baseValue + delta;
    if (heroValueEl) {
      heroValueEl.textContent = formatCurrency(currentValue);
    }
  }

  // Update every 3 seconds
  setInterval(animateValue, 3000);

  // ─── AGE COUNTER ───
  const ageEl = document.getElementById('stat-age');
  let ageSeconds = 8;

  function updateAge() {
    ageSeconds++;
    if (ageEl) {
      if (ageSeconds < 60) {
        ageEl.textContent = ageSeconds + 's ago';
      } else {
        const mins = Math.floor(ageSeconds / 60);
        const secs = ageSeconds % 60;
        ageEl.textContent = mins + 'm ' + secs + 's ago';
      }
    }
  }

  setInterval(updateAge, 1000);

  // ─── COPY CONTRACT ADDRESS ───
  const contractBadge = document.getElementById('contract-badge');
  const contractAddress = '1nc1nerator11111111111111111111111111111111';

  if (contractBadge) {
    contractBadge.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(contractAddress);
        const textEl = contractBadge.querySelector('.contract-text');
        const original = textEl.textContent;
        textEl.textContent = 'Copied!';
        textEl.style.color = '#4ade80';
        setTimeout(() => {
          textEl.textContent = original;
          textEl.style.color = '';
        }, 1500);
      } catch (err) {
        console.log('Copy failed', err);
      }
    });
  }

  // ─── PRICE TICKER SUBTLE ANIMATION ───
  const priceEl = document.getElementById('stat-price');
  const livePriceEl = document.querySelector('.live-price');
  const basePrice = 0.0196;

  function animatePrice() {
    const delta = (Math.random() - 0.5) * 0.0004;
    const newPrice = (basePrice + delta).toFixed(4);
    const formatted = '$' + newPrice;
    if (priceEl) priceEl.textContent = formatted;
    if (livePriceEl) livePriceEl.textContent = formatted;
  }

  setInterval(animatePrice, 5000);

  // ─── SOL PRICE SUBTLE ANIMATION ───
  const solEl = document.getElementById('stat-sol');
  const baseSol = 0.00022940;

  function animateSol() {
    const delta = (Math.random() - 0.5) * 0.00000500;
    const newSol = (baseSol + delta).toFixed(8);
    if (solEl) solEl.textContent = newSol;
  }

  setInterval(animateSol, 5000);

  // ─── INTERSECTION OBSERVER for scroll animations ───
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe sections
  document.querySelectorAll('.hero-section, .ath-section, .title-section, .quote-section, .comparison-section, .what-if-section, .milestones-section').forEach(el => {
    observer.observe(el);
  });

  // ─── WHAT IF SIMULATOR LOGIC ───
  const currentMcap = 19200000;
  const currentAirdrop = 7700000;

  const slider = document.getElementById('mcap-slider');
  const sliderTag = document.getElementById('slider-target-val');
  const multText = document.getElementById('sim-multiplier');
  const resMcapLabel = document.getElementById('res-mcap-label');
  const resRankVal = document.getElementById('res-rank-val');
  const resWorthVal = document.getElementById('res-worth-val');
  const resFooterRank = document.getElementById('res-footer-rank');
  const resFooterMult = document.getElementById('res-footer-mult');

  function updateSliderProgress(el) {
    const min = el.min;
    const max = el.max;
    const val = el.value;
    const percent = ((val - min) * 100) / (max - min);
    el.style.setProperty('--progress', percent + '%');
  }

  function formatCompact(num) {
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + num.toFixed(0);
  }

  function getRank(worth) {
    // Thresholds from screenshots
    if (worth >= 10840000000) return 1;
    if (worth >= 6430000000) return 2;
    if (worth >= 3540000000) return 3;
    if (worth >= 211200000) return 28;
    
    // Interpolation for rank climbing feel
    if (worth >= 100000000) return Math.floor(28 + (1 - (worth - 211.2e6) / (3.54e9 - 211.2e6)) * 24); 
    if (worth >= 7700000) return Math.floor(28 + (1 - (worth - 7.7e6) / (211.2e6 - 7.7e6)) * 29);
    return 57;
  }

  function updateSimulator(val) {
    const target = parseFloat(val);
    const multiplier = target / currentMcap;
    const worth = multiplier * currentAirdrop;
    const rank = getRank(worth);

    // Update UI
    sliderTag.textContent = formatCompact(target);
    multText.textContent = '×' + multiplier.toFixed(1);
    resMcapLabel.textContent = `AT ${formatCompact(target)} · RANK`;
    resRankVal.textContent = '#' + rank;
    resWorthVal.textContent = formatCompact(worth);
    
    // Footer Context
    resFooterRank.textContent = rank <= 30 ? `Top ${Math.ceil(rank/10)*10} all time` : "Climbing the ranks";
    resFooterMult.textContent = `${multiplier.toFixed(0)}x from today`;

    if (slider) updateSliderProgress(slider);
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      updateSimulator(e.target.value);
    });
  }

  // Quick Select Buttons
  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      slider.value = val;
      updateSimulator(val);
    });
  });

  // Initial Update
  if (slider) updateSimulator(slider.value);

});
