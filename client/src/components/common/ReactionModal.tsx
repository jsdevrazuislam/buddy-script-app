'use client';

import Image from 'next/image';

import { useLikers } from '@/features/like/hooks/useLikes';
import { TargetType } from '@/types';

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: TargetType;
}

export const ReactionModal: React.FC<ReactionModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
}) => {
  const { data: likers, isLoading } = useLikers(targetId, targetType);

  if (!isOpen) return null;

  return (
    <div
      className="_modal_overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        className="_modal_content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '8px',
          width: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          position: 'relative',
          padding: '20px',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0" style={{ fontSize: '18px', fontWeight: 600 }}>
            Reactions
          </h4>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            &times;
          </button>
        </div>
        <hr />
        <div className="_likers_list">
          {isLoading ? (
            <div className="text-center p-3">Loading...</div>
          ) : likers && likers.length > 0 ? (
            likers.map(
              (user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar?: string | null;
              }) => (
                <div key={user.id} className="d-flex align-items-center mb-3">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginRight: '12px',
                    }}
                  >
                    <Image
                      src={user.avatar || '/assets/images/profile.png'}
                      alt=""
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h5
                      className="m-0"
                      style={{ fontSize: '15px', fontWeight: 500 }}
                    >{`${user.firstName} ${user.lastName}`}</h5>
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="text-center p-3">No reactions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
