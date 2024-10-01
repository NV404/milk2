import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  real,
  varchar,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  isFarmer: boolean("is_farmer").notNull().default(false),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  farmLocation: jsonb("farm_location"),
  profileImage: text("profile_image"),
  cropsGrown: jsonb("crops_grown"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type Users = InferSelectModel<typeof users>;
export type UsersInsert = InferInsertModel<typeof users>;

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmerId: uuid("farmer_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  variety: varchar("variety", { length: 100 }),
  price: real("price").notNull(),
  image: text("image"),
  isBidding: boolean("is_bidding").notNull().default(false),
  quantity: integer("quantity").notNull(),
  unit: text("unit"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Products = InferSelectModel<typeof products>;
export type ProductsInsert = InferInsertModel<typeof products>;

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  consumerId: uuid("consumer_id").references(() => users.id),
  status: orderStatusEnum("status").notNull(),
  totalAmount: real("total_amount").notNull(),
  paymentInfo: jsonb("payment_info"),
  deliveryDetails: jsonb("delivery_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Orders = InferSelectModel<typeof orders>;
export type OrdersInsert = InferInsertModel<typeof orders>;

// OrderItems table (for many-to-many relationship between orders and products)
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  productId: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

export type OrderItems = InferSelectModel<typeof orderItems>;
export type OrderItemsInsert = InferInsertModel<typeof orderItems>;

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerId: uuid("reviewer_id").references(() => users.id),
  productId: uuid("product_id").references(() => products.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Reviews = InferSelectModel<typeof reviews>;
export type ReviewsInsert = InferInsertModel<typeof reviews>;

export const bids = pgTable("bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id),
  bidderId: uuid("bidder_id").references(() => users.id),
  amount: real("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Bids = InferSelectModel<typeof bids>;
export type BidsInsert = InferInsertModel<typeof bids>;

// CropCalendar table
export const cropCalendar = pgTable("crop_calendar", {
  id: uuid("id").primaryKey().defaultRandom(),
  cropName: varchar("crop_name", { length: 255 }).notNull(),
  plantingDate: timestamp("planting_date"),
  harvestDate: timestamp("harvest_date"),
  season: varchar("season", { length: 50 }),
});

export type CropCalendar = InferSelectModel<typeof cropCalendar>;
export type CropCalendarInsert = InferInsertModel<typeof cropCalendar>;

// MarketPrices table
export const marketPrices = pgTable("market_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  cropName: varchar("crop_name", { length: 255 }).notNull(),
  price: real("price").notNull(),
  date: timestamp("date").defaultNow(),
});

export type MarketPrices = InferSelectModel<typeof marketPrices>;
export type MarketPricesInsert = InferInsertModel<typeof marketPrices>;

// WeatherAlerts table
export const weatherAlerts = pgTable("weather_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  region: varchar("region", { length: 255 }).notNull(),
  alertType: varchar("alert_type", { length: 100 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow(),
});

export type WeatherAlerts = InferSelectModel<typeof weatherAlerts>;
export type WeatherAlertsInsert = InferInsertModel<typeof weatherAlerts>;

// GovernmentSchemes table
export const governmentSchemes = pgTable("government_schemes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  applicationDeadline: timestamp("application_deadline"),
});

export type GovernmentSchemes = InferSelectModel<typeof governmentSchemes>;
export type GovernmentSchemesInsert = InferInsertModel<
  typeof governmentSchemes
>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  bids: many(bids),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  farmer: one(users, { fields: [products.farmerId], references: [users.id] }),
  orderItems: many(orderItems),
  reviews: many(reviews),
  bids: many(bids),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  consumer: one(users, { fields: [orders.consumerId], references: [users.id] }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  product: one(products, {
    fields: [bids.productId],
    references: [products.id],
  }),
  bidder: one(users, {
    fields: [bids.bidderId],
    references: [users.id],
  }),
}));
