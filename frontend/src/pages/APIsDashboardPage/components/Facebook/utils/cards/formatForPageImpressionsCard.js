export const formatForPageImpressionsCard = (rawData = [], period = "lastMonth") => {
    console.log("XXXXXXXXX", rawData);

    if (!Array.isArray(rawData) || rawData.length === 0) {
        return {
            chartData: [],
            dates: [],
            total: 0,
            delta: 0,
        };
    }

    
}; 


// export const formatForPageImpressionsCard = (rawData = [], period = "lastMonth") => {
//     if (!Array.isArray(rawData) || rawData.length === 0) {
//         return {
//             chartData: [],
//             dates: [],
//             total: 0,
//             delta: 0,
//         };
//     }
//     const sorted = [...rawData].sort(
//         (a, b) => new Date(a.end_time_local) - new Date(b.end_time_local)
//     );

//     const formatDate = (date) => {
//         const d = date.getDate().toString().padStart(2, "0");
//         const m = (date.getMonth() + 1).toString().padStart(2, "0");
//         const y = date.getFullYear();
//         return `${d}/${m}/${y}`;
//     };

//     // -------------------
//     // Caso especial: hoy
//     // -------------------
//     if (period === "today") {
//         const now = new Date();
//         const todayItems = sorted.filter(item => {
//             const date = new Date(item.end_time_local);
//             return (
//                 date.getDate() === now.getDate() &&
//                 date.getMonth() === now.getMonth() &&
//                 date.getFullYear() === now.getFullYear() &&
//                 date <= now
//             );
//         });

//         const total = todayItems.reduce((sum, item) => sum + (item.value ?? 0), 0);

//         return {
//             chartData: [0, total],
//             dates: [
//                 `${formatDate(now)} 00:00:00`,
//                 `${formatDate(now)} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`
//             ],
//             total,
//             delta: total,
//         };
//     }

//     // -------------------
//     // Otros periodos: agrupar por fecha sumando orgánico + ads
//     // -------------------
//     const groupedByDate = sorted.reduce((acc, item) => {
//         const day = item.end_time_local.split("T")[0];
//         if (!acc[day]) acc[day] = 0;
//         acc[day] += item.value ?? 0;
//         return acc;
//     }, {});

//     const groupedDates = Object.keys(groupedByDate)
//         .sort((a, b) => new Date(a) - new Date(b))
//         .map(dateStr => {
//             const [yyyy, mm, dd] = dateStr.split("-");
//             return `${dd}/${mm}/${yyyy}`;
//         });

//     const chartData = Object.keys(groupedByDate)
//         .sort((a, b) => new Date(a) - new Date(b))
//         .map(date => groupedByDate[date]);

//     const total = chartData.reduce((sum, val) => sum + val, 0);
//     const delta = chartData.length > 1 ? chartData[chartData.length - 1] - chartData[0] : 0;

//     return {
//         chartData,
//         dates: groupedDates,
//         total,
//         delta,
//     };
// };

