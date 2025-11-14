const { Product } = require("../database/models");
const express = require('express');
const { verifyToken } = require("../utils/token");

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();

        res.status(200).json({success:true, message:'Products retrieved successfully', data: products});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting the product', data: error.message});
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)) {
            res.status(400).json({success: false, message: 'Product id is not valid', data: {}});
        }

        const product = await Product.findByPk(id);

        if (!product) {
            res.status(404).json({success: false, message: 'Product was not found', data: {}});
        }

        res.status(200).json({success: true, message: 'Product was found', data: product});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting the product', data: error.message});
    }
})

router.post('/', verifyToken, async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,

        })

        res.status(201).json({success: true, message:'Product successfully created', data: product});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating the product', data: error.message});
    }
})

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)) {
            res.status(400).json({success: false, message: 'Product id is not valid', data: {}});
        }

        const product = await Product.findByPk(id);

        if(!product) {
            res.status(404).json({success: false, message: 'Product was not found', data: {}});
        }

        const updatedProduct = await product.update({
            ...req.body,
        })

        res.status(200).json({success: true, message: 'Product updated successfully', data: updatedProduct});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating the product', data: error.message});
    }
})

// ...existing code...

router.post('/add-product/:productId', verifyToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = req.body.quantity || 1;

        if(isNaN(productId)) {
            return res.status(400).json({success: false, message: 'Product id is not valid'});
        }

        const order = await Order.create({
            productId: parseInt(productId),
            quantity: parseInt(quantity)
        });

        res.status(201).json({success: true, message: 'Product added to orders', data: order});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error adding product to orders', data: error.message});
    }
});

///

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)) {
            res.status(400).json({success: false, message: 'Product id is not valid', data: {}});
        }

        const product = await Product.findByPk(id);

        if(!product) {
            res.status(404).json({success: false, message: 'Product was not found', data: {}});
        }

        await product.destroy();

        res.status(200).json({success: true, message: 'Product successfully deleted', data: {}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting the product', data: error.message});
    }
})

module.exports = router;