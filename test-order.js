const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60_000);

  const BASE = 'https://oumi-roll.vercel.app';

  // Перехватываем ответы /api/payment/intent для диагностики
  page.on('response', async resp => {
    if (resp.url().includes('/api/payment/intent')) {
      const status = resp.status();
      const body = await resp.text().catch(() => '(не прочитать)');
      console.log(`    [API] /api/payment/intent → ${status}: ${body.slice(0, 200)}`);
    }
  });

  // ── 1. Главная страница — ждём загрузки меню ─────────────────────────
  console.log('[1] Открываем главную...');
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'shot-1-home.png' });
  console.log('    OK ✓');

  // ── 2. Скроллируем к меню и добавляем первый товар ──────────────────
  console.log('[2] Добавляем товар в корзину...');
  await page.locator('#menu').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // Кнопка добавления — aria-label "Ajouter <имя>"
  const addBtns = page.getByRole('button', { name: /^ajouter/i });
  const addCount = await addBtns.count();
  console.log(`    Найдено ${addCount} кнопок "Ajouter"`);

  if (addCount === 0) {
    // fallback: кнопка без aria-label с текстом "+"
    const plusBtn = page.locator('button').filter({ hasText: /^\+$/ }).first();
    await plusBtn.click();
  } else {
    await addBtns.first().click();
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shot-2-added.png' });
  console.log('    Товар добавлен ✓');

  // ── 3. Добавляем второй товар (для бонуса 2+) ────────────────────────
  const addBtns2 = page.getByRole('button', { name: /^ajouter/i });
  if (await addBtns2.count() > 1) {
    await addBtns2.nth(1).click();
    console.log('    Второй товар добавлен ✓');
  } else {
    await addBtns2.first().click();
    console.log('    Добавили первый товар ещё раз ✓');
  }
  await page.waitForTimeout(800);

  // ── 4. Открываем drawer корзины и переходим к заказу ───────────────
  console.log('[3] Открываем корзину...');

  // CartDrawer закрыт — translate-x-full. Кнопка в header: aria-label="Votre Panier (N)"
  const cartBtn = page.getByRole('button', { name: /votre panier/i });
  if (await cartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await cartBtn.click();
    console.log('    Кнопка корзины нажата ✓');
  } else {
    // Fallback: последняя кнопка в header
    await page.locator('header button').last().click();
    console.log('    Корзина открыта через fallback ✓');
  }

  await page.waitForTimeout(1500); // ждём анимацию drawer (300ms transition)
  await page.screenshot({ path: 'shot-3-drawer-open.png' });

  // Кликаем "Passer la commande" — ссылка теперь внутри visible drawer
  const checkoutLink = page.getByRole('link', { name: /passer la commande/i });
  await checkoutLink.click();
  console.log('    "Passer la commande" нажата ✓');

  await page.waitForURL('**/commande', { timeout: 15_000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'shot-4-commande.png' });
  console.log('    URL:', page.url());

  // ── 5. Заполняем форму ───────────────────────────────────────────────
  console.log('[5] Заполняем форму заказа...');

  // Режим — À emporter (самовывоз, без адреса)
  const emporterBtn = page.getByRole('button', { name: /emporter|pickup/i })
    .or(page.locator('label').filter({ hasText: /emporter/i }))
    .first();
  if (await emporterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emporterBtn.click();
    console.log('    Выбран самовывоз');
  }

  // Поля не имеют атрибута name — только id типа field-prénom.
  // Ищем по placeholder (задан в компоненте Field) или type.
  const prenomField = page.locator('input[placeholder="Jean"]').first();
  await prenomField.fill('Test');
  console.log('    Prénom заполнен ✓');

  const nomField = page.locator('input[placeholder="Dupont"]').first();
  await nomField.fill('Client');
  console.log('    Nom заполнен ✓');

  const telField = page.locator('input[type="tel"]').first();
  await telField.fill('0612345678');
  console.log('    Téléphone заполнен ✓');

  const emailField = page.locator('input[type="email"]').first();
  await emailField.fill('test@example.com');
  console.log('    Email заполnен ✓');

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'shot-5-form-filled.png' });
  console.log('    Форма заполнена ✓');

  // ── 6. Отправляем заказ ───────────────────────────────────────────────
  console.log('[5] Отправляем форму...');

  // В DOM есть два SubmitBtn: первый — mobile (lg:hidden), второй — desktop (hidden lg:block).
  // На viewport 1280px видим только второй (nth(1)).
  const allSubmitBtns = page.locator('button[type="submit"][form="checkout-form"]');
  const submitCount = await allSubmitBtns.count();
  console.log(`    Найдено кнопок submit: ${submitCount}`);

  let clicked = false;
  for (let i = 0; i < submitCount; i++) {
    const btn = allSubmitBtns.nth(i);
    if (await btn.isVisible().catch(() => false)) {
      console.log(`    Кликаем на кнопку #${i} (видима)`);
      await btn.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.log('    Видимой кнопки submit не найдено — пробуем Enter');
    await page.keyboard.press('Enter');
  } else {
    console.log('    Форма отправлена...');
  }

  // Ждём ответа от /api/payment/intent и навигации
  await Promise.race([
    page.waitForURL('**/paiement/**', { timeout: 15_000 }),
    page.waitForTimeout(8000),
  ]).catch(() => {});

  await page.screenshot({ path: 'shot-6-after-submit.png' });
  console.log('    URL после submit:', page.url());

  // Показываем текст ошибки на странице если есть
  const pageText = await page.locator('body').innerText().catch(() => '');
  const errorLines = pageText.split('\n').filter(l => /erreur|error|invalid|échec|problème/i.test(l));
  if (errorLines.length) console.log('    Ошибка на странице:', errorLines.slice(0, 3).join(' | '));

  // ── 7. Страница оплаты Stripe ─────────────────────────────────────────
  const currentUrl = page.url();
  if (currentUrl.includes('/paiement/')) {
    console.log('[7] Страница оплаты Stripe — вводим карту...');

    // Ждём готовности PaymentElement (кнопка Payer становится активной)
    const payBtnSelector = 'button[type="submit"]:not([disabled])';
    console.log('    Ждём загрузки Stripe PaymentElement...');
    await page.locator(payBtnSelector).waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'shot-7-stripe.png' });

    // Stripe PaymentElement сложно автоматизировать — поля в защищённых iframe
    // Даём пользователю 3 минуты для ручной оплаты в открытом браузере
    console.log('\n  ══════════════════════════════════════════════════════');
    console.log('  ✅ ОСНОВНОЙ ПОТОК РАБОТАЕТ — страница оплаты загружена!');
    console.log('  ══════════════════════════════════════════════════════');
    console.log('\n  ОПЛАТИ ВРУЧНУЮ в открытом браузере:');
    console.log('  Карта:   4242 4242 4242 4242');
    console.log('  Срок:    12 / 30');
    console.log('  CVC:     123');
    console.log('\n  Ждём подтверждения... (до 3 минут)\n');

    await page.screenshot({ path: 'shot-7-payment-page.png' });

    // Ждём навигации на /confirmation после оплаты
    await page.waitForURL('**/confirmation/**', { timeout: 180_000 }).catch(() => {});
    await page.screenshot({ path: 'shot-8-after-pay.png' });
  } else {
    console.log('    ⚠ Не попали на /paiement — текущий URL:', currentUrl);
  }

  // ── 8. Подтверждение ──────────────────────────────────────────────────
  console.log('[7] Финальная проверка...');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'shot-8-final.png' });

  const finalUrl = page.url();
  const finalText = await page.locator('body').innerText().catch(() => '');
  console.log('    URL:', finalUrl);
  const isConf = finalUrl.includes('/confirmation') || finalText.toLowerCase().includes('merci') || finalText.toLowerCase().includes('confirmé');
  console.log('    Заказ подтверждён:', isConf ? '✅ ДА' : '❓ Нет');

  if (isConf) {
    console.log('\n🎉 ТЕСТ ПРОЙДЕН — заказ успешно оформлен!');
  } else {
    console.log('\n⚠ Браузер открыт — проверь вручную');
    await page.waitForTimeout(60_000);
  }

  await browser.close();
  console.log('\nСкриншоты: shot-1-home.png ... shot-8-final.png');
})().catch(e => {
  console.error('\n❌ ОШИБКА:', e.message);
  process.exit(1);
});
