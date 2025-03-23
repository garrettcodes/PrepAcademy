import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getStudyGroupById, 
  leaveStudyGroup, 
  deleteStudyGroup, 
  joinStudyGroup,
  StudyGroup 
} from '../../services/studyGroupService';
import { getGroupSharedNotes, SharedNote } from '../../services/sharedNoteService';
import Button from '../ui/Button';

interface RouteParams {
  groupId: string;
  [key: string]: string;
}

const StudyGroupDetail: React.FC = () => {
  const { groupId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notesLoading, setNotesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string>('');
  const [showJoinForm, setShowJoinForm] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const groupData = await getStudyGroupById(groupId);
        setGroup(groupData);
        
        // If user is a member, fetch shared notes in this group
        const isMember = groupData.members.some(
          (member) => member._id === user?._id
        );
        
        if (isMember) {
          setNotesLoading(true);
          const groupNotes = await getGroupSharedNotes(groupId);
          setNotes(groupNotes);
          setNotesLoading(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load study group details');
        console.error('Error fetching study group details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, user?._id]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId) return;
    setActionLoading(true);
    setJoinError(null);
    
    try {
      await joinStudyGroup({ groupId, joinCode });
      // Refetch group details after successfully joining
      const updatedGroup = await getStudyGroupById(groupId);
      setGroup(updatedGroup);
      setShowJoinForm(false);
    } catch (err: any) {
      setJoinError(err.response?.data?.message || 'Failed to join group');
      console.error('Error joining group:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!groupId) return;
    setActionLoading(true);
    
    try {
      await leaveStudyGroup(groupId);
      navigate('/study-groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave group');
      console.error('Error leaving group:', err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!groupId) return;
    setActionLoading(true);
    
    try {
      await deleteStudyGroup(groupId);
      navigate('/study-groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete group');
      console.error('Error deleting group:', err);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
        <span className="block sm:inline">{error || 'Study group not found'}</span>
        <div className="mt-2">
          <button
            onClick={() => navigate('/study-groups')}
            className="text-blue-500 hover:underline"
          >
            Back to Study Groups
          </button>
        </div>
      </div>
    );
  }

  const isOwner = group.owner._id === user?._id;
  const isMember = group.members.some(member => member._id === user?._id);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
              <div className="mt-1 flex items-center">
                <span className="text-sm text-gray-500">
                  Created by {group.owner.name}
                </span>
                {group.isPrivate && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Private
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <div>
                <Link
                  to={`/study-groups/${groupId}/edit`}
                  className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                >
                  Edit Group
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-800">Description</h3>
            <p className="mt-2 text-gray-600">{group.description}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-800">Topics</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.topics.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800">Members ({group.members.length})</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {group.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center p-2 rounded hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {member.name}
                    </p>
                    {member._id === group.owner._id && (
                      <span className="text-xs text-gray-500">Owner</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {group.isPrivate && isOwner && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-md font-medium text-yellow-800">Group Join Code</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Share this code with others to invite them to your group:
              </p>
              <div className="mt-2 p-2 bg-white border border-yellow-300 rounded font-mono text-center">
                {group.joinCode}
              </div>
            </div>
          )}

          {isMember && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800">Shared Notes</h3>
              {notesLoading ? (
                <div className="mt-2 py-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : notes.length > 0 ? (
                <div className="mt-2 divide-y divide-gray-200">
                  {notes.map((note) => (
                    <div key={note._id} className="py-3">
                      <Link
                        to={`/shared-notes/${note._id}`}
                        className="block hover:bg-gray-50 p-2 rounded"
                      >
                        <h4 className="text-md font-medium text-blue-600">{note.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          By: {note.author.name} · {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            {note.subject}
                          </span>
                          <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            {note.topic}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-center py-6 bg-gray-50 rounded">
                  <p className="text-gray-500">No notes have been shared in this group yet.</p>
                  <Link
                    to={`/shared-notes/create?groupId=${groupId}`}
                    className="mt-2 inline-block text-blue-500 hover:underline"
                  >
                    Share your first note
                  </Link>
                </div>
              )}
              
              {notes.length > 0 && (
                <div className="mt-4">
                  <Link
                    to={`/shared-notes/create?groupId=${groupId}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Share New Note
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            {!isMember && !isOwner ? (
              !showJoinForm ? (
                <Button
                  onClick={() => setShowJoinForm(true)}
                  variant="primary"
                >
                  Join Group
                </Button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Join this group</h3>
                  
                  {joinError && (
                    <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                      {joinError}
                    </div>
                  )}
                  
                  <form onSubmit={handleJoinSubmit}>
                    {group.isPrivate && (
                      <div className="mb-3">
                        <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Join Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="joinCode"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Button
                        type="submit"
                        disabled={actionLoading}
                        variant="primary"
                      >
                        {actionLoading ? 'Joining...' : 'Join Group'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowJoinForm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {!isOwner ? (
                    <Button
                      onClick={() => setShowConfirmLeave(true)}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Leave Group
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowConfirmDelete(true)}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Delete Group
                    </Button>
                  )}
                </div>
                
                <Link
                  to="/study-groups"
                  className="text-blue-500 hover:underline"
                >
                  Back to All Groups
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showConfirmLeave && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Group?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to leave this group? You will need to rejoin if you want to access it again.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowConfirmLeave(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLeave}
                disabled={actionLoading}
                variant="primary"
              >
                {actionLoading ? 'Leaving...' : 'Leave Group'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Group?</h3>
            <p className="text-gray-500 mb-2">
              Are you sure you want to delete this group? This action cannot be undone.
            </p>
            <p className="text-gray-500 mb-6">
              All shared notes in this group will no longer be accessible by members.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowConfirmDelete(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={actionLoading}
                variant="primary"
              >
                {actionLoading ? 'Deleting...' : 'Delete Group'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetail; 