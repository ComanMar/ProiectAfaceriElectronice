const { Order, Product } = require("../database/models");
const express = require('express');
const { verifyToken } = require("../utils/token");

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.status(200).json({success:true, message:'Orders retrieved successfully', data: orders});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting the order', data: error.message});
    }
})

router.post('/add-product/:productId', verifyToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = req.body.quantity || 1;

        if(isNaN(productId)) {
            return res.status(400).json({success: false, message: 'Product id is not valid'});
        }

        const product = await Product.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({success: false, message: 'Product not found'});
        }

        let order = await Order.findOne({ where: { productId: parseInt(productId) } });

        if (product.stock < quantity) {
            return res.status(400).json({success: false, message: 'Insufficient stock'});
        }

        if (order) {
            const newQuantity = order.quantity + quantity;
            
            if (product.stock < quantity) {
                return res.status(400).json({success: false, message: 'Insufficient stock'});
            }

            await order.update({ quantity: newQuantity });
        } else {
            order = await Order.create({
                productId: parseInt(productId),
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                quantity: parseInt(quantity)
            });
        }

        await product.decrement('stock', { by: quantity });

        res.status(201).json({success: true, message: 'Product added to orders', data: order});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({success: false, message: 'Error adding product to orders', data: error.message});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)) {
            return res.status(400).json({success: false, message: 'Order id is not valid', data: {}});
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({success: false, message: 'Order was not found', data: {}});
        }

        res.status(200).json({success: true, message: 'Order was found', data: order});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting the order', data: error.message});
    }
})

router.post('/', verifyToken, async (req, res) => {
    try {
        const order = await Order.create({
            ...req.body,
        })

        res.status(201).json({success: true, message:'Order successfully created', data: order});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating the order', data: error.message});
    }
})

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { quantity } = req.body;

        if(isNaN(id)) {
            return res.status(400).json({success: false, message: 'Order id is not valid', data: {}});
        }

        const order = await Order.findByPk(id);

        if(!order) {
            return res.status(404).json({success: false, message: 'Order was not found', data: {}});
        }

        const product = await Product.findByPk(order.productId);
        if (!product) {
            return res.status(404).json({success: false, message: 'Product not found', data: {}});
        }

        const oldQuantity = order.quantity;
        const quantityDifference = quantity - oldQuantity;

        // Verifică stocul dacă creștem cantitatea
        if (quantityDifference > 0 && product.stock < quantityDifference) {
            return res.status(400).json({success: false, message: 'Insufficient stock'});
        }

        // Actualizează stocul produsului
        if (quantityDifference > 0) {
            // Scade din stoc dacă creștem comanda
            await product.decrement('stock', { by: quantityDifference });
        } else if (quantityDifference < 0) {
            // Crește în stoc dacă scădem comanda
            await product.increment('stock', { by: Math.abs(quantityDifference) });
        }

        const updatedOrder = await order.update({
            quantity: quantity
        })

        res.status(200).json({success: true, message: 'Order updated successfully', data: updatedOrder});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({success: false, message: 'Error updating the order', data: error.message});
    }
})

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)) {
            return res.status(400).json({success: false, message: 'Order id is not valid', data: {}});
        }

        const order = await Order.findByPk(id);

        if(!order) {
            return res.status(404).json({success: false, message: 'Order was not found', data: {}});
        }

        const product = await Product.findByPk(order.productId);
        // Restabilește stocul
        await product.increment('stock', { by: order.quantity });

        await order.destroy();

        res.status(200).json({success: true, message: 'Order successfully deleted', data: {}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting the order', data: error.message});
    }
})

module.exports = router;