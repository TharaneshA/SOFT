import type { FileType } from "@/types/file"

export const mockFiles: FileType[] = [
  {
    id: "1",
    name: "problem4.pdf",
    path: "/Users/thara/Documents/UCI/Winter_24/ICS 33/PSET/PSET 8/problem4.pdf",
    type: "pdf",
    summary:
      "Through the past 10 weeks, this course has peeled away the abstraction that Python graciously provides, teaching me about namespaces, attribution, interfaces, time and memory complexities, and more.",
    content: `In learning about the intricacies of Python through ICS 33, I've learned how to interact with a seemingly high level programming language at a lower level. Through the past 10 weeks, this course has peeled away layer-by-layer the abstraction that Python graciously provides, teaching me about namespaces, attribution, interfaces, time and memory complexities, and more. In the past, I'd treated Python as second-class citizen in the world of software development, where I could fire up my IDE and just write something that worked. This course gave me the chance to really analyze the inner workings, not only of languages (such was learned by implementing GRIN), but also why I'm writing the code I'm writing.`,
    modified: new Date("2024-03-15"),
  },
  {
    id: "2",
    name: "32A Topic 8 - Networks and Graphs.pdf",
    path: "/Users/thara/Documents/UCLA/Math 32A/Topic 8 - Networks and Graphs.pdf",
    type: "pdf",
    summary: "Introduction to graph theory and network analysis in the context of mathematical modeling.",
    content:
      "This document covers the fundamentals of graph theory, including vertices, edges, adjacency matrices, and path algorithms. It explores applications in social networks, transportation systems, and computer science.",
    modified: new Date("2024-02-20"),
  },
  {
    id: "3",
    name: "Topic 1 - Modules and Namespaces.pdf",
    path: "/Users/thara/Documents/UCI/Winter_24/ICS 33/Topic 1 - Modules and Namespaces.pdf",
    type: "pdf",
    summary: "Introduction to Python modules, packages, and namespace management.",
    content:
      "This document explains how Python organizes code into modules and packages, and how namespaces work to prevent naming conflicts. It covers import statements, module search paths, and best practices for organizing Python projects.",
    modified: new Date("2024-01-10"),
  },
  {
    id: "4",
    name: "Topic 10 & 11 - Generators and Iterators.pdf",
    path: "/Users/thara/Documents/UCI/Winter_24/ICS 33/Topic 10 & 11 - Generators and Iterators.pdf",
    type: "pdf",
    summary: "Detailed explanation of Python generators and iterators with examples.",
    content:
      "This document covers Python's iteration protocol, including iterables, iterators, and generators. It explains how to create custom iterators and how to use generator functions and expressions for memory-efficient data processing.",
    modified: new Date("2024-03-01"),
  },
  {
    id: "5",
    name: "camera.h",
    path: "/Users/thara/Documents/Projects/OpenGL/include/camera.h",
    type: "h",
    summary: "Header file for a camera class in a 3D graphics application.",
    content:
      "This header file defines a Camera class for a 3D graphics application using OpenGL. It includes methods for camera movement, rotation, and perspective projection calculations.",
    modified: new Date("2023-11-15"),
  },
  {
    id: "6",
    name: "pygame_mask.h",
    path: "/Users/thara/Documents/Projects/PyGame/src/pygame_mask.h",
    type: "h",
    summary: "Header file for collision detection masks in PyGame.",
    content:
      "This header file defines structures and functions for implementing collision detection masks in PyGame. It includes methods for creating, manipulating, and testing masks for sprite collision.",
    modified: new Date("2023-12-05"),
  },
  {
    id: "7",
    name: "Topic 7 - Databases & SQL.pdf",
    path: "/Users/thara/Documents/UCI/Winter_24/ICS 33/Topic 7 - Databases & SQL.pdf",
    type: "pdf",
    summary: "Introduction to relational databases and SQL in Python.",
    content:
      "This document covers the basics of relational databases, SQL queries, and how to interact with databases using Python's sqlite3 module. It includes examples of creating tables, inserting data, and performing queries.",
    modified: new Date("2024-02-15"),
  },
]
