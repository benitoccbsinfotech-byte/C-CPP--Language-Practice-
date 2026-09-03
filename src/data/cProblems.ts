import { PracticeProblem } from '../types';

export const C_PRACTICE_PROBLEMS: PracticeProblem[] = [
  // 1. BASICS & I/O
  {
    id: 'hello-world',
    title: 'Hello, World!',
    category: 'basics-io',
    difficulty: 'Easy',
    summary: 'Master C program structure, preprocessor includes, and standard output with printf.',
    description: `Welcome to C programming! Write a C program that prints the exact message \`Hello, World!\` followed by a newline character (\`\\n\`).
    
### Key Concepts
- \`#include <stdio.h>\`: Standard Input/Output library header.
- \`int main()\`: Entry point of every standard C program.
- \`printf("...");\`: Formatted printing function.
- \`return 0;\`: Signals successful program termination to the OS.`,
    learningPoints: [
      'Understand the role of #include <stdio.h>',
      'Recognize main() as the mandatory C entry point',
      'Use escape sequences like \\n for new lines',
      'Understand return 0 indicating success',
    ],
    initialCode: `#include <stdio.h>

int main() {
    // Write your printf statement below:
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    explanation: `The preprocessor copies \`stdio.h\` declarations before compilation. \`printf\` writes the string to standard output, where \`\\n\` moves the cursor to the beginning of the next line.`,
    testCases: [
      {
        id: 'tc1',
        input: '',
        expectedOutput: 'Hello, World!\n',
        description: 'Default greeting execution',
      },
    ],
    hint: 'Use `printf("Hello, World!\\n");` inside `main()`.',
    commonPitfalls: [
      'Missing semicolon `;` at the end of statement.',
      'Missing `#include <stdio.h>` header.',
      'Forgetting the `\\n` newline character.',
    ],
    tags: ['I/O', 'printf', 'Basics'],
  },

  {
    id: 'formatted-user-card',
    title: 'Formatted Profile Card (I/O)',
    category: 'basics-io',
    difficulty: 'Easy',
    summary: 'Read user age, salary, and grade from stdin using scanf and format with printf.',
    description: `Given input containing an integer (Age), a float (Salary), and a single character (Grade), read them using \`scanf\` and print a formatted summary:
    
\`Age: <age> | Salary: $<salary with 2 decimal places> | Grade: <grade>\`

### Example
**Input:**
\`24 4500.50 A\`

**Output:**
\`Age: 24 | Salary: $4500.50 | Grade: A\``,
    learningPoints: [
      'Format specifiers: %d (int), %f (float), %c (char)',
      'Controlling decimal precision with %.2f',
      'Using address-of operator & in scanf',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int age;
    float salary;
    char grade;
    
    // Read age, salary, and grade using scanf
    
    // Print the formatted string: "Age: %d | Salary: $%.2f | Grade: %c\\n"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int age;
    float salary;
    char grade;
    
    scanf("%d %f %c", &age, &salary, &grade);
    printf("Age: %d | Salary: $%.2f | Grade: %c\\n", age, salary, grade);
    
    return 0;
}`,
    explanation: `\`scanf\` expects memory addresses (\`&age\`, \`&salary\`, \`&grade\`) to store the parsed values into variable memory slots. \`%.2f\` rounds and prints floating-point values to exactly two decimal places.`,
    testCases: [
      {
        id: 'tc1',
        input: '24 4500.50 A',
        expectedOutput: 'Age: 24 | Salary: $4500.50 | Grade: A\n',
        description: 'Standard employee record',
      },
      {
        id: 'tc2',
        input: '30 9850.75 B',
        expectedOutput: 'Age: 30 | Salary: $9850.75 | Grade: B\n',
        description: 'Senior engineer record',
      },
    ],
    hint: 'Remember to use `&` before each variable in `scanf("%d %f %c", &age, &salary, &grade)`.',
    commonPitfalls: [
      'Forgetting `&` in scanf leading to segmentation faults in native C.',
      'Using `%d` for floating-point numbers.',
    ],
    tags: ['scanf', 'printf', 'Formatting'],
  },

  // 2. VARIABLES & DATA TYPES
  {
    id: 'temperature-converter',
    title: 'Celsius to Fahrenheit (Float Precision)',
    category: 'variables-data',
    difficulty: 'Easy',
    summary: 'Convert Celsius to Fahrenheit using the formula F = (C * 9.0/5.0) + 32.',
    description: `Read a temperature in Celsius (float) and convert it to Fahrenheit using the formula:
$$F = (C \\times \\frac{9.0}{5.0}) + 32$$

Print the result formatted to **2 decimal places** as:
\`<Celsius> C = <Fahrenheit> F\`

### Example
**Input:**
\`25.0\`

**Output:**
\`25.00 C = 77.00 F\``,
    learningPoints: [
      'Difference between integer division (9/5 = 1) and floating point division (9.0/5.0 = 1.8)',
      'Precision formatting with %.2f',
    ],
    initialCode: `#include <stdio.h>

int main() {
    float celsius, fahrenheit;
    
    scanf("%f", &celsius);
    
    // Calculate fahrenheit (Hint: Use 9.0 / 5.0, not 9 / 5!)
    
    // Print: "%.2f C = %.2f F\\n"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    float celsius, fahrenheit;
    scanf("%f", &celsius);
    fahrenheit = (celsius * 9.0 / 5.0) + 32.0;
    printf("%.2f C = %.2f F\\n", celsius, fahrenheit);
    return 0;
}`,
    explanation: `In C, writing \`9 / 5\` performs integer truncation resulting in \`1\`. Writing \`9.0 / 5.0\` forces floating-point arithmetic yielding \`1.8\`.`,
    testCases: [
      {
        id: 'tc1',
        input: '25.0',
        expectedOutput: '25.00 C = 77.00 F\n',
        description: 'Room temperature 25C',
      },
      {
        id: 'tc2',
        input: '0.0',
        expectedOutput: '0.00 C = 32.00 F\n',
        description: 'Freezing point 0C',
      },
      {
        id: 'tc3',
        input: '100.0',
        expectedOutput: '100.00 C = 212.00 F\n',
        description: 'Boiling point 100C',
      },
    ],
    hint: 'Use `(celsius * 9.0 / 5.0) + 32.0`. Avoid `9/5`.',
    commonPitfalls: [
      'Writing `9/5` which evaluates to integer 1, resulting in incorrect calculations.',
    ],
    tags: ['Float', 'Math', 'Type Conversion'],
  },

  {
    id: 'sizeof-data-types',
    title: 'Data Type Memory Sizes (sizeof)',
    category: 'variables-data',
    difficulty: 'Easy',
    summary: 'Inspect byte sizes of basic C types using sizeof operator.',
    description: `Write a program that uses the \`sizeof\` operator to print the memory footprints of primitive C data types in bytes.

Expected output format:
\`char: 1 byte(s)\`
\`int: 4 byte(s)\`
\`float: 4 byte(s)\`
\`double: 8 byte(s)\``,
    learningPoints: [
      'Understand how C allocates bytes in hardware memory',
      'Use sizeof(type) operator',
    ],
    initialCode: `#include <stdio.h>

int main() {
    // Print sizeof for char, int, float, double
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    printf("char: %d byte(s)\\n", (int)sizeof(char));
    printf("int: %d byte(s)\\n", (int)sizeof(int));
    printf("float: %d byte(s)\\n", (int)sizeof(float));
    printf("double: %d byte(s)\\n", (int)sizeof(double));
    return 0;
}`,
    explanation: `\`sizeof\` is a compile-time operator in C that returns the size in bytes (as \`size_t\`). On modern 64-bit systems, \`char\` is 1 byte, \`int\` and \`float\` are 4 bytes, and \`double\` is 8 bytes.`,
    testCases: [
      {
        id: 'tc1',
        input: '',
        expectedOutput: 'char: 1 byte(s)\nint: 4 byte(s)\nfloat: 4 byte(s)\ndouble: 8 byte(s)\n',
        description: 'Primitive byte verification',
      },
    ],
    hint: 'Use `printf("char: %d byte(s)\\n", sizeof(char));` for each type.',
    commonPitfalls: [
      'Confusing sizeof (bytes) with length of array elements.',
    ],
    tags: ['sizeof', 'Memory', 'Types'],
  },

  // 3. OPERATORS
  {
    id: 'arithmetic-and-modulo',
    title: 'Integer Arithmetic & Remainder',
    category: 'operators',
    difficulty: 'Easy',
    summary: 'Read two integers and compute sum, difference, product, quotient, and remainder.',
    description: `Read two integers \`a\` and \`b\` from stdin. Compute and display:
1. Sum (\`a + b\`)
2. Difference (\`a - b\`)
3. Product (\`a * b\`)
4. Quotient (\`a / b\`)
5. Remainder (\`a % b\`)

### Example
**Input:** \`14 4\`
**Output:**
\`Sum = 18\`
\`Diff = 10\`
\`Product = 56\`
\`Quotient = 3\`
\`Remainder = 2\``,
    learningPoints: [
      'Integer truncation in division (14 / 4 = 3)',
      'Modulus operator % for remainder (14 % 4 = 2)',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    
    // Calculate and print Sum, Diff, Product, Quotient, Remainder
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    
    printf("Sum = %d\\n", a + b);
    printf("Diff = %d\\n", a - b);
    printf("Product = %d\\n", a * b);
    printf("Quotient = %d\\n", a / b);
    printf("Remainder = %d\\n", a % b);
    
    return 0;
}`,
    explanation: `When dividing integers in C, any fractional part is truncated toward zero. The modulus operator \`%\` computes the remainder of the integer division.`,
    testCases: [
      {
        id: 'tc1',
        input: '14 4',
        expectedOutput: 'Sum = 18\nDiff = 10\nProduct = 56\nQuotient = 3\nRemainder = 2\n',
        description: 'Standard positive division',
      },
      {
        id: 'tc2',
        input: '25 5',
        expectedOutput: 'Sum = 30\nDiff = 20\nProduct = 125\nQuotient = 5\nRemainder = 0\n',
        description: 'Exact divisible numbers',
      },
    ],
    hint: 'Use `%d` format specifiers and `a % b` for remainder.',
    commonPitfalls: [
      'Attempting to use `%` on float numbers (modulus is only defined for integer types in C).',
    ],
    tags: ['Operators', 'Arithmetic', 'Modulus'],
  },

  // 4. CONDITIONALS
  {
    id: 'even-or-odd',
    title: 'Even or Odd Number Checker',
    category: 'conditionals',
    difficulty: 'Easy',
    summary: 'Determine if an integer is Even or Odd using if-else and modulus operator.',
    description: `Read an integer \`n\`. If \`n\` is divisible by 2 with no remainder, print \`<n> is Even\`. Otherwise, print \`<n> is Odd\`.

### Examples
**Input:** \`42\`
**Output:** \`42 is Even\`

**Input:** \`17\`
**Output:** \`17 is Odd\``,
    learningPoints: [
      'Conditional branching with if (n % 2 == 0) and else',
      'Equality operator == vs assignment =',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    // Check if n is even or odd
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    if (n % 2 == 0) {
        printf("%d is Even\\n", n);
    } else {
        printf("%d is Odd\\n", n);
    }
    
    return 0;
}`,
    explanation: `An integer is even if \`n % 2 == 0\`. In C, \`0\` represents false, while any non-zero value represents true.`,
    testCases: [
      {
        id: 'tc1',
        input: '42',
        expectedOutput: '42 is Even\n',
        description: 'Even test',
      },
      {
        id: 'tc2',
        input: '17',
        expectedOutput: '17 is Odd\n',
        description: 'Odd test',
      },
      {
        id: 'tc3',
        input: '0',
        expectedOutput: '0 is Even\n',
        description: 'Zero test',
      },
    ],
    hint: 'Check if `n % 2 == 0`.',
    commonPitfalls: [
      'Accidentally writing `if (n % 2 = 0)` (single equals assignment instead of double equals comparison).',
    ],
    tags: ['if-else', 'Modulus', 'Conditionals'],
  },

  {
    id: 'largest-of-three',
    title: 'Find the Largest of Three Numbers',
    category: 'conditionals',
    difficulty: 'Easy',
    summary: 'Find maximum among three input numbers using logical AND (&&) operators.',
    description: `Read three integers \`a\`, \`b\`, and \`c\`. Output \`<max> is the largest number\`.

### Example
**Input:** \`12 45 33\`
**Output:** \`45 is the largest number\``,
    learningPoints: [
      'Compound logical expressions with &&',
      'Handling multiple conditional branches with else if',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    
    // Find largest and print: "<largest> is the largest number\\n"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    
    int max = a;
    if (b > max) {
        max = b;
    }
    if (c > max) {
        max = c;
    }
    
    printf("%d is the largest number\\n", max);
    return 0;
}`,
    explanation: `Starting with \`max = a\` and progressively updating if \`b > max\` or \`c > max\` provides clean $O(1)$ comparisons without deeply nested conditions.`,
    testCases: [
      {
        id: 'tc1',
        input: '12 45 33',
        expectedOutput: '45 is the largest number\n',
        description: 'Second is largest',
      },
      {
        id: 'tc2',
        input: '99 10 50',
        expectedOutput: '99 is the largest number\n',
        description: 'First is largest',
      },
      {
        id: 'tc3',
        input: '7 14 88',
        expectedOutput: '88 is the largest number\n',
        description: 'Third is largest',
      },
    ],
    hint: 'Initialize `int max = a;` then check if `b > max` and `c > max`.',
    commonPitfalls: ['Writing `a > b > c` which is evaluated left-to-right as `(a > b) > c` in C!'],
    tags: ['Conditionals', 'Logic', 'Comparison'],
  },

  {
    id: 'simple-calculator-switch',
    title: 'Calculator using Switch-Case',
    category: 'conditionals',
    difficulty: 'Easy',
    summary: 'Implement a multi-operator calculator (+, -, *, /) using C switch statement.',
    description: `Read an operator char (\`+\`, \`-\`, \`*\`, \`/\`) and two integers \`num1\` and \`num2\`.
Execute the corresponding operation using a \`switch\` statement.
For division, assume integer division.

### Example
**Input:** \`* 6 7\`
**Output:** \`Result: 42\`

**Input:** \`+ 15 25\`
**Output:** \`Result: 40\``,
    learningPoints: [
      'Switch statement syntax with case labels',
      'Crucial role of break statement to prevent fall-through',
      'default case for unknown operators',
    ],
    initialCode: `#include <stdio.h>

int main() {
    char op;
    int num1, num2;
    
    scanf(" %c %d %d", &op, &num1, &num2);
    
    // Implement switch(op) to calculate and print "Result: <value>\\n"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    char op;
    int num1, num2;
    scanf(" %c %d %d", &op, &num1, &num2);
    
    switch (op) {
        case '+':
            printf("Result: %d\\n", num1 + num2);
            break;
        case '-':
            printf("Result: %d\\n", num1 - num2);
            break;
        case '*':
            printf("Result: %d\\n", num1 * num2);
            break;
        case '/':
            if (num2 != 0) {
                printf("Result: %d\\n", num1 / num2);
            } else {
                printf("Error: Division by zero\\n");
            }
            break;
        default:
            printf("Invalid Operator\\n");
            break;
    }
    return 0;
}`,
    explanation: `The \`switch\` expression is matched against each \`case\` constant. Without a \`break;\` statement, execution falls through to the subsequent cases regardless of matches.`,
    testCases: [
      {
        id: 'tc1',
        input: '* 6 7',
        expectedOutput: 'Result: 42\n',
        description: 'Multiplication test',
      },
      {
        id: 'tc2',
        input: '+ 15 25',
        expectedOutput: 'Result: 40\n',
        description: 'Addition test',
      },
      {
        id: 'tc3',
        input: '/ 20 4',
        expectedOutput: 'Result: 5\n',
        description: 'Division test',
      },
    ],
    hint: 'Use `case \'+\': ... break;` for each arithmetic operation.',
    commonPitfalls: ['Forgetting `break;` resulting in case fall-through.'],
    tags: ['switch', 'Case', 'Control Flow'],
  },

  // 5. LOOPS
  {
    id: 'sum-of-n-numbers',
    title: 'Sum of First N Natural Numbers',
    category: 'loops',
    difficulty: 'Easy',
    summary: 'Calculate sum from 1 to N using a for loop.',
    description: `Given a positive integer \`N\`, compute the sum of all integers from \`1\` to \`N\` using a \`for\` loop.
    
Print: \`Sum = <total>\`

### Example
**Input:** \`10\`
**Output:** \`Sum = 55\``,
    learningPoints: [
      'For loop syntax: for (init; condition; increment)',
      'Accumulator variable initialization (int sum = 0)',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n, sum = 0;
    scanf("%d", &n);
    
    // Write for loop to compute sum
    
    printf("Sum = %d\\n", sum);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n, sum = 0;
    scanf("%d", &n);
    
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    
    printf("Sum = %d\\n", sum);
    return 0;
}`,
    explanation: `The \`for\` loop initializes counter \`i = 1\`, loops while \`i <= n\`, and adds each \`i\` into the accumulator \`sum\`.`,
    testCases: [
      {
        id: 'tc1',
        input: '10',
        expectedOutput: 'Sum = 55\n',
        description: 'Sum 1 to 10',
      },
      {
        id: 'tc2',
        input: '100',
        expectedOutput: 'Sum = 5050\n',
        description: 'Sum 1 to 100',
      },
      {
        id: 'tc3',
        input: '1',
        expectedOutput: 'Sum = 1\n',
        description: 'Single number',
      },
    ],
    hint: 'Loop from `i = 1` up to `i <= n` and do `sum += i;`.',
    commonPitfalls: ['Uninitialized accumulator variable (e.g. `int sum;` containing garbage value).'],
    tags: ['for-loop', 'Math', 'Accumulator'],
  },

  {
    id: 'factorial-calculation',
    title: 'Factorial of a Number',
    category: 'loops',
    difficulty: 'Easy',
    summary: 'Compute N! (N factorial) using a while or for loop with edge case handling for 0.',
    description: `Read an integer \`N\` ($N \\ge 0$). Calculate $N! = 1 \\times 2 \\times 3 \\times \\dots \\times N$.
Note that $0! = 1$.

Print: \`<N>! = <result>\`

### Examples
**Input:** \`5\`
**Output:** \`5! = 120\`

**Input:** \`0\`
**Output:** \`0! = 1\``,
    learningPoints: [
      'Multiplicative identity (fact = 1)',
      'Handling boundary case for 0! = 1',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n;
    long long fact = 1;
    scanf("%d", &n);
    
    // Calculate factorial
    
    printf("%d! = %lld\\n", n, fact);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    long long fact = 1;
    scanf("%d", &n);
    
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    
    printf("%d! = %lld\\n", n, fact);
    return 0;
}`,
    explanation: `Initializing \`fact = 1\` automatically handles \`n = 0\` correctly because the loop condition \`1 <= 0\` evaluates to false, leaving \`fact = 1\`.`,
    testCases: [
      {
        id: 'tc1',
        input: '5',
        expectedOutput: '5! = 120\n',
        description: '5! test',
      },
      {
        id: 'tc2',
        input: '0',
        expectedOutput: '0! = 1\n',
        description: '0! boundary test',
      },
      {
        id: 'tc3',
        input: '7',
        expectedOutput: '7! = 5040\n',
        description: '7! test',
      },
    ],
    hint: 'Start with `fact = 1` and multiply `fact *= i` for `i` from 1 to `n`.',
    commonPitfalls: ['Initializing `fact = 0` which causes the product to always remain 0.'],
    tags: ['Loops', 'Factorial', 'Math'],
  },

  {
    id: 'fibonacci-series',
    title: 'Fibonacci Sequence Generator',
    category: 'loops',
    difficulty: 'Medium',
    summary: 'Generate the first N Fibonacci numbers (0, 1, 1, 2, 3, 5, 8...) space-separated.',
    description: `Read an integer \`N\` ($N \\ge 1$). Print the first \`N\` terms of the Fibonacci sequence separated by spaces, ending with a newline.

### Example
**Input:** \`7\`
**Output:** \`0 1 1 2 3 5 8\``,
    learningPoints: [
      'Iterative state transition: next = a + b; a = b; b = next;',
      'Loop control for sequences',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    // Print first n Fibonacci numbers space separated
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    int t1 = 0, t2 = 1;
    for (int i = 1; i <= n; i++) {
        if (i == n) {
            printf("%d\\n", t1);
        } else {
            printf("%d ", t1);
        }
        int nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    return 0;
}`,
    explanation: `Each Fibonacci number is the sum of the two preceding ones. We shift \`t1\` and \`t2\` forward in every loop iteration.`,
    testCases: [
      {
        id: 'tc1',
        input: '7',
        expectedOutput: '0 1 1 2 3 5 8\n',
        description: '7 terms',
      },
      {
        id: 'tc2',
        input: '1',
        expectedOutput: '0\n',
        description: 'Single term',
      },
      {
        id: 'tc3',
        input: '4',
        expectedOutput: '0 1 1 2\n',
        description: '4 terms',
      },
    ],
    hint: 'Store `t1 = 0` and `t2 = 1`. In each step print `t1`, then calculate `next = t1 + t2; t1 = t2; t2 = next;`.',
    commonPitfalls: ['Overwriting `t1` before using it in the sum.'],
    tags: ['Fibonacci', 'Loops', 'Sequences'],
  },

  {
    id: 'prime-number-checker',
    title: 'Prime Number Checker',
    category: 'loops',
    difficulty: 'Medium',
    summary: 'Check if an integer > 1 is prime using loop divisibility testing.',
    description: `Read an integer \`N\`. Determine if \`N\` is a prime number (has no positive divisors other than 1 and itself).

Print:
\`<N> is Prime\` or \`<N> is Not Prime\`

### Examples
**Input:** \`29\`
**Output:** \`29 is Prime\`

**Input:** \`15\`
**Output:** \`15 is Not Prime\`

**Input:** \`1\`
**Output:** \`1 is Not Prime\``,
    learningPoints: [
      'Prime definition ($N > 1$ and not divisible by any $2 \\dots \\sqrt{N}$)',
      'Loop optimization and early break',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n, isPrime = 1;
    scanf("%d", &n);
    
    // Check if n is prime
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n, isPrime = 1;
    scanf("%d", &n);
    
    if (n <= 1) {
        isPrime = 0;
    } else {
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = 0;
                break;
            }
        }
    }
    
    if (isPrime) {
        printf("%d is Prime\\n", n);
    } else {
        printf("%d is Not Prime\\n", n);
    }
    
    return 0;
}`,
    explanation: `Any composite number must have a prime factor $\\le \\sqrt{N}$. Checking up to \`i * i <= n\` with early \`break;\` runs in $O(\\sqrt{N})$ time.`,
    testCases: [
      {
        id: 'tc1',
        input: '29',
        expectedOutput: '29 is Prime\n',
        description: 'Prime 29',
      },
      {
        id: 'tc2',
        input: '15',
        expectedOutput: '15 is Not Prime\n',
        description: 'Composite 15',
      },
      {
        id: 'tc3',
        input: '1',
        expectedOutput: '1 is Not Prime\n',
        description: 'Edge case 1 is not prime',
      },
    ],
    hint: 'Numbers $\\le 1$ are not prime. For $n > 1$, loop from 2 to $i*i \\le n$.',
    commonPitfalls: ['Treating 1 as a prime number.'],
    tags: ['Prime', 'Loops', 'Optimization'],
  },

  {
    id: 'pyramid-pattern',
    title: 'Star Pyramid Pattern (Nested Loops)',
    category: 'loops',
    difficulty: 'Medium',
    summary: 'Print a symmetric right-angled or centered star triangle using nested loops.',
    description: `Read an integer \`N\`. Print a right-angled star pattern of height \`N\`.
Row 1 has 1 star \`*\`, Row 2 has 2 stars \`**\`, up to Row N with N stars.

### Example for N = 4:
\`*\`
\`**\`
\`***\`
\`****\``,
    learningPoints: [
      'Outer loop for row count',
      'Inner loop for column stars',
      'Row-wise newline management',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    // Nested loops for star pattern
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("*");
        }
        printf("\\n");
    }
    
    return 0;
}`,
    explanation: `The outer loop iterates \`i\` from 1 to \`n\` (representing rows). The inner loop prints \`i\` stars on row \`i\`, followed by a newline.`,
    testCases: [
      {
        id: 'tc1',
        input: '4',
        expectedOutput: '*\n**\n***\n****\n',
        description: 'Height 4 pattern',
      },
      {
        id: 'tc2',
        input: '2',
        expectedOutput: '*\n**\n',
        description: 'Height 2 pattern',
      },
    ],
    hint: 'Outer loop `for(int i=1; i<=n; i++)`, inner loop `for(int j=1; j<=i; j++) printf("*");`.',
    commonPitfalls: ['Forgetting `printf("\\n")` at the end of the outer loop.'],
    tags: ['Patterns', 'Nested Loops'],
  },

  // 6. ARRAYS & STRINGS
  {
    id: 'array-max-min',
    title: 'Array Maximum & Minimum',
    category: 'arrays-strings',
    difficulty: 'Easy',
    summary: 'Find the largest and smallest numbers in an integer array.',
    description: `Read an integer \`N\` followed by \`N\` array elements.
Find and print the maximum and minimum values in the array in the format:
\`Max = <max_val> | Min = <min_val>\`

### Example
**Input:**
\`5\`
\`12 45 7 89 23\`

**Output:**
\`Max = 89 | Min = 7\``,
    learningPoints: [
      'Array indexing (0 to N-1)',
      'Initializing max and min with arr[0]',
      'Linear array traversal',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[100];
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    // Find max and min
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[100];
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    int max = arr[0];
    int min = arr[0];
    
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    
    printf("Max = %d | Min = %d\\n", max, min);
    return 0;
}`,
    explanation: `We initialize \`max = arr[0]\` and \`min = arr[0]\`. Scanning through index 1 to $N-1$ ensures correct tracking even with negative array values.`,
    testCases: [
      {
        id: 'tc1',
        input: '5 12 45 7 89 23',
        expectedOutput: 'Max = 89 | Min = 7\n',
        description: 'Standard 5 numbers',
      },
      {
        id: 'tc2',
        input: '4 -10 -5 -30 -2',
        expectedOutput: 'Max = -2 | Min = -30\n',
        description: 'All negative array values',
      },
    ],
    hint: 'Initialize `int max = arr[0]; int min = arr[0];` before the loop.',
    commonPitfalls: ['Initializing `min = 0` which fails when all array items are positive or negative.'],
    tags: ['Arrays', 'Traversal', 'MinMax'],
  },

  {
    id: 'bubble-sort-array',
    title: 'Bubble Sort Algorithm',
    category: 'arrays-strings',
    difficulty: 'Medium',
    summary: 'Sort an array of N integers in ascending order using Bubble Sort.',
    description: `Read an integer \`N\` followed by \`N\` elements. Sort them in ascending order using Bubble Sort and print the sorted array space-separated.

### Example
**Input:**
\`5\`
\`64 25 12 22 11\`

**Output:**
\`11 12 22 25 64\``,
    learningPoints: [
      'Bubble sort comparison: swap if arr[j] > arr[j+1]',
      'Temporary variable swap pattern',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[100];
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    // Implement bubble sort
    
    // Print sorted array space-separated
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int arr[100];
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    
    for (int i = 0; i < n; i++) {
        if (i == n - 1) {
            printf("%d\\n", arr[i]);
        } else {
            printf("%d ", arr[i]);
        }
    }
    
    return 0;
}`,
    explanation: `Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Largest elements "bubble" to the end.`,
    testCases: [
      {
        id: 'tc1',
        input: '5 64 25 12 22 11',
        expectedOutput: '11 12 22 25 64\n',
        description: 'Unsorted 5 elements',
      },
      {
        id: 'tc2',
        input: '3 3 2 1',
        expectedOutput: '1 2 3\n',
        description: 'Reversed order 3 elements',
      },
    ],
    hint: 'Use two nested loops `for (int i = 0; i < n - 1; i++)` and `for (int j = 0; j < n - i - 1; j++)`.',
    commonPitfalls: ['Index out of bounds on `arr[j + 1]` if inner loop runs up to `n` instead of `n - 1`.'],
    tags: ['Sorting', 'Bubble Sort', 'Arrays'],
  },

  {
    id: 'string-vowel-counter',
    title: 'Count Vowels & Consonants in String',
    category: 'arrays-strings',
    difficulty: 'Easy',
    summary: 'Traverse a character string and count vowels (a, e, i, o, u) and consonants.',
    description: `Read a single word/string \`str\`. Count how many vowels (A, E, I, O, U, case-insensitive) and consonants are present.
    
Print:
\`Vowels: <vowel_count> | Consonants: <consonant_count>\`

### Example
**Input:** \`Programming\`
**Output:** \`Vowels: 3 | Consonants: 8\``,
    learningPoints: [
      'Strings in C as null-terminated char arrays (\\0)',
      'Character ASCII checking and case-handling',
    ],
    initialCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[100];
    scanf("%s", str);
    
    int vowels = 0, consonants = 0;
    
    // Traverse string until '\\0' and count
    
    printf("Vowels: %d | Consonants: %d\\n", vowels, consonants);
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <string.h>

int main() {
    char str[100];
    scanf("%s", str);
    
    int vowels = 0, consonants = 0;
    
    for (int i = 0; str[i] != '\\0'; i++) {
        char c = str[i];
        if (c >= 'A' && c <= 'Z') {
            c = c + 32; // Convert uppercase to lowercase
        }
        
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            vowels++;
        } else if (c >= 'a' && c <= 'z') {
            consonants++;
        }
    }
    
    printf("Vowels: %d | Consonants: %d\\n", vowels, consonants);
    return 0;
}`,
    explanation: `C strings terminate with the null character \`'\\0'\`. Checking \`str[i] != '\\0'\` guarantees safe traversal through the string in memory.`,
    testCases: [
      {
        id: 'tc1',
        input: 'Programming',
        expectedOutput: 'Vowels: 3 | Consonants: 8\n',
        description: 'Programming string',
      },
      {
        id: 'tc2',
        input: 'hello',
        expectedOutput: 'Vowels: 2 | Consonants: 3\n',
        description: 'hello string',
      },
    ],
    hint: 'Loop until `str[i] != \'\\0\'`. Check for `a, e, i, o, u`.',
    commonPitfalls: ['Assuming strings in C store length metadata — they rely purely on the `\\0` null terminator.'],
    tags: ['Strings', 'char', 'Null-Terminator'],
  },

  // 7. FUNCTIONS & RECURSION
  {
    id: 'custom-functions-gcd',
    title: 'Greatest Common Divisor (GCD Function)',
    category: 'functions',
    difficulty: 'Medium',
    summary: 'Write a modular C function int gcd(int a, int b) using Euclidean algorithm.',
    description: `Write a C function \`int gcd(int a, int b)\` that calculates the Greatest Common Divisor of two integers using the Euclidean Algorithm ($gcd(a, b) = gcd(b, a \\% b)$).
In \`main()\`, read two integers and print: \`GCD(<a>, <b>) = <result>\`.

### Example
**Input:** \`48 18\`
**Output:** \`GCD(48, 18) = 6\``,
    learningPoints: [
      'Function definition, return types, and parameter passing',
      'Euclidean algorithm for GCD',
    ],
    initialCode: `#include <stdio.h>

// Define your gcd function here:
int gcd(int a, int b) {
    // Return greatest common divisor
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("GCD(%d, %d) = %d\\n", a, b, gcd(a, b));
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("GCD(%d, %d) = %d\\n", a, b, gcd(a, b));
    return 0;
}`,
    explanation: `Euclid's algorithm replaces \`a\` with \`b\` and \`b\` with \`a % b\` until \`b\` reaches 0. The remaining \`a\` is the greatest common divisor.`,
    testCases: [
      {
        id: 'tc1',
        input: '48 18',
        expectedOutput: 'GCD(48, 18) = 6\n',
        description: '48 and 18',
      },
      {
        id: 'tc2',
        input: '100 25',
        expectedOutput: 'GCD(100, 25) = 25\n',
        description: 'Divisible 100 and 25',
      },
      {
        id: 'tc3',
        input: '17 13',
        expectedOutput: 'GCD(17, 13) = 1\n',
        description: 'Co-prime numbers',
      },
    ],
    hint: 'While `b != 0`, set `temp = b; b = a % b; a = temp;`. Return `a`.',
    commonPitfalls: ['Division by zero if you perform `a % b` when `b` is already 0.'],
    tags: ['Functions', 'GCD', 'Algorithms'],
  },

  {
    id: 'recursive-power',
    title: 'Recursive Power (x^n)',
    category: 'functions',
    difficulty: 'Medium',
    summary: 'Implement a recursive function int power(int base, int exp) to compute base^exp.',
    description: `Write a recursive function \`int power(int base, int exp)\` that computes $base^{exp}$ recursively.
Base Case: $base^0 = 1$.
Recursive Step: $base \\times power(base, exp - 1)$.

Print: \`<base>^<exp> = <result>\`

### Example
**Input:** \`2 5\`
**Output:** \`2^5 = 32\``,
    learningPoints: [
      'Recursive function call stack',
      'Identifying the base condition to stop recursion',
    ],
    initialCode: `#include <stdio.h>

int power(int base, int exp) {
    // Base case
    
    // Recursive call
}

int main() {
    int base, exp;
    scanf("%d %d", &base, &exp);
    printf("%d^%d = %d\\n", base, exp, power(base, exp));
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int power(int base, int exp) {
    if (exp == 0) {
        return 1;
    }
    return base * power(base, exp - 1);
}

int main() {
    int base, exp;
    scanf("%d %d", &base, &exp);
    printf("%d^%d = %d\\n", base, exp, power(base, exp));
    return 0;
}`,
    explanation: `Each recursive call allocates a stack frame storing \`base\` and \`exp\`. When \`exp == 0\` is reached, recursion unwinds multiplying the returned values back up the stack.`,
    testCases: [
      {
        id: 'tc1',
        input: '2 5',
        expectedOutput: '2^5 = 32\n',
        description: '2 to the power 5',
      },
      {
        id: 'tc2',
        input: '3 3',
        expectedOutput: '3^3 = 27\n',
        description: '3 cubed',
      },
      {
        id: 'tc3',
        input: '5 0',
        expectedOutput: '5^0 = 1\n',
        description: 'Power 0 base case',
      },
    ],
    hint: 'If `exp == 0` return 1; otherwise return `base * power(base, exp - 1)`.',
    commonPitfalls: ['Missing base case leading to infinite recursion and Stack Overflow.'],
    tags: ['Recursion', 'Call Stack', 'Functions'],
  },

  // 8. POINTERS & MEMORY
  {
    id: 'swap-using-pointers',
    title: 'Swap Two Numbers (Call by Reference)',
    category: 'pointers',
    difficulty: 'Medium',
    summary: 'Write void swap(int *a, int *b) to swap values in memory using pointer dereferencing.',
    description: `In C, arguments are passed by value by default (copies are created). To modify the caller's variables, we pass their memory addresses using pointers!

Implement:
\`void swap(int *a, int *b)\`

In \`main()\`, read two integers \`x\` and \`y\`, call \`swap(&x, &y)\`, and print:
\`After Swap: x = <new_x>, y = <new_y>\`

### Example
**Input:** \`10 20\`
**Output:** \`After Swap: x = 20, y = 10\``,
    learningPoints: [
      'Address-of operator (&) to obtain variable memory location',
      'Dereference operator (*) to read and modify value at that address',
      'Pass by reference in C',
    ],
    initialCode: `#include <stdio.h>

void swap(int *a, int *b) {
    // Dereference pointers to swap memory values
}

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    
    // Call swap with addresses &x and &y
    
    printf("After Swap: x = %d, y = %d\\n", x, y);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    
    swap(&x, &y);
    
    printf("After Swap: x = %d, y = %d\\n", x, y);
    return 0;
}`,
    explanation: `\`&x\` passes the address of \`x\` (e.g. \`0x7ffe0004\`). Inside \`swap\`, \`*a\` directly accesses the contents of that address in the caller's stack frame, modifying \`x\` directly.`,
    testCases: [
      {
        id: 'tc1',
        input: '10 20',
        expectedOutput: 'After Swap: x = 20, y = 10\n',
        description: 'Swap 10 and 20',
      },
      {
        id: 'tc2',
        input: '99 1',
        expectedOutput: 'After Swap: x = 1, y = 99\n',
        description: 'Swap 99 and 1',
      },
    ],
    hint: 'Inside `swap`, do `int temp = *a; *a = *b; *b = temp;`. Call it with `swap(&x, &y);`.',
    commonPitfalls: [
      'Calling `swap(x, y)` instead of `swap(&x, &y)` passing values instead of addresses.',
      'Writing `a = b` inside swap which reassigns local pointer copies rather than the target values.',
    ],
    tags: ['Pointers', 'Call by Reference', 'Memory'],
  },

  {
    id: 'pointer-arithmetic-array',
    title: 'Pointer Arithmetic & Array Traversal',
    category: 'pointers',
    difficulty: 'Medium',
    summary: 'Traverse an array using pointer offset *(ptr + i) and calculate the sum.',
    description: `In C, an array name decays into a pointer to its first element: \`arr == &arr[0]\`.
Read \`N\` integers into an array. Using a pointer \`int *ptr = arr;\` and pointer arithmetic \`*(ptr + i)\`, compute and print the sum.

Print: \`Array Sum via Pointer = <sum>\`

### Example
**Input:** \`4 5 10 15 20\`
**Output:** \`Array Sum via Pointer = 50\``,
    learningPoints: [
      'Relationship between arrays and pointers: arr[i] is equivalent to *(arr + i)',
      'Pointer arithmetic scales by sizeof(type) bytes in memory',
    ],
    initialCode: `#include <stdio.h>

int main() {
    int n, sum = 0;
    scanf("%d", &n);
    int arr[100];
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    int *ptr = arr;
    // Use pointer arithmetic *(ptr + i) to sum elements
    
    printf("Array Sum via Pointer = %d\\n", sum);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n, sum = 0;
    scanf("%d", &n);
    int arr[100];
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    int *ptr = arr;
    for (int i = 0; i < n; i++) {
        sum += *(ptr + i);
    }
    
    printf("Array Sum via Pointer = %d\\n", sum);
    return 0;
}`,
    explanation: `\`ptr + i\` calculates the memory address \`base_address + i * sizeof(int)\`. The dereference \`*(ptr + i)\` retrieves the value at that address. In C, \`arr[i]\` is syntactic sugar for \`*(arr + i)\`.`,
    testCases: [
      {
        id: 'tc1',
        input: '4 5 10 15 20',
        expectedOutput: 'Array Sum via Pointer = 50\n',
        description: 'Sum of 4 integers',
      },
      {
        id: 'tc2',
        input: '3 100 200 300',
        expectedOutput: 'Array Sum via Pointer = 600\n',
        description: 'Sum of 3 elements',
      },
    ],
    hint: 'Loop `i` from 0 to `n-1` and do `sum += *(ptr + i);`.',
    commonPitfalls: ['Dereference precedence: `*ptr + i` adds `i` to the first element value, whereas `*(ptr + i)` offsets the address first.'],
    tags: ['Pointer Arithmetic', 'Arrays', 'Memory Offset'],
  },

  // 9. STRUCTS
  {
    id: 'struct-student-record',
    title: 'Student Record & Average (Structs)',
    category: 'structs',
    difficulty: 'Medium',
    summary: 'Define struct Student and compute average score across subjects.',
    description: `Define a \`struct Student\` with:
- \`int id\`
- \`int score1\`
- \`int score2\`
- \`int score3\`

Read the student ID and the 3 test scores. Compute the average score as a float and print:
\`ID: <id> | Average Score: <avg formatted to 2 decimals>\`

### Example
**Input:** \`101 85 90 95\`
**Output:** \`ID: 101 | Average Score: 90.00\``,
    learningPoints: [
      'struct definition and member access with dot operator (.)',
      'Grouping related heterogeneous data in C',
    ],
    initialCode: `#include <stdio.h>

struct Student {
    int id;
    int score1;
    int score2;
    int score3;
};

int main() {
    struct Student s;
    scanf("%d %d %d %d", &s.id, &s.score1, &s.score2, &s.score3);
    
    // Calculate average score as float
    
    // Print: "ID: %d | Average Score: %.2f\\n"
    
    return 0;
}`,
    solutionCode: `#include <stdio.h>

struct Student {
    int id;
    int score1;
    int score2;
    int score3;
};

int main() {
    struct Student s;
    scanf("%d %d %d %d", &s.id, &s.score1, &s.score2, &s.score3);
    
    float avg = (s.score1 + s.score2 + s.score3) / 3.0;
    
    printf("ID: %d | Average Score: %.2f\\n", s.id, avg);
    return 0;
}`,
    explanation: `A \`struct\` creates a composite data type in memory where members are arranged contiguously in memory. We access members using the dot \`.\` operator on struct variables.`,
    testCases: [
      {
        id: 'tc1',
        input: '101 85 90 95',
        expectedOutput: 'ID: 101 | Average Score: 90.00\n',
        description: 'Standard 90 average',
      },
      {
        id: 'tc2',
        input: '202 70 80 85',
        expectedOutput: 'ID: 202 | Average Score: 78.33\n',
        description: 'Decimal 78.33 average',
      },
    ],
    hint: 'Calculate average using `(s.score1 + s.score2 + s.score3) / 3.0;`.',
    commonPitfalls: ['Dividing by integer 3 instead of 3.0 causing integer truncation before assigning to float.'],
    tags: ['struct', 'Data Structures', 'Dot Operator'],
  },
];
