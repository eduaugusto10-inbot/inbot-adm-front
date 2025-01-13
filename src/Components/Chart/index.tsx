import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, registerables, ChartOptions } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut as ChartDoughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, ...registerables, ChartDataLabels);

const Doughnut = ({ data }:any) => {

    const options: ChartOptions<'doughnut'> = {
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
              boxWidth: 6,
            },
          },
          datalabels: {
            color: 'black',
            font: {
              weight: 'bold',
              size: 12,
            },
            anchor: 'end',
            align: 'end',
            offset: 2,
          },
          title: {
            display: false,
            text: '',
            padding: {
              top: 0,
            },
          },
          subtitle: {
            display: true,
            text: '',
            padding: { bottom: -31, top: 0 },
          },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || "";
                        const value = context.dataset.data[context.dataIndex] || 0;
                        const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                       return `${label}: ${value} (${percentage}%)`;
                    }
                  }
              }
        },
        layout: {
          padding: {
            top: 12,
            bottom: 20,
            left: 0,
            right: 0,
          },
        },
      };

    return (
        <div style={{ marginTop: "0.625em" }}>
            <ChartDoughnut data={data} options={options} />
        </div>
    );
};

export default Doughnut;