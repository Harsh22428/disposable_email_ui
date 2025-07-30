import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

// Define a type for our email structure
interface FetchedEmail {
  id: string;
  subject: string;
  from: string;
  body: string;
  snippet: string;
  timestamp: string;
}

const EmailDashboard = () => {
  const [emails, setEmails] = useState<FetchedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<FetchedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { emailAddress } = useParams<{ emailAddress: string }>();
  const navigate = useNavigate();

  const fetchEmails = async () => {
    if (!emailAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      // const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const apiUrl="https://api.luxidevilott.com"

      const response = await fetch(
        `${apiUrl}/api?to=${encodeURIComponent(emailAddress)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch emails from server.");
      }
      const data: FetchedEmail[] = await response.json();
      setEmails(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [emailAddress]);

  if (!emailAddress) {
    return <div>Error: No email address provided.</div>;
  }

  // View for displaying the list of emails
  if (!selectedEmail) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Inbox for {emailAddress}</h1>
            <p className="text-muted-foreground">
              {emails.length} message(s) found.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={fetchEmails} disabled={isLoading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading && <p>Loading emails...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        <div className="space-y-2">
          {emails.map((email) => (
            <Card
              key={email.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedEmail(email)}
            >
              <CardContent className="p-4 flex justify-between">
                <div>
                  <p className="font-semibold">{email.from}</p>
                  <p className="font-bold">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {email.snippet}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(email.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // View for displaying a single selected email's content
  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        onClick={() => setSelectedEmail(null)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inbox
      </Button>
      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            From: {selectedEmail.from}
          </p>
          <CardTitle>{selectedEmail.subject}</CardTitle>
          <p className="text-sm text-muted-foreground">
            At: {new Date(selectedEmail.timestamp).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDashboard;
