import { QuizQuestion } from '../types';

export const C_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'basics-io',
    question: 'What is the output of the following C code snippet?',
    codeSnippet: `#include <stdio.h>

int main() {
    int a = 5, b = 2;
    float result = a / b;
    printf("%.1f", result);
    return 0;
}`,
    options: ['2.5', '2.0', '2', 'Compilation Error'],
    correctIndex: 1,
    explanation: 'Both `a` and `b` are `int`, so `a / b` performs integer division resulting in `2`. When assigned to float, it becomes `2.0`. To get `2.5`, at least one operand must be float, e.g., `(float)a / b` or `5.0 / 2`.',
  },
  {
    id: 'q2',
    category: 'pointers',
    question: 'What will be printed by this pointer dereferencing code?',
    codeSnippet: `#include <stdio.h>

int main() {
    int x = 10;
    int *p = &x;
    *p = *p + 5;
    printf("%d", x);
    return 0;
}`,
    options: ['10', '15', 'Address of x', 'Segmentation Fault'],
    correctIndex: 1,
    explanation: '`p` stores the memory address of `x`. Dereferencing `*p` reads 10 and adds 5, then writes 15 directly to `x` in memory.',
  },
  {
    id: 'q3',
    category: 'variables-data',
    question: 'What does the sizeof operator return for `sizeof(char)` according to the C standard?',
    codeSnippet: `printf("%zu", sizeof(char));`,
    options: ['1 byte', '2 bytes', '4 bytes', 'Depends on OS architecture'],
    correctIndex: 0,
    explanation: 'By C standard definition, `sizeof(char)` is always guaranteed to be exactly 1 byte on any platform.',
  },
  {
    id: 'q4',
    category: 'arrays-strings',
    question: 'In C, what is the character that marks the end of a string literal?',
    options: ['\\n (Newline)', '\\0 (Null character)', 'EOF (End of File)', '; (Semicolon)'],
    correctIndex: 1,
    explanation: 'C strings are contiguous null-terminated character arrays ending with the ASCII value 0 (`\'\\0\'`).',
  },
  {
    id: 'q5',
    category: 'operators',
    question: 'What is the value of `x` after evaluating the expression?',
    codeSnippet: `int a = 5;
int x = a++ + ++a;`,
    options: ['12', '11', '10', 'Undefined behavior in standard C'],
    correctIndex: 3,
    explanation: 'Modifying a variable multiple times within the same sequence point (e.g. `a++ + ++a`) is Undefined Behavior in the ISO C standard.',
  },
  {
    id: 'q6',
    category: 'pointers',
    question: 'If `arr` is an integer array `int arr[5] = {10, 20, 30, 40, 50};`, what is `*(arr + 2)` equivalent to?',
    options: ['arr[0]', 'arr[1]', 'arr[2] (value 30)', 'The memory address of arr[2]'],
    correctIndex: 2,
    explanation: 'In C, `*(arr + i)` is exact pointer arithmetic equivalent to `arr[i]`. `*(arr + 2)` accesses element at index 2 (value 30).',
  },
  {
    id: 'q7',
    category: 'conditionals',
    question: 'What happens when this switch statement is executed?',
    codeSnippet: `#include <stdio.h>

int main() {
    int i = 2;
    switch(i) {
        case 1: printf("1 ");
        case 2: printf("2 ");
        case 3: printf("3 ");
        default: printf("D");
    }
    return 0;
}`,
    options: ['2', '2 3 D', '2 3', 'Compilation Error'],
    correctIndex: 1,
    explanation: 'Because there are no `break;` statements, execution falls through from `case 2` to `case 3` and `default`, printing "2 3 D".',
  },
  {
    id: 'q8',
    category: 'basics-io',
    question: 'Why is `&` required for `scanf("%d", &num)` but NOT for `scanf("%s", str)` where `char str[20];`?',
    options: [
      'Arrays in C automatically decay to pointers (their base address)',
      'Strings are primitive types in C',
      'scanf has a special exception for strings',
      'It is actually required, it will crash without &'
    ],
    correctIndex: 0,
    explanation: 'In C, an array name like `str` decays into a pointer to its first element `&str[0]`. Thus `str` is already a memory address, so no additional `&` is needed.',
  },
];
