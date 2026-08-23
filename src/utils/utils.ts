export function calculateDiscount(price: number, percentage: number): number {
    if (percentage < 0 || percentage > 100) {
        throw new Error("Percentage must be between 0 and 100");
    }
    return (price * (percentage / 100));
}