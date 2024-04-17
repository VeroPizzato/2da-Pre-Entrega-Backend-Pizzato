const mongoose = require('mongoose')

const cartCollection = 'carts';

// const cartSchema = new mongoose.Schema({
//     id: {
//         type: Number,
//         require: true,
//         unique: true
//     },
//     arrayCart: [{ productId: Number, quantity: Number }]    
// });

const cartSchema = new mongoose.Schema({
    id: {
        type: Number,
        require: true,
        unique: true
    },
    arrayCart: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    require: true,
                    ref: 'products'
                },
                quantity: {
                    type: Number,
                    require: true,
                    default: 0
                },
            }
        ],
        default: []
    }
});

module.exports = mongoose.model('Cart', cartSchema, cartCollection);