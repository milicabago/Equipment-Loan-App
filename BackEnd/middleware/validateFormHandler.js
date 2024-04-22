/** Form validation **/
const updateEquipmentForm = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            res.status(400).json({ error: errorMessages.join(', ') });
        } else {
            next();
        }
    };
};

module.exports = { updateEquipmentForm };
