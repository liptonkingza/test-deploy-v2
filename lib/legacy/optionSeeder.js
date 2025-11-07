const fs = require('fs');
const path = require('path');
const { parseDbfFile } = require('./dbfReader');
const { legacyTables } = require('./schema');
const { sanitizePayload, buildInsertStatement } = require('./tableManager');

const DBF_BASE_DIR = path.resolve(__dirname, '..', '..', 'Database_DATA', 'DBF');

function toIsoDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const safeDate = String(dateStr).trim();
  if (!safeDate) return null;
  if (!timeStr) return safeDate;
  const safeTime = String(timeStr).trim();
  if (!safeTime) return safeDate;
  const parts = safeTime.split(':');
  let normalized = safeTime;
  if (parts.length === 2) {
    normalized = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  } else if (parts.length === 3) {
    normalized = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  } else {
    normalized = `${safeTime}:00`;
  }
  const isoCandidate = `${safeDate}T${normalized}`;
  const dt = new Date(isoCandidate);
  if (Number.isNaN(dt.getTime())) {
    return safeDate;
  }
  return dt.toISOString().slice(0, 19).replace('T', ' ');
}

function pickCaseInsensitive(obj, candidates) {
  if (!obj || !candidates || !candidates.length) return undefined;
  for (let i = 0; i < candidates.length; i += 1) {
    const key = candidates[i];
    if (key in obj) return obj[key];
    const lower = String(key).toLowerCase();
    for (const k of Object.keys(obj)) {
      if (String(k).toLowerCase() === lower) return obj[k];
    }
  }
  return undefined;
}

const OPTION_SOURCES = [
  {
    key: 'media',
    dbf: 'MediaMst.DBF',
    map(record) {
      const name = record.mediadesc;
      if (!name) return null;
      const legacyCode = record.mediatype != null ? String(record.mediatype).trim() : null;
      const remark = record.remark || null;
      const createdAt = toIsoDate(record.workdate, record.worktime);
      return {
        mediaid: legacyCode && legacyCode !== '' ? legacyCode : null,
        medianame: name,
        remark,
        created_at: createdAt || record.workdate || null,
      };
    },
  },
  {
    key: 'channels',
    dbf: 'ChannelMst.DBF',
    map(record) {
      const name = record.channeldes;
      if (!name) return null;
      const legacyCode = record.channel != null ? String(record.channel).trim() : null;
      const remark = record.remark || null;
      const createdAt = toIsoDate(record.workdate, record.worktime);
      return {
        channelid: legacyCode && legacyCode !== '' ? legacyCode : null,
        channelname: name,
        remark,
        created_at: createdAt || record.workdate || null,
      };
    },
  },
  {
    key: 'finance',
    dbf: 'FinanceMst.DBF',
    map(record) {
      const financetype = pickCaseInsensitive(record, ['financetype', 'financetyp', 'financety', 'fin_type']);
      const financedes = pickCaseInsensitive(record, ['financedes', 'financedesc', 'financedescription']);
      const fingrptype = pickCaseInsensitive(record, ['fingrptype', 'fingerptype', 'fin_grp_type', 'group']);
      const fingrpdesc = pickCaseInsensitive(record, ['fingrpdesc', 'fingerpdesc', 'fin_grp_desc', 'groupdesc']);
      const tohomenum = pickCaseInsensitive(record, ['tohomenum']);
      const paytype = pickCaseInsensitive(record, ['paytype']);
      const paydesc = pickCaseInsensitive(record, ['paydesc']);
      const paytype1 = pickCaseInsensitive(record, ['paytype1']);
      const subpay1 = pickCaseInsensitive(record, ['subpay1']);
      const subpay2 = pickCaseInsensitive(record, ['subpay2']);
      const payment = pickCaseInsensitive(record, ['payment']);
      const payday = pickCaseInsensitive(record, ['payday']);
      const cusbankno = pickCaseInsensitive(record, ['cusbankno']);
      const cusbankna = pickCaseInsensitive(record, ['cusbankna']);
      const cusbankbr = pickCaseInsensitive(record, ['cusbankbr']);
      const cusbankac = pickCaseInsensitive(record, ['cusbankac']);
      const cusbankref = pickCaseInsensitive(record, ['cusbankref']);
      const credit = pickCaseInsensitive(record, ['credit']);
      const credittype = pickCaseInsensitive(record, ['credittype']);
      const creditdesc = pickCaseInsensitive(record, ['creditdesc']);
      const creditno = pickCaseInsensitive(record, ['creditno']);
      const creditexpm = pickCaseInsensitive(record, ['creditexpm']);
      const creditexpy = pickCaseInsensitive(record, ['creditexpy']);
      const creditref = pickCaseInsensitive(record, ['creditref']);
      const last3digit = pickCaseInsensitive(record, ['last3digit']);
      const bankno = pickCaseInsensitive(record, ['bankno']);
      const bankna = pickCaseInsensitive(record, ['bankna', 'bankname']);
      const bankbr = pickCaseInsensitive(record, ['bankbr', 'bankbranch']);
      const bankac = pickCaseInsensitive(record, ['bankac', 'accountno']);
      const bankref = pickCaseInsensitive(record, ['bankref']);
      const finance = pickCaseInsensitive(record, ['finance']);
      const accode = pickCaseInsensitive(record, ['accode']);
      const acname = pickCaseInsensitive(record, ['acname']);
      if (financetype === undefined && financedes === undefined) return null;
      const numType = financetype != null && financetype !== '' ? Number(financetype) : null;
      return {
        tohomenum: tohomenum != null ? String(tohomenum).trim() : null,
        paytype: paytype != null && paytype !== '' ? Number(paytype) || null : null,
        paydesc: paydesc != null ? String(paydesc).trim() : null,
        paytype1: paytype1 != null ? String(paytype1).trim() : null,
        subpay1: subpay1 != null ? String(subpay1).trim() : null,
        subpay2: subpay2 != null ? String(subpay2).trim() : null,
        payment: payment != null ? (String(payment).match(/^(1|y|yes|true)$/i) ? 1 : 0) : null,
        payday: payday || null,
        cusbankno: cusbankno != null ? String(cusbankno).trim() : null,
        cusbankna: cusbankna != null ? String(cusbankna).trim() : null,
        cusbankbr: cusbankbr != null ? String(cusbankbr).trim() : null,
        cusbankac: cusbankac != null ? String(cusbankac).trim() : null,
        cusbankref: cusbankref != null ? String(cusbankref).trim() : null,
        credit: credit != null ? (String(credit).match(/^(1|y|yes|true)$/i) ? 1 : 0) : null,
        credittype: credittype != null && credittype !== '' ? Number(credittype) || null : null,
        creditdesc: creditdesc != null ? String(creditdesc).trim() : null,
        creditno: creditno != null ? String(creditno).trim() : null,
        creditexpm: creditexpm != null ? String(creditexpm).trim() : null,
        creditexpy: creditexpy != null ? String(creditexpy).trim() : null,
        creditref: creditref != null ? String(creditref).trim() : null,
        last3digit: last3digit != null ? String(last3digit).trim() : null,
        financetype: Number.isFinite(numType) ? numType : (typeof financetype === 'string' ? parseInt(financetype, 10) || null : null),
        financedes: financedes != null ? String(financedes).trim() : null,
        fingrptype: fingrptype != null && fingrptype !== '' ? Number(fingrptype) || null : null,
        fingrpdesc: fingrpdesc != null ? String(fingrpdesc).trim() : null,
        bankno: bankno != null ? String(bankno).trim() : null,
        bankna: bankna != null ? String(bankna).trim() : null,
        bankbr: bankbr != null ? String(bankbr).trim() : null,
        bankac: bankac != null ? String(bankac).trim() : null,
        bankref: bankref != null ? String(bankref).trim() : null,
        finance: finance != null ? (String(finance).match(/^(1|y|yes|true)$/i) ? 1 : 0) : null,
        accode: accode != null ? String(accode).trim() : null,
        acname: acname != null ? String(acname).trim() : null,
      };
    },
  },
];

async function seedOptionTable(pool, source, logger) {
  const table = legacyTables.find((tbl) => tbl.key === source.key);
  if (!table) {
    if (logger) logger.warn(`Legacy table with key "${source.key}" not found, skipping.`);
    return { key: source.key, skipped: true, reason: 'missing-table' };
  }

  const [[countRow]] = await pool.query(`SELECT COUNT(*) AS count FROM \`${table.tableName}\``);
  if (countRow.count > 0) {
    return { key: source.key, skipped: true, reason: 'already-populated', existing: countRow.count };
  }

  const dbfPath = path.join(DBF_BASE_DIR, source.dbf);
  if (!fs.existsSync(dbfPath)) {
    return { key: source.key, skipped: true, reason: 'missing-dbf', path: dbfPath };
  }

  const { records, meta } = parseDbfFile(dbfPath);
  if (!Array.isArray(records) || !records.length) {
    return { key: source.key, skipped: true, reason: 'empty-dbf', path: dbfPath };
  }

  const connection = await pool.getConnection();
  let inserted = 0;
  try {
    await connection.beginTransaction();
    for (const record of records) {
      const mapped = source.map(record);
      if (!mapped) continue;
      const sanitized = sanitizePayload(table, mapped);
      if (!Object.keys(sanitized).length) continue;
      try {
        const { sql, values } = buildInsertStatement(table, sanitized);
        await connection.query(sql, values);
        inserted += 1;
      } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          continue;
        }
        throw err;
      }
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    err.message = `Failed to seed ${source.key} options from ${source.dbf}: ${err.message}`;
    throw err;
  } finally {
    connection.release();
  }

  if (logger && inserted) {
    logger.info?.(`Imported ${inserted} ${source.key} option records from ${path.basename(meta.path)} using encoding ${meta.encoding}`);
  }

  return { key: source.key, inserted, source: meta.path };
}

async function seedOptionTablesFromDbf(pool, logger = console) {
  const outcomes = [];
  for (const source of OPTION_SOURCES) {
    const result = await seedOptionTable(pool, source, logger);
    outcomes.push(result);
  }
  return outcomes;
}

module.exports = {
  seedOptionTablesFromDbf,
};