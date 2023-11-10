import { useEffect } from 'react';
import Chart from 'chart.js/auto';

import { COLOR } from '~/assets/colors';

import { ITokenComposition } from '~/types';

interface Props {
  data: ITokenComposition[];
}

export const useDoughnutGraph = ({ data }: Props) => {
  useEffect(() => {
    const graph = document.getElementById('moai-pool--doughnut-graph') as
      | HTMLCanvasElement
      | undefined;
    if (!graph) return;

    const ctx = graph.getContext('2d');
    if (!ctx) return;

    const gradient1 = ctx.createLinearGradient(190, 100, 0, 290);
    gradient1.addColorStop(0, COLOR.PRIMARY[80]);
    gradient1.addColorStop(1, 'rgba(252, 255, 214, 0.1)');

    const gradient2 = ctx.createLinearGradient(190, 100, 380, 290);
    gradient2.addColorStop(0, '#A3B6FF');
    gradient2.addColorStop(1, 'rgba(163, 182, 255, 0.1)');

    const chart = new Chart(graph, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: data.map(row => row?.currentWeight ?? 0),
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

    return () => {
      chart.destroy();

      const graph = document.getElementById('moai-pool--doughnut-graph') as
        | HTMLCanvasElement
        | undefined;
      if (!graph) return;

      const ctx = graph.getContext('2d');
      if (!ctx) return;

      ctx.reset();
    };
  }, [data]);
};
