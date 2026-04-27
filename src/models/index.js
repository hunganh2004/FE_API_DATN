import sequelize from '../config/database.js';

import User from './user.model.js';
import UserAddress from './userAddress.model.js';
import Category from './category.model.js';
import PetType from './petType.model.js';
import Product from './product.model.js';
import ProductVariant from './productVariant.model.js';
import ProductImage from './productImage.model.js';
import ProductSpec from './productSpec.model.js';
import ProductPetType from './productPetType.model.js';
import Review from './review.model.js';
import CartItem from './cartItem.model.js';
import Coupon from './coupon.model.js';
import Order from './order.model.js';
import OrderItem from './orderItem.model.js';
import OrderStatusLog from './orderStatusLog.model.js';
import Payment from './payment.model.js';
import UserBehaviorLog from './userBehaviorLog.model.js';
import ProductRecommendation from './productRecommendation.model.js';
import AssociationRule from './associationRule.model.js';
import CustomerSegment from './customerSegment.model.js';
import UserSegment from './userSegment.model.js';
import RepurchasePrediction from './repurchasePrediction.model.js';
import Wishlist from './wishlist.model.js';
import Notification from './notification.model.js';

// ── Associations ──────────────────────────────────────────────

User.hasMany(UserAddress, { foreignKey: 'fk_user_id', as: 'addresses' });
UserAddress.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });

Category.hasMany(Category, { foreignKey: 'fk_parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'fk_parent_id', as: 'parent' });
Category.hasMany(Product, { foreignKey: 'fk_category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'fk_category_id', as: 'category' });

Product.hasMany(ProductVariant, { foreignKey: 'fk_product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

Product.hasMany(ProductImage, { foreignKey: 'fk_product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

Product.hasMany(ProductSpec, { foreignKey: 'fk_product_id', as: 'specs' });
ProductSpec.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

Product.belongsToMany(PetType, { through: ProductPetType, foreignKey: 'fk_product_id', otherKey: 'fk_pet_type_id', as: 'petTypes' });
PetType.belongsToMany(Product, { through: ProductPetType, foreignKey: 'fk_pet_type_id', otherKey: 'fk_product_id', as: 'products' });

Product.hasMany(Review, { foreignKey: 'fk_product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });
User.hasMany(Review, { foreignKey: 'fk_user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Review.hasMany(Review, { foreignKey: 'fk_parent_id', as: 'replies' });
Review.belongsTo(Review, { foreignKey: 'fk_parent_id', as: 'parent' });

User.hasMany(CartItem, { foreignKey: 'fk_user_id', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Product.hasMany(CartItem, { foreignKey: 'fk_product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });
ProductVariant.hasMany(CartItem, { foreignKey: 'fk_variant_id', as: 'cartItems' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'fk_variant_id', as: 'variant' });

User.hasMany(Order, { foreignKey: 'fk_user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Coupon.hasMany(Order, { foreignKey: 'fk_coupon_id', as: 'orders' });
Order.belongsTo(Coupon, { foreignKey: 'fk_coupon_id', as: 'coupon' });

Order.hasMany(OrderItem, { foreignKey: 'fk_order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'fk_order_id', as: 'order' });
Product.hasMany(OrderItem, { foreignKey: 'fk_product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'fk_variant_id', as: 'orderItems' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'fk_variant_id', as: 'variant' });

Order.hasMany(OrderStatusLog, { foreignKey: 'fk_order_id', as: 'statusLogs' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'fk_order_id', as: 'order' });

Order.hasOne(Payment, { foreignKey: 'fk_order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'fk_order_id', as: 'order' });

User.hasMany(UserBehaviorLog, { foreignKey: 'fk_user_id', as: 'behaviorLogs' });
UserBehaviorLog.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Product.hasMany(UserBehaviorLog, { foreignKey: 'fk_product_id', as: 'behaviorLogs' });
UserBehaviorLog.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

User.hasMany(ProductRecommendation, { foreignKey: 'fk_user_id', as: 'recommendations' });
ProductRecommendation.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Product.hasMany(ProductRecommendation, { foreignKey: 'fk_product_id', as: 'recommendations' });
ProductRecommendation.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

User.belongsToMany(CustomerSegment, { through: UserSegment, foreignKey: 'fk_user_id', otherKey: 'fk_segment_id', as: 'segments' });
CustomerSegment.belongsToMany(User, { through: UserSegment, foreignKey: 'fk_segment_id', otherKey: 'fk_user_id', as: 'users' });

User.hasMany(RepurchasePrediction, { foreignKey: 'fk_user_id', as: 'repurchasePredictions' });
RepurchasePrediction.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Product.hasMany(RepurchasePrediction, { foreignKey: 'fk_product_id', as: 'repurchasePredictions' });
RepurchasePrediction.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

User.hasMany(Wishlist, { foreignKey: 'fk_user_id', as: 'wishlists' });
Wishlist.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });
Product.hasMany(Wishlist, { foreignKey: 'fk_product_id', as: 'wishlists' });
Wishlist.belongsTo(Product, { foreignKey: 'fk_product_id', as: 'product' });

User.hasMany(Notification, { foreignKey: 'fk_user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'fk_user_id', as: 'user' });

export {
  sequelize,
  User, UserAddress,
  Category, PetType,
  Product, ProductVariant, ProductImage, ProductSpec, ProductPetType, Review,
  CartItem, Coupon, Order, OrderItem, OrderStatusLog, Payment,
  UserBehaviorLog, ProductRecommendation, AssociationRule,
  CustomerSegment, UserSegment, RepurchasePrediction,
  Wishlist, Notification,
};
