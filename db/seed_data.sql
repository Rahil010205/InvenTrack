USE stockmaster;

-- ============================================================
-- TENANTS (Companies)
-- ============================================================

INSERT INTO tenants (name)
VALUES 
('Alpha Industries'),
('Beta Manufacturing');

-- ============================================================
-- USERS (each belongs to a tenant)
-- ============================================================

INSERT INTO users (tenant_id, name, email, password_hash, role)
VALUES
-- Tenant 1 (Alpha)
(1, 'Alpha Admin', 'admin@alpha.com', 'hashed123', 'admin'),
(1, 'Alpha Manager', 'manager@alpha.com', 'hashed123', 'manager'),
(1, 'Alpha Staff', 'staff@alpha.com', 'hashed123', 'staff'),

-- Tenant 2 (Beta)
(2, 'Beta Admin', 'admin@beta.com', 'hashed123', 'admin'),
(2, 'Beta Manager', 'manager@beta.com', 'hashed123', 'manager'),
(2, 'Beta Staff', 'staff@beta.com', 'hashed123', 'staff');

-- ============================================================
-- WAREHOUSES (separate per tenant)
-- ============================================================

INSERT INTO warehouses (tenant_id, name, location)
VALUES
-- Tenant 1
(1, 'Alpha Main Warehouse', 'Bengaluru'),
(1, 'Alpha Secondary Warehouse', 'Chennai'),

-- Tenant 2
(2, 'Beta Central Warehouse', 'Mumbai'),
(2, 'Beta East Warehouse', 'Pune');

-- ============================================================
-- CATEGORIES (separate per tenant)
-- ============================================================

INSERT INTO categories (tenant_id, name)
VALUES
-- Tenant 1
(1, 'Raw Materials'),
(1, 'Electronics'),
(1, 'Furniture'),

-- Tenant 2
(2, 'Chemicals'),
(2, 'Machinery'),
(2, 'Packaging');

-- ============================================================
-- PRODUCTS (each tied to a tenant)
-- ============================================================

INSERT INTO products (tenant_id, name, sku, category_id, unit, reorder_level)
VALUES
-- Tenant 1 (Alpha)
(1, 'Steel Rod', 'ALPHA-STL-001', 1, 'kg', 10),
(1, 'LED Panel', 'ALPHA-LED-002', 2, 'pcs', 5),
(1, 'Office Chair', 'ALPHA-CHR-003', 3, 'pcs', 3),

-- Tenant 2 (Beta)
(2, 'Acid Bottle', 'BETA-ACD-001', 4, 'ltr', 20),
(2, 'Hydraulic Pump', 'BETA-HYD-002', 5, 'pcs', 2),
(2, 'Cardboard Box', 'BETA-PKG-003', 6, 'pcs', 50);

-- ============================================================
-- STOCK (Quantity per warehouse per tenant)
-- ============================================================

INSERT INTO stock (tenant_id, product_id, warehouse_id, quantity)
VALUES
-- Tenant 1
(1, 1, 1, 100),  -- Steel Rod @ Alpha Main
(1, 2, 1, 50),   -- LED Panel
(1, 3, 1, 20),   -- Office Chair
(1, 1, 2, 40),   -- Steel Rod @ Alpha Secondary

-- Tenant 2
(2, 4, 3, 200),  -- Acid Bottle @ Beta Central
(2, 5, 3, 15),   -- Hydraulic Pump
(2, 6, 4, 500);  -- Boxes @ Beta East

-- ============================================================
-- RECEIPTS (Inbound Stock)
-- ============================================================

INSERT INTO receipts (tenant_id, supplier_name, status, created_by)
VALUES
-- Tenant 1
(1, 'Alpha Metals Ltd', 'done', 1),

-- Tenant 2
(2, 'Beta Chemicals Supplier', 'done', 4);

-- Receipt Items

INSERT INTO receipt_items (tenant_id, receipt_id, product_id, warehouse_id, quantity)
VALUES
-- Tenant 1
(1, 1, 1, 1, 50),  -- Steel Rod

-- Tenant 2
(2, 2, 4, 3, 100);  -- Acid Bottle

-- Stock Ledger for receipts

INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES
(1, 1, 1, +50, 'receipt', 1),
(2, 4, 3, +100, 'receipt', 2);

-- ============================================================
-- DELIVERIES (Outbound Stock)
-- ============================================================

INSERT INTO deliveries (tenant_id, customer_name, status, created_by)
VALUES
-- Tenant 1
(1, 'Alpha Client Pvt Ltd', 'done', 2),

-- Tenant 2
(2, 'Beta Retailer', 'done', 5);

INSERT INTO delivery_items (tenant_id, delivery_id, product_id, warehouse_id, quantity)
VALUES
-- Tenant 1
(1, 1, 3, 1, 5),

-- Tenant 2
(2, 2, 6, 4, 40);

INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES
(1, 3, 1, -5, 'delivery', 1),
(2, 6, 4, -40, 'delivery', 2);

-- ============================================================
-- INTERNAL TRANSFERS
-- ============================================================

INSERT INTO internal_transfers (tenant_id, from_warehouse_id, to_warehouse_id, status, created_by)
VALUES
-- Tenant 1
(1, 1, 2, 'done', 1),

-- Tenant 2
(2, 3, 4, 'done', 4);

INSERT INTO internal_transfer_items (tenant_id, transfer_id, product_id, quantity)
VALUES
-- Tenant 1: transfer LED Panels
(1, 1, 2, 10),

-- Tenant 2: transfer Boxes
(2, 2, 6, 50);

INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES
-- Tenant 1
(1, 2, 1, -10, 'transfer', 1),
(1, 2, 2, +10, 'transfer', 1),

-- Tenant 2
(2, 6, 3, -50, 'transfer', 2),
(2, 6, 4, +50, 'transfer', 2);

-- ============================================================
-- STOCK ADJUSTMENTS
-- ============================================================

INSERT INTO stock_adjustments (tenant_id, product_id, warehouse_id, previous_qty, new_qty, reason, created_by)
VALUES
-- Tenant 1
(1, 1, 1, 150, 148, 'Damaged items', 1),

-- Tenant 2
(2, 4, 3, 300, 295, 'Evaporation loss', 4);

INSERT INTO stock_ledger (tenant_id, product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES
(1, 1, 1, -2, 'adjustment', 1),
(2, 4, 3, -5, 'adjustment', 2);
