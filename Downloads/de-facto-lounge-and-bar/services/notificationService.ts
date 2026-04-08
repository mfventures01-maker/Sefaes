export const generateWhatsAppMessage = (phone: string, tableId: string, customerName: string, customerPhone: string, items: any[], total: number, paymentMethod: string, orderId: string) => {
    const orderText = items.map(item => `- ${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`).join('%0A');

    const message = `Hi, I have placed an order for Table ${tableId}.%0A` +
        `Name: ${customerName}%0A` +
        `Phone: ${customerPhone}%0A` +
        `Items:%0A${orderText}%0A` +
        `Total: ₦${total.toLocaleString()}%0A` +
        `Payment: ${paymentMethod}%0A` +
        `Order ID: ${orderId}`;

    return `https://wa.me/${phone}?text=${message}`;
};

export const generateTelegramMessage = (username: string, tableId: string, customerName: string, customerPhone: string, items: any[], total: number, paymentMethod: string, orderId: string) => {
    const orderText = items.map(item => `- ${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`).join('%0A');

    const message = `Hi, I have placed an order for Table ${tableId}.%0A` +
        `Name: ${customerName}%0A` +
        `Phone: ${customerPhone}%0A` +
        `Items:%0A${orderText}%0A` +
        `Total: ₦${total.toLocaleString()}%0A` +
        `Payment: ${paymentMethod}%0A` +
        `Order ID: ${orderId}`;

    return `https://t.me/${username}?text=${message}`;
};
