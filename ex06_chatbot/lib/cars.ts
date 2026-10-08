export type Status = "selling" | "sold";
export type Filter = "all" | Status;
export type Sort = "latest" | "price" | "mileage" | "year";

export type Car = {
  id: number;
  name: string;
  price: number; // 만원
  year: number;
  mileage: number; // km
  status: Status;
  photo: string;
  spec: { 배기량: string; 변속기: string; 연비: string; 색상: string; 차종: string };
  history: string[];
  options: string[];
  contact: string;
  registeredAt: number; // 클수록 최근 등록
};

export type CarForm = { name: string; price: string; year: string; mileage: string };
export type CarErrors = Partial<Record<keyof CarForm | "photo", string>>;

export const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "selling", label: "판매중" },
  { key: "sold", label: "판매완료" },
];

export const SORTS: { key: Sort; label: string }[] = [
  { key: "latest", label: "최신 등록순" },
  { key: "price", label: "낮은 가격순" },
  { key: "mileage", label: "짧은 주행거리순" },
  { key: "year", label: "최신 연식순" },
];

const SORTERS: Record<Sort, (a: Car, b: Car) => number> = {
  latest: (a, b) => b.registeredAt - a.registeredAt,
  price: (a, b) => a.price - b.price,
  mileage: (a, b) => a.mileage - b.mileage,
  year: (a, b) => b.year - a.year,
};

const NO_INFO = "정보 없음";

export const won = (n: number) => n.toLocaleString("ko-KR");

// 사진 대용 그림(SVG)
function placeholder(c1: string, c2: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#g)"/>
    <g fill="rgba(255,255,255,.92)">
      <path d="M110 262l44-92c8-17 22-26 42-26h232c20 0 34 8 46 22l56 74c14 3 24 14 24 28v32h-44a48 48 0 0 0-96 0H278a48 48 0 0 0-96 0h-72z"/>
      <circle cx="230" cy="322" r="32"/><circle cx="426" cy="322" r="32"/>
    </g>
    <text x="320" y="380" font-size="22" text-anchor="middle" fill="rgba(255,255,255,.85)" font-family="sans-serif">${label}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

type Seed = Omit<Car, "id" | "registeredAt">;

const SEEDS: Seed[] = [
  { name: "현대 그랜저 IG 2.5", price: 2350, year: 2019, mileage: 58000, status: "selling", photo: placeholder("#4b6a8a", "#2b3a52", "그랜저"),
    spec: { 배기량: "2,497cc", 변속기: "자동", 연비: "11.2km/l", 색상: "화이트", 차종: "대형" },
    history: ["사고 이력 없음", "2023.04 엔진오일·필터 교환", "2024.08 브레이크 패드 교체"],
    options: ["내비게이션", "후방카메라", "열선시트", "통풍시트", "선루프"], contact: "김판매 딜러 010-1111-2222" },
  { name: "기아 K5 3세대", price: 2090, year: 2021, mileage: 32000, status: "selling", photo: placeholder("#8a4b5b", "#4a2630", "K5"),
    spec: { 배기량: "1,999cc", 변속기: "자동", 연비: "12.8km/l", 색상: "블랙", 차종: "중형" },
    history: ["경미한 접촉 사고 1회(범퍼 교환)", "2024.02 타이어 4본 교체"],
    options: ["스마트크루즈", "차선유지", "열선핸들", "전동트렁크"], contact: "박개인 010-2222-3333" },
  { name: "제네시스 G80", price: 4480, year: 2020, mileage: 41000, status: "sold", photo: placeholder("#44505f", "#1d242e", "G80"),
    spec: { 배기량: "2,497cc", 변속기: "자동", 연비: "9.8km/l", 색상: "그레이", 차종: "대형" },
    history: ["사고 이력 없음", "2024.06 정기점검 완료"],
    options: ["HUD", "서라운드뷰", "나파가죽시트", "전동커튼"], contact: "이딜러 010-3333-4444" },
  { name: "현대 아반떼 CN7", price: 1690, year: 2022, mileage: 18000, status: "selling", photo: placeholder("#3f8f6d", "#1f4d3a", "아반떼"),
    spec: { 배기량: "1,598cc", 변속기: "자동", 연비: "14.5km/l", 색상: "실버", 차종: "준중형" },
    history: ["사고 이력 없음", "무교체 신차급"],
    options: ["후측방경고", "블루링크", "무선충전"], contact: "최개인 010-4444-5555" },
  { name: "기아 쏘렌토 4세대", price: 3150, year: 2021, mileage: 67000, status: "selling", photo: placeholder("#9a7a3b", "#5a431b", "쏘렌토"),
    spec: { 배기량: "2,151cc", 변속기: "자동", 연비: "13.0km/l", 색상: "브라운", 차종: "SUV" },
    history: ["사고 이력 없음", "2024.10 미션오일 교환", "2025.03 에어컨 필터 교환"],
    options: ["파노라마 선루프", "전방카메라", "3열시트"], contact: "정딜러 010-5555-6666" },
  { name: "쌍용 티볼리 에어", price: 1250, year: 2018, mileage: 98000, status: "sold", photo: placeholder("#6b5b9a", "#3a2f5a", "티볼리"),
    spec: { 배기량: "1,597cc", 변속기: "자동", 연비: "11.5km/l", 색상: "화이트", 차종: "SUV" },
    history: ["접촉 사고 2회(도어·펜더 판금)", "2023.11 배터리 교체"],
    options: ["후방센서", "블루투스"], contact: "한개인 010-6666-7777" },
  { name: "현대 쏘나타 DN8", price: 2180, year: 2020, mileage: 49000, status: "selling", photo: placeholder("#3b7a9a", "#1b445a", "쏘나타"),
    spec: { 배기량: "1,999cc", 변속기: "자동", 연비: "12.5km/l", 색상: "블루", 차종: "중형" },
    history: ["사고 이력 없음", "2024.05 엔진오일 교환"],
    options: ["디지털키", "빌트인캠", "열선시트"], contact: "오딜러 010-7777-8888" },
  { name: "기아 모닝 어반", price: 890, year: 2019, mileage: 72000, status: "selling", photo: placeholder("#b05a8a", "#6a2f52", "모닝"),
    spec: { 배기량: "998cc", 변속기: "자동", 연비: "15.0km/l", 색상: "핑크", 차종: "경차" },
    history: ["사고 이력 없음", "2023.09 타이어 교체"],
    options: ["후방카메라", "스마트키"], contact: "윤개인 010-8888-9999" },
];

export const CARS: Car[] = SEEDS.map((c, i) => ({ ...c, id: i + 1, registeredAt: i + 1 }));

// 카드 · 상세에서 같이 쓰는 태그 글자
export function carTags(c: Car): string[] {
  const tags = [`${c.year}년식`, `${won(c.mileage)}km`];
  if (c.spec.변속기 !== NO_INFO) tags.push(c.spec.변속기);
  if (c.spec.차종 !== NO_INFO) tags.push(c.spec.차종);
  return tags;
}

export function filterCars(cars: Car[], filter: Filter): Car[] {
  return cars.filter((c) => filter === "all" || c.status === filter);
}

export function sortCars(cars: Car[], sort: Sort): Car[] {
  return [...cars].sort(SORTERS[sort]);
}

export function markSold(cars: Car[], id: number): Car[] {
  return cars.map((c) => (c.id === id ? { ...c, status: "sold" } : c));
}

const isPosInt = (s: string) => /^\d+$/.test(s.trim()) && Number(s) > 0;

export function validateCar(v: CarForm, photo: string): CarErrors {
  const err: CarErrors = {};
  const maxYear = new Date().getFullYear() + 1;
  if (v.name.trim() === "") err.name = "차명을 입력하세요";
  if (!isPosInt(v.price)) err.price = "가격을 숫자로 입력하세요";
  else if (Number(v.price) > 99999) err.price = "가격은 99,999만원 이하로 입력하세요";
  if (!isPosInt(v.year)) err.year = "연식을 숫자로 입력하세요";
  else if (Number(v.year) < 1990 || Number(v.year) > maxYear) err.year = `연식은 1990~${maxYear} 사이로 입력하세요`;
  if (!/^\d+$/.test(v.mileage.trim())) err.mileage = "주행거리를 숫자로 입력하세요";
  if (photo === "") err.photo = "사진을 선택하세요";
  return err;
}

export function addCar(cars: Car[], v: CarForm, photo: string): Car[] {
  const car: Car = {
    id: Math.max(0, ...cars.map((c) => c.id)) + 1,
    registeredAt: Math.max(0, ...cars.map((c) => c.registeredAt)) + 1,
    name: v.name.trim(),
    price: Number(v.price),
    year: Number(v.year),
    mileage: Number(v.mileage),
    status: "selling",
    photo,
    spec: { 배기량: NO_INFO, 변속기: NO_INFO, 연비: NO_INFO, 색상: NO_INFO, 차종: NO_INFO },
    history: ["등록된 이력 없음"],
    options: [],
    contact: "연락처 미등록",
  };
  return [...cars, car];
}
