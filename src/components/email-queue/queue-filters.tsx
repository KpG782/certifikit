"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { EmailQueueFilters, EmailStatus } from "@/types/email-queue";

interface QueueFiltersProps {
  filters: EmailQueueFilters;
  onFiltersChange: (filters: EmailQueueFilters) => void;
  onReset: () => void;
}

export default function QueueFilters({
  filters,
  onFiltersChange,
  onReset,
}: QueueFiltersProps) {
  const hasActiveFilters =
    filters.status || filters.search || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-zinc-700">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="ml-auto text-destructive hover:text-destructive/90 hover:bg-destructive/10 dark:text-destructive/80 dark:hover:bg-destructive/20 dark:hover:text-destructive/70"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search email..."
            value={filters.search || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === "all" ? undefined : (value as EmailStatus),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From */}
        <Input
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFiltersChange({ ...filters, dateFrom: e.target.value })
          }
          placeholder="From Date"
        />

        {/* Date To */}
        <Input
          type="date"
          value={filters.dateTo || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFiltersChange({ ...filters, dateTo: e.target.value })
          }
          placeholder="To Date"
        />
      </div>
    </div>
  );
}
