export interface AskAITutorParams {
  prompt: string;
  code?: string;
  problemTitle?: string;
  senderName?: string;
  senderRole?: string;
  isDraftForAdmin?: boolean;
}

export class AITutorService {
  static async askTutor(params: AskAITutorParams): Promise<string> {
    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          return data.reply;
        }
      }
    } catch (err) {
      console.warn('Network call to /api/ai-tutor failed, using client fallback:', err);
    }

    // Client-side fallback if server is unreachable
    const lower = params.prompt.toLowerCase();
    if (lower.includes('pointer') || lower.includes('*') || lower.includes('&')) {
      return `Pointers store memory addresses. In C, remember that '\`&x\`' gets the address of variable \`x\`, while '\`*ptr\`' dereferences the pointer to read or write the value at that address. Always ensure pointers are initialized before dereferencing!`;
    }
    if (lower.includes('malloc') || lower.includes('free') || lower.includes('leak')) {
      return `When using \`malloc(size)\`, memory is reserved in the Heap. Always verify \`if (ptr == NULL)\` to prevent null pointer dereferences, and call \`free(ptr)\` when finished to prevent memory leaks.`;
    }
    if (lower.includes('seg') || lower.includes('crash')) {
      return `Segmentation faults usually occur when accessing invalid memory: out-of-bounds array indices, uninitialized pointers, or dereferencing NULL. Check your loop limits and pointer initializations.`;
    }
    return `In C programming, memory safety and correct type conversions are crucial. Ensure proper format specifiers with \`printf\`/\`scanf\` and test your boundary cases!`;
  }
}
