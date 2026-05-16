import {BurndownChart} from "./burndown-chart.tsx";
import {Roadmap} from "./roadmap.tsx";
import {GanttChart} from "./GantChart.tsx";

export const Analitycs = ({projectId}) => {
    return (
        <div>
            <BurndownChart projectId={projectId}/>
        </div>
    )
}
