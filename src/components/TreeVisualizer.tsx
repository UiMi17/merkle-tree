import React from 'react';
import {MerkleNode} from "../merkle";

interface TreeVisualizerProps {
    root: MerkleNode;
    highlightLeafIndex?: number;
    leaves: MerkleNode[];
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
                                                                  root,
                                                                  highlightLeafIndex,
                                                                  leaves,
                                                              }) => {
    const highlightedHash =
        highlightLeafIndex !== undefined && leaves[highlightLeafIndex]
            ? leaves[highlightLeafIndex].hash
            : undefined;

    function renderNode(
        node: MerkleNode,
        depth: number,
        key: string
    ): React.ReactNode {
        const isHighlight = node.hash === highlightedHash;
        return (
            <div
                key={key}
                style={{
                    marginLeft: depth * 24,
                    marginTop: 8,
                    padding: 8,
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    background: isHighlight
                        ? 'linear-gradient(90deg,#aaffc3,#e0ffe0)'
                        : node.isLeaf
                            ? '#fff'
                            : '#f7f7f7',
                    color: isHighlight ? '#185c37' : '#222',
                    fontWeight: isHighlight ? 600 : 400,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    boxShadow: isHighlight
                        ? '0 0 4px 2px #81e6d9'
                        : '0 1px 2px #0001',
                }}
            >
                <div>
                    <b>
                        {node.isLeaf ? 'Leaf' : 'Node'}
                        {isHighlight ? ' (selected)' : ''}
                    </b>
                </div>
                <div style={{wordBreak: 'break-all'}}>
                    <span>Hash: {node.hash}</span>
                </div>
                {node.isLeaf && node.data && (
                    <div>
                        <span>Data: </span>
                        <span style={{color: '#005', fontWeight: 500}}>
              {node.data}
            </span>
                    </div>
                )}
                {!node.isLeaf && (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div>{renderNode(node.left!, depth + 1, key + 'L')}</div>
                        <div style={{width: 8}}/>
                        <div>{renderNode(node.right!, depth + 1, key + 'R')}</div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <h3>Merkle Tree</h3>
            <div>{renderNode(root, 0, 'root')}</div>
        </div>
    );
};