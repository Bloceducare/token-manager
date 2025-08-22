import { type Token, type InsertToken, type Transaction, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for our DeFi token management platform
export interface IStorage {
  getToken(address: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  getTransactions(userAddress: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private tokens: Map<string, Token>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.tokens = new Map();
    this.transactions = new Map();
  }

  async getToken(address: string): Promise<Token | undefined> {
    return this.tokens.get(address);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = randomUUID();
    const token: Token = { 
      ...insertToken, 
      id,
      createdAt: new Date()
    };
    this.tokens.set(insertToken.address, token);
    return token;
  }

  async getTransactions(userAddress: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.from === userAddress || tx.to === userAddress
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      timestamp: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
