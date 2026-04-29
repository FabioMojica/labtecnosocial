import { differenceInCalendarDays } from "date-fns";
import { resolveDateRange } from "../../src/utils/resolveDateRange.js";
import { normalizeGetAPIsData } from "../../src/utils/normalizeGetAPIsData.js";
import { formatInsights } from "../../src/controllers/apis/utils/formatInsights.js";
import { formatPopularPosts } from "../../src/controllers/apis/utils/formatPosts.js";

describe("KPI dashboard utils", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("resolveDateRange", () => {
    test("range=all retorna un intervalo abierto", () => {
      expect(resolveDateRange("all")).toEqual([{}]);
    });

    test("range=today retorna since y until del mismo dia", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-04-20T15:30:00.000Z"));

      const ranges = resolveDateRange("today");
      expect(ranges).toHaveLength(1);
      expect(ranges[0]).toEqual({
        since: "2026-04-20",
        until: "2026-04-20",
      });
    });

    test("range=lastMonth retorna ventana exacta de 30 dias", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-04-20T08:00:00.000Z"));

      const [{ since, until }] = resolveDateRange("lastMonth");
      const days = differenceInCalendarDays(new Date(until), new Date(since)) + 1;

      expect(days).toBe(30);
      expect(until).toBe("2026-04-20");
    });

    test("range=lastSixMonths divide en chunks maximos de 93 dias", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-04-20T10:00:00.000Z"));

      const ranges = resolveDateRange("lastSixMonths");
      expect(ranges.length).toBeGreaterThan(1);

      ranges.forEach(({ since, until }) => {
        const days = differenceInCalendarDays(new Date(until), new Date(since)) + 1;
        expect(days).toBeLessThanOrEqual(93);
      });

      expect(ranges[0].until).toBe("2026-04-20");
      expect(ranges[ranges.length - 1].since).toBe("2025-10-23");
    });
  });

  describe("normalizeGetAPIsData", () => {
    test("normaliza repos de github", () => {
      const data = normalizeGetAPIsData("github", [
        {
          id: 1,
          name: "repo-a",
          full_name: "lab-tecnosocial/repo-a",
          owner: { avatar_url: "https://avatars/repo-a.png" },
        },
      ]);

      expect(data).toEqual([
        {
          id: "1",
          name: "repo-a",
          url: "https://github.com/lab-tecnosocial/repo-a",
          image_url: "https://avatars/repo-a.png",
        },
      ]);
    });

    test("normaliza paginas facebook e instagram", () => {
      const fb = normalizeGetAPIsData("facebook", {
        pages: [
          {
            id: "10",
            name: "Page FB",
            link: "https://facebook.com/page-fb",
            picture: { data: { url: "https://img/fb.jpg" } },
          },
        ],
      });

      const ig = normalizeGetAPIsData("instagram", {
        pages: [
          {
            id: "20",
            name: "Cuenta IG",
            url: "https://instagram.com/cuenta",
            image_url: "https://img/ig.jpg",
          },
        ],
      });

      expect(fb[0]).toMatchObject({
        id: "10",
        name: "Page FB",
        url: "https://facebook.com/page-fb",
      });
      expect(ig[0]).toMatchObject({
        id: "20",
        name: "Cuenta IG",
        url: "https://instagram.com/cuenta",
      });
    });
  });

  describe("formatInsights", () => {
    test("agrupa valores por nombre de metrica", () => {
      const output = formatInsights([
        { name: "reach", values: [{ value: 10 }] },
        { name: "reach", values: [{ value: 20 }] },
        { name: "profile_views", values: [{ value: 3 }] },
      ]);

      const reach = output.find((row) => row.name === "reach");
      const profileViews = output.find((row) => row.name === "profile_views");

      expect(reach.values).toEqual([{ value: 10 }, { value: 20 }]);
      expect(profileViews.values).toEqual([{ value: 3 }]);
    });
  });

  describe("formatPopularPosts", () => {
    test("ordena por score y respeta limite", () => {
      const posts = [
        {
          id: "p1",
          message: "Post 1",
          created_time: "2026-04-01T10:00:00+0000",
          updated_time: "2026-04-01T10:00:00+0000",
          permalink_url: "https://facebook.com/p1",
          reactions: { summary: { total_count: 2 } },
          comments: { summary: { total_count: 1 } },
          shares: { count: 1 },
          reactions_like: { summary: { total_count: 2 } },
          reactions_love: { summary: { total_count: 0 } },
          reactions_wow: { summary: { total_count: 0 } },
          reactions_haha: { summary: { total_count: 0 } },
          reactions_sad: { summary: { total_count: 0 } },
          reactions_angry: { summary: { total_count: 0 } },
        },
        {
          id: "p2",
          message: "Post 2",
          created_time: "2026-04-02T10:00:00+0000",
          updated_time: "2026-04-02T10:00:00+0000",
          permalink_url: "https://facebook.com/p2",
          reactions: { summary: { total_count: 5 } },
          comments: { summary: { total_count: 0 } },
          shares: { count: 0 },
          reactions_like: { summary: { total_count: 5 } },
          reactions_love: { summary: { total_count: 0 } },
          reactions_wow: { summary: { total_count: 0 } },
          reactions_haha: { summary: { total_count: 0 } },
          reactions_sad: { summary: { total_count: 0 } },
          reactions_angry: { summary: { total_count: 0 } },
        },
        {
          id: "p3",
          story: "Story fallback",
          created_time: "2026-04-03T10:00:00+0000",
          updated_time: "2026-04-03T10:00:00+0000",
          permalink_url: "https://facebook.com/p3",
          reactions: { summary: { total_count: 0 } },
          comments: { summary: { total_count: 0 } },
          shares: { count: 0 },
          reactions_like: { summary: { total_count: 0 } },
          reactions_love: { summary: { total_count: 0 } },
          reactions_wow: { summary: { total_count: 0 } },
          reactions_haha: { summary: { total_count: 0 } },
          reactions_sad: { summary: { total_count: 0 } },
          reactions_angry: { summary: { total_count: 0 } },
        },
      ];

      const result = formatPopularPosts(posts, 2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("p1");
      expect(result[0].popularityScore).toBe(7); // 2 + (1*2) + (1*3)
      expect(result[1].id).toBe("p2");
      expect(result.some((post) => post.id === "p3")).toBe(false);
    });
  });
});

