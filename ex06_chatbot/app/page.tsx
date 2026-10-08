"use client"; // useState·onClick을 쓰므로 브라우저에서 도는 컴포넌트

import { useState, type ChangeEvent, type SubmitEvent } from "react";
import CarCard, { CarTags } from "@/components/CarCard";
import ChatBox from "@/components/ChatBox";
import {
  CARS, FILTERS, SORTS, addCar, filterCars, markSold, sortCars, validateCar, won,
  type CarErrors, type Filter, type Sort,
} from "@/lib/cars";

type View = "list" | "detail" | "form";

const FIELDS = [
  { key: "name", label: "차명", placeholder: "예: 현대 그랜저 IG", numeric: false },
  { key: "price", label: "가격 (만원)", placeholder: "예: 2350", numeric: true },
  { key: "year", label: "연식 (년)", placeholder: "예: 2020", numeric: true },
  { key: "mileage", label: "주행거리 (km)", placeholder: "예: 45000", numeric: true },
] as const;

export default function Page() {
  const [cars, setCars] = useState(CARS);
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("latest");
  const [selectedId, setSelectedId] = useState(0);
  const [formKey, setFormKey] = useState(0); // 폼을 열 때마다 입력칸을 비우기 위한 키
  const [photo, setPhoto] = useState("");
  const [errors, setErrors] = useState<CarErrors>({});

  function go(next: View) {
    setView(next);
    window.scrollTo(0, 0);
  }

  function openDetail(id: number) {
    setSelectedId(id);
    go("detail");
  }

  function openForm() {
    setFormKey(formKey + 1);
    setPhoto("");
    setErrors({});
    go("form");
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const msg = !file ? "" : !file.type.startsWith("image/") ? "이미지 파일을 선택하세요" : file.size > 5 * 1024 * 1024 ? "5MB 이하 사진을 선택하세요" : "";
    setPhoto("");
    setErrors((prev) => ({ ...prev, photo: msg }));
    if (!file || msg) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // 폼을 보내도 페이지가 새로고침되지 않게 막음
    const form = new FormData(e.currentTarget);
    const v = {
      name: String(form.get("name") ?? ""),
      price: String(form.get("price") ?? ""),
      year: String(form.get("year") ?? ""),
      mileage: String(form.get("mileage") ?? ""),
    };
    const err = validateCar(v, photo);
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setCars(addCar(cars, v, photo));
    setFilter("all"); // 새 매물이 맨 위에 보이도록 처음 상태로
    setSort("latest");
    go("list");
  }

  const visible = sortCars(filterCars(cars, filter), sort);
  const car = cars.find((c) => c.id === selectedId);
  const sold = car?.status === "sold";

  return (
    <>
      <header>
        <div className="wrap bar">
          <div className="logo" onClick={() => go("list")}><i></i>마이카마켓</div>
          <nav>
            <span className="on" onClick={() => go("list")}>중고차 구매</span>
            <span onClick={openForm}>내 차 팔기</span>
          </nav>
          <button className="primary" onClick={openForm}>+ 매물 등록</button>
        </div>
      </header>

      {view === "list" && (
        <div className="hero">
          <div className="wrap">
            <h1>내게 맞는 중고차를 한눈에</h1>
            <p>정렬 기준을 바꿔 보고, 마음에 드는 차를 눌러 상세 정보를 확인하세요.</p>
          </div>
        </div>
      )}

      <main className="wrap">
        {view === "list" && (
          <section>
            <div className="controls">
              <div className="group" aria-label="판매 상태">
                {FILTERS.map((f) => (
                  <button key={f.key} className={f.key === filter ? "active" : ""} aria-pressed={f.key === filter} onClick={() => setFilter(f.key)}>
                    {f.label}<span className="tabcnt">{filterCars(cars, f.key).length}</span>
                  </button>
                ))}
              </div>
              <div className="group" aria-label="정렬">
                <span className="lbl">정렬</span>
                {SORTS.map((s) => (
                  <button key={s.key} className={s.key === sort ? "active" : ""} aria-pressed={s.key === sort} onClick={() => setSort(s.key)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="count"><span>{visible.length}</span>대의 중고차</div>
            <div className="grid">
              {visible.length === 0 && (
                <div className="empty">{filter === "sold" ? "판매완료된 매물이 없음" : "조건에 맞는 매물이 없음"}</div>
              )}
              {visible.map((c) => (
                <CarCard key={c.id} car={c} onOpen={openDetail} />
              ))}
            </div>
          </section>
        )}

        {view === "detail" && car && (
          <section>
            <div className="back"><button onClick={() => go("list")}>← 목록으로</button></div>
            <div className="detail">
              <div>
                <div className="panel">
                  <div className="hero-img">
                    <img src={car.photo} alt={car.name} />
                    <span className={sold ? "badge sold" : "badge"}>{sold ? "판매완료" : "판매중"}</span>
                    {sold && <div className="soldmask">판매완료</div>}
                  </div>
                </div>
                <div className="panel">
                  <h3>기본 스펙</h3>
                  <table>
                    <tbody>
                      {Object.entries(car.spec).map(([k, v]) => (
                        <tr key={k}><th>{k}</th><td>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="panel">
                  <h3>사고 / 정비 이력</h3>
                  <ul className="plain">
                    {car.history.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </div>
                <div className="panel">
                  <h3>옵션</h3>
                  <div className="chips">
                    {car.options.length === 0 && <span className="hint">등록된 옵션 없음</span>}
                    {car.options.map((o) => <span key={o} className="chip">{o}</span>)}
                  </div>
                </div>
              </div>
              <aside className="side panel">
                <h2>{car.name}</h2>
                <CarTags car={car} />
                <div className="price">{won(car.price)}<small> 만원</small></div>
                <div className="contact"><b>판매자 연락처</b>{car.contact}</div>
                {sold ? (
                  <button disabled>판매가 완료된 매물임</button>
                ) : (
                  <button className="primary" onClick={() => setCars(markSold(cars, car.id))}>판매완료로 변경</button>
                )}
              </aside>
            </div>
          </section>
        )}

        {view === "form" && (
          <section>
            <div className="back"><button onClick={() => go("list")}>← 목록으로</button></div>
            <div className="panel formbox">
              <h3>매물 등록</h3>
              <form key={formKey} noValidate onSubmit={handleSubmit}>
                {FIELDS.map((f) => (
                  <div className="field" key={f.key}>
                    <label htmlFor={"f-" + f.key}>{f.label}</label>
                    <input
                      type="text" id={"f-" + f.key} name={f.key} placeholder={f.placeholder}
                      inputMode={f.numeric ? "numeric" : undefined}
                      className={errors[f.key] ? "invalid" : ""}
                    />
                    <p className="err">{errors[f.key]}</p>
                  </div>
                ))}
                <div className="field">
                  <label htmlFor="f-photo">사진</label>
                  <input type="file" id="f-photo" accept="image/*" className={errors.photo ? "invalid" : ""} onChange={handlePhoto} />
                  <p className="err">{errors.photo}</p>
                  {photo && <img className="preview" src={photo} alt="선택한 사진 미리보기" />}
                </div>
                <button type="submit" className="primary">등록</button>
                <p className="hint">데이터는 메모리에만 저장되어 새로고침하면 처음 상태로 돌아감.</p>
              </form>
            </div>
          </section>
        )}
      </main>

      <ChatBox />
    </>
  );
}
