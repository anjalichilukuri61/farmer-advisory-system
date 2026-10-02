// server/services/ttsService.ts

export class ServerTTSService {
  private static cache: Map<string, Buffer> = new Map();
  private static MAX_CACHE_ENTRIES = 200;

  /**
   * Splits text into smaller natural speech chunks (under 180 characters)
   * while respecting sentence punctuation and word boundaries.
   */
  public static splitIntoSpeechChunks(text: string, maxLength: number = 160): string[] {
    if (!text || text.trim().length === 0) return [];
    const trimmed = text.trim().replace(/\s+/g, ' ');
    if (trimmed.length <= maxLength) return [trimmed];

    const chunks: string[] = [];
    // Split primarily by sentence terminators
    const sentences = trimmed.split(/(?<=[.?!,\n।॥])/);

    let currentChunk = '';

    for (const segment of sentences) {
      if ((currentChunk + ' ' + segment).trim().length <= maxLength) {
        currentChunk = (currentChunk + ' ' + segment).trim();
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        // If an individual segment is still longer than maxLength, split by spaces
        if (segment.length > maxLength) {
          const words = segment.split(' ');
          for (const word of words) {
            if ((currentChunk + ' ' + word).trim().length <= maxLength) {
              currentChunk = (currentChunk + ' ' + word).trim();
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = word;
            }
          }
        } else {
          currentChunk = segment.trim();
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.filter(c => c.length > 0);
  }

  /**
   * Generates MP3 audio buffer for given text and language.
   * Leverages chunking, parallel fetch, and concatenation.
   */
  public static async synthesizeSpeech(text: string, lang: 'te' | 'en' = 'te'): Promise<Buffer> {
    const cacheKey = `${lang}:${text.trim()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const chunks = this.splitIntoSpeechChunks(text, 160);
    if (chunks.length === 0) {
      return Buffer.alloc(0);
    }

    const targetLang = lang === 'te' ? 'te' : 'en';

    // Fetch MP3 chunks
    const chunkPromises = chunks.map(async (chunk) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLang}&client=tw-ob`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg, audio/*; q=0.9, */*; q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`TTS audio upstream request failed with status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });

    const buffers = await Promise.all(chunkPromises);
    const combined = Buffer.concat(buffers);

    // Cache management
    if (this.cache.size >= this.MAX_CACHE_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, combined);

    return combined;
  }
}
