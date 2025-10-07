export const createProjectIntegrations = async (
  integrations,
  savedProject,
  integrationRepository
) => {
  if (!integrations || !Array.isArray(integrations)) return [];

  const integrationsToCreate = [];

  integrations.forEach((item) => {
    const { type: platform, data } = item;
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
