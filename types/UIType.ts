import React from "react";

// Navbar Types
export interface NavItem {
    label: string,
    href: string
};

// Select Types
export interface SelectOption {
    label: string,
    value: string
};

// Table Types
export interface Column<T> {
    title: string,
    key: string,
    render?: (row: T) => React.ReactNode;
};

export interface TableProps<T> {
    columns: Column<T>[],
    data: T[],
    isLoading?: boolean
};