import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function extractServingsNumber(yieldText: string): number {
    if (!yieldText) return 1;
    // Look for the first number in the string
    const match = yieldText.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 1;
}

export function formatNumber(num: number): string {
    // Format to avoid long decimals, e.g. 1.3333 -> 1.33
    return Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');
}

// Simple fraction converter (optional, can be expanded)
export function toFraction(amount: number): string {
    if (Number.isInteger(amount)) return amount.toString();

    const tolerance = 1.0E-6;
    let h1 = 1; let h2 = 0;
    let k1 = 0; let k2 = 1;
    let b = amount;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(amount - h1 / k1) > amount * tolerance);

    if (k1 === 1) return h1.toString();
    return `${h1}/${k1}`;
}
