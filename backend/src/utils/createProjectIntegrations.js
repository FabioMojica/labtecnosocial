export const createProjectIntegrations = async (
  integrations,
  savedProject,
  integrationRepository
) => {
  if (!integrations || typeof integrations !== "object") return [];

  const integrationsToCreate = [];

  Object.entries(integrations).forEach(([platform, data]) => {
    if (data?.id) {
      integrationsToCreate.push(
        integrationRepository.create({
          platform,
          integration_id: data.id,  
          url: data.url || "",      
          name: data.name || "",
          project: savedProject,
        })
      );
    }
  });

  if (integrationsToCreate.length) {
    await integrationRepository.save(integrationsToCreate);
  }

  return integrationsToCreate;
};
