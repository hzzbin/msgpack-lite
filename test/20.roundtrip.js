#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpack = require("../index");
var TITLE = __filename.replace(/^.*\//, "") + ":";

var STRING_ASCII = "a";
var STRING_GREEK = "α";
var STRING_ASIAN = "亜";

// 128K characters
for (var i = 0; i < 17; i++) {
  STRING_ASCII = STRING_ASCII + STRING_ASCII;
  STRING_GREEK = STRING_GREEK + STRING_GREEK;
  STRING_ASIAN = STRING_ASIAN + STRING_ASIAN;
}

function pattern(min, max, offset) {
  var array = [];
  var check = {};
  var val = min - 1;
  while (val <= max) {
    if (min <= val && !check[val]) array.push(val);
    check[val++] = 1;
    if (val <= max && !check[val]) array.push(val);
    check[val++] = 1;
    if (val <= max && !check[val]) array.push(val);
    check[val--] = 1;
    val = val ? val * 2 - 1 : 1;
  }
  return array;
}

describe(TITLE, function() {

  it("null", function() {
    [null, undefined].forEach(function(value) {
      // console.warn(value);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });


  it("boolean", function() {
    [true, false].forEach(function(value) {
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("positive int (small)", function() {
    pattern(0, 0x40000000).forEach(function(value) {
      value = value | 0; // integer
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("positive int (large)", function() {
    pattern(0x40000000, 0xFFFFFFFF).forEach(function(value) {
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("negative int (small)", function() {
    pattern(0, 0x40000000).forEach(function(value) {
      value = -value | 0; // integer
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("negative int (large)", function() {
    pattern(0x40000000, 0xFFFFFFFF).forEach(function(value) {
      value = -value;
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("float", function() {
    [1.1, 10.01, 100.001, 1000.0001, 10000.00001, 100000.000001, 1000000.0000001].forEach(function(value) {
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("string (ASCII)", function() {
    pattern(0, 65537).forEach(function(length) {
      var value = STRING_ASCII.substr(0, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("string (GREEK)", function() {
    pattern(0, 65537).forEach(function(length) {
      var value = STRING_GREEK.substr(0, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("string (ASIAN)", function() {
    pattern(0, 65537).forEach(function(length) {
      var value = STRING_ASIAN.substr(0, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded, value);
    });
  });

  it("array (small)", function() {
    pattern(0, 257).forEach(function(length) {
      var value = new Array(length);
      for (var i = 0; i < length; i++) {
        value[i] = String.fromCharCode(i);
      }
      assert.equal(value.length, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded.length, length);
      assert.equal(decoded[0], value[0]);
      assert.equal(decoded[length - 1], value[length - 1]);
    });
  });

  it("array (large)", function() {
    pattern(0, 65537).forEach(function(length) {
      var value = new Array(length);
      assert.equal(value.length, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded.length, length);
      assert.equal(decoded[0], value[0]);
      assert.equal(decoded[length - 1], value[length - 1]);
    });
  });

  it("map (small)", function() {
    pattern(0, 257).forEach(function(length) {
      var value = {};
      for (var i = 0; i < length; i++) {
        var key = String.fromCharCode(i);
        value[key] = i;
      }
      assert.equal(Object.keys(value).length, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(Object.keys(decoded).length, length);
      assert.equal(decoded[0], value[0]);
      assert.equal(decoded[length - 1], value[length - 1]);
    });
  });

  it("map (large)", function() {
    pattern(65536, 65537).forEach(function(length) {
      var value = {};
      for (var i = 0; i < length; i++) {
        value[i] = null;
      }
      assert.equal(Object.keys(value).length, length);
      var encoded = msgpack.encode(value);
      var decoded = msgpack.decode(encoded);
      assert.equal(Object.keys(decoded).length, length);
      assert.equal(decoded[0], value[0]);
      assert.equal(decoded[length - 1], value[length - 1]);
    });
  });
});