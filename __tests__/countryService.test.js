import { countryExists, findCountryCodeByName } from '../services/countryService.js';

function createMockDb(rows = []) {
  return {
    async query(sql, params) {
      // Very simple matcher for our expected SQL
      if (typeof sql !== 'string') throw new Error('SQL must be string');
      return { rows };
    },
  };
}

describe('countryService', () => {
  test('findCountryCodeByName returns code when country matches partially (case-insensitive)', async () => {
    const db = createMockDb([{ country_code: 'US' }]);
    const code = await findCountryCodeByName(db, 'uniTed sta');
    expect(code).toBe('US');
  });

  test('findCountryCodeByName returns null when no match', async () => {
    const db = createMockDb([]);
    const code = await findCountryCodeByName(db, 'Narnia');
    expect(code).toBeNull();
  });

  test('countryExists true when a country is found', async () => {
    const db = createMockDb([{ country_code: 'BE' }]);
    await expect(countryExists(db, 'Belgi')).resolves.toBe(true);
  });

  test('countryExists false when input empty/whitespace', async () => {
    const db = createMockDb([]);
    await expect(countryExists(db, '   ')).resolves.toBe(false);
  });

  test('countryExists false when no match', async () => {
    const db = createMockDb([]);
    await expect(countryExists(db, 'Atlantis')).resolves.toBe(false);
  });
});
