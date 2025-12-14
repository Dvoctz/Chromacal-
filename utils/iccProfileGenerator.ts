import { CalibrationResult } from '../types';

/**
 * ZAP AI - Native Binary ICC Profile Generator
 * 
 * This utility generates a spec-compliant ICC v2.4 Monitor Profile (binary).
 * It enables the file to be recognized by Windows Color Management and macOS ColorSync.
 * 
 * Features:
 * - Generates binary Header
 * - Generates 'desc', 'cprt', 'wtpt' tags
 * - Generates 'rXYZ', 'gXYZ', 'bXYZ' chromatic adaptation matrices (scaled by gains)
 * - Generates 'rTRC', 'gTRC', 'bTRC' gamma curves
 */

// --- Binary Writer Helper Class ---
class BinaryWriter {
  private data: number[] = [];

  // Write a single byte (8-bit)
  writeU8(value: number) {
    this.data.push(value & 0xFF);
  }

  // Write 16-bit unsigned integer (Big Endian)
  writeU16(value: number) {
    this.data.push((value >>> 8) & 0xFF);
    this.data.push(value & 0xFF);
  }

  // Write 32-bit unsigned integer (Big Endian)
  writeU32(value: number) {
    this.data.push((value >>> 24) & 0xFF);
    this.data.push((value >>> 16) & 0xFF);
    this.data.push((value >>> 8) & 0xFF);
    this.data.push(value & 0xFF);
  }

  // Write a 4-char ASCII string (Tag Signature)
  writeTagSig(str: string) {
    for (let i = 0; i < 4; i++) {
      this.data.push(str.charCodeAt(i) || 0);
    }
  }

  // Write a string with null termination or padding
  writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.data.push(str.charCodeAt(i));
    }
  }

  // Write s15.16 Fixed Point Number (Standard ICC number format)
  writeFixed15_16(value: number) {
    const whole = Math.floor(value);
    const fraction = Math.floor((value - whole) * 65536);
    this.writeU16(whole);
    this.writeU16(fraction);
  }

  // Write XYZ Number (3 fixed point numbers)
  writeXYZ(x: number, y: number, z: number) {
    this.writeFixed15_16(x);
    this.writeFixed15_16(y);
    this.writeFixed15_16(z);
  }

  // Get the byte array
  getBuffer(): Uint8Array {
    return new Uint8Array(this.data);
  }

  // Get current size
  getSize(): number {
    return this.data.length;
  }
}

// --- Standard sRGB Matrices (D50 adapted) ---
const sRGB_Matrix = {
  red:   { x: 0.436066, y: 0.222488, z: 0.013916 },
  green: { x: 0.385147, y: 0.716873, z: 0.097076 },
  blue:  { x: 0.143066, y: 0.060608, z: 0.714096 }
};

export const generateICCProfileBlob = (result: CalibrationResult): Blob => {
  // 1. Prepare Data Blocks (Tags)
  
  // -- desc tag (Profile Description)
  const descWriter = new BinaryWriter();
  descWriter.writeTagSig('desc'); // Type signature
  descWriter.writeU32(0); // Reserved
  const descStr = result.profileName.length > 0 ? result.profileName : "ChromaCal Profile";
  descWriter.writeU32(descStr.length + 1); // ASCII count
  descWriter.writeString(descStr);
  descWriter.writeU8(0); // Null terminator
  // Padding/ScriptCode/Mac parts for 'desc' type usually follow, 
  // but minimal v2 implementation often accepts just ASCII part or zero padding.
  // For robustness, we pad with 0s to meet minimal structure expectations if needed, 
  // but strict v2 'desc' has roughly 79 bytes + string.
  // We will use a simplified 'text' type structure wrapped in 'desc' signature for max compat in this demo engine.
  // Actually, 'desc' type structure: 
  // 0-3: 'desc'
  // 4-7: 0
  // 8-11: ASCII length
  // 12-end: ASCII string
  // ... (Unicode/ScriptCode sections optional/zeroed)
  for(let i=0; i<64; i++) descWriter.writeU8(0); // Generic padding for safety

  // -- cprt tag (Copyright)
  const cprtWriter = new BinaryWriter();
  cprtWriter.writeTagSig('text');
  cprtWriter.writeU32(0);
  cprtWriter.writeString("Copyright ZAP AI 2024");
  cprtWriter.writeU8(0);

  // -- wtpt tag (White Point - D50)
  const wtptWriter = new BinaryWriter();
  wtptWriter.writeTagSig('XYZ ');
  wtptWriter.writeU32(0);
  wtptWriter.writeXYZ(0.9642, 1.0000, 0.8249); // Standard D50 PCS

  // -- Chromatic Adaptation Matrices (rXYZ, gXYZ, bXYZ)
  // We apply the Gains here. If Red Gain is 0.9, we scale the Red Matrix vector by 0.9.
  // This tells the CMS "This monitor's Red is only 90% as bright as standard", 
  // so the CMS will boost red or lower others to compensate.
  const rXYZWriter = new BinaryWriter();
  rXYZWriter.writeTagSig('XYZ ');
  rXYZWriter.writeU32(0);
  rXYZWriter.writeXYZ(sRGB_Matrix.red.x * result.redGain, sRGB_Matrix.red.y * result.redGain, sRGB_Matrix.red.z * result.redGain);

  const gXYZWriter = new BinaryWriter();
  gXYZWriter.writeTagSig('XYZ ');
  gXYZWriter.writeU32(0);
  gXYZWriter.writeXYZ(sRGB_Matrix.green.x * result.greenGain, sRGB_Matrix.green.y * result.greenGain, sRGB_Matrix.green.z * result.greenGain);

  const bXYZWriter = new BinaryWriter();
  bXYZWriter.writeTagSig('XYZ ');
  bXYZWriter.writeU32(0);
  bXYZWriter.writeXYZ(sRGB_Matrix.blue.x * result.blueGain, sRGB_Matrix.blue.y * result.blueGain, sRGB_Matrix.blue.z * result.blueGain);

  // -- TRC Curves (Gamma)
  // Type 'curv'. If count is 1, it implies a simple gamma value (u8.8). 
  // Value = Gamma * 256.
  const gammaVal = Math.round(result.gamma * 256);
  
  const trcWriter = new BinaryWriter();
  trcWriter.writeTagSig('curv');
  trcWriter.writeU32(0);
  trcWriter.writeU32(1); // Count = 1 -> Simple Gamma
  trcWriter.writeU16(gammaVal);

  // 2. Assemble File
  const main = new BinaryWriter();

  // --- Header (128 bytes) ---
  const headerStart = 0;
  // Size (0-3): Placeholder, will patch later
  main.writeU32(0); 
  // CMM Type (4-7): Preferred CMM (Lcms is a nice nod)
  main.writeTagSig('lcms'); 
  // Version (8-11): 2.1.0 (0x02100000) - Widely compatible
  main.writeU32(0x02100000);
  // Class (12-15): Monitor ('mntr')
  main.writeTagSig('mntr');
  // Data Colorspace (16-19): RGB
  main.writeTagSig('RGB ');
  // PCS (20-23): XYZ
  main.writeTagSig('XYZ ');
  // Date/Time (24-35)
  const now = new Date();
  main.writeU16(now.getFullYear());
  main.writeU16(now.getMonth() + 1);
  main.writeU16(now.getDate());
  main.writeU16(now.getHours());
  main.writeU16(now.getMinutes());
  main.writeU16(now.getSeconds());
  // Signature (36-39): 'acsp'
  main.writeTagSig('acsp');
  // Platform (40-43): 'MSFT'
  main.writeTagSig('MSFT');
  // Flags (44-47): 0
  main.writeU32(0);
  // Manufacturer (48-51)
  main.writeTagSig('ZAP ');
  // Model (52-55)
  main.writeU32(0);
  // Attributes (56-63)
  main.writeU32(0); main.writeU32(0);
  // Rendering Intent (64-67): Perceptual (0)
  main.writeU32(0);
  // Illuminant (68-79): D50
  main.writeXYZ(0.9642, 1.0000, 0.8249);
  // Creator (80-83)
  main.writeTagSig('ZAP ');
  // Profile ID (84-99) & Reserved (100-127): Zeros
  for(let i=0; i<44; i++) main.writeU8(0);

  // --- Tag Table ---
  const tags = [
    { sig: 'desc', data: descWriter.getBuffer() },
    { sig: 'cprt', data: cprtWriter.getBuffer() },
    { sig: 'wtpt', data: wtptWriter.getBuffer() },
    { sig: 'rXYZ', data: rXYZWriter.getBuffer() },
    { sig: 'gXYZ', data: gXYZWriter.getBuffer() },
    { sig: 'bXYZ', data: bXYZWriter.getBuffer() },
    { sig: 'rTRC', data: trcWriter.getBuffer() },
    { sig: 'gTRC', data: trcWriter.getBuffer() }, // Reuse curve for G
    { sig: 'bTRC', data: trcWriter.getBuffer() }, // Reuse curve for B
  ];

  main.writeU32(tags.length); // Tag Count

  let currentOffset = 128 + (4 + 12 * tags.length); // Header + Count + Table Entries

  // Write Table Entries
  tags.forEach(tag => {
    main.writeTagSig(tag.sig);
    main.writeU32(currentOffset);
    main.writeU32(tag.data.length);
    
    // Calculate next offset, aligned to 4 bytes
    let len = tag.data.length;
    if (len % 4 !== 0) len += (4 - (len % 4)); // Padding logic if we were strictly padding data, 
    // but here we just update offset for where we WILL write.
    currentOffset += tag.data.length;
    // Align offset to 4 bytes for next tag
    while(currentOffset % 4 !== 0) currentOffset++;
  });

  // Write Tag Data
  tags.forEach(tag => {
    // Write bytes
    const buffer = tag.data;
    for(let i=0; i<buffer.length; i++) main.writeU8(buffer[i]);
    
    // Write Padding to align to 4 bytes
    let len = buffer.length;
    while(len % 4 !== 0) {
      main.writeU8(0);
      len++;
    }
  });

  // --- Patch Header Size ---
  const finalBuffer = main.getBuffer();
  const totalSize = finalBuffer.length;
  
  // View as DataView to patch size at byte 0
  const view = new DataView(finalBuffer.buffer);
  view.setUint32(0, totalSize, false); // Big Endian

  return new Blob([finalBuffer], { type: 'application/vnd.iccprofile' });
};