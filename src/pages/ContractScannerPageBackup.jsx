import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/services/api";

const ContractScannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contractText, setContractText] = useState("");
  const [contractType, setContractType] = useState("General");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch scan history on component mount
  useEffect(() => {
    if (user) {
      fetchScanHistory();
    }
  }, [user]);

  const fetchScanHistory = async () => {
    try {
      const data = await apiFetch("/scanner/history");
      if (data.success) {
        setScanHistory(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch scan history:", error);
    }
  };

  const handleScan = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (contractText.trim().length < 100) {
      toast({
        title: "Error",
        description: "Contract text must be at least 100 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const data = await apiFetch("/scanner/scan", {
        method: "POST",
        body: JSON.stringify({
          contractText,
          contractType,
        }),
      });

      if (data.success) {
        setScanResult(data.result);
        setShowResults(true);
        toast({
          title: "Success",
          description: "Contract analysis completed!"
        });
        fetchScanHistory(); // Refresh history
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to analyze contract",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze contract",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContractText("");
    setContractType("General");
    setScanResult(null);
    setShowResults(false);
  };

  const handleSaveReport = () => {
    toast({
      title: "Success",
      description: "Report saved successfully!"
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "border-l-4 border-red-500";
      case "Warning":
        return "border-l-4 border-orange-500";
      case "Info":
        return "border-l-4 border-blue-500";
      default:
        return "border-l-4 border-gray-500";
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Recommended":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)" }}>
      <Navbar />
      
      <div style={{ padding: "80px clamp(16px,5vw,80px) 40px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem,4vw,3rem)",
            fontWeight: 900,
            color: "var(--ls-text)",
            marginBottom: 16 
          }}>
            🔍 Contract Red Flag Scanner
          </h1>
          <p style={{ 
            fontSize: "1.1rem",
            color: "var(--ls-text2)",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6 
          }}>
            Paste your contract text and AI will identify risks based on Bangladesh law instantly
          </p>
        </div>

        {/* Input Section */}
        <div style={{ 
          background: "var(--ls-card)",
          border: "1px solid var(--ls-border)",
          borderRadius: "var(--r)",
          padding: 32,
          marginBottom: 32,
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--ls-text)",
              marginBottom: 8 
            }}>
              Contract Type
            </label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full p-4 border border-[var(--ls-border)] rounded-[var(--r)] bg-[var(--bg)] text-[var(--ls-text)] text-base"
            >
              <option value="General">General</option>
              <option value="Employment">Employment</option>
              <option value="Rental">Rental</option>
              <option value="Business">Business</option>
              <option value="Loan">Loan</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[var(--ls-text)] mb-2">
              Contract Text
            </label>
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste your contract text here... (minimum 100 characters)"
              className="w-full min-h-[300px] p-4 border border-[var(--ls-border)] rounded-[var(--r)] bg-[var(--bg)] text-[var(--ls-text)] text-base font-inherit resize-y"
            />
            <div className="text-xs text-[var(--ls-text3)] mt-2 text-right">
              {contractText.length} characters
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={loading || contractText.trim().length < 100}
            className="px-7 py-3.5 rounded-[var(--r)] border-none bg-[linear-gradient(135deg,#22c55e,#15803d)] text-white font-bold text-base cursor-pointer flex items-center gap-2 mx-auto disabled:bg-[var(--ls-text3)] disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing contract...
              </>
            ) : (
              "🔍 Scan Contract"
            )}
          </button>
        </div>

        {/* Results Section */}
        {showResults && scanResult && (
          <div className="mb-12">
            {/* Overall Risk Banner */}
            <div className={`
              p-6 rounded-[var(--r)] mb-8 text-center
              ${scanResult.overallRisk === "High" ? "bg-red-500 text-white" : ""}
              ${scanResult.overallRisk === "Medium" ? "bg-orange-500 text-white" : ""}
              ${scanResult.overallRisk === "Low" ? "bg-green-500 text-white" : ""}
            `}>
              <div className="text-2xl font-bold mb-2">
                {scanResult.overallRisk === "High" && "🚨 High Risk Contract"}
                {scanResult.overallRisk === "Medium" && "⚠️ Medium Risk Contract"}
                {scanResult.overallRisk === "Low" && "✅ Low Risk Contract"}
              </div>
              <div style={{ fontSize: "1rem", opacity: 0.9 }}>
                {scanResult.summary}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-[var(--r)] p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {scanResult.redFlags?.length || 0}
                </div>
                <div className="text-sm text-[var(--ls-text2)]">Red Flags</div>
              </div>
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-[var(--r)] p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {scanResult.missingClauses?.length || 0}
                </div>
                <div className="text-sm text-[var(--ls-text2)]">Missing Clauses</div>
              </div>
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-[var(--r)] p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {scanResult.riskyTerms?.length || 0}
                </div>
                <div className="text-sm text-[var(--ls-text2)]">Risky Terms</div>
              </div>
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-[var(--r)] p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scanResult.positives?.length || 0}
                </div>
                <div className="text-sm text-[var(--ls-text2)]">Positives</div>
              </div>
            </div>

            {/* Red Flags Section */}
            {scanResult.redFlags && scanResult.redFlags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--ls-text)] mb-4">
                  🚨 Red Flags
                </h3>
                {scanResult.redFlags.map((flag, index) => (
                  <div key={index} style={{
                    background: "var(--ls-card)",
                    border: "1px solid var(--ls-border)",
                    borderRadius: "var(--r)",
                    padding: 20,
                    marginBottom: 16,
                    ...getSeverityColor(flag.severity)
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start", 
                      marginBottom: 8 
                    }}>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        color: "var(--ls-text3)", 
                        textTransform: "uppercase",
                        fontWeight: 600 
                      }}>
                        {flag.category}
                      </span>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        padding: "4px 8px", 
                        borderRadius: 4,
                        background: flag.severity === "Critical" ? "#dc2626" : 
                                     flag.severity === "Warning" ? "#ea580c" : "#0891b2",
                        color: "#fff",
                        fontWeight: 600 
                      }}>
                        {flag.severity}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: "1rem", 
                      fontWeight: 600, 
                      color: "var(--ls-text)", 
                      marginBottom: 8 
                    }}>
                      {flag.issue}
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text2)",
                      fontStyle: "italic" 
                    }}>
                      Suggestion: {flag.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missing Clauses Section */}
            {scanResult.missingClauses && scanResult.missingClauses.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: 700, 
                  color: "var(--ls-text)", 
                  marginBottom: 16 
                }}>
                  📋 Missing Clauses
                </h3>
                {scanResult.missingClauses.map((clause, index) => (
                  <div key={index} style={{
                    background: "var(--ls-card)",
                    border: "1px solid var(--ls-border)",
                    borderRadius: "var(--r)",
                    padding: 20,
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start", 
                      marginBottom: 8 
                    }}>
                      <div style={{ 
                        fontSize: "1.1rem", 
                        fontWeight: 600, 
                        color: "var(--ls-text)" 
                      }}>
                        {clause.clause}
                      </div>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        padding: "4px 8px", 
                        borderRadius: 4,
                        ...getImportanceColor(clause.importance),
                        fontWeight: 600 
                      }}>
                        {clause.importance}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text2)" 
                    }}>
                      {clause.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Risky Terms Section */}
            {scanResult.riskyTerms && scanResult.riskyTerms.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: 700, 
                  color: "var(--ls-text)", 
                  marginBottom: 16 
                }}>
                  ⚡ Risky Terms
                </h3>
                {scanResult.riskyTerms.map((term, index) => (
                  <div key={index} style={{
                    background: "var(--ls-card)",
                    border: "1px solid var(--ls-border)",
                    borderRadius: "var(--r)",
                    padding: 20,
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: 600, 
                      color: "#dc2626", 
                      marginBottom: 8 
                    }}>
                      "{term.term}"
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text)", 
                      marginBottom: 8 
                    }}>
                      {term.reason}
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "#16a34a",
                      fontWeight: 600 
                    }}>
                      Safer alternative: {term.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Positives Section */}
            {scanResult.positives && scanResult.positives.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: 700, 
                  color: "var(--ls-text)", 
                  marginBottom: 16 
                }}>
                  ✅ What This Contract Does Well
                </h3>
                {scanResult.positives.map((positive, index) => (
                  <div key={index} style={{
                    background: "var(--ls-card)",
                    border: "1px solid var(--ls-border)",
                    borderRadius: "var(--r)",
                    padding: 16,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}>
                    <div style={{ 
                      fontSize: "1.2rem", 
                      color: "#16a34a",
                      fontWeight: 700 
                    }}>
                      ✓
                    </div>
                    <div style={{ 
                      fontSize: "1rem", 
                      color: "var(--ls-text)" 
                    }}>
                      {positive}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              gap: 16, 
              justifyContent: "center", 
              flexWrap: "wrap" 
            }}>
              <button
                onClick={handleReset}
                style={{
                  padding: "14px 28px",
                  borderRadius: "var(--r)",
                  border: "2px solid var(--green)",
                  background: "transparent",
                  color: "var(--green)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                🔄 Scan Another Contract
              </button>
              <button
                onClick={handleSaveReport}
                style={{
                  padding: "14px 28px",
                  borderRadius: "var(--r)",
                  border: "none",
                  background: "linear-gradient(135deg,#22c55e,#15803d)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                💾 Save Report
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans Section */}
        <div style={{ 
          background: "var(--ls-card)",
          border: "1px solid var(--ls-border)",
          borderRadius: "var(--r)",
          padding: 32,
          boxShadow: "var(--shadow-sm)"
        }}>
          <h3 style={{ 
            fontSize: "1.3rem", 
            fontWeight: 700, 
            color: "var(--ls-text)", 
            marginBottom: 24 
          }}>
            📁 Recent Scans
          </h3>
          {scanHistory.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse" 
              }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--ls-border)" }}>
                    <th style={{ 
                      padding: "12px", 
                      textAlign: "left", 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text2)",
                      fontWeight: 600 
                    }}>
                      Date
                    </th>
                    <th style={{ 
                      padding: "12px", 
                      textAlign: "left", 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text2)",
                      fontWeight: 600 
                    }}>
                      Contract Type
                    </th>
                    <th style={{ 
                      padding: "12px", 
                      textAlign: "left", 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text2)",
                      fontWeight: 600 
                    }}>
                      Risk Level
                    </th>
                    <th style={{ 
                      padding: "12px", 
                      textAlign: "left", 
                      fontSize: "0.9rem", 
                      color: "var(--ls-text2)",
                      fontWeight: 600 
                    }}>
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.map((scan, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid var(--ls-border)" }}>
                      <td style={{ padding: "12px", fontSize: "0.9rem", color: "var(--ls-text)" }}>
                        {formatDate(scan.createdAt)}
                      </td>
                      <td style={{ padding: "12px", fontSize: "0.9rem", color: "var(--ls-text)" }}>
                        {scan.contractType}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ 
                          fontSize: "0.8rem", 
                          padding: "4px 8px", 
                          borderRadius: 4,
                          ...getRiskBadgeColor(scan.overallRisk),
                          fontWeight: 600 
                        }}>
                          {scan.overallRisk}
                        </span>
                      </td>
                      <td style={{ 
                        padding: "12px", 
                        fontSize: "0.9rem", 
                        color: "var(--ls-text)",
                        maxWidth: 300 
                      }}>
                        {scan.summary.length > 60 ? scan.summary.substring(0, 60) + "..." : scan.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: 40, 
              color: "var(--ls-text3)" 
            }}>
              No scans yet
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ContractScannerPage;
