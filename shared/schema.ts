import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  decimals: text("decimals").notNull(),
  totalSupply: text("total_supply"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hash: text("hash").notNull().unique(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  tokenAddress: text("token_address").notNull(),
  amount: text("amount").notNull(),
  type: text("type").notNull(), // 'send', 'receive', 'approve'
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  blockNumber: text("block_number"),
  gasUsed: text("gas_used"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userBalances = pgTable("user_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  tokenAddress: text("token_address").notNull(),
  balance: text("balance").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertUserBalanceSchema = createInsertSchema(userBalances).omit({
  id: true,
  updatedAt: true,
});

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;
export type UserBalance = typeof userBalances.$inferSelect;

// Web3 specific types
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  usdValue?: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
  type: 'send' | 'receive' | 'approve';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: string;
  blockNumber?: string;
}
