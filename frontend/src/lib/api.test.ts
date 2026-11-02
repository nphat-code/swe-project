import { formatCurrency } from './api';

describe('API Utils - formatCurrency', () => {
  it('formats integer VND currency correctly', () => {
    const formatted = formatCurrency(29000);
    expect(formatted).toContain('29.000');
    expect(formatted).toContain('₫');
  });

  it('formats zero amount correctly', () => {
    const formatted = formatCurrency(0);
    expect(formatted).toContain('0');
    expect(formatted).toContain('₫');
  });

  it('formats large amount correctly', () => {
    const formatted = formatCurrency(1250000);
    expect(formatted).toContain('1.250.000');
    expect(formatted).toContain('₫');
  });
});
