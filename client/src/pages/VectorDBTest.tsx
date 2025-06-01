import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from "@/hooks/useAuth";
import VectorDBTestComponent from '@/components/VectorDBTest';

const VectorDBTest: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Vector DB Test | Nova AI - Your AI Study Buddy</title>
          <meta name="description" content="Test the vector database functionality with Pinecone integration." />
        </Helmet>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Vector Database Test</h1>
            <p className="text-gray-600">Please log in to test the vector database functionality.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vector DB Test | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Test the vector database functionality with Pinecone integration." />
      </Helmet>
      
      <VectorDBTestComponent userId={user.uid} />
    </>
  );
};

export default VectorDBTest;
