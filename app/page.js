"use client";

import { useMemo, useState } from "react";

const suppliers = [
  { name: "한빛테크", price: 92, delivery: 86, quality: 91, risk: 88 },
  { name: "세림솔루션", price: 87, delivery: 94, quality: 89, risk: 82 },
  { name: "동우산업", price: 96, delivery: 78, quality: 85, risk: 79 },
];

const initialWeights = { price: 35, delivery: 25, quality: 25, risk: 15 };

export default function Home() {
  const [weights, setWeights] = useState(initialWeights);
  const [fileName, setFileName] = useState("");

  const ranked = useMemo(() => {
    return suppliers
      .map((s) => ({
        ...s,
        score:
          (s.price * weights.price +
            s.delivery * weights.delivery +
            s.quality * weights.quality +
            s.risk * weights.risk) /
          100,
      }))
      .sort((a, b) => b.score - a.score);
  }, [weights]);

  function updateWeight(key, value) {
    setWeights((prev) => ({ ...prev, [key]: Number(value) }));
  }

  function resetWeights() {
    setWeights(initialWeights);
  }

  return (
    <main>
      <aside className="sidebar">
        <div>
          <div className="brand">ProcureAI</div>
          <div className="brand-sub">AI Procurement Decision OS</div>
        </div>
        <nav>
          {[
            "Dashboard",
            "프로젝트",
            "견적 업로드",
            "분석",
            "공급업체 비교",
            "Risk",
            "Decision",
            "Evidence",
            "보고서",
          ].map((item, index) => (
            <div key={item} className={index === 0 ? "nav-item active" : "nav-item"}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">v0.1 · GitHub MVP</div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PROCUREMENT INTELLIGENCE</p>
            <h1>구매 의사결정 대시보드</h1>
            <p className="muted">견적을 비교하고 리스크와 근거를 함께 검토합니다.</p>
          </div>
          <span className="status">● DEMO ACTIVE</span>
        </header>

        <section className="hero-grid">
          <article className="card highlight">
            <p className="card-label">현재 추천 공급업체</p>
            <div className="winner">{ranked[0].name}</div>
            <div className="score">{ranked[0].score.toFixed(1)}점</div>
            <p>가격·납기·품질·위험 가중치를 종합한 현재 최적 대안입니다.</p>
          </article>

          <article className="card">
            <p className="card-label">견적서 업로드</p>
            <label className="upload-zone">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
              <strong>{fileName || "PDF / Excel / CSV 선택"}</strong>
              <span>{fileName ? "파일이 선택되었습니다." : "현재 버전은 업로드 UI 검증 단계입니다."}</span>
            </label>
          </article>
        </section>

        <section className="card controls-card">
          <div className="section-title-row">
            <div>
              <p className="card-label">DECISION WEIGHTS</p>
              <h2>의사결정 가중치</h2>
            </div>
            <button onClick={resetWeights}>기본값 복원</button>
          </div>
          <div className="weights-grid">
            {Object.entries(weights).map(([key, value]) => (
              <label key={key} className="weight-control">
                <span>{labelMap[key]} <b>{value}%</b></span>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={value}
                  onChange={(e) => updateWeight(key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className={Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? "weight-total ok" : "weight-total warn"}>
            총 가중치: {Object.values(weights).reduce((a, b) => a + b, 0)}%
          </div>
        </section>

        <section className="card">
          <div className="section-title-row">
            <div>
              <p className="card-label">SUPPLIER RANKING</p>
              <h2>공급업체 비교 결과</h2>
            </div>
            <span className="muted">가중치 변경 시 즉시 재계산</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>순위</th><th>공급업체</th><th>가격</th><th>납기</th><th>품질</th><th>Risk</th><th>종합점수</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((s, index) => (
                  <tr key={s.name}>
                    <td><span className="rank">{index + 1}</span></td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.price}</td><td>{s.delivery}</td><td>{s.quality}</td><td>{s.risk}</td>
                    <td><strong>{s.score.toFixed(1)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bottom-grid">
          <article className="card">
            <p className="card-label">RISK SIGNAL</p>
            <h2>주의 요인</h2>
            <ul>
              <li>동우산업: 납기 점수가 상대적으로 낮습니다.</li>
              <li>세림솔루션: Risk 점수를 추가 검증할 필요가 있습니다.</li>
              <li>가격 최저만으로 선정하지 않고 복수 기준을 함께 평가합니다.</li>
            </ul>
          </article>
          <article className="card">
            <p className="card-label">NEXT STEP</p>
            <h2>v0.2 개발 목표</h2>
            <ol>
              <li>실제 견적 PDF/Excel 읽기</li>
              <li>품목·단가·수량·납기 자동 추출</li>
              <li>공급업체 비교와 이상값 탐지</li>
              <li>추천 근거 및 보고서 생성</li>
            </ol>
          </article>
        </section>
      </section>
    </main>
  );
}

const labelMap = {
  price: "가격",
  delivery: "납기",
  quality: "품질",
  risk: "위험",
};
