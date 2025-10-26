export const buildPayloadFromData = (data) => (

  {
    mission: data?.mission || '',
    objectives: data?.objectives?.map(target => ({
        id: target.id,
        objectiveTitle: target.objectiveTitle,
        indicators: target.indicators,
        programs: target.programs?.map(program => ({
            id: program.id,
            programDescription: program.programDescription || program.description,
            operationalProjects: program.operationalProjects?.map(project => ({
                id: project.id,
                name: project.name,
                image_url: project.image_url,
                description: project.description,
            })) || []
        })) || []
    })) || []
}); 

export const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const sortById = (arr) => {
  if (!arr) return [];
  return [...arr].sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
};

export const normalizeTargets = (targets) => {
  return (targets || []).map(t => ({
    id: t.id,
    objectiveTitle: t.objectiveTitle,
    indicators: sortById(t.indicators).map(ind => ({
      id: ind.id,
      amount: ind.amount,
      concept: ind.concept,
    })),
    programs: sortById(t.programs).map(p => ({
      id: p.id,
      programDescription: p.programDescription,
      operationalProjects: sortById(p.operationalProjects).map(proj => ({
        id: proj.id,
        name: proj.name,
        image_url: proj.image_url,
        description: proj.description,
      })),
    })),
  }));
};


export const buildPayload = (selectedMision, targets) => ({
    mission: selectedMision,
    objectives: targets.map(target => ({
        id: target.id,
        objectiveTitle: target.objectiveTitle,
        indicators: (target.indicators || []).map(ind => ({
          
            concept: ind.concept,
            amount: ind.amount,
        })),
        programs: (target.programs || []).map(program => ({
            id: program.id,
            programDescription: program.programDescription,
            operationalProjects: (program.operationalProjects || []).map(project => ({
              id: project.id,
              name: project.name,
              image_url: project.image_url,
              description: project.description,
            })),
        })),
    })),
});

export const updateTargetsWithEditedTarget = (targets, updatedTarget) =>
    targets.map(target =>
        target.id === updatedTarget.id ? updatedTarget : target
    );

export const updateTargetsWithNewProgram = (targets, selectedTargetId, programText) => {
    return targets.map(target =>
        target.id === selectedTargetId
            ? {
                ...target,
                programs: [
                    ...(target.programs || []),
                    {
                        id: (target.programs?.length || 0) + 1,
                        programDescription: programText,
                        operationalProjects: []
                    }
                ]
            }
            : target
    );
};

export const updateTargetsWithEditedProject = (targets, selectedTargetId, selectedProgramId, updatedProject) => {
  return targets.map(target => {
    if (target.id !== selectedTargetId) return target;

    const updatedPrograms = target.programs.map(program => {
      if (program.id !== selectedProgramId) return program;

      const updatedProjects = (program.operationalProjects || []).map(project =>
        project.id === updatedProject.id ? { ...project, ...updatedProject } : project
      );

      return {
        ...program,
        operationalProjects: updatedProjects,
      };
    });

    return {
      ...target,
      programs: updatedPrograms,
    };
  });
};

export const getAllAssignedProjectIds = (targets) => {
    const ids = new Set();
    targets.forEach(target => {
        target.programs?.forEach(program => {
            program.operationalProjects?.forEach(project => {
                ids.add(project.id);
            });
        });
    }); 
    return Array.from(ids);
};

export const generateTempId = () => `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;