/**
 * hashes a buffer or string using SHA-256 and returns the result as a hex string
 * + encodes data as utf-8
 * compatible with browsers and Node.js
 */
export async function hash(data: string): Promise<string> {
    const buffer = new TextEncoder().encode(data);

    if (
        typeof window !== 'undefined' &&
        window.crypto &&
        window.crypto.subtle &&
        typeof window.crypto.subtle.digest === 'function'
    ) {
        const digest = await window.crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    } else {
        throw new Error('No secure crypto implementation found for SHA-256');
    }
}

/**
 * single node in the Merkle tree.
 */
export class MerkleNode {
    public readonly hash: string;
    public readonly left?: MerkleNode;
    public readonly right?: MerkleNode;
    public readonly isLeaf: boolean;
    public readonly data?: string;

    constructor(
        hash: string,
        left?: MerkleNode,
        right?: MerkleNode,
        data?: string
    ) {
        this.hash = hash;
        this.left = left;
        this.right = right;
        this.isLeaf = !left && !right;
        this.data = data;
    }
}

/**
 * merkle proof for a leaf.
 * steps contain the sibling hash and direction (left/right).
 */
export type MerkleProofStep = {
    siblingHash: string;
    direction: 'left' | 'right';
};

export type MerkleProof = MerkleProofStep[];

/**
 * implementation.
 */
export class MerkleTree {
    private readonly root: MerkleNode;
    private readonly leaves: MerkleNode[];
    private readonly leafMap: Map<string, MerkleNode[]>; // data hash -> leaf nodes

    /**
     * creates a merkle tree from an array of data strings.
     * (async for hashing)
     */
    static async build(dataItems: string[]): Promise<MerkleTree> {
        if (dataItems.length === 0)
            throw new Error('Cannot build Merkle tree with 0 items');
        // build leaf nodes (async hash)
        const hashes = await Promise.all(dataItems.map(item => hash(item)));
        const leaves = dataItems.map((item, i) => new MerkleNode(hashes[i], undefined, undefined, item));
        // build the tree
        const root = await MerkleTree.buildTree(leaves);
        // map data hash -> leaf nodes (for duplicate values)
        const leafMap = new Map<string, MerkleNode[]>();
        leaves.forEach((leaf) => {
            const arr = leafMap.get(leaf.hash) ?? [];
            arr.push(leaf);
            leafMap.set(leaf.hash, arr);
        });
        return new MerkleTree(leaves, root, leafMap);
    }

    private constructor(
        leaves: MerkleNode[],
        root: MerkleNode,
        leafMap: Map<string, MerkleNode[]>
    ) {
        this.leaves = leaves;
        this.root = root;
        this.leafMap = leafMap;
    }

    /**
     * returns the Merkle root hash.
     */
    getRootHash(): string {
        return this.root.hash;
    }

    /**
     * returns the leaf hashes in the same order as input data.
     */
    getLeafHashes(): string[] {
        return this.leaves.map((n) => n.hash);
    }

    /**
     * returns the merkle proof for the leaf at the given index.
     */
    getProof(index: number): MerkleProof {
        if (index < 0 || index >= this.leaves.length)
            throw new Error('Invalid leaf index');
        return MerkleTree.generateProof(this.root, this.leaves[index]);
    }

    /**
     * verifies a proof for a data item and a root hash.
     * returns true if valid, false otherwise.
     */
    static async verifyProof(
        data: string,
        proof: MerkleProof,
        rootHash: string
    ): Promise<boolean> {
        let computedHash = await hash(data);
        for (const step of proof) {
            if (step.direction === 'left') {
                computedHash = await hash(step.siblingHash + computedHash);
            } else {
                computedHash = await hash(computedHash + step.siblingHash);
            }
        }
        return computedHash === rootHash;
    }

    /**
     * recursively building the tree and return the root node.
     * + if number of nodes is odd, last node is duplicated.
     */
    private static async buildTree(nodes: MerkleNode[]): Promise<MerkleNode> {
        if (nodes.length === 1) {
            return nodes[0];
        }
        const nextLevel: MerkleNode[] = [];
        for (let i = 0; i < nodes.length; i += 2) {
            let left = nodes[i];
            let right: MerkleNode;
            if (i + 1 < nodes.length) {
                right = nodes[i + 1];
            } else {
                // Duplicate the last node, but as a new node with just the hash.
                right = new MerkleNode(left.hash);
            }
            const parentHash = await hash(left.hash + right.hash);
            nextLevel.push(new MerkleNode(parentHash, left, right));
        }
        return MerkleTree.buildTree(nextLevel);
    }

    /**
     * generates a proof for a given leaf node.
     * returns an array of sibling hashes and directions up to the root.
     */
    private static generateProof(
        root: MerkleNode,
        targetLeaf: MerkleNode
    ): MerkleProof {
        const proof: MerkleProof = [];

        function traverse(node: MerkleNode): boolean {
            if (node.isLeaf) return node === targetLeaf;
            if (!node.left || !node.right) throw new Error('Malformed tree');
            if (traverse(node.left)) {
                proof.push({ siblingHash: node.right.hash, direction: 'right' });
                return true;
            }
            if (traverse(node.right)) {
                proof.push({ siblingHash: node.left.hash, direction: 'left' });
                return true;
            }
            return false;
        }

        traverse(root);
        return proof;
    }
}