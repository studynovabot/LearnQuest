import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from "@/hooks/useAuth";
import NCERTSolutionsComponent from '@/components/NCERTSolutions';

const DocumentSearch: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Document Search | Nova AI - Your AI Study Buddy</title>
          <meta name="description" content="Search through your uploaded documents and study materials with AI-powered vector search." />
        </Helmet>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Document Search</h1>
            <p className="text-gray-600">Please log in to access document search functionality.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Document Search | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Search through your uploaded documents and study materials with AI-powered vector search." />
      </Helmet>
      
      <NCERTSolutionsComponent userId={user.uid} />
    </>
  );
};

export default DocumentSearch;
