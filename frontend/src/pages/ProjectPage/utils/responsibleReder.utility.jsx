import { AssignResponsibleCheckBoxItem } from "../../../generalComponents";

export const renderResponsiblesList = ({
    list,
    selectedView,
    addPreResponsible,
    removePreResponsible,
    removeResponsible,
    restoreResponsible
}) => {
    switch (selectedView) {
        case "project":
            return list.map(r => (
                <AssignResponsibleCheckBoxItem
                    key={Number(r.id)}
                    responsible={r}
                    checked={true}
                    onChange={(checked) => !checked && removeResponsible(r)}
                />
            ));
        case "preEliminados":
            return list.map(r => (
                <AssignResponsibleCheckBoxItem
                    key={Number(r.id)}
                    responsible={r}
                    checked={false}
                    onChange={(checked) => checked && restoreResponsible(r)}
                />
            ));
        case "assign":
            return list.map(u => (
                <AssignResponsibleCheckBoxItem
                    key={Number(u.id)}
                    responsible={u}
                    checked={false}
                    onChange={(checked) => checked && addPreResponsible(u)}
                />
            ));
        case "preAnadidos":
            return list.map(u => (
                <AssignResponsibleCheckBoxItem
                    key={Number(u.id)}
                    responsible={u}
                    checked={true}
                    onChange={(checked) => !checked && removePreResponsible(u)}
                />
            ));
        default:
            return null;
    }
};
