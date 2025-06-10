import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";

const Terms: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | LearnQuest</title>
        <meta name="description" content="Terms of Service for LearnQuest" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 md:px-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Terms of Service</h1>
          </div>
        </header>
        <main className="container max-w-3xl py-8 px-4 md:py-12 md:px-6">
          <div className="prose dark:prose-invert max-w-none">
            <h1>Terms of Service</h1>
            <p>Last Updated: June 10, 2024</p>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to LearnQuest. These Terms of Service govern your use of our website, products, and services.
              By accessing or using LearnQuest, you agree to be bound by these Terms.
            </p>
            
            <h2>2. Definitions</h2>
            <p>
              <strong>"Service"</strong> refers to the LearnQuest application, website, and any other related services.
              <br />
              <strong>"User"</strong> refers to individuals who access or use the Service.
              <br />
              <strong>"Content"</strong> refers to text, images, videos, audio, and other materials that may appear on the Service.
            </p>
            
            <h2>3. Account Registration</h2>
            <p>
              To access certain features of the Service, you may need to register for an account. You agree to provide accurate information during the registration process and to keep your account credentials secure.
            </p>
            
            <h2>4. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with the operation of the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service to distribute malware or harmful code</li>
            </ul>
            
            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by LearnQuest and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            
            <h2>6. User Content</h2>
            <p>
              By submitting content to the Service, you grant LearnQuest a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your content in connection with the Service.
            </p>
            
            <h2>7. Subscription and Payments</h2>
            <p>
              Some features of the Service may require a subscription. Payment terms will be specified during the subscription process. All payments are non-refundable unless otherwise stated.
            </p>
            
            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
            
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, LearnQuest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>
            
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the Service and updating the "Last Updated" date.
            </p>
            
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@learnquest.com.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Terms;