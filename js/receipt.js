/**
 * js/receipt.js
 * -------------
 * Verify ONE CAIRN decision receipt, in a browser or in Node, with no CAIRN code.
 *
 * A receipt is a single record from a decision ledger. What this file can
 * establish about one, and what it cannot, is the whole content of receipt.html,
 * so the two are kept honest by `scripts/check-receipt.mjs` rather than by care:
 *
 *   1. CONTENTS  — the record's hash is SHA-256(prevHash ‖ canonical_json(body)),
 *                  where body is the record minus `hash` and `prevHash`. This is
 *                  the definition in CAIRN's src/trust/ledgerStore.js, restated.
 *   2. POSITION  — every record from the first to this one re-derives, and each
 *                  prevHash equals the hash before it. So nothing BEFORE the
 *                  receipt was altered either — unless it was all rewritten.
 *   3. FILE      — the ledger file's SHA-256 equals the figure manifest.json
 *                  gives for it.
 *
 * What it CANNOT establish, and receipt.html says so beside each:
 *
 *   - ORIGIN. A chain proves internal consistency. Somebody holding the file can
 *     alter record N and recompute every hash from N forward, and every check
 *     above passes. Only a signature over the manifest (with a key you trust) or
 *     an external timestamp anchor defeats that. `rewriteFrom()` below does it,
 *     and the check script asserts the rewritten chain VERIFIES — so the page
 *     cannot drift back into claiming otherwise.
 *   - That the action was right. A receipt records a decision; it does not grade
 *     one.
 *
 * Deliberately independent of js/chain-verify.js, which is a DOM-bound demo on
 * the homepage. The canonicalisation is ten lines and is restated rather than
 * shared, so that this file can be read, and run, entirely on its own.
 */
(function (root) {
    'use strict';

    var GENESIS = '0000000000000000000000000000000000000000000000000000000000000000';

    /** Recursively sorted keys. JSON.stringify follows insertion order, which would make two identical records hash differently. */
    function canon(v) {
        if (v === null || typeof v !== 'object') return JSON.stringify(v);
        if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
        return (
            '{' +
            Object.keys(v)
                .sort()
                .map(function (k) {
                    return JSON.stringify(k) + ':' + canon(v[k]);
                })
                .join(',') +
            '}'
        );
    }

    function subtle() {
        var c = (typeof globalThis !== 'undefined' && globalThis.crypto) || root.crypto;
        if (!c || !c.subtle) throw new Error('WebCrypto is not available here, so nothing can be verified.');
        return c.subtle;
    }

    async function sha256Hex(input) {
        var bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
        var digest = await subtle().digest('SHA-256', bytes);
        return Array.prototype.map
            .call(new Uint8Array(digest), function (b) {
                return b.toString(16).padStart(2, '0');
            })
            .join('');
    }

    function bodyOf(record) {
        var body = {};
        Object.keys(record).forEach(function (k) {
            if (k !== 'hash' && k !== 'prevHash') body[k] = record[k];
        });
        return body;
    }

    async function hashOf(record) {
        return sha256Hex(record.prevHash + canon(bodyOf(record)));
    }

    /** Split a ledger.jsonl into records. Blank lines are not records. */
    function parseLedger(text) {
        return text
            .split(/\r?\n/)
            .filter(function (l) {
                return l.trim() !== '';
            })
            .map(function (l) {
                return JSON.parse(l);
            });
    }

    /**
     * Verify the receipt with id `id` against the ledger it came from.
     * Returns every check with its result — never a bare boolean, because "which
     * check failed" is the sentence a reader needs.
     */
    async function verifyReceipt(records, id) {
        var index = records.findIndex(function (r) {
            return r.id === id;
        });
        if (index === -1) {
            return { found: false, index: -1, contents: false, position: false, firstBreak: null };
        }
        var contents = (await hashOf(records[index])) === records[index].hash;

        var firstBreak = null;
        var prev = GENESIS;
        for (var i = 0; i <= index; i++) {
            var r = records[i];
            if ((await hashOf(r)) !== r.hash) {
                firstBreak = { index: i, reason: 'its hash does not match its contents' };
                break;
            }
            if (r.prevHash !== prev) {
                firstBreak = { index: i, reason: 'it does not link to the record before it' };
                break;
            }
            prev = r.hash;
        }
        return { found: true, index: index, contents: contents, position: firstBreak === null, firstBreak: firstBreak };
    }

    /**
     * The attack a chain alone cannot see: alter record `index` and recompute
     * every hash from there forward. Exists so the check script can prove the
     * limit the page states, rather than the page asserting it.
     */
    async function rewriteFrom(records, index, mutate) {
        var out = JSON.parse(JSON.stringify(records));
        mutate(out[index]);
        for (var i = index; i < out.length; i++) {
            out[i].prevHash = i === 0 ? GENESIS : out[i - 1].hash;
            out[i].hash = await hashOf(out[i]);
        }
        return out;
    }

    /**
     * Every gate decision in audit.jsonl, and whether it has a receipt.
     *
     * The reason this check exists is in CAIRN's src/trust/governanceGate.js: if
     * the ledger write fails, an ALLOW still proceeds — deliberately, so a broken
     * database does not become a denial of service on the whole product — and
     * the audit event is written with `decisionId: null`. The ledger cannot tell
     * you about a record it never received. The audit log can, and only if
     * somebody compares the two, which is what this does.
     *
     * It is scoped to the bundle. It says nothing about a decision that reached
     * neither file.
     */
    function crossCheckAudit(auditRecords, ledgerRecords) {
        var ids = {};
        ledgerRecords.forEach(function (r) {
            ids[r.id] = true;
        });
        var gate = auditRecords.filter(function (e) {
            return e.decision === 'GOVERNANCE_ALLOW' || e.decision === 'GOVERNANCE_DENY';
        });
        var missing = gate.filter(function (e) {
            var id = e.metadata && e.metadata.decisionId;
            return !id || !ids[id];
        });
        return { gateEvents: gate.length, withReceipt: gate.length - missing.length, withoutReceipt: missing };
    }

    var api = {
        GENESIS: GENESIS,
        canon: canon,
        sha256Hex: sha256Hex,
        hashOf: hashOf,
        parseLedger: parseLedger,
        verifyReceipt: verifyReceipt,
        rewriteFrom: rewriteFrom,
        crossCheckAudit: crossCheckAudit,
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CairnReceipt = api;
})(typeof window !== 'undefined' ? window : globalThis);
