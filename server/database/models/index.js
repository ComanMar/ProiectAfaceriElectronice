const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');

Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { User, Product, Order };