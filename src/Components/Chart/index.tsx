import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, registerables, ChartOptions } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut as ChartDoughnut } from "react-chartjs-2";

export default function Doughnut(props: any) {
    ChartJS.register(ArcElement, Tooltip, Legend);
    ChartJS.register(...registerables, ChartDataLabels);

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

return(
    <div style={{marginTop:"0.625em"}}>
        <ChartDoughnut data={props.data} options={options}/>
    </div>
)
}

