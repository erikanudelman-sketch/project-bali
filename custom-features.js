(() => {
  'use strict';

  const STORAGE_KEY = 'project-bali-state';
  const FEATURE_ID = 'pb-search-catalog-card';
  const STATUS_ID = 'pb-completion-status-card';

  const FALLBACK_FOODS = [
    { name: 'Chicken breast, cooked', aliases: ['chicken', 'chicken breast'], per100: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, servingGrams: 170 },
    { name: 'Chicken thigh, boneless skinless, cooked', aliases: ['chicken thigh', 'thigh'], per100: { calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 }, servingGrams: 170 },
    { name: 'Ground turkey, 93% lean, cooked', aliases: ['turkey', 'ground turkey'], per100: { calories: 203, protein: 27, carbs: 0, fat: 10, fiber: 0 }, servingGrams: 113 },
    { name: 'Lean ground beef, 90% lean, cooked', aliases: ['ground beef', 'beef'], per100: { calories: 254, protein: 26, carbs: 0, fat: 17, fiber: 0 }, servingGrams: 113 },
    { name: 'Sirloin steak, cooked', aliases: ['steak', 'sirloin'], per100: { calories: 206, protein: 27, carbs: 0, fat: 10, fiber: 0 }, servingGrams: 170 },
    { name: 'Salmon, cooked', aliases: ['salmon', 'fish'], per100: { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 }, servingGrams: 170 },
    { name: 'Shrimp, cooked', aliases: ['shrimp'], per100: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 }, servingGrams: 140 },
    { name: 'Egg, whole, cooked', aliases: ['egg', 'eggs'], per100: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }, servingGrams: 50 },
    { name: 'Greek yogurt, nonfat, plain', aliases: ['greek yogurt', 'yogurt'], per100: { calories: 59, protein: 10.3, carbs: 3.6, fat: 0.4, fiber: 0 }, servingGrams: 170 },
    { name: 'Greek yogurt, 2%, plain', aliases: ['greek yogurt 2%', 'yogurt 2%'], per100: { calories: 73, protein: 9.9, carbs: 3.9, fat: 1.9, fiber: 0 }, servingGrams: 170 },
    { name: 'Cottage cheese, 2%', aliases: ['cottage cheese'], per100: { calories: 84, protein: 11.1, carbs: 4.3, fat: 2.3, fiber: 0 }, servingGrams: 226 },
    { name: 'Jasmine rice, cooked', aliases: ['rice', 'jasmine rice', 'white rice'], per100: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 }, servingGrams: 158 },
    { name: 'Brown rice, cooked', aliases: ['brown rice'], per100: { calories: 123, protein: 2.7, carbs: 25.6, fat: 1, fiber: 1.6 }, servingGrams: 195 },
    { name: 'Potato, baked', aliases: ['potato', 'baked potato'], per100: { calories: 93, protein: 2.5, carbs: 21.2, fat: 0.1, fiber: 2.2 }, servingGrams: 173 },
    { name: 'Sweet potato, baked', aliases: ['sweet potato'], per100: { calories: 90, protein: 2, carbs: 20.7, fat: 0.2, fiber: 3.3 }, servingGrams: 180 },
    { name: 'Pasta, cooked', aliases: ['pasta', 'spaghetti'], per100: { calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9, fiber: 1.8 }, servingGrams: 140 },
    { name: 'Bread, whole wheat', aliases: ['bread', 'toast'], per100: { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 6.8 }, servingGrams: 43 },
    { name: 'Flour tortilla', aliases: ['tortilla'], per100: { calories: 312, protein: 8.3, carbs: 52, fat: 8.3, fiber: 3.3 }, servingGrams: 49 },
    { name: 'Avocado', aliases: ['avocado'], per100: { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 }, servingGrams: 75 },
    { name: 'Olive oil', aliases: ['olive oil', 'oil'], per100: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, servingGrams: 14 },
    { name: 'Blueberries', aliases: ['blueberries', 'berries'], per100: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 }, servingGrams: 148 },
    { name: 'Strawberries', aliases: ['strawberries'], per100: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 }, servingGrams: 150 },
    { name: 'Banana', aliases: ['banana'], per100: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 }, servingGrams: 118 },
    { name: 'Apple', aliases: ['apple'], per100: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 }, servingGrams: 182 },
    { name: 'Tomatoes', aliases: ['tomato', 'tomatoes'], per100: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }, servingGrams: 123 },
    { name: 'Arugula', aliases: ['arugula'], per100: { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6 }, servingGrams: 20 },
    { name: 'Carrots, raw', aliases: ['carrot', 'carrots'], per100: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 }, servingGrams: 61 },
    { name: 'Onion, raw', aliases: ['onion', 'onions'], per100: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }, servingGrams: 110 },
    { name: 'Kimchi', aliases: ['kimchi'], per100: { calories: 15, protein: 1.1, carbs: 2.4, fat: 0.5, fiber: 1.6 }, servingGrams: 75 },
    { name: 'Cheddar cheese', aliases: ['cheese', 'cheddar'], per100: { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0 }, servingGrams: 28 },
    { name: 'Protein shake, ready-to-drink', aliases: ['protein shake', 'shake'], per100: { calories: 62, protein: 10, carbs: 2.5, fat: 1, fiber: 0.5 }, servingGrams: 340 }
  ];


  const USDA_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
  const USDA_API_KEY = 'DEMO_KEY';

  function nutrientValue(food, names, numbers = []) {
    const nutrients = Array.isArray(food?.foodNutrients) ? food.foodNutrients : [];
    const match = nutrients.find(item => {
      const name = String(item.nutrientName || item.nutrient?.name || '').toLowerCase();
      const number = String(item.nutrientNumber || item.nutrient?.number || '');
      return names.some(candidate => name === candidate || name.includes(candidate)) || numbers.includes(number);
    });
    return Number(match?.value ?? match?.amount ?? 0) || 0;
  }

  function normalizeUsdaFood(food) {
    const description = String(food.description || food.lowercaseDescription || 'USDA food');
    const dataType = String(food.dataType || 'USDA');
    const servingSize = Number(food.servingSize) > 0 && String(food.servingSizeUnit || '').toLowerCase().startsWith('g')
      ? Number(food.servingSize)
      : 100;
    return {
      name: description,
      aliases: [description],
      source: `USDA FoodData Central · ${dataType}`,
      fdcId: food.fdcId,
      servingGrams: servingSize,
      per100: {
        calories: nutrientValue(food, ['energy'], ['208']),
        protein: nutrientValue(food, ['protein'], ['203']),
        carbs: nutrientValue(food, ['carbohydrate, by difference', 'carbohydrate'], ['205']),
        fat: nutrientValue(food, ['total lipid (fat)', 'total fat'], ['204']),
        fiber: nutrientValue(food, ['fiber, total dietary', 'dietary fiber'], ['291'])
      }
    };
  }

  async function searchUsdaFoods(query, signal) {
    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query,
      pageSize: '12',
      dataType: 'Foundation,SR Legacy,Survey (FNDDS)'
    });
    const response = await fetch(`${USDA_SEARCH_URL}?${params.toString()}`, { signal });
    if (!response.ok) throw new Error(`USDA search failed (${response.status})`);
    const data = await response.json();
    return (Array.isArray(data.foods) ? data.foods : [])
      .map(normalizeUsdaFood)
      .filter(food => food.per100.calories || food.per100.protein || food.per100.carbs || food.per100.fat)
      .slice(0, 10);
  }

  function searchFallbackFoods(query) {
    const normalized = query.toLowerCase();
    return FALLBACK_FOODS
      .filter(food => [food.name, ...(food.aliases || [])].some(value => value.toLowerCase().includes(normalized)))
      .slice(0, 8)
      .map(food => ({ ...food, source: 'Offline fallback catalog' }));
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentDay(state) {
    return Math.max(1, Math.min(50, Number(state?.currentDay || 1)));
  }

  function ensureDay(state, day) {
    state.days = state.days || {};
    state.days[day] = state.days[day] || {
      busyAF: false, workout: '', steps: '', protein: '', water: '', fruit: false,
      vegetable: false, alcohol: { count: 0, type: 'Gin + soda' }, bloating: '',
      bloatingNote: '', energy: '', sleep: '', calories: '', logged: false,
      nutritionEntries: []
    };
    state.days[day].nutritionEntries = Array.isArray(state.days[day].nutritionEntries)
      ? state.days[day].nutritionEntries : [];
    return state.days[day];
  }

  function round1(value) { return Math.round((Number(value) || 0) * 10) / 10; }

  function totals(day) {
    return (day.nutritionEntries || []).reduce((sum, item) => {
      ['calories', 'protein', 'carbs', 'fat', 'fiber'].forEach(key => {
        sum[key] += Number(item[key]) || 0;
      });
      return sum;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }

  function addCatalogFood(food, grams) {
    const state = readState();
    if (!state) return false;
    const dayNumber = currentDay(state);
    const day = ensureDay(state, dayNumber);
    const factor = grams / 100;
    const entry = {
      id: `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: food.name,
      source: food.source || 'USDA FoodData Central',
      amountGrams: round1(grams),
      calories: round1(food.per100.calories * factor),
      protein: round1(food.per100.protein * factor),
      carbs: round1(food.per100.carbs * factor),
      fat: round1(food.per100.fat * factor),
      fiber: round1(food.per100.fiber * factor),
      loggedAt: new Date().toISOString()
    };
    day.nutritionEntries.push(entry);
    const dayTotals = totals(day);
    day.protein = round1(dayTotals.protein);
    if (!day.calories) day.calories = '';
    writeState(state);
    return entry;
  }

  function markWorkoutComplete() {
    const state = readState();
    if (!state) return;
    const dayNumber = currentDay(state);
    const day = ensureDay(state, dayNumber);
    day.workout = day.workout === 'minimum' ? 'minimum' : 'full';
    day.workoutCompletedAt = new Date().toISOString();
    writeState(state);
    location.reload();
  }

  function markDayComplete() {
    const state = readState();
    if (!state) return;
    const dayNumber = currentDay(state);
    const day = ensureDay(state, dayNumber);
    day.logged = true;
    day.completedAt = new Date().toISOString();
    writeState(state);
    location.reload();
  }

  function maybeAutoComplete() {
    const state = readState();
    if (!state?.onboarded) return;
    const dayNumber = currentDay(state);
    const day = ensureDay(state, dayNumber);
    if (day.logged) return;
    const nutrition = totals(day);
    const protein = Math.max(Number(day.protein) || 0, nutrition.protein);
    const waterTarget = state.setup?.waterUnit === 'L' ? 2 : 80;
    const workoutDone = ['full', 'minimum', 'walk', 'rest'].includes(day.workout);
    const stepsEntered = Number(day.steps) > 0;
    const proteinDone = protein >= 100;
    const waterDone = Number(day.water) >= waterTarget;
    if (workoutDone && stepsEntered && proteinDone && waterDone) {
      day.logged = true;
      day.completedAt = new Date().toISOString();
      writeState(state);
    }
  }

  function textIncludes(node, text) {
    return node && (node.textContent || '').toLowerCase().includes(text.toLowerCase());
  }

  function findCardByText(text) {
    return [...document.querySelectorAll('.bp-card')].find(card => textIncludes(card, text));
  }

  function renderCatalog() {
    if (document.getElementById(FEATURE_ID)) return;
    const scanCard = findCardByText('Scan packaged food');
    const logCard = findCardByText('Log food');
    if (!scanCard && !logCard) return;

    const card = document.createElement('section');
    card.id = FEATURE_ID;
    card.className = 'bp-card pb-catalog-card';
    card.innerHTML = `
      <div class="bp-card-title">Search USDA food catalog</div>
      <p class="bp-small">Search USDA FoodData Central, enter a weight, and add nutrition directly to Today.</p>
      <label class="bp-label" for="pb-food-search">Food</label>
      <input id="pb-food-search" class="bp-input" type="search" placeholder="Try chicken thigh, rice, yogurt…" autocomplete="off" />
      <div id="pb-food-results" class="pb-food-results" role="listbox" aria-label="Food search results"></div>
      <div id="pb-selected-food" class="pb-selected-food" hidden>
        <div class="pb-selected-name"></div>
        <div class="pb-amount-grid">
          <div>
            <label class="bp-label" for="pb-food-amount">Amount</label>
            <input id="pb-food-amount" class="bp-input" type="number" min="0" step="0.1" value="100" />
          </div>
          <div>
            <label class="bp-label" for="pb-food-unit">Unit</label>
            <select id="pb-food-unit" class="bp-select">
              <option value="g">grams</option>
              <option value="oz">ounces</option>
              <option value="serving">serving</option>
            </select>
          </div>
        </div>
        <div id="pb-food-preview" class="pb-food-preview" aria-live="polite"></div>
        <button id="pb-add-food" type="button" class="bp-btn primary" style="width:100%">Add to Today</button>
        <p class="bp-small" style="margin-top:8px">Values come from USDA FoodData Central and are calculated by weight. Use the barcode scanner for branded packaged foods.</p>
      </div>`;

    (logCard || scanCard.nextSibling) ? (logCard ? logCard.parentNode.insertBefore(card, logCard) : scanCard.parentNode.insertBefore(card, scanCard.nextSibling)) : scanCard.parentNode.appendChild(card);

    const search = card.querySelector('#pb-food-search');
    const results = card.querySelector('#pb-food-results');
    const selectedPanel = card.querySelector('#pb-selected-food');
    const selectedName = card.querySelector('.pb-selected-name');
    const amountInput = card.querySelector('#pb-food-amount');
    const unitSelect = card.querySelector('#pb-food-unit');
    const preview = card.querySelector('#pb-food-preview');
    const addButton = card.querySelector('#pb-add-food');
    let selected = null;
    let searchAbortController = null;
    let searchRequestId = 0;

    const gramsFromInputs = () => {
      const amount = Math.max(0, Number(amountInput.value) || 0);
      if (!selected) return 0;
      if (unitSelect.value === 'oz') return amount * 28.3495;
      if (unitSelect.value === 'serving') return amount * selected.servingGrams;
      return amount;
    };

    const updatePreview = () => {
      if (!selected) return;
      const grams = gramsFromInputs();
      const f = grams / 100;
      preview.innerHTML = `
        <strong>${round1(grams)} g</strong>
        <span>${round1(selected.per100.calories * f)} cal</span>
        <span>${round1(selected.per100.protein * f)}g protein</span>
        <span>${round1(selected.per100.carbs * f)}g carbs</span>
        <span>${round1(selected.per100.fat * f)}g fat</span>
        <span>${round1(selected.per100.fiber * f)}g fiber</span>`;
    };

    const selectFood = food => {
      selected = food;
      selectedPanel.hidden = false;
      selectedName.textContent = food.name;
      amountInput.value = unitSelect.value === 'serving' ? 1 : 100;
      results.innerHTML = '';
      search.value = food.name;
      updatePreview();
    };

    const renderResults = foods => {
      results._foods = foods;
      results.innerHTML = foods.length ? foods.map((food, index) => `
        <button type="button" class="pb-food-result" data-result-index="${index}" role="option">
          <strong>${food.name}</strong>
          <span>${round1(food.per100.calories)} cal · ${round1(food.per100.protein)}g protein per 100g</span>
          <small>${food.source || 'USDA FoodData Central'}</small>
        </button>`).join('') : '<div class="bp-small" style="padding:10px">No USDA match found. Try a simpler term.</div>';
    };

    const showResults = async () => {
      const query = search.value.trim();
      if (query.length < 2) {
        if (searchAbortController) searchAbortController.abort();
        results.innerHTML = '';
        return;
      }
      const requestId = ++searchRequestId;
      if (searchAbortController) searchAbortController.abort();
      searchAbortController = new AbortController();
      results.innerHTML = '<div class="bp-small" style="padding:10px">Searching USDA FoodData Central…</div>';
      try {
        const foods = await searchUsdaFoods(query, searchAbortController.signal);
        if (requestId !== searchRequestId) return;
        renderResults(foods.length ? foods : searchFallbackFoods(query));
      } catch (error) {
        if (error?.name === 'AbortError' || requestId !== searchRequestId) return;
        const fallback = searchFallbackFoods(query);
        renderResults(fallback);
        if (!fallback.length) {
          results.innerHTML = '<div class="bp-small" style="padding:10px">USDA search is temporarily unavailable. Try again, scan a barcode, or use manual food entry.</div>';
        }
      }
    };

    let searchDebounce;
    search.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(showResults, 300);
    });
    results.addEventListener('click', event => {
      const button = event.target.closest('[data-result-index]');
      const food = results._foods?.[Number(button?.dataset.resultIndex)];
      if (food) selectFood(food);
    });
    amountInput.addEventListener('input', updatePreview);
    unitSelect.addEventListener('change', () => {
      amountInput.value = unitSelect.value === 'serving' ? 1 : unitSelect.value === 'oz' ? 4 : 100;
      updatePreview();
    });
    addButton.addEventListener('click', () => {
      const grams = gramsFromInputs();
      if (!selected || grams <= 0) return;
      const entry = addCatalogFood(selected, grams);
      if (entry) {
        addButton.textContent = `Added ${round1(entry.protein)}g protein ✓`;
        addButton.disabled = true;
        setTimeout(() => location.reload(), 650);
      }
    });
  }

  function renderCompletionCard() {
    if (document.getElementById(STATUS_ID)) return;
    const missionCard = findCardByText("Today's mission");
    if (!missionCard) return;
    const state = readState();
    if (!state) return;
    const dayNumber = currentDay(state);
    const day = ensureDay(state, dayNumber);
    const workoutDone = ['full', 'minimum', 'walk', 'rest'].includes(day.workout);
    const dayDone = Boolean(day.logged);

    const card = document.createElement('section');
    card.id = STATUS_ID;
    card.className = 'bp-card pb-completion-card';
    card.innerHTML = `
      <div class="bp-card-title">Completion status</div>
      <div class="pb-status-row"><span>Workout</span><strong class="${workoutDone ? 'done' : ''}">${workoutDone ? 'Complete ✓' : 'Not complete'}</strong></div>
      <div class="pb-status-row"><span>Day</span><strong class="${dayDone ? 'done' : ''}">${dayDone ? 'Complete ✓' : 'In progress'}</strong></div>
      <div class="pb-completion-actions">
        <button id="pb-complete-workout" type="button" class="bp-btn ${workoutDone ? 'secondary' : 'primary'}" ${workoutDone ? 'disabled' : ''}>${workoutDone ? 'Workout complete' : 'Complete workout'}</button>
        <button id="pb-complete-day" type="button" class="bp-btn ${dayDone ? 'secondary' : 'ghost'}" ${dayDone ? 'disabled' : ''}>${dayDone ? 'Day complete' : 'Complete day'}</button>
      </div>`;
    missionCard.parentNode.insertBefore(card, missionCard.nextSibling);
    card.querySelector('#pb-complete-workout')?.addEventListener('click', markWorkoutComplete);
    card.querySelector('#pb-complete-day')?.addEventListener('click', markDayComplete);
  }

  function boot() {
    maybeAutoComplete();
    renderCatalog();
    renderCompletionCard();
  }

  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(boot, 80);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', boot);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) boot(); });
  setTimeout(boot, 300);
})();
