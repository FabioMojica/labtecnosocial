export const chartPropsMap = {
    facebook: {
        followersCard: {
            component: "followersCard",
            defaultTitle: "Nuevos seguidores de la página",
            usesInterval: true,
        },
        pageViewsCard: {
            component: "pageViewsCard",
            defaultTitle: "Visitas a la página",
            usesInterval: true,
        },
        pageImpressionsCard: {
            component: "pageImpressionsCard",
            defaultTitle: "Impresiones de la página",
            usesInterval: true,
        },
        organicOrPaidViewsCard: {
            component: "organicOrPaidViewsCard",
            defaultTitle: "Impresiones orgánicas vs pagadas",
            usesInterval: true,
        },
        totalActionsCard: {
            component: "totalActionsCard",
            defaultTitle: "Acciones totales",
            usesInterval: true,
        },
        postEngagementsCard: {
            component: "postEngagementsCard",
            defaultTitle: "Interacciones con publicaciones",
            usesInterval: true,
        },
        totalReactionsCard: {
            component: "totalReactionsCard",
            defaultTitle: "Reacciones totales",
            usesInterval: true,
        },
        chartFollowersByCountry: {
            component: "chartFollowersByCountry",
            defaultTitle: "Seguidores por país",
            usesInterval: true,
        },
        topPostOfThePeriod: {
            component: "topPostOfThePeriod",
            defaultTitle: "Top 5 posts populares",
            usesInterval: true,
        },
    },
    instagram: {
        followersCard: {
            component: "followersCard",
            defaultTitle: "Nuevos seguidores",
            usesInterval: true,
        },
        pageViewsCard: {
            component: "pageViewsCard",
            defaultTitle: "Alcance",
            usesInterval: true,
        },
        pageImpressionsCard: {
            component: "pageImpressionsCard",
            defaultTitle: "Vistas",
            usesInterval: true,
        },
        profileViewsCard: {
            component: "profileViewsCard",
            defaultTitle: "Visitas al perfil",
            usesInterval: true,
        },
        engagedAccountsCard: {
            component: "engagedAccountsCard",
            defaultTitle: "Cuentas con interaccion",
            usesInterval: true,
        },
        interactionsCard: {
            component: "postEngagementsCard",
            defaultTitle: "Interacciones totales",
            usesInterval: true,
        },
        postingFrequencyCard: {
            component: "postingFrequencyCard",
            defaultTitle: "Publicaciones del periodo",
            usesInterval: true,
        },
        engagementRateCard: {
            component: "engagementRateCard",
            defaultTitle: "Tasa de engagement",
            usesInterval: true,
        },
        avgInteractionsPerPostCard: {
            component: "engagementRateCard",
            defaultTitle: "Interacciones por publicacion",
            usesInterval: true,
        },
        contentTypePerformanceCard: {
            component: "organicOrPaidViewsCard",
            defaultTitle: "Rendimiento por formato",
            usesInterval: true,
        },
        interactionsBreakdownCard: {
            component: "organicOrPaidViewsCard",
            defaultTitle: "Desglose de interacciones",
            usesInterval: true,
        },
        profileConversionFunnelCard: {
            component: "organicOrPaidViewsCard",
            defaultTitle: "Embudo de conversion",
            usesInterval: true,
        },
        topPostOfThePeriod: {
            component: "topPostOfThePeriod",
            defaultTitle: "Top publicaciones de Instagram",
            usesInterval: true,
        },
    },
    github: {
        commitsInThePeriodCard: {
            component: "commitsInThePeriodCard",
            defaultTitle: "Cantidad de commits",
            usesInterval: true,
            dataProp: "commits",
        },
        topCollaboratorsCard: {
            component: "topCollaboratorsCard",
            defaultTitle: "Top Colaboradores del Periodo",
            usesInterval: true,
            dataProp: "commits",
        },
        pullRequestsCard: {
            component: "pullRequestsCard",
            defaultTitle: "Pull Requests",
            usesInterval: true,
            dataProp: "prs",
        },
        collaboratorsWithoutPushCard: {
            component: "collaboratorsWithoutPushCard",
            defaultTitle: "Colaboradores sin push",
            usesInterval: true,
            dataProp: "commits",
        },
        sessionsChart: {
            component: "sessionsChart",
            defaultTitle: "Historial de commits",
            usesInterval: true,
            dataProp: "commitsData",
        },
        commitsByWeekdayHourChart: {
            component: "commitsByWeekdayHourChart",
            defaultTitle: "Horas con mas commits",
            usesInterval: true,
            dataProp: "commitsData",
        },
        commitGrid: {
            component: "commitGrid",
            defaultTitle: "Historial de Commits",
            usesInterval: true,
            dataProp: "commits",
        },
        commitsByAuthorChart: {
            component: "commitsByAuthorChart",
            defaultTitle: "Porcentaje de Commits",
            usesInterval: true,
            dataProp: "commits",
        },
        overviewSocialReachRanking: {
            component: "overviewSocialReachRanking",
            defaultTitle: "Alcance en redes",
            usesInterval: true,
            dataProp: "rows",
        },
        overviewCommitRanking: {
            component: "overviewCommitRanking",
            defaultTitle: "Ranking de commits",
            usesInterval: true,
            dataProp: "rows",
        },
    },
};

export const parseChartId = (chartId) => {
    if (!chartId) return null;

    const cleanId = chartId.replace("chart-", "");
    const parts = cleanId.split("-");

    if (parts.length < 2) return null;

    const chartKey = parts[0];
    const rawPlatform = parts[1];
    const platform = rawPlatform.includes(":") ? rawPlatform.split(":")[1] : rawPlatform;
    const period = parts[2] || null;

    return {
        chartKey,
        platform,
        period,
        fullId: chartId,
        rawPlatform,
    };
};
