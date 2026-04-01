const SUPPORTED_SOCIAL_PLATFORMS = new Set(["github", "facebook", "instagram"]);

export const createProjectIntegrations = async (
  integrations,
  savedProject,
  integrationRepository
) => {
  if (!integrations || !Array.isArray(integrations)) return [];

  const integrationsToCreate = [];

  integrations.forEach((item) => {
    const { type: platform, data } = item;
    if (SUPPORTED_SOCIAL_PLATFORMS.has(platform) && data?.id) {
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
