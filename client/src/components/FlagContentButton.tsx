import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';

interface FlagContentButtonProps {
  contentType: 'question' | 'exam';
  contentId: string;
  buttonText?: string;
  className?: string;
  iconOnly?: boolean;
}

const FlagContentButton: React.FC<FlagContentButtonProps> = ({
  contentType,
  contentId,
  buttonText = 'Report Issue',
  className = '',
  iconOnly = false,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [satActChangeReference, setSatActChangeReference] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please provide a reason for flagging this content');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/content-review/flag`,
        {
          contentType,
          contentId,
          reason,
          satActChangeReference: satActChangeReference || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess(true);
      setReason('');
      setSatActChangeReference('');
      
      // Reset success state and close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error flagging content:', err);
      setError(err.response?.data?.message || 'Failed to flag content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${iconOnly ? 'p-1' : 'px-3 py-1'} text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-md focus:outline-none transition-colors ${className}`}
        title="Report an issue with this content"
      >
        {iconOnly ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
        ) : (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            {buttonText}
          </span>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Report Content Issue</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {success ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Thank you for your feedback! Our team will review this content.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="reason">
                      What's the issue with this content? *
                    </label>
                    <textarea
                      id="reason"
                      className="w-full p-2 border rounded h-24"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please describe the problem in detail..."
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="satActRef">
                      SAT/ACT Change Reference (optional)
                    </label>
                    <input
                      id="satActRef"
                      type="text"
                      className="w-full p-2 border rounded"
                      value={satActChangeReference}
                      onChange={(e) => setSatActChangeReference(e.target.value)}
                      placeholder="If applicable, provide reference to official changes"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include if this content doesn't align with current SAT/ACT standards.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagContentButton; 