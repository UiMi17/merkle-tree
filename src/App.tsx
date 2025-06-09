import React, {useEffect, useState} from 'react';
import { MerkleProof, MerkleTree } from "./merkle";
import { TreeVisualizer } from "./components/TreeVisualizer";
import { ProofVisualizer } from "./components/ProofVisualizer";

const App: React.FC = () => {
    const [dataInput, setDataInput] = useState(
        ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'].join('\n')
    );
    const [tree, setTree] = useState<MerkleTree | null>(null);
    const [leafIndex, setLeafIndex] = useState<number>(0);
    const [proof, setProof] = useState<MerkleProof>([]);
    const [proofValid, setProofValid] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function buildTree() {
        setError(null);
        try {
            const items = dataInput
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);
            if (items.length === 0) throw new Error('Enter at least one data item.');
            const newTree = await MerkleTree.build(items);
            setTree(newTree);
            setLeafIndex(0);
            setProof([]);
            setProofValid(null);
        } catch (e: any) {
            setError(e.message || String(e));
            setTree(null);
            setProof([]);
            setProofValid(null);
        }
    }

    async function selectLeaf(idx: number) {
        if (!tree) return;
        setLeafIndex(idx);
        try {
            const prf = tree.getProof(idx);
            setProof(prf);
            const valid = await MerkleTree.verifyProof(
                tree['leaves'][idx].data!,
                prf,
                tree.getRootHash()
            );
            setProofValid(valid);
        } catch (e: any) {
            setProof([]);
            setProofValid(null);
            setError(e.message || String(e));
        }
    }

    // build the tree
    useEffect(() => {
        buildTree();
    }, []);

    React.useEffect(() => {
        if (tree) selectLeaf(leafIndex);
        // eslint-disable-next-line
    }, [tree]);

    const leaves = tree ? tree['leaves'] : [];

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
            <h2>Merkle Tree Explorer</h2>
            <section>
                <label htmlFor="data-input">
                    <b>Data Items (one per line):</b>
                </label>
                <textarea
                    id="data-input"
                    rows={7}
                    value={dataInput}
                    onChange={(e) => setDataInput(e.target.value)}
                    style={{
                        width: '100%',
                        fontFamily: 'monospace',
                        fontSize: 14,
                        marginTop: 8,
                        marginBottom: 8,
                        borderRadius: 6,
                        border: '1px solid #aaa',
                        padding: 8,
                    }}
                />
                <button onClick={buildTree} style={{ marginRight: 8 }}>
                    Build Merkle Tree
                </button>
                {error && (
                    <div style={{ color: 'red', marginTop: 8 }}>
                        <b>Error:</b> {error}
                    </div>
                )}
            </section>
            {tree && (
                <>
                    <section style={{ margin: '24px 0' }}>
                        <div>
                            <b>Root Hash:</b>
                            <span
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: 14,
                                    marginLeft: 8,
                                    background: '#efefef',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    wordBreak: 'break-all',
                                }}
                            >
                                {tree.getRootHash()}
                            </span>
                        </div>
                    </section>
                    <section>
                        <b>Select Leaf to Generate Proof:</b>
                        <div style={{ margin: '8px 0', display: 'flex', flexWrap: 'wrap' }}>
                            {leaves.map((leaf, i) => (
                                <button
                                    key={i}
                                    onClick={() => selectLeaf(i)}
                                    style={{
                                        marginRight: 8,
                                        marginBottom: 8,
                                        padding: '4px 12px',
                                        borderRadius: 5,
                                        border:
                                            leafIndex === i
                                                ? '2px solid #81e6d9'
                                                : '1px solid #ccc',
                                        background:
                                            leafIndex === i
                                                ? 'linear-gradient(90deg,#b6fcd5,#d5fbe8)'
                                                : '#f7f7f7',
                                        fontFamily: 'monospace',
                                        fontWeight: leafIndex === i ? 600 : 400,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {leaf.data}
                                </button>
                            ))}
                        </div>
                    </section>
                    <section style={{ margin: '24px 0' }}>
                        <ProofVisualizer proof={proof} />
                        {proofValid !== null && (
                            <div
                                style={{
                                    color: proofValid ? '#185c37' : 'red',
                                    fontWeight: 600,
                                    marginTop: 4,
                                }}
                            >
                                {proofValid ? 'Proof is VALID' : 'Proof is INVALID'}
                            </div>
                        )}
                    </section>
                    <section style={{ margin: '24px 0' }}>
                        <TreeVisualizer
                            root={tree['root']}
                            highlightLeafIndex={leafIndex}
                            leaves={leaves}
                        />
                    </section>
                </>
            )}
            <footer style={{ marginTop: 48, color: '#555', fontSize: 13 }}>
                <hr />
                <p>
                    <b>Security note:</b> Uses SHA-256 for all hashes. Merkle tree logic
                    is original and self-contained. <br />
                    <span>
                        View on{' '}
                        <a
                            href="https://en.wikipedia.org/wiki/Merkle_tree"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Wikipedia: Merkle tree
                        </a>
                    </span>
                </p>
            </footer>
        </div>
    );
};

export default App;