/**
 * Lemora Wallet Tracker - Filter Rules Engine
 * Advanced filtering rules for transaction and token data
 */

import { Transaction, TokenInfo } from '../types';
import { CONSTANTS } from '../config/constants';

export interface FilterRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  condition: FilterCondition;
  action: FilterAction;
}

export interface FilterCondition {
  type: 'AND' | 'OR';
  rules: ConditionRule[];
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface FilterAction {
  type: 'include' | 'exclude' | 'flag' | 'transform';
  parameters?: Record<string, any>;
}

export class FilterRulesEngine {
  private rules: FilterRule[] = [];
  private ruleCache: Map<string, boolean> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initializes default filtering rules
   */
  private initializeDefaultRules(): void {
    // Rule to exclude spam tokens
    this.addRule({
      id: 'exclude-spam-tokens',
      name: 'Exclude Spam Tokens',
      description: 'Filters out known spam token transactions',
      enabled: true,
      priority: 1,
      condition: {
        type: 'OR',
        rules: [
          {
            field: 'token.symbol',
            operator: 'contains',
            value: 'SPAM'
          },
          {
            field: 'amount',
            operator: 'less_than',
            value: 0.001
          }
        ]
      },
      action: {
        type: 'exclude'
      }
    });

    // Rule to flag large transactions
    this.addRule({
      id: 'flag-large-transactions',
      name: 'Flag Large Transactions',
      description: 'Flags transactions above a certain threshold',
      enabled: true,
      priority: 2,
      condition: {
        type: 'AND',
        rules: [
          {
            field: 'amount',
            operator: 'greater_than',
            value: 1000
          }
        ]
      },
      action: {
        type: 'flag',
        parameters: {
          flag: 'large_transaction'
        }
      }
    });

    // Rule to include only trading pairs
    this.addRule({
      id: 'include-trading-pairs',
      name: 'Include Trading Pairs',
      description: 'Only includes transactions from known trading pairs',
      enabled: true,
      priority: 3,
      condition: {
        type: 'OR',
        rules: [
          {
            field: 'type',
            operator: 'equals',
            value: 'SWAP'
          },
          {
            field: 'type',
            operator: 'equals',
            value: 'TRANSFER'
          }
        ]
      },
      action: {
        type: 'include'
      }
    });
  }

  /**
   * Adds a new filter rule
   */
  public addRule(rule: FilterRule): void {
    this.rules.push(rule);
    this.sortRulesByPriority();
    this.clearCache();
  }

  /**
   * Removes a filter rule by ID
   */
  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
    this.clearCache();
  }

  /**
   * Updates an existing filter rule
   */
  public updateRule(ruleId: string, updates: Partial<FilterRule>): void {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
      this.sortRulesByPriority();
      this.clearCache();
    }
  }

  /**
   * Applies all active rules to a transaction
   */
  public applyRules(transaction: Transaction): {
    include: boolean;
    flags: string[];
    transformedTransaction: Transaction;
  } {
    const cacheKey = this.generateCacheKey(transaction);
    
    let include = true;
    const flags: string[] = [];
    let transformedTransaction = { ...transaction };

    for (const rule of this.rules.filter(r => r.enabled)) {
      if (this.evaluateCondition(rule.condition, transaction)) {
        switch (rule.action.type) {
          case 'exclude':
            include = false;
            break;
          case 'include':
            // Include action doesn't change the include flag directly
            break;
          case 'flag':
            if (rule.action.parameters?.flag) {
              flags.push(rule.action.parameters.flag);
            }
            break;
          case 'transform':
            transformedTransaction = this.applyTransformation(
              transformedTransaction, 
              rule.action.parameters || {}
            );
            break;
        }
      }
    }

    return {
      include,
      flags,
      transformedTransaction
    };
  }

  /**
   * Evaluates a filter condition against a transaction
   */
  private evaluateCondition(condition: FilterCondition, transaction: Transaction): boolean {
    if (condition.type === 'AND') {
      return condition.rules.every(rule => this.evaluateRule(rule, transaction));
    } else {
      return condition.rules.some(rule => this.evaluateRule(rule, transaction));
    }
  }

  /**
   * Evaluates a single condition rule
   */
  private evaluateRule(rule: ConditionRule, transaction: Transaction): boolean {
    const fieldValue = this.getFieldValue(rule.field, transaction);
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'not_equals':
        return fieldValue !== rule.value;
      case 'greater_than':
        return Number(fieldValue) > Number(rule.value);
      case 'less_than':
        return Number(fieldValue) < Number(rule.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Gets field value from transaction using dot notation
   */
  private getFieldValue(field: string, transaction: Transaction): any {
    return field.split('.').reduce((obj, key) => obj?.[key], transaction as any);
  }

  /**
   * Applies transformation to transaction
   */
  private applyTransformation(transaction: Transaction, parameters: Record<string, any>): Transaction {
    // Implement transformation logic based on parameters
    return transaction;
  }

  /**
   * Sorts rules by priority (lower number = higher priority)
   */
  private sortRulesByPriority(): void {
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generates cache key for transaction
   */
  private generateCacheKey(transaction: Transaction): string {
    return `${transaction.signature}-${transaction.timestamp}`;
  }

  /**
   * Clears the rule cache
   */
  private clearCache(): void {
    this.ruleCache.clear();
  }

  /**
   * Gets all active rules
   */
  public getActiveRules(): FilterRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  /**
   * Gets all rules
   */
  public getAllRules(): FilterRule[] {
    return [...this.rules];
  }

  /**
   * Enables or disables a rule
   */
  public toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.clearCache();
    }
  }
}
