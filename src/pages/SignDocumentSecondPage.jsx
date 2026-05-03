import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE } from "@/services/api.js";

const SignDocumentSecondPage = () => {
  const { documentId, token } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        console.log("Fetching second party document:", documentId, token);
        
        const response = await fetch(`${API_BASE}/documents/${documentId}/verify-second/${token}`);
        console.log("Response status:", response.status);
        
        const data = await response.json();
        console.log("Response data:", data);
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to load document");
        }
        
        setDocument(data);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, token]);

  const handleSign = async () => {
    if (!signerName.trim() || !agreed) return;

    setSigning(true);
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/sign-second`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          signerName: signerName.trim(),
          token: token
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to sign document");
      }

      setSigned(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  const isFormValid = signerName.trim().length > 0 && agreed && !signing;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Document Signed Successfully!</h2>
          <p className="text-muted-foreground mb-4">
            ✅ You have signed the document successfully. 
            Both parties have now signed this document. 
            A verification email with QR code has been sent 
            to all parties.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Shathi</h1>
            <p className="text-lg text-gray-600">Second Party Electronic Document Signing Portal</p>
          </div>

          {/* Document Info */}
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Document Details</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Title:</strong> {document?.documentTitle}
              </p>
              <p className="text-gray-700">
                <strong>First Party:</strong> {document?.firstPartyLabel}
              </p>
              <p className="text-gray-700">
                <strong>Your Role:</strong> {document?.secondPartyLabel}
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Document Preview:</h3>
              <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                {document?.documentContent?.substring(0, 500)}
                {document?.documentContent?.length > 500 && "..."}
              </div>
            </div>
          </Card>

          {/* Signature Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Electronically Sign This Document</h2>
            
            {/* Party Label */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Signing as:</strong> {document?.secondPartyLabel}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type Your Full Name as Signature
                </label>
                <Input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full legal name"
                  className="w-full"
                />
              </div>

              {/* Signature Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Preview
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[80px] flex items-center justify-center">
                  {signerName ? (
                    <span 
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                      className="text-3xl text-gray-800"
                    >
                      {signerName}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Your signature will appear here</span>
                  )}
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="agreement" className="text-sm text-gray-700">
                  I agree to sign this document electronically and confirm my identity. 
                  I understand that this electronic signature has the same legal effect as a handwritten signature.
                </label>
              </div>

              {/* Sign Button */}
              <Button
                onClick={handleSign}
                disabled={!isFormValid}
                className="w-full py-3 text-lg"
              >
                {signing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  "Confirm & Sign"
                )}
              </Button>
            </div>
          </Card>

          {/* Legal Notice */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By signing this document, you agree to the terms and conditions outlined within. 
              This signature will be legally binding and will be recorded with a timestamp and IP address.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignDocumentSecondPage;
