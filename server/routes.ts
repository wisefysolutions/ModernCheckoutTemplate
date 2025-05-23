import express, { type Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Create session middleware
  apiRouter.use((req, res, next) => {
    if (!req.headers.sessionid) {
      const sessionId = nanoid();
      req.headers.sessionid = sessionId;
      res.setHeader("X-Session-ID", sessionId);
    }
    next();
  });
  
  // Get all products
  apiRouter.get("/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve products" });
    }
  });
  
  // Get a single product
  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve product" });
    }
  });
  
  // Get cart items
  apiRouter.get("/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers.sessionid as string;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve cart items" });
    }
  });
  
  // Add item to cart
  apiRouter.post("/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers.sessionid as string;
      const itemData = { ...req.body, sessionId };
      
      const validatedData = insertCartItemSchema.parse(itemData);
      const cartItem = await storage.addToCart(validatedData);
      
      const cartItemWithProduct = {
        ...cartItem,
        product: await storage.getProduct(cartItem.productId),
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid item data", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  // Update cart item quantity
  apiRouter.patch("/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== "number" || quantity < 0) {
        res.status(400).json({ message: "Invalid quantity" });
        return;
      }
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem) {
        if (quantity === 0) {
          res.status(200).json({ message: "Item removed from cart" });
          return;
        }
        res.status(404).json({ message: "Cart item not found" });
        return;
      }
      
      const cartItemWithProduct = {
        ...updatedItem,
        product: await storage.getProduct(updatedItem.productId),
      };
      
      res.json(cartItemWithProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  // Remove item from cart
  apiRouter.delete("/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeCartItem(id);
      res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  
  // Process order
  apiRouter.post("/orders", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers.sessionid as string;
      const { orderDetails } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        res.status(400).json({ message: "Cart is empty" });
        return;
      }
      
      // Validate order details
      const validatedOrderDetails = insertOrderSchema.parse({
        ...orderDetails,
        sessionId,
      });
      
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        orderId: 0, // This will be set by the storage implementation
      }));
      
      // Create order
      const order = await storage.createOrder(validatedOrderDetails, orderItems);
      
      // Clear cart
      await storage.clearCart(sessionId);
      
      // Return order with order number
      res.status(201).json({
        orderId: order.id,
        orderNumber: `AB${100000 + order.id}`,
        orderDate: new Date().toISOString(),
        total: order.total,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to process order" });
    }
  });
  
  // Get order details
  apiRouter.get("/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  });
  
  // Register the API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
