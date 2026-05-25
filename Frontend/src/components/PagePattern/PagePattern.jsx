import './PagePattern.css';

const plusShapes = [
  { x: '-1%', y: '12%', size: 132, thickness: 20, opacity: 0.15, color: '#6ee7c8', blur: 0.6, depth: 'back' },
  { x: '97%', y: '18%', size: 168, thickness: 24, opacity: 0.15, color: '#58d9b4', blur: 2, depth: 'back' },
  { x: '8%', y: '35%', size: 118, thickness: 18, opacity: 0.11, color: '#006041', blur: 1.2, depth: 'back' },
  { x: '88%', y: '38%', size: 104, thickness: 17, opacity: 0.11, color: '#006041', blur: 3, depth: 'front' },
  { x: '0%', y: '56%', size: 126, thickness: 20, opacity: 0.16, color: '#64e6c4', blur: 0.8, depth: 'front' },
  { x: '96%', y: '63%', size: 148, thickness: 22, opacity: 0.14, color: '#64e6c4', blur: 3.8, depth: 'back' },
  { x: '18%', y: '76%', size: 96, thickness: 16, opacity: 0.12, color: '#58d9b4', blur: 1.6, depth: 'back' },
  { x: '72%', y: '84%', size: 132, thickness: 20, opacity: 0.1, color: '#64e6c4', blur: 2.8, depth: 'front' },
  { x: '94%', y: '93%', size: 156, thickness: 24, opacity: 0.12, color: '#58d9b4', blur: 4.5, depth: 'back' },
  { x: '42%', y: '30%', size: 92, thickness: 15, opacity: 0.08, color: '#006041', blur: 0.4, depth: 'back' },
  { x: '57%', y: '58%', size: 108, thickness: 18, opacity: 0.08, color: '#5dddbd', blur: 2.4, depth: 'front' },
  { x: '28%', y: '92%', size: 102, thickness: 17, opacity: 0.09, color: '#006041', blur: 4, depth: 'back' },
  { x: '22%', y: '21%', size: 86, thickness: 14, opacity: 0.08, color: '#58d9b4', blur: 1, depth: 'front' },
  { x: '64%', y: '16%', size: 104, thickness: 17, opacity: 0.07, color: '#006041', blur: 3.2, depth: 'back' },
  { x: '32%', y: '45%', size: 78, thickness: 13, opacity: 0.07, color: '#64e6c4', blur: 0.8, depth: 'back' },
  { x: '70%', y: '46%', size: 88, thickness: 14, opacity: 0.08, color: '#58d9b4', blur: 2, depth: 'front' },
  { x: '12%', y: '90%', size: 122, thickness: 19, opacity: 0.08, color: '#64e6c4', blur: 3.5, depth: 'back' },
  { x: '51%', y: '78%', size: 92, thickness: 15, opacity: 0.07, color: '#006041', blur: 1.4, depth: 'front' },
  { x: '84%', y: '74%', size: 84, thickness: 14, opacity: 0.08, color: '#5dddbd', blur: 2.8, depth: 'back' },
  { x: '39%', y: '64%', size: 116, thickness: 18, opacity: 0.06, color: '#006041', blur: 4.2, depth: 'front' },
];

function PagePattern() {
  const backPluses = plusShapes.filter((plus) => plus.depth !== 'front');
  const frontPluses = plusShapes.filter((plus) => plus.depth === 'front');

  const renderPlus = (plus, index) => (
    <span
      key={`${plus.x}-${plus.y}`}
      className="page-pattern__plus"
      style={{
        '--plus-x': plus.x,
        '--plus-y': plus.y,
        '--plus-size': `${plus.size}px`,
        '--plus-thickness': `${plus.thickness}px`,
        '--plus-opacity': plus.opacity,
        '--plus-color': plus.color,
        '--plus-blur': `${plus.blur}px`,
        '--plus-delay': `${index * 0.17}s`,
      }}
    />
  );

  return (
    <>
      <div className="page-pattern page-pattern--back" aria-hidden="true">
        <div className="page-pattern__grid" />
        <div className="page-pattern__pluses">
          {backPluses.map(renderPlus)}
        </div>
      </div>
      <div className="page-pattern page-pattern--front" aria-hidden="true">
        <div className="page-pattern__pluses page-pattern__pluses--front">
          {frontPluses.map(renderPlus)}
        </div>
      </div>
    </>
  );
}

export default PagePattern;
