/**
 * fullNodes: [{ id, type: 'PIPE'|'JUNCTION', data }]
 * fullEdges: [{ id, source, target }]
 */
export function collapseSeries(fullNodes, fullEdges) {
    // degree-2인 Junction만 골라냄
    const seriesJunctions = new Set(
        fullNodes
            .filter(n => n.type === 'JUNCTION')
            .filter(j => {
                const cnt = fullEdges.reduce((c, e) =>
                        c + (e.source === j.id || e.target === j.id ? 1 : 0)
                    , 0);
                return cnt === 2;
            })
            .map(j => j.id)
    );

    // PIPE 노드만 남김
    const nodes = fullNodes
        .filter(n => n.type === 'PIPE')
        .map(n => ({ id: n.id, type: 'PIPE', data: n.data }));

    // collapsed edges 리스트
    const collapsedEdges = [];

    // series junction마다 직렬 양쪽 PIPE 찾아 연결
    seriesJunctions.forEach(jId => {
        // jId와 연결된 두 엣지
        const linked = fullEdges.filter(e => e.source === jId || e.target === jId);
        if (linked.length === 2) {
            const [e1, e2] = linked;
            const a = e1.source === jId ? e1.target : e1.source;
            const b = e2.source === jId ? e2.target : e2.source;
            collapsedEdges.push({
                id: `collapsed_${a}_${b}`,
                source: a,
                target: b,
                // 원본 엣지 아이디 보존
                collapsedFrom: [e1.id, e2.id],
            });
        }
    });

    // series가 아닌 나머지 엣지는 그대로
    const normalEdges = fullEdges
        .filter(e => !seriesJunctions.has(e.source) && !seriesJunctions.has(e.target))
        .map(e => ({ id: e.id, source: e.source, target: e.target }));

    return {
        nodes,
        edges: [...normalEdges, ...collapsedEdges],
    };
}
