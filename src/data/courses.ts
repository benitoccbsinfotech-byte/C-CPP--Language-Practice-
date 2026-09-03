import { Course } from '../types';

export const COURSES: Course[] = [
  {
    id: 'c',
    name: 'C Systems Programming & Architecture',
    code: 'CS201',
    badge: 'C Language',
    accentColor: 'emerald',
    description: 'Pointers, Dynamic Heap Memory (malloc/free), Stack Frames, Structs, Bitwise Operators & Hardware Architecture.',
    language: 'c',
    level: 'Core Systems Programming',
    topicsCount: 17,
  },
  {
    id: 'cpp',
    name: 'Modern C++ & Object-Oriented Design',
    code: 'CS202',
    badge: 'C++ Language',
    accentColor: 'blue',
    description: 'Streams I/O, References, Classes & Encapsulation, Operator Overloading, STL Containers, Generics & Smart Pointers.',
    language: 'cpp',
    level: 'Modern & Object-Oriented',
    topicsCount: 8,
  },
];
