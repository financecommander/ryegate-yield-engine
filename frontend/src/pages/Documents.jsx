import React from 'react';
import { FileText, ExternalLink, Shield, Info } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { formatDate } from '../utils/format';
import ConnectWallet from '../components/ConnectWallet';
import { useWallet } from '../context/WalletContext';

export default function Documents() {
  const { isConnected } = useWallet();
  const { documents, loading, error } = useDocuments();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center card max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Compliance Documents</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view offering documents and compliance materials.
          </p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-8 h-8 text-emerald-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">Compliance Documents</h2>
            <p className="text-gray-400">ERC-1643 document management</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start space-x-3 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg mb-6">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">Document Integrity</p>
            <p className="text-gray-400">
              All documents are stored on-chain with cryptographic hashes for verification.
              Document contents are hosted on IPFS for immutability and decentralized access.
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-400">Loading documents...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            Error loading documents: {error}
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No documents available</p>
          </div>
        )}

        {!loading && documents.length > 0 && (
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="p-5 bg-dark-bg border border-dark-border rounded-lg hover:border-emerald-600/50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {doc.name}
                      </h3>
                      
                      {doc.uri && (
                        <a
                          href={doc.uri.startsWith('ipfs://') 
                            ? `https://ipfs.io/ipfs/${doc.uri.replace('ipfs://', '')}` 
                            : doc.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-emerald-400 hover:text-emerald-300 mb-2"
                        >
                          <span className="truncate">{doc.uri.slice(0, 50)}...</span>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-gray-400">Document Hash</p>
                          <p className="font-mono text-xs text-gray-300 truncate" title={doc.hash}>
                            {doc.hash}
                          </p>
                        </div>
                        {doc.timestamp > 0 && (
                          <div>
                            <p className="text-gray-400">Last Updated</p>
                            <p className="text-gray-300">{formatDate(doc.timestamp)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="ml-4 px-3 py-1 text-sm bg-emerald-900/30 border border-emerald-700 text-emerald-400 rounded hover:bg-emerald-900/50 transition"
                    title="Document hash can be verified on-chain"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Types Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Expected Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-dark-bg rounded-lg">
            <p className="font-semibold text-white mb-1">Private Placement Memorandum (PPM)</p>
            <p className="text-sm text-gray-400">Offering terms and risk disclosures</p>
          </div>
          <div className="p-3 bg-dark-bg rounded-lg">
            <p className="font-semibold text-white mb-1">Power Purchase Agreement (PPA)</p>
            <p className="text-sm text-gray-400">30-year revenue contract details</p>
          </div>
          <div className="p-3 bg-dark-bg rounded-lg">
            <p className="font-semibold text-white mb-1">Transfer Restrictions</p>
            <p className="text-sm text-gray-400">SEC compliance and lockup terms</p>
          </div>
          <div className="p-3 bg-dark-bg rounded-lg">
            <p className="font-semibold text-white mb-1">Quarterly Reports</p>
            <p className="text-sm text-gray-400">Financial performance and distributions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
