import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './PositionNode.css';

const PositionNode = ({ data, xPos, yPos }) => {
    return (
        <div className="position-node">
            <Handle type="target" position={Position.Top} />
            <div className="position-node-content">
                <div className="position-node-label">{data.label}</div>
                <div className="position-node-position">
                    x: {Math.round(xPos)}, y: {Math.round(yPos)}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(PositionNode);