import { http, HttpResponse } from "msw";

// ── 공통 헬퍼 ──────────────────────────────────────────────

const now = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 19);

function ok<T>(data: T, message: string | null = null) {
  return HttpResponse.json({
    success: true,
    errorCode: null,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function fail(status: number, errorCode: string, message: string) {
  return HttpResponse.json(
    {
      success: false,
      errorCode,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// Spring Page 직렬화 형태
function page<T>(content: T[], pageNum: number, size: number) {
  const totalElements = content.length;
  const totalPages = Math.max(Math.ceil(totalElements / size), 1);
  const start = pageNum * size;
  const slice = content.slice(start, start + size);
  return {
    content: slice,
    number: pageNum,
    size,
    totalElements,
    totalPages,
    first: pageNum === 0,
    last: pageNum >= totalPages - 1,
  };
}

// X-Member-Id 헤더 (DEV에서 httpClient가 주입)
function memberIdOf(request: Request): number | null {
  const raw = request.headers.get("X-Member-Id");
  return raw ? Number(raw) : null;
}

// ── 인메모리 스토어 ────────────────────────────────────────

type MockBattle = {
  battleId: number;
  title: string;
  optionA: string;
  optionB: string;
  sido: string | null;
  sigu: string | null;
  status: "ACTIVE" | "CLOSED";
  optionACount: number;
  optionBCount: number;
  voteCount: number;
  winningOption: "A" | "B" | "DRAW" | null;
  rewardAmount: number;
  settledAt: string | null;
  createdBy: number;
  startAt: string;
  endAt: string;
  createdAt: string;
};

const battles: MockBattle[] = [
  {
    battleId: 1,
    title: "성수 vs 연남, 데이트하기 더 좋은 동네는?",
    optionA: "성수",
    optionB: "연남",
    sido: "서울",
    sigu: "성동구",
    status: "ACTIVE",
    optionACount: 89,
    optionBCount: 67,
    voteCount: 156,
    winningOption: null,
    rewardAmount: 0,
    settledAt: null,
    createdBy: 7,
    startAt: iso(now - 2 * DAY),
    endAt: iso(now + 5 * DAY),
    createdAt: iso(now - 3 * DAY),
  },
  {
    battleId: 2,
    title: "역세권 vs 학군, 더 중요한 조건은?",
    optionA: "초역세권 (도보 3분)",
    optionB: "명문 학군지 (도보 15분)",
    sido: "서울",
    sigu: "강남구",
    status: "ACTIVE",
    optionACount: 240,
    optionBCount: 272,
    voteCount: 512,
    winningOption: null,
    rewardAmount: 0,
    settledAt: null,
    createdBy: 8,
    startAt: iso(now - 1 * DAY),
    endAt: iso(now + 6 * DAY),
    createdAt: iso(now - 2 * DAY),
  },
  {
    battleId: 3,
    // 종료 + 72시간 경과 → 결과 전체 공개
    title: "부산 바다 조망권 대결",
    optionA: "해운대 엘시티 조망",
    optionB: "광안리 광안대교 조망",
    sido: "부산",
    sigu: "해운대구",
    status: "CLOSED",
    optionACount: 410,
    optionBCount: 208,
    voteCount: 618,
    winningOption: "A",
    rewardAmount: 10,
    settledAt: iso(now - 4 * DAY),
    createdBy: 9,
    startAt: iso(now - 12 * DAY),
    endAt: iso(now - 5 * DAY),
    createdAt: iso(now - 13 * DAY),
  },
  {
    battleId: 4,
    // 종료 + 72시간 미경과 → 미투표자에게는 결과 비공개
    title: "신축 아파트 vs 구축 대단지, 당신의 선택은?",
    optionA: "신축 소형 (24평)",
    optionB: "구축 대단지 (34평)",
    sido: "경기",
    sigu: "성남시",
    status: "CLOSED",
    optionACount: 150,
    optionBCount: 139,
    voteCount: 289,
    winningOption: "A",
    rewardAmount: 10,
    settledAt: iso(now - 6 * HOUR),
    createdBy: 10,
    startAt: iso(now - 8 * DAY),
    endAt: iso(now - 12 * HOUR),
    createdAt: iso(now - 9 * DAY),
  },
];

type MockVote = { battleId: number; memberId: number; option: "A" | "B" };
const votes: MockVote[] = [];

type MockComment = {
  commentId: number;
  battleId: number;
  memberId: number;
  content: string;
  createdAt: string;
};
let comments: MockComment[] = [
  {
    commentId: 1,
    battleId: 1,
    memberId: 2,
    content: "성수는 감성 카페가 정말 많아서 데이트하기 좋아요!",
    createdAt: iso(now - 1 * DAY),
  },
  {
    commentId: 2,
    battleId: 1,
    memberId: 3,
    content: "연남 골목 맛집도 무시 못하죠 ㅎㅎ",
    createdAt: iso(now - 12 * HOUR),
  },
];
let nextCommentId = 3;

const RESULT_OPEN_HOURS = 72;

function findBattle(id: number): MockBattle | undefined {
  return battles.find((b) => b.battleId === id);
}

// ── 핸들러 ─────────────────────────────────────────────────

export const battleHandlers = [
  // 배틀 목록 조회
  http.get("*/api/v1/battles", ({ request }) => {
    const url = new URL(request.url);
    const status = (url.searchParams.get("status") ?? "ACTIVE").toUpperCase();
    const pageNum = Number(url.searchParams.get("page")) || 0;
    const size = Number(url.searchParams.get("size")) || 20;

    if (status !== "ACTIVE" && status !== "CLOSED") {
      return fail(400, "VALIDATION_FAILED", "잘못된 상태 값입니다.");
    }

    const filtered = battles
      .filter((b) => b.status === status)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((b) => ({
        battleId: b.battleId,
        title: b.title,
        optionA: b.optionA,
        optionB: b.optionB,
        status: b.status,
        voteCount: b.voteCount,
        startAt: b.startAt,
        endAt: b.endAt,
        createdAt: b.createdAt,
      }));

    return ok(page(filtered, pageNum, size));
  }),

  // 배틀 상세 조회
  http.get("*/api/v1/battles/:battleId", ({ params }) => {
    const battle = findBattle(Number(params.battleId));
    if (!battle) {
      return fail(404, "BATTLE_NOT_FOUND", "존재하지 않는 Battle입니다.");
    }

    return ok({
      battleId: battle.battleId,
      title: battle.title,
      optionA: battle.optionA,
      optionB: battle.optionB,
      sido: battle.sido,
      sigu: battle.sigu,
      status: battle.status,
      isClosed: battle.status === "CLOSED",
      optionACount: battle.optionACount,
      optionBCount: battle.optionBCount,
      voteCount: battle.voteCount,
      winningOption: battle.winningOption,
      rewardAmount: battle.rewardAmount,
      settledAt: battle.settledAt,
      createdBy: battle.createdBy,
      startAt: battle.startAt,
      endAt: battle.endAt,
      createdAt: battle.createdAt,
    });
  }),

  // 투표 참여
  http.post("*/api/v1/battles/:battleId/votes", async ({ params, request }) => {
    const battleId = Number(params.battleId);
    const memberId = memberIdOf(request);
    if (memberId === null) {
      return fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    }

    const battle = findBattle(battleId);
    if (!battle) {
      return fail(404, "BATTLE_NOT_FOUND", "존재하지 않는 Battle입니다.");
    }
    if (battle.status === "CLOSED") {
      return fail(409, "BATTLE_CLOSED", "종료된 Battle입니다.");
    }
    if (new Date(battle.startAt).getTime() > Date.now()) {
      return fail(409, "BATTLE_CLOSED", "투표가 시작되지 않았습니다.");
    }

    const body = (await request.json().catch(() => null)) as {
      option?: string;
    } | null;
    const option = body?.option?.toUpperCase();
    if (option !== "A" && option !== "B") {
      return fail(400, "BATTLE_INVALID_OPTION", "올바르지 않은 선택지입니다.");
    }

    const already = votes.find(
      (v) => v.battleId === battleId && v.memberId === memberId,
    );
    if (already) {
      return fail(409, "BATTLE_ALREADY_VOTED", "이미 투표한 Battle입니다.");
    }

    votes.push({ battleId, memberId, option });
    if (option === "A") battle.optionACount += 1;
    else battle.optionBCount += 1;
    battle.voteCount += 1;

    return ok(
      {
        battleId,
        selectedOption: option,
        message: "투표가 완료되었습니다.",
      },
      "투표가 완료되었습니다.",
    );
  }),

  // 투표 결과 조회
  http.get("*/api/v1/battles/:battleId/result", ({ params, request }) => {
    const battleId = Number(params.battleId);
    const memberId = memberIdOf(request);
    const battle = findBattle(battleId);
    if (!battle) {
      return fail(404, "BATTLE_NOT_FOUND", "존재하지 않는 Battle입니다.");
    }

    const voted =
      memberId !== null &&
      votes.some((v) => v.battleId === battleId && v.memberId === memberId);
    const isClosed = battle.status === "CLOSED";
    const past72h =
      isClosed &&
      new Date(battle.endAt).getTime() + RESULT_OPEN_HOURS * HOUR < Date.now();
    const resultVisible = voted || past72h;

    if (!resultVisible) {
      return ok({
        battleId,
        status: battle.status,
        voted: false,
        resultVisible: false,
        voteCount: battle.voteCount,
        message: isClosed
          ? "투표 종료 72시간 후 공개됩니다."
          : "투표 후 결과를 확인할 수 있습니다.",
      });
    }

    const total = battle.voteCount;
    const aRatio = total > 0 ? (battle.optionACount / total) * 100 : 0;
    const bRatio = total > 0 ? (battle.optionBCount / total) * 100 : 0;

    return ok({
      battleId,
      status: battle.status,
      voted,
      resultVisible: true,
      optionACount: battle.optionACount,
      optionBCount: battle.optionBCount,
      voteCount: total,
      optionARatio: aRatio,
      optionBRatio: bRatio,
      winningOption: battle.winningOption,
    });
  }),

  // 댓글 목록 조회
  http.get("*/api/v1/battles/:battleId/comments", ({ params, request }) => {
    const battleId = Number(params.battleId);
    if (!findBattle(battleId)) {
      return fail(404, "BATTLE_NOT_FOUND", "존재하지 않는 Battle입니다.");
    }

    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get("page")) || 0;
    const size = Number(url.searchParams.get("size")) || 10;

    const list = comments
      .filter((c) => c.battleId === battleId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return ok(page(list, pageNum, size));
  }),

  // 댓글 작성
  http.post(
    "*/api/v1/battles/:battleId/comments",
    async ({ params, request }) => {
      const battleId = Number(params.battleId);
      const memberId = memberIdOf(request);
      if (memberId === null) {
        return fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
      }

      const battle = findBattle(battleId);
      if (!battle) {
        return fail(404, "BATTLE_NOT_FOUND", "존재하지 않는 Battle입니다.");
      }
      if (battle.status === "CLOSED") {
        return fail(409, "BATTLE_CLOSED", "종료된 Battle입니다.");
      }

      const body = (await request.json().catch(() => null)) as {
        content?: string;
      } | null;
      const content = body?.content?.trim() ?? "";
      if (!content) {
        return fail(400, "VALIDATION_FAILED", "댓글을 입력해 주세요.");
      }
      if (content.length > 500) {
        return fail(
          400,
          "BATTLE_COMMENT_TOO_LONG",
          "댓글 길이가 너무 깁니다. (최대 500자)",
        );
      }

      const created: MockComment = {
        commentId: nextCommentId++,
        battleId,
        memberId,
        content,
        createdAt: new Date().toISOString().slice(0, 19),
      };
      comments.push(created);

      return ok(created, "댓글이 작성되었습니다.");
    },
  ),

  // 댓글 삭제
  http.delete(
    "*/api/v1/battles/:battleId/comments/:commentId",
    ({ params, request }) => {
      const memberId = memberIdOf(request);
      if (memberId === null) {
        return fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
      }

      const commentId = Number(params.commentId);
      const target = comments.find((c) => c.commentId === commentId);
      if (!target) {
        return fail(
          404,
          "BATTLE_COMMENT_NOT_FOUND",
          "존재하지 않는 댓글입니다.",
        );
      }
      if (target.memberId !== memberId) {
        return fail(
          403,
          "BATTLE_COMMENT_FORBIDDEN",
          "본인 댓글만 삭제할 수 있습니다.",
        );
      }

      comments = comments.filter((c) => c.commentId !== commentId);
      return ok(null);
    },
  ),
];
