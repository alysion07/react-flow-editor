import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './styles/NodeItem.css';

const NodeItem = ({ data, xPos, yPos, type }) => {
    return (
        <div className="node">
            <div className="node-header">
                {/*<div className="node-icon">{componentDef.icon}</div>*/}
                <div className="position-node-label">{data.label}</div>
                <div className="node-title">
                    {/*{node.name || componentDef.label}*/}
                </div>
                <button
                    className="node-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        // if (onDelete) onDelete();
                        // TODO : 삭제기능 구현 필요
                    }}
                >
                    ×
                </button>
            </div>
            {/* node body */ }
            <div className="node-body">
                <Handle type="target" position={Position.Top}/>
                <div className="node-content">
                    <div className="node-position">
                        x: {Math.round(xPos)}, y: {Math.round(yPos)}
                    </div>
                </div>
                <Handle type="source" position={Position.Bottom}/>
            </div>
        </div>
    );
};

export default memo(NodeItem);