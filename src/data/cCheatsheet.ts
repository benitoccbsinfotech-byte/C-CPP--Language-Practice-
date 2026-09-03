import { CheatsheetTopic } from '../types';

export const C_CHEATSHEET_TOPICS: CheatsheetTopic[] = [
  {
    id: 'printf-specifiers',
    title: 'Format Specifiers in printf & scanf',
    category: 'Input / Output',
    description: 'Format specifiers tell C functions how to interpret binary data in memory for output and input formatting.',
    code: `// Format Specifiers Table:
printf("%d", 42);        // Integer (decimal): 42
printf("%i", 42);        // Integer
printf("%u", 42);        // Unsigned decimal integer
printf("%f", 3.14159);   // Float (default 6 decimals): 3.141590
printf("%.2f", 3.14159); // Float with 2 decimal places: 3.14
printf("%lf", 3.14159);  // Double (for scanf, use %lf for double!)
printf("%c", 'A');       // Single character: A
printf("%s", "hello");   // Null-terminated string: hello
printf("%p", &var);      // Pointer hex address: 0x7ffe0004
printf("%x", 255);       // Hexadecimal lowercase: ff
printf("%X", 255);       // Hexadecimal uppercase: FF
printf("%%");            // Literal percent sign: %

// Width & Alignment:
printf("%5d", 42);       // Right aligned in 5 spaces: "   42"
printf("%-5d", 42);      // Left aligned in 5 spaces:  "42   "`,
    notes: [
      'In scanf, you MUST use %lf for double, while %f is for float.',
      'Always pass pointers (&var) into scanf except for char arrays/strings.',
    ],
  },

  {
    id: 'data-types-sizes',
    title: 'Primitive Data Types & Memory Sizes',
    category: 'Memory & Types',
    description: 'Overview of standard primitive C types on 64-bit architecture.',
    code: `// Primitive Types & Ranges:
char           1 byte   -128 to 127 (or 0 to 255 for unsigned)
short          2 bytes  -32,768 to 32,767
int            4 bytes  -2,147,483,648 to 2,147,483,647
unsigned int   4 bytes  0 to 4,294,967,295
long / long long 8 bytes  -9.22 × 10^18 to 9.22 × 10^18
float          4 bytes  ~6-7 decimal digits precision
double         8 bytes  ~15-17 decimal digits precision
bool           1 byte   true (1) / false (0) via <stdbool.h>`,
    notes: [
      'C does not throw an exception on integer overflow; it silently wraps around.',
      'Divide by 0 in C causes Undefined Behavior / Floating point exception.',
    ],
  },

  {
    id: 'pointers-basics',
    title: 'Pointers & Memory Architecture',
    category: 'Pointers & Memory',
    description: 'Pointers hold memory addresses of other variables. Understanding & and * is fundamental to C.',
    code: `int x = 42;
int *ptr = &x;     // & = address-of operator (gets memory location of x)

printf("Address of x: %p\\n", ptr);  // prints e.g. 0x7ffe0004
printf("Value of x:   %d\\n", *ptr); // * = dereference operator (reads 42)

*ptr = 100;        // modifies x directly in memory
printf("New x: %d\\n", x);           // prints 100

// Swapping via pointers (Pass by Reference):
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
// Called as: swap(&x, &y);`,
    notes: [
      'Uninitialized pointer (wild pointer) points to arbitrary memory and can crash your program.',
      'Always set unused pointers to NULL (0x0).',
    ],
  },

  {
    id: 'arrays-and-strings',
    title: 'Arrays & Strings (Null-Termination)',
    category: 'Data Structures',
    description: 'Arrays are contiguous memory blocks. C strings are char arrays ending with null char \\0.',
    code: `// Array declaration & initialization:
int numbers[5] = {10, 20, 30, 40, 50};
int first = numbers[0]; // 0-indexed

// Array and Pointer Equivalence:
// numbers == &numbers[0]
// numbers[i] == *(numbers + i)

// Strings in C:
char greeting[] = "Hello"; 
// In memory: ['H', 'e', 'l', 'l', 'o', '\\0'] (6 bytes total)

// String library (<string.h>):
strlen(greeting);      // Returns 5 (excluding \\0)
strcpy(dest, src);     // Copies src string into dest
strcat(dest, src);     // Concatenates src onto dest
strcmp(str1, str2);    // Returns 0 if identical, <0 if str1 < str2`,
    notes: [
      'C does not perform array bounds checking. Accessing out of bounds causes memory corruption.',
      'Always ensure destination string buffer has space for length + 1 (for the \\0).',
    ],
  },

  {
    id: 'control-flow',
    title: 'Loops & Conditional Control Flow',
    category: 'Control Flow',
    description: 'Syntax patterns for if/else, switch, for, while, and do-while loops in C.',
    code: `// If - Else If - Else:
if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else {
    grade = 'C';
}

// Switch-Case:
switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    default: printf("Unknown operator\\n"); break;
}

// For Loop:
for (int i = 0; i < 10; i++) {
    if (i == 5) continue; // skip rest of iteration
    if (i == 8) break;    // exit loop early
}

// While & Do-While:
while (condition) { /* checks before execution */ }
do { /* executes at least once */ } while (condition);`,
    notes: [
      'In C, any non-zero numeric value evaluates to TRUE, and 0 evaluates to FALSE.',
      'Do not forget `break;` in switch statements unless you intentionally want fall-through.',
    ],
  },

  {
    id: 'common-pitfalls',
    title: 'Top 5 Common C Pitfalls & Bugs',
    category: 'Debugging',
    description: 'The most frequent errors encountered by C programmers and how to avoid them.',
    code: `// 1. Single = vs Double == in if statement:
if (x = 5)  // BUG: Assigns 5 to x and evaluates to true!
if (x == 5) // CORRECT: Checks equality

// 2. Integer Division Truncation:
float ratio = 1 / 2;     // BUG: 1/2 evaluates to 0, ratio becomes 0.0
float ratio = 1.0 / 2.0; // CORRECT: 0.5

// 3. Missing & in scanf:
scanf("%d", num);  // BUG: Passes value of num as memory address -> SEGFAULT!
scanf("%d", &num); // CORRECT

// 4. Off-by-one Loop Bounds:
int arr[5];
for (int i = 0; i <= 5; i++) { arr[i] = 0; } // BUG: arr[5] is out of bounds!
for (int i = 0; i < 5; i++)  { arr[i] = 0; } // CORRECT

// 5. Forgetting String Null Terminator:
char str[5] = "Hello"; // BUG: "Hello" needs 6 bytes including '\\0'!
char str[6] = "Hello"; // CORRECT`,
    notes: [
      'Enable compiler warnings with -Wall -Wextra in standard GCC/Clang.',
      'GDB (GNU Debugger) or Valgrind are used to trace segmentation faults and memory leaks.',
    ],
  },
];
