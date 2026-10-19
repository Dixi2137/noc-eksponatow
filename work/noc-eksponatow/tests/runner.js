/* Tiny browser test runner. Open tests/index.html over HTTP; results land in the page, console and window.__results. */
(() => {
  'use strict';
  const tests = [];
  const fail = message => { throw new Error(message); };
  const assert = {
    ok(value, message = 'expected truthy') { if (!value) fail(message); },
    equal(actual, expected, message) { if (actual !== expected) fail(`${message || 'equal'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); },
    deepEqual(actual, expected, message) { const a = JSON.stringify(actual), b = JSON.stringify(expected); if (a !== b) fail(`${message || 'deepEqual'}: expected ${b}, got ${a}`); },
    close(actual, expected, tolerance = 1e-6, message) { if (Math.abs(actual - expected) > tolerance) fail(`${message || 'close'}: expected ${expected}±${tolerance}, got ${actual}`); }
  };
  function test(name, fn) { tests.push({ name, fn }); }
  function run() {
    const results = [], list = document.getElementById('results'), summary = document.getElementById('summary');
    for (const { name, fn } of tests) {
      const item = document.createElement('li'); item.textContent = name;
      try { fn(); results.push({ name, pass: true }); item.className = 'pass'; console.log('PASS:', name); }
      catch (error) { results.push({ name, pass: false, error: error.message }); item.className = 'fail'; const pre = document.createElement('pre'); pre.textContent = error.stack || error.message; item.append(pre); console.error('FAIL:', name, error); }
      list.append(item);
    }
    const passed = results.filter(r => r.pass).length;
    summary.textContent = `${passed} / ${results.length} testów przeszło`;
    summary.className = passed === results.length ? 'ok' : 'fail';
    document.title = `${passed}/${results.length} — testy Noc Eksponatów`;
    window.__results = { passed, total: results.length, results };
    return window.__results;
  }
  window.MuseumTests = { test, assert, run };
})();
