import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
dayjs.extend(relativeTime);
dayjs.locale("es");

export function buildRowsFromCommits(commits = []) {
    const grouped = commits.reduce((acc, commit) => {
        const login = commit.author?.login || "Desconocido";
        if (!acc[login]) {
            acc[login] = {
                login,
                email: commit.commit?.author?.email || "",
                avatar: commit.author?.avatar_url || "",
                commits: [],
            };
        }
        acc[login].commits.push(commit);
        return acc;
    }, {});

    // Convertir a array y calcular métricas
    const users = Object.values(grouped).map((u) => {
        const totalCommits = u.commits.length;
        const lastCommit = u.commits.reduce((latest, c) => {
            const date = new Date(c.commit.author.date);
            return !latest || date > latest ? date : latest;
        }, null);

        const inactivity = lastCommit
            ? dayjs().to(lastCommit, true) // Ej: "hace 2 días" → mostramos solo "2 días"
            : "N/A";

        // // Dataset diario para la gráfica
        // const commitsByDay = {};
        // u.commits.forEach((c) => {
        //     const day = new Date(c.commit.author.date).toISOString().split("T")[0];
        //     commitsByDay[day] = (commitsByDay[day] || 0) + 1;
        // });
        // En buildRowsFromCommits
const commitsByDay = {};
u.commits.forEach((c) => {
    // Convertimos a día local en formato YYYY-MM-DD
    const day = dayjs(c.commit.author.date).local().format("YYYY-MM-DD");
    commitsByDay[day] = (commitsByDay[day] || 0) + 1;
});


        return {
            id: u.login,
            login: u.login,
            email: u.email,
            totalCommits,
            inactivity,

            chartData: Object.entries(commitsByDay)
                .sort(([dayA], [dayB]) => new Date(dayA) - new Date(dayB)) // 👈 orden ascendente
                .map(([day, count]) => ({
                    x: day,
                    y: count,
                })),

            avatar: u.avatar,
        };
    });

    users.sort((a, b) => b.totalCommits - a.totalCommits);
    users.forEach((u, i) => (u.position = i + 1));

    return users;
}
