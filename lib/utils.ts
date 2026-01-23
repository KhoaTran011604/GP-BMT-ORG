import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to full Vietnamese format (e.g., 1.500.000 ₫)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format large currency amounts to compact Vietnamese format
 * Examples:
 * - 500.000 → "500.000 ₫" (below 1 million, use full format)
 * - 1.500.000 → "1,5 triệu"
 * - 15.000.000 → "15 triệu"
 * - 150.000.000 → "150 triệu"
 * - 1.500.000.000 → "1,5 tỉ"
 * - 15.000.000.000 → "15 tỉ"
 * - 150.000.000.000 → "150 tỉ"
 * - 1.500.000.000.000 → "1.500 tỉ"
 */
export function formatCompactCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Below 1 million: use full format
  if (absAmount < 1_000_000) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // 1 billion and above (tỉ)
  if (absAmount >= 1_000_000_000) {
    const billions = absAmount / 1_000_000_000;
    // Round to 1 decimal place, remove trailing .0
    const formatted = billions % 1 === 0
      ? billions.toFixed(0)
      : billions.toFixed(1).replace('.', ',').replace(/,0$/, '');
    return `${sign}${formatted} tỉ`;
  }

  // 1 million to below 1 billion (triệu)
  const millions = absAmount / 1_000_000;
  // Round to 1 decimal place, remove trailing .0
  const formatted = millions % 1 === 0
    ? millions.toFixed(0)
    : millions.toFixed(1).replace('.', ',').replace(/,0$/, '');
  return `${sign}${formatted} triệu`;
}
