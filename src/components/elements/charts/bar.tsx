import React, {Component} from "react";
import {Bar} from "react-chartjs-2";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    LineElement,
    Title,
    Tooltip
} from "chart.js";

ChartJS.register(LineElement, BarElement, ArcElement, LinearScale, Title, CategoryScale, Tooltip);

type PageState = {
    options: any
};

type PageProps = {
    data: {
        labels: string[],
        datasets: {
            label?: string,
            borderColor?: any,
            backgroundColor?: any,
            hoverBackgroundColor?: any,
            legendColor?: any,
            pointRadius?: number,
            fill?: boolean,
            borderWidth?: number,
            data: any[]
        }[]
    }
};

class ThemeChartBar extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            options: {
                responsive: true,
                scales: {
                    yAxes: {
                        ticks: {
                            beginAtZero: true,
                            display: false,
                            min: 0,
                            stepSize: 20,
                            max: 80
                        },
                        gridLines: {
                            drawBorder: false,
                            color: 'rgba(235,237,242,1)',
                            zeroLineColor: 'rgba(235,237,242,1)'
                        }
                    },
                    xAxes: {
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            color: 'rgba(0,0,0,1)',
                            zeroLineColor: 'rgba(235,237,242,1)'
                        },
                        ticks: {
                            padding: 20,
                            fontColor: "#9c9fa6",
                            autoSkip: true,
                        },
                        categoryPercentage: 0.5,
                        barPercentage: 0.5
                    }
                },
                legend: {
                    display: false,
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        }
    }

    render() {
        return (
            <Bar
                itemRef='chart'
                className="chartLegendContainer"
                data={this.props.data} options={this.state.options}
                id="visitSaleChart"
            />
        )
    }
}

export default ThemeChartBar;