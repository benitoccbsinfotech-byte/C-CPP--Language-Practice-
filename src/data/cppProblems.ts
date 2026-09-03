import { PracticeProblem } from '../types';

export const CPP_PRACTICE_PROBLEMS: PracticeProblem[] = [
  // 1. BASICS & I/O
  {
    id: 'cpp-hello-world',
    title: 'Hello, Modern C++!',
    category: 'basics-io',
    difficulty: 'Easy',
    summary: 'Master C++ streams, namespace std, and formatted console output with std::cout.',
    description: `Welcome to C++! Write a modern C++ program that prints \`Hello, Modern C++!\` to standard output followed by a newline.
    
### Key Concepts
- \`#include <iostream>\`: The C++ Standard Input / Output Stream library.
- \`std::cout\`: The standard character output stream object.
- \`<<\` Stream Insertion Operator: Sends data to the output stream.
- \`std::endl\` or \`\\n\`: Inserts a newline and flushes the buffer.`,
    learningPoints: [
      'Understand C++ iostream vs C stdio.h',
      'Use the << stream insertion operator',
      'Understand std namespace resolution (std::cout)',
      'Difference between std::endl and \\n',
    ],
    initialCode: `#include <iostream>

int main() {
    // Write your std::cout statement below:
    
    return 0;
}`,
    solutionCode: `#include <iostream>

int main() {
    std::cout << "Hello, Modern C++!" << std::endl;
    return 0;
}`,
    explanation: `\`std::cout\` is an instance of \`std::ostream\` in the \`<iostream>\` header. The stream insertion operator \`<<\` chains variables and strings seamlessly without needing type specifiers like \`%s\` or \`%d\`.`,
    testCases: [
      {
        id: 'cpp-tc1',
        input: '',
        expectedOutput: 'Hello, Modern C++!\n',
        description: 'Standard stream output greeting',
      },
    ],
    hint: 'Use `std::cout << "Hello, Modern C++!" << std::endl;`',
    commonPitfalls: [
      'Forgetting `#include <iostream>` header.',
      'Using `printf` format specifiers inside `std::cout`.',
      'Using `>>` instead of `<<` for output.',
    ],
    tags: ['I/O', 'iostream', 'cout', 'Basics'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 2. INPUT WITH CIN & STRINGS
  {
    id: 'cpp-cin-user-card',
    title: 'Streams I/O & std::string',
    category: 'basics-io',
    difficulty: 'Easy',
    summary: 'Read name, age, and GPA using std::cin and std::string with chained stream extraction.',
    description: `Read a student's name (string), age (int), and GPA (double) from standard input using \`std::cin\`. Output them formatted as:
    
\`Student: <name> | Age: <age> | GPA: <gpa>\`

### Example
**Input:**
\`Alice 20 3.95\`

**Output:**
\`Student: Alice | Age: 20 | GPA: 3.95\``,
    learningPoints: [
      'Using std::cin with extraction operator >>',
      'Using std::string for dynamic text handling without buffer overflows',
      'Chaining multiple stream inputs in a single line',
    ],
    initialCode: `#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;
    double gpa;
    
    // Read name, age, gpa from std::cin
    
    // Output formatted profile with std::cout
    
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;
    double gpa;
    
    std::cin >> name >> age >> gpa;
    std::cout << "Student: " << name << " | Age: " << age << " | GPA: " << gpa << std::endl;
    
    return 0;
}`,
    explanation: `\`std::cin >> name >> age >> gpa;\` safely parses whitespace-delimited tokens into strongly-typed C++ variables without needing pointer address-of operators (\`&\`).`,
    testCases: [
      {
        id: 'cpp-tc-cin-1',
        input: 'Alice 20 3.95',
        expectedOutput: 'Student: Alice | Age: 20 | GPA: 3.95\n',
        description: 'Standard student info',
      },
      {
        id: 'cpp-tc-cin-2',
        input: 'Bob 22 3.80',
        expectedOutput: 'Student: Bob | Age: 22 | GPA: 3.8\n',
        description: 'Different values',
      },
    ],
    hint: 'Use `std::cin >> name >> age >> gpa;` followed by `std::cout << ...`',
    commonPitfalls: [
      'Using `&name` with `std::cin` (unlike C scanf, C++ cin takes references directly).',
      'Forgetting `#include <string>` for `std::string`.',
    ],
    tags: ['cin', 'string', 'Streams'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 3. REFERENCES VS POINTERS
  {
    id: 'cpp-references-swap',
    title: 'Pass-by-Reference Swapper',
    category: 'references',
    difficulty: 'Easy',
    summary: 'Understand C++ reference semantics (&) to modify caller variables without pointer dereferencing.',
    description: `In C++, a reference (\`type &ref\`) is an alias for an existing variable. Unlike raw pointers, references cannot be NULL, cannot be reseated, and do not require the dereference operator (\`*\`).
    
Write a function \`void swapValues(int &a, int &b)\` that swaps two integers using pass-by-reference.

### Example
**Input:**
\`10 20\`

**Output:**
\`Before: a = 10, b = 20\`
\`After: a = 20, b = 10\``,
    learningPoints: [
      'Syntax and behavior of C++ references (int &ref)',
      'Pass-by-reference vs pass-by-value vs pass-by-pointer',
      'Zero-cost syntax without pointer dereferencing (*)',
    ],
    initialCode: `#include <iostream>

// Complete the swapValues function using references:
void swapValues(int &a, int &b) {
    // Swap logic here
}

int main() {
    int a, b;
    if (std::cin >> a >> b) {
        std::cout << "Before: a = " << a << ", b = " << b << std::endl;
        swapValues(a, b);
        std::cout << "After: a = " << a << ", b = " << b << std::endl;
    }
    return 0;
}`,
    solutionCode: `#include <iostream>

void swapValues(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int a, b;
    if (std::cin >> a >> b) {
        std::cout << "Before: a = " << a << ", b = " << b << std::endl;
        swapValues(a, b);
        std::cout << "After: a = " << a << ", b = " << b << std::endl;
    }
    return 0;
}`,
    explanation: `When a parameter is declared as \`int &a\`, it directly binds to the caller's variable in the stack frame. Any mutation to \`a\` directly affects the original variable without explicit pointer dereferencing.`,
    testCases: [
      {
        id: 'cpp-tc-ref-1',
        input: '10 20',
        expectedOutput: 'Before: a = 10, b = 20\nAfter: a = 20, b = 10\n',
        description: 'Swap 10 and 20',
      },
      {
        id: 'cpp-tc-ref-2',
        input: '99 -45',
        expectedOutput: 'Before: a = 99, b = -45\nAfter: a = -45, b = 99\n',
        description: 'Swap positive and negative integers',
      },
    ],
    hint: 'Store `a` in `int temp = a;`, assign `a = b;`, then `b = temp;`',
    commonPitfalls: [
      'Forgetting the `&` in parameter list makes it pass-by-value, which will not mutate the caller.',
      'Dereferencing `*a` on a reference is a syntax error because references are automatically dereferenced.',
    ],
    tags: ['References', 'Pass-by-Reference', 'Memory'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 4. CLASSES & ENCAPSULATION
  {
    id: 'cpp-class-bank-account',
    title: 'Class Design & Encapsulation',
    category: 'classes-oop',
    difficulty: 'Medium',
    summary: 'Build a BankAccount class with private member variables, constructor, deposit, withdraw, and getBalance methods.',
    description: `Object-Oriented Programming (OOP) in C++ combines data and behavior into \`class\` structures.

Create a \`BankAccount\` class with:
- **Private fields**: \`std::string owner\`, \`double balance\`
- **Constructor**: \`BankAccount(std::string ownerName, double initialBalance)\`
- **Methods**:
  - \`void deposit(double amount)\`: Adds amount to balance.
  - \`bool withdraw(double amount)\`: If balance >= amount, subtracts and returns \`true\`; otherwise leaves balance unchanged and returns \`false\`.
  - \`double getBalance()\`: Returns current balance.
  - \`void printStatement()\`: Prints \`Owner: <owner> | Balance: $<balance>\``,
    learningPoints: [
      'class keyword and access specifiers (public:, private:)',
      'Constructors and member initialization',
      'Encapsulation and data protection',
    ],
    initialCode: `#include <iostream>
#include <string>

class BankAccount {
private:
    std::string owner;
    double balance;

public:
    // 1. Implement Constructor:
    BankAccount(std::string name, double initial) {
        // ...
    }

    // 2. Implement deposit:
    void deposit(double amount) {
        // ...
    }

    // 3. Implement withdraw:
    bool withdraw(double amount) {
        // ...
    }

    // 4. Implement getBalance & printStatement:
    double getBalance() {
        return balance;
    }

    void printStatement() {
        std::cout << "Owner: " << owner << " | Balance: $" << balance << std::endl;
    }
};

int main() {
    BankAccount account("Cyrus", 500.0);
    account.deposit(250.0);
    account.withdraw(100.0);
    account.printStatement();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>

class BankAccount {
private:
    std::string owner;
    double balance;

public:
    BankAccount(std::string name, double initial) {
        owner = name;
        balance = initial;
    }

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    bool withdraw(double amount) {
        if (amount > 0 && balance >= amount) {
            balance -= amount;
            return true;
        }
        return false;
    }

    double getBalance() {
        return balance;
    }

    void printStatement() {
        std::cout << "Owner: " << owner << " | Balance: $" << balance << std::endl;
    }
};

int main() {
    BankAccount account("Cyrus", 500.0);
    account.deposit(250.0);
    account.withdraw(100.0);
    account.printStatement();
    return 0;
}`,
    explanation: `The \`BankAccount\` class demonstrates encapsulation. External code cannot corrupt the \`balance\` directly because it is marked \`private\`. Transactions must pass through member functions like \`deposit()\` and \`withdraw()\`.`,
    testCases: [
      {
        id: 'cpp-tc-class-1',
        input: '',
        expectedOutput: 'Owner: Cyrus | Balance: $650\n',
        description: 'Account transaction sequence',
      },
    ],
    hint: 'Initialize `owner = name; balance = initial;` inside the constructor.',
    commonPitfalls: [
      'Missing semicolon `;` at the end of class definition (`class Foo { ... };`).',
      'Forgetting `public:` makes all members `private` by default in C++ classes.',
    ],
    tags: ['OOP', 'Classes', 'Encapsulation', 'Constructors'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 5. STL VECTOR & ALGORITHMS
  {
    id: 'cpp-stl-vector-filter',
    title: 'STL Vector Filtering & Sum',
    category: 'stl-containers',
    difficulty: 'Medium',
    summary: 'Use std::vector<int> dynamic array to read integers, filter positive even numbers, and compute stats.',
    description: `\`std::vector\` is the primary dynamic array container in the C++ Standard Template Library (STL).
    
Given an integer $N$ followed by $N$ integers, read them into a \`std::vector<int>\`. Filter and print all even numbers, followed by their sum.

### Format
\`Even numbers: <n1> <n2> ...\`
\`Sum of evens: <sum>\`

### Example
**Input:**
\`5 12 7 8 15 4\`

**Output:**
\`Even numbers: 12 8 4\`
\`Sum of evens: 24\``,
    learningPoints: [
      'Using std::vector<int> dynamic sizing with push_back',
      'Iterating through vectors with range-based for loops',
      'Dynamic memory management without manual malloc/free',
    ],
    initialCode: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (!(std::cin >> n)) return 0;
    
    std::vector<int> nums;
    // Read n elements into nums using push_back
    
    // Filter evens and compute sum
    
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (!(std::cin >> n)) return 0;
    
    std::vector<int> nums;
    for (int i = 0; i < n; i++) {
        int val;
        std::cin >> val;
        nums.push_back(val);
    }
    
    std::vector<int> evens;
    int sum = 0;
    for (int num : nums) {
        if (num % 2 == 0) {
            evens.push_back(num);
            sum += num;
        }
    }
    
    std::cout << "Even numbers:";
    for (int e : evens) {
        std::cout << " " << e;
    }
    std::cout << std::endl;
    std::cout << "Sum of evens: " << sum << std::endl;
    
    return 0;
}`,
    explanation: `\`std::vector\` automatically reallocates heap memory when capacity is exceeded during \`push_back()\`, and cleanly deallocates its buffer upon leaving scope (RAII principle).`,
    testCases: [
      {
        id: 'cpp-tc-vec-1',
        input: '5 12 7 8 15 4',
        expectedOutput: 'Even numbers: 12 8 4\nSum of evens: 24\n',
        description: 'Mixed integers',
      },
      {
        id: 'cpp-tc-vec-2',
        input: '4 10 20 30 40',
        expectedOutput: 'Even numbers: 10 20 30 40\nSum of evens: 100\n',
        description: 'All even integers',
      },
    ],
    hint: 'Use `nums.push_back(val);` in a loop, then check `num % 2 == 0`.',
    commonPitfalls: [
      'Accessing `vec[i]` when `i >= vec.size()` causes out-of-bounds undefined behavior.',
      'Forgetting `#include <vector>`.',
    ],
    tags: ['STL', 'vector', 'Algorithms', 'Containers'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 6. OPERATOR OVERLOADING
  {
    id: 'cpp-operator-overloading',
    title: 'Complex Number Operator Overloading (+)',
    category: 'classes-oop',
    difficulty: 'Medium',
    summary: 'Overload the + operator on a custom Complex class to add mathematical complex numbers.',
    description: `C++ allows redefining how operators like \`+\`, \`-\`, \`*\`, \`==\` work on user-defined types.
    
Create a \`Complex\` class representing $a + bi$:
- Fields: \`double real\`, \`double imag\`
- Constructor: \`Complex(double r = 0, double i = 0)\`
- Overloaded \`+\` operator: \`Complex operator+(const Complex &other) const\`
- Method: \`void display()\` prints \`<real> + <imag>i\`

### Example
**Input:**
\`3.0 4.5 2.0 1.5\`

**Output:**
\`Result: 5 + 6i\``,
    learningPoints: [
      'Operator overloading syntax: returnType operator+(params)',
      'Passing objects by const reference for performance',
      'Returning new instances from overloaded arithmetic operators',
    ],
    initialCode: `#include <iostream>

class Complex {
public:
    double real;
    double imag;

    Complex(double r = 0, double i = 0) {
        real = r;
        imag = i;
    }

    // Overload the + operator here:
    Complex operator+(const Complex &other) const {
        // Return a new Complex object
    }

    void display() const {
        std::cout << real << " + " << imag << "i" << std::endl;
    }
};

int main() {
    double r1, i1, r2, i2;
    if (std::cin >> r1 >> i1 >> r2 >> i2) {
        Complex c1(r1, i1);
        Complex c2(r2, i2);
        Complex sum = c1 + c2;
        std::cout << "Result: ";
        sum.display();
    }
    return 0;
}`,
    solutionCode: `#include <iostream>

class Complex {
public:
    double real;
    double imag;

    Complex(double r = 0, double i = 0) {
        real = r;
        imag = i;
    }

    Complex operator+(const Complex &other) const {
        return Complex(real + other.real, imag + other.imag);
    }

    void display() const {
        std::cout << real << " + " << imag << "i" << std::endl;
    }
};

int main() {
    double r1, i1, r2, i2;
    if (std::cin >> r1 >> i1 >> r2 >> i2) {
        Complex c1(r1, i1);
        Complex c2(r2, i2);
        Complex sum = c1 + c2;
        std::cout << "Result: ";
        sum.display();
    }
    return 0;
}`,
    explanation: `The expression \`c1 + c2\` is syntactic sugar for \`c1.operator+(c2)\`. It returns a newly constructed \`Complex\` with summed real and imaginary components.`,
    testCases: [
      {
        id: 'cpp-tc-op-1',
        input: '3.0 4.5 2.0 1.5',
        expectedOutput: 'Result: 5 + 6i\n',
        description: 'Complex addition',
      },
      {
        id: 'cpp-tc-op-2',
        input: '10.0 2.0 5.0 8.0',
        expectedOutput: 'Result: 15 + 10i\n',
        description: 'Another complex pair',
      },
    ],
    hint: 'Return `Complex(real + other.real, imag + other.imag);` inside `operator+`.',
    commonPitfalls: [
      'Modifying `this` instance instead of returning a new result in arithmetic operator +.',
    ],
    tags: ['OOP', 'Operator Overloading', 'Complex'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 7. FUNCTION TEMPLATES
  {
    id: 'cpp-function-templates',
    title: 'Generic Function Templates',
    category: 'templates',
    difficulty: 'Easy',
    summary: 'Write a generic function template template <typename T> T findMax(T a, T b) for type-safe reuse.',
    description: `Templates enable generic programming where types are parameterized.
    
Write a function template \`findMax\` that compares two values of any type \`T\` and returns the greater one.

### Example
**Int comparison:**
\`findMax(15, 42)\` -> \`42\`

**Double comparison:**
\`findMax(3.14, 2.71)\` -> \`3.14\``,
    learningPoints: [
      'template <typename T> or template <class T> syntax',
      'Compile-time template instantiation',
      'Eliminating duplicate code for different data types',
    ],
    initialCode: `#include <iostream>

// Define generic findMax template here:
template <typename T>
T findMax(T a, T b) {
    // Return max of a and b
}

int main() {
    int i1 = 15, i2 = 42;
    double d1 = 3.14, d2 = 2.71;
    
    std::cout << "Max Int: " << findMax(i1, i2) << std::endl;
    std::cout << "Max Double: " << findMax(d1, d2) << std::endl;
    return 0;
}`,
    solutionCode: `#include <iostream>

template <typename T>
T findMax(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    int i1 = 15, i2 = 42;
    double d1 = 3.14, d2 = 2.71;
    
    std::cout << "Max Int: " << findMax(i1, i2) << std::endl;
    std::cout << "Max Double: " << findMax(d1, d2) << std::endl;
    return 0;
}`,
    explanation: `The C++ compiler automatically generates two separate specialized function signatures (\`findMax<int>\` and \`findMax<double>\`) at compile-time with zero runtime overhead.`,
    testCases: [
      {
        id: 'cpp-tc-tmpl-1',
        input: '',
        expectedOutput: 'Max Int: 42\nMax Double: 3.14\n',
        description: 'Template instantiation test',
      },
    ],
    hint: 'Use `return (a > b) ? a : b;` inside the template definition.',
    commonPitfalls: [
      'Calling `findMax(10, 3.14)` without explicit type parameter `findMax<double>(10, 3.14)` because types deduced for T would conflict (int vs double).',
    ],
    tags: ['Templates', 'Generics', 'Metaprogramming'],
    courseId: 'cpp',
    language: 'cpp',
  },

  // 8. INHERITANCE & POLYMORPHISM
  {
    id: 'cpp-inheritance-shapes',
    title: 'Inheritance & Virtual Functions',
    category: 'classes-oop',
    difficulty: 'Hard',
    summary: 'Design a base class Shape with virtual getArea() and derived classes Rectangle and Circle.',
    description: `Polymorphism allows objects of different derived classes to be treated through a common base pointer or reference.
    
Implement:
1. Base class \`Shape\` with \`virtual double getArea()\` and \`virtual std::string getName()\`.
2. Derived class \`Rectangle : public Shape\` with fields \`width\`, \`height\`.
3. Derived class \`Square : public Shape\` with field \`side\`.

Demonstrate dynamic dispatch by calculating and printing their areas.`,
    learningPoints: [
      'Base and derived class inheritance syntax (: public Base)',
      'virtual keyword for dynamic dispatch',
      'Runtime polymorphism with base references/pointers',
    ],
    initialCode: `#include <iostream>
#include <string>

class Shape {
public:
    virtual std::string getName() const {
        return "Generic Shape";
    }
    virtual double getArea() const {
        return 0.0;
    }
};

class Rectangle : public Shape {
private:
    double width;
    double height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    std::string getName() const override {
        return "Rectangle";
    }
    double getArea() const override {
        return width * height;
    }
};

class Square : public Shape {
private:
    double side;
public:
    Square(double s) : side(s) {}
    
    std::string getName() const override {
        return "Square";
    }
    double getArea() const override {
        return side * side;
    }
};

void printShapeInfo(const Shape &shape) {
    std::cout << shape.getName() << " area: " << shape.getArea() << std::endl;
}

int main() {
    Rectangle rect(5.0, 4.0);
    Square sq(6.0);
    
    printShapeInfo(rect);
    printShapeInfo(sq);
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>

class Shape {
public:
    virtual std::string getName() const {
        return "Generic Shape";
    }
    virtual double getArea() const {
        return 0.0;
    }
};

class Rectangle : public Shape {
private:
    double width;
    double height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    std::string getName() const override {
        return "Rectangle";
    }
    double getArea() const override {
        return width * height;
    }
};

class Square : public Shape {
private:
    double side;
public:
    Square(double s) : side(s) {}
    
    std::string getName() const override {
        return "Square";
    }
    double getArea() const override {
        return side * side;
    }
};

void printShapeInfo(const Shape &shape) {
    std::cout << shape.getName() << " area: " << shape.getArea() << std::endl;
}

int main() {
    Rectangle rect(5.0, 4.0);
    Square sq(6.0);
    
    printShapeInfo(rect);
    printShapeInfo(sq);
    return 0;
}`,
    explanation: `Through the \`virtual\` keyword and vtable mechanism, \`printShapeInfo\` invokes the appropriate derived class method at runtime even when passed a base \`Shape &\` reference.`,
    testCases: [
      {
        id: 'cpp-tc-poly-1',
        input: '',
        expectedOutput: 'Rectangle area: 20\nSquare area: 36\n',
        description: 'Polymorphic shape area calculation',
      },
    ],
    hint: 'Use the `override` specifier on derived classes for compiler verification.',
    commonPitfalls: [
      'Omitting `virtual` causes static early-binding, calling the base `Shape::getArea()` instead of derived implementation.',
    ],
    tags: ['Inheritance', 'Polymorphism', 'Virtual', 'OOP'],
    courseId: 'cpp',
    language: 'cpp',
  },
];
