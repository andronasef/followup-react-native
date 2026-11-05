import { resolve, allVariants, arVariants, enVariants, all } from '../src/locales';

describe('locales and multi-track copy variants', () => {
  test('ar has 3 distinct tracks matching specifications', () => {
    expect(arVariants).toHaveLength(3);
    const [love, healer, forgiveness] = arVariants;

    // Track 1: Unconditional Love
    expect(love.popupHeadline).toContain('حب ملوش شروط');
    expect(love.popupBody).toContain('المسيح بيحبك حب حقيقي');
    expect(love.scenes[0].kicker).toContain('تعبت من إرضاء الناس');
    expect(love.scenes[0].reference).toContain('إرميا 31');

    // Track 2: The Healer
    expect(healer.popupHeadline).toContain('شفا ورجاء');
    expect(healer.popupBody).toContain('المسيح الشافي');
    expect(healer.popupBody).toContain('مش هتخسر حاجة');
    expect(healer.scenes[0].reference).toContain('إشعياء 53');

    // Track 3: Forgiveness of Sins
    expect(forgiveness.popupHeadline).toContain('رحمة ربنا أكبر من أي ذنب');
    expect(forgiveness.popupBody).toContain('الله غفر خطايانا كلها');
    expect(forgiveness.scenes[0].reference).toContain('إشعياء 1');
  });

  test('all supported languages have prefilledMessage defined in contact', () => {
    for (const [code, strings] of Object.entries(all)) {
      expect(strings.contact.prefilledMessage).toBeTruthy();
    }
    expect(all.ar.contact.prefilledMessage).toBe('عاوز اعرف عن اللي انت بتتكلم عنه اكتر!');
  });

  test('resolve returns specific variant when variantIndex is provided', () => {
    const v0 = resolve('ar', 0);
    const v1 = resolve('ar', 1);
    const v2 = resolve('ar', 2);

    expect(v0.popupHeadline).toBe(arVariants[0].popupHeadline);
    expect(v1.popupHeadline).toBe(arVariants[1].popupHeadline);
    expect(v2.popupHeadline).toBe(arVariants[2].popupHeadline);
  });

  test('resolve picks random variant when variantIndex is omitted', () => {
    const v0 = resolve('ar', undefined, () => 0.0);
    const v1 = resolve('ar', undefined, () => 0.5);
    const v2 = resolve('ar', undefined, () => 0.99);

    expect(v0.popupHeadline).toBe(arVariants[0].popupHeadline);
    expect(v1.popupHeadline).toBe(arVariants[1].popupHeadline);
    expect(v2.popupHeadline).toBe(arVariants[2].popupHeadline);
  });

  test('en variants offer 3 distinct angles', () => {
    expect(enVariants).toHaveLength(3);
    const [love, healer, forgiveness] = enVariants;

    expect(love.popupHeadline).toContain('no strings attached');
    expect(healer.popupHeadline).toContain('healing for you');
    expect(forgiveness.popupHeadline).toContain("God's mercy is greater");
  });
});
