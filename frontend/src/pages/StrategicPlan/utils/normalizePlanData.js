export const normalizePlanData = (data) => {
  if (!data) return null;

  return {
    id: data?.id,
    plan_version: data?.plan_version || 0,
    created_at: data?.created_at || null,
    updated_at: data?.updated_at || null,
    year: data?.year,
    mission: data.mission || '',
    objectives: data.objectives?.map(obj => ({
      ...obj,
      objectiveTitle: obj.title || '',  
      indicators: obj.indicators?.map(ind => ({
        ...ind, 
        id: ind.id,
        amount: ind.amount || null,
        concept: ind.concept || null,
      })) || [],
      programs: obj.programs?.map(prog => ({
        id: prog.id, 
        programDescription: prog.description || '',
        operationalProjects: prog.operationalProjects?.map(project => ({
          id: project.id,
          name: project.name || '',
          description: project.description || '',
          image_url: project.image_url || '',
        })) || []
      })) || []
    })) || []
  };
};

