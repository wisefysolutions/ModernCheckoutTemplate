import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  type CartItemWithProduct,
  type OrderWithItems
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart operations
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userId: number;
  private productId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Add sample products
    this.createProduct({
      name: "Wireless Earbuds Pro",
      description: "Noise cancelling, 24hr battery",
      price: "129.99",
      image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    });
    
    this.createProduct({
      name: "SmartFit Watch",
      description: "GPS, Heart rate monitoring",
      price: "249.99",
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    });
    
    this.createProduct({
      name: "Premium Bluetooth Speaker",
      description: "360° sound, waterproof design",
      price: "89.99",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    });
    
    this.createProduct({
      name: "Ultra HD Action Camera",
      description: "4K video, waterproof, stabilization",
      price: "199.99",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  
  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
    
    return Promise.all(
      items.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
  }
  
  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists for this session and product
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => 
        item.sessionId === insertItem.sessionId && 
        item.productId === insertItem.productId
    );
    
    if (existingItem) {
      return this.updateCartItem(
        existingItem.id, 
        existingItem.quantity + (insertItem.quantity || 1)
      ) as Promise<CartItem>;
    }
    
    const id = this.cartItemId++;
    const item = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    if (quantity <= 0) {
      await this.removeCartItem(id);
      return undefined;
    }
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }
  
  async clearCart(sessionId: string): Promise<void> {
    for (const [id, item] of this.cartItems.entries()) {
      if (item.sessionId === sessionId) {
        this.cartItems.delete(id);
      }
    }
  }
  
  // Order operations
  async createOrder(insertOrder: InsertOrder, insertItems: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const order = { ...insertOrder, id };
    this.orders.set(id, order);
    
    // Add order items
    for (const itemData of insertItems) {
      const itemId = this.orderItemId++;
      const item = { ...itemData, id: itemId, orderId: id };
      this.orderItems.set(itemId, item);
    }
    
    return order;
  }
  
  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const orderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id
    );
    
    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
    
    return { ...order, items: itemsWithProducts };
  }
}

export const storage = new MemStorage();
