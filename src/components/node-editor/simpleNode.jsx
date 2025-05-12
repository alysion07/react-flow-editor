
export function SimplifiedNode({ data }) {
    return (
        <div style={{ width: 24, height: 24 }}>
            <img src={data.icon} alt="" style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
