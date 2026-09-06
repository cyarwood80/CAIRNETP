# Verifying this evidence bundle

Generated 2026-09-06T16:30:42.318Z by CAIRN Trust Fabric.
Window: beginning-of-record → now
Reason: Scheduled compliance export

Contents: 25 decision record(s), 0 execution span(s), 20 audit event(s).

## Why you should not have to trust CAIRN

Every check below uses only Node's built-in crypto. None of them requires CAIRN
to be installed, running, or honest.

## 0. What time says, and who says it

**Every timestamp in this bundle is host-asserted.**

They come from `new Date()` on the machine CAIRN ran on, and that machine's clock
is under its operator's control. The hash chain proves the ORDER records were
written in. It proves nothing about when.

No checkpoint in this bundle carries external attestation. If wall-clock time
matters to your assessment, that is the gap, and it is stated here rather than
left for you to discover.

## 1. File integrity

Each file's SHA-256 is recorded in `manifest.json`. Recompute and compare:

```bash
sha256sum ledger.jsonl spans.jsonl audit.jsonl integrity.json coverage.json
```

Any mismatch means the bundle was altered after export.

## 2. Bundle authenticity

**This bundle is UNSIGNED.** File hashes still detect accidental corruption,
but provide no proof of origin — anyone could have produced this. Re-export with a
signing key if provenance matters.

## 3. Decision-chain integrity

Each record in `ledger.jsonl` carries `prevHash` and `hash`, where

 hash = SHA256(prevHash ‖ canonical_json(body))

**`body` is the record with `hash` and `prevHash` removed** — those two are the
chain links and are not part of what was hashed. Every remaining key is:

 id · timestamp · traceId · actor · decision · outcome · reasoning
 policyIds · evidenceIds · payload · trustScore · confidence

`canonical_json` sorts object keys recursively at every level, so the byte string
does not depend on the order the fields happen to appear in. Altering, inserting or
removing any record breaks every record after it. The first record's `prevHash` is
64 zeros (genesis).

Reproduce it yourself — this needs nothing but Node:

```bash
node -e "
const c=require('crypto'),f=require('fs');
const canon=v=>v===null||typeof v!=='object'?JSON.stringify(v)
  :Array.isArray(v)?'['+v.map(canon).join(',')+']'
  :'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}';
let prev='0'.repeat(64),bad=0,n=0;
for(const line of f.readFileSync('ledger.jsonl','utf8').split('\n').filter(Boolean)){
  const r=JSON.parse(line),{hash,prevHash,...body}=r;n++;
  if(c.createHash('sha256').update(prevHash+canon(body)).digest('hex')!==hash){bad++;console.log('ALTERED:',r.id);}
  if(prevHash!==prev&&n>1)console.log('OUT OF ORDER:',r.id);
  prev=hash;
}
console.log(bad?bad+' of '+n+' record(s) FAILED':'all '+n+' record(s) verified');"
```

**Chain status at export: VALID**

The decision ledger chain verified intact at export time. Each record cryptographically commits to its predecessor, so any alteration or deletion of an earlier record would have been detected.

## 4. What this bundle was awake for

A hash chain proves that the records present were not altered. It cannot prove that a record was ever written. The largest reason one would not have been is that CAIRN was not running — so this bundle states, separately, which intervals it was present for.

`coverage.json` carries the detail. Each gap is also a `LEDGER_GAP` record inside `ledger.jsonl`, chained like every other record, so the statement below is covered by the check you just performed in section 3 and cannot be edited without breaking it.

**No coverage gap is recorded in this window.**

Read that precisely: no interval was *recorded* in which CAIRN was not running. It is
evidence of continuous coverage only from the first `LEDGER_COVERAGE_OPEN` record in
`ledger.jsonl` onward — anything before that record predates coverage tracking on this
installation and is of unknown coverage.

## 5. Who each record is attributed to

`attribution.json` states, per record, what its `actor` was grounded in. There are
two eras, and the boundary is **CAIRN 2.6.0**:

| Era | `actor` means | Records here |
| --- | --- | --- |
| `principal` | the acting principal, with the basis the record states | 25 |
| `os-login` | the operating-system user who was logged in — a login session, not an identity CAIRN established anything about | 0 |
| `unstamped` | written before CAIRN stamped its own build; pre-boundary, exact build unknown | 0 |

Every record in this window names an acting principal.

**Not every `actor` is a person.** CAIRN's own pillars, its subsystems and its
placeholders are written into the same column, and this bundle says which is which:

| Actor names | Records here |
| --- | --- |
| `person` | 20 |
| `pillar` | 5 |

1 distinct person/people across 20 record(s). Every one carries the actor stamp, so records keyed differently for the same human are reconciled by username rather than counted twice.

A record written after this was fixed carries its own answer in
`payload.actorSubject`, inside the hashed body you verified in section 3. An
older record has no such field and its kind is **inferred** — from the writer
where another chain-protected field identifies one, and otherwise from the shape
of the string. `subjectBasis` in `attribution.json` tells you which happened for
each record, and `unknown` means this reader declined to guess rather than that
the record is suspect.

**The older records were not rewritten, and that is deliberate.** `actor` is inside
the hashed body, so restating it would break every hash after it and would be
indistinguishable from tampering. The field's *meaning* is versioned instead; the
records themselves are untouched and the chain over them is intact. You verified
that yourself in section 3.

**What `authenticated` does not mean.** No record in any CAIRN bundle is authenticated in the SSO sense. A principal is established from the operating system and from operator-declared vault files, and the record states which. `authenticated` here means every identity attribute the autonomy decision consumed was one of those - it does NOT mean an identity provider verified anybody. Read it as "the basis is recorded", not "the person was checked".

## 6. Correlating a single action end to end

Pick any `traceId` from `ledger.jsonl` and filter all three files by it. You
will see the authorisation decision (who, what policy, allowed or refused), the
execution spans that followed, and the surrounding audit events — in order.

## 7. Which control does each artefact speak to

`controls.json` maps the files in this bundle to specific controls — EU AI Act, SOC 2 (Trust Services Criteria, Common Criteria) — so you do not have to derive that yourself. Map version 1, as of 2026-08-20.

**Read its `whatThisIsNot` block first.** Every entry carries a `doesNotEvidence`
list alongside its evidence, and controls this product cannot speak to are listed
as `not-evidenced` rather than left out.

**This bundle is not a certification and does not claim to be one.** CAIRN Trust Fabric
holds no SOC 2 report and no ISO 27001 certificate. These artefacts evidence what
this software did; whether that satisfies a control is your determination, not ours.

## What this evidence does and does not establish

**Does:** that these records were produced by this installation, have not been
altered since export, and form an unbroken chain across the stated window. And —
section 4 — **which parts of that window CAIRN was running for**, so a stretch of
quiet ledger can be told apart from a stretch of absence.

**Does not:** that the records are a complete account of everything the system
did. A record absent from the ledger cannot be detected by hashing the ledger.
Completeness rests on the governance gate being the sole execution path — an
architectural property, verified by the test suite (`tests/governance_gate.test.js`),
not by cryptography.

Section 4 narrows that limit; it does not remove it. It closes the one form of
incompleteness the product can actually detect — CAIRN not being there — and says
where those intervals are. It cannot tell you about a decision that went
unrecorded while CAIRN *was* running, and it does not claim to.

That distinction is stated deliberately. An evidence package that implies more
than it proves is worse than one that states its own limits.
