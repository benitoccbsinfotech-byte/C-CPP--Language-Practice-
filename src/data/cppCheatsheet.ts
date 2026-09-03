import { CheatsheetTopic } from '../types';

export const CPP_CHEATSHEET_TOPICS: CheatsheetTopic[] = [
  {
    id: 'cpp-streams-io',
    title: 'Modern I/O: iostream, std::cout & std::cin',
    category: 'Input / Output',
    description: 'C++ provides type-safe stream objects replacing printf and scanf from C.',
    code: `// Headers:
#include <iostream>
#include <iomanip>  // for std::setprecision, std::setw
#include <string>

// Output:
std::cout << "Hello " << name << " | Age: " << age << std::endl;

// Input:
int x;
double y;
std::string str;
std::cin >> x >> y >> str;

// Reading full line with spaces:
std::string line;
std::getline(std::cin, line);

// Formatting Floats:
std::cout << std::fixed << std::setprecision(2) << 3.14159; // Output: 3.14`,
    notes: [
      'No format specifiers (%d, %s) needed; C++ streams infer types automatically.',
      'std::endl adds \\n AND flushes the stream buffer; for faster competitive programming, prefer \\n.',
    ],
    courseId: 'cpp',
  },

  {
    id: 'cpp-references-const',
    title: 'References & Const Correctness',
    category: 'Memory & Semantics',
    description: 'References act as non-null aliases to variables without pointer dereference overhead.',
    code: `int x = 10;
int &ref = x;       // ref is an alias for x
ref = 25;           // x is now 25

// Pass-by-reference (modifies caller variable):
void swap(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

// Pass-by-const-reference (avoids expensive copying of large objects):
void printData(const std::string &data) {
    // data cannot be modified here
    std::cout << data << std::endl;
}`,
    notes: [
      'References must be initialized upon declaration and cannot be null or reseated.',
      'Always pass heavy structures (std::vector, std::string) by `const &` to eliminate copies.',
    ],
    courseId: 'cpp',
  },

  {
    id: 'cpp-stl-vector-containers',
    title: 'STL Containers: std::vector & std::string',
    category: 'STL Containers',
    description: 'The C++ Standard Template Library provides dynamic containers with automatic memory management.',
    code: `#include <vector>
#include <algorithm> // for sort, reverse

// Vector Creation & Methods:
std::vector<int> nums = {10, 20, 30};
nums.push_back(40);     // Append: {10, 20, 30, 40}
nums.pop_back();        // Remove last element
int size = nums.size(); // Current count: 3
bool empty = nums.empty();

// Range-based for loop:
for (int val : nums) {
    std::cout << val << " ";
}

// Range-based for loop with mutation:
for (int &val : nums) {
    val *= 2;
}

// Sorting STL Containers:
std::sort(nums.begin(), nums.end());`,
    notes: [
      'std::vector reallocates geometrically (doubling capacity) on growth.',
      'Accessing via vec[i] does not check bounds; use vec.at(i) if bounds check is needed.',
    ],
    courseId: 'cpp',
  },

  {
    id: 'cpp-classes-oop',
    title: 'Classes, Constructors & Encapsulation',
    category: 'Object-Oriented Programming',
    description: 'C++ classes group data and member functions with access control specifiers.',
    code: `class Rectangle {
private:
    double width;
    double height;

public:
    // Constructor with Member Initializer List:
    Rectangle(double w, double h) : width(w), height(h) {}

    // Destructor:
    ~Rectangle() {
        // Cleanup if dynamically allocated
    }

    // Const Member Function (does not mutate object):
    double getArea() const {
        return width * height;
    }

    void setWidth(double w) {
        if (w > 0) width = w;
    }
};

// Instantiation:
Rectangle rect(10.0, 5.0);
std::cout << "Area: " << rect.getArea() << std::endl;`,
    notes: [
      'Class members are private by default; struct members are public by default in C++.',
      'Use Member Initializer Lists (`: member(val)`) for efficient constructor initialization.',
    ],
    courseId: 'cpp',
  },

  {
    id: 'cpp-inheritance-virtual',
    title: 'Inheritance, Virtual Functions & Polymorphism',
    category: 'Object-Oriented Programming',
    description: 'Runtime polymorphism enables uniform interface dispatch via base references/pointers.',
    code: `class Animal {
public:
    virtual void speak() const {
        std::cout << "Generic sound\\n";
    }
    virtual ~Animal() = default; // Always make base destructors virtual!
};

class Dog : public Animal {
public:
    void speak() const override {
        std::cout << "Woof!\\n";
    }
};

void makeItSpeak(const Animal &a) {
    a.speak(); // Dynamic dispatch via vtable
}

Dog myDog;
makeItSpeak(myDog); // Prints: Woof!`,
    notes: [
      'Always declare base class destructors as virtual (`virtual ~Base() = default;`) to prevent memory leaks when deleting derived objects via base pointers.',
    ],
    courseId: 'cpp',
  },

  {
    id: 'cpp-smart-pointers-raii',
    title: 'Smart Pointers & RAII (std::unique_ptr, std::shared_ptr)',
    category: 'Memory Management',
    description: 'Resource Acquisition Is Initialization (RAII) eliminates manual memory management.',
    code: `#include <memory>

// std::unique_ptr (Exclusive Ownership - Zero Overhead):
std::unique_ptr<int> p1 = std::make_unique<int>(42);
std::cout << *p1 << std::endl; // Automatically freed when p1 leaves scope!

// Transferring ownership:
std::unique_ptr<int> p2 = std::move(p1); // p1 is now null

// std::shared_ptr (Reference-counted Shared Ownership):
std::shared_ptr<int> s1 = std::make_shared<int>(100);
std::shared_ptr<int> s2 = s1; // Ref count = 2`,
    notes: [
      'Never use raw `new` and `delete` in modern C++; use `std::make_unique` instead.',
    ],
    courseId: 'cpp',
  },
];
