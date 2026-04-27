import { useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Loader2,
  FileWarning
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { analysisAPI } from "@/services/api";

const DocumentAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.name.endsWith(".docx")
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please upload a PDF or DOCX file.");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analysisAPI.analyzeDocument(file);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return "text-green-600 bg-green-50 border-green-200";
    if (score < 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRiskIndicatorColor = (score) => {
    if (score < 30) return "#16a34a"; // green
    if (score < 70) return "#f59e0b"; // amber
    return "#dc2626"; // red
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20 sm:px-6 max-w-5xl pb-24 md:pb-16">
        <div className="text-center mb-12 sr sr-up in">
          <span className="chip-p inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4">
            AI POWERED
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif mb-4 text-[var(--ls-text)]">
            AI Document Analysis
          </h1>
          <p className="text-[var(--ls-text2)] max-w-2xl mx-auto">
            Upload your legal contracts, agreements, or any legal document. Our AI will scan it for missing clauses, risky terms, and potential legal issues.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 mb-12">
          {/* Upload Section */}
          <div className="bg-[var(--ls-card)] rounded-2xl border border-[var(--ls-border)] p-8 shadow-sm text-center">
            <div className="max-w-md mx-auto">
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-[var(--ls-border)] border-dashed rounded-xl cursor-pointer bg-[var(--bg3)] hover:bg-[var(--bg2)] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-12 h-12 text-[var(--ls-text3)] mb-4" />
                    <p className="mb-2 text-sm text-[var(--ls-text2)]">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-[var(--ls-text3)]">PDF or DOCX (Max 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-[var(--ls-border)] rounded-xl bg-[var(--bg3)]">
                  <FileText className="w-16 h-16 text-primary mb-4" />
                  <p className="font-medium text-[var(--ls-text)] mb-1 truncate max-w-full">{file.name}</p>
                  <p className="text-xs text-[var(--ls-text3)] mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setFile(null); setResult(null); setError(null); }}
                      className="px-4 py-2 text-sm font-medium border border-[var(--ls-border)] rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Change File
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="btn-shimmer px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Document"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 flex items-center gap-2 max-w-md mx-auto text-left">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6 relative">
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">Analyzing your document...</h3>
            <p className="text-[var(--ls-text2)]">Our AI is reading through clauses and checking for risks.</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Score Card */}
            <div className={`p-8 rounded-2xl border ${getRiskColor(result.riskScore)} flex flex-col md:flex-row items-center gap-8 shadow-sm`}>
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-32 h-32">
                  <path
                    className="text-gray-200/50"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    style={{ color: getRiskIndicatorColor(result.riskScore) }}
                    strokeDasharray={`${result.riskScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold leading-none">{result.riskScore}</span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80 mt-1">/ 100</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold font-serif mb-2">
                  {result.riskLevel} Risk Detected
                </h3>
                <p className="opacity-90">
                  {result.riskScore < 30 ? "This document looks well-drafted and standard. Very few concerns found." : 
                   result.riskScore < 70 ? "There are some missing clauses or slightly risky terms you should review." : 
                   "This document has significant risks or missing important protections. We strongly advise a lawyer's review."}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Risky Terms */}
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                  <FileWarning className="w-5 h-5 text-amber-500" />
                  Risky Terms Found
                </h3>
                {result.riskyTerms && result.riskyTerms.length > 0 ? (
                  <div className="space-y-4">
                    {result.riskyTerms.map((term, idx) => (
                      <div key={idx} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="font-semibold text-amber-900 mb-2">"{term.term}"</p>
                        <p className="text-sm text-amber-800 mb-2"><span className="font-semibold">Reason:</span> {term.reason}</p>
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100"><span className="font-semibold">Suggestion:</span> {term.suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--ls-text2)] text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> No highly risky terms detected.
                  </p>
                )}
              </div>

              {/* Missing Clauses */}
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Missing Clauses
                </h3>
                {result.missingClauses && result.missingClauses.length > 0 ? (
                  <ul className="space-y-3">
                    {result.missingClauses.map((clause, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-[var(--ls-text2)] items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                        {clause}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--ls-text2)] text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Document seems to have all standard clauses.
                  </p>
                )}
              </div>
            </div>

            {/* General Suggestions */}
            {result.generalSuggestions && result.generalSuggestions.length > 0 && (
              <div className="bg-[var(--ls-card)] border border-[var(--ls-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">General Suggestions</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {result.generalSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-[var(--ls-text2)] bg-[var(--bg3)] p-3 rounded-lg border border-[var(--ls-border)]">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DocumentAnalysis;
