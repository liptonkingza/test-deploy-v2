const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const CODE_PAGE_MAP = {
  0x00: 'ascii',
  0x01: 'cp437',
  0x02: 'cp850',
  0x03: 'cp1252',
  0x57: 'cp1252',
  0x58: 'cp1252',
  0x59: 'cp1252',
  0x64: 'cp852',
  0x65: 'cp866',
  0x66: 'cp865',
  0x67: 'cp861',
  0x68: 'cp895',
  0x69: 'cp620',
  0x6A: 'cp737',
  0x6B: 'cp857',
  0x6C: 'cp863',
  0x78: 'cp950',
  0x79: 'cp949',
  0x7A: 'cp936',
  0x7B: 'cp932',
  0x7C: 'cp874', // Thai
  0x7D: 'cp1255',
  0x7E: 'cp1256',
  0x96: 'cp10007',
  0x97: 'macRoman',
};

function resolveEncoding(codePageByte, fallbackEncoding) {
  if (fallbackEncoding) return fallbackEncoding;
  const encoding = CODE_PAGE_MAP[codePageByte];
  if (encoding) return encoding;
  return 'utf8';
}

function decodeTrimmed(buffer, encoding) {
  if (!buffer || !buffer.length) return '';
  const decoded = iconv.decode(Buffer.from(buffer), encoding);
  return decoded.replace(/\u0000+$/g, '').trim();
}

function parseNumeric(buffer, decimals) {
  const str = Buffer.from(buffer).toString('ascii').trim();
  if (!str) return null;
  if (decimals && decimals > 0) {
    const num = Number(str);
    return Number.isNaN(num) ? null : num;
  }
  const intVal = Number.parseInt(str, 10);
  return Number.isNaN(intVal) ? null : intVal;
}

function parseDate(buffer) {
  const str = Buffer.from(buffer).toString('ascii').trim();
  if (!str) return null;
  if (str.length !== 8) return null;
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  if (!Number.isInteger(Number(year)) || !Number.isInteger(Number(month)) || !Number.isInteger(Number(day))) {
    return null;
  }
  return `${year}-${month}-${day}`;
}

function parseLogical(buffer) {
  const byte = buffer[0];
  if (byte === undefined) return null;
  const truthy = byte === 0x59 || byte === 0x79 || byte === 0x54 || byte === 0x74; // Y/y or T/t
  const falsy = byte === 0x4E || byte === 0x6E || byte === 0x46 || byte === 0x66 || byte === 0x3F || byte === 0x00; // N/n F/f ? null
  if (truthy) return true;
  if (falsy) return false;
  return null;
}

function parseDbfFile(filePath, options = {}) {
  const resolvedPath = path.resolve(filePath);
  const buffer = fs.readFileSync(resolvedPath);
  if (buffer.length < 32) {
    throw new Error(`DBF file too small or corrupt: ${resolvedPath}`);
  }

  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const codePageByte = buffer[29];
  const encoding = resolveEncoding(codePageByte, options.encoding);

  let offset = 32;
  const fields = [];
  while (offset < headerLength && buffer[offset] !== 0x0D) {
    const rawName = Buffer.from(buffer.slice(offset, offset + 11)).toString('ascii').replace(/\u0000.*$/, '').trim();
    const fieldType = String.fromCharCode(buffer[offset + 11]);
    const fieldLength = buffer[offset + 16];
    const decimals = buffer[offset + 17];
    const nameLower = rawName.toLowerCase();
    fields.push({
      name: rawName,
      key: nameLower,
      type: fieldType,
      length: fieldLength,
      decimals,
    });
    offset += 32;
  }

  const records = [];
  for (let i = 0; i < recordCount; i += 1) {
    const recordOffset = headerLength + i * recordLength;
    if (recordOffset + recordLength > buffer.length) break;
    const deletionFlag = buffer[recordOffset];
    if (deletionFlag === 0x2A) continue; // deleted row

    let cursor = recordOffset + 1;
    const record = {};
    for (const field of fields) {
      const raw = buffer.slice(cursor, cursor + field.length);
      cursor += field.length;
      let value = null;
      switch (field.type) {
        case 'C':
        case 'M': {
          const text = decodeTrimmed(raw, encoding);
          value = text === '' ? null : text;
          break;
        }
        case 'D':
          value = parseDate(raw);
          break;
        case 'N':
        case 'F':
          value = parseNumeric(raw, field.decimals);
          break;
        case 'L':
          value = parseLogical(raw);
          break;
        default: {
          const text = decodeTrimmed(raw, encoding);
          value = text === '' ? null : text;
        }
      }
      record[field.key] = value;
    }
    records.push(record);
  }

  return {
    meta: {
      path: resolvedPath,
      recordCount,
      headerLength,
      recordLength,
      encoding,
    },
    fields,
    records,
  };
}

module.exports = {
  parseDbfFile,
};