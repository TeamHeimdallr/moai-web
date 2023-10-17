import { useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import tw from 'twin.macro';

import { TOKEN } from '~/constants';

const Graph = () => {
  useEffect(() => {
    const data = [
      { token: TOKEN.MOAI, ratio: 50 },
      { token: TOKEN.WETH, ratio: 50 },
    ];
    const graph = document.getElementById('graph') as HTMLCanvasElement;

    const ctx = graph.getContext('2d');
    console.log(ctx);
    if (!ctx) return;

    const gradient1 = ctx.createLinearGradient(0, 100, 190, 280);
    gradient1.addColorStop(0, '#FCFFD6'); // 그라데이션 끝 색상
    gradient1.addColorStop(1, 'rgba(252, 255, 214, 0.1)'); // 그라데이션 시작 색상 및 투명도

    const gradient2 = ctx.createLinearGradient(0, 0, 150, 150);
    gradient2.addColorStop(0, '#A3B6FF'); // 그라데이션 끝 색상
    gradient2.addColorStop(1, 'rgba(163, 182, 255, 0.1)'); // 그라데이션 시작 색상 및 투명도

    new Chart(graph, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: data.map(row => row.ratio),
            backgroundColor: [gradient1, gradient2],
            borderWidth: 0,
            circumference: 180,
            rotation: -90,
            spacing: 3,
            borderRadius: 3,
          },
        ],
      },
      options: {
        cutout: '83%',
        animation: false,
        plugins: {
          tooltip: {
            enabled: false,
          },
        },
      },
    });
  }, []);

  return (
    <Wrapper>
      <Canvas id="graph" />
    </Wrapper>
  );
};

export default Graph;
const Wrapper = tw.div`w-380 h-380`;
const Canvas = tw.canvas``;
