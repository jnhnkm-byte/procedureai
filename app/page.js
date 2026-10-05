"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

const demoSuppliers = [
  { name: "한빛테크", price: 92, delivery: 86, quality: 91, risk: 88 },
  { name: "세림솔루션", price: 87, delivery: 94, quality: 89, risk: 82 },
  { name: "동우산업", price: 96, delivery: 78, quality: 85, risk: 79 },
];

const initialWeights = { price: 35, delivery: 25, quality: 25, risk: 15 };

export default function Home() {
  const [weights, setWeights] = useState(initialWeights);
  const [suppliers, setSuppliers] = useState(demoSuppliers);
  const [fileName, setFileName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("CSV 또는 Excel을 올리면 실제 분석 데이터로 교체됩니다.");

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
  }, [weights, suppliers]);

  const riskSignals = useMemo(() => {
    if (!ranked.length) return [];
    const signals = [];
    const lowDelivery = [...ranked].sort((a, b) => a.delivery - b.delivery)[0];
    const lowRisk = [...ranked].sort((a, b) => a.risk - b.risk)[0];
    if (lowDelivery) signals.push(`${lowDelivery.name}: 납기 점수 ${lowDelivery.delivery}점으로 가장 낮습니다.`);
    if (lowRisk) signals.push(`${lowRisk.name}: Risk 점수 ${lowRisk.risk}점으로 추가 검증이 필요합니다.`);
    signals.push("가격 최저만으로 선정하지 않고 복수 기준을 함께 평가합니다.");
    return signals;
  }, [ranked]);

  function updateWeight(key, value) {
    setWeights((prev) => ({ ...prev, [key]: Number(value) }));
  }

  function resetWeights() {
    setWeights(initialWeights);
  }

  function restoreDemo() {
    setSuppliers(demoSuppliers);
    setFileName("");
    setUploadMessage("데모 데이터로 복원했습니다.");
  }

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    const lower = file.name.toLowerCase();

    try {
      let parsed = [];
      if (lower.endsWith(".csv")) {
        parsed = parseCsv(await file.text());
      } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        parsed = await parseExcel(file);
      } else if (lower.endsWith(".pdf")) {
        setUploadMessage("PDF는 다음 단계에서 품목·수량·단가·납기 자동 추출 기능으로 연결합니다.");
        return;
      } else {
        throw new Error("CSV 또는 Excel 파일을 선택하세요.");
      }

      if (!parsed.length) throw new Error("분석 가능한 공급업체 행이 없습니다.");
      setSuppliers(parsed);
      setUploadMessage(`${parsed.length}개 공급업체를 읽어 비교 결과에 반영했습니다.`);
    } catch (error) {
      setUploadMessage(`파일 분석 실패: ${error.message}`);
    }
  }

  return (
    <main>
      <aside className="sidebar">
        <div>
          <div className="brand">ProcureAI</div>
          <div className="brand-sub">AI Procurement Decision OS</div>
        </div>
        <nav>
          {["Dashboard","프로젝트","견적 업로드","분석","공급업체 비교","Risk","Decision","Evidence","보고서"].map((item, index) => (
            <div key={item} className={index === 0 ? "nav-item active" : "nav-item"}>
              <span>{String(index + 1).padStart(2, "0")}</span>{item}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">v0.2 · CSV + Excel Analysis</div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PROCUREMENT INTELLIGENCE</p>
            <h1>구매 의사결정 대시보드</h1>
            <p className="muted">견적을 비교하고 리스크와 근거를 함께 검토합니다.</p>
          </div>
          <span className="status">● ANALYSIS ACTIVE</span>
        </header>

        <section className="hero-grid">
          <article className="card highlight">
            <p className="card-label">현재 추천 공급업체</p>
            <div className="winner">{ranked[0]?.name || "데이터 없음"}</div>
            <div className="score">{ranked[0] ? `${ranked[0].score.toFixed(1)}점` : "-"}</div>
            <p>가격·납기·품질·위험 가중치를 종합한 현재 최적 대안입니다.</p>
          </article>

          <article className="card">
            <p className="card-label">견적 데이터 업로드</p>
            <label className="upload-zone">
              <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={(e) => handleFile(e.target.files?.[0])} />
              <strong>{fileName || "CSV / Excel / PDF 선택"}</strong>
              <span>{uploadMessage}</span>
            </label>
            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
              <button onClick={restoreDemo}>데모 데이터 복원</button>
              <span className="muted" style={{fontSize:12}}>필수 열: supplier, price, delivery, quality, risk</span>
            </div>
          </article>
        </section>

        <section className="card controls-card">
          <div className="section-title-row">
            <div><p className="card-label">DECISION WEIGHTS</p><h2>의사결정 가중치</h2></div>
            <button onClick={resetWeights}>기본값 복원</button>
          </div>
          <div className="weights-grid">
            {Object.entries(weights).map(([key, value]) => (
              <label key={key} className="weight-control">
                <span>{labelMap[key]} <b>{value}%</b></span>
                <input type="range" min="0" max="60" value={value} onChange={(e) => updateWeight(key, e.target.value)} />
              </label>
            ))}
          </div>
          <div className={Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? "weight-total ok" : "weight-total warn"}>
            총 가중치: {Object.values(weights).reduce((a, b) => a + b, 0)}%
          </div>
        </section>

        <section className="card">
          <div className="section-title-row">
            <div><p className="card-label">SUPPLIER RANKING</p><h2>공급업체 비교 결과</h2></div>
            <span className="muted">가중치 변경 시 즉시 재계산</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>순위</th><th>공급업체</th><th>가격</th><th>납기</th><th>품질</th><th>Risk</th><th>종합점수</th></tr></thead>
              <tbody>
                {ranked.map((s, index) => (
                  <tr key={`${s.name}-${index}`}>
                    <td><span className="rank">{index + 1}</span></td><td><strong>{s.name}</strong></td>
                    <td>{s.price}</td><td>{s.delivery}</td><td>{s.quality}</td><td>{s.risk}</td><td><strong>{s.score.toFixed(1)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bottom-grid">
          <article className="card">
            <p className="card-label">RISK SIGNAL</p><h2>주의 요인</h2>
            <ul>{riskSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
          </article>
          <article className="card">
            <p className="card-label">NEXT STEP</p><h2>다음 개발 목표</h2>
            <ol><li>PDF 견적 품목·단가·수량·납기 추출</li><li>실제 금액 기반 가격 점수 자동 정규화</li><li>가격 이상값 및 공급업체 위험 탐지</li><li>추천 근거와 의사결정 보고서 자동 생성</li></ol>
          </article>
        </section>
      </section>
    </main>
  );
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  if (!workbook.SheetNames.length) throw new Error("Excel 시트를 찾을 수 없습니다.");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
  return parseTabularRows(rows);
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("헤더와 데이터 행이 필요합니다.");
  const rows = lines.map(splitCsvLine);
  return parseTabularRows(rows);
}

function parseTabularRows(rows) {
  if (!rows || rows.length < 2) throw new Error("헤더와 데이터 행이 필요합니다.");
  const headers = rows[0].map((h) => String(h).trim().toLowerCase());
  const aliases = {
    supplier: ["supplier", "name", "vendor", "공급업체", "업체명", "공급사"],
    price: ["price", "가격", "가격점수"],
    delivery: ["delivery", "납기", "납기점수"],
    quality: ["quality", "품질", "품질점수"],
    risk: ["risk", "위험", "리스크", "위험점수"],
  };
  const indexOf = (key) => headers.findIndex((h) => aliases[key].includes(h));
  const idx = {
    name: indexOf("supplier"),
    price: indexOf("price"),
    delivery: indexOf("delivery"),
    quality: indexOf("quality"),
    risk: indexOf("risk"),
  };
  if (Object.values(idx).some((i) => i < 0)) {
    throw new Error("supplier, price, delivery, quality, risk 열을 확인하세요.");
  }

  return rows.slice(1).map((cols) => {
    const row = {
      name: String(cols[idx.name] ?? "").trim(),
      price: Number(cols[idx.price]),
      delivery: Number(cols[idx.delivery]),
      quality: Number(cols[idx.quality]),
      risk: Number(cols[idx.risk]),
    };
    if (!row.name || [row.price, row.delivery, row.quality, row.risk].some((v) => !Number.isFinite(v))) return null;
    return row;
  }).filter(Boolean);
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; } else { quoted = !quoted; }
    } else if (ch === "," && !quoted) {
      result.push(current); current = "";
    } else current += ch;
  }
  result.push(current);
  return result;
}

const labelMap = { price: "가격", delivery: "납기", quality: "품질", risk: "위험" };
