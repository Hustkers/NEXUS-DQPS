// In-memory persistent overrides for SKU inventory and campaign spend across sessions
export interface MatrixOverrides {
  inventory: Record<string, number>;
  budget: Record<string, number>;
}

declare global {
  // eslint-disable-next-line no-var
  var __nexus_matrix_overrides: MatrixOverrides | undefined;
}

if (!globalThis.__nexus_matrix_overrides) {
  globalThis.__nexus_matrix_overrides = {
    inventory: {},
    budget: {},
  };
}

export const matrixOverrides: MatrixOverrides = globalThis.__nexus_matrix_overrides;

export function setInventoryOverride(sku: string, quantity: number) {
  matrixOverrides.inventory[sku] = quantity;
  matrixOverrides.inventory[sku.toUpperCase()] = quantity;
  matrixOverrides.inventory[sku.toLowerCase()] = quantity;
}

export function setBudgetOverride(target: string, budget: number) {
  matrixOverrides.budget[target] = budget;
  matrixOverrides.budget[target.toUpperCase()] = budget;
  matrixOverrides.budget[target.toLowerCase()] = budget;
}
