"use client";

/**
 * TransactionsView Component
 * Full transactions list view
 */

import { useState } from "react";
import { Search, Filter, Calendar, Download } from "lucide-react";
import { TransactionFeed } from "../TransactionFeed";

export function TransactionsView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Transactions</h1>
        <p className="text-muted">View and manage all your transactions</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary outline-none text-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors">
          <Filter className="w-5 h-5 text-muted" />
          <span className="text-sm text-muted">Filter</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors">
          <Calendar className="w-5 h-5 text-muted" />
          <span className="text-sm text-muted">Date Range</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-black font-medium hover:bg-primary-hover transition-colors">
          <Download className="w-5 h-5" />
          <span className="text-sm">Export</span>
        </button>
      </div>

      {/* Transaction Feed */}
      <TransactionFeed showAll />
    </div>
  );
}
