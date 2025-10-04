
export const getFilteredResponsibles = ({
    selectedView,
    projectResponsibles,
    preEliminados,
    preAnadidos,
    allUsers
}) => {
    switch(selectedView) {
        case "project": return projectResponsibles;
        case "preEliminados": return preEliminados;
        case "assign": 
            return allUsers.filter(u => 
                !projectResponsibles.some(r => r.id === u.id) &&
                !preAnadidos.some(r => r.id === u.id) &&
                !preEliminados.some(r => r.id === u.id)
            );
        case "preAnadidos": return preAnadidos;
        default: return [];
    }
};
