/* ═══════════════════════════════════════════════
   $ANC — SCRIPTS
   Real-Time DexScreener Integration
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const TOKEN_ADDRESS = 'ACtfUWtgvaXrQGNMiohTusi5jcx5RJf5zwu9aAxkpump';
  let liveData = null;

  // ─── UTILS ───
  function formatCurrency(num) {
    if (num === null || num === undefined) return '$0.00';
    return '$' + num.toLocaleString('en-US', { maximumFractionDigits: (num < 1 ? 6 : 2) });
  }

  function formatCompact(num) {
    if (num === null || num === undefined) return '$0.00';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
  }

  // ─── LIVE DATA SYNC ───
  async function fetchTokenData() {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`);
      const data = await response.json();
      
      if (data && data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        liveData = pair;
        updateUI();
      }
    } catch (err) {
      console.error('DexScreener fetch failed:', err);
    }
  }

  function updateUI() {
    if (!liveData) return;

    const { priceUsd, priceNative, priceChange, volume, fdv, liquidity } = liveData;

    // Ticker & Stats Bar
    const priceFormatted = '$' + parseFloat(priceUsd).toFixed(4);
    document.querySelectorAll('.live-price, #stat-price').forEach(el => el.textContent = priceFormatted);
    
    const solValue = document.getElementById('stat-sol');
    if (solValue) solValue.textContent = parseFloat(priceNative).toFixed(8);

    const h1 = document.getElementById('stat-1h');
    if (h1) {
      const val = priceChange.h1 || 0;
      h1.textContent = (val > 0 ? '+' : '') + val.toFixed(2) + '%';
      h1.className = 'stat-value ' + (val >= 0 ? 'positive' : 'negative');
    }

    const h24 = document.getElementById('stat-24h');
    if (h24) {
      const val = priceChange.h24 || 0;
      h24.textContent = (val > 0 ? '+' : '') + val.toFixed(2) + '%';
      h24.className = 'stat-value ' + (val >= 0 ? 'positive' : 'negative');
    }

    const vol = document.getElementById('stat-vol');
    if (vol) vol.textContent = formatCompact(volume.h24);

    const mcap = document.getElementById('stat-mcap');
    if (mcap) mcap.textContent = formatCompact(fdv);

    const liq = document.getElementById('stat-liquidity');
    if (liq) liq.textContent = formatCompact(liquidity.usd);

    // Hero Section (Full Market Valuation)
    const heroValueEl = document.getElementById('hero-value');
    if (heroValueEl) {
      heroValueEl.textContent = formatCurrency(Math.floor(fdv));
    }

    // Update simulator bases
    currentMcap = fdv;
    updateSimulator(document.getElementById('mcap-slider').value);
    
    // Reset age counter
    ageSeconds = 0;
  }

  // ─── INITIAL FETCH & POLLING ───
  fetchTokenData();
  setInterval(fetchTokenData, 30000); 

  // ─── AGE COUNTER ───
  const ageEl = document.getElementById('stat-age');
  let ageSeconds = 0;

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
  if (contractBadge) {
    contractBadge.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(TOKEN_ADDRESS);
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

  // ─── INTERSECTION OBSERVER ───
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.hero-section, .ath-section, .title-section, .quote-section, .what-if-section, .milestones-section').forEach(el => {
    observer.observe(el);
  });

  // ─── WHAT IF SIMULATOR LOGIC ───
  let currentMcap = 13000000;

  const slider = document.getElementById('mcap-slider');
  const sliderTag = document.getElementById('slider-target-val');
  const multText = document.getElementById('sim-multiplier');
  const resMcapLabel = document.getElementById('res-mcap-label');
  const resRankVal = document.getElementById('res-rank-val');
  const resWorthVal = document.getElementById('res-worth-val');
  const resFooterRank = document.getElementById('res-footer-rank');
  const resFooterMult = document.getElementById('res-footer-mult');
  const currentMcapEl = document.getElementById('sim-current-mcap');

  function updateSliderProgress(el) {
    const min = el.min;
    const max = el.max;
    const val = el.value;
    const percent = ((val - min) * 100) / (max - min);
    el.style.setProperty('--progress', percent + '%');
  }

  function getRank(worth) {
    if (worth >= 10840000000) return 1;
    if (worth >= 6430000000) return 2;
    if (worth >= 3540000000) return 3;
    if (worth >= 211200000) return 28;
    if (worth >= 100000000) return Math.floor(28 + (1 - (worth - 211.2e6) / (3.54e9 - 211.2e6)) * 24); 
    if (worth >= 7700000) return Math.floor(28 + (1 - (worth - 7.7e6) / (211.2e6 - 7.7e6)) * 29);
    return 57;
  }

  function updateSimulator(val) {
    if (!liveData) return;
    const target = parseFloat(val);
    const multiplier = target / currentMcap;
    const rank = getRank(target);

    sliderTag.textContent = formatCompact(target);
    multText.textContent = '×' + multiplier.toFixed(1);
    if (currentMcapEl) currentMcapEl.textContent = formatCompact(currentMcap);
    
    resMcapLabel.textContent = `AT ${formatCompact(target)} · RANK`;
    resRankVal.textContent = '#' + rank;
    resWorthVal.textContent = formatCompact(target);
    
    resFooterRank.textContent = rank <= 30 ? `Top ${Math.ceil(rank/10)*10} all time` : "Climbing the ranks";
    resFooterMult.textContent = `${multiplier.toFixed(0)}x from today`;

    if (slider) updateSliderProgress(slider);
  }

  if (slider) {
    slider.addEventListener('input', (e) => updateSimulator(e.target.value));
  }

  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      slider.value = val;
      updateSimulator(val);
    });
  });

});
