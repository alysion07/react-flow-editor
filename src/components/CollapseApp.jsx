// NodeEditor.js
import React, { useState, useMemo } from 'react';
import ReactFlow, {
    Background,
    Handle,
    Position,
    getBezierPath
} from 'react-flow-renderer';

import { collapseSeries } from './collapseSeries.jsx';

/**
 * 1) PIPE 노드 컴포넌트
 *    - 위쪽에서 입력, 아래쪽에서 출력
 */
const PipeNode = ({ id, data }) => (
    <div
        style={{
            padding: 8,
            border: '2px solid #1A192B',
            borderRadius: 4,
            background: '#DDEFFE',
            minWidth: 80,
            textAlign: 'center',
            fontWeight: 'bold'
        }}
    >
        {/* upstream 연결 핸들 */}
        <Handle
            type="target"
            position={Position.Top}
            id={`in-${id}`}
            style={{ background: '#555' }}
        />
        {data.label}
        {/* downstream 연결 핸들 */}
        <Handle
            type="source"
            position={Position.Bottom}
            id={`out-${id}`}
            style={{ background: '#555' }}
        />
    </div>
);

/**
 * 2) 기본 엣지 컴포넌트 (Bezier 곡선 + 화살표)
 */
const CustomEdge = ({
                        id,
                        sourceX,
                        sourceY,
                        sourcePosition,
                        targetX,
                        targetY,
                        targetPosition,
                        style,
                        markerEnd
                    }) => {
    const path = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    });
    return (
        <path
            id={id}
            d={path}
            style={{ ...style, stroke: '#888', strokeWidth: 2 }}
            fill="none"
            markerEnd={markerEnd}
        />
    );
};

export default function CollepseNodeEditor({ fullNodes, fullEdges }) {
    const [collapseOn, setCollapseOn] = useState(true);

    const { nodes, edges } = useMemo(() => {
        if (collapseOn) {
            return collapseSeries(fullNodes, fullEdges);
        }
        return {
            nodes: fullNodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
            edges: fullEdges.map(e => ({ id: e.id, source: e.source, target: e.target }))
        };
    }, [collapseOn, fullNodes, fullEdges]);

    return (
        <div style={{ height: 600 }}>
            <label style={{ position: 'absolute', zIndex: 10, padding: 8 }}>
                <input
                    type="checkbox"
                    checked={collapseOn}
                    onChange={e => setCollapseOn(e.target.checked)}
                />{' '}
                Series Junction Collapse
            </label>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={{ PIPE: PipeNode }}
                edgeTypes={{ default: CustomEdge }}
                fitView
            >
                <Background gap={16} color="#aaa" />
            </ReactFlow>
        </div>
    );
}
