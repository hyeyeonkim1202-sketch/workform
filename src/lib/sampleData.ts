import { Task, MainCategory } from '@/types';

// Mulberry32 seeded RNG — deterministic, same output every run
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260401);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Weighted pick
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const CATEGORIES: MainCategory[] = ['인사', '총무', '법무', '재무', '지원사업', '경영진비서'];
const WEIGHTS = [25, 15, 8, 18, 12, 22];

const CATEGORY_DATA: Record<MainCategory, { subCategory: string; details: string[] }[]> = {
  인사: [
    { subCategory: '급여', details: ['월 급여 계산', '급여 명세서 발송', '퇴직금 정산'] },
    { subCategory: '근로계약', details: ['신규 입사자 계약서 작성', '계약 갱신 처리'] },
    { subCategory: '복리후생', details: ['건강검진 일정 안내', '경조사 지원 처리', '복지포인트 관리'] },
    { subCategory: '채용', details: ['채용공고 작성', '이력서 검토', '면접 일정 조율'] },
    { subCategory: '인사평가', details: ['평가 기준 수립', '평가 결과 취합'] },
    { subCategory: '교육훈련', details: ['교육 일정 수립', '외부 교육 신청'] },
  ],
  총무: [
    { subCategory: '시설관리', details: ['사무용품 재고 확인', '시설 점검 요청', '임차료 납부'] },
    { subCategory: '차량관리', details: ['법인차 운행일지 정리', '차량 보험 갱신'] },
    { subCategory: '물품구매', details: ['비품 구매 요청서 작성', '견적서 검토', '발주 처리'] },
    { subCategory: '행사준비', details: ['워크숍 장소 예약', '행사 예산 정리'] },
    { subCategory: '문서관리', details: ['문서 분류 및 보관', '공문 발송'] },
  ],
  법무: [
    { subCategory: '계약서검토', details: ['계약서 초안 검토', '법률 의견서 작성', '계약 조건 협의'] },
    { subCategory: '법률상담', details: ['외부 법무법인 미팅', '자문 의견 정리'] },
    { subCategory: '특허관리', details: ['특허 출원 서류 준비', '특허 갱신 관리'] },
    { subCategory: '분쟁대응', details: ['민원 처리', '분쟁 관련 서류 준비'] },
  ],
  재무: [
    { subCategory: '예산관리', details: ['월별 예산 현황 점검', '예산 집행 현황 보고'] },
    { subCategory: '비용처리', details: ['법인카드 내역 정리', '경비 처리', '지출결의서 작성'] },
    { subCategory: '세무신고', details: ['부가세 신고 자료 준비', '원천세 신고'] },
    { subCategory: '결산', details: ['월말 결산 작업', '분기 결산 보고'] },
    { subCategory: '자금관리', details: ['자금 현황 보고', '입출금 내역 확인'] },
  ],
  지원사업: [
    { subCategory: '보조금신청', details: ['정부 보조금 공고 검토', '신청서 작성', '필요 서류 준비'] },
    { subCategory: '정부지원사업', details: ['지원사업 선정 검토', '협약 체결 준비', '실적 보고서 작성'] },
    { subCategory: '보고서작성', details: ['사업 진행 보고서 작성', '통계 데이터 정리'] },
    { subCategory: '성과관리', details: ['KPI 달성 현황 점검', '성과 데이터 분석'] },
  ],
  경영진비서: [
    { subCategory: '일정관리', details: ['대표이사 주간 일정 조율', '임원 회의 일정 확인', '외부 미팅 스케줄 조율'] },
    { subCategory: '회의준비', details: ['이사회 자료 준비', '경영회의 안건 정리', '회의실 예약'] },
    { subCategory: '보고서작성', details: ['경영 현황 보고서 작성', '주간 업무 보고 준비'] },
    { subCategory: '출장준비', details: ['항공권 예약', '숙소 예약', '출장 일정표 작성'] },
    { subCategory: '의전업무', details: ['내방객 응대', 'VIP 방문 의전 준비'] },
  ],
};

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWorkingDays(start: string, end: string): string[] {
  const days: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const current = new Date(sy, sm - 1, sd); // local time
  const endDate = new Date(ey, em - 1, ed); // local time
  while (current <= endDate) {
    if (isWeekday(current)) {
      days.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function generateTasksForDay(date: string): Task[] {
  const count = randInt(3, 7);
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const category = weightedPick(CATEGORIES, WEIGHTS);
    const subData = pick(CATEGORY_DATA[category]);
    const detail = pick(subData.details);
    tasks.push({
      date,
      mainCategory: category,
      subCategory: subData.subCategory,
      detail,
    });
  }
  return tasks;
}

const workingDays = getWorkingDays('2026-04-01', '2026-06-18');

export const allTasks: Task[] = workingDays.flatMap(generateTasksForDay);
