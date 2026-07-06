import { Question } from './models';

export const QUESTION_BANK: Question[] = [
  // ==========================================
  // PYTHON QUESTIONS
  // ==========================================
  // Python - Beginner
  {
    id: 'py-beg-1',
    skill: 'Python',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'Which of the following data types in Python is immutable?',
    options: ['List', 'Dictionary', 'Set', 'Tuple'],
    answer: '3', // index of 'Tuple'
    explanation: 'Tuples in Python are immutable, meaning their elements cannot be changed or reassigned once created.',
    tags: ['Basic Concept', 'Data Types']
  },
  {
    id: 'py-beg-2',
    skill: 'Python',
    difficulty: 'Beginner',
    type: 'Code Output',
    question: 'What is the output of the following code snippet?\n\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))\n```',
    answer: '4',
    explanation: 'Variables in Python hold references to objects. "y = x" binds y to the same list object as x. Modifying y modifies the shared object, so the length of x becomes 4.',
    tags: ['Simple Coding', 'Lists', 'Pointers']
  },
  {
    id: 'py-beg-3',
    skill: 'Python',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'What does the expression "hello" * 3 evaluate to in Python?',
    options: ['Syntax Error', 'hellohellohello', '["hello", "hello", "hello"]', 'hello 3 times'],
    answer: '1', // index of 'hellohellohello'
    explanation: 'Multiplying a string by an integer in Python repeats the string that number of times.',
    tags: ['Aptitude', 'Operators', 'Strings']
  },
  // Python - Intermediate
  {
    id: 'py-int-1',
    skill: 'Python',
    difficulty: 'Intermediate',
    type: 'MCQ',
    question: 'Which keyword is used to create a generator function in Python?',
    options: ['return', 'generator', 'yield', 'next'],
    answer: '2', // index of 'yield'
    explanation: 'The yield keyword pauses generator function execution and returns a value to the caller, resuming from that point on subsequent next() calls.',
    tags: ['Medium Concept', 'Generators']
  },
  {
    id: 'py-int-2',
    skill: 'Python',
    difficulty: 'Intermediate',
    type: 'Code Completion',
    question: 'Complete the list comprehension to extract only even numbers:\n\n```python\nnums = [1, 2, 3, 4, 5, 6]\nevens = [x for x in nums if _______]\n```',
    answer: 'x % 2 == 0',
    explanation: 'The condition "x % 2 == 0" evaluates to True only if the number x is divisible by 2.',
    tags: ['Coding', 'Comprehensions']
  },
  {
    id: 'py-int-3',
    skill: 'Python',
    difficulty: 'Intermediate',
    type: 'Real-world Scenario',
    question: 'A script is failing with a FileNotFoundError. Which block is correct to safely handle this error?',
    options: [
      'try: open("data.txt") except IOError: print("error")',
      'try: open("data.txt") except FileNotFoundError: print("not found")',
      'try: open("data.txt") except Exception: print("error")'
    ],
    answer: '1',
    explanation: 'Specifically catching FileNotFoundError is the most pythonic and precise way to handle missing files without silencing unrelated exceptions.',
    tags: ['Problem Solving', 'Exceptions']
  },
  // Python - Advanced
  {
    id: 'py-adv-1',
    skill: 'Python',
    difficulty: 'Advanced',
    type: 'Code Completion',
    question: 'Implement the __enter__ and __exit__ methods to create a custom context manager. What is the parameter signature of __exit__?',
    options: [
      'self',
      'self, exc_type, exc_val, exc_tb',
      'self, exception',
      'self, type, value'
    ],
    answer: '1',
    explanation: 'The __exit__ method of a context manager must accept four arguments: self, exc_type (exception class), exc_val (exception instance), and exc_tb (traceback object).',
    tags: ['Coding', 'Context Managers', 'Advanced OOP']
  },
  {
    id: 'py-adv-2',
    skill: 'Python',
    difficulty: 'Advanced',
    type: 'Code Output',
    question: 'What is the output of this decorator code snippet?\n\n```python\ndef dec(f):\n    def wrap(*args):\n        return f(*args) * 2\n    return wrap\n\n@dec\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))\n```',
    answer: '10',
    explanation: 'The decorator wraps add(a,b) and multiplies its return value by 2. add(2,3) returns 5, which the wrapper multiplies to return 10.',
    tags: ['Coding', 'Decorators']
  },
  {
    id: 'py-adv-3',
    skill: 'Python',
    difficulty: 'Advanced',
    type: 'Real-world Scenario',
    question: 'Your application needs to parse a 20GB CSV log file on a VM with only 4GB RAM. What is the best strategy to prevent MemoryError?',
    options: [
      'Read the file using file.read() into a massive string',
      'Use generator-based chunking with pandas.read_csv(chunksize=...)',
      'Increase the virtual memory swap space on the Linux VM'
    ],
    answer: '1',
    explanation: 'Using chunked generation loads only a small subset of rows into memory at a time, keeping memory utilization minimal regardless of file size.',
    tags: ['Real-world Use Case', 'Performance', 'Streaming']
  },

  // ==========================================
  // SQL QUESTIONS
  // ==========================================
  // SQL - Beginner
  {
    id: 'sql-beg-1',
    skill: 'SQL',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'Which SQL keyword is used to retrieve distinct values?',
    options: ['UNIQUE', 'DIFFERENT', 'DISTINCT', 'EXCLUSIVE'],
    answer: '2',
    explanation: 'The DISTINCT keyword is used inside SELECT statements to filter out duplicate rows.',
    tags: ['Basic Concept', 'Queries']
  },
  {
    id: 'sql-beg-2',
    skill: 'SQL',
    difficulty: 'Beginner',
    type: 'Code Completion',
    question: 'Complete the query to filter users who are active:\n\n```sql\nSELECT * FROM users WHERE status = _______\n```',
    answer: "'active'",
    explanation: 'In SQL, string literals are enclosed in single quotes, e.g. \'active\'.',
    tags: ['Simple Coding', 'Filters']
  },
  {
    id: 'sql-beg-3',
    skill: 'SQL',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'What is the default sorting order of ORDER BY?',
    options: ['Descending', 'Ascending', 'Unsorted', 'Alphabetical'],
    answer: '1',
    explanation: 'By default, the ORDER BY clause sorts records in ascending order (ASC).',
    tags: ['Aptitude', 'Sorting']
  },

  // ==========================================
  // JAVASCRIPT QUESTIONS
  // ==========================================
  // JavaScript - Beginner
  {
    id: 'js-beg-1',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'Which keyword declares a block-scoped variable that can be reassigned?',
    options: ['var', 'let', 'const', 'define'],
    answer: '1',
    explanation: 'The let keyword declares block-scoped variables that can be reassigned. const is for block-scoped read-only constants.',
    tags: ['Basic Concept', 'Variables']
  },
  {
    id: 'js-beg-2',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    type: 'Code Output',
    question: 'What is the output of: console.log(typeof NaN)?',
    answer: 'number',
    explanation: 'In JavaScript, NaN (Not-a-Number) is technically a numeric data type, so typeof NaN evaluates to "number".',
    tags: ['Simple Coding', 'Data Types']
  },
  {
    id: 'js-beg-3',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    type: 'MCQ',
    question: 'Which method adds one or more elements to the end of an array?',
    options: ['pop()', 'push()', 'shift()', 'unshift()'],
    answer: '1',
    explanation: 'push() appends elements to the end of an array, while unshift() adds them to the beginning.',
    tags: ['Aptitude', 'Arrays']
  }
];

export const getSkillList = (): string[] => {
  const skills = QUESTION_BANK.map(q => q.skill);
  return Array.from(new Set(skills));
};
