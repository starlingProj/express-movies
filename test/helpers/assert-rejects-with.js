const assert = require("node:assert/strict");

/**
 * Asserts that an async function rejects with a MainError-like object.
 *
 * @param {Function} fn - Function returning a promise.
 * @param {Object} expected
 * @param {string} expected.code
 * @param {number} [expected.statusCode]
 * @returns {Promise<void>}
 */
module.exports = async function assertRejectsWith(fn, expected) {
  await assert.rejects(fn, (err) => {
    assert.equal(err?.code, expected.code);
    if (expected.statusCode !== undefined) {
      assert.equal(err?.statusCode, expected.statusCode);
    }
    return true;
  });
};


