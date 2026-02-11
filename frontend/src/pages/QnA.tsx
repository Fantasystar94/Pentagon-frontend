import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { qnaApi } from '../api/qnaApi';
import '../styles/qna.css';
import { useAuth } from '../hooks/userAuth';

interface Qna {
  id: number;
  title: string;
  questionContent: string;
  askContent?: string;
  userId: number;
  createdAt: string;
  modifiedAt: string;
  status: string;
  viewCount: number;
}

const QnA: React.FC = () => {
  const { isAdmin, isLoggedIn, isInitialized, userId } = useAuth();
  const [qnaList, setQnaList] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedQna, setSelectedQna] = useState<Qna | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    if (!isInitialized) return;
    fetchQnaList();
  }, [isInitialized]);

  const fetchQnaList = async () => {
    setLoading(true);
    try {
      const res = await qnaApi.getQnaList();
      console.log('QnA GET 응답:', res);
      setQnaList(res.data.data.content || []);
    } catch (e) {
      console.error('QnA GET 에러:', e);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!newQuestion.trim() || !userId) return;
    try {
      await qnaApi.registerQna(userId, { title: '질문', questionContent: newQuestion });
      setShowModal(false);
      setNewQuestion('');
      fetchQnaList();
    } catch (e) {}
  };

  const handleAnswer = async () => {
    if (!selectedQna || !answerText.trim()) return;
    try {
      await qnaApi.answerQna(selectedQna.id, { askContent: answerText });
      setSelectedQna(null);
      setAnswerText('');
      fetchQnaList();
    } catch (e) {}
  };

  const handleDelete = async (id: number) => {
    try {
      await qnaApi.deleteQna(id);
      fetchQnaList();
    } catch (e) {}
  };

  return (
    <>
      <Header />
      <div className="qna-page">
        <div className="qna-wrapper">
        <h2>QnA 게시판</h2>
        {isLoggedIn && (
          <button onClick={() => setShowModal(true)}>질문 등록</button>
        )}
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <div className="qna-list">
            {qnaList.map(qna => (
              <div key={qna.id} className="qna-item">
                <div>
                  <strong>작성자: {qna.userId}</strong> ({qna.createdAt})
                  <p>{qna.questionContent}</p>
                  {qna.askContent ? (
                    <div className="qna-answer">
                      <strong>답변:</strong> <span>{qna.askContent}</span>
                    </div>
                  ) : (
                    isAdmin && (
                      <button onClick={() => setSelectedQna(qna)}>답변하기</button>
                    )
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(qna.id)}>삭제</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* 질문 등록 모달 */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>질문 등록</h3>
              <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} />
              <button onClick={handleRegister}>등록</button>
              <button onClick={() => setShowModal(false)}>취소</button>
            </div>
          </div>
        )}
        {/* 답변 모달 (관리자만) */}
        {selectedQna && isAdmin && (
          <div className="modal">
            <div className="modal-content">
              <h3>답변 작성</h3>
              <p>질문: {selectedQna.askContent}</p>
              <textarea value={answerText} onChange={e => setAnswerText(e.target.value)} />
              <button onClick={handleAnswer}>답변 등록</button>
              <button onClick={() => setSelectedQna(null)}>취소</button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default QnA;
