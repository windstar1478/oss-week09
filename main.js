// main.js — 화면 담당. P1 ~ P5, P7 에서 이어서 채웁니다.
//
// 상황: index.html 에 폼과 빈 표가 있고, 이 파일이 <script type="module"> 로 연결되어 있습니다.
//       아직 코드가 없어서 Check 를 누르면 페이지가 새로 고쳐지기만 합니다.
// 할 일: P1 Check 에 반응하기 → P2 예보 받기 → P3 표 그리기 → P4 좋은 날 표시
//       → P5 기준을 바꾸면 바로 다시 그리기 → P7 Why not 칸
// 실행: 터미널에서 npx serve . → 브라우저에서 http://localhost:3000
// 확인: 문제마다 problems/ 의 문제 파일 "확인"
// 커밋 메시지: p1: submit / p2: fetch / p3: rows / p4: rule / p5: live / p7: reasons
//
// 받아 오는 일은 api.js, 판단하는 규칙은 logic.js 에 둡니다. 이 파일에는 화면을 읽고 그리는 코드만.

// 주어짐: 도시 세 곳의 위도·경도. 키는 index.html <select> 의 option value 와 같습니다.
import { getForecast } from "./api.js";
import { toDays, isGoodDay, summarize } from "./logic.js";

const CITIES = {
  seoul: { name: "Seoul", lat: 37.566, lon: 126.9784 },
  daejeon: { name: "Daejeon", lat: 36.3504, lon: 127.3845 },
  gangneung: { name: "Gangneung", lat: 37.7519, lon: 128.8761 },
};

const form = document.querySelector("#run-form");
const citySelect = document.querySelector("#city");
const rainInput = document.querySelector("#rain-limit");
const windInput = document.querySelector("#wind-limit");
const statusEl = document.querySelector("#status");
const summaryEl = document.querySelector("#summary");
const rowsEl = document.querySelector("#rows");

const state = {
  city: null,
  days: [],
  limits: { rain: Number(rainInput.value), wind: Number(windInput.value) },
};
function dayRow(day) {
  const tr = document.createElement("tr");
  const cells = [
    day.date.slice(5),          // "11-05"
    `${day.max}°`,
    `${day.wind} km/h`,
    `${day.rain}%`,
  ];
  for (const text of cells) {
    const td = document.createElement("td");
    td.textContent = text;
    tr.append(td);
  }

  if (isGoodDay(day, state.limits)) tr.classList.add("good");
  return tr;
}

function render() {
  summaryEl.textContent = state.city
    ? `${state.city.name}: ${summarize(state.days, state.limits)}.`
    : "";
  rowsEl.replaceChildren(...state.days.map(dayRow));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = CITIES[citySelect.value];
  statusEl.classList.remove("error");
  statusEl.textContent = "Loading...";
  state.limits = { rain: Number(rainInput.value), wind: Number(windInput.value) };
  try {
    const daily = await getForecast(city);
    state.city = city;
    state.days = toDays(daily);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = `Could not load the forecast (${err.message}).`;
    statusEl.classList.add("error");
  }
  render();
});