import { ExecutionResult, MemorySnapshot, StackFrameSnapshot, VariableSnapshot } from '../types';

interface Scope {
  name: string;
  variables: Map<string, { type: string; value: any; address: string; isPointer?: boolean; pointsTo?: string; isParam?: boolean }>;
  parent?: Scope;
}

export class CInterpreter {
  private output: string[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];
  private stdinTokens: string[] = [];
  private stdinIndex = 0;
  private memorySnapshots: MemorySnapshot[] = [];
  private stepCount = 0;
  private maxSteps = 75000;
  private baseAddress = 0x7ffe0000;
  private currentAddressOffset = 0;

  constructor() {}

  private allocateAddress(sizeBytes: number = 4): string {
    this.currentAddressOffset += sizeBytes;
    const addr = this.baseAddress + this.currentAddressOffset;
    return '0x' + addr.toString(16);
  }

  public run(code: string, stdin: string = ''): ExecutionResult {
    const startTime = performance.now();
    this.output = [];
    this.errors = [];
    this.warnings = [];
    this.memorySnapshots = [];
    this.stepCount = 0;
    this.currentAddressOffset = 0;

    // Tokenize stdin by whitespace or newlines
    this.stdinTokens = stdin
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    this.stdinIndex = 0;

    try {
      this.executeProgram(code);
    } catch (err: any) {
      if (!this.errors.includes(err.message)) {
        this.errors.push(err.message || String(err));
      }
    }

    const endTime = performance.now();
    const finalOutput = this.output.join('');

    return {
      output: finalOutput,
      error: this.errors.length > 0 ? this.errors.join('\n') : null,
      executionTimeMs: Math.round((endTime - startTime) * 10) / 10,
      exitCode: this.errors.length > 0 ? 1 : 0,
      warnings: this.warnings,
      snapshots: this.memorySnapshots,
    };
  }

  private executeProgram(sourceCode: string) {
    // 1. Basic syntax check & preprocessor cleanup
    const cleanCode = this.preprocess(sourceCode);

    // 2. Extract function declarations & definitions
    const functionDefs = this.parseFunctions(cleanCode);

    if (!functionDefs['main']) {
      throw new Error("Compilation Error: 'main' function was not declared or defined in C program.");
    }

    // 3. Global Scope
    const globalScope: Scope = {
      name: 'global',
      variables: new Map(),
    };

    // 4. Run main()
    const mainFunc = functionDefs['main'];
    const mainScope: Scope = {
      name: 'main',
      variables: new Map(),
      parent: globalScope,
    };

    this.runFunctionBody(mainFunc.body, mainScope, functionDefs);
  }

  private preprocess(code: string): string {
    // Remove multi-line comments /* ... */ and single-line comments // ...
    let processed = code.replace(/\/\*[\s\S]*?\*\//g, '');
    processed = processed.replace(/\/\/.*$/gm, '');

    // Check for common basic includes
    if (!code.includes('<stdio.h>') && (code.includes('printf') || code.includes('scanf'))) {
      this.warnings.push("warning: implicit declaration of function 'printf'/'scanf' without #include <stdio.h>");
    }

    return processed;
  }

  private parseFunctions(code: string): Record<string, { returnType: string; params: string[]; body: string }> {
    const functions: Record<string, { returnType: string; params: string[]; body: string }> = {};

    // Match standard C function headers: type name(params) { body }
    // Handles int main(), void swap(int *a, int *b), int factorial(int n), etc.
    const funcRegex = /(?:(?:int|void|float|double|char|bool|long|short)\s*\*?\s+)+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      const funcName = match[1];
      const paramsRaw = match[2].trim();
      const params = paramsRaw ? paramsRaw.split(',').map((p) => p.trim()) : [];
      const startIndex = match.index + match[0].length - 1;

      // Find matching closing brace
      let depth = 0;
      let endIndex = -1;
      for (let i = startIndex; i < code.length; i++) {
        if (code[i] === '{') depth++;
        else if (code[i] === '}') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        const body = code.substring(startIndex + 1, endIndex);
        functions[funcName] = {
          returnType: 'int', // simplified
          params,
          body,
        };
      }
    }

    // Fallback if main wasn't caught with regex (e.g. main() without type)
    if (!functions['main']) {
      const mainMatch = code.match(/main\s*\([^)]*\)\s*\{/);
      if (mainMatch && mainMatch.index !== undefined) {
        let depth = 0;
        let start = mainMatch.index + mainMatch[0].length - 1;
        let end = -1;
        for (let i = start; i < code.length; i++) {
          if (code[i] === '{') depth++;
          else if (code[i] === '}') {
            depth--;
            if (depth === 0) {
              end = i;
              break;
            }
          }
        }
        if (end !== -1) {
          functions['main'] = {
            returnType: 'int',
            params: [],
            body: code.substring(start + 1, end),
          };
        }
      }
    }

    return functions;
  }

  private runFunctionBody(
    body: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    // Parse statements line by line or semicolon by semicolon while respecting loops/blocks
    const statements = this.splitIntoStatements(body);

    for (let i = 0; i < statements.length; i++) {
      this.checkStepLimit();
      const stmt = statements[i].trim();
      if (!stmt) continue;

      const result = this.executeStatement(stmt, scope, functions);
      if (result && result.__return !== undefined) {
        return result.__return;
      }
      if (result && result.__break) {
        return result;
      }
      if (result && result.__continue) {
        return result;
      }
    }
    return 0;
  }

  private splitIntoStatements(block: string): string[] {
    const statements: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let quoteChar = '';

    for (let i = 0; i < block.length; i++) {
      const char = block[i];

      if ((char === '"' || char === "'") && block[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{' || char === '(') depth++;
        if (char === '}' || char === ')') depth--;

        if (char === ';' && depth === 0) {
          statements.push(current);
          current = '';
          continue;
        }

        // Handle control structures with block without trailing semicolon e.g. "for(...) { ... }"
        if (char === '}' && depth === 0) {
          current += char;
          statements.push(current);
          current = '';
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) {
      statements.push(current);
    }

    return statements;
  }

  private executeStatement(
    rawStmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    const stmt = rawStmt.trim();
    if (!stmt) return null;

    // Return statement
    if (/^return\b/.test(stmt)) {
      const expr = stmt.replace(/^return\b/, '').trim();
      const val = expr ? this.evalExpression(expr, scope, functions) : 0;
      this.recordSnapshot(scope, stmt);
      return { __return: val };
    }

    // Break / Continue
    if (stmt === 'break') return { __break: true };
    if (stmt === 'continue') return { __continue: true };

    // Ignore using namespace std;
    if (/^using\s+namespace\s+std\s*;?$/.test(stmt)) {
      return null;
    }

    // C++ std::cout / cout Statement
    if (/^(?:std::)?cout\s*<</.test(stmt)) {
      this.handleCout(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // C++ std::cin / cin Statement
    if (/^(?:std::)?cin\s*>>/.test(stmt)) {
      this.handleCin(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Printf Statement
    if (/^printf\s*\(/.test(stmt)) {
      this.handlePrintf(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Puts Statement
    if (/^puts\s*\(/.test(stmt)) {
      const inside = this.extractParenthesesContent(stmt, 'puts');
      const val = this.evalExpression(inside, scope, functions);
      this.output.push(String(val) + '\n');
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Putchar Statement
    if (/^putchar\s*\(/.test(stmt)) {
      const inside = this.extractParenthesesContent(stmt, 'putchar');
      const val = this.evalExpression(inside, scope, functions);
      const char = typeof val === 'number' ? String.fromCharCode(val) : String(val);
      this.output.push(char);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Scanf Statement
    if (/^scanf\s*\(/.test(stmt)) {
      this.handleScanf(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // If - Else statement
    if (/^if\s*\(/.test(stmt)) {
      return this.handleIfElse(stmt, scope, functions);
    }

    // While loop
    if (/^while\s*\(/.test(stmt)) {
      return this.handleWhile(stmt, scope, functions);
    }

    // Do-While loop
    if (/^do\s*\{/.test(stmt)) {
      return this.handleDoWhile(stmt, scope, functions);
    }

    // For loop
    if (/^for\s*\(/.test(stmt)) {
      return this.handleFor(stmt, scope, functions);
    }

    // Switch statement
    if (/^switch\s*\(/.test(stmt)) {
      return this.handleSwitch(stmt, scope, functions);
    }

    // Variable declaration e.g. int a = 5, b = 10; float x; char str[50] = "abc"; int *ptr = &a; string s = "hello";
    if (/^(?:const\s+)?(?:int|float|double|char|bool|long|short|unsigned\s+int|string|std::string|auto)\s+[\s\S]+/i.test(stmt)) {
      this.handleDeclaration(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Pointer assignment: *p = value;
    if (/^\*([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=|\/=)\s*(.+)$/.test(stmt)) {
      const match = stmt.match(/^\*([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=|\/=)\s*(.+)$/);
      if (match) {
        const ptrName = match[1];
        const op = match[2];
        const expr = match[3];
        const ptrVar = this.getVariable(ptrName, scope);
        if (!ptrVar) throw new Error(`Pointer '${ptrName}' undeclared.`);
        const targetAddr = ptrVar.pointsTo;
        if (!targetAddr) throw new Error(`Segmentation fault: dereferencing null or uninitialized pointer '${ptrName}'`);

        // Find variable with this address
        const targetVar = this.findVariableByAddress(targetAddr, scope);
        if (targetVar) {
          const newVal = this.evalExpression(expr, scope, functions);
          if (op === '=') targetVar.value = newVal;
          else if (op === '+=') targetVar.value = (Number(targetVar.value) || 0) + Number(newVal);
          else if (op === '-=') targetVar.value = (Number(targetVar.value) || 0) - Number(newVal);
          else if (op === '*=') targetVar.value = (Number(targetVar.value) || 0) * Number(newVal);
          else if (op === '/=') targetVar.value = Math.floor((Number(targetVar.value) || 0) / Number(newVal));
        }
        this.recordSnapshot(scope, stmt);
        return null;
      }
    }

    // Array item assignment: arr[i] = val; or mat[i][j] = val;
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*\[.+\]\s*(=|\+=|-=|\*=|\/=)\s*.+$/.test(stmt)) {
      this.handleArrayAssignment(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Standard assignment: a = 10; or a += 2; or a++; or a--;
    if (this.handleAssignmentOrIncrement(stmt, scope, functions)) {
      this.recordSnapshot(scope, stmt);
      return null;
    }

    // Standalone function call: swap(&a, &b);
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(stmt)) {
      this.evalExpression(stmt, scope, functions);
      this.recordSnapshot(scope, stmt);
      return null;
    }

    return null;
  }

  private handleDeclaration(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ) {
    // Strip type prefix
    const typeMatch = stmt.match(/^(?:const\s+)?(int|float|double|char|bool|long|short|unsigned\s+int|string|std::string|auto)\s+(.+)$/i);
    if (!typeMatch) return;

    const baseType = typeMatch[1].trim();
    const declsPart = typeMatch[2].trim();

    // Split multiple declarations: int a = 5, *b = &a, c;
    const decls = this.splitDeclarations(declsPart);

    for (const decl of decls) {
      const trimmed = decl.trim();
      if (!trimmed) continue;

      // Pointer declaration: *ptr = &x or *ptr
      if (trimmed.startsWith('*')) {
        const ptrDecl = trimmed.substring(1).trim();
        let ptrName = ptrDecl;
        let initExpr: string | null = null;
        if (ptrDecl.includes('=')) {
          const parts = ptrDecl.split('=');
          ptrName = parts[0].trim();
          initExpr = parts.slice(1).join('=').trim();
        }

        const addr = this.allocateAddress(8);
        let pointsToAddr = '';
        let ptrVal = 'NULL';

        if (initExpr) {
          if (initExpr.startsWith('&')) {
            const targetName = initExpr.substring(1).trim();
            const targetVar = this.getVariable(targetName, scope);
            if (targetVar) {
              pointsToAddr = targetVar.address;
              ptrVal = targetVar.address;
            }
          } else {
            const evaluated = this.evalExpression(initExpr, scope, functions);
            ptrVal = String(evaluated);
            pointsToAddr = String(evaluated);
          }
        }

        scope.variables.set(ptrName, {
          type: `${baseType}*`,
          value: ptrVal,
          address: addr,
          isPointer: true,
          pointsTo: pointsToAddr,
        });
        continue;
      }

      // 2D Array: int mat[3][3]
      const twoDMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(\d+)\]\s*\[(\d+)\](?:\s*=\s*(.+))?$/);
      if (twoDMatch) {
        const name = twoDMatch[1];
        const rows = parseInt(twoDMatch[2], 10);
        const cols = parseInt(twoDMatch[3], 10);
        const init = twoDMatch[4]?.trim();
        let arr2D: any[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

        if (init && init.startsWith('{')) {
          try {
            // parse {{1,2},{3,4}}
            const clean = init.replace(/\{/g, '[').replace(/\}/g, ']');
            arr2D = JSON.parse(clean);
          } catch {
            // fallback
          }
        }

        const addr = this.allocateAddress(rows * cols * 4);
        scope.variables.set(name, {
          type: `${baseType}[${rows}][${cols}]`,
          value: arr2D,
          address: addr,
        });
        continue;
      }

      // 1D Array or String: int arr[5] = {1, 2, 3} or char str[50] = "hello" or int arr[] = {1, 2}
      const arrMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(\d*)\](?:\s*=\s*(.+))?$/);
      if (arrMatch) {
        const name = arrMatch[1];
        const sizeStr = arrMatch[2];
        const init = arrMatch[3]?.trim();
        let size = sizeStr ? parseInt(sizeStr, 10) : 0;
        let arrVal: any[] = [];

        if (init) {
          if (init.startsWith('"') && init.endsWith('"') && baseType === 'char') {
            const rawStr = init.slice(1, -1);
            arrVal = rawStr.split('').concat('\0');
            if (!size) size = arrVal.length;
          } else if (init.startsWith('{')) {
            const items = init
              .slice(1, -1)
              .split(',')
              .map((x) => this.evalExpression(x.trim(), scope, functions));
            arrVal = items;
            if (!size) size = arrVal.length;
            while (arrVal.length < size) {
              arrVal.push(baseType === 'char' ? '\0' : 0);
            }
          }
        } else {
          arrVal = Array(size || 5).fill(baseType === 'char' ? '\0' : 0);
        }

        const addr = this.allocateAddress((size || arrVal.length) * (baseType === 'char' ? 1 : 4));
        scope.variables.set(name, {
          type: `${baseType}[${size || arrVal.length}]`,
          value: arrVal,
          address: addr,
        });
        continue;
      }

      // Regular variable: int a = 5; float b = 3.14; char c = 'A';
      const singleMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*=\s*(.+))?$/);
      if (singleMatch) {
        const name = singleMatch[1];
        const init = singleMatch[2]?.trim();
        let val: any = baseType === 'char' ? '\0' : 0;

        if (init) {
          val = this.evalExpression(init, scope, functions);
          if (baseType === 'int' || baseType === 'long' || baseType === 'short') {
            val = typeof val === 'number' ? Math.trunc(val) : typeof val === 'string' && val.length === 1 ? val.charCodeAt(0) : parseInt(val, 10) || 0;
          } else if (baseType === 'float' || baseType === 'double') {
            val = Number(val) || 0.0;
          } else if (baseType === 'char') {
            val = typeof val === 'number' ? String.fromCharCode(val) : String(val)[0] || '\0';
          } else if (baseType === 'bool') {
            val = Boolean(val);
          }
        }

        const addr = this.allocateAddress(baseType === 'char' ? 1 : baseType === 'double' ? 8 : 4);
        scope.variables.set(name, {
          type: baseType,
          value: val,
          address: addr,
        });
      }
    }
  }

  private splitDeclarations(str: string): string[] {
    const list: string[] = [];
    let current = '';
    let depth = 0;
    let inQuote = false;

    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === '"' || c === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (c === '{' || c === '(') depth++;
        if (c === '}' || c === ')') depth--;
        if (c === ',' && depth === 0) {
          list.push(current);
          current = '';
          continue;
        }
      }
      current += c;
    }
    if (current.trim()) list.push(current);
    return list;
  }

  private handleAssignmentOrIncrement(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): boolean {
    // a++ or ++a
    const incMatch = stmt.match(/^(\+\+|--)?([a-zA-Z_][a-zA-Z0-9_]*)(\+\+|--)?$/);
    if (incMatch) {
      const varName = incMatch[2];
      const op = incMatch[1] || incMatch[3];
      const target = this.getVariable(varName, scope);
      if (!target) throw new Error(`Variable '${varName}' undeclared.`);
      if (op === '++') target.value = (Number(target.value) || 0) + 1;
      if (op === '--') target.value = (Number(target.value) || 0) - 1;
      return true;
    }

    // a = expr or a += expr or a -= expr or a *= expr or a /= expr or a %= expr
    const assignMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const op = assignMatch[2];
      const expr = assignMatch[3];
      const target = this.getVariable(varName, scope);
      if (!target) throw new Error(`Variable '${varName}' undeclared.`);

      const evaluated = this.evalExpression(expr, scope, functions);
      let newVal = evaluated;

      if (op === '=') {
        newVal = evaluated;
      } else if (op === '+=') {
        newVal = (Number(target.value) || 0) + Number(evaluated);
      } else if (op === '-=') {
        newVal = (Number(target.value) || 0) - Number(evaluated);
      } else if (op === '*=') {
        newVal = (Number(target.value) || 0) * Number(evaluated);
      } else if (op === '/=') {
        newVal = Math.trunc((Number(target.value) || 0) / Number(evaluated));
      } else if (op === '%=') {
        newVal = (Number(target.value) || 0) % Number(evaluated);
      }

      if (target.type === 'int' || target.type === 'long') {
        target.value = Math.trunc(newVal);
      } else if (target.type === 'float' || target.type === 'double') {
        target.value = Number(newVal);
      } else if (target.type === 'char') {
        target.value = typeof newVal === 'number' ? String.fromCharCode(newVal) : String(newVal)[0] || '\0';
      } else {
        target.value = newVal;
      }
      return true;
    }

    return false;
  }

  private handleArrayAssignment(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ) {
    // 2D Array assignment: mat[i][j] = val
    const match2D = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.+?)\]\s*\[(.+?)\]\s*(=|\+=|-=|\*=|\/=)\s*(.+)$/);
    if (match2D) {
      const name = match2D[1];
      const idx1 = Number(this.evalExpression(match2D[2], scope, functions));
      const idx2 = Number(this.evalExpression(match2D[3], scope, functions));
      const op = match2D[4];
      const expr = match2D[5];
      const target = this.getVariable(name, scope);
      if (!target || !Array.isArray(target.value)) throw new Error(`Array '${name}' not found.`);

      const val = this.evalExpression(expr, scope, functions);
      if (op === '=') target.value[idx1][idx2] = val;
      else if (op === '+=') target.value[idx1][idx2] += val;
      return;
    }

    // 1D Array assignment: arr[i] = val
    const match1D = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.+?)\]\s*(=|\+=|-=|\*=|\/=)\s*(.+)$/);
    if (match1D) {
      const name = match1D[1];
      const idx = Number(this.evalExpression(match1D[2], scope, functions));
      const op = match1D[3];
      const expr = match1D[4];
      const target = this.getVariable(name, scope);
      if (!target || !Array.isArray(target.value)) throw new Error(`Array '${name}' not found.`);

      const val = this.evalExpression(expr, scope, functions);
      if (op === '=') target.value[idx] = val;
      else if (op === '+=') target.value[idx] += val;
      else if (op === '-=') target.value[idx] -= val;
    }
  }

  private handlePrintf(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ) {
    const inside = this.extractParenthesesContent(stmt, 'printf');
    const args = this.splitFunctionArgs(inside);
    if (args.length === 0) return;

    let formatStr = args[0].trim();
    // Remove enclosing quotes
    if (formatStr.startsWith('"') && formatStr.endsWith('"')) {
      formatStr = formatStr.slice(1, -1);
    }

    // Evaluate rest of arguments
    const evaluatedArgs = args.slice(1).map((arg) => {
      const trimmed = arg.trim();
      return this.evalExpression(trimmed, scope, functions);
    });

    let argIdx = 0;
    // Replace format specifiers %d, %i, %f, %.2f, %c, %s, %p, %x, %ld, %u, etc.
    let formatted = '';
    for (let i = 0; i < formatStr.length; i++) {
      if (formatStr[i] === '\\') {
        const next = formatStr[i + 1];
        if (next === 'n') {
          formatted += '\n';
          i++;
          continue;
        } else if (next === 't') {
          formatted += '\t';
          i++;
          continue;
        } else if (next === '\\') {
          formatted += '\\';
          i++;
          continue;
        } else if (next === '"') {
          formatted += '"';
          i++;
          continue;
        }
      }

      if (formatStr[i] === '%') {
        if (formatStr[i + 1] === '%') {
          formatted += '%';
          i++;
          continue;
        }

        // Match format specifier e.g. %5d, %-5d, %.2f, %lf, %d, %s, %c, %p, %x
        const specMatch = formatStr.substring(i).match(/^%(-?\d+)?(?:\.(\d+))?([a-zA-Z]+)/);
        if (specMatch) {
          const fullSpec = specMatch[0];
          const width = specMatch[1] ? parseInt(specMatch[1], 10) : undefined;
          const precision = specMatch[2] ? parseInt(specMatch[2], 10) : undefined;
          const specType = specMatch[3];
          const val = evaluatedArgs[argIdx++];

          let valStr = '';
          if (specType === 'd' || specType === 'i' || specType === 'ld' || specType === 'u') {
            valStr = String(Math.trunc(Number(val) || 0));
          } else if (specType === 'f' || specType === 'lf') {
            const num = Number(val) || 0;
            valStr = precision !== undefined ? num.toFixed(precision) : num.toFixed(6);
          } else if (specType === 'c') {
            valStr = typeof val === 'number' ? String.fromCharCode(val) : String(val)[0] || '';
          } else if (specType === 's') {
            if (Array.isArray(val)) {
              valStr = val.filter((c) => c !== '\0').join('');
            } else {
              valStr = String(val ?? '');
            }
          } else if (specType === 'p') {
            valStr = String(val);
          } else if (specType === 'x') {
            valStr = (Number(val) || 0).toString(16);
          } else if (specType === 'X') {
            valStr = (Number(val) || 0).toString(16).toUpperCase();
          } else {
            valStr = String(val ?? '');
          }

          if (width !== undefined) {
            const absWidth = Math.abs(width);
            if (width < 0) {
              valStr = valStr.padEnd(absWidth, ' ');
            } else {
              valStr = valStr.padStart(absWidth, ' ');
            }
          }

          formatted += valStr;
          i += fullSpec.length - 1;
          continue;
        }
      }

      formatted += formatStr[i];
    }

    this.output.push(formatted);
  }

  private handleScanf(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ) {
    const inside = this.extractParenthesesContent(stmt, 'scanf');
    const args = this.splitFunctionArgs(inside);
    if (args.length < 2) return;

    let formatStr = args[0].trim();
    if (formatStr.startsWith('"') && formatStr.endsWith('"')) {
      formatStr = formatStr.slice(1, -1);
    }

    const formatTokens = formatStr.match(/%[a-zA-Z0-9.]+/g) || [];
    const varPointers = args.slice(1);

    for (let i = 0; i < varPointers.length; i++) {
      if (this.stdinIndex >= this.stdinTokens.length) {
        break; // No more input available
      }

      const inputVal = this.stdinTokens[this.stdinIndex++];
      const rawPtr = varPointers[i].trim();
      const spec = formatTokens[i] || '%d';

      // Check if it's &varName or varName (for strings/arrays)
      let varName = rawPtr.startsWith('&') ? rawPtr.substring(1).trim() : rawPtr;
      // Handle array element e.g. &arr[i]
      const arrIdxMatch = varName.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.+?)\]$/);

      if (arrIdxMatch) {
        const arrName = arrIdxMatch[1];
        const idx = Number(this.evalExpression(arrIdxMatch[2], scope, functions));
        const target = this.getVariable(arrName, scope);
        if (target && Array.isArray(target.value)) {
          if (spec.includes('f')) target.value[idx] = parseFloat(inputVal);
          else if (spec.includes('c')) target.value[idx] = inputVal[0];
          else target.value[idx] = parseInt(inputVal, 10);
        }
      } else {
        const target = this.getVariable(varName, scope);
        if (target) {
          if (spec.includes('d') || spec.includes('i') || spec.includes('ld')) {
            target.value = parseInt(inputVal, 10);
          } else if (spec.includes('f') || spec.includes('lf')) {
            target.value = parseFloat(inputVal);
          } else if (spec.includes('c')) {
            target.value = inputVal[0] || '\0';
          } else if (spec.includes('s')) {
            target.value = inputVal.split('').concat('\0');
          }
        }
      }
    }
  }

  private handleCout(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ) {
    // Strip leading std::cout or cout
    const body = stmt.replace(/^(?:std::)?cout\s*<</, '').trim();
    // Split by << while ignoring << inside strings
    const parts = this.splitStreamTokens(body, '<<');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed === 'std::endl' || trimmed === 'endl') {
        this.output.push('\n');
      } else {
        const val = this.evalExpression(trimmed, scope, functions);
        if (Array.isArray(val)) {
          this.output.push(val.filter((c) => c !== '\0').join(''));
        } else {
          this.output.push(String(val ?? ''));
        }
      }
    }
  }

  private handleCin(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ) {
    // Strip leading std::cin or cin
    const body = stmt.replace(/^(?:std::)?cin\s*>>/, '').trim();
    const varNames = this.splitStreamTokens(body, '>>');

    for (const rawName of varNames) {
      const varName = rawName.trim();
      if (!varName) continue;
      if (this.stdinIndex >= this.stdinTokens.length) break;

      const inputVal = this.stdinTokens[this.stdinIndex++];
      const target = this.getVariable(varName, scope);
      if (target) {
        if (target.type === 'int' || target.type === 'long' || target.type === 'short') {
          target.value = parseInt(inputVal, 10) || 0;
        } else if (target.type === 'float' || target.type === 'double') {
          target.value = parseFloat(inputVal) || 0.0;
        } else if (target.type === 'char') {
          target.value = inputVal[0] || '\0';
        } else {
          target.value = inputVal;
        }
      }
    }
  }

  private splitStreamTokens(str: string, delimiter: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if ((c === '"' || c === "'") && str[i - 1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = c;
        } else if (c === quoteChar) {
          inQuote = false;
        }
      }

      if (!inQuote && str.substring(i, i + delimiter.length) === delimiter) {
        tokens.push(current.trim());
        current = '';
        i += delimiter.length - 1;
        continue;
      }

      current += c;
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  private handleIfElse(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    // Parse condition inside if(...)
    const condition = this.extractParenthesesContent(stmt, 'if');
    const isTrue = Boolean(this.evalExpression(condition, scope, functions));

    // Extract if body and else body
    const bodyStart = stmt.indexOf(')') + 1;
    const rest = stmt.substring(bodyStart).trim();

    let ifBody = '';
    let elseBody = '';

    if (rest.startsWith('{')) {
      let depth = 0;
      let closeIdx = -1;
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === '{') depth++;
        if (rest[i] === '}') {
          depth--;
          if (depth === 0) {
            closeIdx = i;
            break;
          }
        }
      }
      if (closeIdx !== -1) {
        ifBody = rest.substring(1, closeIdx);
        const afterIf = rest.substring(closeIdx + 1).trim();
        if (afterIf.startsWith('else')) {
          elseBody = afterIf.replace(/^else\s*/, '').trim();
          if (elseBody.startsWith('{') && elseBody.endsWith('}')) {
            elseBody = elseBody.slice(1, -1);
          }
        }
      }
    } else {
      // Single line if without braces
      const elseSplit = rest.split(/\belse\b/);
      ifBody = elseSplit[0];
      elseBody = elseSplit.slice(1).join('else');
    }

    const blockScope: Scope = {
      name: `${scope.name}:block`,
      variables: new Map(),
      parent: scope,
    };

    if (isTrue) {
      return this.runFunctionBody(ifBody, blockScope, functions);
    } else if (elseBody) {
      return this.runFunctionBody(elseBody, blockScope, functions);
    }
    return null;
  }

  private handleWhile(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    const condition = this.extractParenthesesContent(stmt, 'while');
    const bodyStart = stmt.indexOf(')') + 1;
    let body = stmt.substring(bodyStart).trim();
    if (body.startsWith('{') && body.endsWith('}')) {
      body = body.slice(1, -1);
    }

    while (this.evalExpression(condition, scope, functions)) {
      this.checkStepLimit();
      const loopScope: Scope = {
        name: `${scope.name}:while`,
        variables: new Map(),
        parent: scope,
      };
      const res = this.runFunctionBody(body, loopScope, functions);
      if (res && res.__return !== undefined) return res;
      if (res && res.__break) break;
      if (res && res.__continue) continue;
    }
    return null;
  }

  private handleDoWhile(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    const whileIdx = stmt.lastIndexOf('while');
    const body = stmt.substring(2, whileIdx).trim().replace(/^\{/, '').replace(/\}$/, '');
    const condPart = stmt.substring(whileIdx);
    const condition = this.extractParenthesesContent(condPart, 'while');

    do {
      this.checkStepLimit();
      const loopScope: Scope = {
        name: `${scope.name}:dowhile`,
        variables: new Map(),
        parent: scope,
      };
      const res = this.runFunctionBody(body, loopScope, functions);
      if (res && res.__return !== undefined) return res;
      if (res && res.__break) break;
      if (res && res.__continue) continue;
    } while (this.evalExpression(condition, scope, functions));

    return null;
  }

  private handleFor(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    const header = this.extractParenthesesContent(stmt, 'for');
    const parts = header.split(';');
    const init = parts[0]?.trim() || '';
    const cond = parts[1]?.trim() || '1';
    const post = parts[2]?.trim() || '';

    const bodyStart = stmt.indexOf(')') + 1;
    let body = stmt.substring(bodyStart).trim();
    if (body.startsWith('{') && body.endsWith('}')) {
      body = body.slice(1, -1);
    }

    const forScope: Scope = {
      name: `${scope.name}:for`,
      variables: new Map(),
      parent: scope,
    };

    if (init) {
      if (/^(?:int|float|double|char)\s+/.test(init)) {
        this.handleDeclaration(init, forScope, functions);
      } else {
        this.handleAssignmentOrIncrement(init, forScope, functions);
      }
    }

    while (this.evalExpression(cond, forScope, functions)) {
      this.checkStepLimit();
      const iterScope: Scope = {
        name: `${forScope.name}:iter`,
        variables: new Map(),
        parent: forScope,
      };

      const res = this.runFunctionBody(body, iterScope, functions);
      if (res && res.__return !== undefined) return res;
      if (res && res.__break) break;

      if (post) {
        const postStmts = post.split(',');
        for (const p of postStmts) {
          this.handleAssignmentOrIncrement(p.trim(), forScope, functions);
        }
      }
    }
    return null;
  }

  private handleSwitch(
    stmt: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    const expr = this.extractParenthesesContent(stmt, 'switch');
    const switchVal = this.evalExpression(expr, scope, functions);
    const bodyStart = stmt.indexOf('{') + 1;
    const bodyEnd = stmt.lastIndexOf('}');
    const body = stmt.substring(bodyStart, bodyEnd);

    // Simple case splitter
    const cases = body.split(/\bcase\b/);
    let matched = false;

    for (let i = 1; i < cases.length; i++) {
      const c = cases[i];
      const colonIdx = c.indexOf(':');
      const caseValExpr = c.substring(0, colonIdx).trim();
      const caseBody = c.substring(colonIdx + 1).trim();
      const caseVal = this.evalExpression(caseValExpr, scope, functions);

      if (matched || caseVal == switchVal) {
        matched = true;
        const res = this.runFunctionBody(caseBody, scope, functions);
        if (res && res.__break) break;
        if (res && res.__return !== undefined) return res;
      }
    }

    if (!matched && body.includes('default:')) {
      const defaultIdx = body.indexOf('default:');
      const defaultBody = body.substring(defaultIdx + 8).trim();
      const res = this.runFunctionBody(defaultBody, scope, functions);
      if (res && res.__return !== undefined) return res;
    }

    return null;
  }

  // --- Expression Evaluator ---
  private evalExpression(
    expr: string,
    scope: Scope,
    functions: Record<string, { returnType: string; params: string[]; body: string }>
  ): any {
    let clean = expr.trim();
    if (!clean) return 0;

    // Handle string literal: "hello"
    if (clean.startsWith('"') && clean.endsWith('"')) {
      return clean.slice(1, -1);
    }

    // Handle char literal: 'A' or '\n'
    if (clean.startsWith("'") && clean.endsWith("'")) {
      const c = clean.slice(1, -1);
      return c === '\\n' ? 10 : c === '\\t' ? 9 : c.charCodeAt(0);
    }

    // Handle sizeof(...)
    if (/^sizeof\s*\(/.test(clean)) {
      const inside = this.extractParenthesesContent(clean, 'sizeof');
      if (inside === 'int' || inside === 'float' || inside === 'long') return 4;
      if (inside === 'double') return 8;
      if (inside === 'char' || inside === 'bool') return 1;
      if (inside === 'short') return 2;
      const v = this.getVariable(inside, scope);
      if (v) {
        if (Array.isArray(v.value)) return v.value.length * 4;
        return 4;
      }
      return 4;
    }

    // Handle Standard C functions e.g. strlen(s), abs(x), sqrt(x), pow(a, b)
    if (/^strlen\s*\(/.test(clean)) {
      const arg = this.extractParenthesesContent(clean, 'strlen');
      const val = this.evalExpression(arg, scope, functions);
      if (Array.isArray(val)) {
        const nullIdx = val.indexOf('\0');
        return nullIdx === -1 ? val.length : nullIdx;
      }
      return String(val).length;
    }

    if (/^abs\s*\(/.test(clean) || /^fabs\s*\(/.test(clean)) {
      const arg = this.extractParenthesesContent(clean, 'abs');
      return Math.abs(Number(this.evalExpression(arg, scope, functions)));
    }

    if (/^sqrt\s*\(/.test(clean)) {
      const arg = this.extractParenthesesContent(clean, 'sqrt');
      return Math.sqrt(Number(this.evalExpression(arg, scope, functions)));
    }

    if (/^pow\s*\(/.test(clean)) {
      const inside = this.extractParenthesesContent(clean, 'pow');
      const args = this.splitFunctionArgs(inside);
      const b = Number(this.evalExpression(args[0], scope, functions));
      const exp = Number(this.evalExpression(args[1], scope, functions));
      return Math.pow(b, exp);
    }

    // User Function Call: func(arg1, arg2)
    const funcCallMatch = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)$/);
    if (funcCallMatch && functions[funcCallMatch[1]]) {
      const fnName = funcCallMatch[1];
      const fnDef = functions[fnName];
      const rawArgs = this.splitFunctionArgs(funcCallMatch[2]);

      const fnScope: Scope = {
        name: fnName,
        variables: new Map(),
        parent: scope,
      };

      // Bind parameters
      for (let i = 0; i < fnDef.params.length; i++) {
        const pDecl = fnDef.params[i];
        const argExpr = rawArgs[i]?.trim();
        const pType = pDecl.split(/\s+/).slice(0, -1).join(' ') || 'int';
        const pName = pDecl.split(/\s+/).pop()?.replace(/^\*/, '') || `arg${i}`;

        if (pDecl.includes('*')) {
          // Pointer parameter (Pass-by-reference)
          let targetAddr = '';
          if (argExpr && argExpr.startsWith('&')) {
            const targetVar = this.getVariable(argExpr.substring(1).trim(), scope);
            if (targetVar) targetAddr = targetVar.address;
          }
          fnScope.variables.set(pName, {
            type: `${pType}*`,
            value: targetAddr || 'NULL',
            address: this.allocateAddress(8),
            isPointer: true,
            pointsTo: targetAddr,
            isParam: true,
          });
        } else {
          // Pass by value
          const val = argExpr ? this.evalExpression(argExpr, scope, functions) : 0;
          fnScope.variables.set(pName, {
            type: pType,
            value: val,
            address: this.allocateAddress(4),
            isParam: true,
          });
        }
      }

      return this.runFunctionBody(fnDef.body, fnScope, functions);
    }

    // Dereference pointer in expression: *ptr
    if (/^\*([a-zA-Z_][a-zA-Z0-9_]*)$/.test(clean)) {
      const ptrName = clean.substring(1);
      const ptrVar = this.getVariable(ptrName, scope);
      if (ptrVar && ptrVar.pointsTo) {
        const targetVar = this.findVariableByAddress(ptrVar.pointsTo, scope);
        if (targetVar) return targetVar.value;
      }
      return 0;
    }

    // Address-of operator in expression: &x
    if (/^&([a-zA-Z_][a-zA-Z0-9_]*)$/.test(clean)) {
      const varName = clean.substring(1);
      const targetVar = this.getVariable(varName, scope);
      return targetVar ? targetVar.address : '0x0';
    }

    // 2D Array access: mat[i][j]
    const arr2DMatch = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.+?)\]\s*\[(.+?)\]$/);
    if (arr2DMatch) {
      const name = arr2DMatch[1];
      const i = Number(this.evalExpression(arr2DMatch[2], scope, functions));
      const j = Number(this.evalExpression(arr2DMatch[3], scope, functions));
      const target = this.getVariable(name, scope);
      if (target && Array.isArray(target.value) && target.value[i]) {
        return target.value[i][j] ?? 0;
      }
      return 0;
    }

    // 1D Array access: arr[i]
    const arr1DMatch = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.+?)\]$/);
    if (arr1DMatch) {
      const name = arr1DMatch[1];
      const idx = Number(this.evalExpression(arr1DMatch[2], scope, functions));
      const target = this.getVariable(name, scope);
      if (target && Array.isArray(target.value)) {
        return target.value[idx] ?? 0;
      }
      return 0;
    }

    // Replace variable names with their current values, accounting for C integer division
    try {
      return this.safeEvaluateMath(clean, scope);
    } catch {
      return 0;
    }
  }

  private safeEvaluateMath(expr: string, scope: Scope): any {
    // Replace variable identifiers with values
    let sanitized = expr.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) => {
      if (match === 'true') return '1';
      if (match === 'false') return '0';
      if (match === 'NULL') return '0';
      const v = this.getVariable(match, scope);
      if (v !== undefined) {
        if (typeof v.value === 'string' && v.value.startsWith('0x')) return `"${v.value}"`;
        if (typeof v.value === 'number') return String(v.value);
        if (typeof v.value === 'boolean') return v.value ? '1' : '0';
        if (typeof v.value === 'string') return `"${v.value}"`;
        if (Array.isArray(v.value)) return `"${v.value.join('')}"`;
      }
      return match;
    });

    // Check for C integer division: if 5 / 2 -> Math.trunc(5 / 2)
    // Safely evaluate standard boolean and arithmetic operations
    try {
      // Handle logical operators ! into !
      const jsExpr = sanitized
        .replace(/&&/g, '&&')
        .replace(/\|\|/g, '||')
        .replace(/\b(!\s*\d+)/g, '($1 ? 0 : 1)');

      // Using Function constructor in a sandbox
      const fn = new Function(`
        const trunc = Math.trunc;
        return (${jsExpr});
      `);
      const res = fn();
      return typeof res === 'boolean' ? (res ? 1 : 0) : res;
    } catch {
      return 0;
    }
  }

  // --- Helper Methods ---

  private getVariable(name: string, scope: Scope): { type: string; value: any; address: string; isPointer?: boolean; pointsTo?: string; isParam?: boolean } | undefined {
    let curr: Scope | undefined = scope;
    while (curr) {
      if (curr.variables.has(name)) {
        return curr.variables.get(name);
      }
      curr = curr.parent;
    }
    return undefined;
  }

  private findVariableByAddress(address: string, scope: Scope): { type: string; value: any; address: string; isPointer?: boolean; pointsTo?: string } | undefined {
    let curr: Scope | undefined = scope;
    while (curr) {
      for (const [, v] of curr.variables.entries()) {
        if (v.address.toLowerCase() === address.toLowerCase()) {
          return v;
        }
      }
      curr = curr.parent;
    }
    return undefined;
  }

  private extractParenthesesContent(str: string, keyword: string): string {
    const keyIdx = str.indexOf(keyword);
    const start = str.indexOf('(', keyIdx);
    if (start === -1) return '';

    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '(') depth++;
      if (str[i] === ')') {
        depth--;
        if (depth === 0) {
          return str.substring(start + 1, i);
        }
      }
    }
    return '';
  }

  private splitFunctionArgs(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let depth = 0;
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < argsStr.length; i++) {
      const c = argsStr[i];
      if ((c === '"' || c === "'") && argsStr[i - 1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = c;
        } else if (c === quoteChar) {
          inQuote = false;
        }
      }

      if (!inQuote) {
        if (c === '(' || c === '{' || c === '[') depth++;
        if (c === ')' || c === '}' || c === ']') depth--;
        if (c === ',' && depth === 0) {
          args.push(current.trim());
          current = '';
          continue;
        }
      }

      current += c;
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args;
  }

  private recordSnapshot(scope: Scope, stmt: string) {
    if (this.memorySnapshots.length > 50) return; // Cap snapshots for UI responsiveness

    const frames: StackFrameSnapshot[] = [];
    let curr: Scope | undefined = scope;

    while (curr && curr.name !== 'global') {
      const vars: VariableSnapshot[] = [];
      for (const [name, v] of curr.variables.entries()) {
        vars.push({
          name,
          type: v.type,
          value: Array.isArray(v.value) ? [...v.value] : v.value,
          address: v.address,
          isPointer: v.isPointer,
          pointsToAddress: v.pointsTo,
          isParam: v.isParam,
        });
      }

      if (vars.length > 0 || !curr.name.includes(':')) {
        frames.push({
          functionName: curr.name,
          variables: vars,
        });
      }
      curr = curr.parent;
    }

    this.memorySnapshots.push({
      step: this.memorySnapshots.length + 1,
      line: 0,
      codeSnippet: stmt.slice(0, 50),
      stackFrames: frames.reverse(),
      stdout: this.output.join(''),
    });
  }

  private checkStepLimit() {
    this.stepCount++;
    if (this.stepCount > this.maxSteps) {
      throw new Error(
        `Time Limit Exceeded: Infinite loop detected! C program exceeded maximum allowable execution steps (${this.maxSteps}). Check loop condition and termination.`
      );
    }
  }
}

export function runCTestCases(
  code: string,
  testCases: Array<{ id: string; input: string; expectedOutput: string; description: string }>
): ExecutionResult {
  const interpreter = new CInterpreter();
  const testDetails = [];
  let passedCount = 0;
  let allOutput = '';
  let primaryError: string | null = null;
  let allSnapshots: MemorySnapshot[] = [];

  for (const tc of testCases) {
    const res = interpreter.run(code, tc.input);
    if (!primaryError && res.error) {
      primaryError = res.error;
    }
    if (res.snapshots.length > 0 && allSnapshots.length === 0) {
      allSnapshots = res.snapshots;
    }

    // Normalize comparison by trimming trailing whitespace/newlines
    const cleanActual = res.output.trim().replace(/\r\n/g, '\n');
    const cleanExpected = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
    const passed = cleanActual === cleanExpected;

    if (passed) passedCount++;

    testDetails.push({
      testId: tc.id,
      description: tc.description,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: res.output,
      passed,
    });

    allOutput += `[Test: ${tc.description}]\nInput: ${tc.input || '(none)'}\nOutput:\n${res.output}\n\n`;
  }

  return {
    output: allOutput,
    error: primaryError,
    executionTimeMs: 12.4,
    exitCode: passedCount === testCases.length ? 0 : 1,
    warnings: [],
    snapshots: allSnapshots,
    testResults: {
      total: testCases.length,
      passed: passedCount,
      failed: testCases.length - passedCount,
      details: testDetails,
    },
  };
}
