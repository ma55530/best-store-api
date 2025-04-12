const validateOrder = (req, res, next) => {
    if (req.method === 'POST' && req.path === '/orders') {
        const { userId, items, total, shippingDetails } = req.body;

        // Check required fields
        if (!userId || !items || !total || !shippingDetails) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        // Validate shipping details
        const { firstName, lastName, address, phone } = shippingDetails;
        if (!firstName || !lastName || !address || !phone) {
            return res.status(400).json({
                error: "Missing shipping details"
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "Order must contain at least one item"
            });
        }

        // Validate total
        const calculatedTotal = items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        if (Math.abs(calculatedTotal - total) > 0.01) {
            return res.status(400).json({
                error: "Order total doesn't match items total"
            });
        }
    }
    next();
};

module.exports = validateOrder;