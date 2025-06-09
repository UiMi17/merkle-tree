import React from 'react';
import {MerkleProof} from "../merkle";

interface ProofVisualizerProps {
    proof: MerkleProof;
}

export const ProofVisualizer: React.FC<ProofVisualizerProps> = ({ proof }) => {
    if (!proof.length) return <span>No proof</span>;
    return (
        <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
            <h4>Merkle Proof</h4>
            <ol>
                {proof.map((step, i) => (
                    <li key={i}>
                        <b>{step.direction.toUpperCase()}</b> sibling hash:{' '}
                        <span style={{ wordBreak: 'break-all', color: '#333' }}>
              {step.siblingHash}
            </span>
                    </li>
                ))}
            </ol>
        </div>
    );
};