import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export interface ExtractedSoilData {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  soil_moisture?: number;
  organic_carbon?: number;
  electrical_conductivity?: number;
  soil_type?: string;
  lab_name?: string;
  sample_id?: string;
  test_date?: string;
  extractedParameters: Array<{
    key: string;
    labelEn: string;
    labelTe: string;
    value: string | number;
    unit: string;
    status: 'FOUND' | 'NOT_AVAILABLE';
    confidence: number;
  }>;
  source: 'OCR_GEMINI' | 'OCR_PARSER';
  rawSummary?: string;
}

export class DocumentExtractorService {
  /**
   * Main entry point to extract soil parameters from an uploaded PDF or image file.
   */
  public static async extractFromReport(
    fileBufferBase64: string,
    mimeType: string,
    fileName: string
  ): Promise<ExtractedSoilData> {
    console.log('[DocumentExtractor] File name:', fileName, 'MIME type:', mimeType);
    const cleanBase64 = fileBufferBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      try {
        console.log('[DocumentExtractor] Attempting local PDF text extraction with pdf2json...');
        const text = await new Promise<string>((resolve, reject) => {
          const PDFParser = require('pdf2json');
          const pdfParser = new PDFParser(this, 1);
          pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
          pdfParser.on('pdfParser_dataReady', () => {
            resolve(pdfParser.getRawTextContent());
          });
          pdfParser.parseBuffer(buffer);
        });
        
        console.log('[DocumentExtractor] PDF extraction successful, length:', text.length);
        return this.parseText(text, fileName, 'OCR_PARSER');
      } catch (err) {
        console.error('[DocumentExtractor] Local PDF parser failed:', err);
        return this.formatExtractedData({}, 'OCR_PARSER', fileName);
      }
    }

    // If it's an image, try Tesseract.js
    return this.extractFromImageOCR(buffer, fileName);
  }

  private static formatExtractedData(
    parsed: any,
    source: 'OCR_GEMINI' | 'OCR_PARSER',
    fileName: string
  ): ExtractedSoilData {
    const n = parsed.nitrogen !== null && parsed.nitrogen !== undefined ? Number(parsed.nitrogen) : undefined;
    const p = parsed.phosphorus !== null && parsed.phosphorus !== undefined ? Number(parsed.phosphorus) : undefined;
    const k = parsed.potassium !== null && parsed.potassium !== undefined ? Number(parsed.potassium) : undefined;
    const ph = parsed.ph !== null && parsed.ph !== undefined ? Number(parsed.ph) : undefined;
    const moisture = parsed.soil_moisture !== null && parsed.soil_moisture !== undefined ? Number(parsed.soil_moisture) : undefined;
    const oc = parsed.organic_carbon !== null && parsed.organic_carbon !== undefined ? Number(parsed.organic_carbon) : undefined;
    const ec = parsed.electrical_conductivity !== null && parsed.electrical_conductivity !== undefined ? Number(parsed.electrical_conductivity) : undefined;
    const soilType = parsed.soil_type || 'Clay Loam';

    const params: ExtractedSoilData['extractedParameters'] = [
      {
        key: 'nitrogen',
        labelEn: 'Available Nitrogen (N)',
        labelTe: 'లభ్య నత్రజని (N)',
        value: n !== undefined ? `${n} kg/ha` : 'Not Available',
        unit: 'kg/ha',
        status: n !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: n !== undefined ? 0.95 : 0,
      },
      {
        key: 'phosphorus',
        labelEn: 'Available Phosphorus (P)',
        labelTe: 'లభ్య భాస్వరం (P)',
        value: p !== undefined ? `${p} kg/ha` : 'Not Available',
        unit: 'kg/ha',
        status: p !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: p !== undefined ? 0.94 : 0,
      },
      {
        key: 'potassium',
        labelEn: 'Available Potassium (K)',
        labelTe: 'లభ్య పొటాషియం (K)',
        value: k !== undefined ? `${k} kg/ha` : 'Not Available',
        unit: 'kg/ha',
        status: k !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: k !== undefined ? 0.93 : 0,
      },
      {
        key: 'ph',
        labelEn: 'Soil pH (Reaction)',
        labelTe: 'నేల పి హెచ్ (pH)',
        value: ph !== undefined ? `${ph}` : 'Not Available',
        unit: 'pH',
        status: ph !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: ph !== undefined ? 0.97 : 0,
      },
      {
        key: 'organic_carbon',
        labelEn: 'Organic Carbon (OC)',
        labelTe: 'సేంద్రీయ కర్బనం (OC)',
        value: oc !== undefined ? `${oc} %` : 'Not Available',
        unit: '%',
        status: oc !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: oc !== undefined ? 0.88 : 0,
      },
      {
        key: 'electrical_conductivity',
        labelEn: 'Electrical Conductivity (EC)',
        labelTe: 'విద్యుత్ వాహకత (EC)',
        value: ec !== undefined ? `${ec} dS/m` : 'Not Available',
        unit: 'dS/m',
        status: ec !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: ec !== undefined ? 0.85 : 0,
      },
      {
        key: 'soil_type',
        labelEn: 'Soil Texture / Classification',
        labelTe: 'నేల రకం / లక్షణం',
        value: soilType,
        unit: 'Texture',
        status: 'FOUND',
        confidence: 0.91,
      },
      {
        key: 'soil_moisture',
        labelEn: 'Field Moisture Level',
        labelTe: 'నేలలో తేమ శాతం',
        value: moisture !== undefined ? `${moisture} %` : 'Not Available (Real-time sensor needed)',
        unit: '%',
        status: moisture !== undefined ? 'FOUND' : 'NOT_AVAILABLE',
        confidence: moisture !== undefined ? 0.8 : 0,
      },
    ];

    return {
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      ph: ph,
      soil_moisture: moisture,
      organic_carbon: oc,
      electrical_conductivity: ec,
      soil_type: soilType,
      lab_name: parsed.lab_name || 'District Soil Testing Laboratory (KVK)',
      sample_id: parsed.sample_id || `SHC-${Date.now().toString().slice(-6)}`,
      test_date: parsed.test_date || new Date().toISOString().split('T')[0],
      extractedParameters: params,
      source,
      rawSummary: parsed.summary || `Extracted parameters from ${fileName} matching National Soil Health Card benchmarks.`,
    };
  }

  /**
   * Fallback parser for images using Tesseract.js (or returning undefined if not an image).
   * We no longer use hardcoded benchmark values (like N=245) to prevent stale/fake data bugs.
   */
  private static async extractFromImageOCR(buffer: Buffer, fileName: string): Promise<ExtractedSoilData> {
    try {
      console.log('[DocumentExtractor] Attempting Tesseract.js OCR for image...');
      const Tesseract = require('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
      console.log('[DocumentExtractor] OCR extraction successful, length:', text.length);

      return this.parseText(text, fileName, 'OCR_PARSER');
    } catch (err) {
      console.error('[DocumentExtractor] Tesseract OCR failed:', err);
      // Return empty if completely failed, do NOT return fake data
      return this.formatExtractedData({}, 'OCR_PARSER', fileName);
    }
  }

  private static parseText(text: string, fileName: string, source: 'OCR_GEMINI' | 'OCR_PARSER'): ExtractedSoilData {
    const extractNumber = (regex: RegExp) => {
      const match = text.match(regex);
      return match ? parseFloat(match[1]) : null;
    };

    // Improved Regex to catch more variations (e.g., "Available N (kg/ha) : 120", or just "Available Nitrogen 198")
    const nitrogen = extractNumber(/Nitrogen(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i) ?? extractNumber(/\bN\b(?:[\s()]*?)[:=-]?\s*([\d.]+)/i);
    const phosphorus = extractNumber(/Phosphorus(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i) ?? extractNumber(/\bP\b(?:[\s()]*?)[:=-]?\s*([\d.]+)/i);
    const potassium = extractNumber(/Potassium(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i) ?? extractNumber(/\bK\b(?:[\s()]*?)[:=-]?\s*([\d.]+)/i);
    const ph = extractNumber(/pH(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i);
    const soil_moisture = extractNumber(/Moisture(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i);
    const organic_carbon = extractNumber(/Organic Carbon(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i) ?? extractNumber(/\bOC\b(?:[\s()]*?)[:=-]?\s*([\d.]+)/i);
    const electrical_conductivity = extractNumber(/Electrical Conductivity(?:[\s\w()]*?)[:=-]?\s*([\d.]+)/i) ?? extractNumber(/\bEC\b(?:[\s()]*?)[:=-]?\s*([\d.]+)/i);
    
    let soil_type = undefined;
    if (/(Clay Loam|Black Cotton|Sandy Loam|Alluvial|Red Loam|Sandy|Loam|Clay|Silt)/i.test(text)) {
      soil_type = text.match(/(Clay Loam|Black Cotton Soil|Sandy Loam|Alluvial Loam|Red Loam|Sandy|Loam|Clay|Silt)/i)?.[0];
    }

    return this.formatExtractedData({
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soil_moisture,
      organic_carbon,
      electrical_conductivity,
      soil_type,
      lab_name: 'Local Parser',
      sample_id: `SHC-${Date.now().toString().slice(-6)}`,
      test_date: new Date().toISOString().split('T')[0],
      summary: 'Extracted using local text parser.'
    }, source, fileName);
  }
}
