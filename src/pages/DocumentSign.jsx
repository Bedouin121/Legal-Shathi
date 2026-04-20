import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Scale, FileText, PenTool, CheckCircle, AlertCircle } from "lucide-react";

const DocumentSign = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const title = searchParams.get("title");
  const id = searchParams.get("id");
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!title || !id) {
      navigate("/");
    }
  }, [title, id, navigate]);

  const handleSign = async () => {
    setLoading(true);
    
    // Simulate signature process
    setTimeout(() => {
      setSigned(true);
      setLoading(false);
    }, 2000);
  };

  if (!title || !id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Document Signing Portal
          </h1>
          <p className="text-muted-foreground">
            Legal Shathi - Secure Document Signing
          </p>
        </div>

        {/* Document Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">Document ID: {id}</p>
            </div>
          </div>

          {/* Document Preview Area */}
          <div className="bg-secondary/50 rounded-lg p-8 mb-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Document preview would appear here
              </p>
              <p className="text-sm text-muted-foreground">
                The actual document content would be displayed for review
              </p>
            </div>
          </div>

          {/* Signing Status */}
          {!signed ? (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  Please review the document carefully before signing
                </span>
              </div>

              <button
                onClick={handleSign}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Processing Signature...
                  </>
                ) : (
                  <>
                    <PenTool className="h-5 w-5" />
                    Sign Document
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Document Successfully Signed</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                The document has been digitally signed and recorded. A confirmation has been sent to your email.
              </p>
              
              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full rounded-xl bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Legal Notice */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing this document, you confirm that you have read, understood, and agree to the terms contained within.
          </p>
          <p className="mt-1">
            This electronic signature is legally binding and equivalent to a handwritten signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentSign;
