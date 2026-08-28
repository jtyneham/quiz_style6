import test from "node:test";
import assert from "node:assert/strict";
import { bindOutsideDismiss } from "../../js/core/ui.js";

function node(name, parent = null) {
  return { name, contains(target) { for (let cur = target; cur; cur = cur.parent) if (cur === this) return true; return false; }, parent };
}

test("outside dismiss ignores clicks inside the owner and opener", () => {
  let click;
  const root = { addEventListener(type, fn) { if (type === "click") click = fn; }, removeEventListener() {} };
  const owner = node("sheet");
  const inside = node("chip", owner);
  const opener = node("button");
  const outside = node("page");
  let dismissals = 0;
  bindOutsideDismiss(root, owner, () => { dismissals += 1; }, opener);
  click({ target: inside });
  click({ target: opener });
  assert.equal(dismissals, 0);
  click({ target: outside });
  assert.equal(dismissals, 1);
});

test("outside dismiss respects the original composed path after a clicked child is replaced", () => {
  let click;
  const root = { addEventListener(type, fn) { if (type === "click") click = fn; }, removeEventListener() {} };
  const owner = node("sheet");
  const clickedChip = node("chip", owner);
  const outside = node("page");
  let dismissals = 0;
  bindOutsideDismiss(root, owner, () => { dismissals += 1; });

  // Simulate the chip being re-rendered before the click reaches root.
  clickedChip.parent = null;
  click({ target: clickedChip, composedPath: () => [clickedChip, owner, root] });
  assert.equal(dismissals, 0);

  click({ target: outside, composedPath: () => [outside, root] });
  assert.equal(dismissals, 1);
});
