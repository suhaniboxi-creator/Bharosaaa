const store = require('../data/store');

/**
 * Scarf lifecycle state machine:
 * READY → LINKED → ACTIVE → DELINKED → SANITIZING → READY
 */

const VALID_TRANSITIONS = {
  'READY': ['LINKED'],
  'LINKED': ['ACTIVE'],
  'ACTIVE': ['DELINKED'],
  'DELINKED': ['SANITIZING'],
  'SANITIZING': ['READY'],
};

function transitionScarf(scarfId, newStatus) {
  const scarf = store.scarves.get(scarfId);
  if (!scarf) throw new Error(`Scarf ${scarfId} not found`);

  const allowed = VALID_TRANSITIONS[scarf.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(`Invalid transition: ${scarf.status} → ${newStatus}`);
  }

  scarf.status = newStatus;
  return scarf;
}

/**
 * Link scarf to identity token
 */
function linkScarf(scarfId, tokenId, slotTime, gateId, colorCode) {
  const scarf = store.scarves.get(scarfId);
  if (!scarf) throw new Error(`Scarf ${scarfId} not found`);
  if (scarf.status !== 'READY') throw new Error(`Scarf ${scarfId} is not ready (status: ${scarf.status})`);

  scarf.status = 'LINKED';
  scarf.linkedTokenId = tokenId;
  scarf.linkedAt = Date.now();
  scarf.slotTime = slotTime;
  scarf.gateId = gateId;
  scarf.colorCode = colorCode || scarf.colorCode;

  store.addTransaction({
    type: 'SCARF_LINK',
    details: `Scarf ${scarfId} linked to token ${tokenId}`,
    userId: tokenId,
    templeId: 'T1',
  });

  return scarf;
}

/**
 * Activate scarf (after biometric verification at entry)
 */
function activateScarf(scarfId) {
  const scarf = transitionScarf(scarfId, 'ACTIVE');

  store.addTransaction({
    type: 'SCARF_ACTIVATE',
    details: `Scarf ${scarfId} activated at entry`,
    userId: scarf.linkedTokenId,
    templeId: 'T1',
  });

  return scarf;
}

/**
 * Delink scarf - removes all identity association
 */
function delinkScarf(scarfId) {
  const scarf = store.scarves.get(scarfId);
  if (!scarf) throw new Error(`Scarf ${scarfId} not found`);
  if (scarf.status !== 'ACTIVE') throw new Error(`Scarf ${scarfId} cannot be delinked (status: ${scarf.status})`);

  const previousToken = scarf.linkedTokenId;

  scarf.status = 'DELINKED';
  scarf.delinkedAt = Date.now();

  store.addTransaction({
    type: 'SCARF_DELINK',
    details: `Scarf ${scarfId} delinked from token ${previousToken}. Identity removed.`,
    userId: previousToken,
    templeId: 'T1',
  });

  // Auto-transition through sanitizing to ready after delay
  setTimeout(() => {
    if (scarf.status === 'DELINKED') {
      scarf.status = 'SANITIZING';
      scarf.linkedTokenId = null;
      scarf.linkedAt = null;

      setTimeout(() => {
        if (scarf.status === 'SANITIZING') {
          scarf.status = 'READY';
          scarf.delinkedAt = null;
          scarf.cycleCount = (scarf.cycleCount || 0) + 1;
        }
      }, 3000); // 3s sanitizing
    }
  }, 2000); // 2s delink processing

  return { scarfId, previousToken, delinkedAt: scarf.delinkedAt };
}

/**
 * Get scarf by linked token
 */
function getScarfByToken(tokenId) {
  for (const [, scarf] of store.scarves) {
    if (scarf.linkedTokenId === tokenId && ['LINKED', 'ACTIVE'].includes(scarf.status)) {
      return scarf;
    }
  }
  return null;
}

module.exports = { linkScarf, activateScarf, delinkScarf, transitionScarf, getScarfByToken };
