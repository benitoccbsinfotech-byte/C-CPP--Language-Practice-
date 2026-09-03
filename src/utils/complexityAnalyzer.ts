export interface ComplexityResult {
  timeComplexity: string; // 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)'
  spaceComplexity: string; // 'O(1)', 'O(log n)', 'O(n)'
  score: number; // 0 to 100
  label: 'Optimal' | 'Efficient' | 'Moderate' | 'Heavy' | 'Exponential';
  badgeColor: string; // Tailwind color name for styling
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  reason: string;
  loopDepth: number;
  hasRecursion: boolean;
  hasDynamicAlloc: boolean;
  diagnostics: string[];
}

/**
 * Strips comments and string literals from C/C++ source code
 * to prevent false positives during static syntax analysis.
 */
function cleanCode(code: string): string {
  // Remove multi-line comments /* ... */
  let cleaned = code.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Remove single-line comments // ...
  cleaned = cleaned.replace(/\/\/.*$/gm, ' ');
  // Remove string literals "..."
  cleaned = cleaned.replace(/"(?:\\.|[^"\\])*"/g, '""');
  // Remove char literals '.'
  cleaned = cleaned.replace(/'(?:\\.|[^'\\])*'/g, "''");
  return cleaned;
}

/**
 * Basic static analysis helper function to estimate Big O complexity of C/C++ code.
 */
export function estimateBigOComplexity(code: string): ComplexityResult {
  if (!code || code.trim().length === 0) {
    return {
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      score: 100,
      label: 'Optimal',
      badgeColor: 'emerald',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/30',
      badgeText: 'text-emerald-400',
      reason: 'Empty source code evaluated as constant time O(1).',
      loopDepth: 0,
      hasRecursion: false,
      hasDynamicAlloc: false,
      diagnostics: ['No executable statements detected'],
    };
  }

  const cleaned = cleanCode(code);
  const diagnostics: string[] = [];

  // 1. Detect dynamic memory allocations or container usage for Space Complexity
  const dynamicAllocRegex = /\b(malloc|calloc|realloc|new\s+|std::vector|std::map|std::set|std::unordered_map|std::list)\b/;
  const hasDynamicAlloc = dynamicAllocRegex.test(cleaned);
  if (hasDynamicAlloc) {
    diagnostics.push('Dynamic memory allocation (heap / STL dynamic container) detected');
  }

  // 2. Detect Recursion
  // Find function definitions: e.g. int fib(int n) { ... }
  const funcDefRegex = /\b(?:int|void|long|double|float|bool|char|size_t|auto)\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{/g;
  let match: RegExpExecArray | null;
  let hasRecursion = false;
  let isBranchingRecursion = false;
  let isDivideAndConquerRecursion = false;

  while ((match = funcDefRegex.exec(cleaned)) !== null) {
    const funcName = match[1];
    if (funcName === 'main') continue;

    // Find the body of this function
    const startIndex = match.index + match[0].length - 1;
    let braceCount = 1;
    let endIndex = startIndex + 1;
    while (endIndex < cleaned.length && braceCount > 0) {
      if (cleaned[endIndex] === '{') braceCount++;
      else if (cleaned[endIndex] === '}') braceCount--;
      endIndex++;
    }

    const funcBody = cleaned.slice(startIndex, endIndex);

    // Check if the function name is called inside its own body
    const selfCallRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
    const calls = funcBody.match(selfCallRegex);
    if (calls && calls.length > 0) {
      hasRecursion = true;
      if (calls.length >= 2) {
        isBranchingRecursion = true;
        diagnostics.push(`Multiple recursive branches detected in function \`${funcName}\` (calls: ${calls.length})`);
      } else {
        // Single recursive call
        if (/\/\s*2|\bmid\b|>>\s*1/.test(funcBody)) {
          isDivideAndConquerRecursion = true;
          diagnostics.push(`Divide-and-conquer recursion detected in \`${funcName}\``);
        } else {
          diagnostics.push(`Linear recursion detected in \`${funcName}\``);
        }
      }
    }
  }

  // 3. Detect sorting library calls (e.g. std::sort, qsort)
  const hasSortingCall = /\b(std::sort|qsort|mergeSort|quickSort)\b/.test(cleaned);
  if (hasSortingCall) {
    diagnostics.push('Standard sorting invocation detected (O(n log n))');
  }

  // 4. Analyze Loop Nesting Depth and Stepping Patterns
  let maxLoopDepth = 0;
  let currentLoopDepth = 0;
  const loopStack: number[] = []; // Stores brace depth when each loop started
  let hasLogarithmicLoop = false;

  // Tokenize characters while tracking braces
  let currentBraceDepth = 0;

  // Find occurrences of for, while, do
  const loopTokensRegex = /\b(for|while|do)\b|([{}])/g;
  let tokenMatch: RegExpExecArray | null;

  while ((tokenMatch = loopTokensRegex.exec(cleaned)) !== null) {
    const keyword = tokenMatch[1];
    const brace = tokenMatch[2];

    if (brace === '{') {
      currentBraceDepth++;
    } else if (brace === '}') {
      currentBraceDepth--;
      // Pop loops that ended outside this brace depth
      while (loopStack.length > 0 && loopStack[loopStack.length - 1] >= currentBraceDepth) {
        loopStack.pop();
        currentLoopDepth = loopStack.length;
      }
    } else if (keyword) {
      // It's a loop keyword: check if it's not a do-while's trailing while
      if (keyword === 'while') {
        const precedingText = cleaned.slice(Math.max(0, tokenMatch.index - 20), tokenMatch.index).trim();
        if (precedingText.endsWith('}')) {
          // Likely trailing while in do { } while (...)
          continue;
        }
      }

      // Check header of the loop for logarithmic stepping (e.g., i *= 2, i /= 2, i <<= 1)
      const loopHeader = cleaned.slice(tokenMatch.index, tokenMatch.index + 80);
      if (/\*\s*=\s*2|\/\s*=\s*2|<<\s*=\s*1|>>\s*=\s*1|\/\s*2|\bmid\b/.test(loopHeader)) {
        hasLogarithmicLoop = true;
      }

      loopStack.push(currentBraceDepth);
      currentLoopDepth = loopStack.length;
      if (currentLoopDepth > maxLoopDepth) {
        maxLoopDepth = currentLoopDepth;
      }
    }
  }

  if (maxLoopDepth > 0) {
    diagnostics.push(`Maximum loop nesting depth: ${maxLoopDepth}`);
    if (hasLogarithmicLoop) {
      diagnostics.push('Logarithmic stepping variable detected (*= 2, /= 2)');
    }
  }

  // 5. Determine Big O Time Complexity
  let timeComplexity = 'O(1)';
  let score = 100;
  let label: ComplexityResult['label'] = 'Optimal';
  let badgeColor = 'emerald';
  let reason = 'Constant-time sequential execution without iterative loops or recursion.';

  if (isBranchingRecursion) {
    timeComplexity = 'O(2^n)';
    score = 20;
    label = 'Exponential';
    badgeColor = 'rose';
    reason = 'Multiple recursive branch invocations in the call tree yield exponential O(2^n) time complexity.';
  } else if (maxLoopDepth >= 3) {
    timeComplexity = 'O(n³)';
    score = 40;
    label = 'Heavy';
    badgeColor = 'orange';
    reason = `Triple or deeper nested iterative loops detected (depth: ${maxLoopDepth}), characteristic of cubic O(n³) operations.`;
  } else if (maxLoopDepth === 2) {
    if (hasLogarithmicLoop) {
      timeComplexity = 'O(n log n)';
      score = 80;
      label = 'Efficient';
      badgeColor = 'blue';
      reason = 'Nested loop structure paired with logarithmic index subdivision yields O(n log n) complexity.';
    } else {
      timeComplexity = 'O(n²)';
      score = 60;
      label = 'Moderate';
      badgeColor = 'amber';
      reason = 'Double-nested loop structure detected (depth: 2), characteristic of quadratic O(n²) operations like nested traversals or bubble sorts.';
    }
  } else if (maxLoopDepth === 1) {
    if (hasLogarithmicLoop) {
      timeComplexity = 'O(log n)';
      score = 95;
      label = 'Optimal';
      badgeColor = 'emerald';
      reason = 'Single iterative loop utilizing divide-and-conquer or power-of-two increments yields O(log n) logarithmic time.';
    } else if (hasSortingCall) {
      timeComplexity = 'O(n log n)';
      score = 80;
      label = 'Efficient';
      badgeColor = 'blue';
      reason = 'Iterative loop combined with sorting algorithm yields O(n log n) linearithmic time.';
    } else {
      timeComplexity = 'O(n)';
      score = 85;
      label = 'Efficient';
      badgeColor = 'cyan';
      reason = 'Single iterative traversal loop detected. Scales linearly O(n) with input dataset size.';
    }
  } else if (hasSortingCall) {
    timeComplexity = 'O(n log n)';
    score = 80;
    label = 'Efficient';
    badgeColor = 'blue';
    reason = 'Standard sorting algorithm invocation executes in O(n log n) expected time.';
  } else if (hasRecursion) {
    if (isDivideAndConquerRecursion) {
      timeComplexity = 'O(log n)';
      score = 95;
      label = 'Optimal';
      badgeColor = 'emerald';
      reason = 'Divide-and-conquer recursion halves input size at each step, yielding logarithmic O(log n) time.';
    } else {
      timeComplexity = 'O(n)';
      score = 85;
      label = 'Efficient';
      badgeColor = 'cyan';
      reason = 'Single-branch recursive call sequence scales linearly O(n) with input depth.';
    }
  }

  // 6. Determine Space Complexity
  let spaceComplexity = 'O(1)';
  if (hasDynamicAlloc) {
    spaceComplexity = 'O(n)';
    diagnostics.push('Auxiliary heap allocations require O(n) dynamic memory space');
  } else if (hasRecursion) {
    if (isDivideAndConquerRecursion) {
      spaceComplexity = 'O(log n)';
      diagnostics.push('Recursive call stack depth scales logarithmically O(log n)');
    } else {
      spaceComplexity = 'O(n)';
      diagnostics.push('Linear recursive call stack depth consumes O(n) frame space');
    }
  } else {
    diagnostics.push('Uses fixed scalar variables in constant O(1) stack memory');
  }

  // Map badge styling classes
  const styleMap: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    blue: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
    orange: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400' },
    rose: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
  };

  const styling = styleMap[badgeColor] || styleMap.emerald;

  return {
    timeComplexity,
    spaceComplexity,
    score,
    label,
    badgeColor,
    badgeBg: styling.bg,
    badgeBorder: styling.border,
    badgeText: styling.text,
    reason,
    loopDepth: maxLoopDepth,
    hasRecursion,
    hasDynamicAlloc,
    diagnostics,
  };
}
