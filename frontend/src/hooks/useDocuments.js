import { useState, useEffect, useCallback } from 'react';
import { useContract } from './useContract';
import { CONTRACTS, RYEGATE_NOTES_ABI } from '../config/contracts';
import { ethers } from 'ethers';

export function useDocuments() {
  const { contract } = useContract(CONTRACTS.RYEGATE_NOTES, RYEGATE_NOTES_ABI);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError(null);

      // Get all document names
      const docNames = await contract.getAllDocuments();

      // Fetch each document
      const docPromises = docNames.map(async (docName) => {
        try {
          const [uri, hash, timestamp] = await contract.getDocument(docName);
          
          // Try to decode the document name from bytes32
          let name = docName;
          try {
            // Remove trailing zeros and decode
            const cleaned = docName.replace(/0+$/, '');
            if (cleaned.length > 2) {
              name = ethers.toUtf8String(cleaned);
            }
          } catch {
            // Keep as hex if decode fails
            name = docName.slice(0, 20) + '...';
          }

          return {
            name,
            nameBytes32: docName,
            uri,
            hash,
            timestamp: Number(timestamp),
          };
        } catch (err) {
          console.error('Error fetching document:', docName, err);
          return null;
        }
      });

      const docs = await Promise.all(docPromises);
      setDocuments(docs.filter(doc => doc !== null));
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refresh: fetchDocuments,
  };
}
