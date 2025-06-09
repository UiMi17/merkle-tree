# Merkle Tree Explorer

A simple, self-contained tool to visualize and verify Merkle trees in the browser.  
Enter data items, build the tree, and interactively generate and validate Merkle proofs for each leaf.

## Features

- Build a Merkle tree from any list of strings.
- Visualize the full tree structure.
- Select any leaf to view its Merkle proof.
- Validate proofs and see the root hash update live.
- Clean, readable UI; works entirely in your browser.

## Usage

1. Clone or download this repository.
2. Install dependencies and run locally:
   ```bash
   npm install
   npm start
   ```
3. Enter one data item per line in the input box.
4. Click "Build Merkle Tree" to visualize and interact with the tree.

## Technologies

- React
- TypeScript
- SHA-256 hashing via the browser's Web Crypto API

## What is a Merkle Tree?

A Merkle tree is a binary tree of hashes that allows efficient and secure verification of the contents of large data sets.  
Learn more: [Wikipedia: Merkle tree](https://en.wikipedia.org/wiki/Merkle_tree)
