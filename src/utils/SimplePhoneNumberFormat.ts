export function formatPhoneNumber(phoneNumber: bigint | string): string {
    const phoneStr = phoneNumber.toString();
    const trimmed = phoneStr.replace(/0+$/, '');

    // Check for Mexico country code patterns
    if (trimmed.startsWith('52')) {
        const restOfNumber = trimmed.substring(2);
        return `+52 ${restOfNumber}`;
    }

    // Check for US/Canada country code patterns
    if (trimmed.startsWith('1')) {
        const restOfNumber = trimmed.substring(1);
        return `+1 ${restOfNumber}`;
    }

    return `+${trimmed}`;
}