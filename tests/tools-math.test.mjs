import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

function makeInput(value = '', checked = false) {
  return {
    value: String(value),
    checked: Boolean(checked),
    min: '0',
    max: '50',
    style: {},
    dataset: {},
    hidden: false,
    textContent: '',
    innerHTML: '',
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    querySelector() { return null; },
    contains() { return false; },
    select() {},
    blur() {},
  };
}

function loadAstroTool(relPath, initialInputs = {}) {
  const fullPath = join(ROOT, relPath);
  const src = readFileSync(fullPath, 'utf8');
  const scriptMatch = src.match(/<script is:inline define:vars=\{\{\s*CLAY_BODIES:\s*clayBodies\s*\}\}>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, `Could not find inline script in ${relPath}`);

  const elements = new Map();
  const getEl = (id) => {
    if (!elements.has(id)) {
      elements.set(id, makeInput(initialInputs[id] ?? ''));
    }
    return elements.get(id);
  };

  const CLAY_BODIES = [
    { id: 'g-mix-6', group: 'Georgies', name: 'G-Mix 6', shrinkage: { '04': 5.36, '6': 10.92 } },
    { id: 'bmix-5', group: 'Laguna', name: 'B-Mix 5', shrinkage: { '5': 12.00 } },
  ];

  // Instrument the IIFE to expose internal functions on globalThis.__exports
  let code = scriptMatch[1];
  code = code.replace(
    /(\}\)\(\);\s*)$/,
    '\n  globalThis.__exports = { parseNum, fmt, calc: typeof calc !== "undefined" ? calc : undefined, recalc: typeof recalc !== "undefined" ? recalc : undefined, calcTargetCapacity: typeof calcTargetCapacity !== "undefined" ? calcTargetCapacity : undefined, calcThrownPiece: typeof calcThrownPiece !== "undefined" ? calcThrownPiece : undefined, setClayById: typeof setClayById !== "undefined" ? setClayById : undefined, setMode: typeof setMode !== "undefined" ? setMode : undefined };\n$1'
  );

  const sandbox = {
    CLAY_BODIES,
    localStorage: {
      store: new Map(),
      getItem(k) { return this.store.get(k) ?? null; },
      setItem(k, v) { this.store.set(k, String(v)); },
      removeItem(k) { this.store.delete(k); },
    },
    document: {
      getElementById: getEl,
      querySelectorAll() { return []; },
      addEventListener() {},
    },
    setTimeout() { return 1; },
    clearTimeout() {},
    Math,
    Number,
    String,
    Array,
    Object,
    JSON,
    Date,
    RegExp,
    parseFloat,
    parseInt,
    isNaN,
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  return { exports: sandbox.__exports, elements, getEl };
}

test('Bug 1 (Fluid Volume): calcTargetCapacity and calcThrownPiece interpolate floor radius at z=baseT and round-trip identically', () => {
  const tool = loadAstroTool('src/pages/tools/fluid-volume.astro', {
    cone: '6',
    capacity: '16',
    capacityUnitTop: 'floz',
    mouthD: '5.0',
    baseD: '3.0',
    wall: '0.25',
    baseT: '0.5',
  });
  tool.exports.setClayById('g-mix-6');

  // 1. Check calcThrownPiece on a tapered vessel:
  // Thrown: height = 4", mouthD = 8" (R_top = 4), baseD = 4" (R_base = 2), wall = 0.25", baseT = 0.5"
  tool.getEl('height').value = '4';
  tool.getEl('mouthD').value = '8';
  tool.getEl('baseD').value = '4';
  tool.getEl('wall').value = '0.25';
  tool.getEl('baseT').value = '0.5';

  const thrownRes = tool.exports.calcThrownPiece();
  assert.ok(thrownRes && !thrownRes.error, 'calcThrownPiece should succeed');

  // Slope m = (4 - 2) / 4 = 0.5
  // Radial wall = 0.25 * sqrt(1 + 0.5^2) = 0.25 * sqrt(1.25)
  // Outer radius at z = baseT (0.5): R_ext(0.5) = 2 + 0.5 * 0.5 = 2.25
  const m = (4 - 2) / 4;
  const wRadial = 0.25 * Math.sqrt(1 + m * m);
  const expectedIntMouthR = 4 - wRadial;
  const expectedIntFloorR = 2.25 - wRadial;
  const intH = 4 - 0.5;
  const expectedThrownVol = (Math.PI * intH / 3) * (
    expectedIntMouthR ** 2 + expectedIntMouthR * expectedIntFloorR + expectedIntFloorR ** 2
  );

  assert.ok(
    Math.abs(thrownRes.thrownIntVolumeIn3 - expectedThrownVol) < 1e-6,
    `Expected thrown interior volume ${expectedThrownVol.toFixed(4)} in³, got ${thrownRes.thrownIntVolumeIn3.toFixed(4)} in³`
  );

  // 2. Round-trip invariance: target capacity -> thrown dims -> calcThrownPiece -> same fired capacity
  tool.getEl('capacity').value = '14';
  tool.getEl('capacityUnitTop').value = 'floz';
  tool.getEl('mouthD').value = '4.5';
  tool.getEl('baseD').value = '2.75';
  tool.getEl('wall').value = '0.25';
  tool.getEl('baseT').value = '0.375';

  const targetRes = tool.exports.calcTargetCapacity();
  assert.ok(targetRes && !targetRes.error, 'calcTargetCapacity should succeed');

  tool.getEl('height').value = String(targetRes.thrownExtHeight);
  tool.getEl('mouthD').value = String(targetRes.thrownMouthD);
  tool.getEl('baseD').value = String(targetRes.thrownBaseD);
  tool.getEl('wall').value = String(targetRes.thrownWall);
  tool.getEl('baseT').value = String(targetRes.thrownBaseT);

  const verifyRes = tool.exports.calcThrownPiece();
  assert.ok(
    Math.abs(verifyRes.capIn3 - targetRes.capIn3) < 1e-6,
    `Round-trip capacity mismatch: target ${targetRes.capIn3} in³ vs thrown ${verifyRes.capIn3} in³`
  );
});

test('Bug 1 (Throwing Weight): calcFrustum interpolates interior floor radius at z=baseT and uses perpendicular wall thickness', () => {
  const tool = loadAstroTool('src/pages/tools/throwing-weight.astro', {
    form: 'bowl',
    cone: '6',
    height: '4',
    mouthD: '8',
    baseD: '3.5',
    wall: '0.25',
    baseT: '0.375',
    throwWaste: '0',
    trimWaste: '0',
  });
  tool.exports.setClayById('g-mix-6');

  const res = tool.exports.calc();
  assert.ok(res && !res.error);

  const H = 4, Rtop = 4, Rbase = 1.75, wall = 0.25, baseT = 0.375;
  const m = (Rtop - Rbase) / H;
  const wRadial = wall * Math.sqrt(1 + m * m);
  const intTopR = Rtop - wRadial;
  const intFloorR = (Rbase + m * baseT) - wRadial;
  const intH = H - baseT;

  const extVol = (Math.PI * H / 3) * (Rtop ** 2 + Rtop * Rbase + Rbase ** 2);
  const intVol = (Math.PI * intH / 3) * (intTopR ** 2 + intTopR * intFloorR + intFloorR ** 2);
  const tf = 1 / (1 - 0.1092);
  const expectedWetIn3 = (extVol - intVol) * (tf ** 3);

  assert.ok(
    Math.abs(res.clayVolWetIn3 - expectedWetIn3) < 1e-6,
    `Expected wet clay volume ${expectedWetIn3.toFixed(4)} in³, got ${res.clayVolWetIn3.toFixed(4)} in³`
  );
});

test('Bug 2 (parseNum): handles trailing unit quotes and rejects half-typed fractions without partial parseFloat truncation', () => {
  for (const relPath of [
    'src/pages/tools/shrinkage.astro',
    'src/pages/tools/fluid-volume.astro',
    'src/pages/tools/throwing-weight.astro',
  ]) {
    const { exports } = loadAstroTool(relPath);
    const { parseNum } = exports;

    assert.equal(parseNum('1/8"'), 0.125, `${relPath}: 1/8" should be 0.125, not 1`);
    assert.equal(parseNum('1 1/2"'), 1.5, `${relPath}: 1 1/2" should be 1.5, not 1`);
    assert.equal(parseNum('3/4 in'), 0.75, `${relPath}: 3/4 in should be 0.75`);
    assert.equal(parseNum('11.5%'), 11.5, `${relPath}: 11.5% should be 11.5`);
    assert.equal(parseNum('1 1/'), null, `${relPath}: incomplete fraction '1 1/' must return null`);
    assert.equal(parseNum('1/0'), null, `${relPath}: division by zero '1/0' must return null`);
    assert.equal(parseNum('12abc'), null, `${relPath}: trailing garbage '12abc' must return null`);
  }
});

test('Bug 3 (Lid Waste & Thrown Dimensions): throwing-weight applies throw/trim waste to lidBodyG and computes thrownLidD/thrownLidT', () => {
  const tool = loadAstroTool('src/pages/tools/throwing-weight.astro', {
    form: 'jar',
    cone: '6',
    height: '6',
    jarD: '4',
    wall: '0.25',
    baseT: '0.375',
    throwWaste: '10',
    trimWaste: '15',
    lidD: '4',
    lidThick: '0.25',
    knobWeight: '20',
  });
  tool.exports.setClayById('g-mix-6');
  tool.getEl('includeLid').checked = true;

  const res = tool.exports.calc();
  assert.ok(res && !res.error);

  const tf = 1 / (1 - 0.1092);
  assert.ok(res.thrownLidD && Math.abs(res.thrownLidD - 4 * tf) < 1e-6, 'Should expose thrownLidD = lidD * tf');
  assert.ok(res.thrownLidT && Math.abs(res.thrownLidT - 0.25 * tf) < 1e-6, 'Should expose thrownLidT = lidT * tf');

  // Lid raw wet mass = pi * 2^2 * 0.25 * tf^3 * 16.387064 * 1.85
  const lidRawG = Math.PI * 4 * 0.25 * (tf ** 3) * 16.387064 * 1.85;
  const lidWithWasteG = lidRawG * 1.10 * 1.15;
  const expectedTotalG = res.bodyWeightG + lidWithWasteG + 20;

  assert.ok(
    Math.abs(res.totalWeightG - expectedTotalG) < 1e-4,
    `Expected totalWeightG ${expectedTotalG.toFixed(2)}g (including lid throw/trim waste), got ${res.totalWeightG.toFixed(2)}g`
  );
});

test('Bug 4 (Shrinkage bounds): shrinkage.astro rejects negative or zero dimensions and negative shrinkage', () => {
  const tool = loadAstroTool('src/pages/tools/shrinkage.astro', {
    cone: '6',
    w: '-5',
    h: '4',
    s: '12',
  });

  assert.equal(tool.exports.calc(), null, 'Negative width must be rejected');

  tool.getEl('w').value = '0';
  assert.equal(tool.exports.calc(), null, 'Zero width must be rejected');

  tool.getEl('w').value = '6';
  tool.getEl('s').value = '-5';
  assert.equal(tool.exports.calc(), null, 'Negative shrinkage must be rejected');
});

test('Two-frustum vase (calcTwoFrustum): interpolates floor at z=baseT and applies lower/upper slope radial wall thickness', () => {
  const tool = loadAstroTool('src/pages/tools/throwing-weight.astro', {
    form: 'vase',
    cone: '6',
    height: '10',
    mouthD: '3.5',
    chamberD: '7',
    chamberH: '6',
    baseD: '4',
    wall: '0.25',
    baseT: '0.5',
    throwWaste: '0',
    trimWaste: '0',
  });
  tool.exports.setClayById('g-mix-6');

  const res = tool.exports.calc();
  assert.ok(res && !res.error);

  const mouthR = 1.75, chamberR = 3.5, footR = 2.0, chamberH = 6, upperH = 4, wall = 0.25, baseT = 0.5;
  const lowerSlope = (chamberR - footR) / chamberH;
  const upperSlope = (mouthR - chamberR) / upperH;
  const wLower = wall * Math.sqrt(1 + lowerSlope ** 2);
  const wUpper = wall * Math.sqrt(1 + upperSlope ** 2);

  const frustum = (h, R, r) => (Math.PI * h / 3) * (R ** 2 + R * r + r ** 2);
  const extVol = frustum(chamberH, chamberR, footR) + frustum(upperH, chamberR, mouthR);
  const outerAtStart = footR + (chamberR - footR) * (baseT / chamberH);
  const intVol = frustum(chamberH - baseT, chamberR - wLower, outerAtStart - wLower) +
                 frustum(upperH, chamberR - wUpper, mouthR - wUpper);
  const tf = 1 / (1 - 0.1092);
  const expectedWetIn3 = (extVol - intVol) * (tf ** 3);

  assert.ok(
    Math.abs(res.clayVolWetIn3 - expectedWetIn3) < 1e-6,
    `Expected two-frustum wet clay volume ${expectedWetIn3.toFixed(4)} in³, got ${res.clayVolWetIn3.toFixed(4)} in³`
  );
});

