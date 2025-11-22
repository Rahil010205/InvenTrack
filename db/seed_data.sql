USE stockmaster;

-- ======================
-- USERS
-- ======================
INSERT INTO users (name, email, password_hash, role)
VALUES
('Admin User', 'admin@stockmaster.com', 'hashedpassword', 'admin'),
('Inventory Manager', 'manager@stockmaster.com', 'hashedpassword', 'manager'),
('Warehouse Staff', 'staff@stockmaster.com', 'hashedpassword', 'staff');

-- ======================
-- WAREHOUSES
-- ======================
INSERT INTO warehouses (name, location)
VALUES
('Main Warehouse', 'Bengaluru'),
('Secondary Warehouse', 'Mumbai');

-- ======================
-- CATEGORIES
-- ======================
INSERT INTO categories (name)
VALUES
('Raw Materials'),
('Electronics'),
('Furniture');

-- ======================
-- PRODUCTS
-- ======================
INSERT INTO products (name, sku, category_id, unit, reorder_level)
VALUES
('Steel Rod', 'STL-1001', 1, 'kg', 10),
('LED Panel', 'LED-2002', 2, 'pcs', 5),
('Office Chair', 'FUR-3003', 3, 'pcs', 2);

-- ======================
-- STOCK
-- ======================
INSERT INTO stock (product_id, warehouse_id, quantity)
VALUES
(1, 1, 100),
(2, 1, 50),
(3, 1, 20),
(1, 2, 40);

-- ======================
-- SAMPLE RECEIPT
-- ======================
INSERT INTO receipts (supplier_name, status, created_by)
VALUES ('ABC Metals Ltd', 'done', 1);

INSERT INTO receipt_items (receipt_id, product_id, warehouse_id, quantity)
VALUES (1, 1, 1, 50);

INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES (1, 1, +50, 'receipt', 1);

-- ======================
-- SAMPLE DELIVERY
-- ======================
INSERT INTO deliveries (customer_name, status, created_by)
VALUES ('XYZ Corp', 'done', 2);

INSERT INTO delivery_items (delivery_id, product_id, warehouse_id, quantity)
VALUES (1, 3, 1, 5);

INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES (3, 1, -5, 'delivery', 1);

-- ======================
-- SAMPLE INTERNAL TRANSFER
-- ======================
INSERT INTO internal_transfers (from_warehouse_id, to_warehouse_id, status, created_by)
VALUES (1, 2, 'done', 1);

INSERT INTO internal_transfer_items (transfer_id, product_id, quantity)
VALUES (1, 2, 10);

INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES 
(2, 1, -10, 'transfer', 1),
(2, 2, +10, 'transfer', 1);

-- ======================
-- SAMPLE STOCK ADJUSTMENT
-- ======================
INSERT INTO stock_adjustments (product_id, warehouse_id, previous_qty, new_qty, reason, created_by)
VALUES (1, 1, 150, 148, 'Damaged items', 1);

INSERT INTO stock_ledger (product_id, warehouse_id, quantity_change, source_type, source_id)
VALUES (1, 1, -2, 'adjustment', 1);
