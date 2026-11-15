// These tests record existing behavior, including legacy edge cases.
// They are a baseline for understanding the app, not a claim that every
// characterized behavior is desirable.
var test = require('node:test');
var assert = require('node:assert/strict');

var coupons = require('../lib/coupons');
var inventory = require('../lib/inventory');
var ledger = require('../lib/ledger');
var orders = require('../lib/orders');
var pricing = require('../lib/pricing');
var tax = require('../lib/tax');

test('coupon codes are trimmed and uppercased; SAVE10 is capped at 150', function () {
  assert.equal(coupons.normalizeCode(' save10 '), 'SAVE10');
  assert.equal(coupons.calculateDiscount(2000, 'save10'), 150);
  assert.deepEqual(coupons.validate('NOTREAL', 2000), {
    valid: false,
    error: 'Invalid coupon code: NOTREAL'
  });
  assert.equal(coupons.validate('DIWALI20', 2000).valid, false);
});

test('HSN 1006 uses 5 percent GST and an unknown HSN uses the configured fallback', function () {
  assert.equal(tax.getRateForItem({ hsn: '1006' }), 0.05);
  assert.equal(tax.getRateForItem({ hsn: '9999' }), 0.18);
  assert.deepEqual(tax.splitCgstSgst(4.75), { cgst: 2.38, sgst: 2.37 });
});

test('pricing applies WELCOME discount before item GST and splits tax', function () {
  var result = pricing.computeTotals([
    { id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ], 'WELCOME');

  assert.equal(result.subtotal, 100);
  assert.equal(result.discount, 5);
  assert.equal(result.taxable, 95);
  assert.equal(result.tax, 4.75);
  assert.equal(result.total, 99.75);
  assert.equal(result.cgst, 2.38);
  assert.equal(result.sgst, 2.37);
});

test('sellable stock subtracts reservations and permits selling the exact remainder', function () {
  var products = [
    { id: 1, name: 'Rice', stock: 10, reserved: 2 },
    { id: 2, name: 'Ghee', stock: 1, reserved: 0 },
    { id: 3, name: 'Chilli powder', stock: 4, reserved: 3 }
  ];

  assert.equal(inventory.getSellableStock(products[0]), 8);
  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 7 }]), { ok: true });
  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 8 }]), { ok: true });
  assert.deepEqual(inventory.check(products, [{ id: 2, qty: 1 }]), { ok: true });
  assert.deepEqual(inventory.check(products, [{ id: 3, qty: 1 }]), { ok: true });
  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 9 }]), {
    ok: false,
    msg: 'Rice is out of stock (8 sellable available)'
  });
});

test('khata order adds to customer balance and cancellation reverses the debit', function () {
  var db = {
    nextOrderId: 1001,
    orders: [],
    products: [{ id: 1, name: 'Rice', stock: 10, reserved: 0 }],
    customers: [{ id: 7, name: 'Asha', creditLimit: 500, openingBalance: 20, totalBilled: 0, totalSettled: 0 }]
  };

  assert.equal(ledger.chargeOrderToKhata(db, 7, 100).ok, true);
  assert.equal(ledger.listCustomers(db)[0].balance, 120);
  inventory.reserve(db.products, [{ id: 1, qty: 2 }]);

  var order = orders.add(db, {
    customer: 'Asha', customerId: 7, paymentMode: 'khata', status: 'completed',
    items: [{ id: 1, name: 'Rice', qty: 2 }], subtotal: 100, discount: 0, tax: 0, total: 100,
    date: '15/11/2026'
  });
  var result = orders.cancel(db, order.id, 'test cancellation');

  assert.equal(result.ok, true);
  assert.equal(db.products[0].stock, 10);
  assert.equal(db.customers[0].totalBilled, 0);
  assert.equal(ledger.listCustomers(db)[0].balance, 20);
});

test('cancelling an order restores stock for stored line items using id', function () {
  var db = {
    nextOrderId: 1002,
    orders: [{
      id: 1001, date: '15/11/2026', customer: 'Walk-in', paymentMode: 'cash', status: 'completed',
      items: [{ id: 1, name: 'Rice', qty: 2 }], total: 100
    }],
    products: [{ id: 1, name: 'Rice', stock: 8, reserved: 0 }],
    customers: []
  };

  assert.equal(orders.cancel(db, 1001, 'test').ok, true);
  assert.equal(db.products[0].stock, 10);
  assert.equal(db.orders[0].status, 'cancelled');
});
