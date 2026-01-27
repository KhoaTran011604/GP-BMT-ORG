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

/**
 * Convert number to Vietnamese words for currency
 * Examples:
 * - 1000000 → "Một triệu đồng"
 * - 1500000 → "Một triệu năm trăm nghìn đồng"
 * - 123456789 → "Một trăm hai mươi ba triệu bốn trăm năm mươi sáu nghìn bảy trăm tám mươi chín đồng"
 */
export function numberToVietnameseWords(amount: number): string {
  if (amount === 0) return "Không đồng";

  const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const teens = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];

  function convertChunk(num: number): string {
    if (num === 0) return "";

    const hundred = Math.floor(num / 100);
    const ten = Math.floor((num % 100) / 10);
    const one = num % 10;

    let result = "";

    // Trăm
    if (hundred > 0) {
      result += ones[hundred] + " trăm";
      if (ten === 0 && one > 0) {
        result += " lẻ";
      }
    }

    // Chục
    if (ten > 1) {
      result += (result ? " " : "") + ones[ten] + " mươi";
      if (one === 1) {
        result += " mốt";
      } else if (one === 5 && ten > 1) {
        result += " lăm";
      } else if (one > 0) {
        result += " " + ones[one];
      }
    } else if (ten === 1) {
      result += (result ? " " : "") + teens[one];
    } else if (one > 0) {
      result += (result ? " " : "") + ones[one];
    }

    return result.trim();
  }

  const billion = Math.floor(amount / 1000000000);
  const million = Math.floor((amount % 1000000000) / 1000000);
  const thousand = Math.floor((amount % 1000000) / 1000);
  const remainder = amount % 1000;

  let result = "";

  if (billion > 0) {
    result += convertChunk(billion) + " tỷ";
  }

  if (million > 0) {
    result += (result ? " " : "") + convertChunk(million) + " triệu";
  }

  if (thousand > 0) {
    result += (result ? " " : "") + convertChunk(thousand) + " nghìn";
  }

  if (remainder > 0) {
    result += (result ? " " : "") + convertChunk(remainder);
  }

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result + " đồng";
}
