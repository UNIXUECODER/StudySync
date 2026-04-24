"use client";

import { useState } from "react";
import styles from "./Planner.module.css";

interface Syllabus {
  subject: string;
  subtopics: string[];
}

interface Milestone {
  timeframe: string;
  goals: string[];
}

interface StudyPlan {
  examTitle: string;
  overview: string;
  syllabus: Syllabus[];
  schedule: Milestone[];
  tips: string[];
}

type Tab = "generate" | "overview" | "syllabus" | "timeline" | "strategies";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [examName, setExamName] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("3 months");
  const [proficiency, setProficiency] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examName, timeAvailable, proficiency }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setPlan(data);
      setActiveTab("overview");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Curating your personalized study path...</p>
        </div>
      );
    }

    if (activeTab === "generate") {
      return (
        <div className={styles.card}>
          <header className={styles.header}>
            <h1>Create New Plan</h1>
            <p>Tell us about your goal and we'll build the roadmap.</p>
          </header>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="exam">Which exam are you preparing for?</label>
              <input
                id="exam"
                type="text"
                placeholder="e.g. SAT, GRE, UPSC, AWS Certified..."
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                required
              />
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="time">Preparation Time</label>
                <select
                  id="time"
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                >
                  <option value="2 weeks">2 Weeks (Crash Course)</option>
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="level">Current Proficiency</label>
                <select
                  id="level"
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value)}
                >
                  <option value="Beginner">Beginner (New to this)</option>
                  <option value="Intermediate">Intermediate (Basic knowledge)</option>
                  <option value="Advanced">Advanced (Reviewing topics)</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Generate Study Plan
            </button>
            {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
          </form>
        </div>
      );
    }

    if (!plan) {
      return (
        <div className={styles.emptyState}>
          <h2>No Plan Found</h2>
          <p>Please go to the "Generate Plan" tab to create your study schedule.</p>
          <button onClick={() => setActiveTab("generate")} className={styles.submitBtn} style={{maxWidth: '200px', margin: '1rem auto'}}>
            Start Now
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.resultContainer}>
            <div className={styles.planHeader}>
              <h2>{plan.examTitle}</h2>
              <p>{plan.overview}</p>
            </div>
            <div className={styles.card}>
              <h3>Next Steps</h3>
              <p>Navigate through the sidebar to see your detailed syllabus, weekly timeline, and specific strategies for success.</p>
            </div>
          </div>
        );
      case "syllabus":
        return (
          <div className={styles.section}>
            <h3>Syllabus Breakdown</h3>
            <div className={styles.grid}>
              {plan.syllabus.map((item, idx) => (
                <div key={idx} className={styles.syllabusCard}>
                  <h4>{item.subject}</h4>
                  <ul className={styles.subtopics}>
                    {item.subtopics.map((sub, sIdx) => (
                      <li key={sIdx}>{sub}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case "timeline":
        return (
          <div className={styles.section}>
            <h3>Study Timeline</h3>
            <div className={styles.timelineContainer}>
              {plan.schedule.map((milestone, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timeMarker}>{milestone.timeframe}</div>
                  <div className={styles.goalsList}>
                    <ul className={styles.subtopics}>
                      {milestone.goals.map((goal, gIdx) => (
                        <li key={gIdx}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "strategies":
        return (
          <div className={styles.section}>
            <h3>Success Strategies & Tips</h3>
            <div className={styles.tipsList}>
              {plan.tips.map((tip, idx) => (
                <div key={idx} className={styles.tipItem}>
                  <strong>Strategist Tip:</strong> {tip}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>StudySync</h2>
        </div>
        
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === "generate" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("generate")}
          >
            <span>📝</span> Generate Plan
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === "overview" ? styles.navItemActive : ""} ${!plan ? styles.navItemDisabled : ""}`}
            onClick={() => plan && setActiveTab("overview")}
            disabled={!plan}
          >
            <span>🏠</span> Overview
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === "syllabus" ? styles.navItemActive : ""} ${!plan ? styles.navItemDisabled : ""}`}
            onClick={() => plan && setActiveTab("syllabus")}
            disabled={!plan}
          >
            <span>📚</span> Syllabus
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === "timeline" ? styles.navItemActive : ""} ${!plan ? styles.navItemDisabled : ""}`}
            onClick={() => plan && setActiveTab("timeline")}
            disabled={!plan}
          >
            <span>📅</span> Timeline
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === "strategies" ? styles.navItemActive : ""} ${!plan ? styles.navItemDisabled : ""}`}
            onClick={() => plan && setActiveTab("strategies")}
            disabled={!plan}
          >
            <span>💡</span> Strategies
          </button>
        </nav>

        <div style={{fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center'}}>
          Powered by Gemini 2.5
        </div>
      </aside>

      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}
