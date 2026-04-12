import {
  MAX_CAMPUS_NAME_LENGTH,
  MIN_CAMPUS_NAME_LENGTH,
  NIAT_CAMPUSES,
} from '../constants/app.constants.js';
import { Campus } from '../models/campus.model.js';

function isMongoDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000;
}

/**
 * Upserts the canonical NIAT school list into MongoDB so `GET /api/meta/campuses`
 * always returns live DB data (same source used to validate moderator campus).
 */
export async function ensureCampusesSeeded(): Promise<void> {
  const ops = NIAT_CAMPUSES.map((name, sortOrder) => ({
    updateOne: {
      filter: { name },
      update: { $set: { name, sortOrder } },
      upsert: true,
    },
  }));
  if (ops.length > 0) {
    await Campus.bulkWrite(ops);
  }
  console.log('Campus directory synced:', NIAT_CAMPUSES.length, 'schools');
}

export async function listCampusNamesOrdered(): Promise<string[]> {
  const rows = await Campus.find().sort({ sortOrder: 1, name: 1 }).lean().exec();
  return rows.map((r) => r.name);
}

export async function isCampusInDirectory(campus: string): Promise<boolean> {
  const t = campus.trim();
  if (!t) {
    return false;
  }
  const n = await Campus.countDocuments({ name: t }).exec();
  return n > 0;
}

/**
 * Ensures a school exists in the directory. If the name is new, inserts it (admin-only flow).
 * Used when adding a moderator so admins can type schools not in the seeded list.
 */
export async function ensureCampusExistsForAdmin(
  rawName: string,
): Promise<{ ok: true } | { ok: false; reason: 'validation' }> {
  const t = rawName.trim();
  if (t.length < MIN_CAMPUS_NAME_LENGTH || t.length > MAX_CAMPUS_NAME_LENGTH) {
    return { ok: false, reason: 'validation' };
  }
  if (await isCampusInDirectory(t)) {
    return { ok: true };
  }

  const maxDoc = await Campus.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean().exec();
  const nextOrder = (maxDoc?.sortOrder ?? -1) + 1;

  try {
    await Campus.create({ name: t, sortOrder: nextOrder });
  } catch (err: unknown) {
    if (isMongoDuplicateKey(err)) {
      return { ok: true };
    }
    throw err;
  }
  return { ok: true };
}
