import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EstimatePurchasesTable from '../../../app/widgets/EstimatePurchasesTable';

// Mock dependencies
vi.mock('shared/lib/formatters', () => ({
  formatCurrency: (val) => `${val} ₽`
}));

// Mock shared themes
vi.mock('shared/ui/themes/estimateStyle', () => ({
  estimateColors: {
    headerBg: '#f0f0f0',
    border: '#cccccc',
    primary: '#0000ff',
    green: '#008000',
    warning: '#ffa500',
    error: '#ff0000',
    greenLight: '#e6ffe6',
    greenDark: '#006400',
    warningLight: '#fff5e6',
    errorLight: '#ffe6e6',
    cardBg: '#ffffff'
  }
}));

describe('EstimatePurchasesTable', () => {
  const mockRegularMaterials = [
    {
      id: '1',
      sku: 'SKU-001',
      name: 'Material 1',
      category: 'Cat 1',
      unit: 'm2',
      quantity: 10,
      purchasedQuantity: 5,
      price: 100,
      total: 1000,
      avgPurchasePrice: 90,
      actualTotalPrice: 450,
      isExtraCharge: false
    }
  ];

  const mockExtraMaterials = [
    {
      id: '2',
      sku: 'SKU-EXTRA',
      name: 'Extra Material',
      category: 'Cat 2',
      unit: 'kg',
      quantity: 5,
      purchasedQuantity: 5,
      price: 200,
      total: 1000,
      avgPurchasePrice: 200,
      actualTotalPrice: 1000,
      isExtraCharge: true
    }
  ];

  const mockGetPurchaseStatus = vi.fn((row) => {
    if (row.purchasedQuantity >= row.quantity) return 'complete';
    if (row.purchasedQuantity > 0) return 'partial';
    return 'none';
  });

  const mockOnOpenAddDialog = vi.fn();

  it('renders regular materials', () => {
    render(
      <EstimatePurchasesTable
        regularMaterials={mockRegularMaterials}
        extraMaterials={[]}
        getPurchaseStatus={mockGetPurchaseStatus}
        onOpenAddDialog={mockOnOpenAddDialog}
        loading={false}
      />
    );

    expect(screen.getByText('Material 1')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Quantity
  });

  it('renders complex header', () => {
    render(
      <EstimatePurchasesTable
        regularMaterials={[]}
        extraMaterials={[]}
        getPurchaseStatus={mockGetPurchaseStatus}
        onOpenAddDialog={mockOnOpenAddDialog}
        loading={false}
      />
    );

    expect(screen.getByText('ПЛАН (смета)')).toBeInTheDocument();
    expect(screen.getByText('ФАКТ (закупки)')).toBeInTheDocument();
  });

  it('renders extra materials with separator', () => {
    render(
      <EstimatePurchasesTable
        regularMaterials={mockRegularMaterials}
        extraMaterials={mockExtraMaterials}
        getPurchaseStatus={mockGetPurchaseStatus}
        onOpenAddDialog={mockOnOpenAddDialog}
        loading={false}
      />
    );

    expect(screen.getByText('Material 1')).toBeInTheDocument();
    expect(screen.getByText('Extra Material')).toBeInTheDocument();
    expect(screen.getByText(/Отдельные чеки/)).toBeInTheDocument(); // Separator text
  });
});
